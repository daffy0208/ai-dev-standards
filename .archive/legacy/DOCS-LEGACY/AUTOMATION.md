# Automation System

**Last Updated:** 2025-10-23
**Status:** ✅ **ACTIVE** - Complete automation chain implemented

---

## 🎯 Philosophy

**You should NEVER manually update registry or documentation files.**

The automation system ensures:

- ✅ Single source of truth (`SKILLS/` and `MCP-SERVERS/` folders)
- ✅ All files stay synchronized automatically
- ✅ Validation blocks broken commits
- ✅ Clear error messages guide fixes
- ✅ Zero manual bookkeeping

---

## 🚀 Quick Reference

| Task                    | Command                | What It Does                                |
| ----------------------- | ---------------------- | ------------------------------------------- |
| **Validate everything** | `npm run validate`     | Checks all counts and consistency           |
| **Fix all issues**      | `npm run sync`         | Fixes registries + updates docs + validates |
| **Update docs only**    | `npm run update:all`   | Updates README, BUILD_FOCUS, etc.           |
| **Fix registries**      | `npm run validate:fix` | Syncs registries + updates docs             |

---

## 📋 Complete Automation Chain

### Adding a New Skill

**DO THIS:**

```bash
# 1. Create the skill folder
mkdir SKILLS/my-new-skill
cd SKILLS/my-new-skill

# 2. Create SKILL.md with frontmatter
cat > SKILL.md << 'EOF'
---
name: my-new-skill
description: Brief description
version: 1.0.0
category: technical
triggers:
  - trigger1
  - trigger2
---
# My New Skill
...
EOF

# 3. Run sync to update everything
cd ../..
npm run sync
```

**What happens automatically:**

```
npm run sync
  ├─ Runs fix-skill-registry.cjs
  │  ├─ Scans SKILLS/ folder
  │  ├─ Extracts metadata from SKILL.md
  │  ├─ Updates META/skill-registry.json
  │  └─ Updates META/registry.json
  │
  ├─ Runs update-all-files.cjs
  │  ├─ Updates README.md (skill count)
  │  ├─ Updates BUILD_FOCUS.md (skill count, ratio)
  │  ├─ Updates DOCS/INDEX.md (skill count)
  │  └─ Updates DOCS/MCP-DEVELOPMENT-ROADMAP.md
  │
  └─ Runs validate-all.cjs
     ├─ Verifies all counts match
     ├─ Checks for orphaned skills
     └─ Exits with error if issues found
```

**DON'T DO THIS:**

```bash
# ❌ NEVER manually edit these files:
META/skill-registry.json  # Auto-generated
META/registry.json        # Auto-generated
README.md                 # Auto-updated counts
BUILD_FOCUS.md            # Auto-updated counts
DOCS/INDEX.md             # Auto-updated counts
```

---

### Adding a New MCP

**DO THIS:**

```bash
# 1. Create MCP folder
mkdir MCP-SERVERS/my-mcp
cd MCP-SERVERS/my-mcp

# 2. Create package.json and src/
# ... (create your MCP)

# 3. Run sync
cd ../..
npm run sync
```

**What happens automatically:**

- Scans MCP-SERVERS/ folder
- Updates META/registry.json (MCP entry)
- Updates all documentation with new MCP count
- Recalculates skill:MCP ratio
- Updates BUILD_FOCUS progress

---

### Editing an Existing Skill

**DO THIS:**

```bash
# 1. Edit the SKILL.md file
vim SKILLS/existing-skill/SKILL.md

# 2. Update metadata if changed
# (change description, triggers, etc.)

# 3. Run sync to propagate changes
npm run sync
```

**What happens automatically:**

- Re-extracts metadata from SKILL.md
- Updates registries if metadata changed
- Validates consistency

---

## 🔍 Validation System

### What Gets Validated

The `validate-all.cjs` script checks:

**1. Registry Consistency**

- ✅ skill-registry.json count == SKILLS/ folder count
- ✅ registry.json count == SKILLS/ folder count
- ✅ registry.json MCP count == MCP-SERVERS/ folder count
- ✅ No skills in registries that don't have folders
- ✅ No folders missing from registries

**2. Metadata Completeness**

- ✅ All skills have triggers defined
- ⚠️ All skills should have relationship mapping (warns if missing)

**3. Documentation Consistency**

- ✅ README.md skill count matches reality
- ✅ README.md MCP count matches reality
- ✅ BUILD_FOCUS.md counts match
- ✅ DOCS/INDEX.md counts match
- ✅ DOCS/MCP-DEVELOPMENT-ROADMAP.md counts match

**4. Configuration**

- ⚠️ .claude/claude.md should document all skills

### Exit Codes

```bash
npm run validate

# Exit 0 = All validations passed ✅
# Exit 1 = Errors found (commit blocked) ❌
```

---

## 🛡️ Pre-Commit Hook

**Location:** `.githooks/pre-commit`

**What it does:**

```bash
git commit -m "Add new skill"
  ↓
[pre-commit hook runs]
  ↓
npm run validate
  ↓
IF validation passes → Commit succeeds
IF validation fails  → Commit blocked with error message
```

**Enable the hook:**

```bash
git config core.hooksPath .githooks
```

**Bypass (NOT RECOMMENDED):**

```bash
git commit --no-verify
```

---

## 🔧 Scripts Reference

### `npm run validate`

**Purpose:** Check if everything is consistent

**What it checks:**

- Skill counts match across all files
- MCP counts match across all files
- All skills have registries
- All registries have skills
- Triggers are defined
- Relationships exist (warns if missing)

**Exit codes:**

- 0 = All good
- 1 = Errors found

**Example output:**

```
✅ skill-registry.json count matches (37)
✅ registry.json skill count matches (37)
✅ registry.json MCP count matches (7)
✅ README.md skill count correct (37)
⚠️  25 skills without relationship mapping
✅ Checks passed: 14
⚠️  Warnings: 1
❌ Errors: 0
```

---

### `npm run validate:fix`

**Purpose:** Fix registry issues and update docs

**What it does:**

1. Scans SKILLS/ and MCP-SERVERS/ folders
2. Syncs skill-registry.json
3. Syncs registry.json
4. Updates all documentation files
5. Does NOT validate (use `npm run sync` for that)

**When to use:**

- After adding/removing skills
- After adding/removing MCPs
- When counts are out of sync

---

### `npm run update:all`

**Purpose:** Update documentation files from registries

**What it updates:**

- README.md (counts, ratios)
- BUILD_FOCUS.md (counts, ratios)
- DOCS/INDEX.md (counts)
- DOCS/MCP-DEVELOPMENT-ROADMAP.md (counts, percentages)

**When to use:**

- When registries are correct but docs are stale
- After manual registry edits (not recommended!)

---

### `npm run sync`

**Purpose:** Complete fix and validation (RECOMMENDED)

**What it does:**

```
npm run sync
  = npm run validate:fix && npm run validate
```

1. Fixes all registries
2. Updates all docs
3. Validates everything
4. Exits with error if validation fails

**When to use:**

- **Always** - This is the main command
- After adding/editing skills or MCPs
- When validation fails
- Before committing

---

## 📊 Single Source of Truth

```
FILESYSTEM = Source of Truth
  ↓
SKILLS/ folder → skill-registry.json → registry.json
MCP-SERVERS/ folder → registry.json
  ↓
REGISTRIES = Derived Truth
  ↓
README.md, BUILD_FOCUS.md, DOCS/INDEX.md = Documentation
```

**Never edit derived files manually!**

---

## 🚨 Common Scenarios

### Scenario: Validation Fails on Commit

```bash
git commit -m "Add new feature"
❌ PRE-COMMIT VALIDATION FAILED
```

**Fix:**

```bash
npm run sync
git add -A
git commit -m "Add new feature"
```

---

### Scenario: Added Skill But Forgot to Update

```bash
# You created SKILLS/new-skill/ manually
# But registries are out of date
```

**Fix:**

```bash
npm run sync
# Everything auto-updates
```

---

### Scenario: Counts Don't Match

```bash
npm run validate
❌ README.md shows 36 skills, but actual is 37
```

**Fix:**

```bash
npm run update:all
npm run validate
✅ All validations passed
```

---

### Scenario: Relationship Mapping Warning

```bash
npm run validate
⚠️  25 skills without relationship mapping
```

**This is OK (for now):**

- System still works
- Warning reminds you to add relationships
- Not blocking (warnings don't prevent commits)

**To fix eventually:**

- Add relationship stubs to META/relationship-mapping.json
- See [AUTOMATION-STATUS-REPORT.md](./AUTOMATION-STATUS-REPORT.md)

---

## 🎓 Best Practices

### DO ✅

1. **Run `npm run sync` after any changes**
2. **Commit often with validation**
3. **Trust the automation**
4. **Let pre-commit hooks work**
5. **Read error messages** (they're designed to be helpful)

### DON'T ❌

1. **Never manually edit registry files**
2. **Never manually edit count numbers in docs**
3. **Don't bypass pre-commit without good reason**
4. **Don't commit if validation fails**
5. **Don't manually track skill/MCP counts**

---

## 🔮 Future Automation

**Coming Soon:**

- `npm run add-skill [name]` - Creates full skill structure
- `npm run add-mcp [name] [enables-skill]` - Creates MCP with links
- Automatic relationship stub generation
- Gap detection and recommendations
- Self-check on schedule (GitHub Actions)

See [AUTOMATION-STATUS-REPORT.md](./AUTOMATION-STATUS-REPORT.md) for details.

---

## 🐛 Troubleshooting

### Validation keeps failing

```bash
# 1. Check what's wrong
npm run validate

# 2. Fix everything
npm run sync

# 3. If still failing, check for:
# - Extra folders in SKILLS/ that shouldn't be there
# - Missing SKILL.md files
# - Corrupt JSON in registries
```

### Hooks not working

```bash
# Enable hooks
git config core.hooksPath .githooks

# Make hook executable
chmod +x .githooks/pre-commit
```

### Want to bypass validation (emergency)

```bash
# Use with caution!
git commit --no-verify -m "Emergency fix"
```

---

## 📞 Support

If automation isn't working:

1. Check [AUTOMATION-CHAIN-ANALYSIS.md](./AUTOMATION-CHAIN-ANALYSIS.md) for deep dive
2. Run `npm run validate` to see specific errors
3. Check this file for solutions
4. File an issue with validation output

---

**Remember:** The automation exists so you never have to manually verify counts again. Trust it!
