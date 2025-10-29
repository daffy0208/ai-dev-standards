#!/usr/bin/env bash

# create-request.sh - Create orchestration requests for Claude Code to execute
# Usage: ./create-request.sh <type> <goal> [options]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
REQUESTS_DIR="$PROJECT_ROOT/orchestration-requests"
PENDING_DIR="$REQUESTS_DIR/pending"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to show usage
usage() {
  cat <<EOF
Usage: $(basename "$0") <type> <goal> [options]

Create orchestration requests for Claude Code to execute.

TYPES:
  plan                  - Create execution plan for a goal
  validate              - Validate a skill implementation
  diagnose              - Run project diagnostics
  generate_manifest     - Generate capability manifest
  build_capability_graph - Build capability graph
  analyze_project       - Analyze project state

OPTIONS:
  --skill-path PATH     - Path to skill (for validate/generate_manifest)
  --project-path PATH   - Path to project (default: current dir)
  --priority LEVEL      - Priority: low|medium|high|urgent (default: medium)
  --user NAME          - User name (default: current user)
  --help               - Show this help message

EXAMPLES:
  # Create execution plan
  $(basename "$0") plan "Build RAG system for documentation search"

  # Validate a skill
  $(basename "$0") validate "Check mvp-builder implementation" --skill-path SKILLS/mvp-builder

  # Run diagnostics
  $(basename "$0") diagnose "Check project health"

EOF
  exit 1
}

# Parse arguments
if [ $# -lt 2 ]; then
  usage
fi

TYPE="$1"
GOAL="$2"
shift 2

# Validate type
case "$TYPE" in
  plan|validate|diagnose|generate_manifest|build_capability_graph|analyze_project)
    ;;
  *)
    echo "Error: Invalid type '$TYPE'"
    usage
    ;;
esac

# Default options
SKILL_PATH=""
PROJECT_PATH="$PWD"
PRIORITY="medium"
USER="${USER:-$(whoami)}"

# Parse optional arguments
while [[ $# -gt 0 ]]; do
  case "$1" in
    --skill-path)
      SKILL_PATH="$2"
      shift 2
      ;;
    --project-path)
      PROJECT_PATH="$2"
      shift 2
      ;;
    --priority)
      PRIORITY="$2"
      shift 2
      ;;
    --user)
      USER="$2"
      shift 2
      ;;
    --help)
      usage
      ;;
    *)
      echo "Error: Unknown option '$1'"
      usage
      ;;
  esac
done

# Ensure requests directory exists
mkdir -p "$PENDING_DIR"

# Generate unique request ID (timestamp in milliseconds)
REQUEST_ID=$(date +%s%3N)
REQUEST_FILE="$PENDING_DIR/${REQUEST_ID}.json"

# Get skill registry data
SKILL_REGISTRY="$PROJECT_ROOT/META/skill-registry.json"
AVAILABLE_SKILLS=()
if [ -f "$SKILL_REGISTRY" ]; then
  AVAILABLE_SKILLS=($(jq -r '.skills[].name' "$SKILL_REGISTRY" 2>/dev/null || echo "[]"))
fi

# Build context object
CONTEXT_JSON="{
  \"project_path\": \"$PROJECT_PATH\""

# Add skill_path if provided
if [ -n "$SKILL_PATH" ]; then
  CONTEXT_JSON="$CONTEXT_JSON,
  \"skill_path\": \"$SKILL_PATH\""
fi

# Add available skills
if [ ${#AVAILABLE_SKILLS[@]} -gt 0 ]; then
  SKILLS_ARRAY=$(printf ',"%s"' "${AVAILABLE_SKILLS[@]}")
  SKILLS_ARRAY="[${SKILLS_ARRAY:1}]"
  CONTEXT_JSON="$CONTEXT_JSON,
  \"available_skills\": $SKILLS_ARRAY"
fi

# Add capability graph path if exists
CAPABILITY_GRAPH="$PROJECT_ROOT/META/capability-graph.json"
if [ -f "$CAPABILITY_GRAPH" ]; then
  CONTEXT_JSON="$CONTEXT_JSON,
  \"capability_graph_path\": \"$CAPABILITY_GRAPH\""
fi

CONTEXT_JSON="$CONTEXT_JSON
}"

# Create request JSON
cat > "$REQUEST_FILE" <<EOF
{
  "id": "$REQUEST_ID",
  "type": "$TYPE",
  "goal": "$GOAL",
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "status": "pending",
  "context": $CONTEXT_JSON,
  "metadata": {
    "created_by": "$(basename "$0")",
    "user": "$USER",
    "priority": "$PRIORITY",
    "tags": []
  }
}
EOF

# Print success message
echo -e "${GREEN}✓${NC} Created orchestration request: ${BLUE}$REQUEST_ID${NC}"
echo -e "  Type: ${YELLOW}$TYPE${NC}"
echo -e "  Goal: $GOAL"
echo -e "  File: $REQUEST_FILE"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo -e "  1. Ask Claude Code to: ${BLUE}\"Execute orchestration request $REQUEST_ID\"${NC}"
echo -e "  2. Claude Code will read the request, execute it, and write results"
echo -e "  3. Check results in: ${BLUE}orchestration-results/${REQUEST_ID}.json${NC}"
echo ""

exit 0
