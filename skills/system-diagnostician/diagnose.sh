#!/bin/bash
# Diagnose project health and recommend capabilities

set -e

# Parse arguments
PROJECT_PATH="${1:-.}"
GRAPH_PATH="${2:-META/capability-graph.json}"

echo "Diagnosing project: $PROJECT_PATH"
echo ""

# Navigate to project
cd "$PROJECT_PATH"

# Step 1: Project discovery
echo "[1/5] Discovering project structure..."

# Detect project type
PROJECT_TYPE="unknown"
FRAMEWORK="unknown"

if [ -f "package.json" ]; then
  PROJECT_TYPE="nodejs"

  # Detect framework
  if grep -q "\"next\"" package.json 2>/dev/null; then
    FRAMEWORK="nextjs"
  elif grep -q "\"react\"" package.json 2>/dev/null; then
    FRAMEWORK="react"
  elif grep -q "\"express\"" package.json 2>/dev/null; then
    FRAMEWORK="express"
  fi
elif [ -f "requirements.txt" ] || [ -f "pyproject.toml" ]; then
  PROJECT_TYPE="python"
fi

# Gather statistics
FILE_COUNT=$(find . -type f -not -path "./node_modules/*" -not -path "./.git/*" 2>/dev/null | wc -l | tr -d ' ')
CODE_FILES=$(find . \( -name "*.js" -o -name "*.ts" -o -name "*.jsx" -o -name "*.tsx" -o -name "*.py" \) -not -path "./node_modules/*" 2>/dev/null | wc -l | tr -d ' ')
TEST_FILES=$(find . \( -name "*.test.*" -o -name "*.spec.*" \) -not -path "./node_modules/*" 2>/dev/null | wc -l | tr -d ' ')

# Check features
HAS_TESTS=$([ -d "tests" ] || [ -d "test" ] || [ -d "__tests__" ] && echo "true" || echo "false")
HAS_DOCS=$([ -f "README.md" ] && echo "true" || echo "false")
HAS_CI=$([ -d ".github/workflows" ] || [ -f ".gitlab-ci.yml" ] && echo "true" || echo "false")

# Package.json analysis
DEPENDENCIES=0
DEV_DEPENDENCIES=0
SCRIPTS=0
if [ -f "package.json" ]; then
  DEPENDENCIES=$(jq -r '.dependencies // {} | keys | length' package.json 2>/dev/null || echo 0)
  DEV_DEPENDENCIES=$(jq -r '.devDependencies // {} | keys | length' package.json 2>/dev/null || echo 0)
  SCRIPTS=$(jq -r '.scripts // {} | keys | length' package.json 2>/dev/null || echo 0)
fi

# Generate project state
cat > /tmp/project-state.json <<EOF
{
  "project_type": "$PROJECT_TYPE",
  "framework": "$FRAMEWORK",
  "statistics": {
    "total_files": $FILE_COUNT,
    "code_files": $CODE_FILES,
    "test_files": $TEST_FILES
  },
  "has_tests": $HAS_TESTS,
  "has_docs": $HAS_DOCS,
  "has_ci": $HAS_CI,
  "dependencies": $DEPENDENCIES,
  "dev_dependencies": $DEV_DEPENDENCIES,
  "scripts": $SCRIPTS
}
EOF

echo "   Project type: $PROJECT_TYPE ($FRAMEWORK)"
echo "   Files: $FILE_COUNT total, $CODE_FILES code, $TEST_FILES test"

# Step 2: Health assessment
echo "[2/5] Assessing project health..."

cd - > /dev/null
PROJECT_STATE=$(cat /tmp/project-state.json)
FILE_STRUCTURE=$(find "$PROJECT_PATH" -type f -not -path "*/node_modules/*" -not -path "*/.git/*" 2>/dev/null | head -50)
PACKAGE_JSON=$(cat "$PROJECT_PATH/package.json" 2>/dev/null || echo "{}")

codex exec "
Analyze this project's health and identify issues:

PROJECT STATE:
$PROJECT_STATE

FILE STRUCTURE (sample):
$FILE_STRUCTURE

PACKAGE.JSON:
$PACKAGE_JSON

Perform health assessment across these dimensions:
1. Testing: Coverage, quality, types
2. Documentation: README, API docs, comments
3. Security: Vulnerabilities, auth, validation
4. Performance: Optimization opportunities
5. Code Quality: Linting, typing, complexity
6. Architecture: Structure, patterns
7. Dependencies: Updates, security, bloat
8. CI/CD: Automation, deployment

For each dimension:
- score: 0.0-1.0
- status: excellent|good|needs_improvement|critical
- issues: array of problems
- recommendations: array of actions

Output JSON:
{
  \"overall_health\": 0.75,
  \"dimensions\": {
    \"testing\": {
      \"score\": 0.60,
      \"status\": \"needs_improvement\",
      \"issues\": [\"Low test coverage\"],
      \"recommendations\": [\"Add unit tests\"]
    }
  }
}

Output ONLY valid JSON.
" > /tmp/health-assessment.json

OVERALL_HEALTH=$(python3 -c "import json; h = json.load(open('/tmp/health-assessment.json')); print(h.get('overall_health', 0))")
echo "   Overall health: $OVERALL_HEALTH"

# Step 3: Capability gap analysis
echo "[3/5] Identifying capability gaps..."

HEALTH_ASSESSMENT=$(cat /tmp/health-assessment.json)
CAPABILITY_GRAPH=""
if [ -f "$GRAPH_PATH" ]; then
  CAPABILITY_GRAPH=$(cat "$GRAPH_PATH")
else
  echo "   ⚠️  Capability graph not found, using limited analysis"
  CAPABILITY_GRAPH="{}"
fi

codex exec "
Based on health assessment, identify missing capabilities:

HEALTH ASSESSMENT:
$HEALTH_ASSESSMENT

AVAILABLE CAPABILITIES:
$CAPABILITY_GRAPH

For each issue, suggest capabilities that would address it.

Output JSON:
{
  \"gaps\": [
    {
      \"issue\": \"description\",
      \"severity\": \"high|medium|low\",
      \"dimension\": \"testing\",
      \"suggested_capabilities\": [\"capability-name\"],
      \"impact\": \"high|medium|low\",
      \"effort\": \"low|medium|high\"
    }
  ]
}

Output ONLY valid JSON.
" > /tmp/capability-gaps.json

GAP_COUNT=$(python3 -c "import json; g = json.load(open('/tmp/capability-gaps.json')); print(len(g.get('gaps', [])))")
echo "   Found $GAP_COUNT capability gaps"

# Step 4: Prioritize recommendations
echo "[4/5] Prioritizing recommendations..."

python3 <<'PYTHON_SCRIPT'
import json

# Load data
with open('/tmp/capability-gaps.json') as f:
    gaps = json.load(f)

# Score recommendations
impact_scores = {'critical': 1.0, 'high': 0.8, 'medium': 0.5, 'low': 0.3}
effort_scores = {'low': 1.0, 'medium': 0.6, 'high': 0.3}

for gap in gaps['gaps']:
    impact = impact_scores.get(gap.get('impact', 'medium'), 0.5)
    effort = effort_scores.get(gap.get('effort', 'medium'), 0.6)
    gap['priority_score'] = round(impact * effort, 3)

# Sort by priority
gaps['gaps'].sort(key=lambda x: x['priority_score'], reverse=True)

with open('/tmp/recommendations.json', 'w') as f:
    json.dump(gaps, f, indent=2)
PYTHON_SCRIPT

# Step 5: Generate report
echo "[5/5] Generating diagnostic report..."

python3 <<PYTHON_SCRIPT
import json
from datetime import datetime

# Load all data
with open('/tmp/health-assessment.json') as f:
    health = json.load(f)

with open('/tmp/recommendations.json') as f:
    recommendations = json.load(f)

with open('/tmp/project-state.json') as f:
    project_state = json.load(f)

# Generate action plan
action_plan = {
    'project': '${PROJECT_PATH##*/}',
    'analyzed_at': datetime.utcnow().isoformat() + 'Z',
    'project_state': project_state,
    'overall_health': health.get('overall_health', 0),
    'health_assessment': health,
    'recommendations': recommendations['gaps'][:10],
    'quick_wins': [
        r for r in recommendations['gaps']
        if r.get('effort') == 'low' and r.get('impact') in ['high', 'critical']
    ][:3],
    'critical_issues': [
        r for r in recommendations['gaps']
        if r.get('severity') in ['high', 'critical']
    ]
}

with open('/tmp/diagnostic-report.json', 'w') as f:
    json.dump(action_plan, f, indent=2)

# Print summary
print("")
print("━" * 60)
print("DIAGNOSTIC REPORT")
print("━" * 60)
print(f"\nProject: {action_plan['project']}")
print(f"Overall Health: {action_plan['overall_health']:.2f}")

# Health by dimension
print("\nHealth by Dimension:")
for dim, data in health.get('dimensions', {}).items():
    score = data.get('score', 0)
    status = data.get('status', 'unknown')
    icon = "✅" if score >= 0.8 else "⚠️" if score >= 0.6 else "❌"
    print(f"  {icon} {dim:20s} {score:.2f} ({status})")

# Quick wins
if action_plan['quick_wins']:
    print(f"\n🚀 Quick Wins ({len(action_plan['quick_wins'])}):")
    for i, win in enumerate(action_plan['quick_wins'], 1):
        print(f"  {i}. {win['issue']}")
        print(f"     → {', '.join(win['suggested_capabilities'])}")

# Critical issues
if action_plan['critical_issues']:
    print(f"\n❌ Critical Issues ({len(action_plan['critical_issues'])}):")
    for i, issue in enumerate(action_plan['critical_issues'], 1):
        print(f"  {i}. {issue['issue']}")
        print(f"     → {', '.join(issue['suggested_capabilities'])}")

# Top recommendations
print(f"\n📋 Top Recommendations:")
for i, rec in enumerate(action_plan['recommendations'][:5], 1):
    priority = rec.get('priority_score', 0)
    print(f"  {i}. [{rec['severity'].upper()}] {rec['issue']}")
    print(f"     Impact: {rec['impact']} | Effort: {rec['effort']} | Priority: {priority}")
    print(f"     → {', '.join(rec['suggested_capabilities'])}")

print("\n" + "━" * 60)
print(f"Full report: /tmp/diagnostic-report.json")
print("━" * 60)
print("")
PYTHON_SCRIPT

# Cleanup
rm -f /tmp/project-state.json /tmp/health-assessment.json /tmp/capability-gaps.json /tmp/recommendations.json
