# Capability Graph Builder - Datetime Caching Issue

**Status:** Deferred
**Priority:** Medium
**Component:** SKILLS/capability-graph-builder/build-graph.sh
**Created:** 2025-10-29

## Problem Summary

The capability graph builder script encounters persistent caching issues when building the graph from skill manifests. Despite fixing datetime serialization in manifest YAML files, the script continues to load old cached versions with unquoted datetime values, causing Python JSON serialization errors.

## Error Details

```
TypeError: Object of type datetime is not JSON serializable
```

### Root Cause

The `build-graph.sh` script appears to be caching manifest data somewhere in the pipeline, preventing it from loading the corrected YAML files with properly quoted datetime fields.

## Attempted Fixes

### 1. Fixed Datetime Quoting in Manifests ✅

Updated manifests to quote datetime fields:

```yaml
# Before
created_at: 2025-01-01T00:00:00Z

# After
created_at: "2025-01-01T00:00:00Z"
```

**Files Fixed:**
- `SKILLS/orchestration-planner/manifest.yaml:99-100`
- `SKILLS/system-diagnostician/manifest.yaml:90-91`

### 2. Fixed Python JSON Parsing in build-graph.sh ✅

Changed from stdin piping to triple-quoted string literals to prevent Python boolean/JSON boolean conflicts:

```bash
# Before
MANIFESTS_JSON=$(echo "$MANIFESTS_JSON" | python3 -c "...")

# After
MANIFESTS_JSON=$(python3 -c "
import json
manifests = json.loads('''$MANIFESTS_JSON''')
...")
```

**File:** `SKILLS/capability-graph-builder/build-graph.sh:48-54`

### 3. Multiple Retry Attempts ❌

- Attempted multiple consecutive runs of the build script
- Script continued to load old manifest data
- Datetime errors persisted despite file corrections

## Impact

**Blocked Tasks:**
- Phase 3: Capability Graph Refresh
- Phase 4: Orchestration E2E Validation
- Phase 5: Archon & Brain Integration

**Current Workarounds:**
- Phases 1-2 completed and committed successfully
- Phase 6-7 can proceed independently (don't require capability graph)

## Potential Causes

1. **Bash Variable Caching:** The `MANIFESTS_JSON` variable may be retaining old data between script runs
2. **Python Import Caching:** PyYAML or json modules may cache parsed data
3. **File System Caching:** WSL2 file system may cache file contents
4. **Script State:** The `while IFS= read -r` loop may not be re-reading files properly

## Recommended Solutions

### Short-term (for next session)
1. Clear any Python `__pycache__` directories
2. Add explicit cache-busting to the script:
   ```bash
   # Clear any cached data
   unset MANIFESTS_JSON
   rm -f /tmp/capability-graph-*.json
   ```
3. Restart the shell/WSL instance to clear all environment state

### Long-term (architectural improvement)
1. Rewrite build-graph.sh to use a standalone Python script instead of inline Python
2. Add explicit file reading with no caching:
   ```python
   with open(manifest_path, 'r') as f:
       data = yaml.safe_load(f)
   ```
3. Add validation step to verify datetime fields are quoted before processing
4. Consider using Codex directly without the bash wrapper

## Testing Verification

Once fixed, verify with:

```bash
# 1. Clear any caches
rm -rf __pycache__ /tmp/capability-graph-*.json

# 2. Verify manifests have quoted datetimes
grep -r "created_at:" SKILLS/*/manifest.yaml | grep -v '"'
# Should return no results

# 3. Run build script
export OPENAI_API_KEY=<key>
bash SKILLS/capability-graph-builder/build-graph.sh SKILLS META/capability-graph.json

# 4. Check output
cat META/capability-graph.json | jq '.node_count'
# Should show 64 nodes (all skills)
```

## Related Files

- `SKILLS/capability-graph-builder/build-graph.sh`
- `SKILLS/orchestration-planner/manifest.yaml`
- `SKILLS/system-diagnostician/manifest.yaml`
- `META/capability-graph.json` (output file)

## Notes

- All skill manifests have been corrected
- Python JSON parsing bugs have been fixed
- Issue is specifically with caching/stale data loading
- Not blocking critical path work (Phases 6-7 can proceed)
