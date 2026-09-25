#!/usr/bin/env sh
set -eu

profile=${1:-web}
plugin_root=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)

# Install durable OCR runtime first (lives under $DSH_HOME/ocr-runtime).
"$plugin_root/scripts/setup-ocr.sh"
cd "$plugin_root"
dsh plugin --profile "$profile" add "$plugin_root"

# Re-run after add so requirements stay synced; durable path is unchanged by pnpm.
"$plugin_root/scripts/setup-ocr.sh"

printf "已将 dsh-file-upload-ocr-plugin 安装到 profile '%s' / Installed dsh-file-upload-ocr-plugin in profile '%s'.\n" "$profile" "$profile"
printf "OCR 运行环境：$DSH_HOME/ocr-runtime（升级插件后通常无需重装）\n"
printf "Start Harness: dsh --profile %s\n" "$profile"
