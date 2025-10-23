# Getting Started with AI Dev Standards

**The simplest guide possible.**

---

## For ANY Project (New or Existing)

### 1. Run One Command

```bash
cd /your/project
npx @ai-dev-standards/bootstrap
```

### 2. That's It!

You now have:
- ✅ All 12 skills available to Claude
- ✅ MCPs configured
- ✅ Best practices enforced
- ✅ Auto-sync on every git pull

**Time:** 30 seconds
**Manual work:** 0

---

## What Just Happened?

The bootstrap automatically:

1. **Installed the CLI** (`@ai-dev-standards/cli`)
2. **Created configuration** (`.ai-dev.json`)
3. **Set up skills** (`.claude/claude.md`)
4. **Configured MCPs** (`.claude/mcp-settings.json`)
5. **Added best practices** (`.cursorrules`)
6. **Updated gitignore** (`.gitignore`)
7. **Set up auto-sync** (`.git/hooks/post-merge`)
8. **Ran initial sync** (installed everything)

---

## Try It Now

### Test 1: Ask Claude

```
You: "What skills are available from ai-dev-standards?"
```

**Expected:** Claude lists all 12 skills

---

### Test 2: Use a Skill

```
You: "Use the mvp-builder skill to help me prioritize features"
```

**Expected:** Claude uses P0/P1/P2 matrix, MVP patterns

---

### Test 3: Test Auto-Sync

```bash
git pull
```

**Expected:**
```
🔄 Auto-syncing with ai-dev-standards...
✅ Sync complete!
```

---

## Common Scenarios

### New Project

```bash
# Create project
mkdir my-app && cd my-app
npm init -y
git init

# Bootstrap
npx @ai-dev-standards/bootstrap

# Start coding!
```

---

### Existing Project

```bash
# Your project
cd ~/projects/my-existing-app

# Bootstrap (nothing breaks!)
npx @ai-dev-standards/bootstrap

# Keep coding!
```

---

### Add Integration

```bash
# Interactive setup
ai-dev setup supabase
ai-dev setup stripe
ai-dev setup openai
```

---

## Available Skills

All automatically available after bootstrap:

1. **mvp-builder** - Feature prioritization
2. **rag-implementer** - RAG systems
3. **product-strategist** - Product-market fit
4. **api-designer** - REST/GraphQL APIs
5. **frontend-builder** - React/Next.js
6. **deployment-advisor** - Infrastructure
7. **data-visualizer** - Charts/dashboards
8. **spatial-developer** - 3D/WebXR
9. **performance-optimizer** - Performance
10. **user-researcher** - User research
11. **ux-designer** - UX/UI design
12. **go-to-market-planner** - Launch strategy

---

## CLI Commands

```bash
# Sync everything
ai-dev sync

# List available skills
ai-dev list skills

# Show what's installed
ai-dev list installed

# Update specific component
ai-dev update skills

# Configure settings
ai-dev config set preferences.autoApprove true

# Get help
ai-dev --help
```

---

## Detailed Guides

Choose based on your needs:

### Quick Start (5 min)
**[DOCS/QUICK-START.md](./DOCS/QUICK-START.md)**
- Complete walkthrough
- Verification tests
- Real-world examples
- Troubleshooting

### Existing Projects (10 min)
**[DOCS/EXISTING-PROJECTS.md](./DOCS/EXISTING-PROJECTS.md)**
- Safety features
- What gets changed
- Use cases
- Customization

### Bootstrap Details (15 min)
**[DOCS/BOOTSTRAP.md](./DOCS/BOOTSTRAP.md)**
- All installation methods
- Configuration options
- Advanced usage
- Complete reference

### CLI Reference (Full)
**[DOCS/CLI-REFERENCE.md](./DOCS/CLI-REFERENCE.md)**
- Every command
- All options
- Common workflows
- Examples

---

## Key Features

### ADHD-Friendly
- ✅ One command setup
- ✅ Fully automatic
- ✅ Zero maintenance
- ✅ Always current
- ✅ No decisions

### Safe for Existing Projects
- ✅ Non-destructive
- ✅ Auto-backup
- ✅ Reversible
- ✅ Never touches source code

### Keeps Everything Current
- ✅ Auto-sync on git pull
- ✅ Skills always latest
- ✅ MCPs always configured
- ✅ Configs always updated

---

## Need Help?

### Quick Fixes

```bash
# Re-sync everything
ai-dev sync --force

# Check what's installed
ai-dev list installed

# Diagnose issues
ai-dev doctor

# Get help
ai-dev --help
```

### Documentation

- **[QUICK-START.md](./DOCS/QUICK-START.md)** - Get started fast
- **[EXISTING-PROJECTS.md](./DOCS/EXISTING-PROJECTS.md)** - For existing codebases
- **[BOOTSTRAP.md](./DOCS/BOOTSTRAP.md)** - Complete bootstrap guide
- **[CLI-REFERENCE.md](./DOCS/CLI-REFERENCE.md)** - All CLI commands
- **[SYSTEM-OVERVIEW.md](./DOCS/SYSTEM-OVERVIEW.md)** - Complete architecture

### Still Stuck?

Open an issue: [GitHub Issues](https://github.com/your-org/ai-dev-standards/issues)

---

## Bottom Line

### For New Projects:
```bash
npx @ai-dev-standards/bootstrap
```

### For Existing Projects:
```bash
npx @ai-dev-standards/bootstrap
```

### That's It!

**30 seconds. Zero config. Fully automated.**

---

**Built for excellence in AI-assisted development** 🚀
