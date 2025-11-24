# Claude Code Orchestration System

## Overview

This document describes the Claude Code-based orchestration system that eliminates the need for separate OpenAI API keys while providing intelligent, automated orchestration of skills and tools.

##Architecture

### The Problem We Solved

**Before**: Orchestration required OpenAI Codex CLI + separate API key

- Cost: $9/M tokens (Codex)
- Complexity: Separate API management
- Dependency: External service required

**After**: Orchestration uses Claude Code (you're already paying for)

- Cost: Included in Claude Code usage
- Simplicity: Single system, no extra keys
- Integration: Native to development workflow

### How It Works

```
User runs:           Brain creates:         Claude Code reads:    Claude Code writes:
brain orchestration  Request JSON          Request file          Result JSON
   ↓                     ↓                      ↓                      ↓
"Build RAG system" → pending/123.json →  Analyzes request →  results/123.json
                                         Plans execution
                                         Writes results
```

## File Structure

```
ai-dev-standards/
├── orchestration-requests/
│   ├── pending/              # New requests waiting for execution
│   ├── in-progress/         # Currently being executed
│   ├── completed/           # Successfully completed
│   └── failed/              # Failed requests
├── orchestration-results/   # Execution results
├── scripts/orchestration/
│   └── create-request.sh    # Utility to create requests
└── SCHEMAS/
    ├── orchestration-request.schema.json   # Request format
    └── orchestration-result.schema.json    # Result format
```

## Request Types

| Type                     | Purpose                                   | When to Use                       |
| ------------------------ | ----------------------------------------- | --------------------------------- |
| `plan`                   | Create execution plan for complex goals   | Multi-step feature implementation |
| `validate`               | Validate skill implementation vs manifest | Before releasing skills           |
| `diagnose`               | Run project health diagnostics            | Regular health checks             |
| `generate_manifest`      | Generate capability manifest from code    | New skills without manifests      |
| `build_capability_graph` | Build capability graph from all skills    | After adding/modifying skills     |
| `analyze_project`        | Deep analysis of project state            | Strategic planning                |

## Usage Guide

### Step 1: Create a Request

Using the utility script:

```bash
# Create execution plan
./scripts/orchestration/create-request.sh plan "Build RAG system for documentation search"

# Validate a skill
./scripts/orchestration/create-request.sh validate "Check mvp-builder" --skill-path SKILLS/mvp-builder

# Run diagnostics
./scripts/orchestration/create-request.sh diagnose "Project health check"

# Generate manifest
./scripts/orchestration/create-request.sh generate_manifest "Create manifest for new skill" --skill-path SKILLS/my-skill
```

Output:

```
✓ Created orchestration request: 1730217845123
  Type: plan
  Goal: Build RAG system for documentation search
  File: orchestration-requests/pending/1730217845123.json

Next steps:
  1. Ask Claude Code to: "Execute orchestration request 1730217845123"
  2. Claude Code will read the request, execute it, and write results
  3. Check results in: orchestration-results/1730217845123.json
```

### Step 2: Execute via Claude Code

Simply tell Claude Code:

```
Execute orchestration request 1730217845123
```

Claude Code will:

1. Read `orchestration-requests/pending/1730217845123.json`
2. Move it to `in-progress/`
3. Analyze the goal and context
4. Access registries, capability graph, and project state
5. Generate execution plan or perform requested analysis
6. Write results to `orchestration-results/1730217845123.json`
7. Move request to `completed/` or `failed/`

### Step 3: Review Results

```bash
cat orchestration-results/1730217845123.json
```

Example result for `plan` type:

```json
{
  "request_id": "1730217845123",
  "status": "success",
  "timestamp": "2025-10-29T10:30:45Z",
  "execution_time_ms": 5432,
  "result_type": "execution_plan",
  "data": {
    "plan": {
      "goal": "Build RAG system for documentation search",
      "steps": [
        {
          "id": "step-1",
          "skill": "rag-implementer",
          "description": "Set up vector database and embedding pipeline",
          "dependencies": [],
          "estimated_duration": "30 minutes",
          "risk_level": "low"
        },
        {
          "id": "step-2",
          "skill": "api-designer",
          "description": "Design search API endpoints",
          "dependencies": ["step-1"],
          "estimated_duration": "20 minutes",
          "risk_level": "low"
        }
      ],
      "estimated_total_time": "50 minutes",
      "complexity_score": 6.5,
      "confidence_level": "high"
    }
  },
  "recommendations": [
    {
      "priority": "high",
      "action": "Start with step-1: Set up vector database",
      "rationale": "Foundation for all subsequent work"
    }
  ]
}
```

## Brain Command Integration

### Current Status

Brain commands still call Codex CLI (old way). They need to be modified to use the request system.

### How to Modify Brain Commands

**Before** (using Codex):

```bash
# scripts/brain/commands/orchestration.sh
codex exec "Create plan for: $GOAL"
```

**After** (using Claude Code):

```bash
# scripts/brain/commands/orchestration.sh
./scripts/orchestration/create-request.sh plan "$GOAL"
echo "Request created. Execute it via Claude Code."
```

### Commands to Update

1. `brain orchestration plan` → Use `create-request.sh plan`
2. `brain orchestration validate` → Use `create-request.sh validate`
3. `brain capability-graph` → Use `create-request.sh build_capability_graph`
4. `brain diagnose` → Use `create-request.sh diagnose`

## Request Schema

See `SCHEMAS/orchestration-request.schema.json` for full schema.

Key fields:

- `id`: Unique timestamp-based ID
- `type`: Request type (plan|validate|diagnose|etc)
- `goal`: User's goal description
- `status`: pending|in_progress|completed|failed
- `context`: Project paths, available skills, constraints
- `metadata`: Created by, user, priority, tags

## Result Schema

See `SCHEMAS/orchestration-result.schema.json` for full schema.

Key fields:

- `request_id`: Links back to request
- `status`: success|partial_success|failed
- `result_type`: Type of data returned
- `data`: The actual results (structure varies by type)
- `metrics`: Execution metrics (tokens, files analyzed)
- `recommendations`: Next steps

## Examples

### Example 1: Plan Feature Implementation

```bash
# Create request
./scripts/orchestration/create-request.sh plan "Add user authentication with OAuth2"

# Tell Claude Code
"Execute orchestration request <ID>"

# Review plan
cat orchestration-results/<ID>.json
```

Expected result: Step-by-step plan using security-engineer, api-designer, and frontend-builder skills.

### Example 2: Validate Skill

```bash
# Create request
./scripts/orchestration/create-request.sh validate "Validate RAG implementation" \
  --skill-path SKILLS/rag-implementer

# Execute via Claude Code
"Execute orchestration request <ID>"

# Review validation
cat orchestration-results/<ID>.json
```

Expected result: Validation report with any discrepancies between implementation and manifest.

### Example 3: Project Diagnostics

```bash
# Create request
./scripts/orchestration/create-request.sh diagnose "Check project health"

# Execute via Claude Code
"Execute orchestration request <ID>"

# Review diagnostics
cat orchestration-results/<ID>.json
```

Expected result: Health score, identified issues, and prioritized recommendations.

## Advanced Usage

### Batch Requests

Create multiple requests and execute them in sequence:

```bash
# Create requests
for goal in "Plan auth system" "Validate API design" "Diagnose performance"
do
  ./scripts/orchestration/create-request.sh plan "$goal"
done

# Execute all pending requests
ls orchestration-requests/pending/*.json | while read req
do
  ID=$(basename "$req" .json)
  echo "Executing request $ID..."
  # Tell Claude Code to execute each one
done
```

### Custom Context

Add custom context to requests by editing the JSON directly:

```json
{
  "context": {
    "constraints": {
      "max_cost": 100,
      "max_duration": 120,
      "risk_tolerance": "low"
    },
    "preferences": {
      "prefer_tested": true,
      "prefer_documented": true
    }
  }
}
```

### Priority Handling

Requests support priority levels:

```bash
./scripts/orchestration/create-request.sh plan "Critical security fix" \
  --priority urgent
```

Claude Code can prioritize urgent requests when multiple are pending.

## Troubleshooting

### Request Not Being Processed

1. Check request status: `cat orchestration-requests/pending/<ID>.json`
2. Verify request is valid JSON: `jq . orchestration-requests/pending/<ID>.json`
3. Ensure Claude Code has access to the directory

### Results Not Generated

1. Check if request moved to `in-progress/`: `ls orchestration-requests/in-progress/`
2. Look for errors in failed requests: `ls orchestration-requests/failed/`
3. Review request goal for clarity

### Unexpected Results

1. Review the goal - be specific and clear
2. Check context - ensure correct paths and settings
3. Add more details to the goal or context

## Future Enhancements

### Planned Features

1. **Automatic Retry**: Failed requests auto-retry with backoff
2. **Progress Updates**: Real-time status updates during execution
3. **Result Caching**: Cache similar requests to save compute
4. **Multi-step Execution**: Automatically execute plans, not just generate them
5. **Interactive Mode**: Ask clarifying questions mid-execution
6. **Metrics Dashboard**: Visualize orchestration metrics over time

### Integration Opportunities

1. **GitHub Actions**: Trigger orchestration on PR creation
2. **VS Code Extension**: One-click orchestration from editor
3. **Slack Bot**: Create requests via Slack commands
4. **Web UI**: Visual interface for managing requests

## Implementation Status

### ✅ Completed

- [x] Directory structure
- [x] Request schema
- [x] Result schema
- [x] Request creation utility (`create-request.sh`)
- [x] Documentation

### ⏳ In Progress

- [ ] Brain command modifications
- [ ] End-to-end testing
- [ ] Example workflows

### 📋 Planned

- [ ] Automatic request processing
- [ ] Result visualization tools
- [ ] Integration with Archon MCP
- [ ] Performance metrics

## Cost Analysis

### Before (Codex CLI)

- Codex API: $9/M tokens
- Typical plan generation: 2K-5K tokens
- Cost per request: $0.02-$0.05
- Monthly cost (100 requests): $2-$5

### After (Claude Code)

- Claude Code: Included in subscription
- Same token usage: 2K-5K tokens
- Cost per request: $0 (already paying for Claude Code)
- Monthly cost (100 requests): $0 additional

**Savings**: $2-$5/month or 100% reduction in orchestration API costs

## Best Practices

1. **Be Specific**: Clear goals get better results
2. **Provide Context**: Include relevant paths and constraints
3. **Review Results**: Always verify before executing plans
4. **Iterate**: Refine requests based on results
5. **Document**: Add tags and metadata for tracking
6. **Clean Up**: Archive old requests periodically

## Support

For issues or questions:

1. Review this documentation
2. Check request/result schemas
3. Examine example requests
4. Ask Claude Code for help

## Conclusion

The Claude Code orchestration system provides:

- Zero additional cost
- Simpler architecture
- Native integration
- Same capabilities as Codex

All while using tools you're already paying for and working with daily.
