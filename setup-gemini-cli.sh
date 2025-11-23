#!/bin/bash

# Setup script for Gemini CLI with ai-dev-standards Brain MCP
# Mirrors the Codex setup script but targets the Gemini CLI

set -e

echo "🚀 Setting up Gemini CLI with ai-dev-standards Brain MCP"
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

# Check Gemini CLI installation (assuming 'gemini' command, or just setting up config)
echo -e "${BLUE}Checking Gemini CLI installation...${NC}"
# Note: Gemini CLI might be different, but we assume a standard executable for now.
# If not found, we just warn but still set up the config.
if ! command -v gemini &> /dev/null; then
    echo -e "${YELLOW}⚠️  Gemini CLI not found in PATH.${NC}"
    echo "This script will still configure the .gemini environment."
else
    GEMINI_VERSION=$(gemini --version 2>/dev/null || echo "unknown")
    echo -e "${GREEN}✓ Gemini CLI detected:${NC} $GEMINI_VERSION"
fi
echo ""

# Ensure Brain MCP build exists
echo -e "${BLUE}Checking Brain MCP build...${NC}"
BRAIN_MCP_PATH="$SCRIPT_DIR/MCP-SERVERS/brain-mcp/dist/index.js"

if [ ! -d "$SCRIPT_DIR/scripts/brain/node_modules" ]; then
    echo -e "${BLUE}Installing Brain CLI dependencies...${NC}"
    (
        cd "$SCRIPT_DIR/scripts/brain" &&
        npm install --no-audit --no-fund >/dev/null
    )
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

# Create .gemini config directory
echo -e "${BLUE}Configuring .gemini directory...${NC}"
mkdir -p "$SCRIPT_DIR/.gemini"

# Create mcp-settings.json for Gemini
CONFIG_FILE="$SCRIPT_DIR/.gemini/mcp-settings.json"

# We overwrite or create the config to ensure it points to this repo
cat > "$CONFIG_FILE" << EOF
{
  "mcpServers": {
    "brain-mcp": {
      "command": "node",
      "args": [
        "$BRAIN_MCP_PATH"
      ],
      "env": {
        "AI_DEV_STANDARDS_ROOT": "$SCRIPT_DIR"
      },
      "description": "Brain MCP for querying skills, MCPs, and capabilities in ai-dev-standards",
      "timeout": 30000
    }
  }
}
EOF

echo -e "${GREEN}✓ Created .gemini/mcp-settings.json${NC}"
echo ""

# Export helper environment variable
echo -e "${BLUE}Exporting AI_DEV_STANDARDS_ROOT for current session...${NC}"
export AI_DEV_STANDARDS_ROOT="$SCRIPT_DIR"
echo -e "${GREEN}✓ AI_DEV_STANDARDS_ROOT set to:${NC} $AI_DEV_STANDARDS_ROOT"
echo ""

echo -e "${GREEN}==========================================${NC}"
echo -e "${GREEN}✓ Gemini CLI setup complete!${NC}"
echo -e "${GREEN}==========================================${NC}"
echo ""
echo "Next steps:"
echo "  1. Ensure your Gemini client is configured to use $CONFIG_FILE"
echo "  2. Test with brain_status tool if available in your Gemini client"
echo ""
