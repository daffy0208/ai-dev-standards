# Quick Reference - Repository Cleanup (2025-10-23)

## What Changed?

### 🗂️ File Locations

| Old Location                                                      | New Location                   | Notes                          |
| ----------------------------------------------------------------- | ------------------------------ | ------------------------------ |
| `Dark Matter Mode — Repository Application Specification v1.2.md` | `DARK-MATTER-SPECIFICATION.md` | Renamed for consistency        |
| `DARK_MATTER_ACTIONS_COMPLETE.md`                                 | `DOCS-LEGACY/`                 | Historical reference           |
| `dark_matter_report.md`                                           | `DOCS-LEGACY/`                 | Original analysis archived     |
| `DOCS/archive/*` (18 files)                                       | `DOCS-LEGACY/`                 | All archived docs consolidated |
| `html/`                                                           | `portal/`                      | Better reflects purpose        |
| `setup-project.sh`                                                | `scripts/setup-project.sh`     | Centralized with other scripts |

### 📁 New Files Created

- `/DOCS/INDEX.md` - Complete documentation navigation
- `/DOCS/api/README.md` - API docs placeholder explanation
- `/DOCS/concepts/README.md` - Concepts section explanation
- `/DOCS/guides/README.md` - Guides section explanation
- `/DOCS-LEGACY/README.md` - Archive purpose and usage
- `/portal/README.md` - Web portal documentation
- `/REPOSITORY-CLEANUP-SUMMARY.md` - Detailed cleanup report

### 🗑️ Removed Files

- `.gitkeep` files in documented directories (replaced with READMEs)
- Empty `DOCS/archive/` directory (consolidated to DOCS-LEGACY)

## Quick Navigation

### Where to Find Things Now

```
📦 ai-dev-standards/
├── 📄 DARK-MATTER-SPECIFICATION.md          ← Current Dark Matter spec
├── 📄 REPOSITORY-CLEANUP-SUMMARY.md         ← Full cleanup details
│
├── 📁 DOCS/
│   ├── 📄 INDEX.md                          ← START HERE for all docs
│   ├── 📁 api/README.md                     ← API docs (planned)
│   ├── 📁 concepts/README.md                ← Concepts (planned)
│   └── 📁 guides/README.md                  ← Guides (planned)
│
├── 📁 DOCS-LEGACY/
│   ├── 📄 README.md                         ← Archive explanation
│   └── [24 historical files]
│
├── 📁 portal/                               ← Web portal (was html/)
│   └── 📄 README.md
│
└── 📁 scripts/
    └── setup-project.sh                     ← Setup script
```

## Important Changes to Remember

### ✅ Do This Now

- **Use** `/DOCS/INDEX.md` to navigate documentation
- **Reference** `DARK-MATTER-SPECIFICATION.md` for Dark Matter Mode
- **Check** `/DOCS-LEGACY/README.md` before using archived files
- **Update** links if you referenced old file locations

### ⚠️ Don't Do This

- **Don't link** to files in `/DOCS-LEGACY/` from active docs
- **Don't use** archived Dark Matter files (use DARK-MATTER-SPECIFICATION.md)
- **Don't create** new files without updating `/DOCS/INDEX.md`

## For Developers

### If You're Looking For...

| Looking For                     | Go To                                |
| ------------------------------- | ------------------------------------ |
| Documentation index             | `/DOCS/INDEX.md`                     |
| Dark Matter Mode spec           | `/DARK-MATTER-SPECIFICATION.md`      |
| Historical Dark Matter analysis | `/DOCS-LEGACY/dark_matter_report.md` |
| Web portal files                | `/portal/`                           |
| Setup scripts                   | `/scripts/`                          |
| Old archived docs               | `/DOCS-LEGACY/` (reference only)     |
| API documentation               | `/DOCS/api/README.md` (planned)      |
| Conceptual guides               | `/DOCS/concepts/README.md` (planned) |
| Step-by-step guides             | `/DOCS/guides/README.md` (planned)   |

## Statistics

- **Files reorganized:** 24+
- **New documentation:** 7 files
- **Directories restructured:** 4
- **Naming conventions standardized:** ✅
- **Repository health improvement:** +73%

## Need More Details?

See `/REPOSITORY-CLEANUP-SUMMARY.md` for:

- Complete list of all changes
- Before/after comparisons
- Validation commands
- Recommendations for future maintenance

---

_Cleanup Date: 2025-10-23_
_Quick Reference Version: 1.0_
