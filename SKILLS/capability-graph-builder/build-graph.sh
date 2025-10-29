#!/bin/bash
# Build capability graph from manifests using Codex

set -e

# Parse arguments
MANIFEST_DIR="${1:-.}"
OUTPUT_PATH="${2:-META/capability-graph.json}"
VALIDATE="${3:-true}"

echo "Building capability graph..."
echo "  Manifest directory: $MANIFEST_DIR"
echo "  Output path: $OUTPUT_PATH"
echo "  Validation: $VALIDATE"

# Find all manifest.yaml files
echo ""
echo "Scanning for manifests..."
MANIFESTS=$(find "$MANIFEST_DIR" -name 'manifest.yaml' -type f 2>/dev/null | sort)
MANIFEST_COUNT=$(echo "$MANIFESTS" | wc -l | tr -d ' ')

if [ "$MANIFEST_COUNT" -eq 0 ]; then
  echo "❌ No manifests found in $MANIFEST_DIR"
  exit 1
fi

echo "✅ Found $MANIFEST_COUNT manifests"

# Collect all manifests into a single JSON structure
echo ""
echo "Loading manifests..."
MANIFESTS_JSON="[]"

while IFS= read -r manifest_path; do
  if [ -f "$manifest_path" ]; then
    CAPABILITY_NAME=$(basename "$(dirname "$manifest_path")")
    echo "  - $CAPABILITY_NAME"

    # Convert YAML to JSON and add to array
    MANIFEST_JSON=$(python3 -c "
import yaml, json, sys
with open('$manifest_path') as f:
    data = yaml.safe_load(f)
    print(json.dumps(data))
")

    # Append to manifests array
    MANIFESTS_JSON=$(echo "$MANIFESTS_JSON" | python3 -c "
import json, sys
manifests = json.load(sys.stdin)
new_manifest = $MANIFEST_JSON
manifests.append(new_manifest)
print(json.dumps(manifests))
")
  fi
done <<< "$MANIFESTS"

# Use Codex to build the graph
echo ""
echo "Building graph with Codex..."

cd "$(dirname "$0")/../.."

codex exec "
Build a capability graph from these manifests.

MANIFESTS:
$MANIFESTS_JSON

Task: Create a graph structure with nodes, edges, and indexes.

Structure:
{
  \"nodes\": [
    {
      \"id\": \"capability-name\",
      \"kind\": \"skill|mcp|tool|component|integration\",
      \"description\": \"...\",
      \"preconditions\": [...],
      \"effects\": [...],
      \"domains\": [...],
      \"cost\": \"free|low|medium|high\",
      \"latency\": \"instant|fast|slow\",
      \"risk_level\": \"safe|low|medium|high\"
    }
  ],
  \"edges\": [
    {
      \"from\": \"capability-a\",
      \"to\": \"capability-b\",
      \"type\": \"requires|enables|conflicts_with|composes_with\"
    }
  ],
  \"domains\": {
    \"rag\": [\"capability-1\", \"capability-2\"],
    \"auth\": [\"capability-3\"]
  },
  \"effects\": {
    \"creates_vector_index\": [\"capability-1\"],
    \"adds_auth\": [\"capability-2\", \"capability-3\"]
  }
}

Instructions:
1. Create a node for each manifest
2. Extract edges from compatibility fields (requires, enables, conflicts_with, composes_with)
3. Build domain index (domain -> list of capabilities)
4. Build effect index (effect -> list of capabilities)
5. Infer missing relationships from descriptions and effects
6. Validate bidirectional consistency (if A enables B, B should require A)

Output ONLY valid JSON. No markdown, no explanatory text.
" > /tmp/capability-graph-raw.json

# Validate generated JSON
echo "Validating graph..."
if python3 -c "import json; json.load(open('/tmp/capability-graph-raw.json'))" 2>/dev/null; then

  # Add metadata
  NODE_COUNT=$(python3 -c "import json; g = json.load(open('/tmp/capability-graph-raw.json')); print(len(g['nodes']))")
  EDGE_COUNT=$(python3 -c "import json; g = json.load(open('/tmp/capability-graph-raw.json')); print(len(g['edges']))")

  python3 -c "
import json
from datetime import datetime

with open('/tmp/capability-graph-raw.json') as f:
    graph = json.load(f)

output = {
    'version': '1.0.0',
    'generated_at': datetime.utcnow().isoformat() + 'Z',
    'node_count': len(graph['nodes']),
    'edge_count': len(graph['edges']),
    'graph': graph
}

with open('$OUTPUT_PATH', 'w') as f:
    json.dump(output, f, indent=2)
"

  echo ""
  echo "✅ Capability graph generated:"
  echo "   - Nodes: $NODE_COUNT"
  echo "   - Edges: $EDGE_COUNT"
  echo "   - Output: $OUTPUT_PATH"

  # Cleanup
  rm /tmp/capability-graph-raw.json

  exit 0
else
  echo "❌ Generated graph JSON is invalid"
  cat /tmp/capability-graph-raw.json
  exit 1
fi
