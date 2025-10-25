#!/bin/bash

# validate-sync.sh
# BLOCKS commits if registries and documentation are out of sync
# This script has TEETH - it will fail the commit if inconsistencies are found

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🔍 Validating registry synchronization..."

# Extract counts from registries
SKILL_COUNT=$(jq '.skills | length' META/skill-registry.json)
MCP_COUNT=$(jq '.mcps | length' META/mcp-registry.json)
TOTAL_RESOURCES=$((SKILL_COUNT + MCP_COUNT + 9 + 4 + 13 + 6))

echo "📊 Registry Counts:"
echo "   Skills: $SKILL_COUNT"
echo "   MCPs: $MCP_COUNT"
echo "   Total: $TOTAL_RESOURCES"

# Files that MUST have correct stats
CRITICAL_FILES=(
    ".cursorrules"
    "README.md"
    "INSTALL.md"
    "SETUP.txt"
    "DOCS/QUICK-START.md"
    ".claude/CLAUDE.md"
)

TEMPLATE_FILES=(
    "TEMPLATES/cursorrules-ai-rag.md"
    "TEMPLATES/cursorrules-existing-project.md"
    "TEMPLATES/cursorrules-minimal.md"
    "TEMPLATES/cursorrules-quick-test.md"
    "TEMPLATES/cursorrules-saas.md"
)

ERRORS=0

# Check critical files
echo ""
echo "🔎 Checking critical files..."
for file in "${CRITICAL_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        echo -e "${RED}✗${NC} $file - FILE NOT FOUND"
        ((ERRORS++))
        continue
    fi

    # Check for old skill counts (previous was 37, now should match SKILL_COUNT)
    if grep -q "37 skills\|37 Skills" "$file" && [ "$SKILL_COUNT" -ne 37 ]; then
        echo -e "${RED}✗${NC} $file - Contains '37 skills' but should be '$SKILL_COUNT skills'"
        ((ERRORS++))
    fi

    # Check for old MCP counts (previous was 34, now should match MCP_COUNT)
    if grep -q "34 MCPs\|34 MCP" "$file" && [ "$MCP_COUNT" -ne 34 ]; then
        echo -e "${RED}✗${NC} $file - Contains '34 MCPs' but should be '$MCP_COUNT MCPs'"
        ((ERRORS++))
    fi

    # Check for old total counts (previous was 103, now should match TOTAL_RESOURCES)
    if grep -q "103 total\|103 Total" "$file" && [ "$TOTAL_RESOURCES" -ne 103 ]; then
        echo -e "${RED}✗${NC} $file - Contains '103 total' but should be '$TOTAL_RESOURCES total'"
        ((ERRORS++))
    fi

    # Verify current counts are present
    if ! grep -q "$SKILL_COUNT skills\|$SKILL_COUNT Skills" "$file"; then
        echo -e "${YELLOW}⚠${NC}  $file - Missing current skill count ($SKILL_COUNT)"
        # Don't increment errors for missing (might not be in every file)
    fi
done

# Check template files
echo ""
echo "🔎 Checking template files..."
for file in "${TEMPLATE_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        echo -e "${RED}✗${NC} $file - FILE NOT FOUND"
        ((ERRORS++))
        continue
    fi

    # Check for old counts
    if grep -q "37 Skills\|34 MCPs" "$file"; then
        if [ "$SKILL_COUNT" -ne 37 ] || [ "$MCP_COUNT" -ne 34 ]; then
            echo -e "${RED}✗${NC} $file - Contains old stats"
            ((ERRORS++))
        fi
    fi
done

# Check META/relationship-mapping.json statistics
echo ""
echo "🔎 Checking relationship mappings..."
MAPPING_SKILLS=$(jq '.statistics.total_skills' META/relationship-mapping.json)
MAPPING_MCPS=$(jq '.statistics.total_mcps' META/relationship-mapping.json)

if [ "$MAPPING_SKILLS" -ne "$SKILL_COUNT" ]; then
    echo -e "${RED}✗${NC} META/relationship-mapping.json - skill count mismatch (has $MAPPING_SKILLS, should be $SKILL_COUNT)"
    ((ERRORS++))
fi

if [ "$MAPPING_MCPS" -ne "$MCP_COUNT" ]; then
    echo -e "${RED}✗${NC} META/relationship-mapping.json - MCP count mismatch (has $MAPPING_MCPS, should be $MCP_COUNT)"
    ((ERRORS++))
fi

# Summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✓ All checks passed!${NC}"
    echo "  Ready to commit."
    exit 0
else
    echo -e "${RED}✗ VALIDATION FAILED${NC}"
    echo "  Found $ERRORS synchronization error(s)"
    echo ""
    echo "  🚫 COMMIT BLOCKED"
    echo ""
    echo "  Fix these issues before committing:"
    echo "  1. Update all files listed above with correct counts"
    echo "  2. Run this script again: bash scripts/validate-sync.sh"
    echo "  3. Once validation passes, retry your commit"
    exit 1
fi
