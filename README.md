# DeepSeek Harness File Upload & OCR Plugin

[中文说明](./README.zh-CN.md) · English

> A file upload and local OCR plugin for DeepSeek Harness. Add PDF, Word, Excel, PowerPoint, image, and text attachments as chat cards; scanned PDFs and images are recognized locally with CPU-friendly RapidOCR.

**中文项目描述：** DeepSeek Harness 文件上传与 OCR 插件：在 Web UI 中以附件卡片上传 PDF、Word、Excel、PowerPoint、图片和文本文件；PDF 与图片在本机使用适合 CPU 的 RapidOCR 自动识别，文件全文不会铺满聊天气泡。

## Features

- Real attachment cards in the composer and sent conversation messages.
- PDF native-text extraction with automatic OCR for scanned or low-text pages.
- CPU-friendly local OCR through RapidOCR and ONNX Runtime; no GPU required.
- DOCX, XLSX/XLSM, PPTX, images, and common text/code formats.
- Local file processing. Only extracted text is included in the model prompt.
- Cordis lifecycle, dependency injection, Schemastery configuration, and HMR-compatible registration.

Supported extensions: PDF; PNG, JPEG, WebP, BMP, TIFF; DOCX; XLSX/XLSM; PPTX; TXT, Markdown, CSV, TSV, JSON, XML, YAML, HTML, logs, and common source-code files. Legacy DOC/XLS files must first be saved as DOCX/XLSX.

## One-click install

Prerequisites: a working `dsh` CLI, Python 3.9+, Git, and a DeepSeek Harness Web profile.

### Windows PowerShell

```powershell
git clone https://github.com/BYYY-eng/deepseek-harness-file-upload-ocr-plugin.git
cd deepseek-harness-file-upload-ocr-plugin
powershell -ExecutionPolicy Bypass -File .\scripts\install.ps1 -Profile web
dsh --profile web
```

### Linux / macOS

```bash
git clone https://github.com/BYYY-eng/deepseek-harness-file-upload-ocr-plugin.git
cd deepseek-harness-file-upload-ocr-plugin
chmod +x scripts/*.sh
./scripts/install.sh web
dsh --profile web
```

The first install downloads the Python wheels and small OCR models. Release branches include prebuilt `lib/` files, so pnpm build-script authorization is not required.

### DeepSeek Harness source checkout

If you run Harness from source and do not have a global `dsh` command:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\setup-ocr.ps1
cd C:\path\to\deepseek-harness
pnpm dsh plugin --profile web add C:\path\to\deepseek-harness-file-upload-ocr-plugin
pnpm dsh --profile web
```

## Usage

1. Click the document icon in the lower-left corner of the composer.
2. Select one or more files and wait for their cards to appear.
3. Type a question and send it normally.

The sent message keeps compact file cards. Extracted content remains available to the model but is not rendered as a wall of text. The plugin shows errors only; it does not add OCR page-count notices.

## Configuration

The bundle provides CPU-oriented defaults in `cordis.patch.yml`. Harness patches replace a row's entire `config`, so repeat all keys when overriding the `file-upload-ocr` row.

| Key | Default | Meaning |
|---|---:|---|
| `pythonCommand` | `auto` | Uses `.venv` created by setup; may be an explicit Python path |
| `maxFileBytes` | 25 MiB | Maximum uploaded file size |
| `maxPages` | 50 | PDF pages, workbook sheets, or slides |
| `dpi` | 144 | Scanned-PDF render resolution |
| `nativeTextMinChars` | 24 | Native PDF characters required to skip OCR |
| `timeoutMs` | 120000 | Extraction timeout per file |
| `maxOutputChars` | 200000 | Maximum extracted characters sent to the model |

Set `DSH_FILE_OCR_PYTHON` before startup to override the configured Python runtime without editing YAML.

## Privacy and security

Files are processed by a local Python child process. The upload endpoint is same-origin only, rejects path-like filenames, and enforces configured byte, page, time, and output limits. Extracted text is sent to whichever model provider your Harness profile uses; the original file is not uploaded by this plugin.

## Open source

Project code is available under the [MIT License](./LICENSE). Dependency licenses and attribution are listed in [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md). In particular, PDF handling uses permissively licensed pypdfium2/PDFium rather than PyMuPDF/AGPL.

This is an independent community project, not an official DeepSeek release. DeepSeek and DeepSeek Harness are names of their respective owners.

## Search terms

DeepSeek Harness upload file plugin · DeepSeek Harness PDF OCR plugin · DeepSeek Harness attachment plugin · DeepSeek Harness 上传文件插件 · DeepSeek Harness 文件附件 OCR
