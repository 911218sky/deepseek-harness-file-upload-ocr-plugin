# DeepSeek Harness File Upload & OCR Plugin

[中文说明](./README.zh-CN.md) · English

> A file upload and local OCR plugin for DeepSeek Harness. Add PDF, Word, Excel, PowerPoint, image, and text attachments as chat cards; scanned PDFs and images are recognized locally with OCR.

**中文项目描述：** DeepSeek Harness 文件上传与 OCR 插件：在 Web UI 中以附件卡片上传 PDF、Word、Excel、PowerPoint、图片和文本文件；PDF 与图片在本机自动 OCR 识别。

## Features

Requires DeepSeek Harness **0.1.7-rc.2+** (peer dependencies target `@deepseek-ai/*@^0.1.7-rc.2`).

- Real attachment cards in the composer and sent conversation messages.
- Drag files anywhere over the Harness window to upload them.
- File cards use different accent colors for PDF, images, Word, Excel, PowerPoint, and text files.
- PDF native-text extraction with automatic OCR for scanned or low-text pages.
- Local OCR for scanned PDFs and images.
- DOCX, XLSX/XLSM, PPTX, images, and common text/code formats.
- Local file processing. Only extracted text is included in the model prompt.
- Cordis lifecycle, dependency injection, Schemastery configuration, and HMR-compatible registration.

Supported extensions: PDF; PNG, JPEG, WebP, BMP, TIFF; DOCX; XLSX/XLSM; PPTX; TXT, Markdown, CSV, TSV, JSON, XML, YAML, HTML, logs, and common source-code files. Legacy DOC/XLS files must first be saved as DOCX/XLSX.

## One-click install

Prerequisites: a working `dsh` CLI, **Node.js LTS (`>=20`)**, **Python 3.10+** (3.12 recommended; 3.9 is EOL), and Git. The installer creates the `web` profile when it does not exist.

The installer creates the local Python environment first, then registers this package through Harness's official `dsh plugin --profile ... add` flow. No manual `cordis.yml` or `cordis.patch.yml` edits are needed.

### Windows PowerShell

```powershell
git clone https://github.com/911218sky/deepseek-harness-file-upload-ocr-plugin.git
cd deepseek-harness-file-upload-ocr-plugin
powershell -ExecutionPolicy Bypass -File .\scripts\install.ps1 -Profile web
dsh --profile web
```

### Linux / macOS

```bash
git clone https://github.com/911218sky/deepseek-harness-file-upload-ocr-plugin.git
cd deepseek-harness-file-upload-ocr-plugin
chmod +x scripts/*.sh
./scripts/install.sh web
dsh --profile web
```

The first install downloads the Python OCR dependencies. Release branches include prebuilt `lib/` files, so pnpm build-script authorization is not required.

### GitHub Release archive

If you download a GitHub Release archive instead of cloning the repository, extract it into a folder first, open a terminal in that folder, and run the same platform installer above. This keeps the OCR environment beside the installed bundle. Do not install the `.tgz` with `dsh plugin add` alone unless you have also run `scripts/setup-ocr.ps1` or `scripts/setup-ocr.sh` for that installed package.

For the simplest Windows path, choose **Source code (zip)** on the Release page, extract it, and run `scripts\install.ps1`.

### Official manual bundle install

Advanced users can use the Harness bundle command directly after running the OCR setup script:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\setup-ocr.ps1
dsh plugin --profile web add C:\path\to\deepseek-harness-file-upload-ocr-plugin
dsh --profile web
```

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
2. Select one or more files and wait for their cards to appear, or drag files anywhere over the Harness window.
3. Type a question and send it normally.

After sending, the file card remains attached to the message.

## Configuration

The bundle provides OCR defaults in `cordis.patch.yml`. Harness patches replace a row's entire `config`, so repeat all keys when overriding the `file-upload-ocr` row.

| Key | Default | Meaning |
|---|---:|---|
| `pythonCommand` | `auto` | Uses `.venv` created by setup; may be an explicit Python path |
| `maxFileBytes` | 25 MiB (26,214,400 bytes) | Maximum size of each uploaded file |
| `maxPages` | 50 | PDF pages, workbook sheets, or slides |
| `dpi` | 144 | Scanned-PDF render resolution |
| `nativeTextMinChars` | 24 | Native PDF characters required to skip OCR |
| `timeoutMs` | 120000 | Extraction timeout per file |
| `maxOutputChars` | 200000 | Maximum extracted characters sent to the model |

Set `DSH_FILE_OCR_PYTHON` before startup to override the configured Python runtime without editing YAML.

## Troubleshooting: OCR environment is not installed

### Symptom

Attaching an image with **Local OCR to text**, or extracting PDF/images, returns:

`OCR environment is not installed. Run scripts/setup-ocr.ps1 or scripts/setup-ocr.sh.`

### Cause

GitHub / `pnpm add` / `dsh plugin add` installs **do not** ship a Python venv. From **2.1.15+**, setup installs a **durable** runtime under `$DSH_HOME/ocr-runtime` so plugin upgrades usually keep OCR working. First install on a machine, or a wiped `$DSH_HOME`, still needs setup once.

### Fix

Run setup from the repo **or** the installed package (both write the same durable path):

```bash
chmod +x scripts/setup-ocr.sh
./scripts/setup-ocr.sh
# installs: $DSH_HOME/ocr-runtime/.venv  (default home: ~/.dsh if DSH_HOME unset)
```

On Windows use `scripts\setup-ocr.ps1`. Override the runtime root with `DSH_FILE_OCR_HOME` if needed.

### Verify after install

```bash
RUNTIME="${DSH_FILE_OCR_HOME:-${DSH_HOME:-$HOME/.dsh}/ocr-runtime}"
test -x "$RUNTIME/.venv/bin/python"
"$RUNTIME/.venv/bin/python" -c "import rapidocr_onnxruntime, pypdfium2; print('ok')"
```

Full agent-oriented checklist: [AGENTS.md](./AGENTS.md).

## Privacy and security

Files are processed by a local Python child process. The upload endpoint is same-origin only, rejects path-like filenames, and enforces configured byte, page, time, and output limits. Extracted text is sent to whichever model provider your Harness profile uses; the original file is not uploaded by this plugin.

## Open source

Project code is available under the [MIT License](./LICENSE). Dependency licenses and attribution are listed in [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md). In particular, PDF handling uses permissively licensed pypdfium2/PDFium rather than PyMuPDF/AGPL.

This is an independent community project, not an official DeepSeek release. DeepSeek and DeepSeek Harness are names of their respective owners.

## Search terms

DeepSeek Harness upload file plugin · DeepSeek Harness PDF OCR plugin · DeepSeek Harness attachment plugin · DeepSeek Harness 上传文件插件 · DeepSeek Harness 文件附件 OCR
