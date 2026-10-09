//#region src/client/detectCoords.ts
/**
* Fold a clipboard-projection offset to detect coordinates.
* Each chip contributes `length` clipboard chars but only one U+FFFC detect char.
*/
function clipboardToDetectOffset(occurrences, clipboardOffset) {
	let detect = clipboardOffset;
	for (const occurrence of occurrences) {
		if (occurrence.offset >= clipboardOffset) continue;
		detect -= Math.max(0, occurrence.length - 1);
	}
	return detect < 0 ? 0 : detect;
}
/**
* `slash/input-insert-reference` spans use **detect** coordinates (each chip is
* one U+FFFC). `InputState.draft` / occurrence offsets use the longer clipboard
* expansion — `draft.length` as the insert point fails once any reference chip
* (including a prior OCR file) already exists.
*/
function detectAppendSpan(snapshot) {
	const end = clipboardToDetectOffset(snapshot.occurrences, snapshot.draft.length);
	return {
		start: end,
		end,
		draftRev: snapshot.draftRev
	};
}
/**
* Detect span that deletes one chip (and its trailing separator space when
* present). Prefer this over `setDraft(...)` — setDraft rebuilds plain text
* only and removes every remaining reference chip.
*/
function detectChipRemoveSpan(snapshot, occurrence) {
	const start = clipboardToDetectOffset(snapshot.occurrences, occurrence.offset);
	let end = start + 1;
	if (snapshot.draft[occurrence.offset + occurrence.length] === " ") end += 1;
	return {
		start,
		end,
		draftRev: snapshot.draftRev
	};
}
//#endregion
export { clipboardToDetectOffset, detectAppendSpan, detectChipRemoveSpan };
