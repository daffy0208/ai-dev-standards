# Auto-Sync System Guide

> **📢 DEPRECATED:** This file is maintained for backward compatibility. 
> 
> **Please use:** [INTEGRATION-USAGE.md](INTEGRATION-USAGE.md) for complete auto-sync documentation.
>
> The new guide provides comprehensive coverage of auto-sync functionality with the new `./scripts/check-updates.sh` script for update checking.

---

**Last Updated:** 2025-10-22
**Status:** Partially Implemented
**Next Phase:** MCP auto-update integration

---

## Purpose

The auto-sync system keeps projects up-to-date with the latest ai-dev-standards resources automatically. This guide explains how it works and how to use it.

**Archived:** This replaces AUTO-SYNC.md, AUTO-SYNC-SUMMARY.md, and COMPREHENSIVE-AUTO-SYNC.md.

---

## 🎯 What Auto-Syncs

### ✅ Always Updated (On Git Pull)
Resources that **should** stay in sync with upstream:

- **Skills** (SKILLS/) - New methodologies and updates
- **MCPs** (MCP-SERVERS/) - New tools and capabilities
- **Standards** (STANDARDS/) - Architecture patterns and best practices
- **Config Files** (.cursorrules, .prettierrc, etc.) - Linting and formatting rules
- **Playbooks** (PLAYBOOKS/) - Operational procedures

**Why:** These evolve rapidly. Security patches, new best practices, and improved patterns should propagate automatically.

### 📦 On-Request Updates
Resources that sync only when explicitly requested:

- **Components** (COMPONENTS/) - May be customized
- **Integrations** (INTEGRATIONS/) - Project-specific
- **Utils** (UTILS/) - Often modified locally
- **Tools** (TOOLS/) - May have custom configs
- **Examples** (EXAMPLES/) - Reference only

**Why:** These are more likely to be customized per-project.

---

## 🚀 Quick Start

### Option 1: Bootstrap (Recommended)
```bash
npx @ai-dev-standards/bootstrap
```

This sets up auto-sync automatically with git hooks.

### Option 2: Manual Setup
```bash
# 1. Clone ai-dev-standards
git clone <repo-url> ~/ai-dev-standards

# 2. Install CLI
cd ~/ai-dev-standards/CLI
npm install && npm link

# 3. Navigate to your project
cd /your/project

# 4. Initialize
ai-dev sync

# 5. Set up git hook (optional)
cat > .git/hooks/post-merge << 'EOF'
#!/bin/bash
ai-dev sync --auto
EOF
chmod +x .git/hooks/post-merge
```

---

## 🔧 Usage

### Sync Everything
```bash
ai-dev sync
```

Syncs all auto-update resources from ~/ai-dev-standards to current project.

### Sync Specific Categories
```bash
ai-dev sync --skills           # Just skills
ai-dev sync --mcps             # Just MCPs
ai-dev sync --standards        # Just standards
ai-dev sync --config          # Just config files
```

### Check What Would Sync (Dry Run)
```bash
ai-dev sync --dry-run
```

Shows what would be updated without making changes.

### Force Update (Overwrite Local Changes)
```bash
ai-dev sync --force
```

⚠️ **Warning:** This overwrites local customizations. Use with caution.

---

## 📋 Sync Behavior by Resource

### Skills (SKILLS/)
- **Sync:** Always on `git pull`
- **Conflict:** Upstream wins (skills are canonical)
- **Custom:** Use `.ai-dev/custom-skills/` for project-specific skills

### MCPs (MCP-SERVERS/)
- **Sync:** Always on `git pull`
- **Conflict:** Upstream wins
- **Custom:** Install additional MCPs separately

### Standards (STANDARDS/)
- **Sync:** Always (CRITICAL for security)
- **Conflict:** Upstream wins
- **Custom:** Add project-specific docs to `.ai-dev/standards/custom/`

### Config Files
- **Sync:** Smart-merge
  - `.cursorrules` - **Auto-update** (always sync)
  - `.gitignore` - **Append** (merge, don't overwrite)
  - `.env.example` - **Append** (merge, don't overwrite)
  - `tsconfig.json` - **Merge** (preserve local settings)
  - `.prettierrc` - **Auto-update**
  - `.eslintrc.json` - **Merge**

### Components (COMPONENTS/)
- **Sync:** On-request only
- **Command:** `ai-dev install component <name>`
- **Custom:** Fully customizable after install

---

## 🔄 How It Works

### Architecture
```
ai-dev-standards (Upstream)
        ↓
   git pull (user)
        ↓
   post-merge hook (auto)
        ↓
   ai-dev sync --auto
        ↓
   Project Updated
```

### Sync Algorithm
1. **Check registry** — Read META/registry.json for available resources
2. **Compare versions** — Check project .ai-dev/manifest.json vs. registry
3. **Determine updates** — Find resources with newer versions
4. **Apply sync rules** — Auto-update, merge, or skip based on category
5. **Update manifest** — Record synced versions in project

### Conflict Resolution
- **Auto-update resources:** Upstream always wins
- **Merge resources:** Smart merge, preserve local additions
- **On-request resources:** Never auto-sync, manual only

---

## 🛡️ Safety Features

### Backup Before Sync
```bash
# Auto-sync creates backup
.ai-dev/backups/YYYYMMDD-HHMMSS/
```

Backups are kept for 30 days.

### Rollback
```bash
ai-dev rollback <timestamp>
```

Restores from backup if sync causes issues.

### Diff Preview
```bash
ai-dev sync --diff
```

Shows what will change before applying.

---

## 🚨 Troubleshooting

### Sync Fails with "Registry Not Found"
**Problem:** CLI can't find META/registry.json

**Solution:**
```bash
# Check ~/ai-dev-standards exists
ls ~/ai-dev-standards/META/registry.json

# Update CLI
cd ~/ai-dev-standards/CLI && git pull && npm install
```

### Local Changes Overwritten
**Problem:** Auto-sync replaced customizations

**Solution:**
```bash
# 1. Rollback
ai-dev rollback <latest-backup-timestamp>

# 2. Move customizations to safe location
mkdir .ai-dev/custom/
mv customized-file .ai-dev/custom/

# 3. Re-sync
ai-dev sync
```

### Sync Hook Not Running
**Problem:** Git hook not executing

**Solution:**
```bash
# Check hook exists and is executable
ls -la .git/hooks/post-merge
chmod +x .git/hooks/post-merge

# Test manually
.git/hooks/post-merge
```

---

## 📊 What Gets Synced (Example)

```
Your Project Before Sync:
├── .ai-dev/
│   ├── skills/ (32 skills)
│   ├── mcps/ (2 MCPs)
│   └── manifest.json (v1.0.0)
├── .cursorrules (outdated)
└── STANDARDS/ (missing 3 new patterns)

After Sync:
├── .ai-dev/
│   ├── skills/ (36 skills) ← 4 new skills added
│   ├── mcps/ (3 MCPs) ← 1 new MCP added
│   └── manifest.json (v1.1.0) ← version updated
├── .cursorrules (updated) ← latest best practices
└── STANDARDS/ (complete) ← 3 new patterns added
```

---

## 🔮 Future Enhancements

### Planned (Not Yet Implemented)
- [ ] Selective auto-sync (choose which categories)
- [ ] Notification system (what changed in sync)
- [ ] Cloud sync (sync from GitHub directly)
- [ ] Version pinning (stay on specific version)
- [ ] Sync analytics (track what's being used)

### Status
Currently, auto-sync is **partially implemented**:
- ✅ Registry system works
- ✅ CLI can read from registry
- ⚠️ Git hooks need setup per-project
- ⚠️ Rollback system planned but not built
- ⚠️ Smart-merge logic partially implemented

---

## 📚 Related Docs

- **BUILD_FOCUS.md** - Current development priorities
- **BOOTSTRAP.md** - Initial project setup
- **CLI-REFERENCE.md** - Complete CLI command reference

---

## 🎯 Core Principle

> **"Always updated ≠ Always changing. The goal is stability through continuous improvement."**

Auto-sync keeps you secure and current without disrupting your work.

---

**Next Update:** When MCP auto-update system is built (Week 2-4)
