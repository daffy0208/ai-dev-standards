# Fix All CLI Issues - Complete Action Plan

## Immediate Fixes Required

### 1. update.js - fetchAvailableSkills() and fetchAvailableMcps()
**Current:** Returns 3 hardcoded skills
**Required:** Fetch from GitHub like sync.js

### 2. Add GitHub fetch utility
**Create:** CLI/utils/github-fetch.js
**Purpose:** Centralized GitHub fetching for all commands

### 3. Add CLI validation
**Update:** scripts/validate-all.cjs
**Add:** 3 new validation checks for CLI

### 4. Add integration tests
**Create:** tests/integration/cli.test.js
**Purpose:** Test CLI commands actually work

## Implementation Priority

1. Create GitHub fetch utility (reusable)
2. Fix update.js to use utility
3. Add validation checks
4. Commit and push
5. Add to validation suite

This ensures no more CLI commands are broken with mock data.
