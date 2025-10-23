# Bootstrap Installation Guide

**One-command setup for any project!**

The AI Dev Standards bootstrap system automatically installs and initializes the CLI for any project with zero manual configuration.

---

## 🚀 Quick Start

### Option 1: NPX (Recommended)

```bash
npx @ai-dev-standards/bootstrap
```

**Zero installation required!** Works immediately in any project.

### Option 2: Curl (Unix/Linux/macOS)

```bash
curl -fsSL https://ai-dev-standards.com/bootstrap.sh | bash
```

### Option 3: Wget (Unix/Linux)

```bash
wget -qO- https://ai-dev-standards.com/bootstrap.sh | bash
```

### Option 4: Manual (Development)

```bash
node /path/to/ai-dev-standards/CLI/bootstrap.js
```

---

## ✨ What It Does

The bootstrap script automatically:

1. ✅ **Checks for Node.js** (requires v18+)
2. ✅ **Installs ai-dev CLI** (global or local)
3. ✅ **Detects project type** (package.json or .git)
4. ✅ **Creates .ai-dev.json** (with sensible defaults)
5. ✅ **Sets up git hooks** (auto-sync on pull)
6. ✅ **Updates .gitignore** (adds .ai-dev.json and .ai-dev-cache/)
7. ✅ **Runs initial sync** (installs latest skills, MCPs, configs)

**Result:** Your project is fully configured and auto-synced!

---

## 📊 Example Output

```bash
$ npx @ai-dev-standards/bootstrap

🚀 AI Dev Standards Bootstrap

✅ Node.js v20.10.0 detected

✅ ai-dev CLI already installed

📋 Project not initialized. Setting up auto-sync...

  Created: .ai-dev.json
  Created: .git/hooks/post-merge
  Added to .gitignore: .ai-dev.json
  Added to .gitignore: .ai-dev-cache/

🔄 Running initial sync...

📦 Available Updates:

  • skill: api-designer
    Design REST/GraphQL APIs
  • skill: frontend-builder
    Build React/Next.js UIs
  • mcp: supabase-manager
    Manage Supabase projects
  • config: .cursorrules
    Latest best practices

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
  • Update specific: ai-dev update skills

✨ Your project is now auto-synced with ai-dev-standards!
```

---

## 🎯 Use Cases

### New Project Setup

```bash
# Create new project
mkdir my-app
cd my-app
npm init -y

# Bootstrap (installs & syncs everything)
npx @ai-dev-standards/bootstrap

# Start coding with all best practices!
```

### Existing Project Setup

```bash
# Navigate to existing project
cd my-existing-app

# Bootstrap (adds auto-sync, doesn't break existing code)
npx @ai-dev-standards/bootstrap

# Done! Your project now auto-syncs
```

### CI/CD Integration

```yaml
# .github/workflows/ci.yml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      # Auto-bootstrap on CI
      - run: npx @ai-dev-standards/bootstrap --yes

      - run: npm install
      - run: npm test
```

---

## 🔧 Configuration

### Default Configuration

The bootstrap creates `.ai-dev.json` with:

```json
{
  "version": "1.0.0",
  "lastSync": "2025-10-22T12:00:00Z",
  "tracking": [
    "skills",
    "mcps",
    "cursorrules",
    "gitignore",
    "tools"
  ],
  "frequency": "git-hook",
  "installed": {
    "skills": [],
    "mcps": [],
    "tools": [],
    "integrations": []
  },
  "preferences": {
    "autoApprove": false,
    "notifications": true,
    "backupBeforeSync": true
  }
}
```

### Customization

After bootstrap, you can customize:

```bash
# Change what gets tracked
ai-dev config set tracking "skills,mcps"

# Enable auto-approve (no prompts)
ai-dev config set preferences.autoApprove true

# Change sync frequency
ai-dev config set frequency "daily"
```

---

## 🪝 Git Hook Setup

The bootstrap automatically creates `.git/hooks/post-merge`:

```bash
#!/bin/sh
# AI Dev Standards auto-sync
# Runs after 'git pull'

echo "🔄 Auto-syncing with ai-dev-standards..."
ai-dev sync --yes --silent || echo "⚠️  Auto-sync failed. Run 'ai-dev sync' manually."
```

This ensures:
- ✅ Latest skills are available after pulling
- ✅ MCP configs stay current
- ✅ Config files (.cursorrules, .gitignore) stay updated
- ✅ No manual intervention needed

### Disable Git Hook

```bash
# Remove the hook
rm .git/hooks/post-merge

# Or change frequency in .ai-dev.json
ai-dev config set frequency "manual"
```

---

## 🔍 Troubleshooting

### "Command not found: ai-dev"

**Problem:** CLI not installed globally or not in PATH

**Solution:**
```bash
# Option 1: Global install
npm install -g @ai-dev-standards/cli

# Option 2: Use npx
npx @ai-dev-standards/cli sync

# Option 3: Local install + npm scripts
npm install --save-dev @ai-dev-standards/cli
npm run ai-dev sync
```

### "Node.js version 18+ required"

**Problem:** Outdated Node.js

**Solution:**
```bash
# Install latest Node.js LTS
# macOS (Homebrew)
brew install node

# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs

# Windows
# Download from: https://nodejs.org/
```

### "Not a project directory"

**Problem:** No package.json or .git found

**Solution:**
```bash
# Initialize git repo
git init

# Or create package.json
npm init -y

# Then run bootstrap again
npx @ai-dev-standards/bootstrap
```

### "Global install failed"

**Problem:** Insufficient permissions for global install

**Solution:**
The bootstrap automatically falls back to local install:
```bash
# Bootstrap handles this automatically!
# It tries global, then falls back to:
npm install --save-dev @ai-dev-standards/cli

# Adds npm scripts to package.json:
{
  "scripts": {
    "ai-dev": "ai-dev",
    "sync": "ai-dev sync"
  }
}

# Use with:
npm run sync
```

---

## 🧪 Testing the Bootstrap

### Dry Run (Preview Changes)

```bash
# See what would happen without applying
ai-dev sync --dry-run
```

### Manual Verification

```bash
# After bootstrap, check:

# 1. CLI installed
ai-dev --version

# 2. Config created
cat .ai-dev.json

# 3. Git hook created
cat .git/hooks/post-merge

# 4. Gitignore updated
grep ".ai-dev" .gitignore

# 5. Skills available
ai-dev list skills

# 6. MCPs configured
ai-dev list mcps
```

---

## 🚀 Advanced Usage

### Bootstrap with Custom Options

```bash
# Silent mode (no prompts)
npx @ai-dev-standards/bootstrap --yes

# Specific tracking
npx @ai-dev-standards/bootstrap --track=skills,mcps

# Skip git hooks
npx @ai-dev-standards/bootstrap --no-git-hook

# Disable auto-sync
npx @ai-dev-standards/bootstrap --frequency=manual
```

### Multiple Projects

```bash
# Bootstrap all projects in a workspace
for dir in projects/*; do
  cd "$dir"
  npx @ai-dev-standards/bootstrap --yes --silent
  cd ..
done
```

### Docker Integration

```dockerfile
FROM node:18

WORKDIR /app

# Bootstrap during image build
RUN npx @ai-dev-standards/bootstrap --yes

COPY . .

RUN npm install
CMD ["npm", "start"]
```

---

## 📚 What Gets Installed

### Skills (Auto-Installed)

The bootstrap syncs these skills to `claude.md`:

- **api-designer** - REST/GraphQL API design
- **frontend-builder** - React/Next.js components
- **mvp-builder** - Full-stack MVPs
- **deployment-advisor** - Deployment strategies
- **rag-implementer** - RAG systems
- **product-strategist** - Product strategy
- **data-visualizer** - Charts and dashboards
- **spatial-developer** - 3D/WebXR development

### MCPs (Auto-Configured)

The bootstrap configures these MCPs in `mcp-settings.json`:

- **supabase-manager** - Supabase integration
- **stripe-manager** - Stripe payments
- **accessibility-checker** - WCAG compliance
- **screenshot-testing** - Visual regression

### Config Files (Auto-Updated)

- **.cursorrules** - Cursor IDE best practices
- **.gitignore** - Standard patterns
- **.env.example** - Environment variables
- **.prettierrc** - Code formatting
- **.eslintrc.json** - Linting rules

---

## 🎓 Learn More

- [Full Documentation](./README.md)
- [Auto-Update Guide](./AUTO-UPDATE-FILES.md)
- [CLI Commands](./CLI-REFERENCE.md)
- [Skills Guide](./SKILLS.md)
- [MCPs Guide](./MCPS.md)

---

## 💡 ADHD-Friendly

**Why bootstrap is perfect for ADHD:**

✅ **One command** - No multi-step setup to forget
✅ **Fully automatic** - No decisions to make
✅ **Auto-syncing** - Never manually update
✅ **Zero maintenance** - Set once, forget forever
✅ **Always current** - Latest best practices automatically

```bash
# Literally just run this and forget:
npx @ai-dev-standards/bootstrap

# That's it! Everything else happens automatically! ✨
```

---

## 🤝 Contributing

Found an issue or want to improve the bootstrap?

```bash
# Clone the repo
git clone https://github.com/your-org/ai-dev-standards.git
cd ai-dev-standards

# Test your changes
cd CLI
node bootstrap.js

# Submit PR
git checkout -b improve-bootstrap
git commit -m "Improve bootstrap script"
git push origin improve-bootstrap
```

---

## 📝 License

MIT License - See [LICENSE](../LICENSE)

---

**Bottom Line:**

```bash
npx @ai-dev-standards/bootstrap
```

**That's literally all you need.** Everything else is automatic! 🎉
