# Auto-Updated Configuration Files

**YES! ALL key files are automatically updated!**

When you run `ai-dev sync`, it updates **everything** your project needs to stay current with best practices.

## 📋 What Gets Auto-Updated

### ✅ Always Updated (Every Sync)

These files are automatically kept in sync:

| File | What It Does | Merge Strategy |
|------|--------------|----------------|
| **claude.md** | Skills available to Claude | Append new skills |
| **mcp-settings.json** | MCP server configurations | Add new MCPs |
| **.cursorrules** | Cursor IDE best practices | Replace with latest |
| **.gitignore** | Files to ignore in git | Merge patterns (no duplicates) |
| **.env.example** | Environment variable template | Merge new variables |
| **.prettierrc** | Code formatting rules | Replace with latest |
| **.eslintrc.json** | Linting rules | Smart merge (preserves custom rules) |

### 🔧 Optionally Updated (On Request)

These files update when you explicitly sync them:

| File | What It Does | When to Update |
|------|--------------|----------------|
| **tsconfig.json** | TypeScript configuration | Major TypeScript updates |
| **tailwind.config.js** | Tailwind CSS setup | New Tailwind features |
| **package.json** | Dependencies | New recommended packages |
| **jest.config.js** | Test configuration | Testing strategy changes |
| **playwright.config.ts** | E2E test setup | Playwright updates |

---

## 🎯 How It Works

### 1. Automatic Update on Git Pull

If you enabled git-hook mode:

```bash
git pull

# Automatically runs:
🔄 Auto-syncing with ai-dev-standards...

✅ Updated .cursorrules with latest best practices
✅ Merged new patterns into .gitignore
✅ Added 2 new skills to claude.md
✅ Configured accessibility-checker MCP
✅ Updated .env.example with new variables

Done!
```

### 2. Manual Sync Anytime

```bash
ai-dev sync

📦 Available Updates:

Config Files:
  • .cursorrules - Updated TypeScript patterns
  • .gitignore - Added .ai-dev-cache/
  • .env.example - Added ANTHROPIC_API_KEY

Skills:
  • spatial-developer - WebXR development
  • 3d-visualizer - Three.js patterns

MCPs:
  • screenshot-testing - Visual regression

? Apply these updates? Yes

✅ All files updated!
```

### 3. Update Specific Files

```bash
# Update just config files
ai-dev update config-files

# Update just cursor rules
ai-dev update cursorrules

# Update everything
ai-dev update all
```

---

## 📝 File Details

### **.cursorrules** - Cursor IDE Rules

**What it contains:**
- TypeScript best practices
- React patterns (functional components, hooks)
- Code style guidelines
- Testing requirements
- Accessibility rules
- Performance patterns

**Auto-updated:** YES (every sync)
**Strategy:** Replace (you get latest best practices)

**Example:**
```
# AI Dev Standards - Cursor Rules

## Core Principles
- TypeScript strict mode
- Functional components
- Zod validation
- Tailwind CSS
- Server components (Next.js 14)

## Code Style
✅ Explicit types
✅ Functional components
✅ Zod validation
❌ No 'any' types
❌ No class components
```

---

### **.gitignore** - Git Ignore Patterns

**What it contains:**
- node_modules/
- Build artifacts (.next/, dist/)
- Environment files (.env*)
- IDE files (.vscode/, .idea/)
- OS files (.DS_Store)
- Temporary files (*.tmp, *.log)
- AI Dev Standards cache (.ai-dev.json, .ai-dev-cache/)

**Auto-updated:** YES (every sync)
**Strategy:** Merge (no duplicates, preserves custom patterns)

**Example:**
```
# Auto-merged with your existing patterns

node_modules/
.env
.env.local
.next/
.ai-dev.json    ← Added automatically
.ai-dev-cache/  ← Added automatically
```

---

### **.env.example** - Environment Variables

**What it contains:**
- All supported integrations
- API keys for Supabase, Stripe, OpenAI, etc.
- Database URLs
- Service configurations

**Auto-updated:** YES (every sync)
**Strategy:** Merge (adds new variables, keeps existing)

**Example:**
```
# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Auto-added when you setup new integrations:
# ANTHROPIC_API_KEY=        ← Added automatically
# PINECONE_API_KEY=         ← Added automatically
```

---

### **tsconfig.json** - TypeScript Config

**What it contains:**
- Strict mode enabled
- Module resolution
- Path aliases (@/components, @/lib)
- Next.js plugin configuration

**Auto-updated:** On request
**Strategy:** Smart merge (preserves your custom paths)

**When to update:**
```bash
ai-dev update tsconfig
```

---

### **.prettierrc** - Code Formatting

**What it contains:**
- No semicolons
- Single quotes
- 100 character line width
- ES5 trailing commas
- Tailwind plugin

**Auto-updated:** YES (every sync)
**Strategy:** Replace

**Example:**
```json
{
  "semi": false,
  "singleQuote": true,
  "printWidth": 100,
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

---

### **.eslintrc.json** - Linting Rules

**What it contains:**
- Next.js defaults
- TypeScript rules
- No unused variables
- No console.log (warnings)
- Prefer const over let

**Auto-updated:** YES (every sync)
**Strategy:** Smart merge (adds new rules, keeps your overrides)

---

### **tailwind.config.js** - Tailwind CSS

**What it contains:**
- Content paths
- Theme extensions (colors, spacing)
- Custom utilities
- Plugins (@tailwindcss/forms, @tailwindcss/typography)

**Auto-updated:** On request
**Strategy:** Smart merge (preserves your custom theme)

**When to update:**
```bash
ai-dev update tailwind-config
```

---

## 🔒 What's Protected (Never Auto-Changed)

These files are **NEVER** touched by auto-sync:

- ✅ **Your source code** (`app/`, `components/`, `lib/`)
- ✅ **package.json** (unless you explicitly run `ai-dev update dependencies`)
- ✅ **Your data** (`.env.local`, database files)
- ✅ **Custom configurations** (if you've heavily modified them)
- ✅ **Git history**

---

## 🎨 Merge Strategies Explained

### **Replace**
```
Old file is completely replaced with new version.
Use for: .cursorrules, .prettierrc
```

### **Merge**
```
New lines added to existing file.
Duplicates removed.
Your custom lines preserved.
Use for: .gitignore, .env.example
```

### **Smart Merge**
```
JSON objects merged intelligently.
New keys added.
Existing keys preserved.
Your overrides kept.
Use for: tsconfig.json, .eslintrc.json
```

---

## 🧪 Test It Out

### See What Would Update (Dry Run)

```bash
ai-dev sync --dry-run

# Shows what would change without applying:
Would update:
  • .cursorrules (22 lines changed)
  • .gitignore (3 new patterns)
  • .env.example (5 new variables)
  • claude.md (2 new skills)
```

### Backup Before Sync

```bash
# Auto-backup is built-in!
ai-dev sync

# Creates:
.cursorrules.backup
.gitignore.backup
.env.example.backup

# If something goes wrong, restore:
mv .cursorrules.backup .cursorrules
```

---

## 📊 Version Tracking

The system tracks what version of each config you have:

```json
{
  "configFiles": {
    ".cursorrules": {
      "version": "1.0.0",
      "lastUpdated": "2025-10-22T12:00:00Z",
      "hash": "abc123..."
    },
    ".gitignore": {
      "version": "1.0.0",
      "lastUpdated": "2025-10-22T12:00:00Z"
    }
  }
}
```

When the version in `META/registry.json` is newer, an update is available.

---

## 🚀 Real-World Example

### Scenario: New Best Practice Added

**In ai-dev-standards repo:**
```bash
# Update .cursorrules with new pattern
# Update registry version: 1.0.0 → 1.1.0
git commit -m "Add Zod validation pattern to cursor rules"
git push
```

**In your project:**
```bash
git pull  # Pull your code changes

# Auto-sync detects new version:
🔄 Auto-syncing with ai-dev-standards...

📦 Config file update available:
  • .cursorrules (v1.0.0 → v1.1.0)
    Added: Zod validation best practices

? Apply update? Yes

✅ .cursorrules updated with latest patterns

Done!
```

**Your .cursorrules now has the new pattern automatically!**

---

## 🎯 Commands Summary

```bash
# Sync everything
ai-dev sync

# Sync specific file
ai-dev update cursorrules
ai-dev update gitignore
ai-dev update env-example

# Sync all config files
ai-dev update config-files

# Dry run (preview changes)
ai-dev sync --dry-run

# Silent sync (for automation)
ai-dev sync --yes --silent
```

---

## ✅ Bottom Line

**YES, all key files are auto-updated!**

When you run `ai-dev sync`:

✅ **.cursorrules** → Latest best practices
✅ **.gitignore** → Latest patterns
✅ **.env.example** → Latest variables
✅ **.prettierrc** → Latest formatting
✅ **.eslintrc.json** → Latest linting
✅ **claude.md** → Latest skills
✅ **mcp-settings.json** → Latest MCPs

**Plus optionally:**

🔧 **tsconfig.json** → TypeScript updates
🔧 **tailwind.config.js** → Tailwind updates
🔧 **package.json** → Dependency updates

**Everything works automatically. Zero manual copying.** 🎉

---

## 🧠 ADHD-Friendly

**Why this is perfect:**

✅ **Set once** → Choose what to track
✅ **Forget forever** → Runs automatically
✅ **No decisions** → `--yes` flag auto-approves
✅ **Always current** → Never behind on best practices
✅ **No manual work** → Zero file editing

```bash
# Setup once
ai-dev sync

# Never think about config files again!
# They stay up-to-date automatically! ✨
```
