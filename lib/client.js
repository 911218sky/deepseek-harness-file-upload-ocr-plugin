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
		let _deepseek_ai_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		let _deepseek_ai_dsh_client_ui_attachment = require("@deepseek-ai/dsh-client-ui-attachment");
		let react_jsx_runtime = require("react/jsx-runtime");
		//#endregion
		//#region src/client/FileAttachments.tsx
		var import_FileAttachments_module_css = /* @__PURE__ */ __toESM((/* @__PURE__ */ __commonJSMin(((exports, module) => {
			const css = ".crEFWW_hidden{display:none}.crEFWW_buttonRoot{align-items:center;min-width:0;display:inline-flex}.crEFWW_attachButton,.crEFWW_remove{color:var(--dsw-alias-label-secondary);cursor:pointer;background:0 0;border:0;justify-content:center;align-items:center;display:inline-flex}.crEFWW_attachButton{border-radius:8px;width:28px;height:28px}.crEFWW_attachButton:hover:not(:disabled),.crEFWW_remove:hover{background:var(--dsw-alias-interactive-bg-hover)}.crEFWW_attachButton:disabled{cursor:wait;opacity:.55}.crEFWW_error{max-width:220px;color:var(--dsw-static-red-600);text-overflow:ellipsis;white-space:nowrap;margin-left:6px;font-size:12px;overflow:hidden}.crEFWW_composerRail{min-width:0;margin-bottom:-6px;padding:2px 10px 0}.crEFWW_rail{scrollbar-width:none;flex-wrap:nowrap;align-items:stretch;gap:10px;min-width:0;display:flex;overflow:auto hidden}.crEFWW_rail::-webkit-scrollbar{display:none}.crEFWW_card{box-sizing:border-box;border:.5px solid var(--dsw-alias-border-l2,#0000001f);width:240px;height:64px;color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-layer-1,var(--dsw-specific-input-major,transparent));text-align:left;border-radius:16px;flex:none;align-items:center;gap:10px;padding:0 12px;display:inline-flex;position:relative}.crEFWW_cardPending{border-style:dashed}.crEFWW_cardError{border-color:var(--dsw-alias-state-error-primary,#d54941)}.crEFWW_spinner{box-sizing:border-box;border:2px solid var(--dsw-alias-border-l3,#00000029);border-top-color:var(--dsw-static-deepseek-500,#4d6bfe);border-radius:50%;width:18px;height:18px;animation:.8s linear infinite crEFWW_dsh-ocr-spin}@keyframes crEFWW_dsh-ocr-spin{to{transform:rotate(360deg)}}.crEFWW_fileIcon{width:28px;height:28px;color:var(--dsw-static-deepseek-500);background:var(--dsw-static-deepseek-50);border-radius:7px;flex:none;justify-content:center;align-items:center;display:inline-flex}.crEFWW_pdf{color:#b42318;background:#fee4e2}.crEFWW_image{color:#6941c6;background:#f4ebff}.crEFWW_word{color:#175cd3;background:#eff8ff}.crEFWW_excel{color:#027a48;background:#ecfdf3}.crEFWW_powerpoint{color:#c4320a;background:#fff4ed}.crEFWW_text{color:#475467;background:#f2f4f7}.crEFWW_generic{color:var(--dsw-static-deepseek-500);background:var(--dsw-static-deepseek-50)}.crEFWW_details{flex-direction:column;flex:auto;min-width:0;padding:8px 0;display:flex}.crEFWW_name{text-overflow:ellipsis;white-space:nowrap;font-size:14px;font-weight:500;line-height:22px;overflow:hidden}.crEFWW_size{color:var(--dsw-alias-label-tertiary,#00000073);text-overflow:ellipsis;white-space:nowrap;font-size:12px;line-height:18px;overflow:hidden}.crEFWW_remove{border-radius:6px;flex:none;width:24px;height:24px}.crEFWW_choiceList{flex-direction:column;gap:10px;display:flex}.crEFWW_choiceCard{border:.5px solid var(--dsw-alias-border-l3);width:100%;color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-layer-1);text-align:left;cursor:pointer;border-radius:16px;align-items:center;gap:12px;padding:14px 14px 14px 12px;transition:background .12s,border-color .12s,box-shadow .12s;display:flex}.crEFWW_choiceCard:hover{border-color:var(--dsw-alias-brand-primary);background:var(--dsw-alias-interactive-bg-hover)}.crEFWW_choiceCard:focus-visible{outline:2px solid var(--dsw-alias-border-l4);outline-offset:2px}.crEFWW_choiceCard:active{background:var(--dsw-alias-interactive-bg-active)}.crEFWW_choiceIcon{border-radius:12px;flex:none;justify-content:center;align-items:center;width:36px;height:36px;display:inline-flex}.crEFWW_choiceIconVision{color:var(--dsw-static-deepseek-500);background:var(--dsw-static-deepseek-50)}.crEFWW_choiceIconOcr{color:#6941c6;background:#f4ebff}.crEFWW_choiceCopy{flex-direction:column;flex:auto;gap:2px;min-width:0;display:flex}.crEFWW_choiceLabel{color:var(--dsw-alias-label-primary);font-size:14px;font-weight:500;line-height:22px}.crEFWW_choiceHint{color:var(--dsw-alias-label-tertiary);font-size:12px;font-weight:400;line-height:18px}";
			const tagId = "dsh-file-upload-ocr-plugin/FileAttachments.module.css";
			if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
				const tag = document.createElement("style");
				tag.dataset.plugin = "dsh-file-upload-ocr-plugin";
				tag.dataset.pluginCss = tagId;
				tag.textContent = css;
				document.head.appendChild(tag);
			}
			module.exports = {
				"dsh-ocr-spin": "crEFWW_dsh-ocr-spin",
				"choiceIconVision": "crEFWW_choiceIconVision",
				"fileIcon": "crEFWW_fileIcon",
				"choiceCopy": "crEFWW_choiceCopy",
				"composerRail": "crEFWW_composerRail",
				"choiceIcon": "crEFWW_choiceIcon",
				"choiceLabel": "crEFWW_choiceLabel",
				"rail": "crEFWW_rail",
				"size": "crEFWW_size",
				"choiceList": "crEFWW_choiceList",
				"generic": "crEFWW_generic",
				"attachButton": "crEFWW_attachButton",
				"choiceCard": "crEFWW_choiceCard",
				"error": "crEFWW_error",
				"pdf": "crEFWW_pdf",
				"details": "crEFWW_details",
				"powerpoint": "crEFWW_powerpoint",
				"name": "crEFWW_name",
				"cardPending": "crEFWW_cardPending",
				"buttonRoot": "crEFWW_buttonRoot",
				"image": "crEFWW_image",
				"cardError": "crEFWW_cardError",
				"hidden": "crEFWW_hidden",
				"text": "crEFWW_text",
				"excel": "crEFWW_excel",
				"word": "crEFWW_word",
				"choiceIconOcr": "crEFWW_choiceIconOcr",
				"choiceHint": "crEFWW_choiceHint",
				"card": "crEFWW_card",
				"remove": "crEFWW_remove",
				"spinner": "crEFWW_spinner"
			};
		})))(), 1);
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
		function FileAttachButton({ attach, attachImage, beginExtract, failExtract, clearPending }) {
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
				try {
					const useVision = imageMode === "vision" && attachImage !== void 0;
					for (const file of selected) {
						if (file.type.startsWith("image/") && useVision) {
							try {
								await attachImage(file);
							} catch (reason) {
								setError(reason instanceof Error ? reason.message : String(reason));
							}
							continue;
						}
						const pendingId = beginExtract(file);
						try {
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
							clearPending(pendingId);
						} catch (reason) {
							const message = reason instanceof Error ? reason.message : String(reason);
							failExtract(pendingId, message);
							setError(message);
						}
					}
				} finally {
					busyRef.current = false;
					setBusy(false);
				}
			};
			const upload = (selected) => {
				if (selected.length === 0 || busyRef.current) return;
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
					if (!busyRef.current && pendingFiles === null) upload([...event.dataTransfer?.files ?? []]);
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
							picker.current?.click();
						},
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(FileIcon, { size: 16 })
					}),
					error !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: import_FileAttachments_module_css.default.error,
						role: "alert",
						children: error
					}),
					dragActive && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_attachment.DropOverlay, {
						disabled: busy,
						labels: {
							title: busy ? "正在添加文件 / Adding files" : "拖放文件以上传 / Drop files to upload",
							desc: busy ? void 0 : "支持 PDF、图片、Word、Excel、PPT 和文本文件 / PDF, images, Word, Excel, PPT, and text files"
						}
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
									children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
										width: "18",
										height: "18",
										viewBox: "0 0 16 16",
										fill: "none",
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
											d: "M2.5 8s2.2-3.5 5.5-3.5S13.5 8 13.5 8s-2.2 3.5-5.5 3.5S2.5 8 2.5 8Z",
											stroke: "currentColor",
											strokeWidth: "1.3",
											strokeLinejoin: "round"
										}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
											cx: "8",
											cy: "8",
											r: "1.6",
											stroke: "currentColor",
											strokeWidth: "1.3"
										})]
									})
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
									children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
										width: "18",
										height: "18",
										viewBox: "0 0 16 16",
										fill: "none",
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
											d: "M3.5 2.5h6l3 3v8h-9v-11Z",
											stroke: "currentColor",
											strokeWidth: "1.3",
											strokeLinejoin: "round"
										}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
											d: "M9.5 2.6v3h3M5.5 8.5h5M5.5 11h3.5",
											stroke: "currentColor",
											strokeWidth: "1.3",
											strokeLinecap: "round",
											strokeLinejoin: "round"
										})]
									})
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
		function fileSize$1(bytes) {
			if (bytes < 1024) return `${bytes} B`;
			if (bytes < 1048576) return `${Math.ceil(bytes / 1024)} KB`;
			return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
		}
		const EMPTY_FILES = [];
		const EMPTY_PENDING$1 = [];
		function Spinner() {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
				className: import_FileAttachments_module_css.default.spinner,
				"aria-hidden": "true"
			});
		}
		/** OCR/file cards styled like native FileCard, rendered inside the composer. */
		function FileAttachmentRail({ sessionId, useInput, files, remove }) {
			const occurrences = useInput((state) => state?.occurrences ?? []);
			const phase = useInput((state) => state?.phase);
			const ready = (0, react.useSyncExternalStore)((listener) => sessionId === void 0 ? () => {} : files.subscribe(sessionId, listener), () => sessionId === void 0 ? EMPTY_FILES : files.get(sessionId));
			const pending = (0, react.useSyncExternalStore)((listener) => sessionId === void 0 ? () => {} : files.subscribe(sessionId, listener), () => sessionId === void 0 ? EMPTY_PENDING$1 : files.getPending(sessionId));
			const activeRefs = (0, react.useMemo)(() => new Set(occurrences.filter((item) => item.source === FILE_SOURCE).map((item) => item.ref)), [occurrences]);
			const active = sessionId === void 0 ? EMPTY_FILES : activeRefs.size > 0 ? ready.filter((file) => activeRefs.has(file.ref)) : ready;
			const refKey = [...activeRefs].join("\0");
			(0, react.useEffect)(() => {
				if (sessionId === void 0 || phase === "submitting") return;
				const timer = setTimeout(() => {
					files.retain(sessionId, activeRefs);
				}, 1e3);
				return () => clearTimeout(timer);
			}, [
				activeRefs,
				files,
				phase,
				refKey,
				sessionId
			]);
			if (sessionId === void 0 || active.length === 0 && pending.length === 0) return null;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: import_FileAttachments_module_css.default.composerRail,
				"aria-label": "已添加的文件 / Added files",
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: import_FileAttachments_module_css.default.rail,
					children: [pending.map((file) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: `${import_FileAttachments_module_css.default.card} ${file.status === "error" ? import_FileAttachments_module_css.default.cardError : import_FileAttachments_module_css.default.cardPending}`,
						"aria-busy": file.status === "extracting",
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: `${import_FileAttachments_module_css.default.fileIcon} ${file.status === "error" ? import_FileAttachments_module_css.default.generic : import_FileAttachments_module_css.default.image}`,
								"aria-hidden": "true",
								children: file.status === "extracting" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Spinner, {}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(FileIcon, { size: 16 })
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
								className: import_FileAttachments_module_css.default.details,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: import_FileAttachments_module_css.default.name,
									title: file.name,
									children: file.name
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: import_FileAttachments_module_css.default.size,
									children: file.status === "extracting" ? `OCR 辨識中… · ${fileSize$1(file.size)}` : file.error ?? "辨識失敗"
								})]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: import_FileAttachments_module_css.default.remove,
								"aria-label": `移除 / Remove ${file.name}`,
								onClick: () => {
									remove(file.id);
								},
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCloseOutline16, { size: 14 })
							})
						]
					}, file.id)), active.map((file) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: import_FileAttachments_module_css.default.card,
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: `${import_FileAttachments_module_css.default.fileIcon} ${import_FileAttachments_module_css.default[fileKindClass(file.kind)]}`,
								"aria-hidden": "true",
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(FileIcon, { size: 16 })
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
								className: import_FileAttachments_module_css.default.details,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: import_FileAttachments_module_css.default.name,
									title: file.name,
									children: file.name
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
									className: import_FileAttachments_module_css.default.size,
									children: [
										fileSize$1(file.size),
										" · ",
										file.kind
									]
								})]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: import_FileAttachments_module_css.default.remove,
								"aria-label": `移除 / Remove ${file.name}`,
								onClick: () => {
									remove(file.ref);
								},
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCloseOutline16, { size: 14 })
							})
						]
					}, file.ref))]
				})
			});
		}
		/**
		* Wrap native ComposerAttachments (images) and append OCR FileCards in the same
		* in-composer attachments seat. Resolves the shadowed native entry at render time.
		*/
		function createOcrComposerAttachments(ctx) {
			function OcrComposerAttachments({ files, remove, sessionId, useInput, ...nativeProps }) {
				const Native = ctx.slots.entries("conversation.input.attachments").find((entry) => (entry.options.priority ?? 0) === 0)?.component;
				return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [Native !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Native, {
					...nativeProps,
					sessionId,
					useInput
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(FileAttachmentRail, {
					sessionId,
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
			listeners = /* @__PURE__ */ new Map();
			get(sessionId) {
				return this.sessions.get(sessionId) ?? EMPTY_READY;
			}
			getPending(sessionId) {
				return this.pending.get(sessionId) ?? EMPTY_PENDING;
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
			beginExtract(sessionId, file) {
				const id = crypto.randomUUID();
				const row = {
					id,
					name: file.name,
					size: file.size,
					status: "extracting"
				};
				this.pending.set(sessionId, [...this.getPending(sessionId), row]);
				this.emit(sessionId);
				return id;
			}
			failExtract(sessionId, id, error) {
				const next = this.getPending(sessionId).map((row) => row.id === id ? {
					...row,
					status: "error",
					error
				} : row);
				this.pending.set(sessionId, next);
				this.emit(sessionId);
			}
			clearPending(sessionId, id) {
				const next = this.getPending(sessionId).filter((row) => row.id !== id);
				if (next.length === this.getPending(sessionId).length) return;
				if (next.length === 0) this.pending.delete(sessionId);
				else this.pending.set(sessionId, next);
				this.emit(sessionId);
			}
			add(sessionId, file) {
				this.byRef.set(file.ref, file);
				this.sessions.set(sessionId, [...this.get(sessionId), file]);
				this.emit(sessionId);
			}
			remove(sessionId, ref) {
				const pendingNext = this.getPending(sessionId).filter((row) => row.id !== ref);
				if (pendingNext.length !== this.getPending(sessionId).length) {
					if (pendingNext.length === 0) this.pending.delete(sessionId);
					else this.pending.set(sessionId, pendingNext);
					this.emit(sessionId);
					return;
				}
				const next = this.get(sessionId).filter((file) => file.ref !== ref);
				if (next.length === this.get(sessionId).length) return;
				this.byRef.delete(ref);
				if (next.length === 0) this.sessions.delete(sessionId);
				else this.sessions.set(sessionId, next);
				this.emit(sessionId);
			}
			retain(sessionId, refs) {
				const current = this.get(sessionId);
				if (refs.size === 0 && current.length > 0) return;
				const next = current.filter((file) => refs.has(file.ref));
				if (next.length === current.length) return;
				for (const file of current) if (!refs.has(file.ref)) this.byRef.delete(file.ref);
				if (next.length === 0) this.sessions.delete(sessionId);
				else this.sessions.set(sessionId, next);
				this.emit(sessionId);
			}
			clear() {
				this.sessions.clear();
				this.pending.clear();
				this.byRef.clear();
				for (const listeners of this.listeners.values()) for (const listener of listeners) listener();
				this.listeners.clear();
			}
			emit(sessionId) {
				for (const listener of this.listeners.get(sessionId) ?? []) listener();
			}
		};
		//#endregion
		//#region src/client/SentFileMessage.tsx
		var import_SentFileMessage_module_css = /* @__PURE__ */ __toESM((/* @__PURE__ */ __commonJSMin(((exports, module) => {
			const css = "._0VOw8W_row{flex-direction:column;align-items:flex-end;gap:6px;display:flex}._0VOw8W_stack{flex-direction:column;align-items:flex-end;gap:8px;min-width:0;max-width:min(525px,82%);display:flex}._0VOw8W_files{flex-wrap:wrap;justify-content:flex-end;gap:8px;display:flex}._0VOw8W_card{border:1px solid var(--dsw-alias-border-l2);width:min(280px,100%);color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-layer-1);border-radius:12px;align-items:center;gap:9px;padding:9px 12px 9px 10px;display:flex}._0VOw8W_icon{width:32px;height:32px;color:var(--dsw-static-deepseek-500);background:var(--dsw-static-deepseek-50);border-radius:8px;flex:none;justify-content:center;align-items:center;display:inline-flex}._0VOw8W_pdf{color:#b42318;background:#fee4e2}._0VOw8W_image{color:#6941c6;background:#f4ebff}._0VOw8W_word{color:#175cd3;background:#eff8ff}._0VOw8W_excel{color:#027a48;background:#ecfdf3}._0VOw8W_powerpoint{color:#c4320a;background:#fff4ed}._0VOw8W_text{color:#475467;background:#f2f4f7}._0VOw8W_generic{color:var(--dsw-static-deepseek-500);background:var(--dsw-static-deepseek-50)}._0VOw8W_details{flex-direction:column;flex:auto;min-width:0;display:flex}._0VOw8W_name{text-overflow:ellipsis;white-space:nowrap;font-size:14px;font-weight:500;line-height:20px;overflow:hidden}._0VOw8W_meta{color:var(--dsw-alias-label-tertiary);font-size:11px;line-height:16px}._0VOw8W_bubble{max-width:100%;color:var(--dsw-alias-label-primary);background:var(--dsw-specific-bubble);white-space:pre-wrap;overflow-wrap:anywhere;border-radius:22px;padding:10px 16px;font-size:16px;line-height:24px}._0VOw8W_extra{background:var(--dsw-alias-bg-layer-1);border-radius:8px;max-width:100%;margin:0;padding:8px;font-size:12px;overflow:auto}._0VOw8W_copy{color:var(--dsw-alias-label-tertiary);cursor:pointer;background:0 0;border:0;padding:2px 6px;font-size:12px}._0VOw8W_copy:hover{color:var(--dsw-alias-label-secondary)}";
			const tagId = "dsh-file-upload-ocr-plugin/SentFileMessage.module.css";
			if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
				const tag = document.createElement("style");
				tag.dataset.plugin = "dsh-file-upload-ocr-plugin";
				tag.dataset.pluginCss = tagId;
				tag.textContent = css;
				document.head.appendChild(tag);
			}
			module.exports = {
				"meta": "_0VOw8W_meta",
				"stack": "_0VOw8W_stack",
				"image": "_0VOw8W_image",
				"details": "_0VOw8W_details",
				"copy": "_0VOw8W_copy",
				"word": "_0VOw8W_word",
				"generic": "_0VOw8W_generic",
				"text": "_0VOw8W_text",
				"card": "_0VOw8W_card",
				"name": "_0VOw8W_name",
				"files": "_0VOw8W_files",
				"icon": "_0VOw8W_icon",
				"bubble": "_0VOw8W_bubble",
				"extra": "_0VOw8W_extra",
				"row": "_0VOw8W_row",
				"powerpoint": "_0VOw8W_powerpoint",
				"pdf": "_0VOw8W_pdf",
				"excel": "_0VOw8W_excel"
			};
		})))(), 1);
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
			if (bytes < 1048576) return `${Math.ceil(bytes / 1024)} KB`;
			return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
		}
		function CopyButton({ text }) {
			const [copied, setCopied] = (0, react.useState)(false);
			if (text === "") return null;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
				type: "button",
				className: import_SentFileMessage_module_css.default.copy,
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
				className: import_SentFileMessage_module_css.default.row,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: import_SentFileMessage_module_css.default.stack,
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
							className: import_SentFileMessage_module_css.default.files,
							children: projected.files.map((file, index) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: import_SentFileMessage_module_css.default.card,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: `${import_SentFileMessage_module_css.default.icon} ${import_SentFileMessage_module_css.default[fileKindClass(file.kind)]}`,
									children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(FileIcon, { size: 18 })
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
									className: import_SentFileMessage_module_css.default.details,
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: import_SentFileMessage_module_css.default.name,
										title: file.name,
										children: file.name
									}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: import_SentFileMessage_module_css.default.meta,
										children: [file.kind.toUpperCase(), fileSize(file.size)].filter(Boolean).join(" · ")
									})]
								})]
							}, `${file.name}:${index}`))
						}),
						projected.text !== "" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: import_SentFileMessage_module_css.default.bubble,
							children: projected.text
						}),
						rest.map((block, index) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("pre", {
							className: import_SentFileMessage_module_css.default.extra,
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
		/**
		* Invisible chip label. The composer still needs a Lexical reference occurrence
		* so codec.serialize runs on send, but the in-composer FileCard rail is the only
		* visible UI. Chips whose title is exactly this marker are hidden via CSS.
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
			ctx.slots.inject("conversation.input.left", () => ctx.slots.register({
				name: "conversation.input.left",
				id: "file-input",
				order: 30,
				inject: (sessionId) => ({
					beginExtract: (browserFile) => files.beginExtract(sessionId, browserFile),
					failExtract: (id, error) => {
						files.failExtract(sessionId, id, error);
					},
					clearPending: (id) => {
						files.clearPending(sessionId, id);
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
					remove: (ref) => {
						if (sessionId === void 0) return;
						const { input } = scopedInput(sessionId);
						const snapshot = input.state.getSnapshot();
						const occurrence = snapshot.occurrences.find((item) => item.source === "file-attachment" && item.ref === ref);
						if (occurrence !== void 0) input.setDraft(snapshot.draft.slice(0, occurrence.offset) + snapshot.draft.slice(occurrence.offset + occurrence.length));
						files.remove(sessionId, ref);
					}
				})
			}, OcrComposerAttachments));
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