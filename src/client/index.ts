/** Browser-side generic file attachment control for the conversation composer. */

import type { Context } from '@deepseek-ai/cordis'
import type { SessionId } from '@deepseek-ai/dsh-session/types'
import type {} from '@deepseek-ai/dsh-api-session-controller/client'
import type {} from '@deepseek-ai/dsh-client-ui-chat/client'
import type {
  ComposerAttachment,
  DraftAttachmentId,
} from '@deepseek-ai/dsh-client-ui-conversation/client'
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
import type { InputTriggerSource, ReferenceInsert } from '@deepseek-ai/dsh-client-ui-input-trigger/client'
import { FILE_SOURCE, FileAttachButton, createOcrComposerAttachments } from './FileAttachments.tsx'
import { FileAttachmentStore, type ExtractedFile } from './FileAttachmentStore.ts'
import { createOcrSteeringChatNode, createOcrUserChatNode } from './SentFileMessage.tsx'

export const inject = ['slots', 'sessions', 'conversation', 'inputTriggers']

/**
 * Invisible chip label. The composer still needs a Lexical reference occurrence
 * so codec.serialize runs on send, but the FileCard rail is the only visible UI.
 * Chips whose title is exactly this marker are hidden via CSS.
 */
const HIDDEN_CHIP_LABEL = '\uFEFF'

type OccurrenceSlice = {
  offset: number
  length: number
}

type DraftSnapshot = {
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

function ensureHiddenChipStyles(): void {
  if (typeof document === 'undefined') return
  const tagId = 'dsh-file-upload-ocr-hidden-reference-chip'
  if (document.getElementById(tagId) !== null) return
  const tag = document.createElement('style')
  tag.id = tagId
  tag.textContent = [
    `span[title=${JSON.stringify(HIDDEN_CHIP_LABEL)}]{`,
    'display:none!important;',
    '}',
  ].join('')
  document.head.appendChild(tag)
}

/** Conversation draft helpers present on the runtime service but not the narrow IConversation face. */
type ConversationDraftApi = {
  createDrafts(sessionId: SessionId, files: readonly File[]): readonly ComposerAttachment[]
  releaseDraftAttachments(attachments: readonly ComposerAttachment[]): void
}

/** Register generic file cards and their hidden model serializer. */
export function apply(ctx: Context): void {
  ensureHiddenChipStyles()
  const files = new FileAttachmentStore()
  const conversation = ctx.conversation as typeof ctx.conversation & ConversationDraftApi
  ctx.effect(() => () => { files.clear() }, 'file-input: extracted payloads')

  const source: InputTriggerSource = {
    trigger: '@',
    name: FILE_SOURCE,
    candidates: async () => [],
    onPick: () => undefined,
    codec: {
      clipboardText: (ref) => {
        const file = files.find(ref)
        if (file === undefined) throw new Error(`file-input: missing attachment ${ref}`)
        return `[文件 / File: ${file.name}]`
      },
      serialize: async (ref, signal) => {
        if (signal.aborted) throw signal.reason
        const file = files.find(ref)
        if (file === undefined) throw new Error(`file-input: missing attachment ${ref}`)
        return `<attached_file name=${JSON.stringify(file.name)} kind=${JSON.stringify(file.kind)} size=${file.size} chars=${file.text.length}>\n${file.text}\n</attached_file>`
      },
    },
  }
  ctx.effect(() => ctx.inputTriggers.registerSource(source), 'file-input: reference serializer')

  const scopedInput = (sessionId: SessionId) => {
    const actx = ctx.sessions.scope(sessionId)
    if (actx === undefined) throw new Error(`file-input: session ${String(sessionId)} has no scope`)
    return { actx, input: conversation.input.for(actx) }
  }

  const removeFor = (sessionId: SessionId | undefined) => (ref: string) => {
    const resolved = sessionId ?? files.getActiveSessionId()
    if (resolved === undefined) return
    const { actx, input } = scopedInput(resolved)
    const snapshot = input.state.getSnapshot()
    const occurrence = snapshot.occurrences.find(item => item.source === FILE_SOURCE && item.ref === ref)
    if (occurrence !== undefined) {
      // Delete the Lexical chip via detect coords. setDraft would flatten every
      // other reference (remaining OCR files, @-mentions) into plain text.
      actx.bail(actx, 'slash/input-insert-text', {
        text: '',
        span: detectChipRemoveSpan(snapshot, occurrence),
      })
    }
    files.remove(resolved, ref)
  }

  ctx.slots.inject('conversation.input.left', () => ctx.slots.register({
    name: 'conversation.input.left',
    id: 'file-input',
    order: 30,
    inject: (sessionId) => ({
      beginExtract: (browserFile: File) => files.beginExtract(sessionId, browserFile),
      extractSignal: (id: string) => files.signalFor(id),
      failExtract: (id: string, error: string) => { files.failExtract(sessionId, id, error) },
      clearPending: (id: string) => { files.clearPending(sessionId, id) },
      hasPending: (id: string) => files.hasPending(sessionId, id),
      resetUploadErrors: () => { files.clearErrorPending(sessionId) },
      attach: (browserFile: File, result: { kind: string; text: string }) => {
        const { actx, input } = scopedInput(sessionId)
        const snapshot = input.state.getSnapshot()
        if (snapshot.phase !== 'plain' && snapshot.phase !== 'claimed') {
          throw new Error('当前输入状态不能添加文件 / Files cannot be added in the current input state.')
        }
        const file: ExtractedFile = {
          ref: crypto.randomUUID(),
          name: browserFile.name,
          size: browserFile.size,
          kind: result.kind,
          text: result.text,
        }
        files.add(sessionId, file)
        const reference: ReferenceInsert = {
          source: FILE_SOURCE,
          ref: file.ref,
          label: HIDDEN_CHIP_LABEL,
          appearance: 'file',
          clipboardText: `[文件 / File: ${file.name}]`,
        }
        const accepted = actx.bail(actx, 'slash/input-insert-reference', {
          reference,
          span: detectAppendSpan(snapshot),
        }) === true
        if (!accepted) {
          files.remove(sessionId, file.ref)
          throw new Error('当前输入状态不能添加文件 / Files cannot be added in the current input state.')
        }
      },
      attachImage: async (browserFile: File) => {
        const { input } = scopedInput(sessionId)
        const drafts = conversation.createDrafts(sessionId, [browserFile])
        if (drafts.length === 0) throw new Error('无法读取图片 / Unable to read image.')
        const accepted = input.addAttachments(drafts.map(draft => draft.id as DraftAttachmentId))
        if (!accepted) {
          conversation.releaseDraftAttachments(drafts)
          throw new Error('当前输入状态不能添加图片 / Images cannot be added in the current input state.')
        }
      },
    }),
  }, FileAttachButton))

  const OcrComposerAttachments = createOcrComposerAttachments(ctx)
  ctx.slots.inject('conversation.input.attachments', () => ctx.slots.register({
    name: 'conversation.input.attachments',
    locale: 'conversation',
    priority: -10,
    inject: (sessionId: SessionId | undefined) => ({
      files,
      ocrSessionId: sessionId,
      remove: removeFor(sessionId),
    }),
  }, OcrComposerAttachments))

  const OcrUserChatNode = createOcrUserChatNode(ctx)
  const OcrSteeringChatNode = createOcrSteeringChatNode(ctx)
  ctx.slots.inject('conversation.chat.node', () => ctx.slots.register({
    name: 'conversation.chat.node',
    key: 'user',
    priority: -10,
  }, OcrUserChatNode))
  ctx.slots.inject('conversation.chat.node', () => ctx.slots.register({
    name: 'conversation.chat.node',
    key: 'steering',
    priority: -10,
  }, OcrSteeringChatNode))
}
