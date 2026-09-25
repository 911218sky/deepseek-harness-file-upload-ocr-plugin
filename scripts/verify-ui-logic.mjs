import assert from 'node:assert/strict'

class FileAttachmentStore {
  sessions = new Map()
  pending = new Map()
  byRef = new Map()
  controllers = new Map()
  gcTimer = null

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
    this.controllers.set(id, { aborted: false, abort() { this.aborted = true } })
    this.pending.set(sessionId, [...this.getPending(sessionId), { id, name: file.name, status: 'extracting' }])
    return id
  }

  signalFor(id) {
    return this.controllers.get(id)
  }

  hasPending(sessionId, id) {
    return this.getPending(sessionId).some(row => row.id === id)
  }

  clearErrorPending(sessionId) {
    const next = this.getPending(sessionId).filter(row => row.status !== 'error')
    if (next.length === 0) this.pending.delete(sessionId)
    else this.pending.set(sessionId, next)
  }

  discardPending(sessionId) {
    for (const row of this.getPending(sessionId)) {
      const c = this.controllers.get(row.id)
      if (c) c.abort()
      this.controllers.delete(row.id)
    }
    this.pending.delete(sessionId)
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

  scheduleGc() {
    this.gcCalls = (this.gcCalls ?? 0) + 1
    // Real store defers GC ~1.5s so serialize / failed-restore can use byRef.
  }

  find(ref) {
    return this.byRef.get(ref)
  }
}

/** Mirror FileAttachmentRail cleanup (session-scoped + plain/submitting). */
function syncRail(store, session, { phase, ocrRefs, prevRail }) {
  const refKey = [...ocrRefs].join('\u0000')
  const prev = prevRail.current
  const sessionChanged = prev.session !== undefined && prev.session !== session
  const hadRefs = !sessionChanged && prev.refKey !== ''
  const hasRefs = refKey !== ''
  prevRail.current = { session, refKey }

  if (sessionChanged) {
    if (hasRefs) store.retain(session, ocrRefs)
    return
  }

  const clearReadyCards = () => {
    store.clearErrorPending(session)
    store.retain(session, ocrRefs)
    store.scheduleGc()
  }

  if (phase === 'submitting') {
    clearReadyCards()
    return
  }
  if (hadRefs && !hasRefs) {
    clearReadyCards()
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
const prevRail = { current: { session: undefined, refKey: '' } }

store.add(session, file)
assert.deepEqual(visibleCards(store.get(session), store.getPending(session)), ['r1'])

// Ordinary send (phase stays plain): refs go empty after commit-draft → rail clears.
prevRail.current = { session, refKey: 'r1' }
syncRail(store, session, { phase: 'plain', ocrRefs: new Set(['r1']), prevRail })
assert.equal(store.get(session).length, 1)
syncRail(store, session, { phase: 'plain', ocrRefs: new Set(), prevRail })
assert.equal(store.get(session).length, 0)
assert.equal(store.find('r1')?.text, 'x')
store.gcPayloads()
assert.equal(store.find('r1'), undefined)

// Failed send restore: chips return → immediate rehydrate from byRef.
store.add(session, file)
prevRail.current = { session, refKey: 'r1' }
syncRail(store, session, { phase: 'plain', ocrRefs: new Set(), prevRail })
assert.equal(store.get(session).length, 0)
assert.ok(store.find('r1'))
syncRail(store, session, { phase: 'plain', ocrRefs: new Set(['r1']), prevRail })
assert.equal(store.get(session).length, 1)

// Claimed-command submitting path also clears when refs empty + schedules GC.
store.retain(session, new Set())
store.add(session, { ref: 'r2', name: 'b.pdf', size: 1, kind: 'pdf', text: 'y' })
prevRail.current = { session, refKey: 'r2' }
syncRail(store, session, { phase: 'submitting', ocrRefs: new Set(['r2']), prevRail })
assert.equal(store.get(session).length, 1)
syncRail(store, session, { phase: 'submitting', ocrRefs: new Set(), prevRail })
assert.equal(store.get(session).length, 0)
assert.ok((store.gcCalls ?? 0) >= 1)

// Attach race: never had refs → empty does not wipe a brand-new ready row.
const fresh = new FileAttachmentStore()
const prev2 = { current: { session: undefined, refKey: '' } }
fresh.add(session, { ref: 'r3', name: 'c.pdf', size: 1, kind: 'pdf', text: 'z' })
syncRail(fresh, session, { phase: 'plain', ocrRefs: new Set(), prevRail: prev2 })
assert.equal(fresh.get(session).length, 1)

// Session switch must not discard B's in-flight OCR.
const multi = new FileAttachmentStore()
const prev3 = { current: { session: undefined, refKey: '' } }
multi.add('A', { ref: 'ra', name: 'a.pdf', size: 1, kind: 'pdf', text: 'a' })
prev3.current = { session: 'A', refKey: 'ra' }
const pendingB = multi.beginExtract('B', { name: 'b.pdf' })
syncRail(multi, 'B', { phase: 'plain', ocrRefs: new Set(), prevRail: prev3 })
assert.equal(multi.hasPending('B', pendingB), true)
assert.equal(multi.getPending('B').length, 1)

// Multi-file: send clears ready but keeps sibling extracting.
const batch = new FileAttachmentStore()
const prev4 = { current: { session: undefined, refKey: '' } }
batch.add(session, { ref: 'ready', name: 'ok.pdf', size: 1, kind: 'pdf', text: 'ok' })
const still = batch.beginExtract(session, { name: 'late.pdf' })
prev4.current = { session, refKey: 'ready' }
syncRail(batch, session, { phase: 'plain', ocrRefs: new Set(), prevRail: prev4 })
assert.equal(batch.get(session).length, 0)
assert.equal(batch.hasPending(session, still), true)

console.log('ui-retain-logic-ok')
