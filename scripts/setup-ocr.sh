#!/usr/bin/env sh
set -eu
plugin_root=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)

# Prefer a maintained CPython on PATH (3.10+; 3.12 is a common default on current LTS distros).
py=${DSH_FILE_OCR_PYTHON:-python3}
if ! command -v "$py" >/dev/null 2>&1; then
  printf 'OCR setup failed: %s not found. Install Python 3.10+ (3.12 recommended).\n' "$py" >&2
  exit 1
fi

ver=$("$py" -c 'import sys; print("%d.%d" % sys.version_info[:2])')
"$py" -c 'import sys; raise SystemExit(0 if sys.version_info >= (3, 10) else 1)' || {
  printf 'OCR setup failed: need Python 3.10+ (found %s). 3.12 is recommended.\n' "$ver" >&2
  exit 1
}

printf 'Using Python %s (%s)\n' "$ver" "$py"
"$py" -m venv "$plugin_root/.venv"
"$plugin_root/.venv/bin/python" -m pip install --upgrade pip
"$plugin_root/.venv/bin/python" -m pip install -r "$plugin_root/requirements.txt"
printf 'OCR 运行环境已安装：%s / OCR runtime installed: %s\n' "$plugin_root/.venv/bin/python" "$plugin_root/.venv/bin/python"
