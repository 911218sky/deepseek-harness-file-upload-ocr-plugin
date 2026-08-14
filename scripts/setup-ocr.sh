#!/usr/bin/env sh
set -eu
plugin_root=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
python3 -m venv "$plugin_root/.venv"
"$plugin_root/.venv/bin/python" -m pip install --upgrade pip
"$plugin_root/.venv/bin/python" -m pip install -r "$plugin_root/requirements.txt"
printf 'OCR runtime installed: %s\n' "$plugin_root/.venv/bin/python"
