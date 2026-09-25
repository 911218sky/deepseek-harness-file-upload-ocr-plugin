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

  clearErrorPending(sessionId) {
    const next = this.getPending(sessionId).filter(row => row.status !== 'error')
    if (next.length === 0) this.pending.delete(sessionId)
    else this.pending.set(sessionId, next)
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

/** DSH 0.1.7: rail lists store rows; draft refs only drive retain/cleanup. */
function visibleCards(ready, pending) {
  if (ready.length === 0 && pending.length === 0) return []
  return [...pending.map(p => p.id), ...ready.map(f => f.ref)]
}

const store = new FileAttachmentStore()
const session = 's1'
const file = { ref: 'r1', name: 'a.pdf', size: 1, kind: 'pdf', text: 'x' }

store.add(session, file)
assert.deepEqual(visibleCards(store.get(session), store.getPending(session)), ['r1'])

// After send: retain() clears store; UI hides cards.
store.retain(session, new Set())
assert.equal(store.get(session).length, 0)
assert.deepEqual(visibleCards(store.get(session), store.getPending(session)).length, 0)

// OCR in progress with empty text draft: pending card stays visible.
const pendingId = store.beginExtract(session, { name: 'scan.pdf' })
assert.equal(visibleCards(store.get(session), store.getPending(session)).length, 1)

// User sends before OCR finishes: discard in-flight pending only.
store.discardPending(session)
assert.equal(store.hasPending(session, pendingId), false)
assert.deepEqual(visibleCards(store.get(session), store.getPending(session)).length, 0)

// Stale error cards cleared before retry.
store.beginExtract(session, { name: 'bad.jpg' })
store.failExtract = function failExtract(sessionId, id, error) {
  const next = this.getPending(sessionId).map(row => (
    row.id === id ? { ...row, status: 'error', error } : row
  ))
  this.pending.set(sessionId, next)
}
store.failExtract(session, store.getPending(session)[0].id, 'image file is truncated (1 bytes not processed)')
assert.equal(store.getPending(session).length, 1)
store.clearErrorPending(session)
assert.equal(store.getPending(session).length, 0)

console.log('ui-retain-logic-ok')
