#!/bin/bash
# Validate skill/MCP implementation matches manifest

set -e

# Parse arguments
RESOURCE_PATH="$1"
STRICT_MODE="${2:-false}"

if [ -z "$RESOURCE_PATH" ]; then
  echo "Usage: $0 <resource-path> [strict]"
  echo "Example: $0 SKILLS/rag-implementer"
  exit 1
fi

RESOURCE_NAME=$(basename "$RESOURCE_PATH")
MANIFEST_PATH="$RESOURCE_PATH/manifest.yaml"

echo "Validating: $RESOURCE_NAME"
echo ""

# Check if manifest exists
if [ ! -f "$MANIFEST_PATH" ]; then
  echo "❌ No manifest found at: $MANIFEST_PATH"
  echo "Run: bash SKILLS/manifest-generator/generate-manifest.sh --path $RESOURCE_PATH"
  exit 1
fi

# Find implementation file
IMPL_PATH=""
if [ -f "$RESOURCE_PATH/index.js" ]; then
  IMPL_PATH="$RESOURCE_PATH/index.js"
elif [ -f "$RESOURCE_PATH/index.ts" ]; then
  IMPL_PATH="$RESOURCE_PATH/index.ts"
elif [ -f "$RESOURCE_PATH/SKILL.md" ]; then
  IMPL_PATH="$RESOURCE_PATH/SKILL.md"
elif [ -f "$RESOURCE_PATH/README.md" ]; then
  IMPL_PATH="$RESOURCE_PATH/README.md"
fi

if [ -z "$IMPL_PATH" ]; then
  echo "⚠️  No implementation file found, validating description only"
else
  echo "Implementation: $IMPL_PATH"
fi

echo ""
cd "$(dirname "$0")/../.."

# Step 1: Validate description
echo "[1/4] Validating description accuracy..."
MANIFEST=$(cat "$MANIFEST_PATH")
IMPLEMENTATION=""
if [ -n "$IMPL_PATH" ]; then
  IMPLEMENTATION=$(cat "$IMPL_PATH")
fi

codex exec "
Compare this manifest description with the actual implementation:

MANIFEST:
$MANIFEST

IMPLEMENTATION:
$IMPLEMENTATION

Questions:
1. Does the implementation match the description?
2. Are there features described but not implemented?
3. Are there features implemented but not described?
4. Is the description accurate and complete?

Output JSON:
{
  \"description_accurate\": boolean,
  \"missing_features\": [\"feature1\"],
  \"undocumented_features\": [\"feature2\"],
  \"accuracy_score\": 0.85,
  \"issues\": [
    {
      \"type\": \"missing_feature\",
      \"severity\": \"high|medium|low\",
      \"description\": \"...\",
      \"suggestion\": \"...\"
    }
  ]
}

Output ONLY valid JSON.
" > /tmp/validation-description.json

# Step 2: Validate preconditions
echo "[2/4] Validating preconditions enforcement..."
PRECONDITIONS=$(python3 -c "
import yaml, json, sys
try:
    manifest = yaml.safe_load(open('$MANIFEST_PATH'))
    print(json.dumps(manifest.get('preconditions', []), indent=2))
except:
    print('[]')
")

if [ "$PRECONDITIONS" != "[]" ]; then
  codex exec "
Analyze if these preconditions are actually checked in the code:

PRECONDITIONS:
$PRECONDITIONS

IMPLEMENTATION:
$IMPLEMENTATION

For each precondition, determine:
1. Is it checked in the code?
2. Where is it checked?
3. Does it fail gracefully if not met?
4. Is the error message clear?

Output JSON:
{
  \"preconditions_validated\": [
    {
      \"check\": \"file_exists('package.json')\",
      \"enforced\": true,
      \"location\": \"function:line\",
      \"error_handling\": \"good|fair|poor|missing\",
      \"suggestion\": \"...\"
    }
  ],
  \"coverage_score\": 0.80
}

Output ONLY valid JSON.
" > /tmp/validation-preconditions.json
else
  echo '{"preconditions_validated": [], "coverage_score": 1.0}' > /tmp/validation-preconditions.json
fi

# Step 3: Validate effects
echo "[3/4] Validating effects implementation..."
EFFECTS=$(python3 -c "
import yaml, json, sys
try:
    manifest = yaml.safe_load(open('$MANIFEST_PATH'))
    print(json.dumps(manifest.get('effects', []), indent=2))
except:
    print('[]')
")

if [ "$EFFECTS" != "[]" ]; then
  codex exec "
Verify that this code actually produces the claimed effects:

CLAIMED EFFECTS:
$EFFECTS

IMPLEMENTATION:
$IMPLEMENTATION

For each effect, determine:
1. Is the effect actually produced?
2. Where in the code does it happen?
3. Are there conditions where it might not happen?

Output JSON:
{
  \"effects_validated\": [
    {
      \"effect\": \"creates_vector_index\",
      \"implemented\": true,
      \"location\": \"function:line\",
      \"conditional\": false,
      \"confidence\": 0.95
    }
  ],
  \"missing_effects\": [],
  \"extra_effects\": [],
  \"coverage_score\": 0.85
}

Output ONLY valid JSON.
" > /tmp/validation-effects.json
else
  echo '{"effects_validated": [], "missing_effects": [], "extra_effects": [], "coverage_score": 1.0}' > /tmp/validation-effects.json
fi

# Step 4: Generate report
echo "[4/4] Generating validation report..."

python3 <<PYTHON_SCRIPT
import json
from datetime import datetime

# Load validation results
with open('/tmp/validation-description.json') as f:
    desc_validation = json.load(f)

with open('/tmp/validation-preconditions.json') as f:
    precond_validation = json.load(f)

with open('/tmp/validation-effects.json') as f:
    effects_validation = json.load(f)

# Calculate overall score
scores = [
    desc_validation.get('accuracy_score', 0),
    precond_validation.get('coverage_score', 0),
    effects_validation.get('coverage_score', 0)
]
overall_score = sum(scores) / len(scores) if scores else 0

# Collect all issues
all_issues = []
all_issues.extend(desc_validation.get('issues', []))

for precond in precond_validation.get('preconditions_validated', []):
    if not precond.get('enforced'):
        all_issues.append({
            'type': 'unenforced_precondition',
            'severity': 'medium',
            'description': f"Precondition not enforced: {precond['check']}",
            'suggestion': precond.get('suggestion', 'Add validation for this precondition')
        })

for effect in effects_validation.get('effects_validated', []):
    if not effect.get('implemented'):
        all_issues.append({
            'type': 'unimplemented_effect',
            'severity': 'high',
            'description': f"Effect not implemented: {effect['effect']}",
            'suggestion': 'Implement this effect or remove from manifest'
        })

# Count by severity
high_issues = len([i for i in all_issues if i['severity'] == 'high'])
medium_issues = len([i for i in all_issues if i['severity'] == 'medium'])
low_issues = len([i for i in all_issues if i['severity'] == 'low'])

# Determine pass/fail
passed = overall_score >= 0.8 and high_issues == 0

# Generate report
report = {
    'resource': '$RESOURCE_NAME',
    'validated_at': datetime.utcnow().isoformat() + 'Z',
    'overall_score': round(overall_score, 3),
    'scores': {
        'description_accuracy': round(desc_validation.get('accuracy_score', 0), 3),
        'precondition_coverage': round(precond_validation.get('coverage_score', 0), 3),
        'effect_coverage': round(effects_validation.get('coverage_score', 0), 3)
    },
    'validation_results': {
        'description': desc_validation,
        'preconditions': precond_validation,
        'effects': effects_validation
    },
    'issues': all_issues,
    'issue_count': len(all_issues),
    'issue_breakdown': {
        'high': high_issues,
        'medium': medium_issues,
        'low': low_issues
    },
    'passed': passed
}

with open('/tmp/validation-report.json', 'w') as f:
    json.dump(report, f, indent=2)

# Print summary
print("")
print("━" * 50)
print("VALIDATION REPORT")
print("━" * 50)
print(f"\nResource: {report['resource']}")
print(f"Overall Score: {overall_score:.2f}")
print(f"\nComponent Scores:")
print(f"  Description Accuracy:   {desc_validation.get('accuracy_score', 0):.2f}")
print(f"  Precondition Coverage:  {precond_validation.get('coverage_score', 0):.2f}")
print(f"  Effect Coverage:        {effects_validation.get('coverage_score', 0):.2f}")

print(f"\nIssues Found: {len(all_issues)}")
if high_issues > 0:
    print(f"  ❌ High:   {high_issues}")
if medium_issues > 0:
    print(f"  ⚠️  Medium: {medium_issues}")
if low_issues > 0:
    print(f"  ℹ️  Low:    {low_issues}")

if len(all_issues) > 0:
    print("\nIssue Details:")
    for issue in all_issues:
        severity_icon = {"high": "❌", "medium": "⚠️", "low": "ℹ️"}.get(issue['severity'], "•")
        print(f"\n  {severity_icon} [{issue['severity'].upper()}] {issue['type']}")
        print(f"     {issue['description']}")
        if issue.get('suggestion'):
            print(f"     → {issue['suggestion']}")

print("\n" + "━" * 50)
if passed:
    print("✅ VALIDATION PASSED")
else:
    print("❌ VALIDATION FAILED")
print("━" * 50)
print(f"\nReport saved: /tmp/validation-report.json")
print("")

# Exit with appropriate code
import sys
sys.exit(0 if passed or '$STRICT_MODE' != 'true' else 1)
PYTHON_SCRIPT

# Cleanup temporary files
rm -f /tmp/validation-description.json /tmp/validation-preconditions.json /tmp/validation-effects.json
