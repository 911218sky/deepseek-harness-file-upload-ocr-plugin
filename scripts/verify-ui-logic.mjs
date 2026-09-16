import assert from 'node:assert/strict'

class FileAttachmentStore {
  sessions = new Map()
  pending = new Map()
  byRef = new Map()

  get(sessionId) {
    return this.sessions.get(sessionId) ?? []
  }

  getPending(sessionId) {
    return this.pending.get(sessionId) ?? []
  }

  add(sessionId, file) {
    this.byRef.set(file.ref, file)
    this.sessions.set(sessionId, [...this.get(sessionId), file])
  }

  beginExtract(sessionId, file) {
    const id = crypto.randomUUID()
    this.pending.set(sessionId, [...this.getPending(sessionId), { id, name: file.name, status: 'extracting' }])
    return id
  }

  hasPending(sessionId, id) {
    return this.getPending(sessionId).some(row => row.id === id)
  }

  clearPending(sessionId, id) {
    const next = this.getPending(sessionId).filter(row => row.id !== id)
    if (next.length === 0) this.pending.delete(sessionId)
    else this.pending.set(sessionId, next)
  }

  discardPending(sessionId) {
    this.pending.delete(sessionId)
  }

  retain(sessionId, refs) {
    const current = this.get(sessionId)
    const next = current.filter(file => refs.has(file.ref))
    if (next.length === current.length) return
    for (const file of current) {
      if (!refs.has(file.ref)) this.byRef.delete(file.ref)
    }
    if (next.length === 0) this.sessions.delete(sessionId)
    else this.sessions.set(sessionId, next)
  }
}

function visibleCards(ready, pending, activeRefs) {
  const active = ready.filter(file => activeRefs.has(file.ref))
  if (active.length === 0 && pending.length === 0) return []
  return [...pending.map(p => p.id), ...active.map(f => f.ref)]
}

const store = new FileAttachmentStore()
const session = 's1'
const file = { ref: 'r1', name: 'a.pdf', size: 1, kind: 'pdf', text: 'x' }

store.add(session, file)
assert.deepEqual(visibleCards(store.get(session), store.getPending(session), new Set(['r1'])), ['r1'])

// After send: occurrences cleared, draft empty -> UI shows nothing.
assert.deepEqual(visibleCards(store.get(session), store.getPending(session), new Set()).length, 0)

// retain() clears orphaned store rows.
store.retain(session, new Set())
assert.equal(store.get(session).length, 0)

// OCR still running when user sends: discard pending so cards do not reappear.
const pendingId = store.beginExtract(session, { name: 'scan.pdf' })
assert.equal(visibleCards(store.get(session), store.getPending(session), new Set()).length, 1)
store.discardPending(session)
assert.equal(store.hasPending(session, pendingId), false)
assert.deepEqual(visibleCards(store.get(session), store.getPending(session), new Set()).length, 0)

console.log('ui-retain-logic-ok')
