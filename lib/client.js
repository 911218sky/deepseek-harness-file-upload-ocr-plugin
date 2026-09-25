window.__ModuleLoader__.load({
	id: "dsh-file-upload-ocr-plugin",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		//#region \0rolldown/runtime.js
		var __create = Object.create;
		var __defProp = Object.defineProperty;
		var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
		var __getOwnPropNames = Object.getOwnPropertyNames;
		var __getProtoOf = Object.getPrototypeOf;
		var __hasOwnProp = Object.prototype.hasOwnProperty;
		var __commonJSMin = (cb, mod) => () => (mod || (cb((mod = { exports: {} }).exports, mod), cb = null), mod.exports);
		var __copyProps = (to, from, except, desc) => {
			if (from && typeof from === "object" || typeof from === "function") for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
				key = keys[i];
				if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
					get: ((k) => from[k]).bind(null, key),
					enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
				});
			}
			return to;
		};
		var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule || !__hasOwnProp.call(mod, "default") ? __defProp(target, "default", {
			value: mod,
			enumerable: true
		}) : target, mod));
		//#endregion
		let react = require("react");
		let react_dom = require("react-dom");
		let _deepseek_ai_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		let react_jsx_runtime = require("react/jsx-runtime");
		//#endregion
		//#region src/client/FileAttachments.tsx
		var import_FileAttachments_module_css = /* @__PURE__ */ __toESM((/* @__PURE__ */ __commonJSMin(((exports, module) => {
			const css = ".crEFWW_hidden{display:none}.crEFWW_buttonRoot{align-items:center;min-width:0;display:inline-flex}.crEFWW_attachButton,.crEFWW_remove{color:var(--dsw-alias-label-secondary);cursor:pointer;background:0 0;border:0;justify-content:center;align-items:center;display:inline-flex}.crEFWW_attachButton{border-radius:8px;width:28px;height:28px}.crEFWW_attachButton:hover:not(:disabled),.crEFWW_remove:hover{background:var(--dsw-alias-interactive-bg-hover)}.crEFWW_attachButton:disabled{cursor:wait;opacity:.55}.crEFWW_error{max-width:220px;color:var(--dsw-static-red-600);text-overflow:ellipsis;white-space:nowrap;margin-left:6px;font-size:12px;overflow:hidden}.crEFWW_composerRail{min-width:0;margin-bottom:0;padding:6px 10px 10px}.crEFWW_rail{scrollbar-width:none;flex-wrap:nowrap;align-items:stretch;gap:10px;min-width:0;display:flex;overflow:auto hidden}.crEFWW_rail::-webkit-scrollbar{display:none}.crEFWW_card{box-sizing:border-box;border:.5px solid var(--dsw-alias-border-l2,#0000001f);width:240px;height:64px;color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-layer-1,var(--dsw-specific-input-major,transparent));text-align:left;border-radius:16px;flex:none;align-items:center;gap:10px;padding:0 12px;display:inline-flex;position:relative}.crEFWW_cardPending{border-style:dashed}.crEFWW_cardError{border-color:var(--dsw-alias-state-error-primary,#d54941)}.crEFWW_spinner{box-sizing:border-box;border:2px solid var(--dsw-alias-border-l3,#00000029);border-top-color:var(--dsw-static-deepseek-500,#4d6bfe);border-radius:50%;width:18px;height:18px;animation:.8s linear infinite crEFWW_dsh-ocr-spin}@keyframes crEFWW_dsh-ocr-spin{to{transform:rotate(360deg)}}.crEFWW_fileIcon{flex:none;justify-content:center;align-items:center;width:28px;height:28px;display:inline-flex}.crEFWW_details{flex-direction:column;flex:auto;min-width:0;padding:8px 0;display:flex}.crEFWW_name{text-overflow:ellipsis;white-space:nowrap;font-size:14px;font-weight:500;line-height:22px;overflow:hidden}.crEFWW_size{color:var(--dsw-alias-label-tertiary,#00000073);text-overflow:ellipsis;white-space:nowrap;font-size:12px;line-height:18px;overflow:hidden}.crEFWW_remove{border-radius:6px;flex:none;width:24px;height:24px}.crEFWW_dropMask{pointer-events:none;z-index:10000;background:color-mix(in srgb, var(--dsw-alias-bg-layer-1,#fff) 72%, transparent);justify-content:center;align-items:center;display:flex;position:fixed;inset:0}.crEFWW_dropWrap{border:1px dashed var(--dsw-alias-brand-primary,#4d6bfe);background:var(--dsw-alias-bg-layer-1,#fff);text-align:center;border-radius:16px;flex-direction:column;gap:6px;min-width:min(360px,80vw);padding:24px 28px;display:flex;box-shadow:0 8px 28px #00000014}.crEFWW_dropTitle{color:var(--dsw-alias-label-primary);font-size:16px;font-weight:500;line-height:24px}.crEFWW_dropDesc{color:var(--dsw-alias-label-tertiary);font-size:13px;line-height:20px}.crEFWW_choiceList{flex-direction:column;gap:10px;display:flex}.crEFWW_choiceCard{border:.5px solid var(--dsw-alias-border-l3);width:100%;color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-layer-1);text-align:left;cursor:pointer;border-radius:16px;align-items:center;gap:12px;padding:14px 14px 14px 12px;transition:background .12s,border-color .12s,box-shadow .12s;display:flex}.crEFWW_choiceCard:hover{border-color:var(--dsw-alias-brand-primary);background:var(--dsw-alias-interactive-bg-hover)}.crEFWW_choiceCard:focus-visible{outline:2px solid var(--dsw-alias-border-l4);outline-offset:2px}.crEFWW_choiceCard:active{background:var(--dsw-alias-interactive-bg-active)}.crEFWW_choiceIcon{border-radius:12px;flex:none;justify-content:center;align-items:center;width:36px;height:36px;display:inline-flex}.crEFWW_choiceIconVision{color:var(--dsw-static-deepseek-500);background:var(--dsw-static-deepseek-50)}.crEFWW_choiceIconOcr{color:#6941c6;background:#f4ebff}.crEFWW_choiceCopy{flex-direction:column;flex:auto;gap:2px;min-width:0;display:flex}.crEFWW_choiceLabel{color:var(--dsw-alias-label-primary);font-size:14px;font-weight:500;line-height:22px}.crEFWW_choiceHint{color:var(--dsw-alias-label-tertiary);font-size:12px;font-weight:400;line-height:18px}";
			const tagId = "dsh-file-upload-ocr-plugin/FileAttachments.module.css";
			if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
				const tag = document.createElement("style");
				tag.dataset.plugin = "dsh-file-upload-ocr-plugin";
				tag.dataset.pluginCss = tagId;
				tag.textContent = css;
				document.head.appendChild(tag);
			}
			module.exports = {
				"cardPending": "crEFWW_cardPending",
				"fileIcon": "crEFWW_fileIcon",
				"name": "crEFWW_name",
				"spinner": "crEFWW_spinner",
				"choiceCard": "crEFWW_choiceCard",
				"buttonRoot": "crEFWW_buttonRoot",
				"remove": "crEFWW_remove",
				"dsh-ocr-spin": "crEFWW_dsh-ocr-spin",
				"dropTitle": "crEFWW_dropTitle",
				"dropDesc": "crEFWW_dropDesc",
				"choiceIcon": "crEFWW_choiceIcon",
				"size": "crEFWW_size",
				"choiceList": "crEFWW_choiceList",
				"choiceIconVision": "crEFWW_choiceIconVision",
				"error": "crEFWW_error",
				"hidden": "crEFWW_hidden",
				"choiceIconOcr": "crEFWW_choiceIconOcr",
				"details": "crEFWW_details",
				"dropMask": "crEFWW_dropMask",
				"choiceCopy": "crEFWW_choiceCopy",
				"dropWrap": "crEFWW_dropWrap",
				"cardError": "crEFWW_cardError",
				"rail": "crEFWW_rail",
				"composerRail": "crEFWW_composerRail",
				"choiceLabel": "crEFWW_choiceLabel",
				"choiceHint": "crEFWW_choiceHint",
				"card": "crEFWW_card",
				"attachButton": "crEFWW_attachButton"
			};
		})))(), 1);
		const ENDPOINT = "/api/file-extract";
		const ACCEPT = ".pdf,.png,.jpg,.jpeg,.webp,.bmp,.tif,.tiff,.docx,.xlsx,.xlsm,.pptx,.txt,.md,.csv,.tsv,.json,.xml,.yaml,.yml,.html,.htm,.log,.py,.js,.ts,.tsx,.css";
		const FILE_SOURCE = "file-attachment";
		/** Map raw backend / Pillow errors to user-facing copy. */
		function formatExtractError(message) {
			const lower = message.toLowerCase();
			if (lower.includes("ocr environment is not installed") || message.includes("OCR 环境未安装")) return "OCR 環境未安裝，請執行 scripts/setup-ocr.sh / OCR runtime missing — run setup-ocr.sh";
			if (lower.includes("image file is truncated") || lower.includes("truncated jpeg") || lower.includes("truncated png") || lower.includes("broken data stream when reading image file")) return "圖片不完整或已損壞，請重新儲存或換一張圖 / Image incomplete or corrupt — re-export or try another file";
			if (lower.includes("cannot identify image file") || lower.includes("image is corrupt")) return "無法讀取此圖片，請改用 PNG 或重新匯出 / Unreadable image — try PNG or re-export";
			if (lower.includes("aborted") || lower.includes("abort")) return "已取消辨識 / Extraction cancelled";
			return message;
		}
		/**
		* Thin drop invitation. DSH's DropOverlay lives inside ui-attachment's client
		* bundle and is not a package export — keep a portal + tokens only.
		*/
		function DropMask({ disabled, title, desc }) {
			if (typeof document === "undefined") return null;
			return (0, react_dom.createPortal)(/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: import_FileAttachments_module_css.default.dropMask,
				role: "status",
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: import_FileAttachments_module_css.default.dropWrap,
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: import_FileAttachments_module_css.default.dropTitle,
						children: title
					}), !disabled && desc !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: import_FileAttachments_module_css.default.dropDesc,
						children: desc
					})]
				})
			}), document.body);
		}
		/** Add common local files through the generic extraction endpoint. */
		/** True when the drag payload clearly includes a non-image file we should OCR. */
		function dragClaimsOcr(dataTransfer) {
			const items = [...dataTransfer.items];
			if (items.length === 0) return false;
			return items.some((item) => {
				if (item.kind !== "file") return false;
				if (item.type === "") return true;
				return !item.type.startsWith("image/");
			});
		}
		function FileAttachButton({ attach, attachImage, beginExtract, extractSignal, failExtract, clearPending, hasPending, resetUploadErrors }) {
			const picker = (0, react.useRef)(null);
			const dragDepth = (0, react.useRef)(0);
			const busyRef = (0, react.useRef)(false);
			const [busy, setBusy] = (0, react.useState)(false);
			const [dragActive, setDragActive] = (0, react.useState)(false);
			const [error, setError] = (0, react.useState)(null);
			const [pendingFiles, setPendingFiles] = (0, react.useState)(null);
			const processFiles = async (selected, imageMode) => {
				if (selected.length === 0) return;
				busyRef.current = true;
				setBusy(true);
				setError(null);
				resetUploadErrors();
				let sawSuccess = false;
				try {
					const useVision = imageMode === "vision" && attachImage !== void 0;
					for (const file of selected) {
						if (file.type.startsWith("image/") && useVision) {
							try {
								await attachImage(file);
								sawSuccess = true;
								setError(null);
							} catch (reason) {
								setError(formatExtractError(reason instanceof Error ? reason.message : String(reason)));
							}
							continue;
						}
						const pendingId = beginExtract(file);
						const signal = extractSignal(pendingId);
						try {
							const payload = await file.arrayBuffer();
							const response = await fetch(ENDPOINT, {
								method: "POST",
								headers: {
									"content-type": file.type || "application/octet-stream",
									"x-dsh-file-name": encodeURIComponent(file.name)
								},
								body: payload,
								signal
							});
							let value;
							try {
								value = await response.json();
							} catch {
								throw new Error(`文件解析失败 / File parsing failed（${response.status}）`);
							}
							if (!response.ok) throw new Error("error" in value ? value.error : `文件解析失败 / File parsing failed（${response.status}）`);
							if (!("text" in value) || !("kind" in value)) throw new Error("文件解析响应不完整 / File parsing response is incomplete.");
							if (!hasPending(pendingId)) continue;
							attach(file, value);
							clearPending(pendingId);
							sawSuccess = true;
							setError(null);
						} catch (reason) {
							if (signal?.aborted || reason instanceof DOMException && reason.name === "AbortError") {
								clearPending(pendingId);
								continue;
							}
							const message = formatExtractError(reason instanceof Error ? reason.message : String(reason));
							failExtract(pendingId, message);
							setError(message);
						}
					}
					if (sawSuccess) setError(null);
				} finally {
					busyRef.current = false;
					setBusy(false);
				}
			};
			const upload = (selected) => {
				if (selected.length === 0 || busyRef.current) return;
				setError(null);
				if (attachImage !== void 0 && selected.some((file) => file.type.startsWith("image/"))) {
					setPendingFiles(selected);
					return;
				}
				processFiles(selected, null);
			};
			const chooseImageMode = (mode) => {
				const selected = pendingFiles;
				setPendingFiles(null);
				if (selected === null) return;
				processFiles(selected, mode);
			};
			const cancelImageChoice = () => {
				setPendingFiles(null);
			};
			(0, react.useEffect)(() => {
				const hasFiles = (event) => event.dataTransfer?.types.includes("Files") ?? false;
				const reset = () => {
					dragDepth.current = 0;
					setDragActive(false);
				};
				const onDragEnter = (event) => {
					if (!hasFiles(event) || event.dataTransfer === null || !dragClaimsOcr(event.dataTransfer)) return;
					event.preventDefault();
					event.stopImmediatePropagation();
					dragDepth.current += 1;
					setDragActive(true);
				};
				const onDragOver = (event) => {
					if (!hasFiles(event) || event.dataTransfer === null || !dragClaimsOcr(event.dataTransfer)) return;
					event.preventDefault();
					event.stopImmediatePropagation();
					event.dataTransfer.dropEffect = busyRef.current ? "none" : "copy";
				};
				const onDragLeave = (event) => {
					if (!hasFiles(event) || event.dataTransfer === null || !dragClaimsOcr(event.dataTransfer)) return;
					event.preventDefault();
					event.stopImmediatePropagation();
					dragDepth.current = Math.max(0, dragDepth.current - 1);
					if (dragDepth.current === 0) setDragActive(false);
					const leavingViewport = event.clientX <= 0 || event.clientY <= 0 || event.clientX >= window.innerWidth || event.clientY >= window.innerHeight;
					if ((event.target === document.documentElement || event.target === document.body) && leavingViewport) reset();
				};
				const onDrop = (event) => {
					if (!hasFiles(event) || event.dataTransfer === null) return;
					const files = [...event.dataTransfer.files ?? []];
					const allImages = files.length > 0 && files.every((file) => file.type.startsWith("image/"));
					if (allImages && attachImage !== void 0) {
						reset();
						return;
					}
					if (!dragClaimsOcr(event.dataTransfer) && allImages) {
						reset();
						return;
					}
					event.preventDefault();
					event.stopImmediatePropagation();
					reset();
					if (!busyRef.current && pendingFiles === null) upload(files);
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
			}, [
				attach,
				attachImage,
				pendingFiles
			]);
			const pendingImageCount = pendingFiles?.filter((file) => file.type.startsWith("image/")).length ?? 0;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
				className: import_FileAttachments_module_css.default.buttonRoot,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
						ref: picker,
						className: import_FileAttachments_module_css.default.hidden,
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
						className: import_FileAttachments_module_css.default.attachButton,
						disabled: busy || pendingFiles !== null,
						"aria-label": "添加文件 / Add file",
						"aria-busy": busy,
						title: error ?? "添加文件 / Add file",
						onClick: () => {
							setError(null);
							picker.current?.click();
						},
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconPaperclipOutlineRegular, { size: 16 })
					}),
					error !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: import_FileAttachments_module_css.default.error,
						role: "alert",
						children: error
					}),
					dragActive && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(DropMask, {
						disabled: busy,
						title: busy ? "正在添加文件 / Adding files" : "拖放文件以上传 / Drop files to upload",
						desc: busy ? void 0 : "支持 PDF、图片、Word、Excel、PPT 和文本文件 / PDF, images, Word, Excel, PPT, and text files"
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Modal, {
						open: pendingFiles !== null,
						onClose: cancelImageChoice,
						title: "選擇圖片處理方式",
						closeLabel: "關閉 / Close",
						description: `已選取 ${pendingImageCount} 張圖片。請手動選擇一種方式，不會自動套用。`,
						footer: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
							variant: "outline",
							onClick: cancelImageChoice,
							children: "取消"
						}),
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: import_FileAttachments_module_css.default.choiceList,
							role: "listbox",
							"aria-label": "圖片處理方式",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
								type: "button",
								role: "option",
								className: import_FileAttachments_module_css.default.choiceCard,
								onClick: () => {
									chooseImageMode("vision");
								},
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: `${import_FileAttachments_module_css.default.choiceIcon} ${import_FileAttachments_module_css.default.choiceIconVision}`,
									"aria-hidden": "true",
									children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconBrowseOutlineRegular, { size: 18 })
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
									className: import_FileAttachments_module_css.default.choiceCopy,
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: import_FileAttachments_module_css.default.choiceLabel,
										children: "直接提供原圖"
									}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: import_FileAttachments_module_css.default.choiceHint,
										children: "交給支援視覺的模型看圖"
									})]
								})]
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
								type: "button",
								role: "option",
								className: import_FileAttachments_module_css.default.choiceCard,
								onClick: () => {
									chooseImageMode("ocr");
								},
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: `${import_FileAttachments_module_css.default.choiceIcon} ${import_FileAttachments_module_css.default.choiceIconOcr}`,
									"aria-hidden": "true",
									children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.FileTypeIcon, { path: "document.pdf" })
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
									className: import_FileAttachments_module_css.default.choiceCopy,
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: import_FileAttachments_module_css.default.choiceLabel,
										children: "本機 OCR 轉文字"
									}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: import_FileAttachments_module_css.default.choiceHint,
										children: "在本機辨識後以文字附件送出"
									})]
								})]
							})]
						})
					})
				]
			});
		}
		const EMPTY_FILES = [];
		const EMPTY_PENDING$1 = [];
		const EMPTY_OCCURRENCES = [];
		function Spinner() {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
				className: import_FileAttachments_module_css.default.spinner,
				"aria-hidden": "true"
			});
		}
		function useOcrSessionId(injected, files) {
			const active = (0, react.useSyncExternalStore)((listener) => files.subscribeGlobal(listener), () => files.getActiveSessionId());
			return injected ?? active;
		}
		function useSessionStoreSlice(files, session) {
			return {
				ready: (0, react.useSyncExternalStore)((listener) => session !== void 0 ? files.subscribe(session, listener) : () => {}, () => session !== void 0 ? files.get(session) : EMPTY_FILES),
				pending: (0, react.useSyncExternalStore)((listener) => session !== void 0 ? files.subscribe(session, listener) : () => {}, () => session !== void 0 ? files.getPending(session) : EMPTY_PENDING$1)
			};
		}
		function truncateError(message) {
			const formatted = formatExtractError((message.split("\n")[0] ?? message).trim());
			return formatted.length > 120 ? `${formatted.slice(0, 117)}…` : formatted;
		}
		/**
		* OCR file cards in `conversation.input.attachments` (DSH 0.1.7 in-composer rail).
		* Visibility follows store rows (pending + ready), matching native draft attachments
		* that remain visible even when the text draft is empty. Card chrome mirrors native
		* FileCard (240×64) using exported primitives — FileCard itself is not package-exported.
		*/
		function FileAttachmentRail({ ocrSessionId, useInput, files, remove }) {
			const session = useOcrSessionId(ocrSessionId, files);
			const { ready, pending } = useSessionStoreSlice(files, session);
			const input = useInput((state) => state);
			const phase = input?.phase;
			const occurrences = input?.occurrences ?? EMPTY_OCCURRENCES;
			const ocrRefs = (0, react.useMemo)(() => new Set(occurrences.filter((item) => item.source === FILE_SOURCE).map((item) => item.ref)), [occurrences]);
			const refKey = [...ocrRefs].join("\0");
			const prevRail = (0, react.useRef)({
				session: void 0,
				refKey: ""
			});
			(0, react.useEffect)(() => {
				if (session === void 0) return;
				const prev = prevRail.current;
				const sessionChanged = prev.session !== void 0 && prev.session !== session;
				const hadRefs = !sessionChanged && prev.refKey !== "";
				const hasRefs = refKey !== "";
				prevRail.current = {
					session,
					refKey
				};
				if (sessionChanged) {
					if (hasRefs) files.retain(session, ocrRefs);
					return;
				}
				const clearReadyCards = () => {
					files.clearErrorPending(session);
					files.retain(session, ocrRefs);
					files.scheduleGc(1500);
				};
				if (phase === "submitting") {
					clearReadyCards();
					return;
				}
				if (hadRefs && !hasRefs) {
					clearReadyCards();
					return;
				}
				if (!hasRefs) return;
				files.retain(session, ocrRefs);
			}, [
				files,
				ocrRefs,
				phase,
				refKey,
				session
			]);
			if (session === void 0 || ready.length === 0 && pending.length === 0) return null;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: import_FileAttachments_module_css.default.composerRail,
				"data-ocr-rail": "1",
				"aria-label": "已添加的文件 / Added files",
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: import_FileAttachments_module_css.default.rail,
					children: [pending.map((file) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: `${import_FileAttachments_module_css.default.card} ${file.status === "error" ? import_FileAttachments_module_css.default.cardError : import_FileAttachments_module_css.default.cardPending}`,
						"aria-busy": file.status === "extracting",
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: import_FileAttachments_module_css.default.fileIcon,
								"aria-hidden": "true",
								children: file.status === "extracting" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Spinner, {}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.FileTypeIcon, { path: file.name })
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
								className: import_FileAttachments_module_css.default.details,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: import_FileAttachments_module_css.default.name,
									title: file.name,
									children: file.name
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: import_FileAttachments_module_css.default.size,
									children: file.status === "extracting" ? `OCR 辨識中… · ${(0, _deepseek_ai_dsh_client_ui_primitives.fileSizeText)(file.size)}` : truncateError(file.error ?? "辨識失敗")
								})]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: import_FileAttachments_module_css.default.remove,
								"aria-label": `移除 / Remove ${file.name}`,
								onClick: () => {
									remove(file.id);
								},
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCloseFillRegular, { size: 14 })
							})
						]
					}, file.id)), ready.map((file) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: import_FileAttachments_module_css.default.card,
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: import_FileAttachments_module_css.default.fileIcon,
								"aria-hidden": "true",
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.FileTypeIcon, { path: file.name })
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
								className: import_FileAttachments_module_css.default.details,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: import_FileAttachments_module_css.default.name,
									title: file.name,
									children: file.name
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: import_FileAttachments_module_css.default.size,
									children: [(0, _deepseek_ai_dsh_client_ui_primitives.fileExtension)(file.name).toUpperCase().slice(0, 8) || file.kind.toUpperCase(), (0, _deepseek_ai_dsh_client_ui_primitives.fileSizeText)(file.size)].filter(Boolean).join(" · ")
								})]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: import_FileAttachments_module_css.default.remove,
								"aria-label": `移除 / Remove ${file.name}`,
								onClick: () => {
									remove(file.ref);
								},
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCloseFillRegular, { size: 14 })
							})
						]
					}, file.ref))]
				})
			});
		}
		/** Compose native image/file attachments with OCR cards (DSH 0.1.7 `conversation.input.attachments`). */
		function createOcrComposerAttachments(ctx) {
			function OcrComposerAttachments({ files, remove, ocrSessionId, useInput, ...nativeProps }) {
				const Native = ctx.slots.entries("conversation.input.attachments").find((entry) => (entry.options.priority ?? 0) === 0 && entry.component !== OcrComposerAttachments)?.component;
				return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [Native !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Native, {
					...nativeProps,
					useInput
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(FileAttachmentRail, {
					ocrSessionId,
					useInput,
					files,
					remove
				})] });
			}
			return OcrComposerAttachments;
		}
		//#endregion
		//#region src/client/FileAttachmentStore.ts
		const EMPTY_READY = [];
		const EMPTY_PENDING = [];
		/** Browser-only extracted-file payload registry keyed by session and reference id. */
		var FileAttachmentStore = class {
			sessions = /* @__PURE__ */ new Map();
			pending = /* @__PURE__ */ new Map();
			byRef = /* @__PURE__ */ new Map();
			controllers = /* @__PURE__ */ new Map();
			listeners = /* @__PURE__ */ new Map();
			globalListeners = /* @__PURE__ */ new Set();
			/** Last session touched by extract/attach — used when `conversation.input.attachments` inject omits sessionId. */
			activeSessionId;
			generation = 0;
			gcTimer = null;
			getActiveSessionId() {
				return this.activeSessionId;
			}
			getGeneration() {
				return this.generation;
			}
			get(sessionId) {
				return this.sessions.get(sessionId) ?? EMPTY_READY;
			}
			getPending(sessionId) {
				return this.pending.get(sessionId) ?? EMPTY_PENDING;
			}
			find(ref) {
				return this.byRef.get(ref);
			}
			/** AbortSignal for an in-flight extract (cancelled on remove / clearPending). */
			signalFor(id) {
				return this.controllers.get(id)?.signal;
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
			/** Subscribe to any store change (including activeSessionId). */
			subscribeGlobal(listener) {
				this.globalListeners.add(listener);
				return () => {
					this.globalListeners.delete(listener);
				};
			}
			beginExtract(sessionId, file) {
				const id = crypto.randomUUID();
				const row = {
					id,
					name: file.name,
					size: file.size,
					status: "extracting"
				};
				this.controllers.set(id, new AbortController());
				this.pending.set(sessionId, [...this.getPending(sessionId), row]);
				this.touch(sessionId);
				return id;
			}
			failExtract(sessionId, id, error) {
				this.releaseController(id, false);
				const next = this.getPending(sessionId).map((row) => row.id === id ? {
					...row,
					status: "error",
					error
				} : row);
				this.pending.set(sessionId, next);
				this.touch(sessionId);
			}
			hasPending(sessionId, id) {
				return this.getPending(sessionId).some((row) => row.id === id);
			}
			clearPending(sessionId, id) {
				this.releaseController(id, true);
				const next = this.getPending(sessionId).filter((row) => row.id !== id);
				if (next.length === this.getPending(sessionId).length) return;
				if (next.length === 0) this.pending.delete(sessionId);
				else this.pending.set(sessionId, next);
				this.touch(sessionId);
			}
			/**
			* Drop stale *error* cards only. In-flight OCR must survive send/commit so a
			* sibling file still extracting is not silently abandoned mid-fetch.
			*/
			clearErrorPending(sessionId) {
				const current = this.getPending(sessionId);
				const next = current.filter((row) => row.status !== "error");
				if (next.length === current.length) return;
				if (next.length === 0) this.pending.delete(sessionId);
				else this.pending.set(sessionId, next);
				this.touch(sessionId);
			}
			/**
			* @deprecated Prefer {@link clearErrorPending} on send. Kept for tests /
			* explicit cancel-all; aborts every in-flight extract for the session.
			*/
			discardPending(sessionId) {
				for (const row of this.getPending(sessionId)) this.releaseController(row.id, true);
				if (this.getPending(sessionId).length === 0) return;
				this.pending.delete(sessionId);
				this.touch(sessionId);
			}
			add(sessionId, file) {
				this.byRef.set(file.ref, file);
				this.sessions.set(sessionId, [...this.get(sessionId), file]);
				this.touch(sessionId);
			}
			remove(sessionId, ref) {
				const pendingNext = this.getPending(sessionId).filter((row) => row.id !== ref);
				if (pendingNext.length !== this.getPending(sessionId).length) {
					this.releaseController(ref, true);
					if (pendingNext.length === 0) this.pending.delete(sessionId);
					else this.pending.set(sessionId, pendingNext);
					this.touch(sessionId);
					return;
				}
				const next = this.get(sessionId).filter((file) => file.ref !== ref);
				if (next.length === this.get(sessionId).length) return;
				this.byRef.delete(ref);
				if (next.length === 0) this.sessions.delete(sessionId);
				else this.sessions.set(sessionId, next);
				this.touch(sessionId);
			}
			/**
			* Align visible ready rows with draft OCR refs (DSH commitSend / restoreAttachments).
			* Does **not** drop payloads from `byRef` — ordinary send serializes chips after
			* commit-draft clears the editor, and failed sends restore chips from the same refs.
			*/
			retain(sessionId, refs) {
				const current = this.get(sessionId);
				const next = [];
				const seen = /* @__PURE__ */ new Set();
				for (const file of current) {
					if (!refs.has(file.ref) || seen.has(file.ref)) continue;
					next.push(file);
					seen.add(file.ref);
				}
				for (const ref of refs) {
					if (seen.has(ref)) continue;
					const file = this.byRef.get(ref);
					if (file === void 0) continue;
					next.push(file);
					seen.add(ref);
				}
				if (next.length === current.length && next.every((file, index) => file.ref === current[index]?.ref)) return;
				if (next.length === 0) this.sessions.delete(sessionId);
				else this.sessions.set(sessionId, next);
				this.touch(sessionId);
			}
			/** Drop payloads that are no longer shown in any session (after a successful clear settles). */
			gcPayloads() {
				const live = /* @__PURE__ */ new Set();
				for (const rows of this.sessions.values()) for (const file of rows) live.add(file.ref);
				let changed = false;
				for (const ref of [...this.byRef.keys()]) {
					if (live.has(ref)) continue;
					this.byRef.delete(ref);
					changed = true;
				}
				if (changed) this.generation += 1;
			}
			/**
			* Schedule payload GC on the store (survives React effect cleanup).
			* Re-scheduling extends the window so failed-restore can rehydrate first.
			*/
			scheduleGc(delayMs = 1500) {
				if (this.gcTimer !== null) clearTimeout(this.gcTimer);
				this.gcTimer = setTimeout(() => {
					this.gcTimer = null;
					this.gcPayloads();
				}, delayMs);
			}
			clear() {
				if (this.gcTimer !== null) {
					clearTimeout(this.gcTimer);
					this.gcTimer = null;
				}
				for (const id of [...this.controllers.keys()]) this.releaseController(id, true);
				this.sessions.clear();
				this.pending.clear();
				this.byRef.clear();
				this.activeSessionId = void 0;
				this.generation += 1;
				for (const listeners of this.listeners.values()) for (const listener of listeners) listener();
				this.listeners.clear();
				for (const listener of this.globalListeners) listener();
			}
			releaseController(id, abort) {
				const controller = this.controllers.get(id);
				if (controller === void 0) return;
				this.controllers.delete(id);
				if (abort && !controller.signal.aborted) controller.abort();
			}
			touch(sessionId) {
				this.activeSessionId = sessionId;
				this.generation += 1;
				for (const listener of this.listeners.get(sessionId) ?? []) listener();
				for (const listener of this.globalListeners) listener();
			}
		};
		//#endregion
		//#region src/client/SentFileMessage.tsx
		var import_SentFileMessage_module_css = /* @__PURE__ */ __toESM((/* @__PURE__ */ __commonJSMin(((exports, module) => {
			const css = "._0VOw8W_wrap{flex-direction:column;align-items:flex-end;gap:8px;min-width:0;display:flex}._0VOw8W_row{flex-direction:column;align-items:flex-end;gap:6px;display:flex}._0VOw8W_stack{flex-direction:column;align-items:flex-end;gap:8px;min-width:0;max-width:min(525px,82%);display:flex}._0VOw8W_files{flex-wrap:wrap;justify-content:flex-end;gap:8px;display:flex}._0VOw8W_card{border:1px solid var(--dsw-alias-border-l2);width:min(280px,100%);color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-layer-1);border-radius:12px;align-items:center;gap:9px;padding:9px 12px 9px 10px;display:flex}._0VOw8W_icon{flex:none;justify-content:center;align-items:center;width:28px;height:28px;display:inline-flex}._0VOw8W_details{flex-direction:column;flex:auto;min-width:0;display:flex}._0VOw8W_name{text-overflow:ellipsis;white-space:nowrap;font-size:14px;font-weight:500;line-height:20px;overflow:hidden}._0VOw8W_meta{color:var(--dsw-alias-label-tertiary);font-size:11px;line-height:16px}._0VOw8W_bubble{max-width:100%;color:var(--dsw-alias-label-primary);background:var(--dsw-specific-bubble);white-space:pre-wrap;overflow-wrap:anywhere;border-radius:22px;padding:10px 16px;font-size:16px;line-height:24px}._0VOw8W_extra{background:var(--dsw-alias-bg-layer-1);border-radius:8px;max-width:100%;margin:0;padding:8px;font-size:12px;overflow:auto}._0VOw8W_copy{color:var(--dsw-alias-label-tertiary);cursor:pointer;background:0 0;border:0;padding:2px 6px;font-size:12px}._0VOw8W_copy:hover{color:var(--dsw-alias-label-secondary)}";
			const tagId = "dsh-file-upload-ocr-plugin/SentFileMessage.module.css";
			if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
				const tag = document.createElement("style");
				tag.dataset.plugin = "dsh-file-upload-ocr-plugin";
				tag.dataset.pluginCss = tagId;
				tag.textContent = css;
				document.head.appendChild(tag);
			}
			module.exports = {
				"stack": "_0VOw8W_stack",
				"files": "_0VOw8W_files",
				"card": "_0VOw8W_card",
				"name": "_0VOw8W_name",
				"meta": "_0VOw8W_meta",
				"wrap": "_0VOw8W_wrap",
				"bubble": "_0VOw8W_bubble",
				"row": "_0VOw8W_row",
				"copy": "_0VOw8W_copy",
				"icon": "_0VOw8W_icon",
				"extra": "_0VOw8W_extra",
				"details": "_0VOw8W_details"
			};
		})))(), 1);
		const HEADER = /<attached_file name=("(?:\\.|[^"\\])*") kind=("(?:\\.|[^"\\])*") size=(\d+) chars=(\d+)>\n/g;
		const LEGACY = /<attached_file name=("(?:\\.|[^"\\])*") kind=("(?:\\.|[^"\\])*")>\n[\s\S]*?\n<\/attached_file>/g;
		const CLOSE = "\n</attached_file>";
		/** Strip `<attached_file>` payloads from durable text; return cards + visible remainder. */
		function projectAttachedFiles(text) {
			const files = [];
			let visible = "";
			let cursor = 0;
			HEADER.lastIndex = 0;
			let match;
			while ((match = HEADER.exec(text)) !== null) {
				const chars = Number(match[4]);
				const contentEnd = HEADER.lastIndex + chars;
				if (text.slice(contentEnd, contentEnd + 17) !== CLOSE) {
					visible += text.slice(cursor, match.index + match[0].length);
					cursor = match.index + match[0].length;
					HEADER.lastIndex = cursor;
					continue;
				}
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
		function OcrFileCards({ files }) {
			if (files.length === 0) return null;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: import_SentFileMessage_module_css.default.files,
				"data-ocr-sent-files": "1",
				children: files.map((file, index) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: import_SentFileMessage_module_css.default.card,
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: import_SentFileMessage_module_css.default.icon,
						"aria-hidden": "true",
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.FileTypeIcon, { path: file.name })
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
						className: import_SentFileMessage_module_css.default.details,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: import_SentFileMessage_module_css.default.name,
							title: file.name,
							children: file.name
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: import_SentFileMessage_module_css.default.meta,
							children: [(0, _deepseek_ai_dsh_client_ui_primitives.fileExtension)(file.name).toUpperCase().slice(0, 8) || file.kind.toUpperCase(), file.size !== void 0 ? (0, _deepseek_ai_dsh_client_ui_primitives.fileSizeText)(file.size) : ""].filter(Boolean).join(" · ")
						})]
					})]
				}, `${file.name}:${index}`))
			});
		}
		function rewriteNodeContent(props) {
			const content = props.node.data.content;
			const files = [];
			const nextContent = content.map((block) => {
				if (block.type !== "text" || block.text === void 0) return block;
				const projected = projectAttachedFiles(block.text);
				files.push(...projected.files);
				if (projected.text === block.text) return block;
				return {
					...block,
					text: projected.text
				};
			});
			if (files.length === 0) return {
				props,
				files
			};
			return {
				files,
				props: {
					...props,
					node: {
						...props.node,
						data: {
							...props.node.data,
							content: nextContent
						}
					}
				}
			};
		}
		function FallbackUserBubble({ node, renderMessageImages }) {
			const texts = [];
			const images = [];
			for (const block of node.data.content) if (block.type === "text" && block.text !== void 0) texts.push(block.text);
			else if (block.type === "image" && block.attachment !== void 0) images.push({ attachment: block.attachment });
			const projected = projectAttachedFiles(texts.join(""));
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: import_SentFileMessage_module_css.default.row,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: import_SentFileMessage_module_css.default.stack,
					children: [
						images.length > 0 && renderMessageImages({
							images,
							align: "end",
							compact: images.length > 1
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(OcrFileCards, { files: projected.files }),
						projected.text !== "" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: import_SentFileMessage_module_css.default.bubble,
							children: projected.text
						})
					]
				})
			});
		}
		/**
		* Wrap native `UserMessageNodeView` (priority 0) so projectUserText / actions /
		* locale stay on DSH; only strip OCR tags and render OCR file cards.
		*/
		function createOcrUserChatNode(ctx) {
			function OcrUserChatNode(props) {
				const Native = ctx.slots.entries("conversation.chat.node").find((entry) => entry.options.key === "user" && entry.component !== OcrUserChatNode && (entry.options.priority ?? 0) === 0)?.component;
				const { props: next, files } = rewriteNodeContent(props);
				if (Native === void 0) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(FallbackUserBubble, { ...props });
				return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: import_SentFileMessage_module_css.default.wrap,
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(OcrFileCards, { files }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Native, { ...next })]
				});
			}
			return (0, react.memo)(OcrUserChatNode);
		}
		/** Steering equivalent of {@link createOcrUserChatNode}. */
		function createOcrSteeringChatNode(ctx) {
			function OcrSteeringChatNode(props) {
				const Native = ctx.slots.entries("conversation.chat.node").find((entry) => entry.options.key === "steering" && entry.component !== OcrSteeringChatNode && (entry.options.priority ?? 0) === 0)?.component;
				const { props: next, files } = rewriteNodeContent(props);
				if (Native === void 0) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(FallbackUserBubble, { ...props });
				return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: import_SentFileMessage_module_css.default.wrap,
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(OcrFileCards, { files }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Native, { ...next })]
				});
			}
			return (0, react.memo)(OcrSteeringChatNode);
		}
		(0, react.memo)(function SentUserFileMessage(props) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(FallbackUserBubble, { ...props });
		});
		(0, react.memo)(function SentSteeringFileMessage(props) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(FallbackUserBubble, { ...props });
		});
		//#endregion
		//#region src/client/index.ts
		const inject = [
			"slots",
			"sessions",
			"conversation",
			"inputTriggers"
		];
		/**
		* Invisible chip label. The composer still needs a Lexical reference occurrence
		* so codec.serialize runs on send, but the FileCard rail is the only visible UI.
		* Chips whose title is exactly this marker are hidden via CSS.
		*/
		const HIDDEN_CHIP_LABEL = "﻿";
		function ensureHiddenChipStyles() {
			if (typeof document === "undefined") return;
			const tagId = "dsh-file-upload-ocr-plugin/hidden-reference-chip";
			if (document.querySelector(`style[data-plugin-css=${JSON.stringify(tagId)}]`) !== null) return;
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-file-upload-ocr-plugin";
			tag.dataset.pluginCss = tagId;
			tag.textContent = [
				`span[title=${JSON.stringify(HIDDEN_CHIP_LABEL)}]{`,
				"display:none!important;",
				"}"
			].join("");
			document.head.appendChild(tag);
		}
		/** Register generic file cards and their hidden model serializer. */
		function apply(ctx) {
			ensureHiddenChipStyles();
			const files = new FileAttachmentStore();
			const conversation = ctx.conversation;
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
					input: conversation.input.for(actx)
				};
			};
			const removeFor = (sessionId) => (ref) => {
				const resolved = sessionId ?? files.getActiveSessionId();
				if (resolved === void 0) return;
				const { input } = scopedInput(resolved);
				const snapshot = input.state.getSnapshot();
				const occurrence = snapshot.occurrences.find((item) => item.source === "file-attachment" && item.ref === ref);
				if (occurrence !== void 0) input.setDraft(snapshot.draft.slice(0, occurrence.offset) + snapshot.draft.slice(occurrence.offset + occurrence.length));
				files.remove(resolved, ref);
			};
			ctx.slots.inject("conversation.input.left", () => ctx.slots.register({
				name: "conversation.input.left",
				id: "file-input",
				order: 30,
				inject: (sessionId) => ({
					beginExtract: (browserFile) => files.beginExtract(sessionId, browserFile),
					extractSignal: (id) => files.signalFor(id),
					failExtract: (id, error) => {
						files.failExtract(sessionId, id, error);
					},
					clearPending: (id) => {
						files.clearPending(sessionId, id);
					},
					hasPending: (id) => files.hasPending(sessionId, id),
					resetUploadErrors: () => {
						files.clearErrorPending(sessionId);
					},
					attach: (browserFile, result) => {
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
							label: HIDDEN_CHIP_LABEL,
							appearance: "file",
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
					},
					attachImage: async (browserFile) => {
						const { input } = scopedInput(sessionId);
						const drafts = conversation.createDrafts(sessionId, [browserFile]);
						if (drafts.length === 0) throw new Error("无法读取图片 / Unable to read image.");
						if (!input.addAttachments(drafts.map((draft) => draft.id))) {
							conversation.releaseDraftAttachments(drafts);
							throw new Error("当前输入状态不能添加图片 / Images cannot be added in the current input state.");
						}
					}
				})
			}, FileAttachButton));
			const OcrComposerAttachments = createOcrComposerAttachments(ctx);
			ctx.slots.inject("conversation.input.attachments", () => ctx.slots.register({
				name: "conversation.input.attachments",
				locale: "conversation",
				priority: -10,
				inject: (sessionId) => ({
					files,
					ocrSessionId: sessionId,
					remove: removeFor(sessionId)
				})
			}, OcrComposerAttachments));
			const OcrUserChatNode = createOcrUserChatNode(ctx);
			const OcrSteeringChatNode = createOcrSteeringChatNode(ctx);
			ctx.slots.inject("conversation.chat.node", () => ctx.slots.register({
				name: "conversation.chat.node",
				key: "user",
				priority: -10
			}, OcrUserChatNode));
			ctx.slots.inject("conversation.chat.node", () => ctx.slots.register({
				name: "conversation.chat.node",
				key: "steering",
				priority: -10
			}, OcrSteeringChatNode));
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map