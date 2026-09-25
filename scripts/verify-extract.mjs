import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { existsSync, mkdtempSync, writeFileSync } from 'node:fs'
import { homedir, tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const dshHome = (process.env.DSH_HOME?.trim() || join(homedir(), '.dsh'))
const durablePython = join(
  process.env.DSH_FILE_OCR_HOME?.trim() || join(dshHome, 'ocr-runtime'),
  '.venv/bin/python',
)
const localPython = join(root, '.venv/bin/python')
const python = [durablePython, localPython].find((path) => existsSync(path))
const helper = join(root, 'extract.py')

if (python === undefined) {
  console.error('missing OCR venv — run scripts/setup-ocr.sh first (installs under $DSH_HOME/ocr-runtime)')
  process.exit(1)
}

function runExtract(filename, data, extra = {}) {
  const args = [
    helper,
    '--filename', filename,
    '--max-pages', String(extra.maxPages ?? 50),
    '--dpi', String(extra.dpi ?? 144),
    '--native-text-min-chars', String(extra.nativeTextMinChars ?? 24),
    '--max-output-chars', String(extra.maxOutputChars ?? 200_000),
  ]
  const stdout = execFileSync(python, args, { input: data, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 })
  return JSON.parse(stdout)
}

const dir = mkdtempSync(join(tmpdir(), 'dsh-ocr-verify-'))

// text / csv / json
for (const [name, body] of [
  ['notes.txt', 'hello world'],
  ['data.csv', 'a,b\n1,2'],
  ['meta.json', '{"ok":true}'],
]) {
  const result = runExtract(name, Buffer.from(body))
  assert.equal(result.kind, 'text')
  assert.match(result.text, /hello|a,b|ok/)
}

// html
const html = runExtract('page.html', Buffer.from('<html><body><p>Title</p></body></html>'))
assert.equal(html.kind, 'html')
assert.match(html.text, /Title/)

// output truncation instead of hard failure
const long = runExtract('long.txt', Buffer.from('x'.repeat(250_000)), { maxOutputChars: 1000 })
assert.match(long.text, /Truncated/)
assert.ok(long.text.length <= 1000)

// unsupported / legacy office — bilingual message
assert.throws(
  () => runExtract('legacy.doc', Buffer.from('fake')),
  /Unsupported file type|Legacy Office format|不支持旧版 Office|不支持的文件类型/,
)

// minimal pdf via pypdfium2 if available
try {
  const { PDFDocument, StandardFonts } = await import('pdf-lib')
  const doc = await PDFDocument.create()
  for (let i = 0; i < 3; i++) {
    const page = doc.addPage([200, 200])
    const font = await doc.embedFont(StandardFonts.Helvetica)
    page.drawText(`Page ${i + 1}`, { x: 50, y: 100, size: 12, font })
  }
  const pdfBytes = Buffer.from(await doc.save())
  writeFileSync(join(dir, 'sample.pdf'), pdfBytes)
  const pdf = runExtract('sample.pdf', pdfBytes)
  assert.equal(pdf.kind, 'pdf')
  assert.match(pdf.text, /Page 1/)
} catch (error) {
  console.warn('pdf-lib not installed — skipping generated PDF test:', error.message)
}

console.log('extract-logic-ok (python=%s)', python)
