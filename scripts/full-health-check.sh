#!/bin/bash

# AI-Dev-Standards COMPREHENSIVE Health Check
# Date: 2025-10-29
# Version: 1.0.0

echo "=========================================="
echo "  COMPREHENSIVE REPOSITORY HEALTH CHECK"
echo "=========================================="
echo ""
echo "Repository: ai-dev-standards"
echo "Date: $(date)"
echo "User: $(whoami)"
echo "Directory: $(pwd)"
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Track metrics
CRITICAL_ISSUES=0
WARNINGS=0
PASSED_CHECKS=0
TOTAL_CHECKS=0

# Helper functions
check_pass() {
    echo -e "${GREEN}✓${NC} $1"
    ((PASSED_CHECKS++))
    ((TOTAL_CHECKS++))
}

check_fail() {
    echo -e "${RED}✗${NC} $1"
    ((CRITICAL_ISSUES++))
    ((TOTAL_CHECKS++))
}

check_warn() {
    echo -e "${YELLOW}⚠${NC} $1"
    ((WARNINGS++))
    ((TOTAL_CHECKS++))
}

section_header() {
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "$1"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
}

# ==========================================
# 1. DIRECTORY STRUCTURE
# ==========================================
section_header "1. DIRECTORY STRUCTURE"

if [ ! -d ".claude" ]; then
    check_fail "Not in ai-dev-standards root directory"
    exit 1
else
    check_pass "In ai-dev-standards root directory"
fi

# Check required top-level directories
REQUIRED_DIRS=(".claude" "MCP-SERVERS" "SKILLS" "DOCS" "META" "COMPONENTS" "TOOLS" "EXAMPLES" "TEMPLATES" "UTILS" "scripts")

for dir in "${REQUIRED_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        check_pass "$dir/ exists"
    else
        check_fail "$dir/ missing"
    fi
done

# ==========================================
# 2. MCP SERVERS
# ==========================================
section_header "2. MCP SERVERS"

# Count MCP directories
MCP_DIRS=$(ls -d MCP-SERVERS/*/ 2>/dev/null | wc -l)
echo "Repository MCP directories: $MCP_DIRS"

# Count configured MCPs
if [ -f ".claude/mcp-settings.json" ]; then
    if command -v jq &> /dev/null; then
        CONFIGURED_MCPS=$(cat .claude/mcp-settings.json | jq '.mcpServers | keys | length' 2>/dev/null)
        echo "Configured MCPs: $CONFIGURED_MCPS"

        REPO_MCPS=$(cat .claude/mcp-settings.json | jq -r '.mcpServers | keys[]' | grep -v "^framework\|domain-memory\|project-health\|workflow-orchestrator" | wc -l)
        FRAMEWORK_MCPS=$(cat .claude/mcp-settings.json | jq -r '.mcpServers | keys[]' | grep "^framework" | wc -l)
        MARKETPLACE_MCPS=$(cat .claude/mcp-settings.json | jq -r '.mcpServers | keys[]' | grep -E "domain-memory|project-health|workflow-orchestrator" | wc -l)

        echo "  - Repository MCPs: $REPO_MCPS"
        echo "  - Framework MCPs: $FRAMEWORK_MCPS"
        echo "  - Marketplace MCPs: $MARKETPLACE_MCPS"

        if [ "$MCP_DIRS" -eq "$REPO_MCPS" ]; then
            check_pass "All repository MCPs are configured"
        else
            check_fail "MCP count mismatch: $MCP_DIRS directories but $REPO_MCPS configured"
        fi
    else
        check_warn "jq not installed - skipping detailed MCP analysis"
    fi
else
    check_fail ".claude/mcp-settings.json not found"
fi

# Check each MCP has required files
echo ""
echo "Checking MCP structure:"
MCPS_WITH_ISSUES=0
for mcp_dir in MCP-SERVERS/*/; do
    mcp_name=$(basename "$mcp_dir")

    # Check for package.json
    if [ ! -f "${mcp_dir}package.json" ]; then
        check_warn "$mcp_name: missing package.json"
        ((MCPS_WITH_ISSUES++))
    fi

    # Check for README
    if [ ! -f "${mcp_dir}README.md" ]; then
        check_warn "$mcp_name: missing README.md"
        ((MCPS_WITH_ISSUES++))
    fi

    # Check for src/ or dist/
    if [ ! -d "${mcp_dir}src" ] && [ ! -d "${mcp_dir}dist" ]; then
        check_warn "$mcp_name: missing src/ and dist/"
        ((MCPS_WITH_ISSUES++))
    fi
done

if [ $MCPS_WITH_ISSUES -eq 0 ]; then
    check_pass "All MCPs have proper structure"
fi

# ==========================================
# 3. SKILLS
# ==========================================
section_header "3. SKILLS"

SKILL_DIRS=$(ls -d SKILLS/*/ 2>/dev/null | wc -l)
echo "Total skills: $SKILL_DIRS"

# Check each skill has SKILL.md
SKILLS_MISSING_MD=0
for skill_dir in SKILLS/*/; do
    if [ ! -f "${skill_dir}SKILL.md" ]; then
        skill_name=$(basename "$skill_dir")
        check_warn "Skill missing SKILL.md: $skill_name"
        ((SKILLS_MISSING_MD++))
    fi
done

if [ $SKILLS_MISSING_MD -eq 0 ]; then
    check_pass "All skills have SKILL.md"
else
    check_warn "$SKILLS_MISSING_MD skills missing SKILL.md"
fi

# Check skills directory structure
echo ""
echo "Checking skill structure:"
SKILLS_WITH_ISSUES=0
for skill_dir in SKILLS/*/; do
    skill_name=$(basename "$skill_dir")

    # Check for subdirectories
    if [ ! -d "${skill_dir}examples" ] && [ ! -d "${skill_dir}templates" ] && [ ! -d "${skill_dir}scripts" ]; then
        # It's okay if a skill doesn't have these, but note it
        :
    fi
done

check_pass "Skill structure validation complete"

# ==========================================
# 4. DOCUMENTATION
# ==========================================
section_header "4. DOCUMENTATION"

REQUIRED_DOCS=(
    "README.md"
    ".claude/CLAUDE.md"
    ".claude/MCP-QUICK-REFERENCE.md"
    "DOCS/MCP-CONFIGURATION-GUIDE.md"
    "DOCS/MCP-FIX-SUMMARY.md"
    "DOCS/MARKETPLACE-INSTALLATION-GUIDE.md"
    "DOCS/MARKETPLACE-RECOMMENDATIONS.md"
    "DOCS/CONFIGURATION-AUDIT.md"
)

for doc in "${REQUIRED_DOCS[@]}"; do
    if [ -f "$doc" ]; then
        check_pass "$doc exists"
    else
        check_warn "$doc missing"
    fi
done

# Check documentation is not empty
for doc in "${REQUIRED_DOCS[@]}"; do
    if [ -f "$doc" ]; then
        if [ ! -s "$doc" ]; then
            check_warn "$doc is empty"
        fi
    fi
done

# ==========================================
# 5. META & REGISTRY
# ==========================================
section_header "5. META & REGISTRY"

if [ -f "META/mcp-registry.json" ]; then
    check_pass "META/mcp-registry.json exists"

    if command -v jq &> /dev/null; then
        REGISTRY_COUNT=$(cat META/mcp-registry.json | jq '.total_mcps' 2>/dev/null)
        REGISTRY_MCPS=$(cat META/mcp-registry.json | jq '.mcps | length' 2>/dev/null)

        echo "Registry reports: $REGISTRY_COUNT MCPs"
        echo "Registry contains: $REGISTRY_MCPS definitions"

        if [ "$REGISTRY_COUNT" -eq "$REGISTRY_MCPS" ]; then
            check_pass "Registry count matches definitions"
        else
            check_fail "Registry count mismatch"
        fi

        # Note about registry scope
        echo ""
        echo "Note: Registry tracks repository MCPs only (not framework/marketplace)"
    fi
else
    check_fail "META/mcp-registry.json missing"
fi

# ==========================================
# 6. GIT HEALTH
# ==========================================
section_header "6. GIT HEALTH"

if git rev-parse --git-dir > /dev/null 2>&1; then
    check_pass "Git repository initialized"

    CURRENT_BRANCH=$(git branch --show-current)
    echo "Current branch: $CURRENT_BRANCH"

    # Check for uncommitted changes
    if [ -z "$(git status --porcelain)" ]; then
        check_pass "Working directory clean"
    else
        UNCOMMITTED_COUNT=$(git status --short | wc -l)
        check_warn "$UNCOMMITTED_COUNT uncommitted changes"
    fi

    # Check if remote is configured
    if git remote -v | grep -q origin; then
        check_pass "Git remote configured"
    else
        check_warn "No git remote configured"
    fi

    # Show recent commits
    echo ""
    echo "Recent commits:"
    git log --oneline -5

else
    check_fail "Not a git repository"
fi

# ==========================================
# 7. FILE STATISTICS
# ==========================================
section_header "7. FILE STATISTICS"

MD_COUNT=$(find . -name "*.md" -not -path "*/node_modules/*" -not -path "*/.git/*" -not -path "*/dist/*" | wc -l)
TS_COUNT=$(find . -name "*.ts" -not -path "*/node_modules/*" -not -path "*/.git/*" -not -path "*/dist/*" | wc -l)
JS_COUNT=$(find . -name "*.js" -not -path "*/node_modules/*" -not -path "*/.git/*" -not -path "*/dist/*" | wc -l)
JSON_COUNT=$(find . -name "*.json" -not -path "*/node_modules/*" -not -path "*/.git/*" -not -path "*/dist/*" | wc -l)
PY_COUNT=$(find . -name "*.py" -not -path "*/node_modules/*" -not -path "*/.git/*" | wc -l)

echo "Markdown files: $MD_COUNT"
echo "TypeScript files: $TS_COUNT"
echo "JavaScript files: $JS_COUNT"
echo "JSON files: $JSON_COUNT"
echo "Python files: $PY_COUNT"

TOTAL_FILES=$((MD_COUNT + TS_COUNT + JS_COUNT + JSON_COUNT + PY_COUNT))
echo "Total tracked files: $TOTAL_FILES"

if [ $TOTAL_FILES -gt 0 ]; then
    check_pass "Repository has content"
else
    check_fail "Repository appears empty"
fi

# ==========================================
# 8. DEPENDENCIES
# ==========================================
section_header "8. DEPENDENCIES & BUILD TOOLS"

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    check_pass "Node.js installed: $NODE_VERSION"
else
    check_warn "Node.js not installed"
fi

# Check npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    check_pass "npm installed: $NPM_VERSION"
else
    check_warn "npm not installed"
fi

# Check TypeScript
if command -v tsc &> /dev/null; then
    TSC_VERSION=$(tsc --version)
    check_pass "TypeScript installed: $TSC_VERSION"
else
    check_warn "TypeScript not globally installed"
fi

# Check jq
if command -v jq &> /dev/null; then
    JQ_VERSION=$(jq --version)
    check_pass "jq installed: $JQ_VERSION"
else
    check_warn "jq not installed (needed for JSON processing)"
fi

# Check Python
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version)
    check_pass "Python installed: $PYTHON_VERSION"
else
    check_warn "Python not installed"
fi

# ==========================================
# 9. MARKETPLACE MCPS
# ==========================================
section_header "9. MARKETPLACE MCPs"

MARKETPLACE_DIR="/home/david/.claude/plugins/marketplaces/claude-code-plugins-plus/plugins/mcp"

if [ -d "$MARKETPLACE_DIR" ]; then
    check_pass "Marketplace installed"

    # Check each marketplace MCP
    declare -a MARKETPLACE_MCPS=("domain-memory-agent" "project-health-auditor" "workflow-orchestrator")

    for mcp in "${MARKETPLACE_MCPS[@]}"; do
        echo ""
        echo "Checking $mcp:"

        if [ -d "$MARKETPLACE_DIR/$mcp" ]; then
            echo "  ✓ Directory exists"
        else
            echo "  ✗ Directory missing"
            ((CRITICAL_ISSUES++))
            continue
        fi

        # Check if built
        if ls "$MARKETPLACE_DIR/$mcp/dist/servers"/*.js 1> /dev/null 2>&1; then
            echo "  ✓ Built (dist/servers/*.js exists)"
        else
            echo "  ✗ Not built"
            ((CRITICAL_ISSUES++))
        fi

        # Check if configured
        if [ -f ".claude/mcp-settings.json" ]; then
            if grep -q "\"$mcp\"" .claude/mcp-settings.json 2>/dev/null; then
                echo "  ✓ Configured"
            else
                echo "  ✗ Not configured"
                ((CRITICAL_ISSUES++))
            fi
        fi
    done

    check_pass "Marketplace MCP validation complete"
else
    check_warn "Marketplace not installed"
fi

# ==========================================
# 10. BUILD STATUS
# ==========================================
section_header "10. BUILD STATUS"

BUILT_MCPS=0
UNBUILD_MCPS=0

for mcp_dir in MCP-SERVERS/*/; do
    mcp_name=$(basename "$mcp_dir")

    if [ -d "${mcp_dir}dist" ]; then
        ((BUILT_MCPS++))
    else
        ((UNBUILD_MCPS++))
    fi
done

echo "Built MCPs: $BUILT_MCPS"
echo "Unbuilt MCPs: $UNBUILD_MCPS"

if [ $UNBUILD_MCPS -eq 0 ]; then
    check_pass "All MCPs are built"
elif [ $UNBUILD_MCPS -lt 5 ]; then
    check_warn "$UNBUILD_MCPS MCPs not built"
else
    check_fail "Many MCPs not built ($UNBUILD_MCPS)"
fi

# ==========================================
# 11. CONFIGURATION CONSISTENCY
# ==========================================
section_header "11. CONFIGURATION CONSISTENCY"

# Check .claude/mcp-settings.json vs MCP-SERVERS/
if [ -f ".claude/mcp-settings.json" ] && command -v jq &> /dev/null; then
    ls -d MCP-SERVERS/*/ | sed 's|MCP-SERVERS/||g' | sed 's|/||g' | sort > /tmp/mcp-dirs.txt
    cat .claude/mcp-settings.json | jq -r '.mcpServers | keys[]' | grep -v "^framework\|domain-memory\|project-health\|workflow-orchestrator" | sort > /tmp/mcp-configured.txt

    MISSING=$(comm -23 /tmp/mcp-dirs.txt /tmp/mcp-configured.txt | wc -l)
    EXTRA=$(comm -13 /tmp/mcp-dirs.txt /tmp/mcp-configured.txt | wc -l)

    if [ "$MISSING" -eq 0 ]; then
        check_pass "No MCPs missing from configuration"
    else
        check_fail "$MISSING MCPs not configured"
        comm -23 /tmp/mcp-dirs.txt /tmp/mcp-configured.txt | while read line; do
            echo "    Missing: $line"
        done
    fi

    if [ "$EXTRA" -eq 0 ]; then
        check_pass "No extra MCPs in configuration"
    else
        check_warn "$EXTRA MCPs in config but not in repo"
    fi
fi

# ==========================================
# 12. DISK USAGE
# ==========================================
section_header "12. DISK USAGE"

REPO_SIZE=$(du -sh . 2>/dev/null | cut -f1)
echo "Repository size: $REPO_SIZE"

if [ -d "node_modules" ]; then
    NODE_MODULES_SIZE=$(du -sh node_modules 2>/dev/null | cut -f1)
    echo "node_modules size: $NODE_MODULES_SIZE"
fi

MCP_SIZE=$(du -sh MCP-SERVERS 2>/dev/null | cut -f1)
echo "MCP-SERVERS size: $MCP_SIZE"

SKILLS_SIZE=$(du -sh SKILLS 2>/dev/null | cut -f1)
echo "SKILLS size: $SKILLS_SIZE"

check_pass "Disk usage analysis complete"

# ==========================================
# 13. SECURITY CHECK
# ==========================================
section_header "13. SECURITY CHECK"

# Check for .env files that might contain secrets
ENV_FILES=$(find . -name ".env" -o -name ".env.*" -not -name ".env.example" -not -path "*/node_modules/*" | wc -l)
if [ $ENV_FILES -gt 0 ]; then
    check_warn "$ENV_FILES .env files found (ensure they're gitignored)"
else
    check_pass "No untracked .env files found"
fi

# Check .gitignore exists
if [ -f ".gitignore" ]; then
    check_pass ".gitignore exists"

    # Check for common entries
    if grep -q "node_modules" .gitignore; then
        check_pass ".gitignore includes node_modules"
    else
        check_warn ".gitignore missing node_modules"
    fi

    if grep -q ".env" .gitignore; then
        check_pass ".gitignore includes .env"
    else
        check_warn ".gitignore missing .env"
    fi
else
    check_fail ".gitignore missing"
fi

# ==========================================
# 14. README QUALITY
# ==========================================
section_header "14. README QUALITY"

if [ -f "README.md" ]; then
    README_SIZE=$(wc -l < README.md)
    echo "README.md lines: $README_SIZE"

    if [ $README_SIZE -lt 50 ]; then
        check_warn "README.md is short (< 50 lines)"
    else
        check_pass "README.md has substantial content"
    fi

    # Check for key sections
    if grep -q "## Installation" README.md || grep -q "## Getting Started" README.md; then
        check_pass "README has installation instructions"
    else
        check_warn "README missing installation section"
    fi

    if grep -q "## Usage" README.md || grep -q "## Examples" README.md; then
        check_pass "README has usage examples"
    else
        check_warn "README missing usage section"
    fi
else
    check_fail "README.md missing"
fi

# ==========================================
# FINAL SUMMARY
# ==========================================
section_header "HEALTH CHECK SUMMARY"

SCORE_PERCENTAGE=$((PASSED_CHECKS * 100 / TOTAL_CHECKS))

echo "Total Checks: $TOTAL_CHECKS"
echo "Passed: $PASSED_CHECKS"
echo "Warnings: $WARNINGS"
echo "Critical Issues: $CRITICAL_ISSUES"
echo ""
echo "Health Score: $SCORE_PERCENTAGE%"
echo ""

if [ $CRITICAL_ISSUES -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✓ EXCELLENT: Repository is in perfect health!${NC}"
    exit 0
elif [ $CRITICAL_ISSUES -eq 0 ] && [ $WARNINGS -lt 10 ]; then
    echo -e "${GREEN}✓ VERY GOOD: $WARNINGS minor warnings${NC}"
    exit 0
elif [ $CRITICAL_ISSUES -eq 0 ]; then
    echo -e "${YELLOW}⚠ GOOD: $WARNINGS warnings (no critical issues)${NC}"
    exit 0
elif [ $CRITICAL_ISSUES -lt 5 ]; then
    echo -e "${YELLOW}⚠ FAIR: $CRITICAL_ISSUES critical issues, $WARNINGS warnings${NC}"
    echo ""
    echo "Recommendation: Address critical issues"
    exit 1
else
    echo -e "${RED}✗ POOR: $CRITICAL_ISSUES critical issues, $WARNINGS warnings${NC}"
    echo ""
    echo "Recommendation: Immediate attention required"
    exit 1
fi
