# Quick Start: Get AI Dev Standards Running in 30 Seconds

**TL;DR:** Run one command, start coding with best practices.

---

## ⚡ Fastest Way (30 Seconds)

### For ANY Project (New or Existing)

```bash
cd /your/project
npx @ai-dev-standards/bootstrap
```

**That's it!** ✨

This automatically:
- ✅ Installs the ai-dev CLI
- ✅ Creates `.ai-dev.json` configuration
- ✅ Sets up `.claude/` with all 12 skills
- ✅ Configures MCPs (Supabase, Stripe, etc.)
- ✅ Updates `.cursorrules` with best practices
- ✅ Updates `.gitignore` with standard patterns
- ✅ Sets up git hooks (auto-sync on every pull)
- ✅ Runs initial sync

**Works for:**
- ✅ New projects (just created)
- ✅ Existing projects (any size)
- ✅ Projects with or without git
- ✅ Projects with or without package.json

---

## 📊 What You'll See

```bash
$ npx @ai-dev-standards/bootstrap

🚀 AI Dev Standards Bootstrap

✅ Node.js v20.10.0 detected
✅ ai-dev CLI already installed

📋 Project not initialized. Setting up auto-sync...

  Created: .ai-dev.json
  Created: .claude/claude.md
  Created: .claude/mcp-settings.json
  Created: .git/hooks/post-merge
  Added to .gitignore: .ai-dev.json
  Added to .gitignore: .ai-dev-cache/

🔄 Running initial sync...

📦 Available Updates:

  • skill: mvp-builder
    Rapid MVP development
  • skill: api-designer
    Design REST/GraphQL APIs
  • mcp: supabase-manager
    Manage Supabase projects
  • config: .cursorrules
    Best practices for TypeScript/React

🔧 Applying updates...

✅ Sync complete!

📊 Summary:
  • 2 skills added
  • 1 MCPs configured
  • 1 config files updated

✅ Auto-sync enabled!

📚 What happens now:
  • Auto-sync runs after every git pull
  • Skills, MCPs, and configs stay up-to-date
  • Run manually: ai-dev sync

✨ Your project is now auto-synced with ai-dev-standards!
```

---

## ✅ Verify It's Working

### Test 1: Check What Was Created

```bash
# Check files
ls .ai-dev.json .claude/ .git/hooks/post-merge

# View your skills
cat .claude/claude.md

# View MCPs
cat .claude/mcp-settings.json
```

**Expected:**
- `.ai-dev.json` exists
- `.claude/claude.md` lists all skills
- `.claude/mcp-settings.json` has MCP configs
- `.git/hooks/post-merge` is executable

---

### Test 2: Ask Claude About Skills

Open your project in Claude Code and ask:

```
You: "What skills are available from ai-dev-standards?"
```

**Expected:** Claude lists all 12 skills:
- mvp-builder, rag-implementer, product-strategist
- api-designer, frontend-builder, deployment-advisor
- And 6 more...

✅ **If yes:** Working perfectly!
❌ **If no:** Run `ai-dev sync` manually

---

### Test 3: Use a Skill

```
You: "Use the mvp-builder skill to help me prioritize features"
```

**Expected:** Claude references P0/P1/P2 matrix, MVP patterns, feature prioritization

✅ **If yes:** Skills are active!

---

### Test 4: Test Auto-Sync

```bash
# Simulate a git pull
git pull

# Should see:
🔄 Auto-syncing with ai-dev-standards...
✅ Sync complete!
```

✅ **If yes:** Auto-sync working!

---

## 🎯 Real-World Examples

### Example 1: Brand New Project

```bash
# Create new project
mkdir my-saas-app
cd my-saas-app
npm init -y
git init

# Bootstrap (30 seconds)
npx @ai-dev-standards/bootstrap

# Start building
# Ask Claude: "Help me build a SaaS MVP for [your idea]"
# Claude automatically uses mvp-builder, product-strategist, etc.
```

---

### Example 2: Existing React App

```bash
# Navigate to your project
cd ~/projects/my-react-app

# Bootstrap (30 seconds)
npx @ai-dev-standards/bootstrap

# Continue working
# Ask Claude: "Help me optimize this component"
# Claude uses frontend-builder and performance-optimizer skills
```

---

### Example 3: Adding AI to Existing App

```bash
# Your existing app
cd ~/projects/my-docs-app

# Bootstrap
npx @ai-dev-standards/bootstrap

# Add AI search
# Ask Claude: "Add AI-powered search using RAG"
# Claude uses rag-implementer skill + rag-pattern.md
```

---

## 🎨 What Each File Does

After bootstrap, you'll have:

### `.ai-dev.json` - Configuration
```json
{
  "version": "1.0.0",
  "tracking": ["skills", "mcps", "cursorrules", "gitignore"],
  "frequency": "git-hook",
  "installed": {
    "skills": ["mvp-builder", "api-designer"],
    "mcps": ["supabase-manager"]
  }
}
```
**Purpose:** Tracks what's installed, controls auto-sync

---

### `.claude/claude.md` - Skills
```markdown
# Claude Configuration

## Skills

### mvp-builder
Rapid MVP development with P0/P1/P2 prioritization

**Location:** `/path/to/ai-dev-standards/SKILLS/mvp-builder/SKILL.md`

### api-designer
Design REST and GraphQL APIs
...
```
**Purpose:** Makes skills available to Claude

---

### `.claude/mcp-settings.json` - MCPs
```json
{
  "mcpServers": {
    "supabase-manager": {
      "command": "npx",
      "args": ["-y", "@ai-dev-standards/mcp-supabase"],
      "env": {
        "SUPABASE_URL": "${SUPABASE_URL}"
      }
    }
  }
}
```
**Purpose:** Configures MCP servers for Claude

---

### `.cursorrules` - Best Practices
```markdown
# AI Dev Standards - Best Practices

## TypeScript
✅ Use strict mode
✅ Explicit return types
❌ No 'any' types

## React
✅ Functional components
✅ Hooks
❌ Class components
...
```
**Purpose:** Enforces best practices in your code

---

### `.git/hooks/post-merge` - Auto-Sync
```bash
#!/bin/sh
echo "🔄 Auto-syncing with ai-dev-standards..."
ai-dev sync --yes --silent
```
**Purpose:** Keeps everything current automatically

---

## 📚 Next Steps

### 1. Explore Available Commands

```bash
# List all CLI commands
ai-dev --help

# List available skills
ai-dev list skills

# List available MCPs
ai-dev list mcps

# Show what's installed
ai-dev list installed
```

---

### 2. Customize Configuration

```bash
# Change what gets tracked
ai-dev config set tracking "skills,mcps"

# Enable auto-approve (no prompts)
ai-dev config set preferences.autoApprove true

# Change sync frequency
ai-dev config set frequency "daily"
```

---

### 3. Add Integrations

```bash
# Interactive Supabase setup
ai-dev setup supabase

# Interactive Stripe setup
ai-dev setup stripe

# Interactive OpenAI setup
ai-dev setup openai
```

Each setup command:
- Installs npm packages
- Creates client code
- Updates .env files
- Configures MCPs

---

### 4. Learn the Skills

Browse available skills:

```bash
# Show details about a skill
ai-dev info skill mvp-builder

# Read skill documentation
cat .claude/skills/mvp-builder/README.md
```

**All 12 skills:**
1. **mvp-builder** - Feature prioritization, MVP patterns
2. **rag-implementer** - RAG system implementation
3. **product-strategist** - Product-market fit validation
4. **api-designer** - REST/GraphQL API design
5. **frontend-builder** - React/Next.js development
6. **deployment-advisor** - Infrastructure decisions
7. **data-visualizer** - Charts and dashboards
8. **spatial-developer** - 3D/WebXR development
9. **performance-optimizer** - Performance tuning
10. **user-researcher** - User research methodology
11. **ux-designer** - UX/UI design
12. **go-to-market-planner** - Launch strategy

---

## 🆘 Troubleshooting

### "Command not found: ai-dev"

**Solution:**
```bash
# Option 1: Install globally
npm install -g @ai-dev-standards/cli

# Option 2: Use npx
npx @ai-dev-standards/cli sync

# Option 3: Re-run bootstrap
npx @ai-dev-standards/bootstrap
```

---

### "Not a project directory"

**Solution:**
```bash
# Initialize as npm project
npm init -y

# OR initialize as git repo
git init

# Then run bootstrap again
npx @ai-dev-standards/bootstrap
```

---

### Claude Not Loading Skills

**Check:**
1. `.claude/claude.md` exists
2. Skills are listed in file
3. Path to ai-dev-standards is correct

**Fix:**
```bash
# Re-sync everything
ai-dev sync --force

# Check installation
ai-dev list installed
```

---

### Auto-Sync Not Working

**Check git hook:**
```bash
# Verify hook exists
cat .git/hooks/post-merge

# Make it executable
chmod +x .git/hooks/post-merge

# Test manually
bash .git/hooks/post-merge
```

---

## 💡 Pro Tips

### Tip 1: Auto-Approve Updates

Skip confirmation prompts:

```bash
# Set once
ai-dev config set preferences.autoApprove true

# Now sync runs without asking
git pull  # Auto-syncs silently
```

**Perfect for ADHD:** Set once, forget forever!

---

### Tip 2: Sync Specific Things

```bash
# Just update skills
ai-dev update skills

# Just update config files
ai-dev update config-files

# Just update .cursorrules
ai-dev update cursorrules
```

---

### Tip 3: Dry Run Before Applying

Preview changes without applying:

```bash
ai-dev sync --dry-run

# Shows:
Would update:
  • .cursorrules (22 lines changed)
  • .gitignore (3 new patterns)
```

---

### Tip 4: Backup Everything

Automatic backup before updates (enabled by default):

```bash
# Updates create backups:
.cursorrules.backup
.gitignore.backup
.env.example.backup

# Restore if needed
mv .cursorrules.backup .cursorrules
```

---

## 📖 Additional Guides

### For Different Scenarios:

- **[BOOTSTRAP.md](./BOOTSTRAP.md)** - Complete bootstrap guide (all options)
- **[EXISTING-PROJECTS.md](./EXISTING-PROJECTS.md)** - Detailed guide for existing projects
- **[CLI-REFERENCE.md](./CLI-REFERENCE.md)** - All CLI commands
- **[AUTO-UPDATE-FILES.md](./AUTO-UPDATE-FILES.md)** - How auto-updates work

### For Deep Dives:

- **[SYSTEM-OVERVIEW.md](./SYSTEM-OVERVIEW.md)** - Complete architecture
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Publishing your own
- **[INTEGRATION-GUIDE.md](./INTEGRATION-GUIDE.md)** - Advanced integration

---

## 🎉 You're Ready!

**What you have now:**
- ✅ All 12 skills available to Claude
- ✅ MCPs configured for common services
- ✅ Best practices enforced via .cursorrules
- ✅ Auto-sync on every git pull
- ✅ Config files always current

**What happens automatically:**
- ✅ Skills update when standards update
- ✅ New MCPs become available automatically
- ✅ Config files get latest best practices
- ✅ Zero maintenance needed

**Next:** Just start coding! Claude has everything it needs. 🚀

---

## Alternative: Manual Setup

**Don't want auto-bootstrap?** Use manual method:

```bash
# Copy template
cp ~/ai-dev-standards/TEMPLATES/cursorrules-saas.md .cursorrules

# Edit to add your details
# Done!
```

**Trade-offs:**
- ✅ More control
- ❌ No auto-sync
- ❌ Manual updates needed
- ❌ No MCP configuration
- ❌ No CLI commands

**Recommendation:** Use bootstrap for 99% of cases.

---

**Questions?** See [BOOTSTRAP.md](./BOOTSTRAP.md) or [CLI-REFERENCE.md](./CLI-REFERENCE.md)

**Having issues?** Run `ai-dev doctor` to diagnose.

---

**Built for excellence in AI-assisted development** 🚀
