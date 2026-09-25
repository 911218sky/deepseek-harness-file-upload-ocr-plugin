# Agent notes — dsh-file-upload-ocr-plugin

These rules apply whenever you install, upgrade, sync, or debug this plugin for a DeepSeek Harness / DSH deployment.

## Architecture: prefer DSH seats, keep this plugin thin

DSH changes often and sometimes heavily. **Do not rebuild composer/chat UI that DSH already owns.** Own only OCR-domain logic and a thin adapter into current DSH APIs. When DSH moves, fix the **connection layer**, not a parallel product.

| Prefer (DSH) | Avoid (home-grown) |
|--------------|--------------------|
| Official slots (`conversation.input.*`, `conversation.chat.node`) | Extra docks / parallel rails / custom composers |
| `inputTriggers` + `ReferenceInsert` + codec | Custom send pipelines that bypass DSH draft/refs |
| `conversation.createDrafts` / `addAttachments` for vision | Re-implementing native image draft attach |
| `@deepseek-ai/dsh-client-ui-primitives` (`FileTypeIcon`, `fileSizeText`, icons, `Modal`) | Custom file glyphs / size formatters; hard-coded removed icons |
| `renderMessageImages` from chat-node props | Importing non-exported `ImageGallery` / `DropOverlay` / `FileCard` |
| Wrap native slot occupants (e.g. shadow attachments, render native + OCR) | Fully replacing native attachments UI |

**Allowed custom surface (must stay small):** OCR extract host + store for extracted text, pending/ready rail chrome for OCR refs (until DSH exports `FileCard`), thin drop mask (DropOverlay is not exported), serialize codec that emits `<attached_file>…`. If a DSH primitive later covers any of that, delete our copy and connect to theirs.

On every DSH client bump: re-read how native InputBar mounts attachments / left controls / chat nodes; retarget inject + imports; delete dead dual seats. Do not “stabilize” by growing more custom UI.

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
