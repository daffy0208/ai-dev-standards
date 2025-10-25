# MANDATORY Update Checklist

**⚠️ NON-NEGOTIABLE: This checklist MUST be completed before ANY commit that adds/removes/modifies skills or MCPs.**

---

## When This Applies

Run this checklist if you:
- ✅ Added a new skill
- ✅ Added a new MCP
- ✅ Removed a skill or MCP
- ✅ Modified skill/MCP relationships

---

## The Checklist

### 1. Registry Updates ✅

- [ ] **META/skill-registry.json** - Added/updated skill entry with all fields
- [ ] **META/mcp-registry.json** - Added/updated MCP entry with all fields
- [ ] **META/relationship-mapping.json** - Updated `skills` section
- [ ] **META/relationship-mapping.json** - Updated `mcps` section
- [ ] **META/relationship-mapping.json** - Updated `statistics` section

### 2. Core Documentation ✅

- [ ] **.claude/CLAUDE.md** - Added skill to list (alphabetical order)
- [ ] **README.md** - Updated statistics (line 9-26)
- [ ] **.cursorrules** - Updated 4 locations:
  - Line 8-9: Key Components
  - Line 19: Coverage stats
  - Line 306-307: Registry descriptions
  - Line 378-380: Resource Statistics

### 3. Installation Documentation ✅

- [ ] **INSTALL.md** - Updated 2 locations:
  - Line 18: "Gives you X resources"
  - Lines 29-35: Resource breakdown
- [ ] **SETUP.txt** - Updated 3 lines:
  - Line 20: "• X skills"
  - Line 21: "• X MCP servers"
  - Line 22: "• X total resources"

### 4. Quick Start Guide ✅

- [ ] **DOCS/QUICK-START.md** - Updated 8 locations:
  - Lines 62-64: Sync output
  - Lines 91-93: Setup complete message
  - Line 130: "Expected: Claude lists all X skills"
  - Line 376: "All X skills available:"
  - Lines 561-562: Final summary

### 5. Templates (5 files) ✅

- [ ] **TEMPLATES/cursorrules-ai-rag.md** - Lines 28-29
- [ ] **TEMPLATES/cursorrules-existing-project.md** - Lines 43-44
- [ ] **TEMPLATES/cursorrules-minimal.md** - Lines 21-22
- [ ] **TEMPLATES/cursorrules-quick-test.md** - Lines 22-23
- [ ] **TEMPLATES/cursorrules-saas.md** - Lines 24-25

### 6. Cross-References ✅

- [ ] **Related skills** in skill-registry.json (both directions)
- [ ] **Related MCPs** in mcp-registry.json
- [ ] **supports_skills** field in MCP entry
- [ ] **required_mcps** field in skill entry

### 7. Skill/MCP Files ✅

- [ ] **SKILLS/{name}/SKILL.md** - Complete implementation guide
- [ ] **SKILLS/{name}/README.md** - Overview and quick start
- [ ] **MCP-SERVERS/{name}/src/index.ts** - Full implementation (if creating MCP)
- [ ] **MCP-SERVERS/{name}/README.md** - Tool documentation (if creating MCP)
- [ ] **MCP-SERVERS/{name}/package.json** - Dependencies (if creating MCP)
- [ ] **MCP-SERVERS/{name}/tsconfig.json** - TypeScript config (if creating MCP)

---

## Validation (AUTOMATED)

Before committing, run:

```bash
bash scripts/validate-sync.sh
```

This script will:
- ✅ Extract counts from registries
- ✅ Check all 14 critical files
- ✅ Verify relationship mapping is correct
- 🚫 **BLOCK your commit if anything is wrong**

**If validation fails:**
1. Read the error messages carefully
2. Update the files mentioned
3. Run validation again
4. Repeat until validation passes

---

## Git Pre-Commit Hook (OPTIONAL but RECOMMENDED)

To automatically run validation before every commit:

```bash
# Create pre-commit hook
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
bash scripts/validate-sync.sh
EOF

# Make it executable
chmod +x .git/hooks/pre-commit
```

Now validation runs automatically before EVERY commit.

---

## Why This Matters

**Problem**: Documentation falls out of sync → users get wrong information → trust erodes

**Solution**: Systematic updates + automated validation → guaranteed accuracy → maintained trust

**The Rule**: If validation fails, the commit is BLOCKED. No exceptions.

---

## Example Workflow

```bash
# 1. Make changes (add skill, MCP, etc.)
vim SKILLS/my-new-skill/SKILL.md

# 2. Update ALL 14+ files per checklist above
vim META/skill-registry.json
vim .claude/CLAUDE.md
vim README.md
# ... (complete the checklist)

# 3. Run validation
bash scripts/validate-sync.sh

# 4. If validation passes
git add -A
git commit -m "feat: Add my-new-skill"

# 5. If validation fails
# Fix the errors mentioned
# Run validation again
# Repeat until it passes
```

---

## Files That MUST Be Updated (Complete List)

### Critical (14 files):
1. META/skill-registry.json
2. META/mcp-registry.json
3. META/relationship-mapping.json
4. .claude/CLAUDE.md
5. README.md
6. .cursorrules
7. INSTALL.md
8. SETUP.txt
9. DOCS/QUICK-START.md
10. TEMPLATES/cursorrules-ai-rag.md
11. TEMPLATES/cursorrules-existing-project.md
12. TEMPLATES/cursorrules-minimal.md
13. TEMPLATES/cursorrules-quick-test.md
14. TEMPLATES/cursorrules-saas.md

### If creating skill (2 files):
- SKILLS/{name}/SKILL.md
- SKILLS/{name}/README.md

### If creating MCP (4 files):
- MCP-SERVERS/{name}/src/index.ts
- MCP-SERVERS/{name}/README.md
- MCP-SERVERS/{name}/package.json
- MCP-SERVERS/{name}/tsconfig.json

**Total: Up to 20 files may need updates**

---

## Accountability

This checklist exists because:
1. **Manual processes fail** - humans forget
2. **Promises without enforcement fail** - good intentions aren't enough
3. **Automated validation works** - computers don't forget

The validation script has teeth. It will block your commit. This is intentional.

---

## Questions?

- **"Can I skip validation?"** - No. It's mandatory.
- **"What if validation is wrong?"** - Fix the validation script, don't skip it.
- **"This seems excessive."** - 20 files must stay in sync. Automation prevents mistakes.
- **"Can I update later?"** - No. Update before commit, not after.

---

**Last Updated**: 2025-10-25
**Enforcement**: scripts/validate-sync.sh
**Status**: MANDATORY ⚠️
