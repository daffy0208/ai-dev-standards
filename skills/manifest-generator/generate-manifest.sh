#!/bin/bash
# Generate capability manifest using Codex

set -e

# Parse arguments
RESOURCE_PATH=""
RESOURCE_TYPE="skill"
OUTPUT_PATH=""

while [[ $# -gt 0 ]]; do
  case $1 in
    --path) RESOURCE_PATH="$2"; shift 2 ;;
    --type) RESOURCE_TYPE="$2"; shift 2 ;;
    --output) OUTPUT_PATH="$2"; shift 2 ;;
    *) echo "Unknown option: $1"; exit 1 ;;
  esac
done

if [ -z "$RESOURCE_PATH" ]; then
  echo "Error: --path is required"
  exit 1
fi

# Set default output path
if [ -z "$OUTPUT_PATH" ]; then
  OUTPUT_PATH="$RESOURCE_PATH/manifest.yaml"
fi

# Determine description file
if [ "$RESOURCE_TYPE" = "skill" ]; then
  DESC_FILE="$RESOURCE_PATH/SKILL.md"
elif [ "$RESOURCE_TYPE" = "mcp" ]; then
  DESC_FILE="$RESOURCE_PATH/README.md"
else
  DESC_FILE="$RESOURCE_PATH/README.md"
fi

if [ ! -f "$DESC_FILE" ]; then
  echo "Error: Description file not found: $DESC_FILE"
  exit 1
fi

# Read description
DESCRIPTION=$(cat "$DESC_FILE")
RESOURCE_NAME=$(basename "$RESOURCE_PATH")

# Check for implementation file
IMPLEMENTATION=""
if [ -f "$RESOURCE_PATH/index.js" ]; then
  IMPLEMENTATION=$(head -100 "$RESOURCE_PATH/index.js")
elif [ -f "$RESOURCE_PATH/index.ts" ]; then
  IMPLEMENTATION=$(head -100 "$RESOURCE_PATH/index.ts")
fi

# Read schema
SCHEMA=$(cat "$(dirname "$0")/../../SCHEMAS/capability-manifest.schema.json")

echo "Generating manifest for $RESOURCE_NAME..."

# Generate manifest with Codex
cd "$(dirname "$0")/../.."
codex exec "
Analyze this ${RESOURCE_TYPE} and generate a capability manifest YAML.

RESOURCE NAME: ${RESOURCE_NAME}
RESOURCE TYPE: ${RESOURCE_TYPE}

DESCRIPTION:
${DESCRIPTION}

${IMPLEMENTATION:+IMPLEMENTATION (first 100 lines):}
${IMPLEMENTATION}

SCHEMA REFERENCE:
${SCHEMA}

Task: Generate a complete capability manifest in YAML format that matches the schema.

Instructions:
1. PRECONDITIONS: Analyze description to infer what files, dependencies, or state must exist
   - Use predicates like: file_exists('path'), has_dependency('pkg'), env_var_set('VAR')
   - Mark whether each is required or optional

2. EFFECTS: Extract what this creates/modifies/deletes
   - Use imperative verbs: creates_, adds_, configures_, updates_, removes_
   - Be specific and actionable

3. DOMAINS: Categorize into technical domains
   - Examples: rag, auth, api, database, testing, nextjs, react, security

4. COST/LATENCY/RISK: Assess resource requirements
   - cost: free/low/medium/high (API usage, compute)
   - latency: instant/fast/slow (execution time)
   - risk_level: safe/low/medium/high (side effect severity)

5. SUCCESS_SIGNAL: Define how to verify it worked
   - Be specific and testable

6. COMPATIBILITY: Infer relationships
   - requires: What must exist first?
   - conflicts_with: What can't coexist?
   - composes_with: What works well together?
   - enables: What does this unlock?

Output ONLY valid YAML matching the schema. No markdown fences, no explanatory text.
Start with 'name:' as the first line.
" > /tmp/manifest-$RESOURCE_NAME.yaml

# Validate the generated YAML
if [ -f /tmp/manifest-$RESOURCE_NAME.yaml ]; then
  # Basic YAML syntax check
  if python3 -c "import yaml; yaml.safe_load(open('/tmp/manifest-$RESOURCE_NAME.yaml'))" 2>/dev/null; then
    cp /tmp/manifest-$RESOURCE_NAME.yaml "$OUTPUT_PATH"
    echo "✅ Manifest generated: $OUTPUT_PATH"
    rm /tmp/manifest-$RESOURCE_NAME.yaml
    exit 0
  else
    echo "❌ Generated YAML is invalid"
    cat /tmp/manifest-$RESOURCE_NAME.yaml
    exit 1
  fi
else
  echo "❌ Failed to generate manifest"
  exit 1
fi
