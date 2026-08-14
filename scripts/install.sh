#!/usr/bin/env sh
set -eu

profile=${1:-web}
plugin_root=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)

"$plugin_root/scripts/setup-ocr.sh"
cd "$plugin_root"
dsh plugin --profile "$profile" add "$plugin_root"

printf "Installed dsh-file-upload-ocr-plugin in profile '%s'.\n" "$profile"
printf "Start Harness with: dsh --profile %s\n" "$profile"
