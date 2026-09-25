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
    const next = []
    const seen = new Set()
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
  }

  gcPayloads() {
    const live = new Set()
    for (const rows of this.sessions.values()) {
      for (const file of rows) live.add(file.ref)
    }
    for (const ref of [...this.byRef.keys()]) {
      if (!live.has(ref)) this.byRef.delete(ref)
    }
  }

  find(ref) {
    return this.byRef.get(ref)
  }
}

/** Mirror FileAttachmentRail cleanup (phase plain/submitting + draft refs). */
function syncRail(store, session, { phase, ocrRefs, prevRefKey }) {
  const refKey = [...ocrRefs].join('\u0000')
  const hadRefs = prevRefKey.current !== ''
  const hasRefs = refKey !== ''
  prevRefKey.current = refKey

  if (phase === 'submitting') {
    store.discardPending(session)
    store.retain(session, ocrRefs)
    return
  }
  if (hadRefs && !hasRefs) {
    store.discardPending(session)
    store.retain(session, ocrRefs)
    return
  }
  if (!hasRefs) return
  store.retain(session, ocrRefs)
}

function visibleCards(ready, pending) {
  if (ready.length === 0 && pending.length === 0) return []
  return [...pending.map(p => p.id), ...ready.map(f => f.ref)]
}

const store = new FileAttachmentStore()
const session = 's1'
const file = { ref: 'r1', name: 'a.pdf', size: 1, kind: 'pdf', text: 'x' }
const prevRefKey = { current: '' }

store.add(session, file)
assert.deepEqual(visibleCards(store.get(session), store.getPending(session)), ['r1'])

// Ordinary send (phase stays plain): refs go empty after commit-draft → rail clears.
prevRefKey.current = 'r1'
syncRail(store, session, { phase: 'plain', ocrRefs: new Set(['r1']), prevRefKey })
assert.equal(store.get(session).length, 1)
syncRail(store, session, { phase: 'plain', ocrRefs: new Set(), prevRefKey })
assert.equal(store.get(session).length, 0)
// Payload kept for in-flight serialize until GC.
assert.equal(store.find('r1')?.text, 'x')
store.gcPayloads()
assert.equal(store.find('r1'), undefined)

// Failed send restore: chips return → rehydrate from byRef.
store.add(session, file)
prevRefKey.current = 'r1'
syncRail(store, session, { phase: 'plain', ocrRefs: new Set(), prevRefKey })
assert.equal(store.get(session).length, 0)
assert.ok(store.find('r1'))
syncRail(store, session, { phase: 'plain', ocrRefs: new Set(['r1']), prevRefKey })
assert.equal(store.get(session).length, 1)

// Claimed-command submitting path also clears when refs empty.
store.retain(session, new Set())
store.add(session, { ref: 'r2', name: 'b.pdf', size: 1, kind: 'pdf', text: 'y' })
prevRefKey.current = 'r2'
syncRail(store, session, { phase: 'submitting', ocrRefs: new Set(['r2']), prevRefKey })
assert.equal(store.get(session).length, 1)
syncRail(store, session, { phase: 'submitting', ocrRefs: new Set(), prevRefKey })
assert.equal(store.get(session).length, 0)

// Attach race: never had refs → empty does not wipe a brand-new ready row.
const fresh = new FileAttachmentStore()
const prev2 = { current: '' }
fresh.add(session, { ref: 'r3', name: 'c.pdf', size: 1, kind: 'pdf', text: 'z' })
syncRail(fresh, session, { phase: 'plain', ocrRefs: new Set(), prevRefKey: prev2 })
assert.equal(fresh.get(session).length, 1)

// OCR in progress with empty draft: pending stays.
const pendingId = store.beginExtract(session, { name: 'scan.pdf' })
assert.equal(visibleCards(store.get(session), store.getPending(session)).length, 1)
store.discardPending(session)
assert.equal(store.hasPending(session, pendingId), false)

console.log('ui-retain-logic-ok')
