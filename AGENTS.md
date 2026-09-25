# Agent notes — dsh-file-upload-ocr-plugin

These rules apply whenever you install, upgrade, sync, or debug this plugin for a DeepSeek Harness / DSH deployment.

## Critical: OCR runtime is durable under `$DSH_HOME/ocr-runtime`

From **2.1.15+**, `scripts/setup-ocr.sh` / `.ps1` install the Python venv to:

- `$DSH_HOME/ocr-runtime/.venv` (or `~/.dsh/ocr-runtime` when `DSH_HOME` is unset)
- Override root with `DSH_FILE_OCR_HOME`

The host plugin resolves Python in this order:

1. `pythonCommand` config (non-`auto`)
2. `DSH_FILE_OCR_PYTHON`
3. **`$DSH_HOME/ocr-runtime/.venv/...`** (durable)
4. Package-local `../.venv` (legacy fallback)

`.venv/` inside the npm/GitHub package is still **never** shipped. That used to break after every `pnpm add` / `dsh plugin add` because the package path changed. The durable home runtime **survives plugin and DSH upgrades**.

If the UI or `/api/file-extract` returns:

> OCR 环境未安装 / OCR environment is not installed…

run setup once (from the **repo or installed package** — both write the same durable path):

```bash
# Linux / macOS / WSL
cd /path/to/deepseek-harness-file-upload-ocr-plugin   # or the installed package dir
chmod +x scripts/setup-ocr.sh
./scripts/setup-ocr.sh
```

```powershell
# Windows
cd C:\path\to\deepseek-harness-file-upload-ocr-plugin
powershell -ExecutionPolicy Bypass -File .\scripts\setup-ocr.ps1
```

**Do not** treat this as a Model / credentials / Modal UI bug.

## After upgrading DSH or this plugin

1. Update the JS package as usual (`dsh plugin add` / pnpm).
2. OCR usually **keeps working** if `$DSH_HOME/ocr-runtime` already exists.
3. Only re-run `setup-ocr` when the error returns, or after `requirements.txt` changes.
4. Verify (below) before telling the user it is fixed.

## Verify before telling the user it is fixed

```bash
DSH_HOME="${DSH_HOME:-$HOME/.dsh}"
RUNTIME="$DSH_HOME/ocr-runtime"
# If the user uses ~/.config/dsh, export DSH_HOME accordingly.

test -x "$RUNTIME/.venv/bin/python"
"$RUNTIME/.venv/bin/python" -c "import rapidocr_onnxruntime, pypdfium2; print('ocr-imports-ok')"

PLUGIN="$DSH_HOME/profiles/web/node_modules/dsh-file-upload-ocr-plugin"
PLUGIN=$(readlink -f "$PLUGIN" 2>/dev/null || echo "$PLUGIN")
test -f "$PLUGIN/extract.py"

# Live API (loopback) optional:
# curl -sS -X POST http://127.0.0.1:3080/api/file-extract \
#   -H 'x-dsh-file-name: t.png' --data-binary @t.png
```

Only after verification, ask the user to retry attaching an image with **本機 OCR 轉文字**.

## Image handling UI (not the same error)

When images are selected and vision attach is available, the plugin shows a DSH `Modal`:

- **直接提供原圖** — vision model path
- **本機 OCR 轉文字** — local OCR path (needs durable or local `.venv`)

## Checklist for AI when syncing / upgrading

1. Install / update the npm package.
2. Prefer durable runtime: confirm `$DSH_HOME/ocr-runtime/.venv` exists; run `setup-ocr` only if missing or requirements changed.
3. Restart `dsh-web` only if the plugin JS changed and Cordis did not hot-reload.
4. Run verification commands above.
5. Never “fix” OCR by only editing Models / API keys when the error mentions setup-ocr.
