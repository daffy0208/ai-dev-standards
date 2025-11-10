#!/usr/bin/env bash

# Install Git Hooks
# Copies hook templates from .git-hooks/ to .git/hooks/

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🔧 Installing Git hooks...${NC}"
echo ""

# Get the root directory
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Create .git/hooks directory if it doesn't exist
mkdir -p "$ROOT/.git/hooks"

# Copy pre-commit hook
if [ -f "$ROOT/.git-hooks/pre-commit" ]; then
    cp "$ROOT/.git-hooks/pre-commit" "$ROOT/.git/hooks/pre-commit"
    chmod +x "$ROOT/.git/hooks/pre-commit"
    echo -e "${GREEN}✓${NC} Installed pre-commit hook"
else
    echo -e "${YELLOW}⚠${NC}  Warning: .git-hooks/pre-commit not found"
fi

echo ""
echo -e "${GREEN}✅ Git hooks installed successfully!${NC}"
echo ""
echo "The pre-commit hook will now:"
echo "   • Auto-generate registries from directories"
echo "   • Auto-update documentation from registries"
echo "   • Validate documentation consistency"
echo "   • Run ESLint code quality checks"
echo "   • Run TypeScript type checking"
echo ""
echo -e "${YELLOW}💡 Tips:${NC}"
echo "   • To skip validation: git commit -m \"message [skip-validation]\""
echo "   • To auto-fix issues: npm run validate:fix && npm run lint:fix"
echo "   • To uninstall: rm $ROOT/.git/hooks/pre-commit"
echo ""
