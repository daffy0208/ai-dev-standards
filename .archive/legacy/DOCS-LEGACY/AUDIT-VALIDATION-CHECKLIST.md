# Quality Audit Validation Checklist

**Purpose:** Ensure quality audits are comprehensive and catch critical issues like resource discoverability gaps.

**When to use:** Every quality audit MUST complete this checklist BEFORE scoring.

**Time:** 10-15 minutes (mandatory)

---

## 🚨 Critical Failure: What Happened

**Previous Audit Result:** 8.6/10 (Excellent)

**What It Missed:**
- **81% of skills were invisible** (29 out of 36 skills not in registry)
- **CLI returned mock data** instead of real registry
- **README documented skills that weren't discoverable**

**Impact:** Projects couldn't access most available resources, defeating the entire purpose of the repository.

**Root Cause:** Audit didn't validate resource completeness and discoverability.

---

## ✅ Mandatory Pre-Audit Checks

**⚠️ If ANY of these fail, audit MUST score ≤6/10 overall**

### 1. Resource Completeness (CRITICAL)

**For repositories with registries (like ai-dev-standards):**

#### Skills
```bash
# Count skills in directory
SKILL_COUNT=$(ls -1 SKILLS/ | grep -v "_TEMPLATE" | wc -l)

# Count skills in registry
REGISTRY_COUNT=$(jq '.skills | length' META/registry.json)

# MUST match
if [ "$SKILL_COUNT" != "$REGISTRY_COUNT" ]; then
  echo "CRITICAL: $SKILL_COUNT skills exist but only $REGISTRY_COUNT registered"
  echo "$(($SKILL_COUNT - $REGISTRY_COUNT)) skills are INVISIBLE"
  exit 1
fi
```

- [ ] All skills in SKILLS/ directory are in META/registry.json
- [ ] Registry count matches directory count exactly
- [ ] Each registry entry has valid path, description, version

#### MCPs
- [ ] All MCPs in MCP-SERVERS/ are in registry
- [ ] Each MCP has required fields (name, path, description)
- [ ] No orphaned registry entries (registered but missing file)

#### Playbooks
- [ ] All playbooks in PLAYBOOKS/ are in registry
- [ ] Each playbook referenced in skills actually exists
- [ ] Cross-references are valid

#### Patterns
- [ ] All patterns in STANDARDS/ are in registry
- [ ] Decision framework references existing patterns
- [ ] Skills reference existing patterns

---

### 2. Skill-MCP Alignment (CRITICAL)

**⚠️ NEW CHECK - Critical gap identified 2025-10-22**

**Problem:** 36 skills (HOW to do things) but only 3 MCPs (tools to DO things) = 12:1 ratio

**Skills without tools are aspirational, not actionable.**

#### Check Ratio
```bash
# Count skills and MCPs
SKILL_COUNT=$(jq '.skills | length' META/registry.json)
MCP_COUNT=$(ls -1 MCP-SERVERS/ | grep -v "^_" | wc -l)

# Calculate ratio
RATIO=$((SKILL_COUNT / MCP_COUNT))

echo "Skills: $SKILL_COUNT"
echo "MCPs: $MCP_COUNT"
echo "Ratio: ${RATIO}:1"

# Yellow flag: >3:1
# Red flag: >5:1
if [ "$RATIO" -gt 5 ]; then
  echo "CRITICAL: Ratio ${RATIO}:1 means most skills are not actionable"
  echo "Need at least $((SKILL_COUNT / 3)) MCPs for reasonable coverage"
fi
```

#### Validation Checklist

- [ ] Skill-to-MCP ratio documented (current: 36:3 = 12:1)
- [ ] For each high-priority skill, corresponding MCP exists or is planned
- [ ] MCP development roadmap exists if ratio >3:1
- [ ] Skills without MCPs have justification (e.g., uses external tools)

#### High-Priority Skills That MUST Have MCPs

Core skills that need tools to be actionable:

- [ ] rag-implementer → vector-database-mcp, embedding-generator-mcp
- [ ] mvp-builder → feature-prioritizer-mcp, risk-analyzer-mcp
- [ ] product-strategist → interview-transcriber-mcp, user-insight-analyzer-mcp
- [ ] api-designer → openapi-generator-mcp, api-validator-mcp
- [ ] deployment-advisor → infra-provisioner-mcp, monitoring-setup-mcp
- [ ] performance-optimizer → performance-profiler-mcp, bundle-analyzer-mcp
- [ ] security-engineer → vulnerability-scanner-mcp, dependency-auditor-mcp
- [ ] multi-agent-architect → agent-orchestrator-mcp, agent-monitor-mcp

#### Scoring Impact

**If Skill-MCP ratio >5:1:**
- Completeness dimension: Maximum 5/10
- Developer Experience: Maximum 6/10
- Overall score: Capped at 7/10
- Status: "Aspirational but not fully actionable"

**Why this is critical:**
- Skills describe HOW but don't provide tools to DO
- AI can advise but can't execute
- Users must manually implement everything
- Defeats purpose of automation

**See:** `DOCS/SKILL-MCP-GAP-ANALYSIS.md` for complete analysis and roadmap

---

### 3. CLI/Tool Integration (CRITICAL)

- [ ] CLI commands read from registry (not mock/hardcoded data)
- [ ] No "TODO: Fetch from actual repo" in CLI code
- [ ] Bootstrap/sync scripts reference registry.json
- [ ] Update commands return all resources, not subset

**Check with:**
```bash
# Search for TODO comments indicating mock data
grep -r "TODO: Fetch from" CLI/commands/

# Check if CLI reads registry
grep -r "registry.json\|META/registry" CLI/commands/

# Look for hardcoded resource lists
grep -A5 "fetchAvailableSkills\|fetchAvailableMcps" CLI/commands/
```

---

### 4. Documentation Accuracy (CRITICAL)

- [ ] README only documents resources in registry
- [ ] No mentions of unavailable skills/MCPs/playbooks
- [ ] Examples reference existing resources
- [ ] Links point to valid files

**Check with:**
```bash
# Extract skill mentions from README
grep -oE '[a-z]+-[a-z]+(-[a-z]+)*' README.md | sort -u

# Compare against registry
jq '.skills[].name' META/registry.json | sort
```

---

### 5. Cross-Reference Validity (IMPORTANT)

- [ ] Skills referencing other skills → referenced skills exist
- [ ] Playbooks referencing skills → those skills exist
- [ ] Patterns referencing integrations → those integrations exist
- [ ] Decision framework references → valid paths

---

### 6. Automated Validation (CRITICAL)

- [ ] `npm run test:registry` exists and passes
- [ ] CI/CD includes registry validation job
- [ ] Tests would catch missing resources
- [ ] Tests would catch orphaned registry entries

**Required tests:**
```typescript
// tests/registry-validation.test.ts

it('should register ALL skills from SKILLS directory')
it('should have valid skill entries with all required fields')
it('should register ALL MCPs from MCP-SERVERS directory')
it('should only document skills that exist in registry')
it('should ensure CLI reads from registry, not mock data')
it('should have skills reference each other correctly')
```

---

## 📋 Dimension-Specific Validation

### 1. Code Quality (1-10)

**Additional Checks:**
- [ ] No hardcoded data that should come from config/registry
- [ ] Dynamic loading from registry vs static imports
- [ ] Resource paths constructed dynamically

**Common Issues:**
- Hardcoded skill lists in multiple places (sync.js, update.js, etc.)
- Mock data used for "quick testing" never removed
- Static arrays instead of reading from files

---

### 2. Architecture (1-10)

**Additional Checks:**
- [ ] Single source of truth for resources (registry)
- [ ] No duplicate resource definitions
- [ ] Clear data flow: files → registry → consumers

**Red Flags:**
- Resources defined in multiple places
- No central registry
- Each consumer maintains own list

---

### 3. Documentation (1-10)

**Additional Checks:**
- [ ] README accuracy validated against reality
- [ ] No documentation for non-existent features
- [ ] Examples use resources that exist

**This dimension should have caught:**
- README mentions "product-strategist" → Not in registry → Score -2
- README mentions "api-designer" → Not in registry → Score -2
- "12 skills available" but only 7 discoverable → Score -3

---

### 4. Testing (1-10)

**Additional Checks:**
- [ ] Tests validate registry completeness
- [ ] Tests catch missing resources
- [ ] Tests verify CLI data sources
- [ ] Tests check cross-references

**This dimension should have caught:**
- No tests for registry completeness → Score -5
- No tests verifying CLI reads registry → Score -2
- No integration tests for discovery → Score -2

---

### 5. CI/CD (1-10)

**Additional Checks:**
- [ ] CI validates registry on every PR
- [ ] Build fails if resources missing
- [ ] Automated checks prevent regression

**This dimension should have caught:**
- No CI validation of registry → Score -3
- Can merge PR with incomplete registry → Score -2
- No automated discovery checks → Score -3

---

### 6. Developer Experience (1-10)

**Additional Checks:**
- [ ] Developers can discover all resources
- [ ] Clear error messages when resource missing
- [ ] Tools help maintain registry completeness

**This dimension should have caught:**
- 81% of skills invisible → Score -6
- CLI returns 3 skills instead of 36 → Score -2
- No tooling to maintain registry → Score -1

---

## 🎯 Scoring Impact

### Resource Discovery Dimension (NEW)

**Add this as a new dimension or critical factor:**

- **10/10** - All resources discoverable, automated validation, CI checks
- **8/10** - All resources discoverable, manual validation only
- **6/10** - >90% resources discoverable, some gaps
- **4/10** - >75% resources discoverable, significant gaps
- **2/10** - >50% resources discoverable, major gaps
- **0/10** - <50% resources discoverable (like 19% in our case)

### Overall Score Impact

**If Resource Discovery scores <5/10:**
- Overall score MUST be capped at 6/10 maximum
- Audit must flag as "CRITICAL ISSUE - NOT PRODUCTION READY"
- Must include remediation plan

**Why this cap?**
If users can't discover resources, nothing else matters. A repository with excellent code quality but 81% invisible resources is NOT "8.6/10 Excellent" - it's fundamentally broken.

---

## 📊 Audit Report Template Updates

### Required Section: Resource Discovery

**Every audit must include:**

```markdown
## Resource Discovery Validation

### Registry Completeness
- Skills: X in directory, Y in registry (Match: ✅/❌)
- MCPs: X in directory, Y in registry (Match: ✅/❌)
- Playbooks: X in directory, Y in registry (Match: ✅/❌)
- Patterns: X in directory, Y in registry (Match: ✅/❌)

### CLI Integration
- CLI reads from registry: ✅/❌
- No mock data: ✅/❌
- Bootstrap references registry: ✅/❌

### Documentation Accuracy
- README documents only available resources: ✅/❌
- No dead references: ✅/❌
- Examples use valid resources: ✅/❌

### Cross-References
- Skill references valid: ✅/❌
- Playbook references valid: ✅/❌
- Pattern references valid: ✅/❌

### Automated Validation
- Registry tests exist: ✅/❌
- CI validates registry: ✅/❌
- Tests would catch issues: ✅/❌

### Score: X/10
### Critical Issues: [List any failures]
```

---

## 🚦 Audit Decision Tree

```
Start Audit
│
├─ Run `npm run test:registry`
│  │
│  ├─ Tests pass? → Continue audit
│  │
│  └─ Tests fail OR don't exist?
│     │
│     ├─ Manual validation
│     │  │
│     │  ├─ All resources discoverable? → Continue with warning
│     │  │
│     │  └─ Resources missing?
│     │     │
│     │     ├─ <10% missing → Score reduction, continue
│     │     │
│     │     ├─ 10-50% missing → Cap score at 7/10
│     │     │
│     │     └─ >50% missing → Cap score at 6/10, flag CRITICAL
│
└─ Continue with standard 12-dimension evaluation
```

---

## ✅ Post-Audit Validation

**Before publishing audit report:**

1. **Verify findings are actionable**
   - [ ] Specific issues identified (not vague)
   - [ ] Steps to reproduce provided
   - [ ] Remediation guidance included

2. **Check for missed critical issues**
   - [ ] Re-run automated tests
   - [ ] Verify CLI behavior
   - [ ] Test resource discovery manually

3. **Validate scores are justified**
   - [ ] Examples provided for each score
   - [ ] Comparisons to industry standards
   - [ ] Both strengths and weaknesses noted

4. **Ensure no false positives**
   - [ ] Claims verified against reality
   - [ ] No assumptions without evidence
   - [ ] Edge cases tested

---

## 🎓 Lessons Learned

### What Went Wrong

1. **Audit trusted high-level documentation** without verifying underlying systems
2. **Didn't validate discovery mechanisms** - assumed if files exist, they're accessible
3. **No automated validation** - relied on manual checks that missed gaps
4. **Didn't test CLI tools** - assumed they worked as documented
5. **No cross-reference checking** - didn't verify links and references

### How to Prevent

1. **Always run automated tests first** - `npm run test:registry`
2. **Verify discovery mechanisms** - Can users actually find resources?
3. **Test CLI tools** - Do they return correct data?
4. **Check cross-references** - Do all links work?
5. **Compare directories to registry** - Count must match
6. **Look for TODOs and mock data** - Signs of incomplete implementation

### Key Principle

**"Existence ≠ Discoverability"**

Just because a resource exists in the codebase doesn't mean users can find it. The audit must validate both:
- ✅ Resources exist
- ✅ Resources are discoverable

---

## 🔧 Remediation Template

**When audit finds resource discovery issues:**

```markdown
## CRITICAL: Resource Discovery Gap Found

### Issue
- X resources exist in directories
- Y resources in registry
- Z resources missing (((X-Y)/X * 100)% invisible)

### Impact
- Projects cannot discover Z resources
- CLI returns incomplete data
- Users miss out on available functionality

### Remediation Plan

1. **Immediate (Today)**
   - [ ] Run `npm run update-registry` to sync
   - [ ] Verify registry completeness
   - [ ] Test CLI returns all resources

2. **Short-term (This Week)**
   - [ ] Add automated registry tests
   - [ ] Add CI validation job
   - [ ] Update documentation

3. **Long-term (This Month)**
   - [ ] Implement git hooks for auto-sync
   - [ ] Add cross-reference validation
   - [ ] Create monitoring dashboard

### Verification
After fixes:
- [ ] `npm run test:registry` passes
- [ ] CI includes registry validation
- [ ] Manual count matches registry count
- [ ] CLI returns all resources
```

---

## 📚 Related Resources

- **Registry validation tests:** `tests/registry-validation.test.ts`
- **Update registry script:** `scripts/update-registry.js`
- **CI validation:** `.github/workflows/ci.yml` (registry-validation job)
- **Quality auditor skill:** `SKILLS/quality-auditor/SKILL.md` (Phase 0)

---

## 🎯 Success Criteria

**A quality audit is complete and trustworthy when:**

1. ✅ All resource discovery checks passed
2. ✅ Automated tests run and verified
3. ✅ CLI tools tested and validated
4. ✅ Cross-references checked
5. ✅ Documentation accuracy verified
6. ✅ Scores justified with examples
7. ✅ Critical issues would have been caught

**Remember:** An audit that gives high scores but misses 81% invisible resources is worse than no audit - it creates false confidence.

---

**Use this checklist every time. Trust but verify.**
