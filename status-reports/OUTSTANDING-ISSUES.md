# Outstanding Issues and Planned Updates

**Generated:** 2025-10-28
**Status:** Post-Security Fix (v3.0.0)

## Overview

After the critical security fix (v3.0.0), several audits have been run revealing additional issues that need attention. This document tracks all outstanding fixes and planned updates.

---

## 🚨 High Priority Issues

### 1. CLI Command Security Issues (From Codex Review)

**Status:** IDENTIFIED - Needs fixing

#### File: `CLI/commands/setup.js`

- **Severity:** HIGH
- **Issue:** Path traversal risk in environment file writing
- **Line:** ~320-340
- **Description:** User input (`options.env`) used directly in file operations without validation
- **Fix Needed:** Validate `options.env` path to prevent path traversal

#### File: `CLI/commands/doctor.js`

- **Severity:** MEDIUM
- **Issue:** Dependency check silently fails when packages are outdated
- **Line:** ~209-230
- **Description:** `checkDependencies()` ignores exit code 1 from `npm outdated`, causing outdated packages to appear as OK
- **Fix Needed:** Properly handle npm outdated exit codes and parse JSON output

#### File: `CLI/commands/analyze.js`

- **Severity:** MEDIUM
- **Issue:** Missing error handling in auto-fix stub functions
- **Line:** ~320-340
- **Description:** Auto-fix functions are stubs that appear to fix issues but do nothing
- **Fix Needed:** Either implement auto-fix or remove the `--fix` option until ready

#### File: `CLI/commands/init.js`

- **Severity:** MEDIUM
- **Issue:** Project name validation insufficient
- **Line:** Function entry point
- **Description:** Project names not validated for dangerous characters or path traversal
- **Fix Needed:** Add validation using existing `sanitizeName()` utility

---

## ⚠️ Medium Priority Issues

### 2. Registry-Directory Mismatches

**Status:** IDENTIFIED - Needs synchronization

#### MCP Registry vs Directories

- **Registry Count:** 50 MCPs (in `meta/mcp-registry.json`)
- **Directory Count:** 49 MCPs (in `mcp-servers/`)
- **Missing:**
  - `archon-mcp` (external, should not have directory - registry path points to GitHub)
  - Naming mismatches:
    - Registry: "Documentation Generator MCP" → Directory: `doc-generator-mcp`
    - Registry: "Internationalization Manager MCP" → Directory: `i18n-manager-mcp`

**Fix Needed:** Update registry names to match directory conventions OR update directories to match registry

#### Tool Registry Counts

- **Registry:** 24 tools (in `meta/tool-registry.json`)
- **README:** Claims "24 Tools + 4 Scripts"
- **Actual Files:** 36 files in TOOLS directory (includes templates and subdirectories)

**Fix Needed:** Clarify what counts as a "tool" vs a template/example

---

### 3. Resource Count Discrepancies

**Status:** IDENTIFIED - Documentation needs updating

#### README Claims vs Reality

- **README Says:** "330 resources"
- **Actual Count (from `meta/registry.json`):** 195 resources
  - 59 skills ✅
  - 50 MCPs ✅
  - 4 tools ⚠️ (README says 24)
  - 3 scripts ⚠️ (README says 4)
  - 75 components ⚠️ (README says 70)
  - 4 integrations ⚠️ (README says 6)

**Breakdown:**

- Actual total: 59 + 50 + 4 + 3 + 75 + 4 = **195 resources**
- README claim: **330 resources**
- **Discrepancy:** 135 resources

**Fix Needed:**

1. Update README to reflect actual count (195) OR
2. Investigate if some resources are not registered properly

---

### 4. Missing Documentation Files

**Status:** IDENTIFIED

- **SECURITY-FIX-CROSS-PROJECT-ISOLATION.md** - Created but not committed
- **PR-SECURITY-V3.0.0-DESCRIPTION.md** - Temporary PR file (can be deleted after PR created)
- **README.md.backup.20251028_093630** - Backup file (should be cleaned up)

---

### 5. Uncommitted Changes

**Status:** PENDING COMMIT

Files modified but not committed:

- `ARCHON-PROJECT.json`
- `components/mcp-servers/README.md`
- `docs/AGENT-SKILL-INTEGRATION.md`
- `docs/GETTING-STARTED.md`
- `docs/QUICK-START.md`
- `FINAL-RESOURCE-COUNTS.md`
- `meta/docs-registry.json`
- `README.md`

New untracked:

- `agents/` directory
- `PR-SECURITY-V3.0.0-DESCRIPTION.md`
- `README.md.backup.20251028_093630`

**Fix Needed:** Review and commit or discard these changes

---

## 📋 Low Priority / Enhancement

### 6. CLI Command Improvements

**Status:** ENHANCEMENT

- **Analyze command:** Implement actual auto-fix functionality or remove `--fix` flag
- **Doctor command:** Improve outdated package detection
- **Setup command:** Add path validation for all file operations
- **Init command:** Add project name validation

### 7. Documentation Consistency

**Status:** ONGOING

From comprehensive audit (40,404 lines of report):

- 68 files with resource counts that may need updating
- 13 files with MCP:skill ratios that may need updating
- 23 files with percentage claims
- 88 files with registry references

**Fix Needed:** Run validation scripts after registry updates

---

## 🔄 Planned Updates

### Phase: Post-Security Fix Cleanup

**Priority 1: Security (THIS WEEK)**

1. Fix path traversal risks in CLI commands
2. Add input validation to all user-facing commands
3. Implement proper error handling in stub functions

**Priority 2: Registry Consistency (THIS WEEK)**

1. Synchronize MCP registry names with directory names
2. Update tool/script counts in README
3. Correct resource count (330 → 195 or explain discrepancy)

**Priority 3: Documentation (NEXT WEEK)**

1. Update all files with outdated counts
2. Clean up backup files
3. Review and commit/discard uncommitted changes

**Priority 4: Feature Completion (FUTURE)**

1. Implement analyze command auto-fix functionality
2. Complete doctor command dependency checks
3. Add comprehensive input validation across all commands

---

## 📊 Testing Needed

### Before Next Release

1. **CLI Command Testing:**
   - Test all 8 CLI commands with edge cases
   - Verify path traversal protection
   - Test input validation

2. **Registry Validation:**
   - Run `npm run validate` to check all registries
   - Verify all registry entries have corresponding files
   - Check all file counts match documentation

3. **Integration Testing:**
   - Test setup-project.sh with new v3.0.0 changes
   - Verify brain commands work with updated registries
   - Test Archon MCP integration

---

## 🎯 Success Criteria

**v3.0.1 Ready When:**

- [ ] All HIGH priority security issues fixed
- [ ] Registry-directory mismatches resolved
- [ ] Resource counts accurate and consistent
- [ ] All uncommitted changes reviewed and resolved
- [ ] Documentation updated to reflect actual state
- [ ] All validation scripts pass
- [ ] CLI commands tested and working

---

## 📝 Notes

- The v3.0.0 security fix is COMPLETE and deployed
- The PR for v3.0.0 needs to be created manually via GitHub web UI
- These issues were discovered AFTER the security fix commit
- None of these issues are blocking for the v3.0.0 security release
- They should be addressed in v3.0.1 or v3.1.0

---

**Last Updated:** 2025-10-28
**Next Review:** After v3.0.0 PR is merged
