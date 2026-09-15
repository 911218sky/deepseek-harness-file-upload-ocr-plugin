import type { SessionId } from '@deepseek-ai/dsh-session/types'

const EMPTY_FILES: readonly ExtractedFile[] = []

export interface ExtractedFile {
  ref: string
  name: string
  size: number
  kind: string
  text: string
}

/** Browser-only extracted-file payload registry keyed by session and reference id. */
export class FileAttachmentStore {
  private readonly sessions = new Map<SessionId, readonly ExtractedFile[]>()
  private readonly byRef = new Map<string, ExtractedFile>()
  private readonly listeners = new Map<SessionId, Set<() => void>>()

  get(sessionId: SessionId): readonly ExtractedFile[] {
    return this.sessions.get(sessionId) ?? EMPTY_FILES
  }

  find(ref: string): ExtractedFile | undefined {
    return this.byRef.get(ref)
  }

  subscribe(sessionId: SessionId, listener: () => void): () => void {
    const listeners = this.listeners.get(sessionId) ?? new Set<() => void>()
    listeners.add(listener)
    this.listeners.set(sessionId, listeners)
    return () => {
      listeners.delete(listener)
      if (listeners.size === 0) this.listeners.delete(sessionId)
    }
  }

  add(sessionId: SessionId, file: ExtractedFile): void {
    this.byRef.set(file.ref, file)
    this.sessions.set(sessionId, [...this.get(sessionId), file])
    this.emit(sessionId)
  }

  remove(sessionId: SessionId, ref: string): void {
    const next = this.get(sessionId).filter(file => file.ref !== ref)
    if (next.length === this.get(sessionId).length) return
    this.byRef.delete(ref)
    if (next.length === 0) this.sessions.delete(sessionId)
    else this.sessions.set(sessionId, next)
    this.emit(sessionId)
  }

  retain(sessionId: SessionId, refs: ReadonlySet<string>): void {
    const current = this.get(sessionId)
    const next = current.filter(file => refs.has(file.ref))
    if (next.length === current.length) return
    for (const file of current) {
      if (!refs.has(file.ref)) this.byRef.delete(file.ref)
    }
    if (next.length === 0) this.sessions.delete(sessionId)
    else this.sessions.set(sessionId, next)
    this.emit(sessionId)
  }

  clear(): void {
    this.sessions.clear()
    this.byRef.clear()
    for (const listeners of this.listeners.values()) {
      for (const listener of listeners) listener()
    }
    this.listeners.clear()
  }

  private emit(sessionId: SessionId): void {
    for (const listener of this.listeners.get(sessionId) ?? []) listener()
  }
}
