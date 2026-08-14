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

Write-Output "Installed dsh-file-upload-ocr-plugin in profile '$Profile'."
Write-Output "Start Harness with: dsh --profile $Profile"
