# Archive

This directory contains historical working documents from the development of ai-dev-standards.

## What's Archived Here

**Purpose:** These documents were created during development sessions for planning, auditing, and tracking progress. They are no longer actively used but are preserved for historical reference.

### Directory Structure

- **`audits/`** - Quality audits, code reviews, and analysis reports
  - Comprehensive audit reports
  - Gap analyses
  - Drift detection reports
  - System validation reports

- **`planning/`** - Planning documents and roadmaps
  - Build focus documents
  - Automation strategies
  - File relationship audits
  - Update plans

- **`reports/`** - Test reports and validation summaries
  - Generator test reports
  - Security test reports
  - MCP validation reports
  - Skill-MCP parity reports

- **`sessions/`** - Session transcripts and working notes
  - Development session transcripts
  - Analysis from other projects
  - Category analysis documents

- **`legacy/`** - Legacy documentation (DOCS-LEGACY/)
  - Old documentation structure
  - Historical guides
  - Superseded by current DOCS/

## Why These Were Archived

**Repository Cleanup (2025-10-27):**

- 31 files in root directory → 8 essential files
- 23 files in META/ directory → 4 core documents
- Total: 74 files moved to archive

**Reasons:**

1. **Clutter Reduction:** Working documents don't belong in root/META
2. **Professional Appearance:** GitHub front page should show only essential files
3. **Clarity:** Clear distinction between user-facing and developer-working documents
4. **Organization:** Logical grouping by purpose

## What Remains in Root

**User-Facing Files:**

- `README.md` - Main documentation
- `CHANGELOG.md` - Version history
- `INSTALL.md` - Installation guide
- `SETUP.txt` - Quick setup reference
- `CONTRIBUTING.md` - Contribution guidelines
- `ARCHON-PROJECT.json` - Project configuration
- `package.json` - Dependencies

## What Remains in META

**Core Context Documents:**

- `PROJECT-CONTEXT.md` - Repository overview for AI assistants
- `HOW-TO-USE.md` - Navigation and usage guide
- `DECISION-FRAMEWORK.md` - Technology decision guidance
- `REPOSITORY-BRAIN.md` - Intelligence system documentation

Plus registry JSON files (skill-registry.json, mcp-registry.json, etc.)

## Accessing Historical Information

If you need information from archived documents:

```bash
# Search archived files
grep -r "search term" .archive/

# View specific archived file
cat .archive/audits/COMPREHENSIVE-AUDIT-REPORT.json

# List all archived files
find .archive -type f -name "*.md"

# Count archived files
find .archive -type f | wc -l
```

### Notable Historical Documents

**For Understanding Evolution:**

- `audits/COMPREHENSIVE-AUDIT-REPORT.json` - Complete repository assessment
- `planning/MASTER-ROADMAP.md` - Original vision and goals
- `legacy/DOCS-LEGACY/` - Superseded documentation versions

**For Decision Context:**

- `audits/GAP-ANALYSIS.md` - Feature gap identification
- `planning/VALIDATION-SYSTEM-PROOF.md` - Validation system design
- `sessions/` - Development session contexts

## Should I Add New Files Here?

**No.** This is a historical archive only. New documents should go in appropriate locations:

- User documentation → `DOCS/`
- Developer notes → Keep local or in issues
- Planning → Use GitHub Projects/Issues
- Reports → Generate on-demand, don't commit

## Related Documentation

- [DOCUMENTATION-REVIEW-FINDINGS.md](../DOCUMENTATION-REVIEW-FINDINGS.md) - 2025 documentation audit
- [CHANGELOG.md](../CHANGELOG.md) - Complete version history
- [META/RESOURCE-TAXONOMY.md](../META/RESOURCE-TAXONOMY.md) - Resource counting methodology

---

**Archived for posterity, cleaned for clarity** 📦  
**Last Updated:** 2025-11-10
