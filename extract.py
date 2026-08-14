#!/usr/bin/env python3
"""Extract common document formats and OCR PDF/image content locally."""

import argparse
import io
import json
import sys
from html.parser import HTMLParser
from pathlib import Path

import pypdfium2 as pdfium
from docx import Document
from openpyxl import load_workbook
from pptx import Presentation
from rapidocr_onnxruntime import RapidOCR


class TextHTMLParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.parts = []

    def handle_data(self, data: str) -> None:
        value = data.strip()
        if value:
            self.parts.append(value)


def pdf_text(data: bytes, args: argparse.Namespace) -> str:
    document = pdfium.PdfDocument(data)
    if len(document) > args.max_pages:
        raise ValueError(
            f"PDF has {len(document)} pages; configured limit is {args.max_pages}."
        )
    engine = None
    pages = []
    for index in range(len(document)):
        page = document[index]
        text_page = page.get_textpage()
        text = text_page.get_text_range().strip()
        if len(text) < args.native_text_min_chars:
            if engine is None:
                engine = RapidOCR()
            image = page.render(scale=args.dpi / 72).to_pil()
            encoded = io.BytesIO()
            image.save(encoded, format="PNG")
            result, _ = engine(encoded.getvalue())
            text = "\n".join(item[1] for item in (result or []))
        pages.append(f"--- Page {index + 1} ---\n{text}")
    return "\n\n".join(pages)


def image_text(data: bytes) -> str:
    result, _ = RapidOCR()(data)
    return "\n".join(item[1] for item in (result or []))


def word_text(data: bytes) -> str:
    document = Document(io.BytesIO(data))
    blocks = [paragraph.text for paragraph in document.paragraphs if paragraph.text.strip()]
    for table in document.tables:
        for row in table.rows:
            blocks.append("\t".join(cell.text for cell in row.cells))
    return "\n".join(blocks)


def excel_text(data: bytes, max_sheets: int) -> str:
    workbook = load_workbook(io.BytesIO(data), read_only=True, data_only=True)
    if len(workbook.sheetnames) > max_sheets:
        raise ValueError(
            f"Workbook has {len(workbook.sheetnames)} sheets; configured limit is {max_sheets}."
        )
    sheets = []
    for worksheet in workbook.worksheets:
        rows = []
        for row in worksheet.iter_rows(values_only=True):
            values = ["" if value is None else str(value) for value in row]
            if any(values):
                rows.append("\t".join(values).rstrip())
        sheets.append(f"--- Sheet: {worksheet.title} ---\n" + "\n".join(rows))
    return "\n\n".join(sheets)


def powerpoint_text(data: bytes, max_slides: int) -> str:
    presentation = Presentation(io.BytesIO(data))
    if len(presentation.slides) > max_slides:
        raise ValueError(
            f"Presentation has {len(presentation.slides)} slides; configured limit is {max_slides}."
        )
    slides = []
    for index, slide in enumerate(presentation.slides):
        parts = []
        for shape in slide.shapes:
            if hasattr(shape, "text") and shape.text.strip():
                parts.append(shape.text)
            if getattr(shape, "has_table", False):
                for row in shape.table.rows:
                    parts.append("\t".join(cell.text for cell in row.cells))
        slides.append(f"--- Slide {index + 1} ---\n" + "\n".join(parts))
    return "\n\n".join(slides)


def decoded_text(data: bytes) -> str:
    for encoding in ("utf-8-sig", "gb18030"):
        try:
            return data.decode(encoding)
        except UnicodeDecodeError:
            pass
    raise ValueError("Text file is neither UTF-8 nor GB18030 encoded.")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--filename", required=True)
    parser.add_argument("--max-pages", type=int, required=True)
    parser.add_argument("--dpi", type=int, required=True)
    parser.add_argument("--native-text-min-chars", type=int, required=True)
    parser.add_argument("--max-output-chars", type=int, required=True)
    args = parser.parse_args()

    data = sys.stdin.buffer.read()
    suffix = Path(args.filename).suffix.lower()
    if suffix == ".pdf":
        kind, output = "pdf", pdf_text(data, args)
    elif suffix in {".png", ".jpg", ".jpeg", ".webp", ".bmp", ".tif", ".tiff"}:
        kind, output = "image", image_text(data)
    elif suffix == ".docx":
        kind, output = "word", word_text(data)
    elif suffix in {".xlsx", ".xlsm"}:
        kind, output = "excel", excel_text(data, args.max_pages)
    elif suffix == ".pptx":
        kind, output = "powerpoint", powerpoint_text(data, args.max_pages)
    elif suffix in {".txt", ".md", ".csv", ".tsv", ".json", ".xml", ".yaml", ".yml", ".log", ".py", ".js", ".ts", ".tsx", ".css"}:
        kind, output = "text", decoded_text(data)
    elif suffix in {".html", ".htm"}:
        html = TextHTMLParser()
        html.feed(decoded_text(data))
        kind, output = "html", "\n".join(html.parts)
    else:
        raise ValueError(
            "Unsupported file type. Supported: PDF, images, DOCX, XLSX/XLSM, "
            "PPTX, and common text/CSV/JSON/HTML files."
        )

    output = output.strip()
    if len(output) > args.max_output_chars:
        raise ValueError(
            f"Extracted text exceeds the configured {args.max_output_chars}-character limit."
        )
    print(json.dumps({"kind": kind, "text": output}, ensure_ascii=True))


if __name__ == "__main__":
    main()
