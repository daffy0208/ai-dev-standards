#!/bin/bash

###############################################################################
# AI Dev Standards Bootstrap Script
#
# Automatically installs and initializes ai-dev CLI for any project
#
# Usage:
#   curl -fsSL https://ai-dev-standards.com/bootstrap.sh | bash
#   wget -qO- https://ai-dev-standards.com/bootstrap.sh | bash
###############################################################################

set -e

# Colors
BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
GRAY='\033[0;90m'
NC='\033[0m' # No Color

echo -e "${BLUE}\n🚀 AI Dev Standards Bootstrap\n${NC}"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    echo -e "${YELLOW}Please install Node.js 18+ from: https://nodejs.org/${NC}\n"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Node.js version 18+ required (you have v$(node -v))${NC}"
    echo -e "${YELLOW}Please upgrade Node.js from: https://nodejs.org/${NC}\n"
    exit 1
fi

echo -e "${GREEN}✅ Node.js $(node -v) detected${NC}\n"

# Check if ai-dev is already installed
if command -v ai-dev &> /dev/null; then
    echo -e "${GREEN}✅ ai-dev CLI already installed${NC}\n"
else
    echo -e "${YELLOW}📦 Installing ai-dev CLI...${NC}\n"

    # Try global install
    if npm install -g @ai-dev-standards/cli; then
        echo -e "${GREEN}✅ ai-dev CLI installed globally${NC}\n"
    else
        echo -e "${YELLOW}⚠️  Global install failed. Installing locally...${NC}\n"
        npm install --save-dev @ai-dev-standards/cli
        echo -e "${GREEN}✅ ai-dev CLI installed locally${NC}\n"
    fi
fi

# Check if in a project directory
if [ ! -f "package.json" ] && [ ! -d ".git" ]; then
    echo -e "${YELLOW}⚠️  Not a project directory (no package.json or .git)${NC}"
    echo -e "${GRAY}Run this in your project directory to auto-sync.${NC}\n"
    exit 0
fi

# Check if already initialized
if [ -f ".ai-dev.json" ]; then
    echo -e "${GREEN}✅ Project already initialized for auto-sync${NC}\n"

    # Run sync
    echo -e "${BLUE}🔄 Checking for updates...${NC}\n"
    ai-dev sync --yes
else
    echo -e "${YELLOW}📋 Initializing project for auto-sync...${NC}\n"

    # Create .ai-dev.json
    cat > .ai-dev.json <<EOF
{
  "version": "1.0.0",
  "lastSync": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "tracking": [
    "skills",
    "mcps",
    "components",
    "integrations",
    "standards",
    "utils",
    "tools",
    "examples",
    "cursorrules",
    "gitignore"
  ],
  "frequency": "git-hook",
  "installed": {
    "skills": [],
    "mcps": [],
    "components": [],
    "integrations": [],
    "standards": [],
    "utils": [],
    "tools": [],
    "examples": []
  },
  "preferences": {
    "autoApprove": false,
    "notifications": true,
    "backupBeforeSync": true
  }
}
EOF

    echo -e "${GRAY}  Created: .ai-dev.json${NC}"

    # Setup git hook
    if [ -d ".git" ]; then
        mkdir -p .git/hooks

        cat > .git/hooks/post-merge <<'HOOK'
#!/bin/sh
# AI Dev Standards auto-sync
# Runs after 'git pull'

echo "🔄 Auto-syncing with ai-dev-standards..."
ai-dev sync --yes --silent || echo "⚠️  Auto-sync failed. Run 'ai-dev sync' manually."
HOOK

        chmod +x .git/hooks/post-merge
        echo -e "${GRAY}  Created: .git/hooks/post-merge${NC}"
    fi

    # Add to .gitignore
    if ! grep -q ".ai-dev.json" .gitignore 2>/dev/null; then
        echo ".ai-dev.json" >> .gitignore
        echo -e "${GRAY}  Added to .gitignore: .ai-dev.json${NC}"
    fi

    if ! grep -q ".ai-dev-cache/" .gitignore 2>/dev/null; then
        echo ".ai-dev-cache/" >> .gitignore
        echo -e "${GRAY}  Added to .gitignore: .ai-dev-cache/${NC}"
    fi

    # Run initial sync
    echo -e "${BLUE}\n🔄 Running initial sync...${NC}\n"
    ai-dev sync --yes

    echo -e "${GREEN}\n✅ Auto-sync enabled!${NC}\n"
fi

# Show next steps
echo -e "${BLUE}📚 What happens now:${NC}\n"
echo -e "${GRAY}  • Auto-sync runs after every git pull${NC}"
echo -e "${GRAY}  • Skills, MCPs, and configs stay up-to-date${NC}"
echo -e "${GRAY}  • Run manually: ai-dev sync${NC}"
echo -e "${GRAY}  • Update specific: ai-dev update skills${NC}\n"

echo -e "${GREEN}✨ Your project is now auto-synced with ai-dev-standards!${NC}\n"
