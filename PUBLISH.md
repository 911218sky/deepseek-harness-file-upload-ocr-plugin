# GitHub publishing checklist

## Repository settings

- Owner: `BYYY-eng`
- Repository: `deepseek-harness-file-upload-ocr-plugin`
- Visibility: Public
- Initialize with README / .gitignore / license: No (all are included here)

GitHub About description:

> DeepSeek Harness 文件上传与本地 OCR 插件｜File upload and CPU-friendly local OCR for PDF, Word, Excel, PowerPoint, images and text files.

Chinese description:

> DeepSeek Harness 文件上传与 OCR 插件：以附件卡片上传 PDF、Word、Excel、PowerPoint、图片和文本文件，并用适合 CPU 的本地 RapidOCR 自动识别扫描 PDF 与图片。

English description:

> A file upload and local OCR plugin for DeepSeek Harness. Add PDF, Word, Excel, PowerPoint, image, and text attachments as chat cards, with CPU-friendly RapidOCR for scanned documents.

Recommended topics:

`deepseek-harness`, `deepseek`, `file-upload`, `pdf-ocr`, `rapidocr`, `ocr`, `document-parser`, `attachment`, `typescript`, `python`

## First push

Run these commands inside this directory after creating the empty GitHub repository:

```powershell
git init
git add .
git commit -m "Initial release: DeepSeek Harness File Upload & OCR Plugin"
git branch -M main
git remote add origin https://github.com/BYYY-eng/deepseek-harness-file-upload-ocr-plugin.git
git push -u origin main
```

## v1.0.0 release

```powershell
git tag -a v1.0.0 -m "v1.0.0"
git push origin v1.0.0
```

Create a GitHub Release from `v1.0.0` and attach `dsh-file-upload-ocr-plugin-1.0.0.tgz` as an optional prebuilt installation artifact.

Search ranking cannot be guaranteed. Keeping the repository public, using the exact title and topics above, writing real release notes, and earning genuine links/stars improves discoverability without keyword spam.
