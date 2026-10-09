import assert from 'node:assert/strict'
import { ExtractQueue } from '../lib/index.js'

const cancelled = /已取消辨識|Extraction cancelled/

{
  const queue = new ExtractQueue(1)
  const controller = new AbortController()
  let firstStarted = false
  let firstRelease
  const firstDone = new Promise((resolve) => { firstRelease = resolve })

  const first = queue.run(async () => {
    firstStarted = true
    await firstDone
    return 'ok'
  })

  // Wait until the first task holds the slot.
  for (let i = 0; i < 20 && !firstStarted; i++) await new Promise((r) => setTimeout(r, 5))
  assert.equal(firstStarted, true)
  assert.equal(queue.inFlight, 1)

  const second = queue.run(async () => 'should-not-run', controller.signal)
  for (let i = 0; i < 20 && queue.waiting === 0; i++) await new Promise((r) => setTimeout(r, 5))
  assert.equal(queue.waiting, 1)

  controller.abort()
  await assert.rejects(second, cancelled)
  assert.equal(queue.waiting, 0)
  assert.equal(queue.inFlight, 1)

  firstRelease()
  assert.equal(await first, 'ok')
  assert.equal(queue.inFlight, 0)
  console.log('extract-queue-abort-while-waiting-ok')
}

{
  const queue = new ExtractQueue(1)
  const controller = new AbortController()
  controller.abort()
  let ran = false
  await assert.rejects(
    queue.run(async () => { ran = true; return 'x' }, controller.signal),
    cancelled,
  )
  assert.equal(ran, false)
  assert.equal(queue.inFlight, 0)
  console.log('extract-queue-abort-before-start-ok')
}

console.log('host-logic-ok')
