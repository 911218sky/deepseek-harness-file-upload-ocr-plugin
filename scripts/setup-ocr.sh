#!/usr/bin/env sh
set -eu
plugin_root=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)

# Durable runtime under Harness home — survives pnpm / dsh plugin path churn.
# Override with DSH_FILE_OCR_HOME. Default: $DSH_HOME/ocr-runtime or ~/.dsh/ocr-runtime.
dsh_home=${DSH_HOME:-$HOME/.dsh}
runtime_root=${DSH_FILE_OCR_HOME:-$dsh_home/ocr-runtime}
venv=$runtime_root/.venv

# Prefer a maintained CPython on PATH (3.10+; 3.12 is a common default on current LTS distros).
# DSH_FILE_OCR_PYTHON here is the *bootstrap* interpreter used to create the venv
# (not the runtime path — that becomes $venv/bin/python after setup).
bootstrap=${DSH_FILE_OCR_BOOTSTRAP:-${DSH_FILE_OCR_PYTHON:-python3}}
# If DSH_FILE_OCR_PYTHON already points at a durable/package venv python, do not use it as bootstrap.
case $bootstrap in
  */ocr-runtime/.venv/*|*/.venv/bin/python|*/.venv/Scripts/python.exe)
    bootstrap=python3
    ;;
esac

if ! command -v "$bootstrap" >/dev/null 2>&1; then
  printf 'OCR setup failed: %s not found. Install Python 3.10+ (3.12 recommended).\n' "$bootstrap" >&2
  exit 1
fi

ver=$("$bootstrap" -c 'import sys; print("%d.%d" % sys.version_info[:2])')
"$bootstrap" -c 'import sys; raise SystemExit(0 if sys.version_info >= (3, 10) else 1)' || {
  printf 'OCR setup failed: need Python 3.10+ (found %s). 3.12 is recommended.\n' "$ver" >&2
  exit 1
}

mkdir -p "$runtime_root"
printf 'Using Python %s (%s)\n' "$ver" "$bootstrap"
printf 'OCR runtime root: %s\n' "$runtime_root"
"$bootstrap" -m venv "$venv"
"$venv/bin/python" -m pip install --upgrade pip
"$venv/bin/python" -m pip install -r "$plugin_root/requirements.txt"

printf 'OCR 运行环境已安装：%s / OCR runtime installed: %s\n' "$venv/bin/python" "$venv/bin/python"
printf '升级 dsh / 本插件后通常无需重跑；若报 OCR 未安装再执行本脚本。\n'
printf 'After upgrading dsh or this plugin, OCR usually keeps working; re-run only if missing.\n'
