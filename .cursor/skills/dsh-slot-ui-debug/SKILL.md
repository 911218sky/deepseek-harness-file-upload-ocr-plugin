---
name: dsh-slot-ui-debug
description: >-
  Where-to-start playbook when DeepSeek Harness Cordis slot UI is missing,
  empty, or vanished after a DSH bump: classify A/B/C (API → store/ref →
  presentation) with evidence, then fix only the failing layer. Use for plugin
  cards/rails that do not show, conversation.input.* looking empty, or
  “upload works but no UI.” Classic only-C signal: API 200 + hidden draft chip
  but no rail. Do not use for pure CSS polish when cards already render.
---

# DSH slot UI debug — where to start

Goal: learn a **navigation concept**, not a version’s icon names. Name the
failing layer first; only then open that layer’s files.

## Pipeline (durable across DSH versions)

```
user action → API / host          (A. Backend)
           → store + draft ref    (B. Model)
           → slot component JSX   (C. Presentation)
```

## Do these three, in order

Repro first: hard-reload the client, trigger upload (file picker or
`DataTransfer` + `change` on the plugin `<input type=file>`), then:

1. **A** — Network: `POST /api/...` status **and** response body non-empty?
   Fail → fix host / OCR runtime / route. Stop.
2. **B** — Store row and/or draft ref present?
   - Example B signals (this plugin): label `\uFEFF` chip (CSS hides
     `span[title=\uFEFF]`), and/or DSH `data-composer-chip`, and/or a row in
     `FileAttachmentStore`.
   Fail → fix `attach` / inject / reference insert. Do not touch CSS. Stop.
3. **C** — Our rail/wrapper actually mounted?
   - Example C signal (this plugin): DOM `[data-ocr-rail="1"]`.
   - Or Fiber: under the attachments seat, is **our** wrapper present, or only
     the native occupant (e.g. `ComposerAttachments`)?
   Fail → abdication / render crash / stale bundle (next section). Stop.

**Teaching trick:** B signals present + no rail ⇒ **A+B passed; only C is
broken.** That is the usual “keeps not fixing” trap (people blame OCR or CSS).

| Layer fails | Open | Do not open first |
|-------------|------|-------------------|
| A | host route, OCR/runtime, network | React / CSS |
| B | store, attach, reference insert | layout |
| C | slot inject, rail JSX, loaded JS | “maybe OCR broke” |

After any fix, re-walk A→B→C once.

## Once A fails / Once B fails

**A:** Confirm body (not just HTTP 200). Check OCR env / setup scripts / host
`src/index.ts` extract route. Restart web profile if runtime just installed.

**B:** Confirm attach wrote store + draft ref. Read inject/`attach` in
`src/client/index.ts` and store APIs in `FileAttachmentStore.ts`. Missing chip
with API OK ⇒ insert path broken, not presentation.

## Why C fails while A+B look fine (abdication)

Single Cordis slots: **lowest `priority` wins**. If that occupant throws during
render, Cordis **abdicates** (retires) it and shows the next occupant for the
rest of that registration’s life — usually until hard reload of a fixed bundle
(or remount/re-register). Button/API/store can still work (other entries).

**Prove C (actionable):**

1. Console: any render throw / undefined component from the plugin bundle?
2. DOM: query **your** marker (read current marker from rail JSX; this plugin:
   `[data-ocr-rail="1"]`). Missing after a successful B ⇒ C.
3. Do **not** hunt for `[data-slot]` — DSH does not reliably emit that attribute.
4. Fiber (optional): attachments seat shows only native name ⇒ abdicated.

**Lifecycle subtype (still C):** cards flash then vanish while `extracting` →
cleanup/retain bug, not abdication. See known-good cleanup below.

## How to repair C (only after A+B pass)

1. **Console** for the throw that caused abdication.
2. **Prove loaded bundle** — `rm -rf lib && pnpm run build` (this repo:
   `tsdown`, `clean: false`). Hard reload. Grep **browser-served** plugin JS
   (Network URL containing the plugin id) for your fix string / `rev=`.
3. **Static marker** — temporary dead HTML in the rail. Shows ⇒ register OK,
   crash inside hooks/JSX. Missing ⇒ check inject/`priority` in
   `src/client/index.ts`, or still stale JS.
4. **Bisect render** — re-add: store subscribe → safe `useInput` → markup →
   icons from **current** primitives exports.
5. On bumps: diff how native InputBar mounts attachments today; do not reuse
   prior seat names or removed icons.

### Stable selector rule (any version)

```ts
// BAD — new [] every check → loop → abdicate
useInput(s => s?.occurrences ?? [])

// GOOD
const input = useInput(s => s)
const occurrences = input?.occurrences ?? EMPTY_OCCURRENCES  // module const
```

## Version upgrades — same map, new answers

A→B→C never changes. What changes: slot/seat wiring, primitives exports,
canonical seat (drop dead dual rails once the live seat works). Re-read native
mount + diff primitives, then re-run the three checks.

## Prefer DSH glue (longevity)

DSH can change a lot. Fix **adapters** (which slot, which primitive, which
native wrapper), not a second composer. Prefer official seats, `inputTriggers`,
native `createDrafts`/`addAttachments`, and current primitives. Keep custom
code to OCR extract + text-ref store/rail/codec. If C fails after a bump,
first ask: “Are we still connected to the live DSH seat?” before redesigning
cards.

## This plugin’s file map (examples only)

| Layer | Look in |
|-------|---------|
| A | `src/index.ts`, OCR setup scripts / `$DSH_HOME/ocr-runtime` |
| B | `FileAttachmentStore.ts`, attach / chip insert in `src/client/index.ts` |
| C | slot inject in `src/client/index.ts`, rail in `FileAttachments.tsx` |

**Known good for current in-composer seat (re-verify after bumps):** shadow
`conversation.input.attachments` at `priority: -10` (native typically `0`).
Rail follows store `pending` + `ready`, not draft emptiness. Cleanup:
`discardPending` while `phase === 'submitting'` and no OCR refs; `retain` only
**after leaving** submitting with empty refs — never `retain`/wipe on empty
draft while `extracting` or idle empty draft.

## Anti-patterns

- CSS while the rail marker is absent (skipped A→B→C)
- Blaming OCR when a B chip/ref already exists
- Editing `src/` without proving the string in loaded Network JS
- Copying a prior DSH version’s icons or dock seat as the permanent answer
- Growing a parallel composer/dock instead of retargeting DSH slots/primitives
- Importing non-exported ui-attachment symbols (`FileCard`, `DropOverlay`, `ImageGallery`)

## Minimal worked pass

API 200, cards missing:

1. Hard reload → upload → body OK → **A pass**
2. `\uFEFF` chip / store row → **B pass** → do not touch attach
3. No `[data-ocr-rail="1"]` / Fiber native-only → **C**
4. Console throw? → clean build → marker → bisect `useInput`/icons → prove
   served JS → pending → ready cards
