/** Generic file extraction and PDF/image OCR host plugin. */

import { execFile, type ChildProcess } from 'node:child_process'
import { existsSync } from 'node:fs'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { homedir } from 'node:os'
import { basename, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'
import type { Context } from '@deepseek-ai/cordis'
import Schema from '@deepseek-ai/schemastery'
import type {} from '@deepseek-ai/dsh-host-webserver'

const execFileAsync = promisify(execFile)

const ROUTE = '/api/file-extract'
const HEALTH_ROUTE = '/api/file-extract/health'
const HELPER = fileURLToPath(new URL('../extract.py', import.meta.url))
const PACKAGE_ROOT = fileURLToPath(new URL('..', import.meta.url))
const OCR_READY_PROBE_MS = 5_000
const OCR_IMPORT_PROBE = 'import rapidocr_onnxruntime'

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
  /** Max concurrent Python OCR children (RapidOCR is memory-heavy). */
  maxOcrInFlight: number
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
  maxOcrInFlight: Schema.natural().min(1).max(4).default(1),
})

export const name = 'file-upload-ocr'
export const inject = ['webServer']

interface ExtractResult {
  kind: string
  text: string
}

export type OcrReadyState = {
  ready: boolean
  python: string | null
  error: string | null
}

const NOT_INSTALLED_MESSAGE = (
  'OCR 环境未安装 / OCR environment is not installed. '
  + '请运行 scripts/setup-ocr.ps1 或 scripts/setup-ocr.sh '
  + '(安装到 $DSH_HOME/ocr-runtime，升级插件后无需重装) / '
  + 'Run scripts/setup-ocr.ps1 or scripts/setup-ocr.sh '
  + '(installs under $DSH_HOME/ocr-runtime; survives plugin upgrades).'
)

function resolvePython(command: string): string {
  if (command !== 'auto') return command
  const configured = process.env.DSH_FILE_OCR_PYTHON
  if (configured !== undefined && configured.trim().length > 0) return configured.trim()
  const durable = durablePythonPath()
  if (existsSync(durable)) return durable
  const legacy = packageLocalPythonPath()
  if (existsSync(legacy)) return legacy
  throw new Error(NOT_INSTALLED_MESSAGE)
}

/** Probe that the resolved interpreter can import RapidOCR (not just existsSync). */
export async function assertOcrReady(pythonPath: string): Promise<OcrReadyState> {
  try {
    await execFileAsync(pythonPath, ['-c', OCR_IMPORT_PROBE], {
      encoding: 'utf8',
      env: cleanEnvironment(),
      timeout: OCR_READY_PROBE_MS,
      windowsHide: true,
    })
    return { ready: true, python: pythonPath, error: null }
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error))
    const detail = 'stderr' in err && typeof (err as NodeJS.ErrnoException & { stderr?: string }).stderr === 'string'
      ? (err as NodeJS.ErrnoException & { stderr: string }).stderr.trim()
      : err.message
    return {
      ready: false,
      python: pythonPath,
      error: detail.length > 0
        ? `${NOT_INSTALLED_MESSAGE} (${detail})`
        : NOT_INSTALLED_MESSAGE,
    }
  }
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

const CANCELLED_MESSAGE = '已取消辨識 / Extraction cancelled'

type ExtractWaiter = {
  resolve: () => void
  reject: (error: Error) => void
  signal?: AbortSignal
  onAbort?: () => void
}

/** Serialize OCR so RapidOCR does not OOM under parallel uploads. */
export class ExtractQueue {
  private active = 0
  private readonly waiters: ExtractWaiter[] = []

  constructor(private readonly maxInFlight: number) {}

  /** Exposed for tests — in-flight task count. */
  get inFlight(): number {
    return this.active
  }

  /** Exposed for tests — waiters blocked on a free slot. */
  get waiting(): number {
    return this.waiters.length
  }

  async run<T>(task: () => Promise<T>, signal?: AbortSignal): Promise<T> {
    if (signal?.aborted) throw new Error(CANCELLED_MESSAGE)

    if (this.active >= this.maxInFlight) {
      await new Promise<void>((resolve, reject) => {
        const waiter: ExtractWaiter = { resolve, reject, signal }
        waiter.onAbort = () => {
          const index = this.waiters.indexOf(waiter)
          if (index >= 0) this.waiters.splice(index, 1)
          reject(new Error(CANCELLED_MESSAGE))
        }
        this.waiters.push(waiter)
        signal?.addEventListener('abort', waiter.onAbort, { once: true })
      })
    }

    if (signal?.aborted) throw new Error(CANCELLED_MESSAGE)

    this.active += 1
    try {
      return await task()
    } finally {
      this.active -= 1
      const next = this.waiters.shift()
      if (next !== undefined) {
        if (next.onAbort !== undefined && next.signal !== undefined) {
          next.signal.removeEventListener('abort', next.onAbort)
        }
        next.resolve()
      }
    }
  }
}

/** Drop unread request bytes so keep-alive sockets are not left half-open. */
export function drainRequest(req: IncomingMessage): void {
  if (req.readableEnded || req.destroyed) return
  req.resume()
}

/** Abort an oversized / unwanted body immediately. */
export function destroyRequest(req: IncomingMessage): void {
  if (!req.destroyed) req.destroy()
}

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
  queue: ExtractQueue,
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
  return queue.run(() => new Promise((resolve, reject) => {
    let settled = false
    let child: ChildProcess | undefined
    const onAbort = (): void => {
      if (child !== undefined) killChild(child)
      if (settled) return
      settled = true
      reject(new Error(CANCELLED_MESSAGE))
    }
    // Register before execFile so abort between check and spawn cannot leak a child.
    signal?.addEventListener('abort', onAbort, { once: true })
    if (signal?.aborted) {
      onAbort()
      return
    }
    child = execFile(resolvePython(config.pythonCommand), args, {
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
    child.stdin?.end(data)
  }), signal)
}

async function readFile(req: IncomingMessage, maxBytes: number): Promise<Buffer> {
  const chunks: Buffer[] = []
  let bytes = 0
  for await (const chunk of req) {
    const value = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
    bytes += value.byteLength
    if (bytes > maxBytes) {
      destroyRequest(req)
      throw new Error(`文件超过配置的 ${maxBytes} 字节上限 / File exceeds the configured ${maxBytes}-byte limit.`)
    }
    chunks.push(value)
  }
  if (bytes === 0) throw new Error('文件为空 / File upload is empty.')
  return Buffer.concat(chunks, bytes)
}

function json(res: ServerResponse, status: number, value: unknown): void {
  if (res.writableEnded || res.destroyed || res.headersSent) return
  const body = JSON.stringify(value)
  try {
    res.writeHead(status, {
      'content-type': 'application/json; charset=utf-8',
      'content-length': Buffer.byteLength(body),
      'cache-control': 'no-store',
    })
    res.end(body)
  } catch {
    /* client already gone */
  }
}

function respondFailure(
  req: IncomingMessage,
  res: ServerResponse,
  status: number,
  value: unknown,
): void {
  if (status === 413) destroyRequest(req)
  else drainRequest(req)
  json(res, status, value)
}

function requestAbortSignal(req: IncomingMessage, res: ServerResponse): AbortSignal {
  const controller = new AbortController()
  const abort = (): void => {
    if (!controller.signal.aborted) controller.abort()
  }
  // Node may emit IncomingMessage `close` after the body is fully consumed while
  // the response is still pending (OCR). Only cancel when the request did not
  // complete, or when the client drops the connection before we finish writing.
  req.on('aborted', abort)
  req.on('close', () => {
    if (!req.complete) abort()
  })
  res.on('close', () => {
    if (!res.writableEnded) abort()
  })
  return controller.signal
}

/** Register the same-origin generic file extraction endpoint. */
export function apply(ctx: Context, config: Config): void {
  const queue = new ExtractQueue(config.maxOcrInFlight)
  let readyState: OcrReadyState = {
    ready: false,
    python: null,
    error: 'OCR readiness probe has not finished yet.',
  }
  let probe: Promise<OcrReadyState> | null = null

  const refreshReady = (): Promise<OcrReadyState> => {
    if (probe !== null) return probe
    probe = (async (): Promise<OcrReadyState> => {
      try {
        const python = resolvePython(config.pythonCommand)
        readyState = await assertOcrReady(python)
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error))
        readyState = { ready: false, python: null, error: err.message }
      } finally {
        probe = null
      }
      return readyState
    })()
    return probe
  }

  void refreshReady().then((state) => {
    if (state.ready) ctx.logger.info('file-upload-ocr: OCR runtime ready (%s)', state.python)
    else ctx.logger.warn('file-upload-ocr: OCR runtime not ready — %s', state.error)
  })

  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: HEALTH_ROUTE,
    async handler(req, res) {
      if (req.method !== 'GET' && req.method !== 'HEAD') {
        json(res, 405, { error: '仅支持 GET / Only GET is supported.' })
        return
      }
      // Re-probe whenever not ready so setup-ocr after a failed boot unlocks health.
      const state = readyState.ready ? readyState : await refreshReady()
      json(res, state.ready ? 200 : 503, state)
    },
  }), 'file-input: extraction health')

  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: ROUTE,
    async handler(req, res) {
      try {
        if (req.method !== 'POST') {
          respondFailure(req, res, 405, { error: '仅支持 POST / Only POST is supported.' })
          return
        }
        const origin = req.headers.origin
        const host = req.headers.host
        if (origin !== undefined && host !== undefined
          && origin !== `http://${host}` && origin !== `https://${host}`) {
          respondFailure(req, res, 403, { error: '不允许跨域文件上传 / Cross-origin file upload is not allowed.' })
          return
        }
        if (!readyState.ready) {
          const state = await refreshReady()
          if (!state.ready) {
            throw new Error(state.error ?? NOT_INSTALLED_MESSAGE)
          }
        }
        const encodedFilename = req.headers['x-dsh-file-name']
        if (typeof encodedFilename !== 'string') throw new Error('缺少 x-dsh-file-name 请求头 / Missing x-dsh-file-name header.')
        const filename = decodeURIComponent(encodedFilename)
        if (filename === '' || basename(filename) !== filename) throw new Error('文件名无效 / Invalid file name.')
        const data = await readFile(req, config.maxFileBytes)
        const signal = requestAbortSignal(req, res)
        const result = await runExtract(data, filename, config, queue, signal)
        json(res, 200, result)
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error))
        respondFailure(req, res, statusForError(err), { error: err.message })
      }
    },
  }), 'file-input: extraction route')
}
