# DeepSeek Harness 文件上传与 OCR 插件

[English](./README.md) · 中文

> DeepSeek Harness 文件上传与 OCR 插件：在 Web UI 中以附件卡片上传 PDF、Word、Excel、PowerPoint、图片和文本文件；PDF 与图片在本机自动 OCR 识别。

**English description:** A file upload and local OCR plugin for DeepSeek Harness. Add PDF, Word, Excel, PowerPoint, image, and text attachments as chat cards; scanned PDFs and images are recognized locally with OCR.

## 功能

需要 DeepSeek Harness **0.1.7-rc.2+**（peer 依赖目标为 `@deepseek-ai/*@^0.1.7-rc.2`）。

- 输入框上方和发送后的对话记录都使用真正的文件附件卡片。
- 支持将文件拖到 Harness 窗口任意位置上传。
- PDF、图片、Word、Excel、PowerPoint 和文本文件使用不同的卡片强调色。
- PDF 优先提取原生文本；扫描页或文本过少的页面自动 OCR。
- PDF 和图片支持本地自动 OCR 识别。
- 支持 DOCX、XLSX/XLSM、PPTX、图片及常见文本/代码文件。
- 原文件只在本机解析；模型收到提取文本。
- 遵循 Harness 的 Cordis 生命周期、依赖注入、Schemastery 配置和 HMR 注册规范。

支持扩展名：PDF；PNG/JPEG/WebP/BMP/TIFF；DOCX；XLSX/XLSM；PPTX；TXT、Markdown、CSV、TSV、JSON、XML、YAML、HTML、日志和常见源码文件。旧 DOC/XLS 请先另存为 DOCX/XLSX。

## 一键安装

前提：已能使用 `dsh` CLI、**Node.js LTS（`>=20`）**、**Python 3.10+**（建议 3.12；3.9 已结束维护）和 Git。如果 `web` profile 不存在，安装脚本会自动创建。

安装脚本会先创建本地 Python 环境，再通过 Harness 官方的 `dsh plugin --profile ... add` 流程注册插件，无需手动修改 `cordis.yml` 或 `cordis.patch.yml`。

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

首次安装会下载 Python OCR 依赖。发布分支包含预构建的 `lib/`，无需授权 pnpm 安装脚本。

### GitHub Release 压缩包

如果不想克隆仓库而是下载 GitHub Release 压缩包，请先将其解压到一个文件夹，在该文件夹中打开终端，然后运行上面的对应平台安装脚本。这样 OCR 环境会和已安装的插件放在同一目录。除非你已经在安装后的插件目录中运行 `scripts/setup-ocr.ps1` 或 `scripts/setup-ocr.sh`，否则不要只执行 `dsh plugin add` 安装 `.tgz` 文件。

对 Windows 用户，最简单的方式是在 Release 页面选择 **Source code (zip)**，解压后运行 `scripts\install.ps1`。

### Harness 官方手动安装方式

熟悉 Harness 的用户可以在运行 OCR 环境安装脚本后，直接使用官方 bundle 命令：

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\setup-ocr.ps1
dsh plugin --profile web add C:\path\to\deepseek-harness-file-upload-ocr-plugin
dsh --profile web
```

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
2. 选择一个或多个文件并等待附件卡片出现，也可以将文件拖到 Harness 窗口任意位置。
3. 输入问题并正常发送。

发送后，文件卡片会随消息保留。

## 配置

`cordis.patch.yml` 提供 OCR 默认值。Harness patch 会整体替换一行的 `config`，覆盖 `file-upload-ocr` 行时需重述所有键。

| 配置键 | 默认值 | 含义 |
|---|---:|---|
| `pythonCommand` | `auto` | 自动使用 `$DSH_HOME/ocr-runtime/.venv`（或包内遗留 `.venv`），也可填 Python 绝对路径 |
| `maxFileBytes` | 100 MiB（104,857,600 字节） | 每个文件的大小上限 |
| `maxPages` | 200 | PDF 页数、工作表数或幻灯片数上限 |
| `dpi` | 144 | 扫描 PDF 的渲染分辨率 |
| `nativeTextMinChars` | 24 | PDF 原生字符达到此值时跳过 OCR |
| `timeoutMs` | 900000 | 单文件解析超时 |
| `maxOutputChars` | 1000000 | 交给模型的最大字符数 |

启动前设置 `DSH_FILE_OCR_PYTHON`，可在不改 YAML 的情况下指定 Python 环境。

## 常见问题：OCR 环境未安装

### 现象

上传图片并选择「本机 OCR 转文字」，或解析 PDF/图片时出现：

`OCR 环境未安装 / OCR environment is not installed. 请运行 scripts/setup-ocr.ps1 或 scripts/setup-ocr.sh`

### 原因

从 GitHub / `pnpm add` / `dsh plugin add` 安装时，**不会**附带 Python 环境。自 **2.1.15** 起，安装脚本会把 OCR 装到 **`$DSH_HOME/ocr-runtime`**（持久目录），升级插件后通常不用重装。首次安装或清空 `$DSH_HOME` 后仍需跑一次 setup。

### 解决

在源码仓库或已安装插件目录执行均可（都会写到同一持久路径）：

```bash
chmod +x scripts/setup-ocr.sh
./scripts/setup-ocr.sh
# 安装到：$DSH_HOME/ocr-runtime/.venv（未设置 DSH_HOME 时默认 ~/.dsh）
```

Windows 使用 `scripts\setup-ocr.ps1`。可用 `DSH_FILE_OCR_HOME` 覆盖运行时根目录。

### 安装后确认

```bash
RUNTIME="${DSH_FILE_OCR_HOME:-${DSH_HOME:-$HOME/.dsh}/ocr-runtime}"
test -x "$RUNTIME/.venv/bin/python"
"$RUNTIME/.venv/bin/python" -c "import rapidocr_onnxruntime, pypdfium2; print('ok')"
```

给 AI / Agent 的完整排错清单见 [AGENTS.md](./AGENTS.md)。

## 隐私、安全与开源协议

插件通过本地 Python 子进程解析文件。上传接口仅接受同源请求，并限制文件大小、页数、运行时间和输出长度。提取文本会发送给 Harness profile 当前使用的模型服务商；原文件不会由本插件上传。

项目代码使用 [MIT License](./LICENSE)。依赖项目及许可证见 [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md)。PDF 部分采用宽松许可证的 pypdfium2/PDFium，没有使用 PyMuPDF/AGPL。

本项目是独立社区项目，并非 DeepSeek 官方发布或官方背书。
