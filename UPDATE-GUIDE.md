# Updating Your Project with ai-dev-standards

> **📢 DEPRECATED:** This file is maintained for backward compatibility.
>
> **Please use:** [INTEGRATION-USAGE.md](INTEGRATION-USAGE.md) for complete integration and update documentation.
>
> The new guide consolidates INSTALL.md, UPDATE-GUIDE.md, and AUTO-SYNC-GUIDE.md with improved update checking via `./scripts/check-updates.sh`.

---

**Quick Reference:** How to sync your project with the latest ai-dev-standards resources.

---

## 🚀 Quick Update (Recommended)

If you've already set up ai-dev-standards in your project:

```bash
cd /path/to/your/project
bash ~/ai-dev-standards/setup-project.sh
```

**That's it!** The script automatically:

- Detects existing setup and runs sync
- Updates all 238 resources (64 skills, 50 MCPs, etc.)
- Updates configuration files
- Maintains your customizations

---

## 📋 First Time Setup

If this is your first time adding ai-dev-standards to a project:

### Step 1: Clone ai-dev-standards (One Time)

```bash
cd ~
git clone https://github.com/daffy0208/ai-dev-standards.git
```

### Step 2: Update Your Project

```bash
cd /path/to/your/project
bash ~/ai-dev-standards/setup-project.sh
```

The script will:

1. **Detect your project type** (Next.js, React, Node.js, etc.)
2. **Install the ai-dev CLI** globally
3. **Sync all resources** from ai-dev-standards
4. **Configure brain-mcp** for Claude and Codex
5. **Analyze your project** and provide recommendations
6. **Set up auto-sync** via git hooks

### Step 3: Build brain-mcp (First Time Only)

After the first setup, you need to build the brain-mcp MCP server:

```bash
cd ~/ai-dev-standards/MCP-SERVERS/brain-mcp
npm install
npm run build
```

This creates the `dist/index.js` file that Claude uses for intelligent skill recommendations.

---

## 🔄 Regular Updates

### Automatic Updates (Recommended)

If you set up the git hook during initial setup, your project auto-syncs when you run `git pull`:

```bash
git pull
# Automatically runs: ai-dev sync --yes
```

### Manual Updates

To manually sync at any time:

```bash
cd /path/to/your/project
ai-dev sync
```

Or use the setup script:

```bash
bash ~/ai-dev-standards/setup-project.sh
```

---

## 📊 What Gets Updated

### Always Synced

These resources are automatically updated to keep you current:

- **Skills** (SKILLS/) - 64 specialized methodologies
- **MCP Servers** (MCP-SERVERS/) - 50 automation tools
- **Configuration** (.cursorrules, .gitignore, etc.)
- **Standards** (STANDARDS/) - Best practices and patterns
- **Tools** (TOOLS/) - Development utilities
- **Components** (COMPONENTS/) - 72 React components
- **Integrations** (INTEGRATIONS/) - 28 service integrations

### File Locations in Your Project

After sync, you'll find:

```
your-project/
├── .ai-dev.json                    # Sync configuration and version tracking
├── .claude/
│   ├── claude.md                   # Skills available to Claude
│   └── mcp-settings.json           # MCP server configuration
├── .codex/
│   └── mcp-settings.json           # Codex CLI configuration
├── .cursorrules                    # Brain-First Development workflow
└── START-HERE.md                   # Your personalized getting started guide
```

---

## 🛠️ Post-Update Steps

### 1. Review What Changed

Check the sync summary:

```bash
cat .ai-dev.json
```

This shows:

- Version updated to
- Last sync timestamp
- Resources installed

### 2. Test brain-mcp (Optional)

Verify brain-mcp is working:

```bash
# Check if brain-mcp is configured
cat .claude/mcp-settings.json | grep brain-mcp

# Test brain-mcp availability
node ~/ai-dev-standards/MCP-SERVERS/brain-mcp/dist/index.js --help
```

### 3. Review Recommendations

Open `START-HERE.md` for:

- Project health score
- Recommended skills to use
- Priority tasks
- Quick wins

### 4. Use the Brain-First Workflow

When starting any new task, query the brain first:

```
Use brain_search to find relevant skills for [your task]
```

Claude will automatically activate the most relevant skills for your work.

---

## 📝 Documenting Your Update

Create an update log to track what was synced:

```bash
cat > AI-DEV-STANDARDS-UPDATE.md << 'EOF'
# AI-Dev-Standards Update Log

**Date:** $(date +%Y-%m-%d)
**Updated By:** [Your Name]
**Project:** [Your Project Name]

## What Was Updated

### Resources Synced
- Skills: [Number] total
- MCPs: [Number] total
- Components: [Number] total
- Integrations: [Number] total
- Tools: [Number] total

### Configuration Changes
- Updated .cursorrules with Brain-First Development workflow
- Updated .claude/claude.md with new skill references
- Configured brain-mcp in MCP settings
- Updated .gitignore with orchestration patterns

### New Capabilities
- [List any new skills or features you're excited about]

## Post-Update Actions
- [ ] Reviewed START-HERE.md recommendations
- [ ] Built brain-mcp (if first time)
- [ ] Tested brain-mcp configuration
- [ ] Committed changes to repository

## Notes
[Any observations or customizations made]
EOF
```

---

## 🔧 Troubleshooting

### Issue: "ai-dev command not found"

**Solution:**

```bash
cd ~/ai-dev-standards/CLI
npm install
npm link
```

### Issue: "brain-mcp not found"

**Solution:** Build brain-mcp:

```bash
cd ~/ai-dev-standards/MCP-SERVERS/brain-mcp
npm install
npm run build
```

### Issue: "Setup script fails with permission error"

**Solution:** Ensure the script is executable:

```bash
chmod +x ~/ai-dev-standards/setup-project.sh
```

### Issue: "Git hook not running"

**Solution:** Verify and fix the hook:

```bash
chmod +x .git/hooks/post-merge
# Test it manually:
.git/hooks/post-merge
```

### Issue: "Sync overwrote my customizations"

**Prevention:** Keep customizations in these safe locations:

- Custom skills: `.ai-dev/custom-skills/`
- Custom components: Use your own directories
- Local configs: The sync preserves local `.env` and project-specific files

**Recovery:** Check git history:

```bash
git diff HEAD^ HEAD -- [file-that-changed]
git checkout HEAD^ -- [file-to-restore]
```

---

## 🔐 Security Considerations

### What Gets Committed

The sync will add/modify these files in your project:

- `.ai-dev.json` - Configuration and version tracking
- `.cursorrules` - Development workflow patterns
- `.claude/` directory - MCP and skill configurations
- `.codex/` directory - Codex CLI configurations
- `.gitignore` additions - Orchestration patterns

### What Stays Local

These are automatically excluded (in `.gitignore`):

- `START-HERE.md` - Your personalized guide
- `.ai-dev/backups/` - Backup files
- `orchestration-requests/` - Agent request tracking
- `orchestration-results/` - Agent result tracking

### Secrets Management

- Never commit `.env` files with real secrets
- Use `.env.example` for templates
- The sync respects existing `.gitignore` patterns

---

## 📚 Additional Resources

### Documentation

- [INSTALL.md](INSTALL.md) - Complete installation guide
- [AUTO-SYNC-GUIDE.md](DOCS/AUTO-SYNC-GUIDE.md) - Deep dive into sync system
- [CLI README](CLI/README.md) - Full CLI command reference

### Getting Help

- Check [TROUBLESHOOTING.md](DOCS/TROUBLESHOOTING.md) for common issues
- Review [CONTRIBUTING.md](CONTRIBUTING.md) for development setup
- Open an issue on GitHub for bugs

---

## ✨ What's New

### Version 3.0.0 (Latest)

**Major Updates:**

- Local-first architecture (10x faster, works offline)
- Fixed cross-project data exposure vulnerability
- 238 total resources (64 skills, 50 MCPs, 72 components, 28 integrations, 24 tools)
- Brain-MCP for intelligent skill recommendations
- Brain-First Development workflow
- Complete dependency mapping
- Enhanced security with project isolation

**Migration from v2.x:**

```bash
# Simply re-run the setup script
bash ~/ai-dev-standards/setup-project.sh
```

The script automatically detects and migrates from older versions.

---

## 🎯 Best Practices

### 1. Update Regularly

Update ai-dev-standards at least weekly:

```bash
# Update ai-dev-standards repository
cd ~/ai-dev-standards
git pull

# Update your project
cd /path/to/your/project
bash ~/ai-dev-standards/setup-project.sh
```

### 2. Review Changes Before Committing

After sync, review what changed:

```bash
git status
git diff
```

### 3. Document Your Updates

Keep a log of updates for your team:

- What version you updated to
- What new skills/tools you gained
- Any configuration changes made

### 4. Test After Major Updates

After updating to a new major version:

1. Run your test suite
2. Test brain-mcp connectivity
3. Verify Claude can access skills
4. Check that your build still works

---

## 📞 Support

**Questions?**

- Read the [INSTALL.md](INSTALL.md) guide
- Check [AUTO-SYNC-GUIDE.md](DOCS/AUTO-SYNC-GUIDE.md) for sync details
- Open an issue on GitHub

**Found a bug?**

- Report it on [GitHub Issues](https://github.com/daffy0208/ai-dev-standards/issues)
- Include your OS, Node version, and error message

---

## 🚦 Quick Reference

```bash
# First time setup
bash ~/ai-dev-standards/setup-project.sh

# Regular updates
ai-dev sync

# Manual sync with the script
bash ~/ai-dev-standards/setup-project.sh

# Check what's installed
cat .ai-dev.json

# View sync configuration
ai-dev sync --dry-run

# Update ai-dev-standards itself
cd ~/ai-dev-standards && git pull
```

---

**Last Updated:** 2025-11-05
**Version:** 3.0.0
