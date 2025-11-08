#!/bin/bash

#
# AI Dev Standards - Update Checker
#
# Checks for updates in the ai-dev-standards repository and provides
# actionable instructions for updating in both standalone and integration modes.
#
# Usage:
#   ./scripts/check-updates.sh                  # From ai-dev-standards directory
#   ~/ai-dev-standards/scripts/check-updates.sh # From any project directory
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
AI_DEV_STANDARDS_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

echo -e "${BLUE}🔍 AI Dev Standards Update Checker${NC}\n"

# Navigate to ai-dev-standards directory
cd "$AI_DEV_STANDARDS_DIR"

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo -e "${RED}❌ Error: Not in ai-dev-standards repository${NC}"
    echo -e "${GRAY}   Expected location: ~/ai-dev-standards${NC}"
    echo -e "${GRAY}   Current location: $AI_DEV_STANDARDS_DIR${NC}\n"
    exit 1
fi

# Get current branch
CURRENT_BRANCH=$(git branch --show-current)
echo -e "${BLUE}Current branch:${NC} $CURRENT_BRANCH"

# Get current commit
CURRENT_COMMIT=$(git rev-parse HEAD)
CURRENT_COMMIT_SHORT=$(git rev-parse --short HEAD)
echo -e "${BLUE}Current commit:${NC} $CURRENT_COMMIT_SHORT"

# Fetch latest from remote (silently)
echo -e "\n${BLUE}Checking for updates...${NC}"
git fetch origin --quiet 2>/dev/null || {
    echo -e "${RED}❌ Failed to fetch from remote${NC}"
    echo -e "${GRAY}   Check your internet connection${NC}\n"
    exit 1
}

# Get remote branch (use main or master)
REMOTE_BRANCH="origin/main"
if ! git rev-parse "$REMOTE_BRANCH" >/dev/null 2>&1; then
    REMOTE_BRANCH="origin/master"
fi

# Check if remote branch exists
if ! git rev-parse "$REMOTE_BRANCH" >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Remote branch not found (origin/main or origin/master)${NC}"
    echo -e "${GRAY}   You may be on a feature branch${NC}"
    echo -e "${GRAY}   Current branch: $CURRENT_BRANCH${NC}\n"
    
    # Check if there's a remote tracking branch
    TRACKING_BRANCH=$(git rev-parse --abbrev-ref --symbolic-full-name @{u} 2>/dev/null || echo "")
    
    if [ -n "$TRACKING_BRANCH" ]; then
        echo -e "${BLUE}Checking tracking branch:${NC} $TRACKING_BRANCH\n"
        REMOTE_BRANCH="$TRACKING_BRANCH"
    else
        echo -e "${RED}❌ No remote tracking branch found${NC}"
        echo -e "${GRAY}   Unable to check for updates on this branch${NC}\n"
        exit 1
    fi
fi

# Get remote commit
REMOTE_COMMIT=$(git rev-parse "$REMOTE_BRANCH")
REMOTE_COMMIT_SHORT=$(git rev-parse --short "$REMOTE_BRANCH")

# Check if up to date
if [ "$CURRENT_COMMIT" = "$REMOTE_COMMIT" ]; then
    echo -e "${GREEN}✅ You're up to date!${NC}"
    echo -e "${GRAY}   No updates available${NC}\n"
    
    # Show current version
    if [ -f "package.json" ]; then
        VERSION=$(grep '"version"' package.json | head -1 | sed 's/.*"version": "\(.*\)".*/\1/')
        echo -e "${BLUE}Current version:${NC} $VERSION\n"
    fi
    
    exit 0
fi

# Updates are available
echo -e "${YELLOW}📦 Updates available!${NC}\n"

# Count commits behind
COMMITS_BEHIND=$(git rev-list --count HEAD.."$REMOTE_BRANCH")
echo -e "${BLUE}Commits behind:${NC} $COMMITS_BEHIND"

# Show what's new
echo -e "\n${BLUE}📋 What's New:${NC}"
echo -e "${GRAY}─────────────────────────────────────${NC}"
git log --oneline --no-decorate HEAD.."$REMOTE_BRANCH" | head -10 | while read -r line; do
    echo -e "  ${GRAY}•${NC} $line"
done

if [ "$COMMITS_BEHIND" -gt 10 ]; then
    echo -e "  ${GRAY}... and $(($COMMITS_BEHIND - 10)) more commits${NC}"
fi
echo -e "${GRAY}─────────────────────────────────────${NC}\n"

# Show version change if available
if [ -f "package.json" ]; then
    CURRENT_VERSION=$(grep '"version"' package.json | head -1 | sed 's/.*"version": "\(.*\)".*/\1/')
    
    # Get remote version
    REMOTE_VERSION=$(git show "$REMOTE_BRANCH":package.json 2>/dev/null | grep '"version"' | head -1 | sed 's/.*"version": "\(.*\)".*/\1/' || echo "unknown")
    
    if [ "$CURRENT_VERSION" != "$REMOTE_VERSION" ]; then
        echo -e "${BLUE}Version update:${NC} $CURRENT_VERSION → $REMOTE_VERSION\n"
    fi
fi

# Show changelog if available
if [ -f "CHANGELOG.md" ]; then
    echo -e "${BLUE}📖 Recent Changes:${NC}"
    echo -e "${GRAY}─────────────────────────────────────${NC}"
    
    # Try to extract recent changelog entries
    git show "$REMOTE_BRANCH":CHANGELOG.md 2>/dev/null | head -50 | grep -E "^##|^-" | head -20 | while read -r line; do
        if [[ $line == "## "* ]]; then
            echo -e "  ${BLUE}$line${NC}"
        else
            echo -e "  ${GRAY}$line${NC}"
        fi
    done || echo -e "  ${GRAY}(Unable to read changelog)${NC}"
    
    echo -e "${GRAY}─────────────────────────────────────${NC}\n"
fi

# Detect usage mode and provide instructions
echo -e "${BLUE}📥 How to Update:${NC}\n"

# Check if we're in a project directory with .ai-dev.json
if [ -f "$PWD/.ai-dev.json" ]; then
    # Integration mode - we're in a project
    echo -e "${YELLOW}Integration Mode Detected${NC}"
    echo -e "${GRAY}(You're in a project that uses ai-dev-standards)${NC}\n"
    
    echo -e "1. Update ai-dev-standards repository:"
    echo -e "   ${GREEN}cd ~/ai-dev-standards && git pull${NC}\n"
    
    echo -e "2. Sync updates to your project:"
    echo -e "   ${GREEN}cd $PWD${NC}"
    echo -e "   ${GREEN}bash ~/ai-dev-standards/setup-project.sh${NC}\n"
    
    echo -e "   ${GRAY}Or use the ai-dev CLI:${NC}"
    echo -e "   ${GREEN}ai-dev sync${NC}\n"
    
elif [ "$PWD" = "$AI_DEV_STANDARDS_DIR" ]; then
    # Standalone mode - we're in ai-dev-standards
    echo -e "${YELLOW}Standalone Mode${NC}"
    echo -e "${GRAY}(Using ai-dev-standards as reference)${NC}\n"
    
    echo -e "Update the repository:"
    echo -e "   ${GREEN}git pull${NC}\n"
    
    echo -e "After updating, rebuild brain-mcp if needed:"
    echo -e "   ${GREEN}cd MCP-SERVERS/brain-mcp${NC}"
    echo -e "   ${GREEN}npm install && npm run build${NC}\n"
    
else
    # Mixed mode - provide both options
    echo -e "${YELLOW}Update Options:${NC}\n"
    
    echo -e "To update ai-dev-standards:"
    echo -e "   ${GREEN}cd ~/ai-dev-standards && git pull${NC}\n"
    
    echo -e "If you have integrated projects, sync them:"
    echo -e "   ${GREEN}cd /your/project${NC}"
    echo -e "   ${GREEN}bash ~/ai-dev-standards/setup-project.sh${NC}\n"
fi

# Show files that would be updated
echo -e "${BLUE}📁 Updated Areas:${NC}"
git diff --stat HEAD.."$REMOTE_BRANCH" | grep -E "SKILLS/|MCP-SERVERS/|COMPONENTS/|DOCS/|STANDARDS/" | head -10 | while read -r line; do
    echo -e "   ${GRAY}• $line${NC}"
done

if [ "$(git diff --stat HEAD.."$REMOTE_BRANCH" | wc -l)" -gt 11 ]; then
    echo -e "   ${GRAY}... and more${NC}"
fi

echo -e ""

# Safety note
echo -e "${BLUE}💡 Tip:${NC} ${GRAY}Review changes before updating:${NC}"
echo -e "   ${GRAY}git diff HEAD..$REMOTE_BRANCH -- <file>${NC}\n"

# Exit with status indicating updates available
exit 1
