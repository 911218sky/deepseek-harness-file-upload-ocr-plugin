import { memo, useState } from 'react'
import type { ReactNode } from 'react'
import type { ImageAttachmentRef } from '@deepseek-ai/dsh-attachment'
import { ImageGallery } from '@deepseek-ai/dsh-client-ui-attachment'
import type { PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import { FileIcon, fileKindClass } from './FileAttachments.tsx'
import css from './SentFileMessage.module.css'

interface SentAttachment {
  name: string
  kind: string
  size?: number
}

const HEADER = /<attached_file name=("(?:\\.|[^"\\])*") kind=("(?:\\.|[^"\\])*") size=(\d+) chars=(\d+)>\n/g
const LEGACY = /<attached_file name=("(?:\\.|[^"\\])*") kind=("(?:\\.|[^"\\])*")>\n[\s\S]*?\n<\/attached_file>/g
const CLOSE = '\n</attached_file>'

function project(text: string): { text: string; files: SentAttachment[] } {
  const files: SentAttachment[] = []
  let visible = ''
  let cursor = 0
  HEADER.lastIndex = 0
  let match: RegExpExecArray | null
  while ((match = HEADER.exec(text)) !== null) {
    const chars = Number(match[4])
    const contentEnd = HEADER.lastIndex + chars
    if (text.slice(contentEnd, contentEnd + CLOSE.length) !== CLOSE) break
    visible += text.slice(cursor, match.index)
    files.push({ name: JSON.parse(match[1]!) as string, kind: JSON.parse(match[2]!) as string, size: Number(match[3]) })
    cursor = contentEnd + CLOSE.length
    HEADER.lastIndex = cursor
  }
  visible += text.slice(cursor)
  visible = visible.replace(LEGACY, (_whole, rawName: string, rawKind: string) => {
    files.push({ name: JSON.parse(rawName) as string, kind: JSON.parse(rawKind) as string })
    return ''
  })
  return { text: visible.replace(/\n{3,}/g, '\n\n').trim(), files }
}

function fileSize(bytes: number | undefined): string {
  if (bytes === undefined) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.ceil(bytes / 1024)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

function CopyButton({ text }: { text: string }): ReactNode {
  const [copied, setCopied] = useState(false)
  if (text === '') return null
  return (
    <button
      type="button"
      className={css.copy}
      onClick={() => {
        void navigator.clipboard.writeText(text).then(() => {
          setCopied(true)
          window.setTimeout(() => { setCopied(false) }, 1_200)
        })
      }}
    >
      {copied ? '已复制 / Copied' : '复制 / Copy'}
    </button>
  )
}

function SentFileMessage({ content, loadImage }: {
  content: readonly { type: string; text?: string; attachment?: ImageAttachmentRef }[]
  loadImage: (attachment: ImageAttachmentRef) => Promise<string>
}): ReactNode {
  const texts: string[] = []
  const images: { attachment: ImageAttachmentRef }[] = []
  const rest: unknown[] = []
  for (const block of content) {
    if (block.type === 'text' && block.text !== undefined) texts.push(block.text)
    else if (block.type === 'image' && block.attachment !== undefined) images.push({ attachment: block.attachment })
    else rest.push(block)
  }
  const projected = project(texts.join(''))
  const copyText = [projected.text, ...projected.files.map(file => `[文件 / File: ${file.name}]`)].filter(Boolean).join('\n')
  return (
    <div className={css.row}>
      <div className={css.stack}>
        <ImageGallery
          images={images}
          load={loadImage}
          align="end"
          labels={{
            image: '图片 / Image', open: '查看原图 / View original', openNamed: name => `查看 / View ${name}`, loading: '加载中 / Loading', loadFailed: '加载失败，点击重试 / Failed to load; click to retry',
            lightbox: { dialog: '图片预览 / Image preview', close: '关闭 / Close' },
          }}
        />
        {projected.files.length > 0 && (
          <div className={css.files}>
            {projected.files.map((file, index) => (
              <div className={css.card} key={`${file.name}:${index}`}>
                <span className={`${css.icon} ${css[fileKindClass(file.kind)]}`}><FileIcon size={18} /></span>
                <span className={css.details}>
                  <span className={css.name} title={file.name}>{file.name}</span>
                  <span className={css.meta}>{[file.kind.toUpperCase(), fileSize(file.size)].filter(Boolean).join(' · ')}</span>
                </span>
              </div>
            ))}
          </div>
        )}
        {projected.text !== '' && <div className={css.bubble}>{projected.text}</div>}
        {rest.map((block, index) => <pre className={css.extra} key={index}>{JSON.stringify(block, null, 2)}</pre>)}
      </div>
      <CopyButton text={copyText} />
    </div>
  )
}

/** Durable user-message projection: model sees extracted text, transcript shows cards. */
export const SentUserFileMessage = memo(function SentUserFileMessage({ node, loadImage }: PropsRuntime<'conversation.chat.node', 'user'>): ReactNode {
  return <SentFileMessage content={node.data.content} loadImage={loadImage} />
})

/** Steering-message equivalent of the durable user projection. */
export const SentSteeringFileMessage = memo(function SentSteeringFileMessage({ node, loadImage }: PropsRuntime<'conversation.chat.node', 'steering'>): ReactNode {
  return <SentFileMessage content={node.data.content} loadImage={loadImage} />
})
