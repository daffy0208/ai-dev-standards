#!/bin/bash
# Context Restore Hook Wrapper
# Executes context-restore.ts using tsx

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

cd "$SCRIPT_DIR/../.." || exit 1

npx tsx "$SCRIPT_DIR/context-restore.ts" "$@"
