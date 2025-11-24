# Orchestration Requests

This directory contains orchestration requests for Claude Code to execute.

## Directory Structure

- `pending/` - New requests waiting for execution
- `in-progress/` - Currently being executed by Claude Code
- `completed/` - Successfully completed requests
- `failed/` - Failed requests with error information

## Creating Requests

Use the utility script:

```bash
./scripts/orchestration/create-request.sh <type> <goal> [options]
```

Types: `plan`, `validate`, `diagnose`, `generate_manifest`, `build_capability_graph`, `analyze_project`

## Executing Requests

Tell Claude Code:

```
Execute orchestration request <ID>
```

Results will be written to `orchestration-results/<ID>.json`

## Full Documentation

See `DOCS/CLAUDE-CODE-ORCHESTRATION.md` for complete documentation.
