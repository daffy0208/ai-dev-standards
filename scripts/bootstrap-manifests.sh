#!/bin/bash
# Bootstrap capability manifests for all resources

set -e

echo "╔═══════════════════════════════════════════════════╗"
echo "║                                                   ║"
echo "║     Capability Manifest Bootstrap                ║"
echo "║                                                   ║"
echo "║  Generating manifests for all 109 resources...   ║"
echo "║                                                   ║"
echo "╚═══════════════════════════════════════════════════╝"
echo ""

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_ROOT"

# Counters
TOTAL=0
SUCCESS=0
FAILED=0
SKIPPED=0

# Log file
LOG_FILE="/tmp/manifest-bootstrap.log"
ERROR_LOG="/tmp/manifest-bootstrap-errors.log"
> "$LOG_FILE"
> "$ERROR_LOG"

echo "Starting bootstrap process..."
echo "Logs: $LOG_FILE"
echo ""

# Function to generate manifest for a resource
generate_manifest() {
  local resource_path="$1"
  local resource_type="$2"
  local resource_name=$(basename "$resource_path")

  # Skip if manifest already exists
  if [ -f "$resource_path/manifest.yaml" ]; then
    echo "  ⏭️  $resource_name (manifest exists)"
    ((SKIPPED++))
    return 0
  fi

  echo "  🔨 $resource_name"
  ((TOTAL++))

  # Generate manifest
  if bash SKILLS/manifest-generator/generate-manifest.sh \
      --path "$resource_path" \
      --type "$resource_type" \
      --output "$resource_path/manifest.yaml" \
      >> "$LOG_FILE" 2>> "$ERROR_LOG"; then
    ((SUCCESS++))
    echo "     ✅ Generated"
  else
    ((FAILED++))
    echo "     ❌ Failed (see error log)"
    echo "FAILED: $resource_name" >> "$ERROR_LOG"
  fi
}

# Generate manifests for SKILLS
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "SKILLS (41 expected)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -d "SKILLS" ]; then
  for skill_dir in SKILLS/*/; do
    if [ -d "$skill_dir" ] && [ -f "$skill_dir/SKILL.md" ]; then
      generate_manifest "$skill_dir" "skill"
    fi
  done
else
  echo "❌ SKILLS directory not found"
fi

echo ""

# Generate manifests for MCP-SERVERS
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "MCP SERVERS (50 expected)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -d "MCP-SERVERS" ]; then
  for mcp_dir in MCP-SERVERS/*/; do
    if [ -d "$mcp_dir" ] && [ -f "$mcp_dir/README.md" ]; then
      generate_manifest "$mcp_dir" "mcp"
    fi
  done
else
  echo "❌ MCP-SERVERS directory not found"
fi

echo ""

# Generate manifests for TOOLS
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TOOLS (9 expected)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -d "TOOLS" ]; then
  for tool_dir in TOOLS/*/; do
    if [ -d "$tool_dir" ] && [ -f "$tool_dir/README.md" ]; then
      generate_manifest "$tool_dir" "tool"
    fi
  done
else
  echo "⚠️  TOOLS directory not found"
fi

echo ""

# Generate manifests for COMPONENTS
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "COMPONENTS (13 expected)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -d "COMPONENTS" ]; then
  for comp_dir in COMPONENTS/*/; do
    if [ -d "$comp_dir" ] && [ -f "$comp_dir/README.md" ]; then
      generate_manifest "$comp_dir" "component"
    fi
  done
else
  echo "⚠️  COMPONENTS directory not found"
fi

echo ""

# Generate manifests for INTEGRATIONS
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "INTEGRATIONS (6 expected)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -d "INTEGRATIONS" ]; then
  for int_dir in INTEGRATIONS/*/; do
    if [ -d "$int_dir" ] && [ -f "$int_dir/README.md" ]; then
      generate_manifest "$int_dir" "integration"
    fi
  done
else
  echo "⚠️  INTEGRATIONS directory not found"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  Total Processed: $TOTAL"
echo "  ✅ Success:      $SUCCESS"
echo "  ❌ Failed:       $FAILED"
echo "  ⏭️  Skipped:      $SKIPPED"
echo ""

if [ $FAILED -gt 0 ]; then
  echo "⚠️  Some manifests failed to generate."
  echo "   Check error log: $ERROR_LOG"
  echo ""
fi

# Count total manifests
MANIFEST_COUNT=$(find SKILLS MCP-SERVERS TOOLS COMPONENTS INTEGRATIONS -name 'manifest.yaml' 2>/dev/null | wc -l | tr -d ' ')

echo "Total manifests now: $MANIFEST_COUNT"
echo ""

if [ $FAILED -eq 0 ]; then
  echo "✅ Bootstrap complete! Ready to build capability graph."
  echo ""
  echo "Next steps:"
  echo "  1. Build capability graph:"
  echo "     bash SKILLS/capability-graph-builder/build-graph.sh"
  echo ""
  echo "  2. Test orchestration planner:"
  echo "     bash SKILLS/orchestration-planner/plan-workflow.sh 'implement RAG system'"
  echo ""
  echo "  3. Validate skills:"
  echo "     bash SKILLS/skill-validator/validate.sh SKILLS/rag-implementer"
  echo ""
  echo "  4. Run diagnostics:"
  echo "     bash SKILLS/system-diagnostician/diagnose.sh ."
  echo ""
  exit 0
else
  echo "❌ Bootstrap completed with errors."
  exit 1
fi
