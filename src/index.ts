/** Generic file extraction and PDF/image OCR host plugin. */

import { execFile } from 'node:child_process'
import { existsSync } from 'node:fs'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { basename } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Context } from '@deepseek-ai/cordis'
import Schema from '@deepseek-ai/schemastery'
import type {} from '@deepseek-ai/dsh-host-webserver'

const ROUTE = '/api/file-extract'
const HELPER = fileURLToPath(new URL('../extract.py', import.meta.url))

/** Deployment settings for file admission and the local extraction worker. */
export interface Config {
  pythonCommand: string
  maxFileBytes: number
  maxPages: number
  dpi: number
  nativeTextMinChars: number
  timeoutMs: number
  maxOutputChars: number
}

/** Cordis configuration schema. */
export const Config: Schema<Config> = Schema.object({
  pythonCommand: Schema.string().default('auto'),
  maxFileBytes: Schema.natural().min(1).default(25 * 1024 * 1024),
  maxPages: Schema.natural().min(1).default(50),
  dpi: Schema.natural().min(72).max(300).default(144),
  nativeTextMinChars: Schema.natural().default(24),
  timeoutMs: Schema.natural().min(1).default(300_000),
  maxOutputChars: Schema.natural().min(1).default(200_000),
})

export const name = 'file-upload-ocr'
export const inject = ['webServer']

interface ExtractResult {
  kind: string
  text: string
}

function resolvePython(command: string): string {
  if (command !== 'auto') return command
  const configured = process.env.DSH_FILE_OCR_PYTHON
  if (configured !== undefined) return configured
  const local = fileURLToPath(new URL(
    process.platform === 'win32' ? '../.venv/Scripts/python.exe' : '../.venv/bin/python',
    import.meta.url,
  ))
  if (!existsSync(local)) {
    throw new Error('OCR 环境未安装 / OCR environment is not installed. 请运行 scripts/setup-ocr.ps1 或 scripts/setup-ocr.sh / Run scripts/setup-ocr.ps1 or scripts/setup-ocr.sh.')
  }
  return local
}

function cleanEnvironment(): NodeJS.ProcessEnv {
  return Object.fromEntries(Object.entries(process.env).filter(([key]) =>
    !/(?:KEY|SECRET|TOKEN|PASSWORD)/i.test(key)))
}

function runExtract(data: Buffer, filename: string, config: Config): Promise<ExtractResult> {
  const args = [
    HELPER,
    '--filename', filename,
    '--max-pages', String(config.maxPages),
    '--dpi', String(config.dpi),
    '--native-text-min-chars', String(config.nativeTextMinChars),
    '--max-output-chars', String(config.maxOutputChars),
  ]
  return new Promise((resolve, reject) => {
    const child = execFile(resolvePython(config.pythonCommand), args, {
      encoding: 'utf8',
      env: cleanEnvironment(),
      maxBuffer: Math.max(64 * 1024, config.maxOutputChars * 4),
      timeout: config.timeoutMs,
    }, (error, stdout, stderr) => {
      if (error !== null) {
        reject(new Error(stderr.trim() || error.message))
        return
      }
      resolve(JSON.parse(stdout) as ExtractResult)
    })
    child.stdin?.end(data)
  })
}

async function readFile(req: IncomingMessage, maxBytes: number): Promise<Buffer> {
  const chunks: Buffer[] = []
  let bytes = 0
  for await (const chunk of req) {
    const value = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
    bytes += value.byteLength
    if (bytes > maxBytes) throw new Error(`文件超过配置的 ${maxBytes} 字节上限 / File exceeds the configured ${maxBytes}-byte limit.`)
    chunks.push(value)
  }
  if (bytes === 0) throw new Error('文件为空 / File upload is empty.')
  return Buffer.concat(chunks, bytes)
}

function json(res: ServerResponse, status: number, value: unknown): void {
  const body = JSON.stringify(value)
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'content-length': Buffer.byteLength(body),
    'cache-control': 'no-store',
  })
  res.end(body)
}

/** Register the same-origin generic file extraction endpoint. */
export function apply(ctx: Context, config: Config): void {
  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: ROUTE,
    async handler(req, res) {
      try {
        if (req.method !== 'POST') {
          json(res, 405, { error: '仅支持 POST / Only POST is supported.' })
          return
        }
        const origin = req.headers.origin
        const host = req.headers.host
        if (origin !== undefined && host !== undefined
          && origin !== `http://${host}` && origin !== `https://${host}`) {
          json(res, 403, { error: '不允许跨域文件上传 / Cross-origin file upload is not allowed.' })
          return
        }
        const encodedFilename = req.headers['x-dsh-file-name']
        if (typeof encodedFilename !== 'string') throw new Error('缺少 x-dsh-file-name 请求头 / Missing x-dsh-file-name header.')
        const filename = decodeURIComponent(encodedFilename)
        if (filename === '' || basename(filename) !== filename) throw new Error('文件名无效 / Invalid file name.')
        const result = await runExtract(await readFile(req, config.maxFileBytes), filename, config)
        json(res, 200, result)
      } catch (error) {
        json(res, 400, { error: error instanceof Error ? error.message : String(error) })
      }
    },
  }), 'file-input: extraction route')
}
