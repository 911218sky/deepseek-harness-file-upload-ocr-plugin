window.__ModuleLoader__.load({
	id: "dsh-file-upload-ocr-plugin",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react = require("react");
		let _deepseek_ai_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		let _deepseek_ai_dsh_client_ui_attachment = require("@deepseek-ai/dsh-client-ui-attachment");
		let react_jsx_runtime = require("react/jsx-runtime");
		//#region \0dsh-css:C:\Users\83526\Documents\Codex\2026-08-14\1-2-3-4-api-rescue\deepseek-harness\pdf-ocr-plugin\src\client\FileAttachments.module.css.mjs
		const css$1 = ".jpCaZG_hidden{display:none}.jpCaZG_buttonRoot{align-items:center;min-width:0;display:inline-flex}.jpCaZG_attachButton,.jpCaZG_remove{color:var(--dsw-alias-label-secondary);cursor:pointer;background:0 0;border:0;justify-content:center;align-items:center;display:inline-flex}.jpCaZG_attachButton{border-radius:8px;width:28px;height:28px}.jpCaZG_attachButton:hover:not(:disabled),.jpCaZG_remove:hover{background:var(--dsw-alias-interactive-bg-hover)}.jpCaZG_attachButton:disabled{cursor:wait;opacity:.55}.jpCaZG_error{max-width:220px;color:var(--dsw-static-red-600);text-overflow:ellipsis;white-space:nowrap;margin-left:6px;font-size:12px;overflow:hidden}.jpCaZG_rail{width:min(100%, var(--dsh-composer-card-max-width));flex-wrap:wrap;gap:8px;display:flex}.jpCaZG_card{border:1px solid var(--dsw-alias-border-l2);width:min(260px,100%);color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-layer-1);border-radius:10px;align-items:center;gap:8px;padding:8px 8px 8px 10px;display:flex}.jpCaZG_fileIcon{width:28px;height:28px;color:var(--dsw-static-deepseek-500);background:var(--dsw-static-deepseek-50);border-radius:7px;flex:none;justify-content:center;align-items:center;display:inline-flex}.jpCaZG_pdf{color:#b42318;background:#fee4e2}.jpCaZG_image{color:#6941c6;background:#f4ebff}.jpCaZG_word{color:#175cd3;background:#eff8ff}.jpCaZG_excel{color:#027a48;background:#ecfdf3}.jpCaZG_powerpoint{color:#c4320a;background:#fff4ed}.jpCaZG_text{color:#475467;background:#f2f4f7}.jpCaZG_generic{color:var(--dsw-static-deepseek-500);background:var(--dsw-static-deepseek-50)}.jpCaZG_details{flex-direction:column;flex:auto;min-width:0;display:flex}.jpCaZG_name{text-overflow:ellipsis;white-space:nowrap;font-size:13px;font-weight:500;overflow:hidden}.jpCaZG_size{color:var(--dsw-alias-label-tertiary);font-size:11px}.jpCaZG_remove{border-radius:6px;flex:none;width:24px;height:24px}";
		const tagId$1 = "dsh-file-upload-ocr-plugin/FileAttachments.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$1) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-file-upload-ocr-plugin";
			tag.dataset.pluginCss = tagId$1;
			tag.textContent = css$1;
			document.head.appendChild(tag);
		}
		var FileAttachments_module_css_default = {
			"generic": "jpCaZG_generic",
			"word": "jpCaZG_word",
			"card": "jpCaZG_card",
			"image": "jpCaZG_image",
			"text": "jpCaZG_text",
			"buttonRoot": "jpCaZG_buttonRoot",
			"size": "jpCaZG_size",
			"excel": "jpCaZG_excel",
			"attachButton": "jpCaZG_attachButton",
			"rail": "jpCaZG_rail",
			"details": "jpCaZG_details",
			"remove": "jpCaZG_remove",
			"fileIcon": "jpCaZG_fileIcon",
			"hidden": "jpCaZG_hidden",
			"name": "jpCaZG_name",
			"error": "jpCaZG_error",
			"powerpoint": "jpCaZG_powerpoint",
			"pdf": "jpCaZG_pdf"
		};
		//#endregion
		//#region src/client/FileAttachments.tsx
		const ENDPOINT = "/api/file-extract";
		const ACCEPT = ".pdf,.png,.jpg,.jpeg,.webp,.bmp,.tif,.tiff,.docx,.xlsx,.xlsm,.pptx,.txt,.md,.csv,.tsv,.json,.xml,.yaml,.yml,.html,.htm,.log,.py,.js,.ts,.tsx,.css";
		const FILE_SOURCE = "file-attachment";
		function fileKindClass(kind) {
			switch (kind.toLowerCase()) {
				case "pdf": return "pdf";
				case "image": return "image";
				case "word": return "word";
				case "excel": return "excel";
				case "powerpoint": return "powerpoint";
				case "text":
				case "html": return "text";
				default: return "generic";
			}
		}
		/** Neutral document glyph shared by composer and sent attachment cards. */
		function FileIcon({ size = 16 }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
				width: size,
				height: size,
				viewBox: "0 0 16 16",
				fill: "none",
				"aria-hidden": "true",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
					d: "M3.5 1.75h5.2l3.8 3.8v8.7H3.5V1.75Z",
					stroke: "currentColor",
					strokeWidth: "1.3",
					strokeLinejoin: "round"
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
					d: "M8.5 1.9v3.9h3.8M5.5 8h5M5.5 10.5h5",
					stroke: "currentColor",
					strokeWidth: "1.3",
					strokeLinecap: "round",
					strokeLinejoin: "round"
				})]
			});
		}
		/** Add common local files through the generic extraction endpoint. */
		function FileAttachButton({ attach, attachImage }) {
			const picker = (0, react.useRef)(null);
			const dragDepth = (0, react.useRef)(0);
			const busyRef = (0, react.useRef)(false);
			const [busy, setBusy] = (0, react.useState)(false);
			const [dragActive, setDragActive] = (0, react.useState)(false);
			const [error, setError] = (0, react.useState)(null);
			const upload = async (selected) => {
				if (selected.length === 0) return;
				busyRef.current = true;
				setBusy(true);
				setError(null);
				try {
					for (const file of selected) {
						if (file.type.startsWith("image/") && attachImage !== void 0) {
							const direct = window.confirm("圖片要直接提供給支援視覺的模型嗎？\n\n按「確定」：直接提供原圖\n按「取消」：使用本機 OCR");
							if (direct) {
								await attachImage(file);
								continue;
							}
						}
						const response = await fetch(ENDPOINT, {
							method: "POST",
							headers: {
								"content-type": file.type || "application/octet-stream",
								"x-dsh-file-name": encodeURIComponent(file.name)
							},
							body: file
						});
						const value = await response.json();
						if (!response.ok) throw new Error("error" in value ? value.error : `文件解析失败 / File parsing failed（${response.status}）`);
						if (!("text" in value) || !("kind" in value)) throw new Error("文件解析响应不完整 / File parsing response is incomplete.");
						attach(file, value);
					}
				} catch (reason) {
					setError(reason instanceof Error ? reason.message : String(reason));
				} finally {
					busyRef.current = false;
					setBusy(false);
				}
			};
			(0, react.useEffect)(() => {
				const hasFiles = (event) => event.dataTransfer?.types.includes("Files") ?? false;
				const reset = () => {
					dragDepth.current = 0;
					setDragActive(false);
				};
				const onDragEnter = (event) => {
					if (!hasFiles(event)) return;
					event.preventDefault();
					event.stopImmediatePropagation();
					dragDepth.current += 1;
					setDragActive(true);
				};
				const onDragOver = (event) => {
					if (!hasFiles(event) || event.dataTransfer === null) return;
					event.preventDefault();
					event.stopImmediatePropagation();
					event.dataTransfer.dropEffect = busyRef.current ? "none" : "copy";
				};
				const onDragLeave = (event) => {
					if (!hasFiles(event)) return;
					event.preventDefault();
					event.stopImmediatePropagation();
					dragDepth.current = Math.max(0, dragDepth.current - 1);
					if (dragDepth.current === 0) setDragActive(false);
					const leavingViewport = event.clientX <= 0 || event.clientY <= 0 || event.clientX >= window.innerWidth || event.clientY >= window.innerHeight;
					if ((event.target === document.documentElement || event.target === document.body) && leavingViewport) reset();
				};
				const onDrop = (event) => {
					if (!hasFiles(event)) return;
					event.preventDefault();
					event.stopImmediatePropagation();
					reset();
					if (!busyRef.current) upload([...event.dataTransfer?.files ?? []]);
				};
				document.addEventListener("dragenter", onDragEnter, true);
				document.addEventListener("dragover", onDragOver, true);
				document.addEventListener("dragleave", onDragLeave, true);
				document.addEventListener("drop", onDrop, true);
				window.addEventListener("dragend", reset);
				return () => {
					document.removeEventListener("dragenter", onDragEnter, true);
					document.removeEventListener("dragover", onDragOver, true);
					document.removeEventListener("dragleave", onDragLeave, true);
					document.removeEventListener("drop", onDrop, true);
					window.removeEventListener("dragend", reset);
				};
			}, [attach]);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
				className: FileAttachments_module_css_default.buttonRoot,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
						ref: picker,
						className: FileAttachments_module_css_default.hidden,
						type: "file",
						accept: ACCEPT,
						multiple: true,
						onChange: (event) => {
							const selected = [...event.target.files ?? []];
							event.target.value = "";
							upload(selected);
						}
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: FileAttachments_module_css_default.attachButton,
						disabled: busy,
						"aria-label": "添加文件 / Add file",
						"aria-busy": busy,
						title: error ?? "添加文件 / Add file",
						onClick: () => {
							picker.current?.click();
						},
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(FileIcon, { size: 16 })
					}),
					error !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: FileAttachments_module_css_default.error,
						role: "alert",
						children: error
					}),
					dragActive && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_attachment.DropOverlay, {
						disabled: busy,
						labels: {
							title: busy ? "正在添加文件 / Adding files" : "拖放文件以上传 / Drop files to upload",
							desc: busy ? void 0 : "支持 PDF、图片、Word、Excel、PPT 和文本文件 / PDF, images, Word, Excel, PPT, and text files"
						}
					})
				]
			});
		}
		function fileSize$1(bytes) {
			if (bytes < 1024) return `${bytes} B`;
			if (bytes < 1024 * 1024) return `${Math.ceil(bytes / 1024)} KB`;
			return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
		}
		/** Render extracted files as removable cards above the composer. */
		function FileAttachmentRail({ sessionId, input, files, remove }) {
			const snapshot = (0, react.useSyncExternalStore)((listener) => files.subscribe(sessionId, listener), () => files.get(sessionId));
			const activeRefs = (0, react.useMemo)(() => new Set(input.occurrences.filter((item) => item.source === FILE_SOURCE).map((item) => item.ref)), [input.occurrences]);
			const active = snapshot.filter((file) => activeRefs.has(file.ref));
			const refKey = [...activeRefs].join("\0");
			(0, react.useEffect)(() => {
				if (input.phase === "submitting") return;
				const timer = setTimeout(() => {
					files.retain(sessionId, activeRefs);
				}, 1e3);
				return () => clearTimeout(timer);
			}, [
				activeRefs,
				files,
				input.phase,
				refKey,
				sessionId
			]);
			if (active.length === 0) return null;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: FileAttachments_module_css_default.rail,
				"aria-label": "已添加的文件 / Added files",
				children: active.map((file) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: FileAttachments_module_css_default.card,
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: `${FileAttachments_module_css_default.fileIcon} ${FileAttachments_module_css_default[fileKindClass(file.kind)]}`,
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(FileIcon, { size: 16 })
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
							className: FileAttachments_module_css_default.details,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: FileAttachments_module_css_default.name,
								title: file.name,
								children: file.name
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: FileAttachments_module_css_default.size,
								children: fileSize$1(file.size)
							})]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: FileAttachments_module_css_default.remove,
							"aria-label": `移除 / Remove ${file.name}`,
							onClick: () => {
								remove(file.ref);
							},
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCloseOutline16, { size: 14 })
						})
					]
				}, file.ref))
			});
		}
		//#endregion
		//#region src/client/FileAttachmentStore.ts
		const EMPTY_FILES = [];
		/** Browser-only extracted-file payload registry keyed by session and reference id. */
		var FileAttachmentStore = class {
			sessions = /* @__PURE__ */ new Map();
			byRef = /* @__PURE__ */ new Map();
			listeners = /* @__PURE__ */ new Map();
			get(sessionId) {
				return this.sessions.get(sessionId) ?? EMPTY_FILES;
			}
			find(ref) {
				return this.byRef.get(ref);
			}
			subscribe(sessionId, listener) {
				const listeners = this.listeners.get(sessionId) ?? /* @__PURE__ */ new Set();
				listeners.add(listener);
				this.listeners.set(sessionId, listeners);
				return () => {
					listeners.delete(listener);
					if (listeners.size === 0) this.listeners.delete(sessionId);
				};
			}
			add(sessionId, file) {
				this.byRef.set(file.ref, file);
				this.sessions.set(sessionId, [...this.get(sessionId), file]);
				this.emit(sessionId);
			}
			remove(sessionId, ref) {
				const next = this.get(sessionId).filter((file) => file.ref !== ref);
				if (next.length === this.get(sessionId).length) return;
				this.byRef.delete(ref);
				if (next.length === 0) this.sessions.delete(sessionId);
				else this.sessions.set(sessionId, next);
				this.emit(sessionId);
			}
			retain(sessionId, refs) {
				const current = this.get(sessionId);
				const next = current.filter((file) => refs.has(file.ref));
				if (next.length === current.length) return;
				for (const file of current) if (!refs.has(file.ref)) this.byRef.delete(file.ref);
				if (next.length === 0) this.sessions.delete(sessionId);
				else this.sessions.set(sessionId, next);
				this.emit(sessionId);
			}
			clear() {
				this.sessions.clear();
				this.byRef.clear();
				for (const listeners of this.listeners.values()) for (const listener of listeners) listener();
				this.listeners.clear();
			}
			emit(sessionId) {
				for (const listener of this.listeners.get(sessionId) ?? []) listener();
			}
		};
		//#endregion
		//#region \0dsh-css:C:\Users\83526\Documents\Codex\2026-08-14\1-2-3-4-api-rescue\deepseek-harness\pdf-ocr-plugin\src\client\SentFileMessage.module.css.mjs
		const css = ".EcvSdG_row{flex-direction:column;align-items:flex-end;gap:6px;display:flex}.EcvSdG_stack{flex-direction:column;align-items:flex-end;gap:8px;min-width:0;max-width:min(525px,82%);display:flex}.EcvSdG_files{flex-wrap:wrap;justify-content:flex-end;gap:8px;display:flex}.EcvSdG_card{border:1px solid var(--dsw-alias-border-l2);width:min(280px,100%);color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-layer-1);border-radius:12px;align-items:center;gap:9px;padding:9px 12px 9px 10px;display:flex}.EcvSdG_icon{width:32px;height:32px;color:var(--dsw-static-deepseek-500);background:var(--dsw-static-deepseek-50);border-radius:8px;flex:none;justify-content:center;align-items:center;display:inline-flex}.EcvSdG_pdf{color:#b42318;background:#fee4e2}.EcvSdG_image{color:#6941c6;background:#f4ebff}.EcvSdG_word{color:#175cd3;background:#eff8ff}.EcvSdG_excel{color:#027a48;background:#ecfdf3}.EcvSdG_powerpoint{color:#c4320a;background:#fff4ed}.EcvSdG_text{color:#475467;background:#f2f4f7}.EcvSdG_generic{color:var(--dsw-static-deepseek-500);background:var(--dsw-static-deepseek-50)}.EcvSdG_details{flex-direction:column;flex:auto;min-width:0;display:flex}.EcvSdG_name{text-overflow:ellipsis;white-space:nowrap;font-size:14px;font-weight:500;line-height:20px;overflow:hidden}.EcvSdG_meta{color:var(--dsw-alias-label-tertiary);font-size:11px;line-height:16px}.EcvSdG_bubble{max-width:100%;color:var(--dsw-alias-label-primary);background:var(--dsw-specific-bubble);white-space:pre-wrap;overflow-wrap:anywhere;border-radius:22px;padding:10px 16px;font-size:16px;line-height:24px}.EcvSdG_extra{background:var(--dsw-alias-bg-layer-1);border-radius:8px;max-width:100%;margin:0;padding:8px;font-size:12px;overflow:auto}.EcvSdG_copy{color:var(--dsw-alias-label-tertiary);cursor:pointer;background:0 0;border:0;padding:2px 6px;font-size:12px}.EcvSdG_copy:hover{color:var(--dsw-alias-label-secondary)}";
		const tagId = "dsh-file-upload-ocr-plugin/SentFileMessage.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-file-upload-ocr-plugin";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var SentFileMessage_module_css_default = {
			"row": "EcvSdG_row",
			"text": "EcvSdG_text",
			"generic": "EcvSdG_generic",
			"extra": "EcvSdG_extra",
			"name": "EcvSdG_name",
			"copy": "EcvSdG_copy",
			"icon": "EcvSdG_icon",
			"bubble": "EcvSdG_bubble",
			"excel": "EcvSdG_excel",
			"card": "EcvSdG_card",
			"stack": "EcvSdG_stack",
			"details": "EcvSdG_details",
			"image": "EcvSdG_image",
			"meta": "EcvSdG_meta",
			"files": "EcvSdG_files",
			"pdf": "EcvSdG_pdf",
			"powerpoint": "EcvSdG_powerpoint",
			"word": "EcvSdG_word"
		};
		//#endregion
		//#region src/client/SentFileMessage.tsx
		const HEADER = /<attached_file name=("(?:\\.|[^"\\])*") kind=("(?:\\.|[^"\\])*") size=(\d+) chars=(\d+)>\n/g;
		const LEGACY = /<attached_file name=("(?:\\.|[^"\\])*") kind=("(?:\\.|[^"\\])*")>\n[\s\S]*?\n<\/attached_file>/g;
		const CLOSE = "\n</attached_file>";
		function project(text) {
			const files = [];
			let visible = "";
			let cursor = 0;
			HEADER.lastIndex = 0;
			let match;
			while ((match = HEADER.exec(text)) !== null) {
				const chars = Number(match[4]);
				const contentEnd = HEADER.lastIndex + chars;
				if (text.slice(contentEnd, contentEnd + 17) !== CLOSE) break;
				visible += text.slice(cursor, match.index);
				files.push({
					name: JSON.parse(match[1]),
					kind: JSON.parse(match[2]),
					size: Number(match[3])
				});
				cursor = contentEnd + 17;
				HEADER.lastIndex = cursor;
			}
			visible += text.slice(cursor);
			visible = visible.replace(LEGACY, (_whole, rawName, rawKind) => {
				files.push({
					name: JSON.parse(rawName),
					kind: JSON.parse(rawKind)
				});
				return "";
			});
			return {
				text: visible.replace(/\n{3,}/g, "\n\n").trim(),
				files
			};
		}
		function fileSize(bytes) {
			if (bytes === void 0) return "";
			if (bytes < 1024) return `${bytes} B`;
			if (bytes < 1024 * 1024) return `${Math.ceil(bytes / 1024)} KB`;
			return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
		}
		function CopyButton({ text }) {
			const [copied, setCopied] = (0, react.useState)(false);
			if (text === "") return null;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
				type: "button",
				className: SentFileMessage_module_css_default.copy,
				onClick: () => {
					navigator.clipboard.writeText(text).then(() => {
						setCopied(true);
						window.setTimeout(() => {
							setCopied(false);
						}, 1200);
					});
				},
				children: copied ? "已复制 / Copied" : "复制 / Copy"
			});
		}
		function SentFileMessage({ content, loadImage }) {
			const texts = [];
			const images = [];
			const rest = [];
			for (const block of content) if (block.type === "text" && block.text !== void 0) texts.push(block.text);
			else if (block.type === "image" && block.attachment !== void 0) images.push({ attachment: block.attachment });
			else rest.push(block);
			const projected = project(texts.join(""));
			const copyText = [projected.text, ...projected.files.map((file) => `[文件 / File: ${file.name}]`)].filter(Boolean).join("\n");
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: SentFileMessage_module_css_default.row,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: SentFileMessage_module_css_default.stack,
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_attachment.ImageGallery, {
							images,
							load: loadImage,
							align: "end",
							labels: {
								image: "图片 / Image",
								open: "查看原图 / View original",
								openNamed: (name) => `查看 / View ${name}`,
								loading: "加载中 / Loading",
								loadFailed: "加载失败，点击重试 / Failed to load; click to retry",
								lightbox: {
									dialog: "图片预览 / Image preview",
									close: "关闭 / Close"
								}
							}
						}),
						projected.files.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: SentFileMessage_module_css_default.files,
							children: projected.files.map((file, index) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: SentFileMessage_module_css_default.card,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: `${SentFileMessage_module_css_default.icon} ${SentFileMessage_module_css_default[fileKindClass(file.kind)]}`,
									children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(FileIcon, { size: 18 })
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
									className: SentFileMessage_module_css_default.details,
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: SentFileMessage_module_css_default.name,
										title: file.name,
										children: file.name
									}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: SentFileMessage_module_css_default.meta,
										children: [file.kind.toUpperCase(), fileSize(file.size)].filter(Boolean).join(" · ")
									})]
								})]
							}, `${file.name}:${index}`))
						}),
						projected.text !== "" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: SentFileMessage_module_css_default.bubble,
							children: projected.text
						}),
						rest.map((block, index) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("pre", {
							className: SentFileMessage_module_css_default.extra,
							children: JSON.stringify(block, null, 2)
						}, index))
					]
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CopyButton, { text: copyText })]
			});
		}
		/** Durable user-message projection: model sees extracted text, transcript shows cards. */
		const SentUserFileMessage = (0, react.memo)(function SentUserFileMessage({ node, loadImage }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(SentFileMessage, {
				content: node.data.content,
				loadImage
			});
		});
		/** Steering-message equivalent of the durable user projection. */
		const SentSteeringFileMessage = (0, react.memo)(function SentSteeringFileMessage({ node, loadImage }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(SentFileMessage, {
				content: node.data.content,
				loadImage
			});
		});
		//#endregion
		//#region src/client/index.ts
		const inject = [
			"slots",
			"sessions",
			"conversation",
			"inputTriggers"
		];
		/** Register generic file cards and their hidden model serializer. */
		function apply(ctx) {
			const files = new FileAttachmentStore();
			ctx.effect(() => () => {
				files.clear();
			}, "file-input: extracted payloads");
			const source = {
				trigger: "@",
				name: FILE_SOURCE,
				candidates: async () => [],
				onPick: () => void 0,
				codec: {
					clipboardText: (ref) => {
						const file = files.find(ref);
						if (file === void 0) throw new Error(`file-input: missing attachment ${ref}`);
						return `[文件 / File: ${file.name}]`;
					},
					serialize: async (ref, signal) => {
						if (signal.aborted) throw signal.reason;
						const file = files.find(ref);
						if (file === void 0) throw new Error(`file-input: missing attachment ${ref}`);
						return `<attached_file name=${JSON.stringify(file.name)} kind=${JSON.stringify(file.kind)} size=${file.size} chars=${file.text.length}>\n${file.text}\n</attached_file>`;
					}
				}
			};
			ctx.effect(() => ctx.inputTriggers.registerSource(source), "file-input: reference serializer");
			const scopedInput = (sessionId) => {
				const actx = ctx.sessions.scope(sessionId);
				if (actx === void 0) throw new Error(`file-input: session ${String(sessionId)} has no scope`);
				return {
					actx,
					input: ctx.conversation.input.for(actx)
				};
			};
			ctx.slots.inject("conversation.input.left", () => ctx.slots.register({
				name: "conversation.input.left",
				id: "file-input",
				order: 30,
				inject: (sessionId) => ({ attachImage: async (browserFile) => { const { input } = scopedInput(sessionId); const images = ctx.conversation.createDraftImages([browserFile]); const ids = images.map((image) => image.id); if (ids.length === 0 || input.addImages(ids)) return; ctx.conversation.releaseDraftImages(images); throw new Error("目前輸入狀態不能添加圖片 / Images cannot be added in the current input state."); }, attach: (browserFile, result) => {
					const { actx, input } = scopedInput(sessionId);
					const snapshot = input.state.getSnapshot();
					const file = {
						ref: crypto.randomUUID(),
						name: browserFile.name,
						size: browserFile.size,
						kind: result.kind,
						text: result.text
					};
					files.add(sessionId, file);
					const reference = {
						source: FILE_SOURCE,
						ref: file.ref,
						label: file.name,
						clipboardText: `[文件 / File: ${file.name}]`
					};
					if (!(actx.bail(actx, "slash/input-insert-reference", {
						reference,
						span: {
							start: snapshot.draft.length,
							end: snapshot.draft.length,
							draftRev: snapshot.draftRev
						}
					}) === true)) {
						files.remove(sessionId, file.ref);
						throw new Error("当前输入状态不能添加文件 / Files cannot be added in the current input state.");
					}
				} })
			}, FileAttachButton));
			ctx.slots.inject("conversation.input.dock", () => ctx.slots.register({
				name: "conversation.input.dock",
				id: "file-attachments",
				order: 5,
				inject: (sessionId) => ({
					files,
					remove: (ref) => {
						const { input } = scopedInput(sessionId);
						const snapshot = input.state.getSnapshot();
						const occurrence = snapshot.occurrences.find((item) => item.source === "file-attachment" && item.ref === ref);
						if (occurrence !== void 0) input.setDraft(snapshot.draft.slice(0, occurrence.offset) + snapshot.draft.slice(occurrence.offset + 1));
						files.remove(sessionId, ref);
					}
				})
			}, FileAttachmentRail));
			ctx.slots.inject("conversation.chat.node", () => ctx.slots.register({
				name: "conversation.chat.node",
				key: "user",
				priority: -10
			}, SentUserFileMessage));
			ctx.slots.inject("conversation.chat.node", () => ctx.slots.register({
				name: "conversation.chat.node",
				key: "steering",
				priority: -10
			}, SentSteeringFileMessage));
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map