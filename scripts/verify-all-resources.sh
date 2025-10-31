#!/bin/bash
# Comprehensive verification script for all resources in ai-dev-standards
# Verifies: Skills, MCPs, Agents, Tools, Schemas, Components

set -e

REPO_ROOT="/mnt/c/Users/david/OneDrive - Qolcom/AI/AI_Development_Projects/ai-dev-standards"
REPORT_FILE="$REPO_ROOT/verification-report.md"

echo "# Resource Verification Report" > "$REPORT_FILE"
echo "Generated: $(date)" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
TOTAL_ERRORS=0
TOTAL_WARNINGS=0
TOTAL_PASSED=0

echo -e "${YELLOW}Starting comprehensive resource verification...${NC}"
echo ""

# Function to check file exists
check_file() {
    local file="$1"
    local description="$2"
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $description"
        echo "✓ $description" >> "$REPORT_FILE"
        ((TOTAL_PASSED++))
        return 0
    else
        echo -e "${RED}✗${NC} $description - MISSING: $file"
        echo "✗ $description - MISSING: $file" >> "$REPORT_FILE"
        ((TOTAL_ERRORS++))
        return 1
    fi
}

# Function to check directory exists
check_dir() {
    local dir="$1"
    local description="$2"
    if [ -d "$dir" ]; then
        echo -e "${GREEN}✓${NC} $description"
        echo "✓ $description" >> "$REPORT_FILE"
        ((TOTAL_PASSED++))
        return 0
    else
        echo -e "${RED}✗${NC} $description - MISSING: $dir"
        echo "✗ $description - MISSING: $dir" >> "$REPORT_FILE"
        ((TOTAL_ERRORS++))
        return 1
    fi
}

# Function to validate JSON
validate_json() {
    local file="$1"
    local description="$2"
    if python3 -m json.tool "$file" > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} $description - Valid JSON"
        echo "✓ $description - Valid JSON" >> "$REPORT_FILE"
        ((TOTAL_PASSED++))
        return 0
    else
        echo -e "${RED}✗${NC} $description - INVALID JSON"
        echo "✗ $description - INVALID JSON" >> "$REPORT_FILE"
        ((TOTAL_ERRORS++))
        return 1
    fi
}

echo "## 1. Agent Documentation Verification" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo -e "${YELLOW}=== Verifying Agent Documentation ===${NC}"

check_file "$REPO_ROOT/.claude/agents/README.md" "Agent README"
check_file "$REPO_ROOT/.claude/agents/general-purpose.md" "General-Purpose Agent docs"
check_file "$REPO_ROOT/.claude/agents/explore.md" "Explore Agent docs"
check_file "$REPO_ROOT/.claude/agents/usage-examples.md" "Agent usage examples"
check_file "$REPO_ROOT/.claude/agents/agent-types.md" "Agent types taxonomy"
check_file "$REPO_ROOT/.claude/agents/skill-agents.md" "Skill-based agents docs"
check_file "$REPO_ROOT/.claude/agents/agent-workflows.md" "Agent workflows"
check_file "$REPO_ROOT/.claude/agents/agent-selection-guide.md" "Agent selection guide"
check_file "$REPO_ROOT/.claude/agents/multi-agent-patterns.md" "Multi-agent patterns"

echo "" >> "$REPORT_FILE"
echo ""

echo "## 2. Codex Configuration Verification" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo -e "${YELLOW}=== Verifying Codex Configuration ===${NC}"

check_file "$REPO_ROOT/.codex/README.md" "Codex README"
check_file "$REPO_ROOT/.codex/QUICK-START.md" "Codex Quick Start"
check_file "$REPO_ROOT/.codex/SETUP-COMPLETE.md" "Codex Setup Complete"
check_file "$REPO_ROOT/.codex/CLAUDE-VS-CODEX.md" "Claude vs Codex"
check_file "$REPO_ROOT/.codex/mcp-servers.json" "Codex MCP servers"
check_file "$REPO_ROOT/.codex/settings.json" "Codex settings"
check_file "$REPO_ROOT/.codex/codex.md" "Codex skill catalog"

echo "" >> "$REPORT_FILE"
echo ""

echo "## 3. Agent Registry Verification" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo -e "${YELLOW}=== Verifying Agent Registry ===${NC}"

check_file "$REPO_ROOT/META/agent-registry.json" "Agent registry"
if [ -f "$REPO_ROOT/META/agent-registry.json" ]; then
    validate_json "$REPO_ROOT/META/agent-registry.json" "Agent registry JSON"
fi

echo "" >> "$REPORT_FILE"
echo ""

echo "## 4. Skill Verification" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo -e "${YELLOW}=== Verifying Skills ===${NC}"

check_file "$REPO_ROOT/META/skill-registry.json" "Skill registry"
if [ -f "$REPO_ROOT/META/skill-registry.json" ]; then
    validate_json "$REPO_ROOT/META/skill-registry.json" "Skill registry JSON"

    # Count skills
    SKILL_COUNT=$(ls -d "$REPO_ROOT/SKILLS"/*/ 2>/dev/null | wc -l)
    echo -e "${GREEN}Found $SKILL_COUNT skill directories${NC}"
    echo "Found $SKILL_COUNT skill directories" >> "$REPORT_FILE"

    # Check for SKILL.md in each skill directory
    MISSING_SKILL_DOCS=0
    for skill_dir in "$REPO_ROOT/SKILLS"/*/; do
        skill_name=$(basename "$skill_dir")
        if [ ! -f "$skill_dir/SKILL.md" ]; then
            echo -e "${YELLOW}⚠${NC} Missing SKILL.md in $skill_name"
            echo "⚠ Missing SKILL.md in $skill_name" >> "$REPORT_FILE"
            ((MISSING_SKILL_DOCS++))
            ((TOTAL_WARNINGS++))
        fi
    done

    if [ $MISSING_SKILL_DOCS -eq 0 ]; then
        echo -e "${GREEN}✓${NC} All skills have SKILL.md"
        echo "✓ All skills have SKILL.md" >> "$REPORT_FILE"
        ((TOTAL_PASSED++))
    fi
fi

echo "" >> "$REPORT_FILE"
echo ""

echo "## 5. MCP Verification" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo -e "${YELLOW}=== Verifying MCPs ===${NC}"

check_file "$REPO_ROOT/META/mcp-registry.json" "MCP registry"
if [ -f "$REPO_ROOT/META/mcp-registry.json" ]; then
    validate_json "$REPO_ROOT/META/mcp-registry.json" "MCP registry JSON"

    # Count MCPs
    MCP_COUNT=$(ls -d "$REPO_ROOT/MCP"/*/ 2>/dev/null | wc -l)
    echo -e "${GREEN}Found $MCP_COUNT MCP directories${NC}"
    echo "Found $MCP_COUNT MCP directories" >> "$REPORT_FILE"
fi

echo "" >> "$REPORT_FILE"
echo ""

echo "## 6. Documentation Verification" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo -e "${YELLOW}=== Verifying Documentation ===${NC}"

check_file "$REPO_ROOT/DOCS/AGENTS-GUIDE.md" "Agents guide"
check_file "$REPO_ROOT/DOCS/AGENT-SKILL-INTEGRATION.md" "Agent-Skill integration guide"
check_file "$REPO_ROOT/DOCS/SYSTEM-OVERVIEW.md" "System overview"
check_file "$REPO_ROOT/DOCS/GETTING-STARTED.md" "Getting started guide"
check_file "$REPO_ROOT/.claude/CLAUDE.md" "Claude configuration"
check_file "$REPO_ROOT/README.md" "Main README"

echo "" >> "$REPORT_FILE"
echo ""

echo "## 7. Registry Files Verification" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo -e "${YELLOW}=== Verifying Registry Files ===${NC}"

check_file "$REPO_ROOT/META/skill-registry.json" "Skill registry"
check_file "$REPO_ROOT/META/mcp-registry.json" "MCP registry"
check_file "$REPO_ROOT/META/tool-registry.json" "Tool registry"
check_file "$REPO_ROOT/META/component-registry.json" "Component registry"
check_file "$REPO_ROOT/META/integration-registry.json" "Integration registry"
check_file "$REPO_ROOT/META/relationship-mapping.json" "Relationship mapping"
check_file "$REPO_ROOT/META/agent-registry.json" "Agent registry"

echo "" >> "$REPORT_FILE"
echo ""

echo "## 8. Tools & Scripts Verification" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo -e "${YELLOW}=== Verifying Tools & Scripts ===${NC}"

check_dir "$REPO_ROOT/TOOLS" "Tools directory"
check_dir "$REPO_ROOT/SCRIPTS" "Scripts directory"

# Count tools and scripts
if [ -d "$REPO_ROOT/TOOLS" ]; then
    TOOL_COUNT=$(find "$REPO_ROOT/TOOLS" -type f \( -name "*.ts" -o -name "*.js" \) 2>/dev/null | wc -l)
    echo -e "${GREEN}Found $TOOL_COUNT tool files${NC}"
    echo "Found $TOOL_COUNT tool files" >> "$REPORT_FILE"
fi

if [ -d "$REPO_ROOT/SCRIPTS" ]; then
    SCRIPT_COUNT=$(find "$REPO_ROOT/SCRIPTS" -type f 2>/dev/null | wc -l)
    echo -e "${GREEN}Found $SCRIPT_COUNT script files${NC}"
    echo "Found $SCRIPT_COUNT script files" >> "$REPORT_FILE"
fi

echo "" >> "$REPORT_FILE"
echo ""

echo "## 9. Components Verification" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo -e "${YELLOW}=== Verifying Components ===${NC}"

check_dir "$REPO_ROOT/COMPONENTS" "Components directory"

if [ -d "$REPO_ROOT/COMPONENTS" ]; then
    COMPONENT_COUNT=$(find "$REPO_ROOT/COMPONENTS" -type f \( -name "*.tsx" -o -name "*.jsx" \) 2>/dev/null | wc -l)
    echo -e "${GREEN}Found $COMPONENT_COUNT component files${NC}"
    echo "Found $COMPONENT_COUNT component files" >> "$REPORT_FILE"
fi

echo "" >> "$REPORT_FILE"
echo ""

# Generate Summary
echo "## Verification Summary" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo "- **Passed:** $TOTAL_PASSED" >> "$REPORT_FILE"
echo "- **Warnings:** $TOTAL_WARNINGS" >> "$REPORT_FILE"
echo "- **Errors:** $TOTAL_ERRORS" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

TOTAL_CHECKS=$((TOTAL_PASSED + TOTAL_WARNINGS + TOTAL_ERRORS))
echo "- **Total Checks:** $TOTAL_CHECKS" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

if [ $TOTAL_ERRORS -eq 0 ]; then
    OVERALL_STATUS="✓ PASSED"
    STATUS_COLOR=$GREEN
elif [ $TOTAL_ERRORS -le 5 ]; then
    OVERALL_STATUS="⚠ PASSED WITH WARNINGS"
    STATUS_COLOR=$YELLOW
else
    OVERALL_STATUS="✗ FAILED"
    STATUS_COLOR=$RED
fi

echo "**Overall Status:** $OVERALL_STATUS" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# Print Summary
echo ""
echo -e "${YELLOW}=========================${NC}"
echo -e "${YELLOW}Verification Summary${NC}"
echo -e "${YELLOW}=========================${NC}"
echo -e "Passed:   ${GREEN}$TOTAL_PASSED${NC}"
echo -e "Warnings: ${YELLOW}$TOTAL_WARNINGS${NC}"
echo -e "Errors:   ${RED}$TOTAL_ERRORS${NC}"
echo -e "Total:    $TOTAL_CHECKS"
echo ""
echo -e "Overall Status: ${STATUS_COLOR}$OVERALL_STATUS${NC}"
echo ""
echo "Detailed report saved to: $REPORT_FILE"

# Exit with appropriate code
if [ $TOTAL_ERRORS -eq 0 ]; then
    exit 0
else
    exit 1
fi
