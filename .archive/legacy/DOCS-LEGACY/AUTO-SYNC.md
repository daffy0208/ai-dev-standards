# Auto-Sync System

**Never manually update configuration files again!**

The ai-dev auto-sync system automatically keeps your project synchronized with the latest ai-dev-standards.

## 🎯 What Gets Auto-Synced

- ✅ **Skills** - New skills added to claude.md automatically
- ✅ **MCP Servers** - Latest MCPs configured automatically
- ✅ **Cursor Rules** - Best practices updated in .cursorrules
- ✅ **Git Ignore** - Latest patterns added to .gitignore
- ✅ **Tools** - New agent tools available automatically
- ✅ **Integrations** - Updated client libraries and configs

## 🚀 Quick Start

### 1. Initialize Auto-Sync

```bash
cd your-project
ai-dev sync
```

The first time you run `sync`, it will ask:

- What do you want to track? (skills, MCPs, cursorrules, etc.)
- How often to sync? (on git pull, daily, weekly, manual)

### 2. Let It Run Automatically

Once initialized, sync happens automatically:

```bash
# On git pull (if you chose git-hook)
git pull
# → Auto-runs: ai-dev sync --yes --silent

# Or manually anytime
ai-dev sync
```

### 3. Update Specific Things

```bash
# Update just skills
ai-dev update skills

# Update just MCPs
ai-dev update mcps

# Update cursor rules
ai-dev update cursorrules

# Update everything
ai-dev update all
```

## 📋 Configuration File

Auto-sync creates `.ai-dev.json` in your project:

```json
{
  "version": "1.0.0",
  "lastSync": "2025-10-22T12:00:00Z",
  "tracking": ["skills", "mcps", "cursorrules", "gitignore", "tools"],
  "frequency": "git-hook",
  "installed": {
    "skills": ["mvp-builder", "rag-implementer"],
    "mcps": ["accessibility-checker"],
    "tools": [],
    "integrations": []
  }
}
```

**Do not edit manually** - use `ai-dev sync` and `ai-dev update` commands.

## 🔄 How It Works

### Automatic Sync Flow

```
1. Check for updates
   └── Compare local version with latest registry

2. Show available updates
   └── New skills, MCPs, config changes

3. Ask for confirmation (unless --yes)
   └── User selects what to install

4. Apply updates
   ├── Add skills to claude.md
   ├── Configure MCPs in mcp-settings.json
   ├── Update .cursorrules
   ├── Update .gitignore
   └── Copy tool files

5. Save state
   └── Update .ai-dev.json with new versions
```

### Git Hook Integration

When you choose `git-hook` frequency, it creates `.git/hooks/post-merge`:

```bash
#!/bin/sh
# Auto-sync after git pull

echo "🔄 Auto-syncing with ai-dev-standards..."
ai-dev sync --yes --silent
```

This runs automatically after every `git pull`.

## 🎨 Examples

### Example 1: First Time Setup

```bash
$ ai-dev sync

⚠️  Project not initialized for auto-sync

? Initialize auto-sync for this project? Yes

? What should be auto-synced?
  ◉ Skills (claude.md)
  ◉ MCP Servers
  ◉ Cursor Rules (.cursorrules)
  ◉ Git Ignore (.gitignore)
  ◉ Tools & Integrations
  ◯ Templates

? Auto-sync frequency: On every git pull (recommended)

✅ Auto-sync initialized

🔄 Checking for updates...
✅ Found 5 updates

📦 Available Updates:

  • skill: data-visualizer
    Create charts and dashboards
  • skill: iot-developer
    IoT and sensor integration
  • mcp: accessibility-checker
    Automated WCAG compliance checking

? Apply these updates? Yes

🔧 Applying updates...

✅ data-visualizer
✅ iot-developer
✅ accessibility-checker

✅ Sync complete!

📊 Summary:
  • 2 skills added
  • 1 MCPs configured

💡 Tip:
  Auto-sync runs automatically on git pull
  Or run manually: ai-dev sync
```

### Example 2: Manual Sync

```bash
$ ai-dev sync

🔄 Syncing with ai-dev-standards...

✅ Checking for updates...
Found 2 updates

📦 Available Updates:

  • skill: spatial-developer
    WebXR, AR/VR, and Vision Pro development
  • config: .cursorrules
    Updated with latest best practices

? Apply these updates? Yes

🔧 Applying updates...

✅ spatial-developer
✅ .cursorrules

✅ Sync complete!
```

### Example 3: Update Specific Thing

```bash
$ ai-dev update skills

🔄 Updating skills...

✅ Fetching available skills...
Found 35 skills

📦 3 new skills available:

? Select skills to add:
  ◉ data-visualizer - Create charts and dashboards
  ◉ 3d-visualizer - Three.js 3D graphics
  ◯ localization-engineer - Multi-language support

✅ Added 2 skills
```

### Example 4: Silent Auto-Sync (Git Hook)

```bash
$ git pull

remote: Counting objects: 10, done.
Receiving objects: 100% (10/10), done.
Updating abc1234..def5678

🔄 Auto-syncing with ai-dev-standards...
✅ No updates available

Everything up to date!
```

## 🛠️ Commands

### `ai-dev sync`

Main sync command - checks for all updates.

```bash
# Interactive (asks for confirmation)
ai-dev sync

# Auto-approve all updates
ai-dev sync --yes

# Silent (no output)
ai-dev sync --silent

# Both
ai-dev sync --yes --silent
```

### `ai-dev update <target>`

Update specific parts only.

```bash
# Update skills
ai-dev update skills

# Update MCPs
ai-dev update mcps

# Update cursor rules
ai-dev update cursorrules

# Update gitignore
ai-dev update gitignore

# Update tools
ai-dev update tools

# Update everything
ai-dev update all

# With auto-select
ai-dev update skills --all
```

## 📊 Tracking Versions

The system tracks versions to know what's new:

```json
{
  "version": "1.0.0",
  "installed": {
    "skills": ["mvp-builder", "rag-implementer"],
    "mcps": ["accessibility-checker"],
    "tools": [],
    "integrations": []
  }
}
```

Each resource has a version in `META/registry.json`:

```json
{
  "skills": [
    {
      "name": "data-visualizer",
      "version": "1.0.0",
      "path": "SKILLS/data-visualizer/SKILL.md"
    }
  ]
}
```

When versions mismatch, an update is available.

## 🎯 ADHD-Friendly Features

**Why auto-sync is perfect for ADHD:**

✅ **Set once, forget forever** - Initial setup is all you need
✅ **Zero manual work** - Everything happens automatically
✅ **No decisions to make** - Just accept or skip updates
✅ **Clear notifications** - See exactly what's changing
✅ **Always up-to-date** - Never behind on best practices

**Example:**

```bash
# Setup once
ai-dev sync
# → Choose: git-hook
# → Done!

# Never think about it again
git pull
# → Auto-syncs in background
# → Always latest skills/MCPs/configs
```

## 🔧 Advanced

### Disable Auto-Sync

```bash
# Remove git hook
rm .git/hooks/post-merge

# Update config
# Edit .ai-dev.json:
{
  "frequency": "manual"
}
```

### Manual Registry Update

```bash
# The registry is at: META/registry.json
# Pull latest:
git pull origin main
ai-dev sync
```

### Custom Sync Schedule

Add to cron (Linux/Mac):

```bash
# Daily at 9 AM
0 9 * * * cd /path/to/project && ai-dev sync --yes --silent
```

Or use GitHub Actions:

```yaml
name: Auto-sync ai-dev-standards

on:
  schedule:
    - cron: '0 9 * * *' # Daily at 9 AM

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Install ai-dev CLI
        run: npm install -g @ai-dev-standards/cli
      - name: Sync
        run: ai-dev sync --yes
      - name: Commit changes
        run: |
          git config user.name "AI Dev Bot"
          git commit -am "Auto-sync ai-dev-standards"
          git push
```

## 🚨 Troubleshooting

### Sync not working?

```bash
# Check config
cat .ai-dev.json

# Re-initialize
rm .ai-dev.json
ai-dev sync

# Check git hook
cat .git/hooks/post-merge
```

### Conflicts?

```bash
# Backup your changes
cp .cursorrules .cursorrules.backup

# Force sync
ai-dev sync --yes

# Merge manually if needed
```

### Updates not showing?

```bash
# Force check
ai-dev sync

# Update registry
cd path/to/ai-dev-standards
git pull
```

## 📝 Summary

**Auto-sync = Zero maintenance**

```bash
# Setup once
ai-dev sync
# → Choose tracking + frequency
# → Done!

# Everything happens automatically:
# ✅ New skills added
# ✅ MCPs configured
# ✅ Configs updated
# ✅ Always latest standards

# Never think about it again!
```

**Your project stays automatically up-to-date with zero effort.** 🎉
