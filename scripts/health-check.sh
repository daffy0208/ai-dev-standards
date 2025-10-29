#!/bin/bash

# AI-Dev-Standards Repository Health Check
# Run this script to get an accurate, verifiable assessment
# Date: 2025-10-29

echo "======================================"
echo "  AI-DEV-STANDARDS HEALTH CHECK"
echo "======================================"
echo ""
echo "Starting comprehensive health check..."
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track issues
ISSUES=0
WARNINGS=0

# ======================================
# 1. REPOSITORY STRUCTURE
# ======================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1. REPOSITORY STRUCTURE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if we're in the right directory
if [ ! -d ".claude" ]; then
    echo -e "${RED}✗ ERROR: Not in ai-dev-standards root directory${NC}"
    echo "  Current directory: $(pwd)"
    ((ISSUES++))
    exit 1
else
    echo -e "${GREEN}✓ In ai-dev-standards root directory${NC}"
fi

# Check key directories
REQUIRED_DIRS=(
    ".claude"
    "MCP-SERVERS"
    "SKILLS"
    "DOCS"
    "META"
    "COMPONENTS"
    "TOOLS"
)

echo ""
echo "Checking required directories:"
for dir in "${REQUIRED_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        echo -e "  ${GREEN}✓${NC} $dir"
    else
        echo -e "  ${RED}✗${NC} $dir (MISSING)"
        ((ISSUES++))
    fi
done

# ======================================
# 2. MCP CONFIGURATION
# ======================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "2. MCP CONFIGURATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Count MCP directories
MCP_DIRS=$(ls -d MCP-SERVERS/*/ 2>/dev/null | wc -l)
echo "Repository MCP directories: $MCP_DIRS"

# Count configured MCPs in Claude Code
if [ -f ".claude/mcp-settings.json" ]; then
    CONFIGURED_MCPS=$(cat .claude/mcp-settings.json | jq '.mcpServers | keys | length' 2>/dev/null)
    echo "Configured in Claude Code: $CONFIGURED_MCPS"

    # Extract repo MCPs vs marketplace MCPs
    REPO_MCPS=$(cat .claude/mcp-settings.json | jq -r '.mcpServers | keys[]' | grep -v "domain-memory\|project-health\|workflow-orchestrator" | wc -l)
    MARKETPLACE_MCPS=$(cat .claude/mcp-settings.json | jq -r '.mcpServers | keys[]' | grep -E "domain-memory|project-health|workflow-orchestrator" | wc -l)

    echo "  - Repository MCPs: $REPO_MCPS"
    echo "  - Marketplace MCPs: $MARKETPLACE_MCPS"

    # Verify counts match
    if [ "$MCP_DIRS" -eq "$REPO_MCPS" ]; then
        echo -e "${GREEN}✓ All repository MCPs are configured${NC}"
    else
        echo -e "${RED}✗ Mismatch: $MCP_DIRS directories but only $REPO_MCPS configured${NC}"
        ((ISSUES++))
    fi
else
    echo -e "${RED}✗ .claude/mcp-settings.json not found${NC}"
    ((ISSUES++))
fi

# Check for missing MCPs
echo ""
echo "Checking for missing MCPs:"
ls -d MCP-SERVERS/*/ | sed 's|MCP-SERVERS/||g' | sed 's|/||g' | sort > /tmp/mcp-dirs.txt
cat .claude/mcp-settings.json | jq -r '.mcpServers | keys[]' | grep -v "domain-memory\|project-health\|workflow-orchestrator" | sort > /tmp/mcp-configured.txt

MISSING=$(comm -23 /tmp/mcp-dirs.txt /tmp/mcp-configured.txt)
if [ -z "$MISSING" ]; then
    echo -e "${GREEN}✓ No missing MCPs${NC}"
else
    echo -e "${RED}✗ Missing MCPs:${NC}"
    echo "$MISSING" | while read line; do
        echo "    - $line"
        ((ISSUES++))
    done
fi

# Check for MCPs in config but not in repo
EXTRA=$(comm -13 /tmp/mcp-dirs.txt /tmp/mcp-configured.txt)
if [ -z "$EXTRA" ]; then
    echo -e "${GREEN}✓ No extra MCPs in config${NC}"
else
    echo -e "${YELLOW}⚠ MCPs in config but not in repo:${NC}"
    echo "$EXTRA" | while read line; do
        echo "    - $line"
        ((WARNINGS++))
    done
fi

# ======================================
# 3. MARKETPLACE MCPs
# ======================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "3. MARKETPLACE MCPs"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

MARKETPLACE_DIR="/home/david/.claude/plugins/marketplaces/claude-code-plugins-plus/plugins/mcp"

if [ -d "$MARKETPLACE_DIR" ]; then
    echo "Marketplace location: $MARKETPLACE_DIR"

    # Check each marketplace MCP
    declare -a MARKETPLACE_MCPS_ARRAY=("domain-memory-agent" "project-health-auditor" "workflow-orchestrator")

    for mcp in "${MARKETPLACE_MCPS_ARRAY[@]}"; do
        echo ""
        echo "Checking $mcp:"

        # Check directory exists
        if [ -d "$MARKETPLACE_DIR/$mcp" ]; then
            echo -e "  ${GREEN}✓${NC} Directory exists"
        else
            echo -e "  ${RED}✗${NC} Directory missing"
            ((ISSUES++))
            continue
        fi

        # Check if built
        if [ -f "$MARKETPLACE_DIR/$mcp/dist/servers"/*.js ]; then
            echo -e "  ${GREEN}✓${NC} Built (dist/servers/*.js exists)"
        else
            echo -e "  ${RED}✗${NC} Not built (dist/servers/*.js missing)"
            ((ISSUES++))
        fi

        # Check if configured
        if grep -q "\"$mcp\"" .claude/mcp-settings.json 2>/dev/null; then
            echo -e "  ${GREEN}✓${NC} Configured in .claude/mcp-settings.json"
        else
            echo -e "  ${RED}✗${NC} Not configured in .claude/mcp-settings.json"
            ((ISSUES++))
        fi
    done
else
    echo -e "${YELLOW}⚠ Marketplace not installed at $MARKETPLACE_DIR${NC}"
    ((WARNINGS++))
fi

# ======================================
# 4. SKILLS
# ======================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "4. SKILLS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

SKILL_DIRS=$(ls -d SKILLS/*/ 2>/dev/null | wc -l)
echo "Total skills: $SKILL_DIRS"

# Check each skill has SKILL.md
MISSING_SKILL_MD=0
for skill_dir in SKILLS/*/; do
    if [ ! -f "${skill_dir}SKILL.md" ]; then
        if [ $MISSING_SKILL_MD -eq 0 ]; then
            echo -e "${YELLOW}⚠ Skills missing SKILL.md:${NC}"
        fi
        echo "    - $(basename $skill_dir)"
        ((MISSING_SKILL_MD++))
        ((WARNINGS++))
    fi
done

if [ $MISSING_SKILL_MD -eq 0 ]; then
    echo -e "${GREEN}✓ All skills have SKILL.md${NC}"
fi

# ======================================
# 5. DOCUMENTATION
# ======================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "5. DOCUMENTATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

REQUIRED_DOCS=(
    "DOCS/MCP-CONFIGURATION-GUIDE.md"
    "DOCS/MCP-FIX-SUMMARY.md"
    "DOCS/MARKETPLACE-INSTALLATION-GUIDE.md"
    "DOCS/MARKETPLACE-RECOMMENDATIONS.md"
    "DOCS/CONFIGURATION-AUDIT.md"
    ".claude/MCP-QUICK-REFERENCE.md"
    ".claude/CLAUDE.md"
    "README.md"
)

echo "Checking documentation:"
for doc in "${REQUIRED_DOCS[@]}"; do
    if [ -f "$doc" ]; then
        echo -e "  ${GREEN}✓${NC} $doc"
    else
        echo -e "  ${YELLOW}⚠${NC} $doc (missing)"
        ((WARNINGS++))
    fi
done

# ======================================
# 6. REGISTRY CONSISTENCY
# ======================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "6. REGISTRY CONSISTENCY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ -f "META/mcp-registry.json" ]; then
    REGISTRY_COUNT=$(cat META/mcp-registry.json | jq '.total_mcps' 2>/dev/null)
    echo "Registry reports: $REGISTRY_COUNT MCPs"

    # Count MCPs in registry
    REGISTRY_MCPS=$(cat META/mcp-registry.json | jq '.mcps | length' 2>/dev/null)
    echo "Registry contains: $REGISTRY_MCPS MCP definitions"

    if [ "$REGISTRY_COUNT" -eq "$REGISTRY_MCPS" ]; then
        echo -e "${GREEN}✓ Registry count matches definitions${NC}"
    else
        echo -e "${RED}✗ Registry count mismatch${NC}"
        ((ISSUES++))
    fi

    # Note: Registry tracks repo MCPs (49) + 1 external (archon) = 50
    # Does NOT include marketplace MCPs (those are external)
    echo ""
    echo "Note: Registry tracks repository MCPs only (not marketplace MCPs)"
else
    echo -e "${RED}✗ META/mcp-registry.json not found${NC}"
    ((ISSUES++))
fi

# ======================================
# 7. GIT STATUS
# ======================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "7. GIT STATUS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if git rev-parse --git-dir > /dev/null 2>&1; then
    echo "Current branch: $(git branch --show-current)"

    # Check for uncommitted changes
    if [ -z "$(git status --porcelain)" ]; then
        echo -e "${GREEN}✓ Working directory clean${NC}"
    else
        echo -e "${YELLOW}⚠ Uncommitted changes:${NC}"
        git status --short | head -10
        if [ $(git status --short | wc -l) -gt 10 ]; then
            echo "  ... and $(($(git status --short | wc -l) - 10)) more files"
        fi
        ((WARNINGS++))
    fi

    # Show recent commits
    echo ""
    echo "Recent commits:"
    git log --oneline -5
else
    echo -e "${RED}✗ Not a git repository${NC}"
    ((ISSUES++))
fi

# ======================================
# 8. FILE COUNTS
# ======================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "8. FILE STATISTICS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "Markdown files: $(find . -name "*.md" -not -path "*/node_modules/*" -not -path "*/.git/*" | wc -l)"
echo "TypeScript files: $(find . -name "*.ts" -not -path "*/node_modules/*" -not -path "*/.git/*" | wc -l)"
echo "JavaScript files: $(find . -name "*.js" -not -path "*/node_modules/*" -not -path "*/.git/*" | wc -l)"
echo "JSON files: $(find . -name "*.json" -not -path "*/node_modules/*" -not -path "*/.git/*" | wc -l)"
echo "Python files: $(find . -name "*.py" -not -path "*/node_modules/*" -not -path "*/.git/*" | wc -l)"

# ======================================
# SUMMARY
# ======================================
echo ""
echo "======================================"
echo "  HEALTH CHECK SUMMARY"
echo "======================================"
echo ""

if [ $ISSUES -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✓ EXCELLENT: No issues or warnings found${NC}"
    exit 0
elif [ $ISSUES -eq 0 ]; then
    echo -e "${YELLOW}⚠ GOOD: $WARNINGS warning(s) found (no critical issues)${NC}"
    exit 0
else
    echo -e "${RED}✗ ISSUES FOUND: $ISSUES critical issue(s), $WARNINGS warning(s)${NC}"
    echo ""
    echo "Review the output above to address critical issues."
    exit 1
fi
