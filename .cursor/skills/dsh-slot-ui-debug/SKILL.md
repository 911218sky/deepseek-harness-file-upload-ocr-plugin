---
name: dsh-slot-ui-debug
description: >-
  Guides evidence-first debugging for DeepSeek Harness Cordis slot UI that
  mounts but shows nothing (abdication, stale client build, unstable useInput
  selectors, post-upgrade API breaks). Use when plugin cards/rails vanish while
  API returns 200, conversation.input.* slots stay empty, or UI disappears after
  a DSH bump. Do not use for pure CSS polish when cards already render, or when
  the API itself fails.
---

# DSH slot UI debug — method

When a Cordis client plugin “works” (button, fetch, store) but the user sees no
UI, **classify the failing layer** before changing CSS or rewriting features.

## Core technique

Answer three questions with evidence:

| Layer | Question | Pass looks like |
|-------|----------|-----------------|
| **A. Backend** | Did the API succeed? | `POST /api/...` 200 + non-empty body |
| **B. Model/store** | Did attach write state + draft ref? | store row, `\uFEFF` chip, or `data-composer-chip` |
| **C. Presentation** | Is our slot entry still live and rendering? | plugin marker in DOM / non-empty `[data-slot="…"]` |

**Decision rule**

- A fail → fix host/endpoint/runtime
- B fail → fix inject/`attach`/reference insert (not CSS)
- A+B pass, C fail → **abdication / render crash / stale bundle**
- A+B+C pass but cards flash then vanish → retain/`discardPending` logic

**B-pass is the key teaching trick:** hidden `\uFEFF` / `data-composer-chip` with
**no** rail means attach worked and **only presentation is broken**.

Never start at layout/CSS until A/B/C are classified.

## Why abdication looks like “UI never existed”

Single slots: lowest `priority` wins. If the winner throws during render, Cordis
**abdicates** it and shows the next occupant until a full reload of a fixed
bundle.

**Fiber walk (prove C):** inspect Fiber under
`[data-slot="conversation.input.attachments"]` (or your slot). If the occupant
is only the native component (e.g. `ComposerAttachments`) and your wrapper is
absent → abdication, not “empty store.” The button slot can still work because
it is a **different** entry.

## Repo map (this plugin)

- Register/inject: `src/client/index.ts`
- Rail UI: `src/client/FileAttachments.tsx`
- Store: `src/client/FileAttachmentStore.ts`
- Build: `rm -rf lib && pnpm exec tsdown` then
  `grep -n 'MARKER' lib/client.js` (tsdown `clean: false` often keeps stale JS)
- Serve: DSH web plugin combo URL containing `dsh-file-upload-ocr-plugin`

## Method: bisect the crashing render

1. Clean rebuild; prove marker string exists in `lib/client.js`.
2. Replace suspect body with a static marker; hard reload:

```tsx
return <div data-ocr-rail="1">OCR-RAIL-DEBUG</div>
```

| Result | Meaning |
|--------|---------|
| Marker shows | Register OK; crash is inside hooks/JSX |
| Marker missing | Register/priority/inject broken, or still serving stale JS |

3. Re-add in this order (after marker shows):

   1. Store subscribe only (`useSyncExternalStore`) — OK?
   2. `useInput(s => s?.phase)` — OK?
   3. `useInput(s => s?.occurrences ?? [])` — if loop/abdicate → **BAD**
   4. Fix: `const input = useInput(s => s)` + module-level `EMPTY_*` const
   5. Card markup without icons, then icons from **current** primitives

### Stable selector rule

```ts
// BAD — new [] every snapshot → infinite loop → abdicate
useInput(s => s?.occurrences ?? [])

// GOOD
const input = useInput(s => s)
const occurrences = input?.occurrences ?? EMPTY_OCCURRENCES
```

Never allocate fresh empties inside selector lambdas unless the fallback is a
stable module constant.

## Cleanup rule (not empty-draft)

Do **not** call `discardPending` / wipe cards just because the text draft is
empty while OCR is still `extracting`. Empty draft ≠ safe to clear in-flight
work. Discard pending on submit boundary (`phase === 'submitting'`), then
`retain` to draft refs after send.

## Browser verification

1. Prove **loaded** bundle: find performance URL with the plugin id; `fetch`;
   assert it `includes` your marker / new API name / note `rev=`.
2. Hard reload after every rebuild (`?cb=` or Ctrl+Shift+R).
3. If CDP `DOM.setFileInputFiles` is blocked, use `DataTransfer` + `change` on
   the plugin `<input type=file>`.
4. Assert timeline: pending label → ready `N KB · kind` → slot HTML non-empty.

## Worked example

Cards missing, `POST /api/file-extract` = 200:

1. Confirm response body → **A pass**
2. Draft has `\uFEFF` / file chip → **B pass** (fix attach, not CSS)
3. Attachments slot Fiber = native only → **C abdication**
4. `rm -rf lib && pnpm exec tsdown`; static marker; hard reload
5. Marker OK → bisect `useInput` as above; marker missing → register/stale JS
6. Prove loaded JS contains the fix string; confirm pending → ready cards

## On any DSH client bump

1. Read native seat in installed
   `node_modules/@deepseek-ai/dsh-client-ui-conversation` /
   `dsh-client-ui-attachment` (how InputBar renders attachments).
2. Diff primitives exports (icons renamed across versions).
3. Drop proven-dead compatibility seats (legacy dual dock+attachments rails).

## Known good patterns (this seat)

- Shadow `conversation.input.attachments` at `priority: -10`; wrap native at `0`
- Inject `ocrSessionId` (not `sessionId`) so session-maybe merges cannot wipe it
- Show store `pending` + `ready`; cleanup on submitting, not empty draft
- Icons: `IconCloseOutlineRegular` (not removed `IconCloseOutline16`)

## Anti-patterns

- Tweaking CSS while slot `innerHTML` is empty
- Editing `src/` without grepping the new string in `lib/client.js`
- Keeping legacy dual rails after the in-composer seat works
- Field-level `useInput` with `?? []` / `?? {}`
- `discardPending` on empty draft while status is `extracting`
