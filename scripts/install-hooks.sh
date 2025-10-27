#!/usr/bin/env bash

# Git hooks installer for ai-dev-standards
# Safely installs pre-commit hooks with backup and merge capabilities

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Paths
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
GIT_HOOKS_DIR="$REPO_ROOT/.git/hooks"
TEMPLATE_DIR="$REPO_ROOT/.git-hooks"
PRE_COMMIT_TEMPLATE="$TEMPLATE_DIR/pre-commit"
PRE_COMMIT_HOOK="$GIT_HOOKS_DIR/pre-commit"
BACKUP_SUFFIX=".backup-$(date +%Y%m%d-%H%M%S)"

echo -e "${BLUE}🔧 Installing Git hooks...${NC}"
echo ""

# Check if .git directory exists
if [ ! -d "$REPO_ROOT/.git" ]; then
    echo -e "${RED}❌ Error: Not a git repository${NC}"
    echo -e "   Expected .git directory at: $REPO_ROOT/.git"
    exit 1
fi

# Check if template exists
if [ ! -f "$PRE_COMMIT_TEMPLATE" ]; then
    echo -e "${RED}❌ Error: Pre-commit template not found${NC}"
    echo -e "   Expected file at: $PRE_COMMIT_TEMPLATE"
    exit 1
fi

# Ensure hooks directory exists
mkdir -p "$GIT_HOOKS_DIR"

# Check if hook already exists
if [ -f "$PRE_COMMIT_HOOK" ]; then
    # Check if it's already our hook
    if grep -q "Pre-commit hook for ai-dev-standards" "$PRE_COMMIT_HOOK" 2>/dev/null; then
        echo -e "${YELLOW}⚠️  Pre-commit hook already installed${NC}"
        echo -e "${BLUE}ℹ️  Updating to latest version...${NC}"
        cp "$PRE_COMMIT_TEMPLATE" "$PRE_COMMIT_HOOK"
        chmod +x "$PRE_COMMIT_HOOK"
        echo -e "${GREEN}✓ Hook updated successfully${NC}"
        exit 0
    fi

    # It's a different hook - back it up
    BACKUP_FILE="$PRE_COMMIT_HOOK$BACKUP_SUFFIX"
    echo -e "${YELLOW}⚠️  Existing pre-commit hook found${NC}"
    echo -e "${BLUE}ℹ️  Creating backup at: $BACKUP_FILE${NC}"
    cp "$PRE_COMMIT_HOOK" "$BACKUP_FILE"
    echo -e "${GREEN}✓ Backup created${NC}"
    echo ""

    # Ask user what to do
    echo -e "${YELLOW}Choose an option:${NC}"
    echo -e "  1) Replace existing hook with our hook (backup saved)"
    echo -e "  2) Keep existing hook (cancel installation)"
    echo -e "  3) Merge both hooks (advanced - manual editing required)"
    echo ""
    read -p "Enter choice [1-3]: " choice

    case $choice in
        1)
            echo -e "${BLUE}ℹ️  Replacing existing hook...${NC}"
            cp "$PRE_COMMIT_TEMPLATE" "$PRE_COMMIT_HOOK"
            chmod +x "$PRE_COMMIT_HOOK"
            echo -e "${GREEN}✓ Hook installed (backup saved)${NC}"
            ;;
        2)
            echo -e "${YELLOW}⚠️  Installation cancelled${NC}"
            echo -e "   Backup removed: $BACKUP_FILE"
            rm "$BACKUP_FILE"
            exit 0
            ;;
        3)
            # Create merged hook template
            MERGED_FILE="$PRE_COMMIT_HOOK.merged"
            echo "#!/usr/bin/env bash" > "$MERGED_FILE"
            echo "" >> "$MERGED_FILE"
            echo "# Merged pre-commit hook" >> "$MERGED_FILE"
            echo "# Original hook backed up to: $BACKUP_FILE" >> "$MERGED_FILE"
            echo "" >> "$MERGED_FILE"
            echo "# ===== ORIGINAL HOOK START =====" >> "$MERGED_FILE"
            tail -n +2 "$PRE_COMMIT_HOOK" >> "$MERGED_FILE"
            echo "# ===== ORIGINAL HOOK END =====" >> "$MERGED_FILE"
            echo "" >> "$MERGED_FILE"
            echo "# ===== AI-DEV-STANDARDS HOOK START =====" >> "$MERGED_FILE"
            tail -n +2 "$PRE_COMMIT_TEMPLATE" >> "$MERGED_FILE"
            echo "# ===== AI-DEV-STANDARDS HOOK END =====" >> "$MERGED_FILE"

            cp "$MERGED_FILE" "$PRE_COMMIT_HOOK"
            chmod +x "$PRE_COMMIT_HOOK"
            rm "$MERGED_FILE"

            echo -e "${GREEN}✓ Hooks merged${NC}"
            echo -e "${YELLOW}⚠️  IMPORTANT: Please edit $PRE_COMMIT_HOOK to resolve any conflicts${NC}"
            echo -e "   Original hook backed up to: $BACKUP_FILE"
            ;;
        *)
            echo -e "${RED}❌ Invalid choice${NC}"
            rm "$BACKUP_FILE"
            exit 1
            ;;
    esac
else
    # No existing hook - simple install
    echo -e "${BLUE}ℹ️  Installing pre-commit hook...${NC}"
    cp "$PRE_COMMIT_TEMPLATE" "$PRE_COMMIT_HOOK"
    chmod +x "$PRE_COMMIT_HOOK"
    echo -e "${GREEN}✓ Pre-commit hook installed${NC}"
fi

echo ""
echo -e "${GREEN}✨ Installation complete!${NC}"
echo ""
echo -e "${BLUE}📋 What the pre-commit hook does:${NC}"
echo -e "   • Validates documentation consistency"
echo -e "   • Runs ESLint code quality checks"
echo -e "   • Runs TypeScript type checking"
echo ""
echo -e "${BLUE}💡 Tips:${NC}"
echo -e "   • To skip validation: git commit -m \"message [skip-validation]\""
echo -e "   • To auto-fix issues: npm run validate:fix && npm run lint:fix"
echo -e "   • To uninstall: rm $PRE_COMMIT_HOOK"
echo ""
