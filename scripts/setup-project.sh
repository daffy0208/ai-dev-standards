#!/bin/bash

###############################################################################
# AI Dev Standards - Project Setup (DEPRECATED)
#
# ⚠️  THIS SCRIPT IS DEPRECATED!
#
# Use the auto-bootstrap system instead:
#   npx @ai-dev-standards/bootstrap
#
# Or run the bootstrap script directly:
#   bash /path/to/ai-dev-standards/CLI/bootstrap.sh
#   node /path/to/ai-dev-standards/CLI/bootstrap.js
#
# This script is kept for reference only.
###############################################################################

echo ""
echo "⚠️  This script is deprecated!"
echo ""
echo "Please use the auto-bootstrap system instead:"
echo ""
echo "  npx @ai-dev-standards/bootstrap"
echo ""
echo "This will automatically:"
echo "  ✅ Install the ai-dev CLI"
echo "  ✅ Create .ai-dev.json configuration"
echo "  ✅ Set up .claude/ directory with skills"
echo "  ✅ Configure MCPs"
echo "  ✅ Update config files (.cursorrules, .gitignore, etc.)"
echo "  ✅ Set up git hooks for auto-sync"
echo ""
echo "See documentation:"
echo "  - DOCS/BOOTSTRAP.md - Complete bootstrap guide"
echo "  - DOCS/CLI-REFERENCE.md - CLI commands"
echo "  - DOCS/SYSTEM-OVERVIEW.md - System architecture"
echo ""

# Ask if they want to run the bootstrap
read -p "Run bootstrap now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    AI_DEV_PATH="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    echo ""
    echo "Running bootstrap..."
    bash "$AI_DEV_PATH/CLI/bootstrap.sh"
else
    echo ""
    echo "Cancelled. Run manually when ready:"
    echo "  npx @ai-dev-standards/bootstrap"
    echo ""
fi
