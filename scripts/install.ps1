param([string]$Profile = 'web')

$ErrorActionPreference = 'Stop'
$pluginRoot = Split-Path -Parent $PSScriptRoot

& (Join-Path $PSScriptRoot 'setup-ocr.ps1')
Push-Location $pluginRoot
try {
  dsh plugin --profile $Profile add $pluginRoot
} finally {
  Pop-Location
}

Write-Output "已将 dsh-file-upload-ocr-plugin 安装到 profile '$Profile' / Installed dsh-file-upload-ocr-plugin in profile '$Profile'."
Write-Output "启动 Harness：dsh --profile $Profile / Start Harness with: dsh --profile $Profile"
