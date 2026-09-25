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
import { SentSteeringFileMessage, SentUserFileMessage } from './SentFileMessage.tsx'

export const inject = ['slots', 'sessions', 'conversation', 'inputTriggers']

/**
 * Invisible chip label. The composer still needs a Lexical reference occurrence
 * so codec.serialize runs on send, but the FileCard rail is the only visible UI.
 * Chips whose title is exactly this marker are hidden via CSS.
 */
const HIDDEN_CHIP_LABEL = '\uFEFF'

function ensureHiddenChipStyles(): void {
  if (typeof document === 'undefined') return
  const tagId = 'dsh-file-upload-ocr-plugin/hidden-reference-chip'
  if (document.querySelector(`style[data-plugin-css=${JSON.stringify(tagId)}]`) !== null) return
  const tag = document.createElement('style')
  tag.dataset.plugin = 'dsh-file-upload-ocr-plugin'
  tag.dataset.pluginCss = tagId
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
    if (sessionId === undefined) return
    const { input } = scopedInput(sessionId)
    const snapshot = input.state.getSnapshot()
    const occurrence = snapshot.occurrences.find(item => item.source === FILE_SOURCE && item.ref === ref)
    if (occurrence !== undefined) {
      input.setDraft(
        snapshot.draft.slice(0, occurrence.offset)
        + snapshot.draft.slice(occurrence.offset + occurrence.length),
      )
    }
    files.remove(sessionId, ref)
  }

  ctx.slots.inject('conversation.input.left', () => ctx.slots.register({
    name: 'conversation.input.left',
    id: 'file-input',
    order: 30,
    inject: (sessionId) => ({
      beginExtract: (browserFile: File) => files.beginExtract(sessionId, browserFile),
      failExtract: (id: string, error: string) => { files.failExtract(sessionId, id, error) },
      clearPending: (id: string) => { files.clearPending(sessionId, id) },
      hasPending: (id: string) => files.hasPending(sessionId, id),
      resetUploadErrors: () => { files.clearErrorPending(sessionId) },
      attach: (browserFile: File, result: { kind: string; text: string }) => {
        const { actx, input } = scopedInput(sessionId)
        const snapshot = input.state.getSnapshot()
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
          span: { start: snapshot.draft.length, end: snapshot.draft.length, draftRev: snapshot.draftRev },
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

  ctx.slots.inject('conversation.chat.node', () => ctx.slots.register({
    name: 'conversation.chat.node',
    key: 'user',
    priority: -10,
  }, SentUserFileMessage))
  ctx.slots.inject('conversation.chat.node', () => ctx.slots.register({
    name: 'conversation.chat.node',
    key: 'steering',
    priority: -10,
  }, SentSteeringFileMessage))
}
