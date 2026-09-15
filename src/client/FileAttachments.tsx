import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import type { ComponentType, ReactNode } from 'react'
import { Button, IconCloseOutline16, Modal } from '@deepseek-ai/dsh-client-ui-primitives'
import { DropOverlay } from '@deepseek-ai/dsh-client-ui-attachment'
import type { ComposerAttachmentsProps } from '@deepseek-ai/dsh-client-ui-conversation/client'
import type { PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type { ExtractedFile, FileAttachmentStore } from './FileAttachmentStore.ts'
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
}

export interface FileAttachmentRailInjected {
  files: FileAttachmentStore
  remove(ref: string): void
}

export type FileAttachButtonProps = PropsRuntime<'conversation.input.left'> & FileAttachButtonInjected
export type FileAttachmentRailProps = Pick<PropsRuntime<'conversation.input.attachments'>, 'sessionId' | 'useInput'> & FileAttachmentRailInjected
export type OcrComposerAttachmentsProps = ComposerAttachmentsProps & FileAttachmentRailInjected & {
  /** Native ComposerAttachments shadowed at priority 0. */
  NativeAttachments?: ComponentType<ComposerAttachmentsProps>
}

export function fileKindClass(kind: string): 'pdf' | 'image' | 'word' | 'excel' | 'powerpoint' | 'text' | 'generic' {
  switch (kind.toLowerCase()) {
    case 'pdf': return 'pdf'
    case 'image': return 'image'
    case 'word': return 'word'
    case 'excel': return 'excel'
    case 'powerpoint': return 'powerpoint'
    case 'text':
    case 'html': return 'text'
    default: return 'generic'
  }
}

/** Neutral document glyph shared by composer and sent attachment cards. */
export function FileIcon({ size = 16 }: { size?: number }): ReactNode {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3.5 1.75h5.2l3.8 3.8v8.7H3.5V1.75Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M8.5 1.9v3.9h3.8M5.5 8h5M5.5 10.5h5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

type ImageHandleMode = 'vision' | 'ocr'

/** Add common local files through the generic extraction endpoint. */
export function FileAttachButton({ attach, attachImage }: FileAttachButtonProps): ReactNode {
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
    try {
      const useVision = imageMode === 'vision' && attachImage !== undefined
      for (const file of selected) {
        if (file.type.startsWith('image/') && useVision) {
          await attachImage(file)
          continue
        }
        const response = await fetch(ENDPOINT, {
          method: 'POST',
          headers: {
            'content-type': file.type || 'application/octet-stream',
            'x-dsh-file-name': encodeURIComponent(file.name),
          },
          body: file,
        })
        const value = await response.json() as ExtractResponse | { error: string }
        if (!response.ok) throw new Error('error' in value ? value.error : `文件解析失败 / File parsing failed（${response.status}）`)
        if (!('text' in value) || !('kind' in value)) throw new Error('文件解析响应不完整 / File parsing response is incomplete.')
        attach(file, value)
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason))
    } finally {
      busyRef.current = false
      setBusy(false)
    }
  }

  const upload = (selected: File[]): void => {
    if (selected.length === 0 || busyRef.current) return
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
    const onDragEnter = (event: globalThis.DragEvent): void => {
      if (!hasFiles(event)) return
      event.preventDefault()
      event.stopImmediatePropagation()
      dragDepth.current += 1
      setDragActive(true)
    }
    const onDragOver = (event: globalThis.DragEvent): void => {
      if (!hasFiles(event) || event.dataTransfer === null) return
      event.preventDefault()
      event.stopImmediatePropagation()
      event.dataTransfer.dropEffect = busyRef.current ? 'none' : 'copy'
    }
    const onDragLeave = (event: globalThis.DragEvent): void => {
      if (!hasFiles(event)) return
      event.preventDefault()
      event.stopImmediatePropagation()
      dragDepth.current = Math.max(0, dragDepth.current - 1)
      if (dragDepth.current === 0) setDragActive(false)
      const leavingViewport = event.clientX <= 0 || event.clientY <= 0
        || event.clientX >= window.innerWidth || event.clientY >= window.innerHeight
      if ((event.target === document.documentElement || event.target === document.body) && leavingViewport) reset()
    }
    const onDrop = (event: globalThis.DragEvent): void => {
      if (!hasFiles(event)) return
      event.preventDefault()
      event.stopImmediatePropagation()
      reset()
      if (!busyRef.current && pendingFiles === null) upload([...(event.dataTransfer?.files ?? [])])
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
        onClick={() => { picker.current?.click() }}
      >
        <FileIcon size={16} />
      </button>
      {error !== null && <span className={css.error} role="alert">{error}</span>}
      {dragActive && (
        <DropOverlay
          disabled={busy}
          labels={{
            title: busy ? '正在添加文件 / Adding files' : '拖放文件以上传 / Drop files to upload',
            desc: busy ? undefined : '支持 PDF、图片、Word、Excel、PPT 和文本文件 / PDF, images, Word, Excel, PPT, and text files',
          }}
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
              <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                <path d="M2.5 8s2.2-3.5 5.5-3.5S13.5 8 13.5 8s-2.2 3.5-5.5 3.5S2.5 8 2.5 8Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
                <circle cx="8" cy="8" r="1.6" stroke="currentColor" strokeWidth="1.3" />
              </svg>
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
              <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                <path d="M3.5 2.5h6l3 3v8h-9v-11Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
                <path d="M9.5 2.6v3h3M5.5 8.5h5M5.5 11h3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
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

function fileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.ceil(bytes / 1024)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

/** Render extracted files as removable cards inside the composer attachments area. */
export function FileAttachmentRail({ sessionId, useInput, files, remove }: FileAttachmentRailProps): ReactNode {
  const occurrences = useInput(state => state?.occurrences ?? [])
  const phase = useInput(state => state?.phase)
  const snapshot = useSyncExternalStore(
    listener => (sessionId === undefined ? () => undefined : files.subscribe(sessionId, listener)),
    () => (sessionId === undefined ? EMPTY_FILES : files.get(sessionId)),
  )
  const activeRefs = useMemo(
    () => new Set(occurrences.filter(item => item.source === FILE_SOURCE).map(item => item.ref)),
    [occurrences],
  )
  const active = sessionId === undefined ? EMPTY_FILES : snapshot.filter(file => activeRefs.has(file.ref))
  const refKey = [...activeRefs].join('\u0000')

  useEffect(() => {
    if (sessionId === undefined || phase === 'submitting') return
    const timer = setTimeout(() => { files.retain(sessionId, activeRefs) }, 1_000)
    return () => clearTimeout(timer)
  }, [activeRefs, files, phase, refKey, sessionId])

  if (sessionId === undefined || active.length === 0) return null
  return (
    <div className={css.rail} aria-label="已添加的文件 / Added files">
      {active.map((file: ExtractedFile) => (
        <div key={file.ref} className={css.card}>
          <span className={`${css.fileIcon} ${css[fileKindClass(file.kind)]}`}><FileIcon size={16} /></span>
          <span className={css.details}>
            <span className={css.name} title={file.name}>{file.name}</span>
            <span className={css.size}>{fileSize(file.size)}</span>
          </span>
          <button type="button" className={css.remove} aria-label={`移除 / Remove ${file.name}`} onClick={() => { remove(file.ref) }}>
            <IconCloseOutline16 size={14} />
          </button>
        </div>
      ))}
    </div>
  )
}

const EMPTY_FILES: readonly ExtractedFile[] = []

/**
 * Shadow `conversation.input.attachments`: keep native image drafts, and place
 * OCR/file cards in the same in-composer rail instead of the outer dock.
 */
export function OcrComposerAttachments({
  NativeAttachments,
  files,
  remove,
  sessionId,
  useInput,
  ...nativeProps
}: OcrComposerAttachmentsProps): ReactNode {
  return (
    <>
      {NativeAttachments !== undefined && <NativeAttachments {...nativeProps} sessionId={sessionId} useInput={useInput} />}
      <FileAttachmentRail sessionId={sessionId} useInput={useInput} files={files} remove={remove} />
    </>
  )
}
