/** Clipboard ↔ detect coordinate helpers for Lexical reference chips. */

export type OccurrenceSlice = {
  offset: number
  length: number
}

export type DraftSnapshot = {
  draft: string
  draftRev: number
  occurrences: readonly OccurrenceSlice[]
}

/**
 * Fold a clipboard-projection offset to detect coordinates.
 * Each chip contributes `length` clipboard chars but only one U+FFFC detect char.
 */
export function clipboardToDetectOffset(
  occurrences: readonly OccurrenceSlice[],
  clipboardOffset: number,
): number {
  let detect = clipboardOffset
  for (const occurrence of occurrences) {
    if (occurrence.offset >= clipboardOffset) continue
    detect -= Math.max(0, occurrence.length - 1)
  }
  return detect < 0 ? 0 : detect
}

/**
 * `slash/input-insert-reference` spans use **detect** coordinates (each chip is
 * one U+FFFC). `InputState.draft` / occurrence offsets use the longer clipboard
 * expansion — `draft.length` as the insert point fails once any reference chip
 * (including a prior OCR file) already exists.
 */
export function detectAppendSpan(snapshot: DraftSnapshot): {
  start: number
  end: number
  draftRev: number
} {
  const end = clipboardToDetectOffset(snapshot.occurrences, snapshot.draft.length)
  return { start: end, end, draftRev: snapshot.draftRev }
}

/**
 * Detect span that deletes one chip (and its trailing separator space when
 * present). Prefer this over `setDraft(...)` — setDraft rebuilds plain text
 * only and destroys every remaining reference chip.
 */
export function detectChipRemoveSpan(
  snapshot: DraftSnapshot,
  occurrence: OccurrenceSlice,
): { start: number; end: number; draftRev: number } {
  const start = clipboardToDetectOffset(snapshot.occurrences, occurrence.offset)
  let end = start + 1
  if (snapshot.draft[occurrence.offset + occurrence.length] === ' ') end += 1
  return { start, end, draftRev: snapshot.draftRev }
}
