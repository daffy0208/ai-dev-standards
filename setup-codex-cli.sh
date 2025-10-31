#!/bin/bash

# Setup script for Codex CLI with ai-dev-standards Brain MCP
# Mirrors the Gemini setup script but targets the Codex CLI

set -e

echo "🚀 Setting up Codex CLI with ai-dev-standards Brain MCP"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Determine repo root
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
echo -e "${BLUE}Repository directory:${NC} $SCRIPT_DIR"
echo ""

# Check Codex CLI installation
echo -e "${BLUE}Checking Codex CLI installation...${NC}"
if ! command -v codex &> /dev/null; then
    echo -e "${YELLOW}⚠️  Codex CLI not found.${NC}"
    echo "Install with: npm install -g @anthropics/codex-cli"
    exit 1
fi

CODEX_VERSION=$(codex --version || codex version || echo "unknown")
echo -e "${GREEN}✓ Codex CLI installed:${NC} $CODEX_VERSION"
echo ""

# Ensure Brain MCP build exists
echo -e "${BLUE}Checking Brain MCP build...${NC}"
BRAIN_MCP_PATH="$SCRIPT_DIR/MCP-SERVERS/brain-mcp/dist/index.js"
# Always ensure the brain CLI is built so MCP commands work reliably
if [ ! -f "$SCRIPT_DIR/scripts/brain/dist/brain.js" ]; then
    echo -e "${YELLOW}⚠️  Brain CLI not compiled. Building now...${NC}"
fi

if [ ! -d "$SCRIPT_DIR/scripts/brain/node_modules" ]; then
    echo -e "${BLUE}Installing Brain CLI dependencies...${NC}"
    (
        cd "$SCRIPT_DIR/scripts/brain" &&
        npm install --no-audit --no-fund >/dev/null
    )
else
    echo -e "${BLUE}Brain CLI dependencies already installed${NC}"
fi

echo -e "${BLUE}Compiling Brain CLI...${NC}"
(
    cd "$SCRIPT_DIR/scripts/brain" &&
    npm run build >/dev/null
)

if [ ! -d "$SCRIPT_DIR/MCP-SERVERS/brain-mcp/node_modules" ]; then
    echo -e "${BLUE}Installing Brain MCP dependencies...${NC}"
    (
        cd "$SCRIPT_DIR/MCP-SERVERS/brain-mcp" &&
        npm install --no-audit --no-fund >/dev/null
    )
else
    echo -e "${BLUE}Brain MCP dependencies already installed${NC}"
fi

echo -e "${BLUE}Compiling Brain MCP...${NC}"
(
    cd "$SCRIPT_DIR/MCP-SERVERS/brain-mcp" &&
    npm run build >/dev/null
)

if [ ! -f "$BRAIN_MCP_PATH" ]; then
    echo -e "${RED}❌ Failed to build Brain MCP (missing $BRAIN_MCP_PATH)${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Brain MCP located:${NC} $BRAIN_MCP_PATH"
echo ""

# Register Brain MCP with Codex
echo -e "${BLUE}Adding Brain MCP to Codex...${NC}"
codex mcp add brain-mcp node "$BRAIN_MCP_PATH" || {
    echo -e "${YELLOW}⚠️  Unable to add brain-mcp automatically.${NC}"
    echo "You can add it manually with:"
    echo "  codex mcp add brain-mcp node \"$BRAIN_MCP_PATH\""
}
echo -e "${GREEN}✓ brain-mcp registered (or already present)${NC}"
echo ""

# List configured MCP servers
echo -e "${BLUE}Configured MCP servers:${NC}"
codex mcp list || echo -e "${YELLOW}⚠️  Could not list MCP servers. Continue if you know brain-mcp was added.${NC}"
echo ""

# Quick functional test
if [ "${RUN_CODEX_TEST:-0}" = "1" ]; then
    echo -e "${BLUE}Testing brain tools via Codex...${NC}"
    if command -v timeout >/dev/null 2>&1; then
        TEST_RESULT=$(timeout -k 2 5 codex exec "Use brain_search with keyword 'rag'" 2>&1 || true)
    else
        TEST_RESULT=$(codex exec "Use brain_search with keyword 'rag'" 2>&1 || true)
    fi
    if echo "$TEST_RESULT" | grep -qi "rag-implementer"; then
        echo -e "${GREEN}✓ Brain tools responded successfully${NC}"
        echo ""
        echo "Sample output:"
        echo "$TEST_RESULT" | head -20
    else
        echo -e "${YELLOW}⚠️  Brain tools did not return expected results.${NC}"
        echo "Try running: codex exec \"Use brain_status\""
    fi
    echo ""
fi

# Export helper environment variable for current shell
echo -e "${BLUE}Exporting AI_DEV_STANDARDS_ROOT for current session...${NC}"
export AI_DEV_STANDARDS_ROOT="$SCRIPT_DIR"
echo -e "${GREEN}✓ AI_DEV_STANDARDS_ROOT set to:${NC} $AI_DEV_STANDARDS_ROOT"
echo ""

# Maintain repository-local Codex config directory
echo -e "${BLUE}Updating .codex configuration directory...${NC}"
mkdir -p "$SCRIPT_DIR/.codex"
echo -e "${GREEN}✓ .codex directory ready${NC}"
echo ""

echo -e "${GREEN}==========================================${NC}"
echo -e "${GREEN}✓ Codex CLI setup complete!${NC}"
echo -e "${GREEN}==========================================${NC}"
echo ""
echo "Next steps:"
echo "  1. Read the quick start:   cat .codex/QUICK-START.md"
echo "  2. Check status:           codex exec \"Use brain_status\""
echo "  3. Explore skills:         codex exec \"Use brain_search with keyword 'frontend'\""
echo ""
echo "Need to re-run later? Simply execute ./setup-codex-cli.sh again."
echo ""
