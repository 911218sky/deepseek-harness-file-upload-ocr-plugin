/**
 * Simulates the Web UI upload path: File -> arrayBuffer -> POST /api/file-extract
 */
import assert from 'node:assert/strict'
import { readFileSync, writeFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { homedir } from 'node:os'
import { join } from 'node:path'

const base = process.env.DSH_WEB_BASE ?? 'http://127.0.0.1:3080'
const dshHome = process.env.DSH_HOME?.trim() || join(homedir(), '.config/dsh')
const py = join(dshHome, 'ocr-runtime/.venv/bin/python')

// Build a slightly truncated JPEG (the case users hit).
const jpegPath = '/tmp/dsh-ui-trunc.jpg'
execFileSync(py, ['-c', `
from PIL import Image, ImageDraw
import io
img = Image.new('RGB', (640, 200), 'white')
ImageDraw.Draw(img).text((40, 80), 'UI flow verify', fill='black')
buf = io.BytesIO()
img.save(buf, format='JPEG', quality=88)
open('${jpegPath}', 'wb').write(buf.getvalue()[:-3])
`])

const bytes = readFileSync(jpegPath)
const response = await fetch(`${base}/api/file-extract`, {
  method: 'POST',
  headers: {
    'content-type': 'image/jpeg',
    'x-dsh-file-name': encodeURIComponent('ui-flow.jpg'),
  },
  body: bytes,
})
const body = await response.json()
assert.equal(response.status, 200, JSON.stringify(body))
assert.equal(body.kind, 'image')
assert.match(body.text, /UI flow verify/i)
console.log('upload-flow-ok', base)
