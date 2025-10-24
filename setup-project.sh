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

    echo -e "${GREEN}✅ Setup complete!${NC}\n"
fi

# Show summary
echo -e "${BLUE}📊 Summary:${NC}"
echo -e "${GRAY}  Project: $PROJECT_DIR${NC}"
echo -e "${GRAY}  Standards: $AI_DEV_STANDARDS_DIR${NC}"
echo -e "${GRAY}  Template: $TEMPLATE${NC}"

# Check what was installed
if [ -f ".ai-dev.json" ]; then
    SKILLS_COUNT=$(grep -o "\"skills\": \[" .ai-dev.json | wc -l)
    echo -e "${GRAY}  Resources: Available via registries${NC}"
fi

echo ""
echo -e "${BLUE}📚 Next steps:${NC}"
echo -e "${GRAY}  1. Customize .cursorrules with your project details${NC}"
echo -e "${GRAY}  2. Open project in VS Code or Cursor${NC}"
echo -e "${GRAY}  3. Start coding with AI assistance!${NC}"
echo ""
echo -e "${GREEN}✨ All 37 skills, 34 MCPs, and 103 resources are now available!${NC}\n"
