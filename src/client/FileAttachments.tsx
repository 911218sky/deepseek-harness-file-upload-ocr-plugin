import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import type { ComponentType, ReactNode } from 'react'
import type { Context } from '@deepseek-ai/cordis'
import {
  Button,
  FileTypeIcon,
  IconBrowseOutlineRegular,
  IconCloseFillRegular,
  IconPaperclipOutlineRegular,
  Modal,
  fileExtension,
  fileSizeText,
} from '@deepseek-ai/dsh-client-ui-primitives'
import type { ComposerAttachmentsProps } from '@deepseek-ai/dsh-client-ui-conversation/client'
import type { PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type { SessionId } from '@deepseek-ai/dsh-session/types'
import type { ExtractedFile, FileAttachmentStore, PendingFile } from './FileAttachmentStore.ts'
import css from './FileAttachments.module.css'

const ENDPOINT = '/api/file-extract'
const ACCEPT = '.pdf,.png,.jpg,.jpeg,.webp,.bmp,.tif,.tiff,.docx,.xlsx,.xlsm,.pptx,.txt,.md,.csv,.tsv,.json,.xml,.yaml,.yml,.html,.htm,.log,.py,.js,.ts,.tsx,.css'
export const FILE_SOURCE = 'file-attachment'

interface ExtractResponse {
  kind: string
  text: string
}

export interface FileAttachButtonInjected {
  attach(file: File, result: ExtractResponse): void
  attachImage?(file: File): Promise<void>
  beginExtract(file: File): string
  /** AbortSignal for the pending extract id (cancelled when the card is removed). */
  extractSignal(id: string): AbortSignal | undefined
  failExtract(id: string, error: string): void
  clearPending(id: string): void
  hasPending(id: string): boolean
  resetUploadErrors(): void
}

/** Map raw backend / Pillow errors to user-facing copy. */
export function formatExtractError(message: string): string {
  const lower = message.toLowerCase()
  if (lower.includes('ocr environment is not installed') || message.includes('OCR 环境未安装')) {
    return 'OCR 環境未安裝，請執行 scripts/setup-ocr.sh / OCR runtime missing — run setup-ocr.sh'
  }
  // Match Pillow truncate phrases only — do not remap unrelated "truncated" errors.
  if (
    lower.includes('image file is truncated')
    || lower.includes('truncated jpeg')
    || lower.includes('truncated png')
    || lower.includes('broken data stream when reading image file')
  ) {
    return '圖片不完整或已損壞，請重新儲存或換一張圖 / Image incomplete or corrupt — re-export or try another file'
  }
  if (lower.includes('cannot identify image file') || lower.includes('image is corrupt')) {
    return '無法讀取此圖片，請改用 PNG 或重新匯出 / Unreadable image — try PNG or re-export'
  }
  if (lower.includes('aborted') || lower.includes('abort')) {
    return '已取消辨識 / Extraction cancelled'
  }
  return message
}

export interface FileAttachmentRailInjected {
  files: FileAttachmentStore
  remove(ref: string): void
  /** Inject key avoids collision with slot standard `sessionId` merges (DSH 0.1.7 session-maybe). */
  ocrSessionId: SessionId | undefined
}

export type FileAttachButtonProps = PropsRuntime<'conversation.input.left'> & FileAttachButtonInjected
export type FileAttachmentRailProps = Pick<PropsRuntime<'conversation.input.attachments'>, 'useInput'> & FileAttachmentRailInjected
export type OcrComposerAttachmentsProps = ComposerAttachmentsProps & FileAttachmentRailInjected

type ImageHandleMode = 'vision' | 'ocr'

/**
 * Thin drop invitation. DSH's DropOverlay lives inside ui-attachment's client
 * bundle and is not a package export — keep a portal + tokens only.
 */
function DropMask({ disabled, title, desc }: { disabled: boolean; title: string; desc?: string }): ReactNode {
  if (typeof document === 'undefined') return null
  return createPortal(
    <div className={css.dropMask} role="status">
      <div className={css.dropWrap}>
        <div className={css.dropTitle}>{title}</div>
        {!disabled && desc !== undefined && <div className={css.dropDesc}>{desc}</div>}
      </div>
    </div>,
    document.body,
  )
}

/** Add common local files through the generic extraction endpoint. */
/** True when the drag payload clearly includes a non-image file we should OCR. */
function dragClaimsOcr(dataTransfer: DataTransfer): boolean {
  const items = [...dataTransfer.items]
  if (items.length === 0) return false
  return items.some((item) => {
    if (item.kind !== 'file') return false
    // Empty type during drag → treat as document (PDF etc.) so we claim OCR.
    if (item.type === '') return true
    return !item.type.startsWith('image/')
  })
}

export function FileAttachButton({
  attach,
  attachImage,
  beginExtract,
  extractSignal,
  failExtract,
  clearPending,
  hasPending,
  resetUploadErrors,
}: FileAttachButtonProps): ReactNode {
  const picker = useRef<HTMLInputElement | null>(null)
  const dragDepth = useRef(0)
  const busyRef = useRef(false)
  const [busy, setBusy] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pendingFiles, setPendingFiles] = useState<File[] | null>(null)

  const processFiles = async (selected: File[], imageMode: ImageHandleMode | null): Promise<void> => {
    if (selected.length === 0) return
    busyRef.current = true
    setBusy(true)
    setError(null)
    resetUploadErrors()
    let sawSuccess = false
    try {
      const useVision = imageMode === 'vision' && attachImage !== undefined
      for (const file of selected) {
        if (file.type.startsWith('image/') && useVision) {
          try {
            await attachImage(file)
            sawSuccess = true
            setError(null)
          } catch (reason) {
            setError(formatExtractError(reason instanceof Error ? reason.message : String(reason)))
          }
          continue
        }
        const pendingId = beginExtract(file)
        const signal = extractSignal(pendingId)
        try {
          const payload = await file.arrayBuffer()
          const response = await fetch(ENDPOINT, {
            method: 'POST',
            headers: {
              'content-type': file.type || 'application/octet-stream',
              'x-dsh-file-name': encodeURIComponent(file.name),
            },
            body: payload,
            signal,
          })
          let value: ExtractResponse | { error: string }
          try {
            value = await response.json() as ExtractResponse | { error: string }
          } catch {
            throw new Error(`文件解析失败 / File parsing failed（${response.status}）`)
          }
          if (!response.ok) {
            throw new Error('error' in value ? value.error : `文件解析失败 / File parsing failed（${response.status}）`)
          }
          if (!('text' in value) || !('kind' in value)) {
            throw new Error('文件解析响应不完整 / File parsing response is incomplete.')
          }
          if (!hasPending(pendingId)) continue
          attach(file, value)
          clearPending(pendingId)
          sawSuccess = true
          setError(null)
        } catch (reason) {
          if (signal?.aborted || (reason instanceof DOMException && reason.name === 'AbortError')) {
            clearPending(pendingId)
            continue
          }
          const message = formatExtractError(reason instanceof Error ? reason.message : String(reason))
          failExtract(pendingId, message)
          setError(message)
        }
      }
      if (sawSuccess) setError(null)
    } finally {
      busyRef.current = false
      setBusy(false)
    }
  }

  const upload = (selected: File[]): void => {
    if (selected.length === 0 || busyRef.current) return
    setError(null)
    const needsChoice = attachImage !== undefined && selected.some(file => file.type.startsWith('image/'))
    if (needsChoice) {
      setPendingFiles(selected)
      return
    }
    void processFiles(selected, null)
  }

  const chooseImageMode = (mode: ImageHandleMode): void => {
    const selected = pendingFiles
    setPendingFiles(null)
    if (selected === null) return
    void processFiles(selected, mode)
  }

  const cancelImageChoice = (): void => {
    setPendingFiles(null)
  }

  useEffect(() => {
    const hasFiles = (event: globalThis.DragEvent): boolean => event.dataTransfer?.types.includes('Files') ?? false
    const reset = (): void => {
      dragDepth.current = 0
      setDragActive(false)
    }
    // Capture only for document/OCR drops so pure-image drags reach native
    // bubble-phase DropOverlay / onAddFiles (ui-attachment).
    const onDragEnter = (event: globalThis.DragEvent): void => {
      if (!hasFiles(event) || event.dataTransfer === null || !dragClaimsOcr(event.dataTransfer)) return
      event.preventDefault()
      event.stopImmediatePropagation()
      dragDepth.current += 1
      setDragActive(true)
    }
    const onDragOver = (event: globalThis.DragEvent): void => {
      if (!hasFiles(event) || event.dataTransfer === null || !dragClaimsOcr(event.dataTransfer)) return
      event.preventDefault()
      event.stopImmediatePropagation()
      event.dataTransfer.dropEffect = busyRef.current ? 'none' : 'copy'
    }
    const onDragLeave = (event: globalThis.DragEvent): void => {
      if (!hasFiles(event) || event.dataTransfer === null || !dragClaimsOcr(event.dataTransfer)) return
      event.preventDefault()
      event.stopImmediatePropagation()
      dragDepth.current = Math.max(0, dragDepth.current - 1)
      if (dragDepth.current === 0) setDragActive(false)
      const leavingViewport = event.clientX <= 0 || event.clientY <= 0
        || event.clientX >= window.innerWidth || event.clientY >= window.innerHeight
      if ((event.target === document.documentElement || event.target === document.body) && leavingViewport) reset()
    }
    const onDrop = (event: globalThis.DragEvent): void => {
      if (!hasFiles(event) || event.dataTransfer === null) return
      const files = [...(event.dataTransfer.files ?? [])]
      const allImages = files.length > 0 && files.every(file => file.type.startsWith('image/'))
      // Pure image drops → native attachment intake (vision drafts).
      if (allImages && attachImage !== undefined) {
        reset()
        return
      }
      if (!dragClaimsOcr(event.dataTransfer) && allImages) {
        reset()
        return
      }
      event.preventDefault()
      event.stopImmediatePropagation()
      reset()
      if (!busyRef.current && pendingFiles === null) upload(files)
    }
    document.addEventListener('dragenter', onDragEnter, true)
    document.addEventListener('dragover', onDragOver, true)
    document.addEventListener('dragleave', onDragLeave, true)
    document.addEventListener('drop', onDrop, true)
    window.addEventListener('dragend', reset)
    return () => {
      document.removeEventListener('dragenter', onDragEnter, true)
      document.removeEventListener('dragover', onDragOver, true)
      document.removeEventListener('dragleave', onDragLeave, true)
      document.removeEventListener('drop', onDrop, true)
      window.removeEventListener('dragend', reset)
    }
  }, [attach, attachImage, pendingFiles])

  const pendingImageCount = pendingFiles?.filter(file => file.type.startsWith('image/')).length ?? 0

  return (
    <span className={css.buttonRoot}>
      <input ref={picker} className={css.hidden} type="file" accept={ACCEPT} multiple onChange={(event) => {
        const selected = [...(event.target.files ?? [])]
        event.target.value = ''
        upload(selected)
      }} />
      <button
        type="button"
        className={css.attachButton}
        disabled={busy || pendingFiles !== null}
        aria-label="添加文件 / Add file"
        aria-busy={busy}
        title={error ?? '添加文件 / Add file'}
        onClick={() => {
          setError(null)
          picker.current?.click()
        }}
      >
        <IconPaperclipOutlineRegular size={16} />
      </button>
      {error !== null && <span className={css.error} role="alert">{error}</span>}
      {dragActive && (
        <DropMask
          disabled={busy}
          title={busy ? '正在添加文件 / Adding files' : '拖放文件以上传 / Drop files to upload'}
          desc={busy ? undefined : '支持 PDF、图片、Word、Excel、PPT 和文本文件 / PDF, images, Word, Excel, PPT, and text files'}
        />
      )}
      <Modal
        open={pendingFiles !== null}
        onClose={cancelImageChoice}
        title="選擇圖片處理方式"
        closeLabel="關閉 / Close"
        description={`已選取 ${pendingImageCount} 張圖片。請手動選擇一種方式，不會自動套用。`}
        footer={(
          <Button variant="outline" onClick={cancelImageChoice}>
            取消
          </Button>
        )}
      >
        <div className={css.choiceList} role="listbox" aria-label="圖片處理方式">
          <button
            type="button"
            role="option"
            className={css.choiceCard}
            onClick={() => { chooseImageMode('vision') }}
          >
            <span className={`${css.choiceIcon} ${css.choiceIconVision}`} aria-hidden="true">
              <IconBrowseOutlineRegular size={18} />
            </span>
            <span className={css.choiceCopy}>
              <span className={css.choiceLabel}>直接提供原圖</span>
              <span className={css.choiceHint}>交給支援視覺的模型看圖</span>
            </span>
          </button>
          <button
            type="button"
            role="option"
            className={css.choiceCard}
            onClick={() => { chooseImageMode('ocr') }}
          >
            <span className={`${css.choiceIcon} ${css.choiceIconOcr}`} aria-hidden="true">
              <FileTypeIcon path="document.pdf" />
            </span>
            <span className={css.choiceCopy}>
              <span className={css.choiceLabel}>本機 OCR 轉文字</span>
              <span className={css.choiceHint}>在本機辨識後以文字附件送出</span>
            </span>
          </button>
        </div>
      </Modal>
    </span>
  )
}

const EMPTY_FILES: readonly ExtractedFile[] = []
const EMPTY_PENDING: readonly PendingFile[] = []
const EMPTY_OCCURRENCES: readonly { source: string; ref: string }[] = []

function Spinner(): ReactNode {
  return <span className={css.spinner} aria-hidden="true" />
}

function useOcrSessionId(injected: SessionId | undefined, files: FileAttachmentStore): SessionId | undefined {
  const active = useSyncExternalStore(
    listener => files.subscribeGlobal(listener),
    () => files.getActiveSessionId(),
  )
  return injected ?? active
}

function useSessionStoreSlice(
  files: FileAttachmentStore,
  session: SessionId | undefined,
): { ready: readonly ExtractedFile[]; pending: readonly PendingFile[] } {
  const ready = useSyncExternalStore(
    listener => (session !== undefined ? files.subscribe(session, listener) : () => {}),
    () => (session !== undefined ? files.get(session) : EMPTY_FILES),
  )
  const pending = useSyncExternalStore(
    listener => (session !== undefined ? files.subscribe(session, listener) : () => {}),
    () => (session !== undefined ? files.getPending(session) : EMPTY_PENDING),
  )
  return { ready, pending }
}

function truncateError(message: string): string {
  const formatted = formatExtractError((message.split('\n')[0] ?? message).trim())
  return formatted.length > 120 ? `${formatted.slice(0, 117)}…` : formatted
}

/**
 * OCR file cards in `conversation.input.attachments` (DSH 0.1.7 in-composer rail).
 * Visibility follows store rows (pending + ready), matching native draft attachments
 * that remain visible even when the text draft is empty. Card chrome mirrors native
 * FileCard (240×64) using exported primitives — FileCard itself is not package-exported.
 */
export function FileAttachmentRail({
  ocrSessionId,
  useInput,
  files,
  remove,
}: FileAttachmentRailProps): ReactNode {
  const session = useOcrSessionId(ocrSessionId, files)
  const { ready, pending } = useSessionStoreSlice(files, session)
  // One snapshot subscribe (same pattern as InputBar). Selecting `occurrences`
  // alone with `?? []` reallocates and abdicates the slot under DSH 0.1.7.
  const input = useInput(state => state)
  const phase = input?.phase
  const occurrences = input?.occurrences ?? EMPTY_OCCURRENCES
  const ocrRefs = useMemo(
    () => new Set(occurrences.filter(item => item.source === FILE_SOURCE).map(item => item.ref)),
    [occurrences],
  )
  const refKey = [...ocrRefs].join('\u0000')
  // Session-scoped so switching chats does not look like "chips just left".
  const prevRail = useRef<{ session: SessionId | undefined; refKey: string }>({
    session: undefined,
    refKey: '',
  })

  useEffect(() => {
    if (session === undefined) return

    const prev = prevRail.current
    const sessionChanged = prev.session !== undefined && prev.session !== session
    const hadRefs = !sessionChanged && prev.refKey !== ''
    const hasRefs = refKey !== ''
    prevRail.current = { session, refKey }

    // New session identity: sync ready rows if chips exist; never discardPending.
    if (sessionChanged) {
      if (hasRefs) files.retain(session, ocrRefs)
      return
    }

    const clearReadyCards = (): void => {
      // Keep in-flight OCR (sibling files); only drop stale error cards + ready rows.
      files.clearErrorPending(session)
      files.retain(session, ocrRefs)
      files.scheduleGc(1_500)
    }

    // Claimed/slash submits use `submitting`. Ordinary chat uses beginDetached and
    // stays `plain` — chips leave via commit-draft, so watch refs emptying instead.
    if (phase === 'submitting') {
      clearReadyCards()
      return
    }

    // Chips left the draft (send commit or user removed) → drop ready cards.
    // Keep byRef until serialize / failed-restore settle; GC on the store timer.
    if (hadRefs && !hasRefs) {
      clearReadyCards()
      return
    }

    // Idle empty: do not retain(empty) — protects attach race (store row before chip lands).
    if (!hasRefs) return
    // Immediate retain so failed-restore wins the race against scheduleGc(1.5s).
    files.retain(session, ocrRefs)
  }, [files, ocrRefs, phase, refKey, session])

  if (session === undefined || (ready.length === 0 && pending.length === 0)) return null

  return (
    <div className={css.composerRail} data-ocr-rail="1" aria-label="已添加的文件 / Added files">
      <div className={css.rail}>
        {pending.map((file: PendingFile) => (
          <div
            key={file.id}
            className={`${css.card} ${file.status === 'error' ? css.cardError : css.cardPending}`}
            aria-busy={file.status === 'extracting'}
          >
            <span className={css.fileIcon} aria-hidden="true">
              {file.status === 'extracting' ? <Spinner /> : <FileTypeIcon path={file.name} />}
            </span>
            <span className={css.details}>
              <span className={css.name} title={file.name}>{file.name}</span>
              <span className={css.size}>
                {file.status === 'extracting'
                  ? `OCR 辨識中… · ${fileSizeText(file.size)}`
                  : truncateError(file.error ?? '辨識失敗')}
              </span>
            </span>
            <button type="button" className={css.remove} aria-label={`移除 / Remove ${file.name}`} onClick={() => { remove(file.id) }}>
              <IconCloseFillRegular size={14} />
            </button>
          </div>
        ))}
        {ready.map((file: ExtractedFile) => (
          <div key={file.ref} className={css.card}>
            <span className={css.fileIcon} aria-hidden="true">
              <FileTypeIcon path={file.name} />
            </span>
            <span className={css.details}>
              <span className={css.name} title={file.name}>{file.name}</span>
              <span className={css.size}>
                {[
                  fileExtension(file.name).toUpperCase().slice(0, 8) || file.kind.toUpperCase(),
                  fileSizeText(file.size),
                ].filter(Boolean).join(' · ')}
              </span>
            </span>
            <button type="button" className={css.remove} aria-label={`移除 / Remove ${file.name}`} onClick={() => { remove(file.ref) }}>
              <IconCloseFillRegular size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

/** Compose native image/file attachments with OCR cards (DSH 0.1.7 `conversation.input.attachments`). */
export function createOcrComposerAttachments(ctx: Context): ComponentType<OcrComposerAttachmentsProps> {
  function OcrComposerAttachments({
    files,
    remove,
    ocrSessionId,
    useInput,
    ...nativeProps
  }: OcrComposerAttachmentsProps): ReactNode {
    const Native = ctx.slots.entries('conversation.input.attachments')
      .find(entry => (entry.options.priority ?? 0) === 0 && entry.component !== OcrComposerAttachments)
      ?.component as ComponentType<ComposerAttachmentsProps> | undefined

    return (
      <>
        {Native !== undefined && (
          <Native {...(nativeProps as ComposerAttachmentsProps)} useInput={useInput} />
        )}
        <FileAttachmentRail ocrSessionId={ocrSessionId} useInput={useInput} files={files} remove={remove} />
      </>
    )
  }
  return OcrComposerAttachments
}
