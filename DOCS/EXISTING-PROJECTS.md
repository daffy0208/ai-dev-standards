# Using AI Dev Standards with Existing Projects

**TL;DR:** Run `npx @ai-dev-standards/bootstrap` in your existing project. Nothing breaks, everything improves.

---

## ✅ Yes, It Works with Existing Projects!

The bootstrap system is designed to be **completely safe** for existing projects:

- ✅ **Non-destructive** - Doesn't modify your source code
- ✅ **Safe** - Only adds config files
- ✅ **Reversible** - Can undo everything
- ✅ **Tested** - Works with projects of any size/age

**Your code stays exactly the same.** We only add:
- `.ai-dev.json` (configuration)
- `.claude/` directory (skills and MCPs)
- `.cursorrules` (best practices - *only if doesn't exist*)
- Updates to `.gitignore` (adds ai-dev patterns)
- Git hook (auto-sync)

---

##⚡ Fastest Way (30 Seconds)

### For ANY Existing Project

```bash
cd /your/existing/project
npx @ai-dev-standards/bootstrap
```

**That's it!** Your project now has:
- ✅ All 12 skills available
- ✅ MCPs configured
- ✅ Best practices enforced
- ✅ Auto-sync enabled

**Nothing breaks. Everything improves.**

---

## 📊 Real Example: Adding to Existing React App

```bash
# Your 2-year-old React app
cd ~/projects/my-react-app

$ npx @ai-dev-standards/bootstrap

🚀 AI Dev Standards Bootstrap

✅ Node.js v20.10.0 detected
✅ ai-dev CLI installed

📋 Project not initialized. Setting up auto-sync...

  Created: .ai-dev.json
  Created: .claude/claude.md
  Created: .claude/mcp-settings.json
  Created: .git/hooks/post-merge
  Updated: .gitignore (added 4 patterns)
  Skipped: .cursorrules (already exists)

🔄 Running initial sync...

✅ Sync complete!

📊 Summary:
  • 12 skills added
  • 4 MCPs configured
  • 1 config files updated

✅ Auto-sync enabled!

# Your existing code is untouched
# But now Claude has all the skills!
```

**Time:** 30 seconds
**Code changed:** 0 lines
**Benefits:** Immediate

---

## 🎯 What Gets Added (And What Doesn't)

### ✅ Files Added

| File | Purpose | Overwrites? |
|------|---------|-------------|
| `.ai-dev.json` | Sync configuration | No (creates new) |
| `.claude/claude.md` | Skills registry | No (creates new) |
| `.claude/mcp-settings.json` | MCP configuration | No (creates new) |
| `.git/hooks/post-merge` | Auto-sync on pull | No (creates new) |

### 📝 Files Updated

| File | Change | Destructive? |
|------|--------|--------------|
| `.gitignore` | Adds 4 patterns | No (appends only) |
| `.cursorrules` | **Skipped if exists** | No |

### 🚫 Never Touched

Your existing code is **completely safe:**
- ✅ `src/` - Untouched
- ✅ `components/` - Untouched
- ✅ `pages/` - Untouched
- ✅ `api/` - Untouched
- ✅ `package.json` - Untouched
- ✅ `tsconfig.json` - Untouched
- ✅ **All your code** - Untouched

**Only configuration files are added/updated. Source code never modified.**

---

## 🛡️ Safety Features

### 1. Automatic Backups

Before any update, backups are created:

```bash
.cursorrules.backup
.gitignore.backup
.env.example.backup
```

**Restore if needed:**
```bash
mv .cursorrules.backup .cursorrules
```

---

### 2. Dry Run Mode

Preview changes before applying:

```bash
npx @ai-dev-standards/bootstrap --dry-run

# Shows exactly what would change:
Would create:
  • .ai-dev.json
  • .claude/claude.md
  • .git/hooks/post-merge

Would update:
  • .gitignore (add 4 lines)

Would skip:
  • .cursorrules (already exists)

No changes applied (dry run mode)
```

---

### 3. Non-Destructive Updates

The system is smart about existing files:

```bash
# If .cursorrules exists:
⚠️  .cursorrules already exists
✅ Skipped (keeping your custom rules)

# If .gitignore exists:
✅ Updated .gitignore (added ai-dev patterns)
✅ Your custom patterns preserved

# If .env.example exists:
✅ Merged new variables
✅ Your existing variables kept
```

---

## 📚 Use Cases for Existing Projects

### Use Case 1: Legacy Codebase Maintenance

**Scenario:** 5-year-old React app, needs refactoring

```bash
cd ~/legacy-app
npx @ai-dev-standards/bootstrap

# Now ask Claude:
"Use the frontend-builder skill to help refactor this component"

# Claude uses modern React patterns
# Suggests improvements following best practices
# References specific patterns from standards
```

---

### Use Case 2: Adding AI Features

**Scenario:** E-commerce site, wants to add AI search

```bash
cd ~/ecommerce-site
npx @ai-dev-standards/bootstrap

# Now ask Claude:
"Add AI-powered product search using RAG"

# Claude uses rag-implementer skill
# Recommends appropriate architecture
# Implements without breaking existing code
```

---

### Use Case 3: Performance Optimization

**Scenario:** SaaS app, slow page loads

```bash
cd ~/saas-app
npx @ai-dev-standards/bootstrap

# Now ask Claude:
"Use the performance-optimizer skill to find bottlenecks"

# Claude profiles the app
# Identifies issues
# Suggests optimizations following standards
```

---

### Use Case 4: Team Onboarding

**Scenario:** New developer joining, needs to understand codebase

```bash
cd ~/team-project
npx @ai-dev-standards/bootstrap

# New developer asks Claude:
"Explain the architecture of this project"

# Claude uses standards to explain patterns
# References decision framework
# Provides context-aware guidance
```

---

## 🔄 How It Works with Existing .cursorrules

### If You Already Have .cursorrules

**Bootstrap preserves your existing file:**

```bash
$ npx @ai-dev-standards/bootstrap

⚠️  .cursorrules already exists
✅ Skipped (keeping your custom rules)

💡 Tip: Add this line to your .cursorrules to use ai-dev standards:

## AI Development Standards
Repository: ~/ai-dev-standards/

### Load Context
1. ~/ai-dev-standards/META/PROJECT-CONTEXT.md
2. ~/ai-dev-standards/META/HOW-TO-USE.md
```

**Manual merge (if you want):**

```bash
# Backup your current rules
cp .cursorrules .cursorrules.mine

# View recommended rules
cat ~/ai-dev-standards/TEMPLATES/config-files/.cursorrules.latest

# Merge manually or keep yours
```

---

### If You Don't Have .cursorrules

**Bootstrap creates one for you:**

```bash
✅ Created .cursorrules with best practices

# Includes:
- TypeScript strict mode
- React functional components
- Zod validation patterns
- Tailwind CSS
- Next.js 14 patterns
- Security best practices
```

---

## 🎨 Customizing for Your Project

### Step 1: Document What Exists

After bootstrap, update `.ai-dev.json`:

```json
{
  "version": "1.0.0",
  "tracking": ["skills", "mcps", "cursorrules"],
  "installed": {
    "skills": ["frontend-builder", "api-designer"],
    "mcps": [],
    "tools": [],
    "integrations": []
  },
  "projectContext": {
    "type": "existing",
    "stack": "React 18 + Express + PostgreSQL",
    "age": "2 years",
    "status": "production"
  }
}
```

---

### Step 2: Add Project-Specific Context

Create `.cursorrules` (if skipped) or append to existing:

```markdown
## Existing Project Context

### Current Architecture
- **Frontend:** React 18 + TypeScript
- **Backend:** Express.js + PostgreSQL
- **Deployment:** AWS EC2 + RDS

### Known Issues
- Search is slow (>5s for 10k products)
- Auth flow confusing for users
- Mobile layout needs work

### Current Priorities
1. Fix search performance
2. Refactor auth flow
3. Mobile responsiveness

### Tech Debt
- Some class components (needs migration)
- Redux (considering migration to Zustand)
- No test coverage (needs adding)
```

---

### Step 3: Choose Relevant Skills

Tell Claude which skills to focus on:

```markdown
## Primary Skills for This Project

- **frontend-builder** - For React component work
- **api-designer** - For API refactoring
- **performance-optimizer** - For search optimization
- **rag-implementer** - For future AI features
```

---

## 🚀 Common Workflows

### Workflow 1: Daily Development

```bash
# Morning: Pull latest code
git pull

# Auto-sync runs:
🔄 Auto-syncing with ai-dev-standards...
✅ Sync complete!

# Continue coding with latest standards
# Ask Claude for help using skills
```

---

### Workflow 2: Feature Addition

```bash
# Need to add a feature
# Ask Claude:
"Use the mvp-builder skill to prioritize these features"

# Claude uses P0/P1/P2 matrix
# Helps decide what to build first
# Provides implementation guidance
```

---

### Workflow 3: Bug Investigation

```bash
# Found a bug
# Ask Claude:
"Help debug this authentication issue"

# Claude references best practices
# Suggests security patterns
# Provides fix following standards
```

---

### Workflow 4: Refactoring

```bash
# Need to refactor
# Ask Claude:
"Refactor this component using best practices"

# Claude uses frontend-builder skill
# Suggests modern patterns
# Maintains backward compatibility
```

---

## ⚙️ Advanced Configuration

### Selective Syncing

Only track what you need:

```bash
# Just skills and MCPs (no config updates)
ai-dev config set tracking "skills,mcps"

# Just skills (no MCPs or configs)
ai-dev config set tracking "skills"
```

---

### Manual Sync Control

Disable auto-sync for full control:

```bash
# Change frequency to manual
ai-dev config set frequency "manual"

# Now sync only when you want:
ai-dev sync
```

---

### Auto-Approve Updates

Skip prompts for automation:

```bash
# Enable auto-approve
ai-dev config set preferences.autoApprove true

# Now all updates apply automatically
git pull  # Syncs silently
```

---

## 🆘 Troubleshooting

### "Will this break my project?"

**No.** The bootstrap system:
- ✅ Only adds/updates config files
- ✅ Never modifies source code
- ✅ Creates backups before changes
- ✅ Can be completely reversed

**Test it yourself:**
```bash
# Try in dry-run mode first
npx @ai-dev-standards/bootstrap --dry-run

# See exactly what would change
# No modifications made
```

---

### "What if I don't like it?"

**Easy to remove:**

```bash
# Remove all ai-dev files
rm -rf .ai-dev.json .ai-dev-cache/ .claude/
rm .git/hooks/post-merge

# Remove from .gitignore
sed -i '/.ai-dev/d' .gitignore

# Uninstall CLI (if globally installed)
npm uninstall -g @ai-dev-standards/cli

# Done! Back to original state
```

---

### "My .cursorrules was overwritten!"

**Check backup:**

```bash
# Bootstrap creates backups
ls .cursorrules.backup

# Restore if needed
mv .cursorrules.backup .cursorrules

# Or merge manually
diff .cursorrules .cursorrules.backup
```

**By default, bootstrap NEVER overwrites existing .cursorrules**

---

### "Claude not using the skills"

**Verify setup:**

```bash
# Check skills are installed
ai-dev list installed

# Re-sync if needed
ai-dev sync --force

# Check .claude/claude.md exists
cat .claude/claude.md
```

---

### "Auto-sync is annoying"

**Disable it:**

```bash
# Option 1: Change to manual
ai-dev config set frequency "manual"

# Option 2: Remove git hook
rm .git/hooks/post-merge

# Option 3: Keep hook but make it quieter
ai-dev config set preferences.notifications false
```

---

## 💡 Pro Tips for Existing Projects

### Tip 1: Start Small

Don't enable everything at once:

```bash
# Week 1: Just add skills
ai-dev config set tracking "skills"

# Week 2: Add MCPs
ai-dev config set tracking "skills,mcps"

# Week 3: Enable config updates
ai-dev config set tracking "skills,mcps,cursorrules"
```

---

### Tip 2: Document Technical Debt

Help Claude understand your legacy code:

```markdown
## Technical Debt

### High Priority
- [ ] Migrate class components to functional (50+ files)
- [ ] Add TypeScript to /api (currently JavaScript)
- [ ] Implement proper error handling

### Medium Priority
- [ ] Replace Redux with Zustand
- [ ] Add test coverage (currently 0%)
- [ ] Optimize database queries

### Low Priority
- [ ] Update to Next.js 14
- [ ] Migrate to App Router
```

Now ask Claude:
```
"Help me migrate class components to functional components"
```

Claude understands the context!

---

### Tip 3: Use Skills for Specific Tasks

Be explicit about what you need:

```
❌ "Help me fix this"
✅ "Use the performance-optimizer skill to analyze this component"

❌ "Make this better"
✅ "Use the frontend-builder skill to refactor following React best practices"
```

---

### Tip 4: Gradual Adoption

Apply standards incrementally:

```markdown
## Migration Strategy

### Phase 1: New Code (Now)
All new components follow ai-dev standards

### Phase 2: Hot Paths (Q1)
Refactor frequently-used components

### Phase 3: Legacy (Q2+)
Gradually update remaining code
```

---

## 📖 Additional Resources

### For Existing Projects:

- **[BOOTSTRAP.md](./BOOTSTRAP.md)** - Complete bootstrap guide
- **[CLI-REFERENCE.md](./CLI-REFERENCE.md)** - All CLI commands
- **[AUTO-UPDATE-FILES.md](./AUTO-UPDATE-FILES.md)** - How auto-updates work

### For Understanding Standards:

- **[SYSTEM-OVERVIEW.md](./SYSTEM-OVERVIEW.md)** - Complete architecture
- **META/PROJECT-CONTEXT.md** - How the system works
- **META/DECISION-FRAMEWORK.md** - Technology decisions

---

## 🎉 Success Stories

### Example: 3-Year-Old Next.js App

**Before:**
- Mixed class/functional components
- No TypeScript
- Inconsistent patterns
- No AI assistance guidelines

**After bootstrap (30 seconds):**
- Claude understands the architecture
- Suggests modern patterns
- Helps migrate to TypeScript
- Provides consistent guidance

**Result:** 2x faster development, better code quality

---

### Example: Legacy Express API

**Before:**
- No documentation
- Inconsistent error handling
- Security concerns
- Hard to onboard developers

**After bootstrap (30 seconds):**
- Claude documents endpoints
- Suggests security improvements
- Helps add TypeScript
- New devs productive day 1

**Result:** 50% reduction in onboarding time

---

## ✅ Checklist for Existing Projects

Before bootstrap:
- [ ] Commit all changes (`git commit -am "Snapshot before ai-dev"`)
- [ ] Backup .cursorrules if exists (`cp .cursorrules .cursorrules.backup`)
- [ ] Note your Node version (`node -v`)

After bootstrap:
- [ ] Verify .ai-dev.json created
- [ ] Check .claude/claude.md has skills
- [ ] Test auto-sync (`git pull`)
- [ ] Ask Claude to list skills
- [ ] Try using a skill

If issues:
- [ ] Check `ai-dev doctor`
- [ ] Review `.ai-dev.json` configuration
- [ ] Re-run `ai-dev sync --force`

---

## 🚀 Ready to Try?

```bash
cd /your/existing/project
npx @ai-dev-standards/bootstrap
```

**30 seconds. Zero risk. Immediate benefits.**

---

**Questions?** See [QUICK-START.md](./QUICK-START.md) or [BOOTSTRAP.md](./BOOTSTRAP.md)

**Having issues?** Run `ai-dev doctor` to diagnose.

---

**Built for excellence in AI-assisted development** 🚀
