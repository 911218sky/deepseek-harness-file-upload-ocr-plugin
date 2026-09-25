/**
 * Simulates the Web UI upload path: File -> arrayBuffer -> POST /api/file-extract
 */
import assert from 'node:assert/strict'
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { homedir } from 'node:os'
import { join } from 'node:path'

const base = process.env.DSH_WEB_BASE ?? 'http://127.0.0.1:3080'

function resolveDshHome() {
  const fromEnv = process.env.DSH_HOME?.trim()
  if (fromEnv) return fromEnv
  const home = homedir()
  const candidates = [join(home, '.dsh'), join(home, '.config', 'dsh')]
  for (const candidate of candidates) {
    if (existsSync(join(candidate, 'ocr-runtime', '.venv'))) return candidate
  }
  for (const candidate of candidates) {
    if (existsSync(candidate)) return candidate
  }
  return candidates[0]
}

const dshHome = resolveDshHome()
const py = process.platform === 'win32'
  ? join(dshHome, 'ocr-runtime/.venv/Scripts/python.exe')
  : join(dshHome, 'ocr-runtime/.venv/bin/python')

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
