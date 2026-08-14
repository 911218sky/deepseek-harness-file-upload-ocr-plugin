# DeepSeek Harness 文件上传与 OCR 插件

[English](./README.md) · 中文

> DeepSeek Harness 文件上传与 OCR 插件：在 Web UI 中以附件卡片上传 PDF、Word、Excel、PowerPoint、图片和文本文件；PDF 与图片在本机使用适合 CPU 的 RapidOCR 自动识别，文件全文不会铺满聊天气泡。

**English description:** A file upload and local OCR plugin for DeepSeek Harness. Add PDF, Word, Excel, PowerPoint, image, and text attachments as chat cards; scanned PDFs and images are recognized locally with CPU-friendly RapidOCR.

## 功能

- 输入框上方和发送后的对话记录都使用真正的文件附件卡片。
- PDF 优先提取原生文本；扫描页或文本过少的页面自动 OCR。
- RapidOCR + ONNX Runtime 本地 CPU 推理，不需要显卡。
- 支持 DOCX、XLSX/XLSM、PPTX、图片及常见文本/代码文件。
- 原文件只在本机解析；模型收到提取文本，不会在聊天气泡中显示全文。
- 遵循 Harness 的 Cordis 生命周期、依赖注入、Schemastery 配置和 HMR 注册规范。

支持扩展名：PDF；PNG/JPEG/WebP/BMP/TIFF；DOCX；XLSX/XLSM；PPTX；TXT、Markdown、CSV、TSV、JSON、XML、YAML、HTML、日志和常见源码文件。旧 DOC/XLS 请先另存为 DOCX/XLSX。

## 一键安装

前提：已能使用 `dsh` CLI、Python 3.9+、Git，并已有 DeepSeek Harness Web profile。

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

首次安装会下载 Python wheel 和轻量 OCR 模型。发布分支包含预构建的 `lib/`，无需授权 pnpm 安装脚本。

### 从 DeepSeek Harness 源码运行

没有全局 `dsh` 命令时：

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\setup-ocr.ps1
cd C:\path\to\deepseek-harness
pnpm dsh plugin --profile web add C:\path\to\deepseek-harness-file-upload-ocr-plugin
pnpm dsh --profile web
```

## 使用方法

1. 点击输入框左下角的文件图标。
2. 选择一个或多个文件，等待附件卡片出现。
3. 输入问题并正常发送。

发送后只显示文件卡片与用户输入的问题。OCR/解析正文仍会交给模型，但不会展开在聊天气泡中；成功时不显示页数或 OCR 统计，只在失败时显示错误。

## 配置

`cordis.patch.yml` 提供适合 CPU 的默认值。Harness patch 会整体替换一行的 `config`，覆盖 `file-upload-ocr` 行时需重述所有键。

| 配置键 | 默认值 | 含义 |
|---|---:|---|
| `pythonCommand` | `auto` | 自动使用安装脚本创建的 `.venv`，也可填 Python 绝对路径 |
| `maxFileBytes` | 25 MiB | 单个文件大小上限 |
| `maxPages` | 50 | PDF 页数、工作表数或幻灯片数上限 |
| `dpi` | 144 | 扫描 PDF 的渲染分辨率 |
| `nativeTextMinChars` | 24 | PDF 原生字符达到此值时跳过 OCR |
| `timeoutMs` | 120000 | 单文件解析超时 |
| `maxOutputChars` | 200000 | 交给模型的最大字符数 |

启动前设置 `DSH_FILE_OCR_PYTHON`，可在不改 YAML 的情况下指定 Python 环境。

## 隐私、安全与开源协议

插件通过本地 Python 子进程解析文件。上传接口仅接受同源请求，并限制文件大小、页数、运行时间和输出长度。提取文本会发送给 Harness profile 当前使用的模型服务商；原文件不会由本插件上传。

项目代码使用 [MIT License](./LICENSE)。依赖项目及许可证见 [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md)。PDF 部分采用宽松许可证的 pypdfium2/PDFium，没有使用 PyMuPDF/AGPL。

本项目是独立社区项目，并非 DeepSeek 官方发布或官方背书。
