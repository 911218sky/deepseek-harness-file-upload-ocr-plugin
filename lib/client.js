window.__ModuleLoader__.load({
	id: "dsh-file-upload-ocr-plugin",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react = require("react");
		let react_dom = require("react-dom");
		let _deepseek_ai_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		let react_jsx_runtime = require("react/jsx-runtime");
		//#region src/client/ocrStyles.ts
		/** Shared layout tokens for OCR UI — DSH alias variables only, no CSS modules. */
		const ocr = {
			hidden: { display: "none" },
			buttonRoot: {
				display: "inline-flex",
				alignItems: "center",
				minWidth: 0
			},
			error: {
				overflow: "hidden",
				maxWidth: 220,
				marginLeft: 6,
				color: "var(--dsw-static-red-600)",
				fontSize: 12,
				textOverflow: "ellipsis",
				whiteSpace: "nowrap"
			},
			composerRail: {
				minWidth: 0,
				marginBottom: 0,
				padding: "6px 10px 10px"
			},
			rail: {
				display: "flex",
				flexWrap: "nowrap",
				alignItems: "stretch",
				gap: 10,
				minWidth: 0,
				overflow: "auto hidden",
				scrollbarWidth: "none"
			},
			fileCard(variant) {
				return {
					display: "inline-flex",
					position: "relative",
					boxSizing: "border-box",
					flex: "none",
					alignItems: "center",
					gap: 10,
					width: 240,
					height: 64,
					padding: "0 12px",
					border: "0.5px solid var(--dsw-alias-border-l2, rgb(0 0 0 / 12%))",
					borderStyle: variant === "pending" ? "dashed" : "solid",
					borderColor: variant === "error" ? "var(--dsw-alias-state-error-primary, #d54941)" : void 0,
					borderRadius: 16,
					color: "var(--dsw-alias-label-primary)",
					background: "var(--dsw-alias-bg-layer-1, var(--dsw-specific-input-major, transparent))",
					textAlign: "left"
				};
			},
			fileIcon: {
				display: "inline-flex",
				flex: "0 0 auto",
				alignItems: "center",
				justifyContent: "center",
				width: 28,
				height: 28
			},
			fileDetails: {
				display: "flex",
				flex: "1 1 auto",
				flexDirection: "column",
				minWidth: 0,
				padding: "8px 0"
			},
			fileName: {
				overflow: "hidden",
				fontSize: 14,
				fontWeight: 500,
				lineHeight: "22px",
				textOverflow: "ellipsis",
				whiteSpace: "nowrap"
			},
			fileMeta: {
				overflow: "hidden",
				color: "var(--dsw-alias-label-tertiary, rgb(0 0 0 / 45%))",
				fontSize: 12,
				lineHeight: "18px",
				textOverflow: "ellipsis",
				whiteSpace: "nowrap"
			},
			fileMetaError: { color: "var(--dsw-alias-state-error-primary, #d54941)" },
			removeButton: {
				display: "inline-flex",
				flex: "0 0 auto",
				alignItems: "center",
				justifyContent: "center",
				width: 24,
				height: 24,
				border: 0,
				borderRadius: 6,
				color: "var(--dsw-alias-label-secondary)",
				background: "transparent",
				cursor: "pointer"
			},
			dropMask: {
				pointerEvents: "none",
				position: "fixed",
				inset: 0,
				zIndex: 1e4,
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				background: "color-mix(in srgb, var(--dsw-alias-bg-layer-1, #fff) 72%, transparent)"
			},
			dropWrap: {
				display: "flex",
				flexDirection: "column",
				gap: 6,
				minWidth: "min(360px, 80vw)",
				padding: "24px 28px",
				border: "1px dashed var(--dsw-alias-brand-primary, #4d6bfe)",
				borderRadius: 16,
				background: "var(--dsw-alias-bg-layer-1, #fff)",
				boxShadow: "0 8px 28px rgb(0 0 0 / 8%)",
				textAlign: "center"
			},
			dropTitle: {
				color: "var(--dsw-alias-label-primary)",
				fontSize: 16,
				fontWeight: 500,
				lineHeight: "24px"
			},
			dropDesc: {
				color: "var(--dsw-alias-label-tertiary)",
				fontSize: 13,
				lineHeight: "20px"
			},
			choiceList: {
				display: "flex",
				flexDirection: "column",
				gap: 10
			},
			choiceCard(active) {
				return {
					display: "flex",
					alignItems: "center",
					gap: 12,
					width: "100%",
					padding: "14px 14px 14px 12px",
					border: `0.5px solid ${active ? "var(--dsw-alias-brand-primary)" : "var(--dsw-alias-border-l3)"}`,
					borderRadius: 16,
					color: "var(--dsw-alias-label-primary)",
					background: active ? "var(--dsw-alias-interactive-bg-hover)" : "var(--dsw-alias-bg-layer-1)",
					textAlign: "left",
					cursor: "pointer"
				};
			},
			choiceIcon(tone) {
				return {
					display: "inline-flex",
					flex: "none",
					alignItems: "center",
					justifyContent: "center",
					width: 36,
					height: 36,
					borderRadius: 12,
					color: tone === "vision" ? "var(--dsw-static-deepseek-500)" : "#6941c6",
					background: tone === "vision" ? "var(--dsw-static-deepseek-50)" : "#f4ebff"
				};
			},
			choiceCopy: {
				display: "flex",
				flex: "1 1 auto",
				flexDirection: "column",
				gap: 2,
				minWidth: 0
			},
			choiceLabel: {
				fontSize: 14,
				lineHeight: "22px",
				fontWeight: 500,
				color: "var(--dsw-alias-label-primary)"
			},
			choiceHint: {
				fontSize: 12,
				lineHeight: "18px",
				fontWeight: 400,
				color: "var(--dsw-alias-label-tertiary)"
			},
			sentWrap: {
				display: "flex",
				flexDirection: "column",
				alignItems: "flex-end",
				gap: 8,
				minWidth: 0
			},
			sentRow: {
				display: "flex",
				flexDirection: "column",
				alignItems: "flex-end",
				gap: 6
			},
			sentStack: {
				display: "flex",
				flexDirection: "column",
				alignItems: "flex-end",
				gap: 8,
				minWidth: 0,
				maxWidth: "min(525px, 82%)"
			},
			sentFiles: {
				display: "flex",
				flexWrap: "wrap",
				justifyContent: "flex-end",
				gap: 8
			},
			sentCard: {
				display: "flex",
				alignItems: "center",
				gap: 9,
				width: "min(280px, 100%)",
				padding: "9px 12px 9px 10px",
				border: "1px solid var(--dsw-alias-border-l2)",
				borderRadius: 12,
				color: "var(--dsw-alias-label-primary)",
				background: "var(--dsw-alias-bg-layer-1)"
			},
			sentBubble: {
				maxWidth: "100%",
				padding: "10px 16px",
				borderRadius: 22,
				color: "var(--dsw-alias-label-primary)",
				background: "var(--dsw-specific-bubble)",
				fontSize: 16,
				lineHeight: "24px",
				whiteSpace: "pre-wrap",
				overflowWrap: "anywhere"
			}
		};
		//#endregion
		//#region src/client/FileAttachments.tsx
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
				style: ocr.dropMask,
				role: "status",
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					style: ocr.dropWrap,
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						style: ocr.dropTitle,
						children: title
					}), !disabled && desc !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						style: ocr.dropDesc,
						children: desc
					})]
				})
			}), document.body);
		}
		function ChoiceList({ onChoose }) {
			const [hover, setHover] = (0, react.useState)(null);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				style: ocr.choiceList,
				role: "listbox",
				"aria-label": "圖片處理方式",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
					type: "button",
					role: "option",
					style: ocr.choiceCard(hover === "vision"),
					onMouseEnter: () => {
						setHover("vision");
					},
					onMouseLeave: () => {
						setHover(null);
					},
					onFocus: () => {
						setHover("vision");
					},
					onBlur: () => {
						setHover(null);
					},
					onClick: () => {
						onChoose("vision");
					},
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						style: ocr.choiceIcon("vision"),
						"aria-hidden": "true",
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconBrowseOutlineRegular, { size: 18 })
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
						style: ocr.choiceCopy,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							style: ocr.choiceLabel,
							children: "直接提供原圖"
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							style: ocr.choiceHint,
							children: "交給支援視覺的模型看圖"
						})]
					})]
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
					type: "button",
					role: "option",
					style: ocr.choiceCard(hover === "ocr"),
					onMouseEnter: () => {
						setHover("ocr");
					},
					onMouseLeave: () => {
						setHover(null);
					},
					onFocus: () => {
						setHover("ocr");
					},
					onBlur: () => {
						setHover(null);
					},
					onClick: () => {
						onChoose("ocr");
					},
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						style: ocr.choiceIcon("ocr"),
						"aria-hidden": "true",
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.FileTypeIcon, { path: "document.pdf" })
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
						style: ocr.choiceCopy,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							style: ocr.choiceLabel,
							children: "本機 OCR 轉文字"
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							style: ocr.choiceHint,
							children: "在本機辨識後以文字附件送出"
						})]
					})]
				})]
			});
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
				style: ocr.buttonRoot,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
						ref: picker,
						style: ocr.hidden,
						type: "file",
						accept: ACCEPT,
						multiple: true,
						onChange: (event) => {
							const selected = [...event.target.files ?? []];
							event.target.value = "";
							upload(selected);
						}
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
						variant: "ghost",
						size: "sm",
						icon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconPaperclipOutlineRegular, { size: 16 }),
						disabled: busy || pendingFiles !== null,
						"aria-label": "添加文件 / Add file",
						"aria-busy": busy,
						title: error ?? "添加文件 / Add file",
						onClick: () => {
							setError(null);
							picker.current?.click();
						}
					}),
					error !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						style: ocr.error,
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
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ChoiceList, { onChoose: chooseImageMode })
					})
				]
			});
		}
		const EMPTY_FILES = [];
		const EMPTY_PENDING$1 = [];
		const EMPTY_OCCURRENCES = [];
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
				style: ocr.composerRail,
				"data-ocr-rail": "1",
				"aria-label": "已添加的文件 / Added files",
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					style: ocr.rail,
					children: [pending.map((file) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						style: ocr.fileCard(file.status === "error" ? "error" : "pending"),
						"aria-busy": file.status === "extracting",
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								style: ocr.fileIcon,
								"aria-hidden": "true",
								children: file.status === "extracting" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.StateDot, {
									state: "ongoing",
									size: 14
								}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.FileTypeIcon, { path: file.name })
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
								style: ocr.fileDetails,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									style: ocr.fileName,
									title: file.name,
									children: file.name
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									style: {
										...ocr.fileMeta,
										...file.status === "error" ? ocr.fileMetaError : {}
									},
									children: file.status === "extracting" ? `OCR 辨識中… · ${(0, _deepseek_ai_dsh_client_ui_primitives.fileSizeText)(file.size)}` : truncateError(file.error ?? "辨識失敗")
								})]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								style: ocr.removeButton,
								"aria-label": `移除 / Remove ${file.name}`,
								onClick: () => {
									remove(file.id);
								},
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCloseFillRegular, { size: 14 })
							})
						]
					}, file.id)), ready.map((file) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						style: ocr.fileCard("ready"),
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								style: ocr.fileIcon,
								"aria-hidden": "true",
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.FileTypeIcon, { path: file.name })
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
								style: ocr.fileDetails,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									style: ocr.fileName,
									title: file.name,
									children: file.name
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									style: ocr.fileMeta,
									children: [(0, _deepseek_ai_dsh_client_ui_primitives.fileExtension)(file.name).toUpperCase().slice(0, 8) || file.kind.toUpperCase(), (0, _deepseek_ai_dsh_client_ui_primitives.fileSizeText)(file.size)].filter(Boolean).join(" · ")
								})]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								style: ocr.removeButton,
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
				style: ocr.sentFiles,
				"data-ocr-sent-files": "1",
				children: files.map((file, index) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					style: ocr.sentCard,
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						style: ocr.fileIcon,
						"aria-hidden": "true",
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.FileTypeIcon, { path: file.name })
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
						style: ocr.fileDetails,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							style: ocr.fileName,
							title: file.name,
							children: file.name
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							style: ocr.fileMeta,
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
				style: ocr.sentRow,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					style: ocr.sentStack,
					children: [
						images.length > 0 && renderMessageImages({
							images,
							align: "end",
							compact: images.length > 1
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(OcrFileCards, { files: projected.files }),
						projected.text !== "" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							style: ocr.sentBubble,
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
					style: ocr.sentWrap,
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
					style: ocr.sentWrap,
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
		/**
		* `slash/input-insert-reference` spans use **detect** coordinates (each chip is
		* one U+FFFC). `InputState.draft` / occurrence offsets use the longer clipboard
		* expansion — `draft.length` as the insert point fails once any reference chip
		* (including a prior OCR file) already exists.
		*/
		function detectAppendSpan(snapshot) {
			let end = snapshot.draft.length;
			for (const occurrence of snapshot.occurrences) end -= Math.max(0, occurrence.length - 1);
			if (end < 0) end = 0;
			return {
				start: end,
				end,
				draftRev: snapshot.draftRev
			};
		}
		function ensureHiddenChipStyles() {
			if (typeof document === "undefined") return;
			const tagId = "dsh-file-upload-ocr-hidden-reference-chip";
			if (document.getElementById(tagId) !== null) return;
			const tag = document.createElement("style");
			tag.id = tagId;
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
						if (snapshot.phase !== "plain" && snapshot.phase !== "claimed") throw new Error("当前输入状态不能添加文件 / Files cannot be added in the current input state.");
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
							span: detectAppendSpan(snapshot)
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
		exports.detectAppendSpan = detectAppendSpan;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map