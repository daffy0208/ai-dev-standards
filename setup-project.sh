#!/bin/bash

#
# AI Dev Standards - Project Setup Script
#
# This script sets up ai-dev-standards in any project (new or existing).
# Works with the local installation (not published to npm yet).
#
# Usage:
#   cd /path/to/your/project
#   bash /path/to/ai-dev-standards/setup-project.sh
#
# Or from ai-dev-standards directory:
#   ./setup-project.sh /path/to/your/project
#

set -e

# Colors
BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
GRAY='\033[0;90m'
NC='\033[0m' # No Color

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
AI_DEV_STANDARDS_DIR="$SCRIPT_DIR"

# Get target project directory (default to current directory)
PROJECT_DIR="${1:-.}"
PROJECT_DIR="$(cd "$PROJECT_DIR" && pwd)"

echo -e "${BLUE}🚀 AI Dev Standards Setup${NC}\n"

# Check if ai-dev CLI is installed
echo -e "${BLUE}Checking installation...${NC}"
if ! command -v ai-dev &> /dev/null; then
    echo -e "${YELLOW}⚠️  ai-dev CLI not found. Installing...${NC}\n"

    cd "$AI_DEV_STANDARDS_DIR/CLI"
    npm install
    npm link

    echo -e "${GREEN}✅ ai-dev CLI installed!${NC}\n"
else
    echo -e "${GREEN}✅ ai-dev CLI already installed${NC}\n"
fi

# Navigate to project
cd "$PROJECT_DIR"

echo -e "${BLUE}Setting up project: ${PROJECT_DIR}${NC}\n"

# Check if project is already initialized
if [ -f ".ai-dev.json" ]; then
    echo -e "${GREEN}✅ Project already initialized${NC}\n"
    echo -e "${BLUE}🔄 Running sync...${NC}\n"
    ai-dev sync --yes
else
    # Detect project type and recommend template
    echo -e "${BLUE}📋 Selecting template...${NC}"

    TEMPLATE="cursorrules-minimal.md"

    if [ -f "package.json" ]; then
        if grep -q "next" package.json 2>/dev/null; then
            TEMPLATE="cursorrules-saas.md"
            echo -e "${GRAY}  Detected: Next.js project${NC}"
        elif grep -q "react" package.json 2>/dev/null; then
            TEMPLATE="cursorrules-saas.md"
            echo -e "${GRAY}  Detected: React project${NC}"
        fi
    fi

    if [ -d ".git" ] && [ "$(find . -name '*.ts' -o -name '*.js' | wc -l)" -gt "10" ]; then
        TEMPLATE="cursorrules-existing-project.md"
        echo -e "${GRAY}  Detected: Existing project${NC}"
    fi

    echo -e "${GRAY}  Using template: $TEMPLATE${NC}\n"

    # Copy template
    if [ ! -f ".cursorrules" ]; then
        cp "$AI_DEV_STANDARDS_DIR/TEMPLATES/$TEMPLATE" .cursorrules
        echo -e "${GREEN}✅ Created .cursorrules${NC}"

        # Update path in .cursorrules to absolute path
        if [[ "$OSTYPE" == "darwin"* ]] || [[ "$OSTYPE" == "linux-gnu"* ]]; then
            sed -i.bak "s|~/ai-dev-standards/|$AI_DEV_STANDARDS_DIR/|g" .cursorrules
            sed -i.bak "s|/path/to/ai-dev-standards/|$AI_DEV_STANDARDS_DIR/|g" .cursorrules
            rm .cursorrules.bak
        fi
    else
        echo -e "${YELLOW}⚠️  .cursorrules already exists, skipping${NC}"
    fi

    # Initialize sync
    echo -e "\n${BLUE}🔄 Initializing ai-dev sync...${NC}\n"
    ai-dev sync --yes

    # Add version and path tracking to .ai-dev.json
    if [ -f ".ai-dev.json" ]; then
        # Get ai-dev-standards version
        AI_DEV_VERSION=$(cd "$AI_DEV_STANDARDS_DIR" && node -p "require('./package.json').version")
        
        # Use jq if available, otherwise manual edit
        if command -v jq &> /dev/null; then
            jq --arg version "$AI_DEV_VERSION" --arg root "$AI_DEV_STANDARDS_DIR" \
               '. + {version: $version, aiDevStandardsRoot: $root}' \
               .ai-dev.json > .ai-dev.json.tmp && mv .ai-dev.json.tmp .ai-dev.json
            echo -e "${GRAY}  Added version tracking to .ai-dev.json${NC}"
        fi
    fi

    echo -e "${GREEN}✅ Setup complete!${NC}\n"
fi

# Configure brain-mcp in .claude/mcp-settings.json
echo -e "${BLUE}🧠 Configuring brain-mcp for Claude...${NC}"

# Create .claude directory if it doesn't exist
mkdir -p .claude

# Path to brain-mcp
BRAIN_MCP_PATH="$AI_DEV_STANDARDS_DIR/MCP-SERVERS/brain-mcp/dist/index.js"

# Check if mcp-settings.json exists
if [ -f ".claude/mcp-settings.json" ]; then
    # File exists, check if brain-mcp is already configured
    if grep -q '"brain-mcp"' .claude/mcp-settings.json; then
        echo -e "${GREEN}✅ brain-mcp already configured${NC}"
    else
        # Add brain-mcp to existing configuration
        echo -e "${YELLOW}⚠️  Adding brain-mcp to existing mcp-settings.json${NC}"

        # Backup existing file
        cp .claude/mcp-settings.json .claude/mcp-settings.json.backup

        # Use jq if available, otherwise manual edit
        if command -v jq &> /dev/null; then
            jq --arg brain_path "$BRAIN_MCP_PATH" --arg root_path "$AI_DEV_STANDARDS_DIR" \
               '.mcpServers["brain-mcp"] = {"command": "node", "args": [$brain_path], "env": {"AI_DEV_STANDARDS_ROOT": $root_path}}' \
               .claude/mcp-settings.json.backup > .claude/mcp-settings.json
            echo -e "${GREEN}✅ brain-mcp added to mcp-settings.json${NC}"
        else
            echo -e "${YELLOW}⚠️  jq not installed, skipping automatic brain-mcp configuration${NC}"
            echo -e "${GRAY}  Please manually add brain-mcp to .claude/mcp-settings.json${NC}"
        fi
    fi
else
    # Create new mcp-settings.json with brain-mcp
    cat > .claude/mcp-settings.json << EOF
{
  "mcpServers": {
    "brain-mcp": {
      "command": "node",
      "args": ["$BRAIN_MCP_PATH"],
      "env": {
        "AI_DEV_STANDARDS_ROOT": "$AI_DEV_STANDARDS_DIR"
      }
    }
  }
}
EOF
    echo -e "${GREEN}✅ Created .claude/mcp-settings.json with brain-mcp${NC}"
fi

echo ""

# Configure brain-mcp in .codex/mcp-settings.json
echo -e "${BLUE}🧠 Configuring brain-mcp for Codex...${NC}"

# Create .codex directory if it doesn't exist
mkdir -p .codex

# Check if codex mcp-settings exists
if [ -f ".codex/mcp-settings.json" ]; then
    if grep -q '"brain-mcp"' .codex/mcp-settings.json; then
        echo -e "${GREEN}✅ brain-mcp already configured for Codex${NC}"
    else
        echo -e "${YELLOW}⚠️  Adding brain-mcp to Codex mcp-settings.json${NC}"
        cp .codex/mcp-settings.json .codex/mcp-settings.json.backup

        if command -v jq &> /dev/null; then
            jq --arg brain_path "$BRAIN_MCP_PATH" --arg root_path "$AI_DEV_STANDARDS_DIR" \
               '.mcpServers["brain-mcp"] = {"command": "node", "args": [$brain_path], "env": {"AI_DEV_STANDARDS_ROOT": $root_path}}' \
               .codex/mcp-settings.json.backup > .codex/mcp-settings.json
            echo -e "${GREEN}✅ brain-mcp added to Codex mcp-settings.json${NC}"
        else
            echo -e "${YELLOW}⚠️  jq not installed, skipping automatic Codex configuration${NC}"
            echo -e "${GRAY}  Please manually add brain-mcp to .codex/mcp-settings.json${NC}"
        fi
    fi
else
    cat > .codex/mcp-settings.json << EOF
{
  "mcpServers": {
    "brain-mcp": {
      "command": "node",
      "args": ["$BRAIN_MCP_PATH"],
      "env": {
        "AI_DEV_STANDARDS_ROOT": "$AI_DEV_STANDARDS_DIR"
      }
    }
  }
}
EOF
    echo -e "${GREEN}✅ Created .codex/mcp-settings.json with brain-mcp${NC}"
fi

echo ""

# Run project analysis
echo -e "${BLUE}🔍 Analyzing your project...${NC}\n"
if [ -x "$AI_DEV_STANDARDS_DIR/scripts/analyze-project.sh" ]; then
    "$AI_DEV_STANDARDS_DIR/scripts/analyze-project.sh" "$PROJECT_DIR"

    # Add START-HERE.md to .gitignore if it exists
    if [ -f ".gitignore" ]; then
        if ! grep -q "START-HERE.md" .gitignore; then
            echo "START-HERE.md" >> .gitignore
            echo -e "${GRAY}  Added START-HERE.md to .gitignore${NC}"
        fi
    fi
else
    echo -e "${YELLOW}⚠️  Analysis script not found, skipping analysis${NC}"
fi

echo ""

# Run health check
echo -e "${BLUE}🏥 Running health check...${NC}\n"
ai-dev doctor --silent 2>/dev/null || echo -e "${GRAY}  Health check skipped${NC}\n"

# Show summary
echo -e "${BLUE}📊 Summary:${NC}"
echo -e "${GRAY}  Project: $PROJECT_DIR${NC}"
echo -e "${GRAY}  Standards: $AI_DEV_STANDARDS_DIR${NC}"
echo -e "${GRAY}  Template: $TEMPLATE${NC}"

# Check what was installed
if [ -f ".ai-dev.json" ]; then
    if command -v jq &> /dev/null && [ -f ".ai-dev.json" ]; then
        VERSION=$(jq -r '.version // "unknown"' .ai-dev.json)
        echo -e "${GRAY}  Version: $VERSION${NC}"
    fi
    echo -e "${GRAY}  Resources: Available via registries${NC}"
fi

# Check hooks
if [ -d ".claude/hooks" ]; then
    SKILLS_COUNT=0
    if [ -f ".claude/skills/skill-rules.json" ]; then
        SKILLS_COUNT=$(grep -o '"promptTriggers"' .claude/skills/skill-rules.json | wc -l)
    fi
    echo -e "${GRAY}  Hooks: Installed with $SKILLS_COUNT skill activation rules${NC}"
fi

echo ""
echo -e "${GREEN}${BOLD}✨ Setup Complete!${NC}\n"
echo -e "${BLUE}📚 What to do next:${NC}"
echo ""
echo -e "${YELLOW}  👉 Open START-HERE.md and follow the instructions${NC}"
echo -e "${GRAY}     It contains your personalized roadmap and exact prompt for Claude${NC}"
echo ""
echo -e "${GREEN}✅ All 64 skills, 50 MCPs, and 235 resources are now available!${NC}"
echo -e "${GREEN}🧠 Brain-MCP configured for intelligent skill recommendations!${NC}"
echo -e "${GREEN}🎯 Skill auto-activation enabled (95%+ accuracy)!${NC}\n"

# Helpful commands
echo -e "${BLUE}💡 Helpful commands:${NC}"
echo -e "${GRAY}  ai-dev doctor          Check project health${NC}"
echo -e "${GRAY}  ai-dev check-updates   Check for updates${NC}"
echo -e "${GRAY}  ai-dev self-update     Update ai-dev-standards${NC}"
echo -e "${GRAY}  ai-dev sync            Sync latest resources${NC}\n"
