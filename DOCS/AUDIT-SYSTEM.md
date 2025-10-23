# Audit & Quality System

**Last Updated:** 2025-10-22
**Status:** ✅ Operational
**Next Review:** 2025-11-22

---

## Purpose

This document consolidates the audit and quality assurance system for ai-dev-standards. It provides:
1. **Validation checklist** for quality audits
2. **Current system status** and trust measures
3. **Testing procedures** for registry completeness

**Archived:** This replaces AUDIT-TRUST-RESTORATION.md, AUDIT-VALIDATION-CHECKLIST.md, and QUALITY-AUDIT-REPORT.md.

---

## ✅ Current System Status

### Registry Validation
- ✅ **100% resource discoverability** (all 36 skills + 3 MCPs tracked)
- ✅ **Automated validation** via tests/registry-validation.test.ts
- ✅ **CI/CD enforcement** blocks merges if validation fails
- ✅ **30/30 tests passing** (Phase 1 + Phase 2)

### Relationship Metadata (Phase 2)
- ✅ **3/3 MCPs** have `enables` field
- ✅ **18/36 skills** have `requires` field
- ✅ **9/9 components** have `dependencies` field
- ✅ **3/3 installers** have structured manifests

### Known Gaps
- ⚠️ **12:1 skill-to-MCP ratio** (36 skills, 3 MCPs) — See BUILD_FOCUS.md for resolution plan
- ⚠️ **18 skills lack relationship metadata** — Low priority (methodologies only)
- ⚠️ **CLI has TODOs** — Needs refactor to fetch from actual registry

---

## 🔍 Quality Audit Checklist

### Phase 0: Resource Discovery (MANDATORY)
**Before scoring anything, verify all resources are discoverable.**

```bash
# Run registry validation tests
npm run test:registry

# Check for gaps
grep -r "TODO\|FIXME" CLI/ --include="*.js"

# Verify counts match
cat META/registry.json | jq '{skills: (.skills | length), mcps: (.mcpServers | length)}'
```

**Pass Criteria:**
- [ ] All tests pass (30/30)
- [ ] Skills in registry = Skills in SKILLS/ directory
- [ ] MCPs in registry = MCPs in MCP-SERVERS/ directory
- [ ] No "TODO: Fetch from actual repo" in CLI code

### Phase 1: Registry Completeness
```bash
# Validate all categories are registered
node scripts/update-registry.js --dry-run

# Check for orphaned files
find SKILLS -type d ! -name "_TEMPLATE" | wc -l
cat META/registry.json | jq '.skills | length'
```

**Pass Criteria:**
- [ ] Directory count = Registry count for all categories
- [ ] No files missing from registry
- [ ] Registry lastUpdated is recent (<7 days)

### Phase 2: Relationship Validation
```bash
# Check MCPs have enables field
cat META/registry.json | jq '.mcpServers[] | select(.enables == null)'

# Check skills have requires field
cat META/registry.json | jq '.skills[] | select(.requires != null) | .name' | wc -l
```

**Pass Criteria:**
- [ ] All MCPs list skills they enable
- [ ] High-priority skills have relationship metadata
- [ ] Components declare dependencies

### Phase 3: Cross-Reference Validation
```bash
# Verify MCP enables reference existing skills
npm run test:registry | grep "enables reference"

# Check skill requires reference existing components
npm run test:registry | grep "requires reference"
```

**Pass Criteria:**
- [ ] MCP enables field only references real skills
- [ ] Skill requires field only references real components
- [ ] No broken references

---

## 🧪 Test Procedures

### Running Tests
```bash
# Full validation suite
npm run test:registry

# Watch mode during development
npm run test:watch tests/registry-validation.test.ts
```

### Test Coverage
- **24 Phase 1 tests:** Registry completeness
- **6 Phase 2 tests:** Relationship validation
- **Total:** 30 tests covering all resource types

### Adding New Tests
When adding new resource types:
1. Add category to META/registry.json
2. Add validation test in tests/registry-validation.test.ts
3. Update this checklist

---

## 🚨 Trust Measures

### What We Fixed (Oct 2025)
1. **81% invisible skills** → 100% discoverable
2. **CLI mock data** → Registry-based (partially complete)
3. **No relationship tracking** → Phase 2 metadata system
4. **No validation** → Comprehensive test suite + CI/CD

### Current Confidence Levels
- **Registry accuracy:** HIGH (automated validation)
- **Resource discovery:** HIGH (100% coverage)
- **Relationship integrity:** MEDIUM (18/36 skills mapped)
- **CLI reliability:** MEDIUM (has TODOs, needs refactor)
- **MCP coverage:** LOW (3/36 skills have tools)

---

## 📊 Quality Scoring Framework

### Scoring Dimensions (When Needed)
1. **Resource Discovery** (0-10) — Are all resources findable?
2. **Documentation** (0-10) — Is it clear and accurate?
3. **Validation** (0-10) — Are there tests?
4. **Relationships** (0-10) — Are dependencies clear?
5. **Completeness** (0-10) — Do features match docs?

**Overall Quality = Average of dimensions**

**Audit Rule:** If Resource Discovery < 5, cap overall score at 6/10.

---

## 🔧 Remediation Templates

### When Registry Validation Fails
```bash
# 1. Identify the gap
npm run test:registry

# 2. Check directory vs registry count
ls -d SKILLS/*/ | wc -l
cat META/registry.json | jq '.skills | length'

# 3. Add missing items to registry
# Edit META/registry.json

# 4. Update timestamp
node -e "const fs=require('fs'); const r=JSON.parse(fs.readFileSync('META/registry.json','utf8')); r.lastUpdated=new Date().toISOString(); fs.writeFileSync('META/registry.json', JSON.stringify(r,null,2));"

# 5. Re-run tests
npm run test:registry
```

### When Relationship Validation Fails
```bash
# Use helper scripts
node scripts/add-skill-requirements.js
node scripts/add-component-dependencies.js

# Or manually edit registry for specific entries
```

---

## 📅 Audit Schedule

- **Continuous:** CI/CD runs tests on every commit
- **Weekly:** Manual review of test results
- **Monthly:** Full quality audit with scoring
- **Quarterly:** External validation with real users

---

## 🎯 Success Criteria

**The audit system is successful when:**
1. Tests catch gaps before users do
2. Registry is always accurate (automated sync)
3. Relationship metadata enables discovery
4. External users can find what they need

**The audit system has failed when:**
1. User discovers resource that isn't in registry
2. Tests pass but system doesn't work
3. Documentation claims capabilities that don't exist

---

## 📚 Reference

**Key Files:**
- `META/registry.json` - Central source of truth
- `tests/registry-validation.test.ts` - Validation suite
- `META/relationship-mapping.json` - Dependency map
- `.github/workflows/ci.yml` - CI/CD enforcement

**Related Docs:**
- BUILD_FOCUS.md - Current execution priorities
- SKILL-MCP-GAP-ANALYSIS.md - Known gaps
- ECOSYSTEM-PARITY-ANALYSIS.md - System relationships

---

**Next Review:** 2025-11-22 (after MCP build sprint)
