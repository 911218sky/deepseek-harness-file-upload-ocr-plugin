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
/** Match launcher default: `$DSH_HOME` or `~/.dsh`. */
function resolveDshHome() {
	const fromEnv = process.env.DSH_HOME;
	if (fromEnv !== void 0 && fromEnv.trim().length > 0) return fromEnv.trim();
	return join(homedir(), ".dsh");
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
	if (configured !== void 0) return configured;
	const durable = durablePythonPath();
	if (existsSync(durable)) return durable;
	throw new Error("OCR 环境未安装 / OCR environment is not installed. 请运行 scripts/setup-ocr.ps1 或 scripts/setup-ocr.sh (安装到 $DSH_HOME/ocr-runtime，升级插件后无需重装) / Run scripts/setup-ocr.ps1 or scripts/setup-ocr.sh (installs under $DSH_HOME/ocr-runtime; survives plugin upgrades).");
}
function cleanEnvironment() {
	return Object.fromEntries(Object.entries(process.env).filter(([key]) => !/(?:KEY|SECRET|TOKEN|PASSWORD)/i.test(key)));
}
function runExtract(data, filename, config) {
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
	return new Promise((resolve, reject) => {
		execFile(resolvePython(config.pythonCommand), args, {
			encoding: "utf8",
			env: cleanEnvironment(),
			maxBuffer: Math.max(65536, config.maxOutputChars * 8),
			timeout: config.timeoutMs
		}, (error, stdout, stderr) => {
			if (error !== null) {
				reject(new Error(stderr.trim() || error.message));
				return;
			}
			resolve(JSON.parse(stdout));
		}).stdin?.end(data);
	});
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
				json(res, 200, await runExtract(await readFile(req, config.maxFileBytes), filename, config));
			} catch (error) {
				json(res, 400, { error: error instanceof Error ? error.message : String(error) });
			}
		}
	}), "file-input: extraction route");
}
//#endregion
export { Config, apply, inject, name };
