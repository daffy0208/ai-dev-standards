# Version Management Policy

**Single Source of Truth:** `package.json`

All other version references (README.md, CHANGELOG.md) are derived from package.json and updated via automation.

---

## Semantic Versioning

We follow [Semantic Versioning 2.0.0](https://semver.org/):

```
MAJOR.MINOR.PATCH

Example: 2.1.3
         │ │ └─ PATCH: Bug fixes, documentation updates
         │ └─── MINOR: New features, new resources (backward compatible)
         └───── MAJOR: Breaking changes, major releases, Phase completions
```

## When to Bump Versions

### MAJOR (X.0.0)

- **Phase completions** (e.g., Phase 3: Design System Complete)
- **Breaking changes** to CLI, API, or structure
- **Major architectural changes**
- **Significant resource additions** (e.g., 20+ skills, 30+ MCPs)

**Examples:**

- `1.0.0 → 2.0.0`: Phase 3 completion (75 resources, design system)
- `2.0.0 → 3.0.0`: CLI breaking changes, registry restructure

### MINOR (0.X.0)

- **New skills** (5-15 skills)
- **New MCPs** (5-15 MCPs)
- **New features** in CLI or tools
- **New integrations** or components
- **Quality improvements** (validation, testing, CI/CD)

**Examples:**

- `1.0.0 → 1.1.0`: Quality & Trust Update (validation system)
- `1.1.0 → 1.2.0`: Added 8 new skills
- `2.0.0 → 2.1.0`: New authentication MCP suite

### PATCH (0.0.X)

- **Bug fixes** (security, critical fixes)
- **Documentation updates** (README, guides)
- **Registry sync fixes** (missing entries)
- **Typo corrections**
- **Performance improvements** (no new features)

**Examples:**

- `1.0.0 → 1.0.1`: Fixed 9 security vulnerabilities in CLI
- `2.0.0 → 2.0.1`: Updated outdated documentation
- `2.1.0 → 2.1.1`: Registry sync fixes

---

## Version Bump Process

### Automated (Recommended)

```bash
# 1. Create new resources / make changes
# 2. Sync registries
npm run validate:fix

# 3. Validate everything
npm run validate

# 4. Bump version with description
npm run version:major "Phase 3 Complete - Design System"
npm run version:minor "Added authentication MCP suite"
npm run version:patch "Fixed registry sync issues"

# 5. Review changes
git diff

# 6. Commit and tag
git add .
git commit -m "chore: Release v2.0.0"
git tag v2.0.0

# 7. Push with tags
git push origin main --tags
```

### Manual (Emergency Only)

If the script fails, manually update:

1. `package.json` → version field
2. `README.md` → header AND Versioning section
3. `CHANGELOG.md` → add new section at top
4. Commit, tag, push

---

## Files Updated by Version Script

The `scripts/bump-version.cjs` script updates:

1. **package.json** (source of truth)
   - `version` field

2. **README.md** (2 places)
   - Header: `**Version X.X.X**`
   - Versioning section: `**Current Version:** X.X.X`
   - Version History: Adds new entry

3. **CHANGELOG.md**
   - Creates new `## [X.X.X] - YYYY-MM-DD` section

---

## Current Version Status

**As of 2025-10-27:**

```
package.json:  1.0.0  ← Source of truth (OUTDATED)
README.md:     1.0.1  ← Header (inconsistent)
README.md:     1.1.0  ← Versioning section (inconsistent)
CHANGELOG.md:  1.0.1  ← Latest entry (inconsistent)
```

**Recommendation:** Bump to **2.0.0** to reflect Phase 3 completion:

- 45 skills (was 37)
- 48 MCPs (was 7)
- 216 resources (was ~80)
- Complete design system

---

## Version History

### Major Releases

- **2.0.0** (planned): Phase 3 Complete - Design System (75 resources)
- **1.0.0** (2025-10-22): Initial release (37 skills, 7 MCPs)

### Minor Releases

- **1.1.0** (2025-10-22): Quality & Trust Update (validation, CI/CD)

### Patch Releases

- **1.0.1** (2025-10-27): Security fixes (9 CLI vulnerabilities)

---

## Related Scripts

```bash
npm run validate:fix     # Auto-sync registries before versioning
npm run validate         # Validate before release
npm run version:major    # Bump major version
npm run version:minor    # Bump minor version
npm run version:patch    # Bump patch version
```

---

## Questions?

- **"Should I bump major or minor?"** → If in doubt, bump minor. Major is for breaking changes.
- **"I forgot to update CHANGELOG"** → Run `npm run version:patch` to fix
- **"Versions are out of sync"** → Run `npm run version:patch "Sync versions"` to unify

---

Last Updated: 2025-10-27
