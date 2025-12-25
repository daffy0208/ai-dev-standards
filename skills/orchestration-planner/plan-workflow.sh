#!/bin/bash
# Plan workflow using capability graph and Codex

set -e

# Parse named arguments
GOAL=""
PROJECT_STATE="project-state.json"
GRAPH_PATH="META/capability-graph.json"
COST_WEIGHT="0.3"
RISK_WEIGHT="0.3"
OUTPUT_PATH=""

while [[ $# -gt 0 ]]; do
  case $1 in
    --goal)
      GOAL="$2"
      shift 2
      ;;
    --project)
      PROJECT_STATE="$2"
      shift 2
      ;;
    --graph)
      GRAPH_PATH="$2"
      shift 2
      ;;
    --cost-weight)
      COST_WEIGHT="$2"
      shift 2
      ;;
    --risk-weight)
      RISK_WEIGHT="$2"
      shift 2
      ;;
    --output)
      OUTPUT_PATH="$2"
      shift 2
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

if [ -z "$GOAL" ]; then
  echo "Usage: $0 --goal '<goal>' [--project project-state.json] [--graph capability-graph.json]"
  echo "Example: $0 --goal 'implement RAG system' --graph META/capability-graph.json"
  exit 1
fi

if [ ! -f "$GRAPH_PATH" ]; then
  echo "❌ Capability graph not found: $GRAPH_PATH"
  echo "Run: bash SKILLS/capability-graph-builder/build-graph.sh"
  exit 1
fi

echo "Planning workflow for goal: $GOAL"
echo ""

# Step 1: Analyze goal with Codex
echo "[1/5] Analyzing goal..."
cd "$(dirname "$0")/../.."

codex exec "
Analyze this goal and determine what effects are needed:

GOAL: $GOAL

Examples of effects:
- creates_vector_index
- adds_auth_middleware
- configures_database
- implements_api_endpoint
- adds_tests
- creates_react_component
- sets_up_ci_cd

Task: Extract the effects needed to achieve this goal.

Output JSON:
{
  \"goal\": \"$GOAL\",
  \"required_effects\": [\"effect1\", \"effect2\"],
  \"optional_effects\": [\"effect3\"],
  \"domains\": [\"domain1\", \"domain2\"],
  \"reasoning\": \"explanation of why these effects are needed\"
}

Output ONLY valid JSON. No markdown, no explanatory text.
" > /tmp/goal-analysis.json

if ! python3 -c "import json; json.load(open('/tmp/goal-analysis.json'))" 2>/dev/null; then
  echo "❌ Goal analysis failed"
  cat /tmp/goal-analysis.json
  exit 1
fi

REQUIRED_EFFECTS=$(python3 -c "import json; g = json.load(open('/tmp/goal-analysis.json')); print(', '.join(g['required_effects']))")
echo "   Required effects: $REQUIRED_EFFECTS"

# Step 2: Find candidate capabilities
echo "[2/5] Finding candidate capabilities..."

python3 <<'PYTHON_SCRIPT'
import json
import sys

# Load goal analysis
with open('/tmp/goal-analysis.json') as f:
    goal_analysis = json.load(f)

# Load capability graph
try:
    with open('META/capability-graph.json') as f:
        graph_data = json.load(f)
        graph = graph_data['graph']
except FileNotFoundError:
    print("Error: capability-graph.json not found", file=sys.stderr)
    sys.exit(1)

# Find capabilities by effect
candidates = []
seen_capabilities = set()

for effect in goal_analysis['required_effects']:
    if effect in graph['effects']:
        for capability in graph['effects'][effect]:
            if capability not in seen_capabilities:
                # Get full capability data
                node = next((n for n in graph['nodes'] if n['id'] == capability), None)
                if node:
                    candidates.append({
                        'capability': capability,
                        'effects': [effect],
                        'required': True,
                        'node': node
                    })
                    seen_capabilities.add(capability)
            else:
                # Add effect to existing candidate
                for cand in candidates:
                    if cand['capability'] == capability:
                        cand['effects'].append(effect)

# Find optional capabilities
for effect in goal_analysis.get('optional_effects', []):
    if effect in graph['effects']:
        for capability in graph['effects'][effect]:
            if capability not in seen_capabilities:
                node = next((n for n in graph['nodes'] if n['id'] == capability), None)
                if node:
                    candidates.append({
                        'capability': capability,
                        'effects': [effect],
                        'required': False,
                        'node': node
                    })
                    seen_capabilities.add(capability)

# Write candidates
with open('/tmp/candidates.json', 'w') as f:
    json.dump(candidates, f, indent=2)

print(f"   Found {len(candidates)} candidate capabilities")
PYTHON_SCRIPT

# Step 3: Build HTN plan with Codex
echo "[3/5] Building HTN plan..."

CANDIDATES=$(cat /tmp/candidates.json)
GRAPH=$(cat "$GRAPH_PATH")

codex exec "
Build a hierarchical task network (HTN) plan to achieve this goal.

GOAL:
$(cat /tmp/goal-analysis.json)

AVAILABLE CAPABILITIES:
$CANDIDATES

CAPABILITY GRAPH:
$GRAPH

Task: Create an HTN plan with ordered steps, alternatives, and dependencies.

HTN Structure:
{
  \"goal\": \"original goal\",
  \"plan\": [
    {
      \"step\": 1,
      \"capability\": \"capability-name\",
      \"effects\": [\"effect1\", \"effect2\"],
      \"required\": true,
      \"alternatives\": [\"alt-capability-1\", \"alt-capability-2\"],
      \"dependencies\": [],
      \"reasoning\": \"why this capability\"
    }
  ],
  \"total_cost\": \"low|medium|high\",
  \"total_latency\": \"instant|fast|slow\",
  \"max_risk\": \"safe|low|medium|high\",
  \"parallel_steps\": [[1, 2]]
}

Instructions:
1. Order capabilities by dependencies (check graph edges)
2. For each capability, list alternatives with similar effects
3. Identify which steps can run in parallel
4. Calculate aggregate cost/latency/risk
5. Explain reasoning for each choice

Output ONLY valid JSON. No markdown, no explanatory text.
" > /tmp/htn-plan.json

if ! python3 -c "import json; json.load(open('/tmp/htn-plan.json'))" 2>/dev/null; then
  echo "❌ HTN planning failed"
  cat /tmp/htn-plan.json
  exit 1
fi

STEP_COUNT=$(python3 -c "import json; p = json.load(open('/tmp/htn-plan.json')); print(len(p['plan']))")
echo "   Generated plan with $STEP_COUNT steps"

# Step 4: Score plan
echo "[4/5] Scoring plan..."

python3 <<'PYTHON_SCRIPT'
import json

with open('/tmp/htn-plan.json') as f:
    plan = json.load(f)

# Scoring weights
COST_WEIGHT = 0.3
LATENCY_WEIGHT = 0.2
RISK_WEIGHT = 0.3
DIVERSITY_WEIGHT = 0.2

# Map qualitative values to scores
cost_scores = {'free': 1.0, 'low': 0.8, 'medium': 0.5, 'high': 0.2}
latency_scores = {'instant': 1.0, 'fast': 0.7, 'slow': 0.3}
risk_scores = {'safe': 1.0, 'low': 0.8, 'medium': 0.5, 'high': 0.2, 'critical': 0.0}

# Calculate scores
cost_score = cost_scores.get(plan.get('total_cost', 'medium'), 0.5)
latency_score = latency_scores.get(plan.get('total_latency', 'fast'), 0.5)
risk_score = risk_scores.get(plan.get('max_risk', 'low'), 0.5)

# Diversity score (unique capabilities)
capabilities = [step['capability'] for step in plan['plan']]
diversity_score = min(len(set(capabilities)) / len(capabilities), 1.0) if capabilities else 0

# Total utility
utility = (
    cost_score * COST_WEIGHT +
    latency_score * LATENCY_WEIGHT +
    risk_score * RISK_WEIGHT +
    diversity_score * DIVERSITY_WEIGHT
)

plan['scores'] = {
    'utility': round(utility, 3),
    'cost_score': round(cost_score, 3),
    'latency_score': round(latency_score, 3),
    'risk_score': round(risk_score, 3),
    'diversity_score': round(diversity_score, 3)
}

# Write scored plan
with open('/tmp/plan-scored.json', 'w') as f:
    json.dump(plan, f, indent=2)

print(f"   Utility score: {utility:.2f}")
PYTHON_SCRIPT

# Step 5: Display plan
echo "[5/5] Plan complete!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "WORKFLOW PLAN"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
python3 <<'PYTHON_SCRIPT'
import json

with open('/tmp/plan-scored.json') as f:
    plan = json.load(f)

print(f"\nGoal: {plan['goal']}")
print(f"\nSteps: {len(plan['plan'])}")
print(f"Cost: {plan.get('total_cost', 'unknown')}")
print(f"Latency: {plan.get('total_latency', 'unknown')}")
print(f"Risk: {plan.get('max_risk', 'unknown')}")
print(f"Utility Score: {plan['scores']['utility']}")

print("\n" + "─" * 40)

for step in plan['plan']:
    print(f"\nStep {step['step']}: {step['capability']}")
    print(f"  Effects: {', '.join(step['effects'])}")
    if step.get('alternatives'):
        print(f"  Alternatives: {', '.join(step['alternatives'])}")
    if step.get('dependencies'):
        print(f"  Depends on: steps {', '.join(map(str, step['dependencies']))}")
    print(f"  Reasoning: {step['reasoning']}")

if plan.get('parallel_steps'):
    print("\nParallel execution possible:")
    for group in plan['parallel_steps']:
        print(f"  - Steps {', '.join(map(str, group))} can run concurrently")

print("\n" + "━" * 40)
PYTHON_SCRIPT

echo ""
echo "✅ Plan saved to: /tmp/plan-scored.json"
echo ""
echo "Next steps:"
echo "  - Review plan: cat /tmp/plan-scored.json | jq"
echo "  - Execute plan: (integration with brain commands TBD)"
