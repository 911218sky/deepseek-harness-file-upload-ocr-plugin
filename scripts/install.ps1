param([string]$Profile = 'web')

$ErrorActionPreference = 'Stop'
$pluginRoot = Split-Path -Parent $PSScriptRoot

# Install durable OCR runtime first (lives under $DSH_HOME/ocr-runtime).
& (Join-Path $PSScriptRoot 'setup-ocr.ps1')
Push-Location $pluginRoot
try {
  dsh plugin --profile $Profile add $pluginRoot
} finally {
  Pop-Location
}
# Re-run after add so requirements stay synced; durable path is unchanged by pnpm.
& (Join-Path $PSScriptRoot 'setup-ocr.ps1')

Write-Output "已将 dsh-file-upload-ocr-plugin 安装到 profile '$Profile' / Installed dsh-file-upload-ocr-plugin in profile '$Profile'."
Write-Output "OCR 运行环境：`$DSH_HOME/ocr-runtime（升级插件后通常无需重装）"
Write-Output "Start Harness: dsh --profile $Profile"
