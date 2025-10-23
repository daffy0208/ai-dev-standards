# Dark Matter Analyzer - Meta-Level Integration

**Date:** 2025-10-23
**Purpose:** Define how dark-matter-analyzer should monitor the ai-dev-standards framework itself

---

## 🎯 The Meta-Capability

The dark-matter-analyzer has a unique **recursive capability**: it can analyze repositories, including **this repository**. This means it can:

1. **Monitor BUILD_FOCUS adherence** - Are we following our own rules?
2. **Check relationship consistency** - Are skill-MCP relationships maintained?
3. **Validate automation gaps** - What should be automated but isn't?
4. **Detect framework drift** - Is the framework staying true to its goals?

---

## 🔍 When Dark Matter Should Analyze ai-dev-standards

### Trigger Scenarios

**1. After Major Changes**
- New skill/MCP added → Check if all files updated
- Registry modified → Verify relationship integrity
- BUILD_FOCUS updated → Assess adherence to new rules

**2. Periodic Health Checks**
- Weekly: Quick coherence scan
- Monthly: Deep analysis with full RCI calculation
- Quarterly: Comprehensive audit with external validation

**3. User-Discovered Gaps**
- When user asks "Why isn't X updated?"
- When inconsistencies are reported
- When automation fails silently

**4. Before Major Releases**
- Pre-commit: Quick relationship check
- Pre-release: Full coherence analysis
- Post-release: Validate documentation accuracy

---

## 📊 What Dark Matter Should Check in ai-dev-standards

### 1. BUILD_FOCUS Adherence Patterns

**Pattern: "Moratorium Violation"**
- **Signal:** New skill created while MCP count < 15
- **Check:** Compare current ratio against BUILD_FOCUS target
- **Action:** 🔴 HOLD - Flag as violation, recommend deletion or MCP creation

**Pattern: "Documentation Inflation"**
- **Signal:** New .md files created without corresponding feature
- **Check:** Track doc count against BUILD_FOCUS consolidation target
- **Action:** 🟡 REVIEW - Assess if new doc is necessary

**Pattern: "Build vs Doc Ratio Violation"**
- **Signal:** Ratio < 1.0 (more docs than features)
- **Check:** Weekly Friday calculation
- **Action:** 🟡 REVIEW - Highlight the imbalance

### 2. Relationship Integrity Patterns

**Pattern: "Orphaned Skill"**
- **Signal:** Skill in registry but not in relationship-mapping.json
- **Check:** Cross-reference skill-registry.json with relationship-mapping.json
- **Action:** 🔴 HOLD - Add relationship or remove skill
- **Example Detection:**
  ```javascript
  skills_in_registry = skill-registry.json.skills[]
  skills_in_relationships = relationship-mapping.json.skills_to_mcps.keys()
  orphaned = skills_in_registry - skills_in_relationships
  ```

**Pattern: "Broken MCP Reference"**
- **Signal:** Skill claims to use MCP that doesn't exist
- **Check:** Verify all "existing" MCPs in relationships actually exist in MCP-SERVERS/
- **Action:** 🔴 HOLD - Fix reference or build MCP
- **Example Detection:**
  ```javascript
  for skill in relationships:
    for mcp in skill.existing:
      if not exists(MCP-SERVERS/${mcp}-mcp/):
        flag_broken_reference(skill, mcp)
  ```

**Pattern: "Stale Planned MCP"**
- **Signal:** MCP listed as "planned" but already exists
- **Check:** Compare "planned" list with actual MCP-SERVERS/ contents
- **Action:** 🟡 REVIEW - Move from planned to existing
- **Example Detection:**
  ```javascript
  for skill in relationships:
    for mcp in skill.planned:
      if exists(MCP-SERVERS/${mcp}-mcp/):
        flag_stale_plan(skill, mcp)
  ```

**Pattern: "Undocumented MCP"**
- **Signal:** MCP exists but not referenced by any skill
- **Check:** Reverse lookup - which skills use this MCP?
- **Action:** 🟡 REVIEW - Add to skill or document reason
- **Example Detection:**
  ```javascript
  mcps_in_folder = list(MCP-SERVERS/*/`)
  mcps_in_relationships = flatten(all skills.existing + skills.planned)
  undocumented = mcps_in_folder - mcps_in_relationships
  ```

### 3. File Update Consistency Patterns

**Pattern: "Registry Drift"**
- **Signal:** Skill count in README ≠ skill-registry.json ≠ registry.json
- **Check:** Compare skill counts across all files
- **Files to Check:**
  - README.md: "X Specialized Skills"
  - BUILD_FOCUS.md: "Current: X skills"
  - META/skill-registry.json: skills.length
  - META/registry.json: skills.length
  - DOCS/INDEX.md: "explore X specialized AI agent skills"
  - DOCS/MCP-DEVELOPMENT-ROADMAP.md: "Current: X skills"
- **Action:** 🔴 HOLD - Synchronize all counts
- **Example Detection:**
  ```javascript
  counts = {
    readme: extract_count(README.md, "Specialized Skills"),
    build_focus: extract_count(BUILD_FOCUS.md, "skills :"),
    skill_registry: skill-registry.json.skills.length,
    main_registry: registry.json.skills.length,
    docs_index: extract_count(DOCS/INDEX.md, "explore"),
    roadmap: extract_count(DOCS/MCP-DEVELOPMENT-ROADMAP.md, "skills,")
  }
  if len(set(counts.values())) > 1:
    flag_registry_drift(counts)
  ```

**Pattern: "Version Mismatch"**
- **Signal:** Version numbers inconsistent across files
- **Check:** Compare versions in package.json, README, registries
- **Files to Check:**
  - README.md: "Version X.X.X"
  - META/skill-registry.json: version
  - META/registry.json: version
  - package.json: version
- **Action:** 🟡 REVIEW - Synchronize versions

**Pattern: "Stale Last Updated Date"**
- **Signal:** File modified but "Last Updated" not changed
- **Check:** Compare git last-modified with embedded dates
- **Action:** 🟢 OBSERVE - Update dates for clarity

### 4. Automation Gap Patterns

**Pattern: "Manual Update Required"**
- **Signal:** Change made but related files not updated
- **Check:** When X changes, Y should also change
- **Action:** 🔴 HOLD - Create automation or document process
- **Examples:**
  - New skill added → 8 files should update
  - New MCP added → 6 files should update
  - Skill-MCP relationship created → 2 files should update

**Pattern: "Missing Test Coverage"**
- **Signal:** Registry validation tests don't cover new patterns
- **Check:** Are new patterns tested in tests/unit/?
- **Action:** 🟡 REVIEW - Add test coverage

**Pattern: "Undocumented Convention"**
- **Signal:** Pattern exists but not documented in CONTRIBUTING.md
- **Check:** Compare actual practices with documented guidelines
- **Action:** 🟢 OBSERVE - Document implicit conventions

---

## 🔗 Updated Relationship Mappings

### Dark Matter's Relationships

**Should be related to:**

**Analysis & Quality Skills:**
- `quality-auditor` - Technical quality after organizational health
- `testing-strategist` - Test strategy informed by patterns
- `technical-debt-assessor` - Prioritize debt based on coherence

**Product & Strategy Skills:**
- `product-strategist` - Strategic alignment checks
- `mvp-builder` - Ensure execution-driven development
- `deployment-advisor` - Deployment readiness assessment

**Meta-Level Monitoring:**
- Should analyze BUILD_FOCUS itself
- Should validate registry integrity
- Should check relationship consistency

### Update Relationship Mapping

```json
{
  "dark-matter-analyzer": {
    "existing": ["dark-matter-analyzer"],
    "planned": []
  },
  "quality-auditor": {
    "existing": ["screenshot-testing", "accessibility-checker"],
    "planned": [],
    "complements": ["dark-matter-analyzer"]
  }
}
```

Add new section:
```json
{
  "meta_analysis_flow": {
    "dark-matter-analyzer": {
      "analyzes": ["entire_repository"],
      "checks": [
        "BUILD_FOCUS_adherence",
        "relationship_integrity",
        "automation_gaps",
        "registry_consistency"
      ],
      "triggers": [
        "after_major_change",
        "weekly_health_check",
        "pre_release",
        "user_discovered_gap"
      ],
      "informs": [
        "quality-auditor",
        "product-strategist",
        "mvp-builder"
      ]
    }
  }
}
```

---

## 🤖 Automation Recommendations

### Level 1: Immediate Automation (High Value, Low Complexity)

**1. Registry Count Validator**
- **Tool:** Pre-commit hook or CI check
- **Function:** Validate skill/MCP counts match across all files
- **Files:** README, BUILD_FOCUS, registries, DOCS/INDEX
- **Action:** Block commit if mismatch detected

**2. Relationship Integrity Checker**
- **Tool:** CI test
- **Function:** Validate skills reference existing MCPs
- **Files:** relationship-mapping.json, MCP-SERVERS/
- **Action:** Fail build if broken references

**3. Dark Matter Weekly Report**
- **Tool:** GitHub Actions scheduled workflow
- **Function:** Run dark-matter-analyzer-mcp on ai-dev-standards
- **Schedule:** Every Friday
- **Output:** Create issue with RCI score and patterns

### Level 2: Medium Priority (High Value, Medium Complexity)

**4. Auto-Update Cascade**
- **Tool:** Script triggered on skill/MCP addition
- **Function:** Automatically update all related files
- **Trigger:** When skill-registry.json changes
- **Updates:** README, BUILD_FOCUS, DOCS/INDEX, relationship-mapping

**5. Version Synchronizer**
- **Tool:** Release preparation script
- **Function:** Synchronize versions across all files
- **Files:** All version fields
- **Action:** Update and create version changelog

**6. Relationship Graph Visualizer**
- **Tool:** Script to generate visual dependency graph
- **Function:** Show skill→MCP→component relationships
- **Output:** Mermaid diagram in DOCS/

### Level 3: Advanced Automation (High Value, High Complexity)

**7. Self-Healing Registry**
- **Tool:** Automated PR creator
- **Function:** Detect inconsistencies and create fix PRs
- **Process:** Run dark-matter → detect gaps → generate fixes
- **Review:** Require human approval

**8. BUILD_FOCUS Enforcer**
- **Tool:** Pre-commit hook with exceptions
- **Function:** Block new skills if ratio > target
- **Override:** Require explanation in commit message
- **Log:** Track moratorium violations

**9. Meta-Analysis Dashboard**
- **Tool:** Web portal showing repository health
- **Metrics:** RCI score, relationship graph, automation coverage
- **Updates:** Real-time or on push
- **Access:** Public or private portal

---

## 📋 Proposed Workflow Integration

### When Adding New Skill

**Current Manual Process:**
1. Create skill files (SKILL.md, README.md)
2. Update skill-registry.json
3. Update registry.json
4. Update relationship-mapping.json
5. Update BUILD_FOCUS.md
6. Update README.md
7. Update DOCS/INDEX.md
8. Update .claude/claude.md
9. Update MCP-DEVELOPMENT-ROADMAP.md (if applicable)

**With Dark Matter Integration:**
1. Create skill files (SKILL.md, README.md)
2. Run `npm run add-skill [skill-name]` (automation)
   - Updates all registries
   - Creates relationship stub
   - Updates all documentation
   - Validates consistency
3. **Run dark-matter quick-check** (validation)
   - Checks all files updated
   - Verifies BUILD_FOCUS compliance
   - Reports any gaps
4. Review dark-matter report
5. Fix any flagged issues
6. Commit (pre-commit hook re-validates)

**Dark Matter Check Points:**
- ✅ After step 2: "Are all files updated?"
- ✅ Before step 6: "Is BUILD_FOCUS followed?"
- ✅ Post-commit: "Is repository coherent?"

### When Adding New MCP

**With Dark Matter Integration:**
1. Create MCP files (src/, package.json, etc.)
2. Run `npm run add-mcp [mcp-name] [enables-skill]`
3. **Run dark-matter quick-check**
   - Verifies skill exists
   - Checks relationship bidirectional
   - Validates MCP count updated everywhere
4. Review and fix gaps
5. Commit

### Periodic Health Checks

**Weekly (Automated):**
```bash
# GitHub Actions: Every Friday
npm run dark-matter:weekly
# Output: Creates issue with RCI and patterns
# Action: Review and address HOLD/REVIEW items
```

**Monthly (Manual):**
```bash
npm run dark-matter:deep
# Output: Comprehensive report
# Action: Strategic review and planning
```

**Pre-Release (Manual):**
```bash
npm run dark-matter:release-check
# Output: Release readiness report
# Action: Fix all HOLD items before release
```

---

## 🎯 Implementation Priority

### Phase 1: Foundation (Week 1)
1. ✅ Create dark-matter-analyzer skill
2. ✅ Create dark-matter-analyzer-mcp
3. 📋 Add meta-analysis patterns to MCP
4. 📋 Create relationship integrity checks

### Phase 2: Automation (Week 2-3)
1. Registry count validator (CI)
2. Relationship integrity checker (CI)
3. Dark Matter weekly report (GitHub Actions)
4. Documentation for using dark-matter on ai-dev-standards

### Phase 3: Self-Healing (Week 4-6)
1. Auto-update cascade script
2. Version synchronizer
3. BUILD_FOCUS enforcer hook
4. Self-healing registry (automated PRs)

### Phase 4: Visualization (Week 7-8)
1. Relationship graph generator
2. Meta-analysis dashboard
3. Real-time coherence monitoring

---

## 🔍 Example: Dark Matter Analyzing ai-dev-standards

**Command:**
```bash
npm run dark-matter:self-check
```

**Expected Output:**
```markdown
# Dark Matter Analysis - ai-dev-standards

**RCI Score:** 87/100 — COHERENT

## Patterns Detected

### ✅ BUILD_FOCUS Adherence (Excellent)
- Current ratio: 5.4:1 (Target: <6:1) ✅
- Documentation: 21 files (Target: 15) 🟡 Needs work
- MCP development: On track

### ✅ Relationship Integrity (Excellent)
- All skills have relationship mappings ✅
- All MCP references valid ✅
- No orphaned skills ✅

### 🟡 File Update Consistency (Minor Issues)
- Skill count mismatch: DOCS/INDEX.md shows 37, should be 38
- Last updated date: 3 files need updating

### 🟢 Automation Coverage (Good)
- Registry validation: Exists ✅
- CI checks: Active ✅
- Suggested: Add pre-commit hooks

## Recommendations

### 🟡 REVIEW
1. Update DOCS/INDEX.md skill count
2. Update last-modified dates
3. Consider consolidating to 15 docs (current: 21)

### 🟢 OBSERVE
1. Monitor weekly build vs doc ratio
2. Continue MCP development pace
3. Maintain relationship integrity
```

---

## 📝 Documentation Updates Needed

Add to **CONTRIBUTING.md:**
- When to run dark-matter self-check
- How to interpret results
- Fix workflow for flagged issues

Add to **BUILD_FOCUS.md:**
- Dark matter monitoring schedule
- Escalation process for HOLD items
- Self-check before major changes

Add to **DOCS/guides/** (when created):
- Complete guide: "Using Dark Matter to Monitor Framework Health"
- Quick reference: "Dark Matter Self-Check Workflow"

---

## ✅ Summary

Dark Matter analyzer is **meta-level recursive** - it can:

1. **Monitor itself** - Check if ai-dev-standards follows its own principles
2. **Validate relationships** - Ensure skill-MCP-component links intact
3. **Detect automation gaps** - Identify manual processes that should be automated
4. **Enforce BUILD_FOCUS** - Flag violations of moratorium and ratio targets
5. **Self-heal** - Eventually create PRs to fix detected issues

**Next Steps:**
1. Add meta-analysis patterns to dark-matter-analyzer-mcp
2. Create CI checks for registry consistency
3. Set up weekly GitHub Actions workflow
4. Document self-check procedures
5. Build auto-update cascade script

This closes the loop: the framework can now **analyze itself** and **maintain its own health**.

---

*"The mirror must know when it is dreaming — and when the framework dreams, Dark Matter wakes it up."*
