/** Generic file extraction and PDF/image OCR host plugin. */

import { execFile, type ChildProcess } from 'node:child_process'
import { existsSync } from 'node:fs'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { homedir } from 'node:os'
import { basename, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Context } from '@deepseek-ai/cordis'
import Schema from '@deepseek-ai/schemastery'
import type {} from '@deepseek-ai/dsh-host-webserver'

const ROUTE = '/api/file-extract'
const HELPER = fileURLToPath(new URL('../extract.py', import.meta.url))
const PACKAGE_ROOT = fileURLToPath(new URL('..', import.meta.url))

/** Max concurrent Python OCR children (RapidOCR is memory-heavy). */
const MAX_OCR_IN_FLIGHT = 1

/**
 * Resolve Harness home: `$DSH_HOME`, else a home that already has OCR runtime,
 * else an existing `~/.dsh` / `~/.config/dsh`, else official default `~/.dsh`.
 */
export function resolveDshHome(): string {
  const fromEnv = process.env.DSH_HOME
  if (fromEnv !== undefined && fromEnv.trim().length > 0) return fromEnv.trim()
  const home = homedir()
  const candidates = [join(home, '.dsh'), join(home, '.config', 'dsh')]
  for (const candidate of candidates) {
    const durable = join(candidate, 'ocr-runtime', '.venv')
    if (existsSync(durable)) return candidate
  }
  for (const candidate of candidates) {
    if (existsSync(candidate)) return candidate
  }
  return candidates[0]!
}

/**
 * Stable OCR runtime root that survives pnpm / `dsh plugin add` path churn.
 * Override with `DSH_FILE_OCR_HOME`; default `$DSH_HOME/ocr-runtime`.
 */
function resolveOcrRuntimeRoot(): string {
  const fromEnv = process.env.DSH_FILE_OCR_HOME
  if (fromEnv !== undefined && fromEnv.trim().length > 0) return fromEnv.trim()
  return join(resolveDshHome(), 'ocr-runtime')
}

function durablePythonPath(): string {
  return process.platform === 'win32'
    ? join(resolveOcrRuntimeRoot(), '.venv', 'Scripts', 'python.exe')
    : join(resolveOcrRuntimeRoot(), '.venv', 'bin', 'python')
}

function packageLocalPythonPath(): string {
  return process.platform === 'win32'
    ? join(PACKAGE_ROOT, '.venv', 'Scripts', 'python.exe')
    : join(PACKAGE_ROOT, '.venv', 'bin', 'python')
}

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
  maxFileBytes: Schema.natural().min(1).default(100 * 1024 * 1024),
  maxPages: Schema.natural().min(1).default(200),
  dpi: Schema.natural().min(72).max(300).default(144),
  nativeTextMinChars: Schema.natural().default(24),
  timeoutMs: Schema.natural().min(1).default(900_000),
  maxOutputChars: Schema.natural().min(1).default(1_000_000),
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
  if (configured !== undefined && configured.trim().length > 0) return configured.trim()
  const durable = durablePythonPath()
  if (existsSync(durable)) return durable
  const legacy = packageLocalPythonPath()
  if (existsSync(legacy)) return legacy
  throw new Error(
    'OCR 环境未安装 / OCR environment is not installed. '
    + '请运行 scripts/setup-ocr.ps1 或 scripts/setup-ocr.sh '
    + '(安装到 $DSH_HOME/ocr-runtime，升级插件后无需重装) / '
    + 'Run scripts/setup-ocr.ps1 or scripts/setup-ocr.sh '
    + '(installs under $DSH_HOME/ocr-runtime; survives plugin upgrades).',
  )
}

function cleanEnvironment(): NodeJS.ProcessEnv {
  return Object.fromEntries(Object.entries(process.env).filter(([key]) =>
    !/(?:KEY|SECRET|TOKEN|PASSWORD)/i.test(key)))
}

function killChild(child: ChildProcess): void {
  if (child.killed || child.exitCode !== null) return
  try {
    child.kill('SIGTERM')
  } catch {
    /* ignore */
  }
  setTimeout(() => {
    if (child.killed || child.exitCode !== null) return
    try {
      child.kill('SIGKILL')
    } catch {
      /* ignore */
    }
  }, 2_000).unref?.()
}

/** Serialize OCR so RapidOCR does not OOM under parallel uploads. */
class ExtractQueue {
  private active = 0
  private readonly waiters: Array<() => void> = []

  async run<T>(task: () => Promise<T>): Promise<T> {
    if (this.active >= MAX_OCR_IN_FLIGHT) {
      await new Promise<void>((resolve) => { this.waiters.push(resolve) })
    }
    this.active += 1
    try {
      return await task()
    } finally {
      this.active -= 1
      const next = this.waiters.shift()
      next?.()
    }
  }
}

const extractQueue = new ExtractQueue()

function parseExtractStdout(stdout: string): ExtractResult {
  let parsed: unknown
  try {
    parsed = JSON.parse(stdout)
  } catch {
    throw new Error('OCR 输出不是有效 JSON / OCR worker returned invalid JSON.')
  }
  if (
    typeof parsed !== 'object'
    || parsed === null
    || typeof (parsed as ExtractResult).kind !== 'string'
    || typeof (parsed as ExtractResult).text !== 'string'
  ) {
    throw new Error('OCR 输出缺少 kind/text / OCR worker response is incomplete.')
  }
  return parsed as ExtractResult
}

function statusForError(error: Error): number {
  const message = error.message
  if (message.includes('byte limit') || message.includes('字节上限')) return 413
  if (message.includes('ETIMEDOUT') || message.includes('timed out') || /TIMEOUT/i.test(message)) return 504
  if (message.includes('OCR environment is not installed') || message.includes('OCR 环境未安装')) return 503
  return 400
}

function runExtract(
  data: Buffer,
  filename: string,
  config: Config,
  signal?: AbortSignal,
): Promise<ExtractResult> {
  const args = [
    HELPER,
    '--filename', filename,
    '--max-pages', String(config.maxPages),
    '--dpi', String(config.dpi),
    '--native-text-min-chars', String(config.nativeTextMinChars),
    '--max-output-chars', String(config.maxOutputChars),
  ]
  return extractQueue.run(() => new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new Error('已取消辨識 / Extraction cancelled'))
      return
    }
    let settled = false
    const child = execFile(resolvePython(config.pythonCommand), args, {
      encoding: 'utf8',
      env: cleanEnvironment(),
      maxBuffer: Math.max(64 * 1024, config.maxOutputChars * 8),
      timeout: config.timeoutMs,
      killSignal: 'SIGKILL',
    }, (error, stdout, stderr) => {
      if (settled) return
      settled = true
      signal?.removeEventListener('abort', onAbort)
      if (error !== null) {
        const timedOut = 'killed' in error && (error as NodeJS.ErrnoException & { killed?: boolean }).killed === true
          && /TIMEOUT|timed out/i.test(error.message)
        reject(new Error(
          timedOut
            ? `OCR 超时（${config.timeoutMs}ms） / OCR timed out (${config.timeoutMs}ms)`
            : (stderr.trim() || error.message),
        ))
        return
      }
      try {
        resolve(parseExtractStdout(stdout))
      } catch (parseError) {
        reject(parseError instanceof Error ? parseError : new Error(String(parseError)))
      }
    })
    const onAbort = (): void => {
      killChild(child)
      if (settled) return
      settled = true
      reject(new Error('已取消辨識 / Extraction cancelled'))
    }
    signal?.addEventListener('abort', onAbort, { once: true })
    child.stdin?.end(data)
  }))
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

function requestAbortSignal(req: IncomingMessage, res: ServerResponse): AbortSignal {
  const controller = new AbortController()
  const abort = (): void => {
    if (!controller.signal.aborted) controller.abort()
  }
  req.on('aborted', abort)
  req.on('close', () => {
    if (!res.writableEnded) abort()
  })
  return controller.signal
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
        const signal = requestAbortSignal(req, res)
        const result = await runExtract(await readFile(req, config.maxFileBytes), filename, config, signal)
        json(res, 200, result)
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error))
        json(res, statusForError(err), { error: err.message })
      }
    },
  }), 'file-input: extraction route')
}
