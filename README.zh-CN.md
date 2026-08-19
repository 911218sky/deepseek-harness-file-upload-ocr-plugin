# DeepSeek Harness 文件上传与 OCR 插件

[English](./README.md) · 中文

> DeepSeek Harness 文件上传与 OCR 插件：在 Web UI 中以附件卡片上传 PDF、Word、Excel、PowerPoint、图片和文本文件；PDF 与图片在本机自动 OCR 识别。

**English description:** A file upload and local OCR plugin for DeepSeek Harness. Add PDF, Word, Excel, PowerPoint, image, and text attachments as chat cards; scanned PDFs and images are recognized locally with OCR.

## 功能

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

前提：已能使用 `dsh` CLI、Python 3.9+ 和 Git。如果 `web` profile 不存在，安装脚本会自动创建。

安装脚本会先创建本地 Python 环境，再通过 Harness 官方的 `dsh plugin --profile ... add` 流程注册插件，无需手动修改 `cordis.yml` 或 `cordis.patch.yml`。

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

首次安装会下载 Python OCR 依赖。发布分支包含预构建的 `lib/`，无需授权 pnpm 安装脚本。

### GitHub Release 压缩包

如果不想克隆仓库而是下载 GitHub Release 压缩包，请先将其解压到一个文件夹，在该文件夹中打开终端，然后运行上面的对应平台安装脚本。这样 OCR 环境会和已安装的插件放在同一目录。除非你已经在安装后的插件目录中运行 `scripts/setup-ocr.ps1` 或 `scripts/setup-ocr.sh`，否则不要只执行 `dsh plugin add` 安装 `.tgz` 文件。

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
| `pythonCommand` | `auto` | 自动使用安装脚本创建的 `.venv`，也可填 Python 绝对路径 |
| `maxFileBytes` | 25 MiB（26,214,400 字节） | 每个文件的大小上限 |
| `maxPages` | 50 | PDF 页数、工作表数或幻灯片数上限 |
| `dpi` | 144 | 扫描 PDF 的渲染分辨率 |
| `nativeTextMinChars` | 24 | PDF 原生字符达到此值时跳过 OCR |
| `timeoutMs` | 120000 | 单文件解析超时 |
| `maxOutputChars` | 200000 | 交给模型的最大字符数 |

启动前设置 `DSH_FILE_OCR_PYTHON`，可在不改 YAML 的情况下指定 Python 环境。

如果 Harness 提示“未安装 OCR 环境”，请在插件目录中重新运行对应平台的环境安装脚本，然后重启 `web` profile。

## 隐私、安全与开源协议

插件通过本地 Python 子进程解析文件。上传接口仅接受同源请求，并限制文件大小、页数、运行时间和输出长度。提取文本会发送给 Harness profile 当前使用的模型服务商；原文件不会由本插件上传。

项目代码使用 [MIT License](./LICENSE)。依赖项目及许可证见 [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md)。PDF 部分采用宽松许可证的 pypdfium2/PDFium，没有使用 PyMuPDF/AGPL。

本项目是独立社区项目，并非 DeepSeek 官方发布或官方背书。
