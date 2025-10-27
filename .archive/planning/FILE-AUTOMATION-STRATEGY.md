# Complete File Automation Strategy

## Executive Summary

**Audit Results:** 48 files contain skill/MCP count references
**Current Automation:** 6 files auto-update
**Gap:** 42 files need categorization and automation decisions

## File Categories

### Category 1: AUTO-UPDATE (Primary Documentation - 11 files)

These files MUST auto-update when counts change:

1. **ROOT FILES (6)**
   - ✅ README.md
   - ✅ BUILD_FOCUS.md
   - ✅ .cursorrules
   - ✅ CHANGELOG.md
   - ❌ CONTRIBUTING.md (automation docs only, not counts)
   - ❌ .ai-dev.json (tracks installed, not total counts)

2. **DOCS/ FILES (4)**
   - ✅ DOCS/INDEX.md
   - ✅ DOCS/MCP-DEVELOPMENT-ROADMAP.md
   - ❌ DOCS/QUICK-START.md (examples with placeholder counts)
   - ❌ DOCS/CLI-REFERENCE.md (examples with placeholder counts)

3. **META/ FILES (1)**
   - ✅ META/registry.json (auto-synced)
   - ✅ META/skill-registry.json (auto-synced)
   - ❌ META/relationship-mapping.json (manual relationships)

**Status: 6/11 implemented ✅**

---

### Category 2: TEMPLATE-BASED (Examples - 8 files)

These contain EXAMPLE outputs with counts. Update TEMPLATES, not instances:

1. **DOCS/ FILES (7)**
   - DOCS/AUTO-SYNC-GUIDE.md (before/after examples)
   - DOCS/BOOTSTRAP.md (sample output)
   - DOCS/CHEAT-SHEET.md (expected results)
   - DOCS/CLI-REFERENCE.md (command examples)
   - DOCS/EXISTING-PROJECTS.md (sample workflows)
   - DOCS/INTEGRATION-GUIDE.md (integration examples)
   - DOCS/QUICK-START.md (quickstart examples)

2. **INSTALLERS/ FILES (1)**
   - INSTALLERS/README.md (installation output examples)

**Strategy:** Create example templates with `{{SKILL_COUNT}}` placeholders

---

### Category 3: LEGACY/HISTORICAL (Archive - 25 files)

These are in DOCS-LEGACY/ and serve as historical record. DO NOT UPDATE:

1. **Audit Reports**
   - DOCS-LEGACY/AUDIT-TRUST-RESTORATION.md
   - DOCS-LEGACY/AUDIT-VALIDATION-CHECKLIST.md
   - DOCS-LEGACY/QUALITY-AUDIT-REPORT.md

2. **Status Reports (Historical Snapshots)**
   - DOCS-LEGACY/AUTO-SYNC-SUMMARY.md
   - DOCS-LEGACY/AUTO-SYNC.md
   - DOCS-LEGACY/AUTO-UPDATE-FILES.md
   - DOCS-LEGACY/BUILD-PROGRESS.md
   - DOCS-LEGACY/BUILD-STATUS.md
   - DOCS-LEGACY/CI-CD-IMPLEMENTATION-STATUS.md
   - DOCS-LEGACY/COMPREHENSIVE-AUTO-SYNC.md
   - DOCS-LEGACY/DARK_MATTER_ACTIONS_COMPLETE.md
   - DOCS-LEGACY/RESOURCE-DISCOVERY-ANALYSIS.md
   - DOCS-LEGACY/RESOURCE-DISCOVERY-FIX-STATUS.md
   - DOCS-LEGACY/RESOURCE-INDEX.md
   - DOCS-LEGACY/SKILL-MCP-GAP-ANALYSIS.md
   - DOCS-LEGACY/WEEK1-COMPLETION-SUMMARY.md
   - DOCS-LEGACY/dark_matter_report.md

3. **Analysis Documents (Point-in-Time)**
   - DOCS-LEGACY/COST-EFFICIENCY-GUARDRAILS-ANALYSIS.md
   - DOCS-LEGACY/COST-GUARDRAILS-IMPLEMENTATION-SUMMARY.md
   - DOCS-LEGACY/ECOSYSTEM-PARITY-ANALYSIS.md
   - DOCS-LEGACY/GETTING-STARTED.md
   - DOCS-LEGACY/README.md
   - DOCS-LEGACY/RESOURCE-PRIORITY-PLAN.md

**Strategy:** Add disclaimer header to DOCS-LEGACY/README.md explaining these are historical

---

### Category 4: SESSION REPORTS (Current Work - 6 files)

These document current session work. Update during active work, archive when done:

1. **Active Reports**
   - AUTOMATION-CHAIN-ANALYSIS.md
   - AUTOMATION-STATUS-REPORT.md
   - AUTOMATION.md
   - DARK-MATTER-SELF-CHECK-REPORT.md
   - SESSION-SUMMARY.md

2. **Specs**
   - DARK-MATTER-IMPLEMENTATION-SUMMARY.md
   - DARK-MATTER-META-INTEGRATION.md
   - DARK-MATTER-SPECIFICATION.md

**Strategy:**
- Update if actively referenced
- Move to DOCS-LEGACY when work complete
- Add "Last Updated" datestamp

---

### Category 5: META DOCUMENTATION (Context - 3 files)

Internal documentation that reflects current state:

1. **META/ Files**
   - META/GAP-ANALYSIS.md
   - META/IMPLEMENTATION-STATUS.md
   - META/MASTER-ROADMAP.md
   - META/PROJECT-CONTEXT.md

**Strategy:** Update when major milestones reached

---

### Category 6: COMPONENT TESTS (Implementation Specific - 3 files)

MCP-specific test documentation:

- MCP-SERVERS/embedding-generator-mcp/INTEGRATION_TEST.md
- MCP-SERVERS/feature-prioritizer-mcp/INTEGRATION_TEST.md
- MCP-SERVERS/vector-database-mcp/INTEGRATION_TEST.md

**Strategy:** Maintain separately per MCP, not global counts

---

### Category 7: AUDIT SYSTEM (Special - 2 files)

- DOCS/AUDIT-SYSTEM.md (references specific audit findings)
- DOCS/RESOURCE-GUIDE.md (gap analysis)

**Strategy:** Update when audit findings change

---

## Automation Implementation Plan

### Phase 1: Current Files (DONE ✅)
- README.md
- BUILD_FOCUS.md
- DOCS/INDEX.md
- DOCS/MCP-DEVELOPMENT-ROADMAP.md
- .cursorrules
- CHANGELOG.md

### Phase 2: Examples/Templates (2 hours)
Update these to use template system:
- DOCS/QUICK-START.md
- DOCS/CLI-REFERENCE.md
- DOCS/BOOTSTRAP.md
- DOCS/AUTO-SYNC-GUIDE.md
- DOCS/CHEAT-SHEET.md
- DOCS/EXISTING-PROJECTS.md
- DOCS/INTEGRATION-GUIDE.md
- INSTALLERS/README.md

### Phase 3: Legacy Disclaimer (30 min)
Add header to DOCS-LEGACY/:
```markdown
> **Historical Document** - This document reflects the state of the repository
> as of [DATE]. Counts and status information are preserved for historical
> reference and should NOT be updated.
```

### Phase 4: Session Reports (1 hour)
- Add "Last Updated" to active reports
- Create archival process
- Update current reports with latest counts

### Phase 5: META Documentation (1 hour)
- Update GAP-ANALYSIS.md
- Update IMPLEMENTATION-STATUS.md
- Update MASTER-ROADMAP.md if needed

---

## Validation Strategy

### Tier 1: Critical (Always Validate)
- README.md
- BUILD_FOCUS.md
- DOCS/INDEX.md
- DOCS/MCP-DEVELOPMENT-ROADMAP.md
- .cursorrules
- CHANGELOG.md

### Tier 2: Important (Warn Only)
- DOCS/QUICK-START.md (examples)
- DOCS/CLI-REFERENCE.md (examples)
- META/GAP-ANALYSIS.md

### Tier 3: Informational (Skip)
- DOCS-LEGACY/* (historical)
- SESSION-SUMMARY.md (session-specific)
- MCP test files (MCP-specific)

---

## Files That Should NEVER Auto-Update

1. **DOCS-LEGACY/** - Historical record (25 files)
2. **MCP test files** - Implementation specific (3 files)
3. **Session reports** - Point-in-time snapshots (until archived)
4. **Example templates** - Use placeholders, not actual counts
5. **.ai-dev.json** - Tracks installed items, not repository totals

---

## Summary

**Total Files:** 48 with skill/MCP references

**Categorization:**
- AUTO-UPDATE: 6 files (implemented ✅)
- TEMPLATE-BASED: 8 files (needs implementation)
- LEGACY: 25 files (add disclaimer, do not update)
- SESSION REPORTS: 6 files (selective updates)
- META DOCS: 3 files (milestone updates)
- COMPONENT TESTS: 3 files (MCP-specific, ignore)
- AUDIT SYSTEM: 2 files (audit-specific updates)

**Automation Coverage:**
- Currently: 6/48 files (12.5%)
- Should be: 6/48 files (12.5%) ✅
- Legacy (no update): 25/48 (52%)
- Template-based: 8/48 (17%)
- Selective: 9/48 (18.5%)

**Key Insight:** We're actually automating the RIGHT files already! The "gap" is mostly:
1. Legacy files that SHOULD NOT update
2. Example files that need template system
3. Session/audit files that update on different triggers

**Recommendation:**
1. ✅ Keep current 6-file automation
2. ✅ Add disclaimer to DOCS-LEGACY
3. ✅ Convert examples to use `{{placeholders}}`
4. ✅ Document this strategy clearly
