#!/usr/bin/env bash

# Setup Development Environment
# One-command setup for new developers

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  AI Dev Standards - Development Environment   ║${NC}"
echo -e "${BLUE}║              Setup Script                      ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════╝${NC}"
echo ""

# Get the root directory
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

# Step 1: Install dependencies
echo -e "${GREEN}📦 Step 1: Installing npm dependencies...${NC}"
if npm install; then
    echo -e "${GREEN}✓${NC} Dependencies installed"
else
    echo -e "${YELLOW}⚠${NC}  Warning: npm install had issues (check output above)"
fi
echo ""

# Step 2: Install Git hooks
echo -e "${GREEN}🔧 Step 2: Installing Git hooks...${NC}"
if bash .git-hooks/install-hooks.sh; then
    echo -e "${GREEN}✓${NC} Git hooks installed"
else
    echo -e "${YELLOW}⚠${NC}  Warning: Could not install Git hooks"
fi
echo ""

# Step 3: Validate environment
echo -e "${GREEN}🔍 Step 3: Validating environment...${NC}"
echo ""

# Check Node.js version
NODE_VERSION=$(node --version)
echo -e "   Node.js: ${GREEN}$NODE_VERSION${NC}"

# Check npm version
NPM_VERSION=$(npm --version)
echo -e "   npm: ${GREEN}$NPM_VERSION${NC}"

# Check TypeScript
if command -v tsc &> /dev/null; then
    TSC_VERSION=$(tsc --version)
    echo -e "   TypeScript: ${GREEN}$TSC_VERSION${NC}"
else
    echo -e "   TypeScript: ${YELLOW}Not found (will use local version)${NC}"
fi

echo ""

# Step 4: Run initial generation
echo -e "${GREEN}🔄 Step 4: Running initial registry and documentation generation...${NC}"
if npm run generate:all; then
    echo -e "${GREEN}✓${NC} Initial generation complete"
else
    echo -e "${YELLOW}⚠${NC}  Warning: Initial generation had issues"
fi
echo ""

# Step 5: Validate everything
echo -e "${GREEN}✅ Step 5: Running validation...${NC}"
echo ""

# Validate registries
if npm run validate:registries; then
    echo -e "${GREEN}✓${NC} Registries are valid"
else
    echo -e "${YELLOW}⚠${NC}  Warning: Registry validation failed"
fi

echo ""

# Final summary
echo -e "${BLUE}╔════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║            Setup Complete! 🎉                  ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}Your development environment is ready!${NC}"
echo ""
echo -e "${BLUE}What happens now:${NC}"
echo "   • Git hooks are installed and active"
echo "   • Documentation auto-updates on every commit"
echo "   • Registry files auto-generate from directories"
echo "   • You never need to manually update counts"
echo ""
echo -e "${BLUE}Useful commands:${NC}"
echo "   npm run generate:all         - Regenerate registries and docs"
echo "   npm run validate:registries  - Check registry sync"
echo "   npm run validate:docs        - Check documentation sync"
echo "   npm run lint                 - Run linter"
echo "   npm run test                 - Run tests"
echo ""
echo -e "${YELLOW}Remember:${NC}"
echo "   • NEVER manually edit resource counts in documentation"
echo "   • The automation handles everything for you"
echo "   • To skip validation: git commit -m \"msg [skip-validation]\""
echo ""
echo -e "${GREEN}Happy coding! 🚀${NC}"
echo ""
