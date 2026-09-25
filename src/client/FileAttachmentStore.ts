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
  private readonly controllers = new Map<string, AbortController>()
  private readonly listeners = new Map<SessionId, Set<() => void>>()
  private readonly globalListeners = new Set<() => void>()
  /** Last session touched by extract/attach — used when `conversation.input.attachments` inject omits sessionId. */
  private activeSessionId: SessionId | undefined
  private generation = 0
  private gcTimer: ReturnType<typeof setTimeout> | null = null

  getActiveSessionId(): SessionId | undefined {
    return this.activeSessionId
  }

  getGeneration(): number {
    return this.generation
  }

  get(sessionId: SessionId): readonly ExtractedFile[] {
    return this.sessions.get(sessionId) ?? EMPTY_READY
  }

  getPending(sessionId: SessionId): readonly PendingFile[] {
    return this.pending.get(sessionId) ?? EMPTY_PENDING
  }

  find(ref: string): ExtractedFile | undefined {
    return this.byRef.get(ref)
  }

  /** AbortSignal for an in-flight extract (cancelled on remove / clearPending). */
  signalFor(id: string): AbortSignal | undefined {
    return this.controllers.get(id)?.signal
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

  /** Subscribe to any store change (including activeSessionId). */
  subscribeGlobal(listener: () => void): () => void {
    this.globalListeners.add(listener)
    return () => { this.globalListeners.delete(listener) }
  }

  beginExtract(sessionId: SessionId, file: File): string {
    const id = crypto.randomUUID()
    const row: PendingFile = {
      id,
      name: file.name,
      size: file.size,
      status: 'extracting',
    }
    this.controllers.set(id, new AbortController())
    this.pending.set(sessionId, [...this.getPending(sessionId), row])
    this.touch(sessionId)
    return id
  }

  failExtract(sessionId: SessionId, id: string, error: string): void {
    this.releaseController(id, false)
    const next = this.getPending(sessionId).map(row => (
      row.id === id ? { ...row, status: 'error' as const, error } : row
    ))
    this.pending.set(sessionId, next)
    this.touch(sessionId)
  }

  hasPending(sessionId: SessionId, id: string): boolean {
    return this.getPending(sessionId).some(row => row.id === id)
  }

  clearPending(sessionId: SessionId, id: string): void {
    this.releaseController(id, true)
    const next = this.getPending(sessionId).filter(row => row.id !== id)
    if (next.length === this.getPending(sessionId).length) return
    if (next.length === 0) this.pending.delete(sessionId)
    else this.pending.set(sessionId, next)
    this.touch(sessionId)
  }

  /**
   * Drop stale *error* cards only. In-flight OCR must survive send/commit so a
   * sibling file still extracting is not silently abandoned mid-fetch.
   */
  clearErrorPending(sessionId: SessionId): void {
    const current = this.getPending(sessionId)
    const next = current.filter(row => row.status !== 'error')
    if (next.length === current.length) return
    if (next.length === 0) this.pending.delete(sessionId)
    else this.pending.set(sessionId, next)
    this.touch(sessionId)
  }

  /**
   * @deprecated Prefer {@link clearErrorPending} on send. Kept for tests /
   * explicit cancel-all; aborts every in-flight extract for the session.
   */
  discardPending(sessionId: SessionId): void {
    for (const row of this.getPending(sessionId)) this.releaseController(row.id, true)
    if (this.getPending(sessionId).length === 0) return
    this.pending.delete(sessionId)
    this.touch(sessionId)
  }

  add(sessionId: SessionId, file: ExtractedFile): void {
    this.byRef.set(file.ref, file)
    this.sessions.set(sessionId, [...this.get(sessionId), file])
    this.touch(sessionId)
  }

  remove(sessionId: SessionId, ref: string): void {
    const pendingNext = this.getPending(sessionId).filter(row => row.id !== ref)
    if (pendingNext.length !== this.getPending(sessionId).length) {
      this.releaseController(ref, true)
      if (pendingNext.length === 0) this.pending.delete(sessionId)
      else this.pending.set(sessionId, pendingNext)
      this.touch(sessionId)
      return
    }
    const next = this.get(sessionId).filter(file => file.ref !== ref)
    if (next.length === this.get(sessionId).length) return
    this.byRef.delete(ref)
    if (next.length === 0) this.sessions.delete(sessionId)
    else this.sessions.set(sessionId, next)
    this.touch(sessionId)
  }

  /**
   * Align visible ready rows with draft OCR refs (DSH commitSend / restoreAttachments).
   * Does **not** drop payloads from `byRef` — ordinary send serializes chips after
   * commit-draft clears the editor, and failed sends restore chips from the same refs.
   */
  retain(sessionId: SessionId, refs: ReadonlySet<string>): void {
    const current = this.get(sessionId)
    const next: ExtractedFile[] = []
    const seen = new Set<string>()
    for (const file of current) {
      if (!refs.has(file.ref) || seen.has(file.ref)) continue
      next.push(file)
      seen.add(file.ref)
    }
    for (const ref of refs) {
      if (seen.has(ref)) continue
      const file = this.byRef.get(ref)
      if (file === undefined) continue
      next.push(file)
      seen.add(ref)
    }
    if (next.length === current.length && next.every((file, index) => file.ref === current[index]?.ref)) return
    if (next.length === 0) this.sessions.delete(sessionId)
    else this.sessions.set(sessionId, next)
    this.touch(sessionId)
  }

  /** Drop payloads that are no longer shown in any session (after a successful clear settles). */
  gcPayloads(): void {
    const live = new Set<string>()
    for (const rows of this.sessions.values()) {
      for (const file of rows) live.add(file.ref)
    }
    let changed = false
    for (const ref of [...this.byRef.keys()]) {
      if (live.has(ref)) continue
      this.byRef.delete(ref)
      changed = true
    }
    if (changed) this.generation += 1
  }

  /**
   * Schedule payload GC on the store (survives React effect cleanup).
   * Re-scheduling extends the window so failed-restore can rehydrate first.
   */
  scheduleGc(delayMs = 1_500): void {
    if (this.gcTimer !== null) clearTimeout(this.gcTimer)
    this.gcTimer = setTimeout(() => {
      this.gcTimer = null
      this.gcPayloads()
    }, delayMs)
  }

  clear(): void {
    if (this.gcTimer !== null) {
      clearTimeout(this.gcTimer)
      this.gcTimer = null
    }
    for (const id of [...this.controllers.keys()]) this.releaseController(id, true)
    this.sessions.clear()
    this.pending.clear()
    this.byRef.clear()
    this.activeSessionId = undefined
    this.generation += 1
    for (const listeners of this.listeners.values()) {
      for (const listener of listeners) listener()
    }
    this.listeners.clear()
    for (const listener of this.globalListeners) listener()
  }

  private releaseController(id: string, abort: boolean): void {
    const controller = this.controllers.get(id)
    if (controller === undefined) return
    this.controllers.delete(id)
    if (abort && !controller.signal.aborted) controller.abort()
  }

  private touch(sessionId: SessionId): void {
    this.activeSessionId = sessionId
    this.generation += 1
    for (const listener of this.listeners.get(sessionId) ?? []) listener()
    for (const listener of this.globalListeners) listener()
  }
}
