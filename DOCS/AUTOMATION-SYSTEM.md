# Automation System Documentation

**Status:** ✅ Active  
**Last Updated:** 2025-11-10  
**Version:** 1.0.0

---

## Overview

The ai-dev-standards repository has a comprehensive automation system that ensures documentation and registry files are **always in sync** with the actual directory structure. Manual documentation updates are no longer needed or allowed.

## Problem Solved

**Before Automation:**

- Developers manually updated resource counts in documentation
- Registry files manually maintained
- Documentation frequently drifted out of sync
- 20% undercount (198 vs 239 resources)
- Multiple contradictory coverage metrics

**After Automation:**

- Documentation updates automatically on every commit
- Registry files auto-generated from directories
- Drift is impossible - automation enforces sync
- Single source of truth: directory structure
- Canonical counts maintained automatically

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  Directory Structure                     │
│   SKILLS/ MCPs/ TOOLS/ COMPONENTS/ INTEGRATIONS/        │
│              (Single Source of Truth)                    │
└─────────────────┬───────────────────────────────────────┘
                  │
                  │ generate:registries
                  ▼
┌─────────────────────────────────────────────────────────┐
│                 Registry Files (META/)                   │
│   skill-registry.json, mcp-registry.json, etc.          │
│        (Auto-generated, counts validated)                │
└─────────────────┬───────────────────────────────────────┘
                  │
                  │ generate:docs
                  ▼
┌─────────────────────────────────────────────────────────┐
│              Documentation Files                         │
│   README.md, INSTALL.md, etc. (AUTO-GEN markers)        │
│        (Auto-updated from registries)                    │
└─────────────────────────────────────────────────────────┘
```

---

## Components

### 1. Registry Generator (`scripts/generate-registries.ts`)

**Purpose:** Scan directories and regenerate all registry files.

**What it does:**

- Scans `SKILLS/` directory → generates `skill-registry.json`
- Scans `MCP-SERVERS/` directory → generates `mcp-registry.json`
- Counts tools, components, integrations
- Extracts metadata from SKILL.md, README.md, package.json
- Validates counts match arrays

**Command:** `npm run generate:registries`

**Output:**

- `META/skill-registry.json` (64 skills)
- `META/mcp-registry.json` (50 MCPs)
- Tool, component, integration counts validated

### 2. Documentation Generator (`scripts/generate-docs.ts`)

**Purpose:** Update all documentation from registry data.

**What it does:**

- Reads counts from registry files
- Finds AUTO-GEN markers in documentation
- Updates values between markers
- Adds markers if they don't exist
- Preserves surrounding content

**Marker Format:**

```markdown
**<!-- AUTO-GEN:START:skills -->64<!-- AUTO-GEN:END:skills --> Specialized Skills**
```

**Command:** `npm run generate:docs`

**Files Updated:**

- README.md
- INSTALL.md
- INTEGRATION-USAGE.md
- STANDALONE-USAGE.md
- DOCS/INDEX.md
- FINAL-RESOURCE-COUNTS.md

### 3. Registry Validator (`scripts/validate-registries.ts`)

**Purpose:** Validate registries are in sync with directories.

**Checks:**

- ✅ `total_*` fields match array lengths
- ✅ No orphaned registry entries
- ✅ All directories have registry entries
- ✅ No duplicate IDs
- ✅ Required fields present

**Command:** `npm run validate:registries`

### 4. Documentation Validator (`scripts/validate-docs.ts`)

**Purpose:** Validate documentation is in sync with registries.

**Checks:**

- ✅ AUTO-GEN markers exist
- ✅ Values in markers match registry
- ✅ All required files present

**Command:** `npm run validate:docs`

### 5. Git Hooks (`.git-hooks/pre-commit`)

**Purpose:** Enforce automation on every commit.

**What it does:**

1. Runs `npm run generate:all`
2. Auto-stages updated files
3. Runs validation
4. Runs linting and type checking
5. Blocks commit if validation fails

**Installation:** `npm install` (automatic via postinstall)  
**Manual:** `npm run install-hooks`

### 6. CI Validation (`.github/workflows/validate-sync.yml`)

**Purpose:** Enforce sync in CI/CD pipeline.

**What it does:**

1. Runs generators
2. Checks for uncommitted changes
3. Fails if documentation out of sync
4. Tests generator idempotency
5. Provides fix instructions

**Triggers:** Push to main/develop, all PRs

### 7. MCP Settings Template System

**Purpose:** Eliminate hardcoded paths in MCP settings.

**Components:**

- `.claude/mcp-settings.template.json` - Template with `{{AI_DEV_ROOT}}`
- `scripts/render-mcp-settings.ts` - Renders for current environment
- `scripts/validate-mcp-settings.ts` - Validates paths exist

**Commands:**

- `npm run mcp:render` - Generate settings
- `npm run mcp:validate` - Validate settings

**Environment Detection:**

1. `AI_DEV_STANDARDS_ROOT` env var
2. `GITHUB_WORKSPACE` (CI)
3. Current working directory (local)

---

## Usage

### For Developers

**Setup (once per machine):**

```bash
./scripts/setup-dev-environment.sh
```

**Daily workflow:**

```bash
# 1. Make changes (add skill, update MCP, etc.)
# 2. Commit normally
git commit -m "feat: add new skill"

# Automation runs automatically!
# - Registries regenerated
# - Documentation updated
# - Files auto-staged
```

**Manual generation (if needed):**

```bash
# Regenerate everything
npm run generate:all

# Just registries
npm run generate:registries

# Just documentation
npm run generate:docs

# Validate
npm run validate:registries
npm run validate:docs
```

### What NOT to Do

❌ **DON'T** manually edit resource counts in documentation  
❌ **DON'T** manually edit registry files in `META/`  
❌ **DON'T** skip automation (except emergencies)  
❌ **DON'T** add hardcoded paths to mcp-settings.json

### Emergency Skip

```bash
# If you MUST skip validation (use sparingly)
git commit -m "emergency fix [skip-validation]"

# Or
SKIP_VALIDATION=1 git commit -m "emergency fix"
```

---

## Canonical Counts

**Automatically maintained from:**

| Resource     | Source                           | Count   |
| ------------ | -------------------------------- | ------- |
| Skills       | `SKILLS/` directories            | 64      |
| MCPs         | `MCP-SERVERS/` directories       | 50      |
| Tools        | `META/tool-registry.json`        | 24      |
| Components   | `META/component-registry.json`   | 72      |
| Integrations | `META/integration-registry.json` | 28      |
| **TOTAL**    | **Auto-calculated**              | **238** |

**Coverage:** 78.1% (50 MCPs / 64 Skills)

---

## Success Criteria

All criteria met ✅

- ✅ Developer adds new skill → All docs auto-update
- ✅ Developer adds new MCP → All docs + settings auto-update
- ✅ Developer deletes resource → All docs auto-update
- ✅ Pre-commit hook runs generators automatically
- ✅ CI fails with fix instructions if docs out of sync
- ✅ `npm run generate:all` is idempotent (no changes if run twice)

---

## Troubleshooting

### "Documentation is out of sync" error

**Fix:**

```bash
npm run generate:all
git add .
git commit --amend --no-edit
git push --force-with-lease
```

### "Registry validation failed"

**Fix:**

```bash
npm run generate:registries
git add META/*.json
git commit -m "fix: regenerate registries"
```

### "Pre-commit hook not running"

**Fix:**

```bash
npm run install-hooks
```

### "MCP settings has wrong paths"

**Fix:**

```bash
npm run mcp:render
```

---

## Benefits

✅ **Zero Manual Maintenance** - Documentation updates automatically  
✅ **Drift Impossible** - Automation enforces sync  
✅ **Always Accurate** - Single source of truth  
✅ **Developer Friendly** - One-command setup  
✅ **CI Enforced** - Catches issues in PRs  
✅ **Idempotent** - Safe to run multiple times  
✅ **Fast** - Seconds to regenerate everything

---

## Future Enhancements

Potential improvements:

1. Add test coverage for generators
2. Generate additional documentation sections
3. Auto-update CHANGELOG.md
4. Generate skill/MCP relationship graphs
5. Auto-detect missing MCPs for skills
6. Generate API documentation

---

## Maintenance

The automation system itself requires minimal maintenance:

- **Scripts:** TypeScript, type-safe
- **Hooks:** Bash, simple and reliable
- **CI:** GitHub Actions, standard workflow
- **Testing:** Idempotency validated in CI

**To modify automation:**

1. Update script in `scripts/`
2. Test with `npm run generate:all`
3. Verify idempotency
4. Update this documentation
5. Commit and let CI validate

---

## References

- Implementation PR: [Link to PR]
- Problem Statement: See original issue
- Success Metrics: All met (see Success Criteria)

---

**Questions?** See [CONTRIBUTING.md](CONTRIBUTING.md) or [.git-hooks/README.md](.git-hooks/README.md)
