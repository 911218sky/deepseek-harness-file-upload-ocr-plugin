$ErrorActionPreference = 'Stop'
$pluginRoot = Split-Path -Parent $PSScriptRoot
$venv = Join-Path $pluginRoot '.venv'
python -m venv $venv
$python = Join-Path $venv 'Scripts\python.exe'
& $python -m pip install --upgrade pip
& $python -m pip install -r (Join-Path $pluginRoot 'requirements.txt')
Write-Output "OCR runtime installed: $python"
