# Agent notes — dsh-file-upload-ocr-plugin

These rules apply whenever you install, upgrade, sync, or debug this plugin for a DeepSeek Harness / DSH deployment.

## Critical: OCR runtime is not shipped in the package

`.venv/` is gitignored and is **never** present in GitHub / pnpm installs.

If the UI or `/api/file-extract` returns:

> OCR 环境未安装 / OCR environment is not installed. 请运行 scripts/setup-ocr.ps1 或 scripts/setup-ocr.sh

that almost always means the installed package directory has no working `.venv` after `pnpm add` / `dsh plugin add` / syncing from GitHub.

**Do not** treat this as a Model / credentials / Modal UI bug. Fix the Python OCR env first.

## Fix (required after every fresh install or GitHub sync)

Locate the installed package root (examples):

- `$DSH_HOME/profiles/web/node_modules/dsh-file-upload-ocr-plugin`
- Docker / remote: `$DSH_HOME` may be `/root/docker/deepseek-harness-data`

Then run:

```bash
# Linux / macOS / WSL
cd "$DSH_HOME/profiles/web/node_modules/dsh-file-upload-ocr-plugin"
chmod +x scripts/setup-ocr.sh
./scripts/setup-ocr.sh
```

```powershell
# Windows
cd $env:DSH_HOME\profiles\web\node_modules\dsh-file-upload-ocr-plugin
powershell -ExecutionPolicy Bypass -File .\scripts\setup-ocr.ps1
```

Restart the web profile / `dsh-web` service after setup.

Optional: set `DSH_FILE_OCR_PYTHON` to an absolute Python path instead of `auto` (see `cordis.patch.yml`).

## Verify before telling the user it is fixed

All of these should pass:

```bash
PLUGIN="$DSH_HOME/profiles/web/node_modules/dsh-file-upload-ocr-plugin"

# 1) venv python exists
test -x "$PLUGIN/.venv/bin/python"   # Windows: .venv\Scripts\python.exe

# 2) OCR deps import
"$PLUGIN/.venv/bin/python" -c "import rapidocr_onnxruntime, pypdfium2; print('ocr-imports-ok')"

# 3) extract entrypoint is present
test -f "$PLUGIN/extract.py"

# 4) service is healthy after restart
# systemctl is-active dsh-web   # or your local start command
```

Only after verification, ask the user to retry attaching an image with **本機 OCR 轉文字**.

## Image handling UI (not the same error)

When images are selected and vision attach is available, the plugin shows a DSH `Modal` so the user must choose:

- **直接提供原圖** — vision model path
- **本機 OCR 轉文字** — local OCR path (needs `.venv`)

Choosing OCR without a working `.venv` produces the error above.

## Checklist for AI when syncing this plugin between machines

1. Install / update the npm package (GitHub `#main` or release).
2. **Always** run `scripts/setup-ocr.sh` (or `.ps1`) in the **installed** package directory on that machine.
3. Restart `dsh-web` / profile.
4. Run the verification commands above.
5. Do not skip step 2 on remote SSH hosts after `pnpm update`.
