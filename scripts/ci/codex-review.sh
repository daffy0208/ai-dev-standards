#!/bin/bash
#
# codex-review.sh - Run Codex CLI reviews on specified files
#
# Usage: ./codex-review.sh <file1> <file2> ...
# Exit codes:
#   0 - No HIGH or CRITICAL issues found
#   1 - HIGH or CRITICAL issues found
#   2 - Script error

set -euo pipefail

# Colors for output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if files were provided
if [ $# -eq 0 ]; then
    echo -e "${RED}Error: No files specified${NC}"
    echo "Usage: $0 <file1> <file2> ..."
    exit 2
fi

# Check if codex is installed
if ! command -v codex &> /dev/null; then
    echo -e "${RED}Error: Codex CLI not found${NC}"
    echo "Install with: npm install -g @anthropics/codex-cli"
    exit 2
fi

# Initialize results
declare -a ALL_FINDINGS=()
HIGH_CRITICAL_COUNT=0
MEDIUM_COUNT=0
LOW_COUNT=0

echo -e "${BLUE}Starting Codex code review...${NC}"
echo -e "${BLUE}Files to review: $#${NC}"
echo ""

# Process each file
for FILE in "$@"; do
    if [ ! -f "$FILE" ]; then
        echo -e "${YELLOW}Warning: File not found: $FILE${NC}"
        continue
    fi

    echo -e "${BLUE}Reviewing: $FILE${NC}"

    # Run Codex review in read-only sandbox mode
    # Using --output json for structured output
    REVIEW_OUTPUT=$(codex exec --sandbox read-only "
Review this code for bugs, security vulnerabilities, and code quality issues.
Focus on:
1. Logic errors and edge cases
2. Security vulnerabilities (injection, XSS, insecure dependencies)
3. Error handling gaps
4. Resource leaks (memory, file handles, etc.)
5. Race conditions and concurrency issues
6. Type safety violations

For each issue found, specify:
- Severity: CRITICAL, HIGH, MEDIUM, or LOW
- Line number (if applicable)
- Issue description
- Recommended fix

File: $FILE
" < "$FILE" 2>&1 || true)

    # Parse the output for severity levels
    # Look for patterns like "CRITICAL:", "HIGH:", etc.

    while IFS= read -r line; do
        if [[ "$line" =~ CRITICAL:|HIGH: ]]; then
            HIGH_CRITICAL_COUNT=$((HIGH_CRITICAL_COUNT + 1))
            ALL_FINDINGS+=("{\"file\": \"$FILE\", \"severity\": \"HIGH_CRITICAL\", \"issue\": \"${line}\"}")
            echo -e "${RED}  [HIGH/CRITICAL] $line${NC}"
        elif [[ "$line" =~ MEDIUM: ]]; then
            MEDIUM_COUNT=$((MEDIUM_COUNT + 1))
            ALL_FINDINGS+=("{\"file\": \"$FILE\", \"severity\": \"MEDIUM\", \"issue\": \"${line}\"}")
            echo -e "${YELLOW}  [MEDIUM] $line${NC}"
        elif [[ "$line" =~ LOW: ]]; then
            LOW_COUNT=$((LOW_COUNT + 1))
            ALL_FINDINGS+=("{\"file\": \"$FILE\", \"severity\": \"LOW\", \"issue\": \"${line}\"}")
            echo -e "  [LOW] $line"
        fi
    done <<< "$REVIEW_OUTPUT"

    echo ""
done

# Output summary
echo -e "${BLUE}======================================${NC}"
echo -e "${BLUE}Codex Review Summary${NC}"
echo -e "${BLUE}======================================${NC}"
echo -e "Files reviewed: $#"
echo -e "${RED}HIGH/CRITICAL issues: $HIGH_CRITICAL_COUNT${NC}"
echo -e "${YELLOW}MEDIUM issues: $MEDIUM_COUNT${NC}"
echo -e "LOW issues: $LOW_COUNT"
echo ""

# Generate JSON output for GitHub Actions
JSON_OUTPUT="{\"summary\": {\"files_reviewed\": $#, \"high_critical\": $HIGH_CRITICAL_COUNT, \"medium\": $MEDIUM_COUNT, \"low\": $LOW_COUNT}, \"findings\": ["

# Add findings to JSON
FIRST=true
for finding in "${ALL_FINDINGS[@]}"; do
    if [ "$FIRST" = true ]; then
        FIRST=false
    else
        JSON_OUTPUT+=","
    fi
    JSON_OUTPUT+="$finding"
done

JSON_OUTPUT+="]}"

# Save to file for GitHub Actions to read
echo "$JSON_OUTPUT" > codex-review-results.json
echo -e "${GREEN}Results saved to: codex-review-results.json${NC}"

# Exit with error if HIGH or CRITICAL issues found
if [ $HIGH_CRITICAL_COUNT -gt 0 ]; then
    echo -e "${RED}FAIL: Found $HIGH_CRITICAL_COUNT HIGH or CRITICAL issues${NC}"
    exit 1
else
    echo -e "${GREEN}PASS: No HIGH or CRITICAL issues found${NC}"
    exit 0
fi
