import type { SessionId } from '@deepseek-ai/dsh-session/types'

const EMPTY_READY: readonly ExtractedFile[] = []
const EMPTY_PENDING: readonly PendingFile[] = []

export interface ExtractedFile {
  ref: string
  name: string
  size: number
  kind: string
  text: string
}

export interface PendingFile {
  id: string
  name: string
  size: number
  status: 'extracting' | 'error'
  error?: string
}

/** Browser-only extracted-file payload registry keyed by session and reference id. */
export class FileAttachmentStore {
  private readonly sessions = new Map<SessionId, readonly ExtractedFile[]>()
  private readonly pending = new Map<SessionId, readonly PendingFile[]>()
  private readonly byRef = new Map<string, ExtractedFile>()
  private readonly listeners = new Map<SessionId, Set<() => void>>()

  get(sessionId: SessionId): readonly ExtractedFile[] {
    return this.sessions.get(sessionId) ?? EMPTY_READY
  }

  getPending(sessionId: SessionId): readonly PendingFile[] {
    return this.pending.get(sessionId) ?? EMPTY_PENDING
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

  beginExtract(sessionId: SessionId, file: File): string {
    const id = crypto.randomUUID()
    const row: PendingFile = {
      id,
      name: file.name,
      size: file.size,
      status: 'extracting',
    }
    this.pending.set(sessionId, [...this.getPending(sessionId), row])
    this.emit(sessionId)
    return id
  }

  failExtract(sessionId: SessionId, id: string, error: string): void {
    const next = this.getPending(sessionId).map(row => (
      row.id === id ? { ...row, status: 'error' as const, error } : row
    ))
    this.pending.set(sessionId, next)
    this.emit(sessionId)
  }

  clearPending(sessionId: SessionId, id: string): void {
    const next = this.getPending(sessionId).filter(row => row.id !== id)
    if (next.length === this.getPending(sessionId).length) return
    if (next.length === 0) this.pending.delete(sessionId)
    else this.pending.set(sessionId, next)
    this.emit(sessionId)
  }

  add(sessionId: SessionId, file: ExtractedFile): void {
    this.byRef.set(file.ref, file)
    this.sessions.set(sessionId, [...this.get(sessionId), file])
    this.emit(sessionId)
  }

  remove(sessionId: SessionId, ref: string): void {
    const pendingNext = this.getPending(sessionId).filter(row => row.id !== ref)
    if (pendingNext.length !== this.getPending(sessionId).length) {
      if (pendingNext.length === 0) this.pending.delete(sessionId)
      else this.pending.set(sessionId, pendingNext)
      this.emit(sessionId)
      return
    }
    const next = this.get(sessionId).filter(file => file.ref !== ref)
    if (next.length === this.get(sessionId).length) return
    this.byRef.delete(ref)
    if (next.length === 0) this.sessions.delete(sessionId)
    else this.sessions.set(sessionId, next)
    this.emit(sessionId)
  }

  retain(sessionId: SessionId, refs: ReadonlySet<string>): void {
    const current = this.get(sessionId)
    // Avoid wiping ready cards when the maybe-input hook briefly reports no occurrences.
    if (refs.size === 0 && current.length > 0) return
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
    this.pending.clear()
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
