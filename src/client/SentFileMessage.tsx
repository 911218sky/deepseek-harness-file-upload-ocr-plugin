import { memo } from 'react'
import type { ComponentType, ReactNode } from 'react'
import type { Context } from '@deepseek-ai/cordis'
import type { ImageAttachmentRef } from '@deepseek-ai/dsh-attachment'
import { FileTypeIcon, fileExtension, fileSizeText } from '@deepseek-ai/dsh-client-ui-primitives'
import type { PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import css from './SentFileMessage.module.css'

interface SentAttachment {
  name: string
  kind: string
  size?: number
}

const HEADER = /<attached_file name=("(?:\\.|[^"\\])*") kind=("(?:\\.|[^"\\])*") size=(\d+) chars=(\d+)>\n/g
const LEGACY = /<attached_file name=("(?:\\.|[^"\\])*") kind=("(?:\\.|[^"\\])*")>\n[\s\S]*?\n<\/attached_file>/g
const CLOSE = '\n</attached_file>'

/** Strip `<attached_file>` payloads from durable text; return cards + visible remainder. */
export function projectAttachedFiles(text: string): { text: string; files: SentAttachment[] } {
  const files: SentAttachment[] = []
  let visible = ''
  let cursor = 0
  HEADER.lastIndex = 0
  let match: RegExpExecArray | null
  while ((match = HEADER.exec(text)) !== null) {
    const chars = Number(match[4])
    const contentEnd = HEADER.lastIndex + chars
    if (text.slice(contentEnd, contentEnd + CLOSE.length) !== CLOSE) {
      // Malformed length — keep the matched header in the bubble and keep scanning.
      visible += text.slice(cursor, match.index + match[0].length)
      cursor = match.index + match[0].length
      HEADER.lastIndex = cursor
      continue
    }
    visible += text.slice(cursor, match.index)
    files.push({
      name: JSON.parse(match[1]!) as string,
      kind: JSON.parse(match[2]!) as string,
      size: Number(match[3]),
    })
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

function OcrFileCards({ files }: { files: readonly SentAttachment[] }): ReactNode {
  if (files.length === 0) return null
  return (
    <div className={css.files} data-ocr-sent-files="1">
      {files.map((file, index) => (
        <div className={css.card} key={`${file.name}:${index}`}>
          <span className={css.icon} aria-hidden="true"><FileTypeIcon path={file.name} /></span>
          <span className={css.details}>
            <span className={css.name} title={file.name}>{file.name}</span>
            <span className={css.meta}>
              {[
                fileExtension(file.name).toUpperCase().slice(0, 8) || file.kind.toUpperCase(),
                file.size !== undefined ? fileSizeText(file.size) : '',
              ].filter(Boolean).join(' · ')}
            </span>
          </span>
        </div>
      ))}
    </div>
  )
}

type UserChatProps = PropsRuntime<'conversation.chat.node', 'user'>
type SteeringChatProps = PropsRuntime<'conversation.chat.node', 'steering'>

function rewriteNodeContent<T extends UserChatProps | SteeringChatProps>(
  props: T,
): { props: T; files: SentAttachment[] } {
  const content = props.node.data.content as readonly {
    type: string
    text?: string
    attachment?: ImageAttachmentRef
  }[]
  const files: SentAttachment[] = []
  const nextContent = content.map((block) => {
    if (block.type !== 'text' || block.text === undefined) return block
    const projected = projectAttachedFiles(block.text)
    files.push(...projected.files)
    if (projected.text === block.text) return block
    return { ...block, text: projected.text }
  })
  if (files.length === 0) return { props, files }
  return {
    files,
    props: {
      ...props,
      node: {
        ...props.node,
        data: {
          ...props.node.data,
          content: nextContent,
        },
      },
    },
  }
}

function FallbackUserBubble({ node, renderMessageImages }: UserChatProps | SteeringChatProps): ReactNode {
  const texts: string[] = []
  const images: { attachment: ImageAttachmentRef }[] = []
  for (const block of node.data.content as readonly { type: string; text?: string; attachment?: ImageAttachmentRef }[]) {
    if (block.type === 'text' && block.text !== undefined) texts.push(block.text)
    else if (block.type === 'image' && block.attachment !== undefined) images.push({ attachment: block.attachment })
  }
  const projected = projectAttachedFiles(texts.join(''))
  return (
    <div className={css.row}>
      <div className={css.stack}>
        {images.length > 0 && renderMessageImages({
          images,
          align: 'end',
          compact: images.length > 1,
        })}
        <OcrFileCards files={projected.files} />
        {projected.text !== '' && <div className={css.bubble}>{projected.text}</div>}
      </div>
    </div>
  )
}

/**
 * Wrap native `UserMessageNodeView` (priority 0) so projectUserText / actions /
 * locale stay on DSH; only strip OCR tags and render OCR file cards.
 */
export function createOcrUserChatNode(ctx: Context): ComponentType<UserChatProps> {
  function OcrUserChatNode(props: UserChatProps): ReactNode {
    const Native = ctx.slots.entries('conversation.chat.node')
      .find(entry => (
        entry.options.key === 'user'
        && entry.component !== OcrUserChatNode
        && (entry.options.priority ?? 0) === 0
      ))
      ?.component as ComponentType<UserChatProps> | undefined
    const { props: next, files } = rewriteNodeContent(props)
    if (Native === undefined) return <FallbackUserBubble {...props} />
    return (
      <div className={css.wrap}>
        <OcrFileCards files={files} />
        <Native {...next} />
      </div>
    )
  }
  return memo(OcrUserChatNode)
}

/** Steering equivalent of {@link createOcrUserChatNode}. */
export function createOcrSteeringChatNode(ctx: Context): ComponentType<SteeringChatProps> {
  function OcrSteeringChatNode(props: SteeringChatProps): ReactNode {
    const Native = ctx.slots.entries('conversation.chat.node')
      .find(entry => (
        entry.options.key === 'steering'
        && entry.component !== OcrSteeringChatNode
        && (entry.options.priority ?? 0) === 0
      ))
      ?.component as ComponentType<SteeringChatProps> | undefined
    const { props: next, files } = rewriteNodeContent(props)
    if (Native === undefined) return <FallbackUserBubble {...props} />
    return (
      <div className={css.wrap}>
        <OcrFileCards files={files} />
        <Native {...next} />
      </div>
    )
  }
  return memo(OcrSteeringChatNode)
}

/** @deprecated Prefer createOcrUserChatNode — kept for type imports in tests. */
export const SentUserFileMessage = memo(function SentUserFileMessage(props: UserChatProps): ReactNode {
  return <FallbackUserBubble {...props} />
})

/** @deprecated Prefer createOcrSteeringChatNode. */
export const SentSteeringFileMessage = memo(function SentSteeringFileMessage(props: SteeringChatProps): ReactNode {
  return <FallbackUserBubble {...props} />
})
