import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { basename, join } from "node:path";
import { fileURLToPath } from "node:url";
import Schema from "@deepseek-ai/schemastery";
//#region src/index.ts
/** Generic file extraction and PDF/image OCR host plugin. */
const ROUTE = "/api/file-extract";
const HELPER = fileURLToPath(new URL("../extract.py", import.meta.url));
const PACKAGE_ROOT = fileURLToPath(new URL("..", import.meta.url));
/** Max concurrent Python OCR children (RapidOCR is memory-heavy). */
const MAX_OCR_IN_FLIGHT = 1;
/**
* Resolve Harness home: `$DSH_HOME`, else a home that already has OCR runtime,
* else an existing `~/.dsh` / `~/.config/dsh`, else official default `~/.dsh`.
*/
function resolveDshHome() {
	const fromEnv = process.env.DSH_HOME;
	if (fromEnv !== void 0 && fromEnv.trim().length > 0) return fromEnv.trim();
	const home = homedir();
	const candidates = [join(home, ".dsh"), join(home, ".config", "dsh")];
	for (const candidate of candidates) {
		const durable = join(candidate, "ocr-runtime", ".venv");
		if (existsSync(durable)) return candidate;
	}
	for (const candidate of candidates) if (existsSync(candidate)) return candidate;
	return candidates[0];
}
/**
* Stable OCR runtime root that survives pnpm / `dsh plugin add` path churn.
* Override with `DSH_FILE_OCR_HOME`; default `$DSH_HOME/ocr-runtime`.
*/
function resolveOcrRuntimeRoot() {
	const fromEnv = process.env.DSH_FILE_OCR_HOME;
	if (fromEnv !== void 0 && fromEnv.trim().length > 0) return fromEnv.trim();
	return join(resolveDshHome(), "ocr-runtime");
}
function durablePythonPath() {
	return process.platform === "win32" ? join(resolveOcrRuntimeRoot(), ".venv", "Scripts", "python.exe") : join(resolveOcrRuntimeRoot(), ".venv", "bin", "python");
}
function packageLocalPythonPath() {
	return process.platform === "win32" ? join(PACKAGE_ROOT, ".venv", "Scripts", "python.exe") : join(PACKAGE_ROOT, ".venv", "bin", "python");
}
/** Cordis configuration schema. */
const Config = Schema.object({
	pythonCommand: Schema.string().default("auto"),
	maxFileBytes: Schema.natural().min(1).default(104857600),
	maxPages: Schema.natural().min(1).default(200),
	dpi: Schema.natural().min(72).max(300).default(144),
	nativeTextMinChars: Schema.natural().default(24),
	timeoutMs: Schema.natural().min(1).default(9e5),
	maxOutputChars: Schema.natural().min(1).default(1e6)
});
const name = "file-upload-ocr";
const inject = ["webServer"];
function resolvePython(command) {
	if (command !== "auto") return command;
	const configured = process.env.DSH_FILE_OCR_PYTHON;
	if (configured !== void 0 && configured.trim().length > 0) return configured.trim();
	const durable = durablePythonPath();
	if (existsSync(durable)) return durable;
	const legacy = packageLocalPythonPath();
	if (existsSync(legacy)) return legacy;
	throw new Error("OCR 环境未安装 / OCR environment is not installed. 请运行 scripts/setup-ocr.ps1 或 scripts/setup-ocr.sh (安装到 $DSH_HOME/ocr-runtime，升级插件后无需重装) / Run scripts/setup-ocr.ps1 or scripts/setup-ocr.sh (installs under $DSH_HOME/ocr-runtime; survives plugin upgrades).");
}
function cleanEnvironment() {
	return Object.fromEntries(Object.entries(process.env).filter(([key]) => !/(?:KEY|SECRET|TOKEN|PASSWORD)/i.test(key)));
}
function killChild(child) {
	if (child.killed || child.exitCode !== null) return;
	try {
		child.kill("SIGTERM");
	} catch {}
	setTimeout(() => {
		if (child.killed || child.exitCode !== null) return;
		try {
			child.kill("SIGKILL");
		} catch {}
	}, 2e3).unref?.();
}
/** Serialize OCR so RapidOCR does not OOM under parallel uploads. */
var ExtractQueue = class {
	active = 0;
	waiters = [];
	async run(task) {
		if (this.active >= MAX_OCR_IN_FLIGHT) await new Promise((resolve) => {
			this.waiters.push(resolve);
		});
		this.active += 1;
		try {
			return await task();
		} finally {
			this.active -= 1;
			this.waiters.shift()?.();
		}
	}
};
const extractQueue = new ExtractQueue();
function parseExtractStdout(stdout) {
	let parsed;
	try {
		parsed = JSON.parse(stdout);
	} catch {
		throw new Error("OCR 输出不是有效 JSON / OCR worker returned invalid JSON.");
	}
	if (typeof parsed !== "object" || parsed === null || typeof parsed.kind !== "string" || typeof parsed.text !== "string") throw new Error("OCR 输出缺少 kind/text / OCR worker response is incomplete.");
	return parsed;
}
function statusForError(error) {
	const message = error.message;
	if (message.includes("byte limit") || message.includes("字节上限")) return 413;
	if (message.includes("ETIMEDOUT") || message.includes("timed out") || /TIMEOUT/i.test(message)) return 504;
	if (message.includes("OCR environment is not installed") || message.includes("OCR 环境未安装")) return 503;
	return 400;
}
function runExtract(data, filename, config, signal) {
	const args = [
		HELPER,
		"--filename",
		filename,
		"--max-pages",
		String(config.maxPages),
		"--dpi",
		String(config.dpi),
		"--native-text-min-chars",
		String(config.nativeTextMinChars),
		"--max-output-chars",
		String(config.maxOutputChars)
	];
	return extractQueue.run(() => new Promise((resolve, reject) => {
		if (signal?.aborted) {
			reject(/* @__PURE__ */ new Error("已取消辨識 / Extraction cancelled"));
			return;
		}
		let settled = false;
		const child = execFile(resolvePython(config.pythonCommand), args, {
			encoding: "utf8",
			env: cleanEnvironment(),
			maxBuffer: Math.max(65536, config.maxOutputChars * 8),
			timeout: config.timeoutMs,
			killSignal: "SIGKILL"
		}, (error, stdout, stderr) => {
			if (settled) return;
			settled = true;
			signal?.removeEventListener("abort", onAbort);
			if (error !== null) {
				const timedOut = "killed" in error && error.killed === true && /TIMEOUT|timed out/i.test(error.message);
				reject(new Error(timedOut ? `OCR 超时（${config.timeoutMs}ms） / OCR timed out (${config.timeoutMs}ms)` : stderr.trim() || error.message));
				return;
			}
			try {
				resolve(parseExtractStdout(stdout));
			} catch (parseError) {
				reject(parseError instanceof Error ? parseError : new Error(String(parseError)));
			}
		});
		const onAbort = () => {
			killChild(child);
			if (settled) return;
			settled = true;
			reject(/* @__PURE__ */ new Error("已取消辨識 / Extraction cancelled"));
		};
		signal?.addEventListener("abort", onAbort, { once: true });
		child.stdin?.end(data);
	}));
}
async function readFile(req, maxBytes) {
	const chunks = [];
	let bytes = 0;
	for await (const chunk of req) {
		const value = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
		bytes += value.byteLength;
		if (bytes > maxBytes) throw new Error(`文件超过配置的 ${maxBytes} 字节上限 / File exceeds the configured ${maxBytes}-byte limit.`);
		chunks.push(value);
	}
	if (bytes === 0) throw new Error("文件为空 / File upload is empty.");
	return Buffer.concat(chunks, bytes);
}
function json(res, status, value) {
	const body = JSON.stringify(value);
	res.writeHead(status, {
		"content-type": "application/json; charset=utf-8",
		"content-length": Buffer.byteLength(body),
		"cache-control": "no-store"
	});
	res.end(body);
}
function requestAbortSignal(req, res) {
	const controller = new AbortController();
	const abort = () => {
		if (!controller.signal.aborted) controller.abort();
	};
	req.on("aborted", abort);
	req.on("close", () => {
		if (!res.writableEnded) abort();
	});
	return controller.signal;
}
/** Register the same-origin generic file extraction endpoint. */
function apply(ctx, config) {
	ctx.effect(() => ctx.webServer.register({
		kind: "exact",
		path: ROUTE,
		async handler(req, res) {
			try {
				if (req.method !== "POST") {
					json(res, 405, { error: "仅支持 POST / Only POST is supported." });
					return;
				}
				const origin = req.headers.origin;
				const host = req.headers.host;
				if (origin !== void 0 && host !== void 0 && origin !== `http://${host}` && origin !== `https://${host}`) {
					json(res, 403, { error: "不允许跨域文件上传 / Cross-origin file upload is not allowed." });
					return;
				}
				const encodedFilename = req.headers["x-dsh-file-name"];
				if (typeof encodedFilename !== "string") throw new Error("缺少 x-dsh-file-name 请求头 / Missing x-dsh-file-name header.");
				const filename = decodeURIComponent(encodedFilename);
				if (filename === "" || basename(filename) !== filename) throw new Error("文件名无效 / Invalid file name.");
				const signal = requestAbortSignal(req, res);
				json(res, 200, await runExtract(await readFile(req, config.maxFileBytes), filename, config, signal));
			} catch (error) {
				const err = error instanceof Error ? error : new Error(String(error));
				json(res, statusForError(err), { error: err.message });
			}
		}
	}), "file-input: extraction route");
}
//#endregion
export { Config, apply, inject, name, resolveDshHome };
