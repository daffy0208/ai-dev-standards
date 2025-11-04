#!/bin/bash
# File Tracker Hook Wrapper
# Executes file-tracker.ts using tsx

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

cd "$SCRIPT_DIR/../.." || exit 1

npx tsx "$SCRIPT_DIR/file-tracker.ts" "$@"
