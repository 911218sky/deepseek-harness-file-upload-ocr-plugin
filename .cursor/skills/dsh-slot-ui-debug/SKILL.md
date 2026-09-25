---
name: dsh-slot-ui-debug
description: >-
  Maintain and debug dsh-file-upload-ocr-plugin against DeepSeek Harness Cordis
  slots: where-to-start A/B/C classification, prefer thin DSH adapters, clear
  OCR rail after send (plain commit-draft vs submitting), abdication, and
  post-bump retarget. Use when cards/rails are missing, stick after send, vanish
  while extracting, API 200 but no UI, or after a DSH client bump. Do not use
  for pure CSS polish when cards already render correctly.
---

# DSH OCR plugin — maintain & debug

Goal: keep this plugin a **thin adapter** on DSH, and when UI breaks, know
**where to start** (layer) before editing.

## How to maintain this project (longevity)

DSH changes often. Do **not** grow a parallel composer. Own only OCR domain +
glue into current DSH seats/APIs.

| Prefer (DSH) | Keep custom (small) |
|--------------|---------------------|
| Slots: `conversation.input.left`, `conversation.input.attachments`, `conversation.chat.node` | OCR host `/api/file-extract` + `$DSH_HOME/ocr-runtime` |
| `inputTriggers` + hidden `\uFEFF` ref + codec → `<attached_file>` | `FileAttachmentStore` (text payloads are not native drafts) |
| Vision: `createDrafts` / `addAttachments` | Pending/ready rail chrome until DSH exports `FileCard` |
| Primitives: `FileTypeIcon`, `fileExtension`, `fileSizeText`, `writeClipboard`, icons, `Modal` | Thin drop mask (DropOverlay not exported) |
| Wrap native attachments occupant | — |
| Chat images: `renderMessageImages` from node props | Sent-message file cards for OCR text tags |

**On every DSH client bump**

1. Read how native InputBar mounts attachments / left controls / chat nodes.
2. Diff `@deepseek-ai/dsh-client-ui-primitives` exports (icons rename/remove).
3. Retarget inject + imports; delete dead dual seats (no legacy dock).
4. Re-run A→B→C and the after-send check below.
5. Never deep-import non-exported `FileCard` / `DropOverlay` / `ImageGallery`.

**Privacy:** never commit private hosts, tokens, or user workspace paths into
this repo / skill / commits. Use `127.0.0.1` or env vars (`DSH_WEB_URL`) in
scripts/docs only.

## Debug: where to start (A → B → C)

```
user action → API / host          (A. Backend)
           → store + draft ref    (B. Model)
           → slot component JSX   (C. Presentation)
```

Repro: hard-reload → upload (plugin `<input type=file>` with OCR accept, or
`DataTransfer` + `change`) → then classify:

| Layer | Pass looks like | Fail → open |
|-------|-----------------|-------------|
| **A** | `POST /api/file-extract` 200 + non-empty body | host `src/index.ts`, OCR runtime |
| **B** | store row and/or hidden `\uFEFF` chip / `data-composer-chip` | `src/client/index.ts` attach, `FileAttachmentStore.ts` |
| **C** | `[data-ocr-rail="1"]` mounted (or Fiber shows our wrapper) | `FileAttachments.tsx`, slot inject, loaded bundle |

**Teaching trick:** B present + no rail ⇒ only C (abdication / crash / stale
JS). Do not blame OCR or tweak CSS first.

### Abdication (C)

Single slots: lowest `priority` wins. Render throw ⇒ Cordis retires the entry
until hard reload of a fixed bundle. Prove: console throw; DOM missing
`[data-ocr-rail="1"]`; Fiber native-only. Do **not** hunt for `[data-slot]`.

### Stable `useInput` (any version)

```ts
// BAD — new [] every check → loop → abdicate
useInput(s => s?.occurrences ?? [])

// GOOD
const input = useInput(s => s)
const occurrences = input?.occurrences ?? EMPTY_OCCURRENCES  // module const
```

## Debug: cards stick after send (C lifecycle)

Native draft images clear because `attachments[]` empties / `releaseDraftAttachment`.
OCR cards live in **our store**, driven by draft **OCR refs** — must mirror that.

**Critical DSH fact:** ordinary chat send often uses `beginDetached` and stays
`phase === 'plain'`. Claimed/slash paths use `submitting`. **Do not clear only
on `submitting`** or cards stick after normal send.

**Known-good clear (this plugin):**

1. On `phase === 'submitting'`: `discardPending` + `retain(session, ocrRefs)`.
2. When OCR refs go **non-empty → empty** (`hadRefs && !hasRefs`): same retain
   (covers plain commit-draft and user chip delete).
3. After that clear, delay `gcPayloads()` so serialize / failed-restore can still
   `find(ref)` briefly (like native release timing).
4. Never `retain(empty)` on idle when refs were **never** present (attach race:
   store row before chip lands).

**Verify after-send:**

1. Ready card visible in `[data-ocr-rail="1"]`.
2. Send message.
3. Assert rail gone / empty within ~1s; transcript may still show sent file card
   (that is `SentFileMessage`, not the composer rail).

Unit mirror: `node scripts/verify-ui-logic.mjs` (plain-send + submitting races).

## Repair C (missing UI) — order

1. Console for throw.
2. `rm -rf lib && pnpm run build` (`tsdown`, `clean: false`). Hard reload.
3. Grep **browser-served** combo JS (URL containing `dsh-file-upload-ocr-plugin`)
   for fix string (`hadRefs`, `gcPayloads`, icon name, …).
4. Static marker in rail → then bisect hooks/JSX/primitives.
5. Prefer current primitives over custom glyphs.

## File map (this repo)

| Concern | Path |
|---------|------|
| Host / OCR API | `src/index.ts`, `scripts/setup-ocr.*`, `$DSH_HOME/ocr-runtime` |
| Slot register / attach / hidden chip | `src/client/index.ts` |
| Store + retain / gc | `src/client/FileAttachmentStore.ts` |
| Rail + clear logic | `src/client/FileAttachments.tsx` |
| Sent projection | `src/client/SentFileMessage.tsx` |
| Logic tests | `scripts/verify-ui-logic.mjs` |

Seat example (re-verify after bumps): shadow `conversation.input.attachments` at
`priority: -10`; wrap native at `0`.

## Anti-patterns

- CSS while rail marker absent
- Blaming OCR when B chip/ref exists
- Editing `src/` without proving string in loaded Network JS
- Clearing only on `submitting` (misses plain send)
- `retain(empty)` wiping cards during attach-before-chip
- Growing docks / parallel composers; importing non-exported ui-attachment UI
- Committing private hosts, tokens, or personal paths

## Minimal worked passes

**Missing cards, API 200:** A body → B chip/store → C marker/Fiber → build →
bisect `useInput`/icons → prove served JS.

**Cards stick after send:** note phase stays `plain` → confirm refs emptied →
`hadRefs && !hasRefs` path + `gcPayloads` → assert `[data-ocr-rail]` gone;
transcript card OK.
