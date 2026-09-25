$ErrorActionPreference = 'Stop'
$pluginRoot = Split-Path -Parent $PSScriptRoot
$venv = Join-Path $pluginRoot '.venv'

$py = if ($env:DSH_FILE_OCR_PYTHON) { $env:DSH_FILE_OCR_PYTHON } else { 'python' }
$ver = & $py -c 'import sys; print("%d.%d" % sys.version_info[:2])'
& $py -c 'import sys; raise SystemExit(0 if sys.version_info >= (3, 10) else 1)'
if ($LASTEXITCODE -ne 0) {
  throw "OCR setup failed: need Python 3.10+ (found $ver). 3.12 is recommended."
}

Write-Output "Using Python $ver ($py)"
& $py -m venv $venv
$python = Join-Path $venv 'Scripts\python.exe'
& $python -m pip install --upgrade pip
& $python -m pip install -r (Join-Path $pluginRoot 'requirements.txt')
Write-Output "OCR 运行环境已安装：$python / OCR runtime installed: $python"
