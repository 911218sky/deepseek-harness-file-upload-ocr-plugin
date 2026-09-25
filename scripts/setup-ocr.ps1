$ErrorActionPreference = 'Stop'
$pluginRoot = Split-Path -Parent $PSScriptRoot

# Durable runtime under Harness home — survives pnpm / dsh plugin path churn.
$dshHome = if ($env:DSH_HOME -and $env:DSH_HOME.Trim().Length -gt 0) { $env:DSH_HOME.Trim() } else { Join-Path $HOME '.dsh' }
$runtimeRoot = if ($env:DSH_FILE_OCR_HOME -and $env:DSH_FILE_OCR_HOME.Trim().Length -gt 0) {
  $env:DSH_FILE_OCR_HOME.Trim()
} else {
  Join-Path $dshHome 'ocr-runtime'
}
$venv = Join-Path $runtimeRoot '.venv'

$bootstrap = if ($env:DSH_FILE_OCR_BOOTSTRAP) {
  $env:DSH_FILE_OCR_BOOTSTRAP
} elseif ($env:DSH_FILE_OCR_PYTHON) {
  $env:DSH_FILE_OCR_PYTHON
} else {
  'python'
}
# Do not bootstrap from an existing OCR venv path.
if ($bootstrap -match 'ocr-runtime[\\/]\.venv|\\\.venv\\(bin|Scripts)\\python') {
  $bootstrap = 'python'
}

$ver = & $bootstrap -c 'import sys; print("%d.%d" % sys.version_info[:2])'
& $bootstrap -c 'import sys; raise SystemExit(0 if sys.version_info >= (3, 10) else 1)'
if ($LASTEXITCODE -ne 0) {
  throw "OCR setup failed: need Python 3.10+ (found $ver). 3.12 is recommended."
}

New-Item -ItemType Directory -Force -Path $runtimeRoot | Out-Null
Write-Output "Using Python $ver ($bootstrap)"
Write-Output "OCR runtime root: $runtimeRoot"
& $bootstrap -m venv $venv
$python = Join-Path $venv 'Scripts\python.exe'
& $python -m pip install --upgrade pip
& $python -m pip install -r (Join-Path $pluginRoot 'requirements.txt')

if ($env:DSH_FILE_OCR_ALSO_LOCAL -eq '1') {
  $localVenv = Join-Path $pluginRoot '.venv'
  & $bootstrap -m venv $localVenv
  $localPython = Join-Path $localVenv 'Scripts\python.exe'
  & $localPython -m pip install --upgrade pip
  & $localPython -m pip install -r (Join-Path $pluginRoot 'requirements.txt')
}

Write-Output "OCR 运行环境已安装：$python / OCR runtime installed: $python"
Write-Output "升级 dsh / 本插件后通常无需重跑；若报 OCR 未安装再执行本脚本。"
Write-Output "After upgrading dsh or this plugin, OCR usually keeps working; re-run only if missing."
