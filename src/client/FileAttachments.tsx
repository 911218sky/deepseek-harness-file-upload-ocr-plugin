import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import type { ChangeEvent, ReactNode } from 'react'
import { IconCloseOutline16 } from '@deepseek-ai/dsh-client-ui-primitives'
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
}

export interface FileAttachmentRailInjected {
  files: FileAttachmentStore
  remove(ref: string): void
}

export type FileAttachButtonProps = PropsRuntime<'conversation.input.left'> & FileAttachButtonInjected
export type FileAttachmentRailProps = PropsRuntime<'conversation.input.dock'> & FileAttachmentRailInjected

/** Neutral document glyph shared by composer and sent attachment cards. */
export function FileIcon({ size = 16 }: { size?: number }): ReactNode {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3.5 1.75h5.2l3.8 3.8v8.7H3.5V1.75Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M8.5 1.9v3.9h3.8M5.5 8h5M5.5 10.5h5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/** Add common local files through the generic extraction endpoint. */
export function FileAttachButton({ attach }: FileAttachButtonProps): ReactNode {
  const picker = useRef<HTMLInputElement | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const upload = async (event: ChangeEvent<HTMLInputElement>): Promise<void> => {
    const selected = [...(event.target.files ?? [])]
    event.target.value = ''
    if (selected.length === 0) return
    setBusy(true)
    setError(null)
    try {
      for (const file of selected) {
        const response = await fetch(ENDPOINT, {
          method: 'POST',
          headers: {
            'content-type': file.type || 'application/octet-stream',
            'x-dsh-file-name': encodeURIComponent(file.name),
          },
          body: file,
        })
        const value = await response.json() as ExtractResponse | { error: string }
        if (!response.ok) throw new Error('error' in value ? value.error : `文件解析失败（${response.status}）`)
        if (!('text' in value) || !('kind' in value)) throw new Error('文件解析响应不完整。')
        attach(file, value)
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason))
    } finally {
      setBusy(false)
    }
  }

  return (
    <span className={css.buttonRoot}>
      <input ref={picker} className={css.hidden} type="file" accept={ACCEPT} multiple onChange={(event) => { void upload(event) }} />
      <button
        type="button"
        className={css.attachButton}
        disabled={busy}
        aria-label="添加文件"
        aria-busy={busy}
        title={error ?? '添加文件'}
        onClick={() => { picker.current?.click() }}
      >
        <FileIcon size={16} />
      </button>
      {error !== null && <span className={css.error} role="alert">{error}</span>}
    </span>
  )
}

function fileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.ceil(bytes / 1024)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

/** Render extracted files as removable cards above the composer. */
export function FileAttachmentRail({ sessionId, input, files, remove }: FileAttachmentRailProps): ReactNode {
  const snapshot = useSyncExternalStore(
    listener => files.subscribe(sessionId, listener),
    () => files.get(sessionId),
  )
  const activeRefs = useMemo(
    () => new Set(input.occurrences.filter(item => item.source === FILE_SOURCE).map(item => item.ref)),
    [input.occurrences],
  )
  const active = snapshot.filter(file => activeRefs.has(file.ref))
  const refKey = [...activeRefs].join('\u0000')

  useEffect(() => {
    if (input.phase === 'submitting') return
    const timer = setTimeout(() => { files.retain(sessionId, activeRefs) }, 1_000)
    return () => clearTimeout(timer)
  }, [activeRefs, files, input.phase, refKey, sessionId])

  if (active.length === 0) return null
  return (
    <div className={css.rail} aria-label="已添加的文件">
      {active.map((file: ExtractedFile) => (
        <div key={file.ref} className={css.card}>
          <span className={css.fileIcon}><FileIcon size={16} /></span>
          <span className={css.details}>
            <span className={css.name} title={file.name}>{file.name}</span>
            <span className={css.size}>{fileSize(file.size)}</span>
          </span>
          <button type="button" className={css.remove} aria-label={`移除 ${file.name}`} onClick={() => { remove(file.ref) }}>
            <IconCloseOutline16 size={14} />
          </button>
        </div>
      ))}
    </div>
  )
}
