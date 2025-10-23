# AI Dev Standards CLI Reference

Complete command reference for the `ai-dev` CLI tool.

---

## Installation

```bash
# Option 1: Auto-bootstrap (recommended)
npx @ai-dev-standards/bootstrap

# Option 2: Global install
npm install -g @ai-dev-standards/cli

# Option 3: Local development
cd ai-dev-standards/CLI
npm install
npm link
```

---

## Core Commands

### `ai-dev sync`

Sync your project with the latest skills, MCPs, and config files from ai-dev-standards.

```bash
# Interactive sync (prompts for approval)
ai-dev sync

# Auto-approve all updates
ai-dev sync --yes

# Silent mode (no output)
ai-dev sync --yes --silent

# Dry run (preview changes)
ai-dev sync --dry-run
```

**What it syncs:**
- Skills (to `claude.md`)
- MCP configurations (to `mcp-settings.json`)
- Config files (`.cursorrules`, `.gitignore`, `.env.example`, etc.)
- Tool configurations

**Example output:**
```
🔄 Syncing with ai-dev-standards...

📦 Available Updates:

  • skill: api-designer
    Design REST/GraphQL APIs
  • mcp: supabase-manager
    Manage Supabase projects
  • config: .cursorrules
    Updated TypeScript patterns

? Apply these updates? Yes

✅ Sync complete!

📊 Summary:
  • 1 skills added
  • 1 MCPs configured
  • 1 config files updated
```

---

### `ai-dev update <type>`

Update specific components only.

```bash
# Update all skills
ai-dev update skills

# Update all MCPs
ai-dev update mcps

# Update specific config file
ai-dev update cursorrules
ai-dev update gitignore
ai-dev update env-example

# Update all config files
ai-dev update config-files

# Update everything
ai-dev update all
```

**Examples:**
```bash
# Just update skills without touching configs
ai-dev update skills

# Update just the .cursorrules file
ai-dev update cursorrules

# Update all MCPs and config files
ai-dev update mcps config-files
```

---

### `ai-dev generate <type> <name>`

Generate skills, MCPs, tools, or integrations in your project.

```bash
# Generate a skill
ai-dev generate skill <name>

# Generate an MCP server configuration
ai-dev generate mcp <name>

# Generate a tool
ai-dev generate tool <name>

# Generate an integration
ai-dev generate integration <name>
```

**Examples:**

#### Generate a Skill
```bash
ai-dev generate skill api-designer

# Creates:
# .claude/skills/api-designer/
#   ├── SKILL.md
#   └── README.md

# Adds to claude.md:
## Skills

### api-designer
Design REST and GraphQL APIs with authentication, versioning, and documentation.
```

#### Generate an MCP
```bash
ai-dev generate mcp supabase-manager

# Creates mcp-settings.json with:
{
  "mcpServers": {
    "supabase-manager": {
      "command": "npx",
      "args": ["-y", "@ai-dev-standards/mcp-supabase"],
      "env": {
        "SUPABASE_URL": "${SUPABASE_URL}",
        "SUPABASE_KEY": "${SUPABASE_KEY}"
      }
    }
  }
}

# Updates .env.example:
SUPABASE_URL=
SUPABASE_KEY=
```

#### Generate a Tool
```bash
ai-dev generate tool schema-validator

# Creates:
# .claude/tools/schema-validator.js
```

#### Generate an Integration
```bash
ai-dev generate integration stripe

# Creates:
# lib/stripe/
#   ├── client.ts
#   ├── webhooks.ts
#   └── README.md

# Updates .env.example:
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
```

---

### `ai-dev setup <integration>`

Interactive setup for third-party services.

```bash
# Setup Supabase
ai-dev setup supabase

# Setup Stripe
ai-dev setup stripe

# Setup Anthropic API
ai-dev setup anthropic

# Setup Pinecone
ai-dev setup pinecone

# Setup OpenAI
ai-dev setup openai
```

**Example: Setup Supabase**
```bash
$ ai-dev setup supabase

🎯 Supabase Setup

? Supabase Project URL: https://xyz.supabase.co
? Supabase Anon Key: eyJhbGc...
? Enable auth helpers? Yes
? Enable real-time subscriptions? Yes

✅ Supabase configured!

📦 Installed:
  • @supabase/supabase-js
  • @supabase/auth-helpers-nextjs

📝 Created:
  • lib/supabase/client.ts
  • lib/supabase/server.ts
  • lib/supabase/middleware.ts

🔧 Updated:
  • .env.local (added credentials)
  • .env.example (added template)

📚 Next steps:
  1. Run: npm install
  2. Use in your code: import { supabase } from '@/lib/supabase/client'
```

**Example: Setup Stripe**
```bash
$ ai-dev setup stripe

🎯 Stripe Setup

? Stripe Secret Key: sk_test_...
? Stripe Publishable Key: pk_test_...
? Stripe Webhook Secret: whsec_...
? Enable Stripe Checkout? Yes
? Enable Customer Portal? Yes

✅ Stripe configured!

📦 Installed:
  • stripe

📝 Created:
  • lib/stripe/client.ts
  • lib/stripe/checkout.ts
  • lib/stripe/webhooks.ts
  • app/api/webhooks/stripe/route.ts

🔧 Updated:
  • .env.local
  • next.config.js (added webhook route)

📚 Next steps:
  1. Run: npm install
  2. Test webhook: stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

---

### `ai-dev list <type>`

List available or installed components.

```bash
# List all available skills
ai-dev list skills

# List all available MCPs
ai-dev list mcps

# List all available integrations
ai-dev list integrations

# List installed components
ai-dev list installed
```

**Example output:**
```bash
$ ai-dev list skills

📚 Available Skills:

Product Development:
  ✅ mvp-builder          - Rapid MVP development
  ✅ product-strategist   - Product-market fit validation
  ⬜ go-to-market-planner - Product launch strategy

AI-Native Development:
  ✅ rag-implementer      - RAG systems
  ⬜ multi-agent-architect - Multi-agent systems
  ⬜ knowledge-graph-builder - Graph databases

Technical Development:
  ✅ api-designer         - REST/GraphQL APIs
  ⬜ frontend-builder     - React/Next.js development

(✅ = installed, ⬜ = available)

💡 Tip: Install with 'ai-dev generate skill <name>'
```

---

### `ai-dev config <action>`

Manage CLI configuration.

```bash
# Show current config
ai-dev config show

# Set a value
ai-dev config set <key> <value>

# Get a value
ai-dev config get <key>

# Reset to defaults
ai-dev config reset
```

**Examples:**
```bash
# Enable auto-approve (no prompts)
ai-dev config set preferences.autoApprove true

# Change sync frequency
ai-dev config set frequency "daily"

# Change what gets tracked
ai-dev config set tracking "skills,mcps"

# Disable backup before sync
ai-dev config set preferences.backupBeforeSync false

# Show all config
ai-dev config show
```

**Config keys:**
- `tracking` - What to sync (skills, mcps, cursorrules, gitignore, tools)
- `frequency` - How often (git-hook, daily, weekly, manual)
- `preferences.autoApprove` - Skip confirmation prompts
- `preferences.notifications` - Show update notifications
- `preferences.backupBeforeSync` - Backup files before updating

---

### `ai-dev search <query>`

Search skills, MCPs, and patterns.

```bash
# Search for API-related content
ai-dev search api

# Search for authentication
ai-dev search auth

# Search for database patterns
ai-dev search database
```

**Example output:**
```bash
$ ai-dev search api

🔍 Search results for "api":

Skills:
  • api-designer - Design REST/GraphQL APIs
  • mvp-builder - Includes API design patterns

MCPs:
  • supabase-manager - Database API management

Patterns:
  • rag-pattern.md - API integration examples

Config:
  • .cursorrules - API best practices

💡 Tip: Generate with 'ai-dev generate skill api-designer'
```

---

### `ai-dev info <component>`

Show detailed information about a component.

```bash
# Show skill details
ai-dev info skill api-designer

# Show MCP details
ai-dev info mcp supabase-manager

# Show integration details
ai-dev info integration stripe
```

**Example output:**
```bash
$ ai-dev info skill api-designer

📋 api-designer

Description:
  Design REST and GraphQL APIs with authentication,
  versioning, and comprehensive documentation.

Version: 1.0.0
Category: Technical Development
Prerequisites: None

What it provides:
  • REST API design patterns
  • GraphQL schema design
  • Authentication strategies
  • API versioning
  • OpenAPI documentation
  • Error handling patterns
  • Rate limiting

Files:
  • SKILL.md - Main skill prompt
  • README.md - Usage guide
  • EXAMPLES.md - Code examples

Install:
  ai-dev generate skill api-designer

Status: ✅ Installed (last updated: 2025-10-22)
```

---

### `ai-dev doctor`

Diagnose issues with your setup.

```bash
ai-dev doctor

# Fix issues automatically
ai-dev doctor --fix
```

**Example output:**
```bash
$ ai-dev doctor

🔍 Running diagnostics...

✅ Node.js version: v20.10.0 (OK)
✅ npm version: 10.2.3 (OK)
✅ .ai-dev.json exists
✅ claude.md exists
⚠️  mcp-settings.json not found
❌ .cursorrules has merge conflicts

Issues found: 2

Recommendations:
  1. Create mcp-settings.json:
     ai-dev generate mcp supabase-manager

  2. Fix .cursorrules conflicts:
     Edit .cursorrules and remove conflict markers

Run 'ai-dev doctor --fix' to auto-fix
```

---

### `ai-dev clean`

Clean up cache and temporary files.

```bash
# Clean cache
ai-dev clean

# Clean and re-sync
ai-dev clean --sync

# Remove backup files
ai-dev clean --backups
```

---

## Global Options

These options work with any command:

```bash
# Show help
ai-dev --help
ai-dev <command> --help

# Show version
ai-dev --version

# Verbose output (debug mode)
ai-dev <command> --verbose

# Quiet mode (minimal output)
ai-dev <command> --quiet

# Force operation (skip confirmations)
ai-dev <command> --force

# Dry run (preview changes)
ai-dev <command> --dry-run
```

---

## Common Workflows

### Initial Setup (New Project)
```bash
# 1. Bootstrap everything
npx @ai-dev-standards/bootstrap

# 2. Check what was installed
ai-dev list installed

# 3. Start coding!
```

### Daily Workflow
```bash
# Pull latest code
git pull

# Auto-sync runs automatically via git hook
# Or run manually:
ai-dev sync
```

### Add New Feature (e.g., Supabase)
```bash
# 1. Setup integration
ai-dev setup supabase

# 2. Generate MCP
ai-dev generate mcp supabase-manager

# 3. Install dependencies
npm install

# 4. Start using in code
```

### Update Config Files
```bash
# Update just cursor rules
ai-dev update cursorrules

# Or update all configs
ai-dev update config-files
```

### Troubleshooting
```bash
# 1. Run diagnostics
ai-dev doctor

# 2. Clean cache if needed
ai-dev clean

# 3. Re-sync everything
ai-dev sync --force
```

---

## Environment Variables

The CLI respects these environment variables:

```bash
# Path to ai-dev-standards repo
AI_DEV_STANDARDS_PATH=/path/to/ai-dev-standards

# Disable auto-sync
AI_DEV_NO_AUTO_SYNC=true

# Skip git hooks
AI_DEV_NO_GIT_HOOKS=true

# Default to auto-approve
AI_DEV_AUTO_APPROVE=true
```

**Example:**
```bash
# Sync without prompts
AI_DEV_AUTO_APPROVE=true ai-dev sync
```

---

## Configuration File

The `.ai-dev.json` file stores your project's configuration:

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
    "skills": ["api-designer", "mvp-builder"],
    "mcps": ["supabase-manager"],
    "tools": [],
    "integrations": ["stripe"]
  },
  "preferences": {
    "autoApprove": false,
    "notifications": true,
    "backupBeforeSync": true
  }
}
```

**Edit manually or use:**
```bash
ai-dev config set <key> <value>
```

---

## Exit Codes

- `0` - Success
- `1` - General error
- `2` - Invalid arguments
- `3` - File not found
- `4` - Network error
- `5` - Configuration error

---

## Tips & Tricks

### Auto-Approve All Updates
```bash
# Add to .ai-dev.json
ai-dev config set preferences.autoApprove true

# Or use environment variable
export AI_DEV_AUTO_APPROVE=true
```

### Sync Only Skills
```bash
ai-dev config set tracking "skills"
ai-dev sync
```

### Backup Before Major Changes
```bash
# Auto-backup is enabled by default
ai-dev sync  # Creates .cursorrules.backup, etc.

# Restore if needed
mv .cursorrules.backup .cursorrules
```

### CI/CD Integration
```bash
# .github/workflows/sync.yml
name: Sync AI Dev Standards

on:
  schedule:
    - cron: '0 0 * * 0'  # Weekly
  workflow_dispatch:

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npx @ai-dev-standards/bootstrap --yes --silent
      - run: |
          git config user.name "AI Dev Bot"
          git config user.email "bot@example.com"
          git add .
          git commit -m "chore: sync ai-dev standards" || true
          git push || true
```

---

## Learn More

- [Bootstrap Guide](./BOOTSTRAP.md)
- [Auto-Update Guide](./AUTO-UPDATE-FILES.md)
- [Main README](../README.md)

---

## Support

**Having issues?**

```bash
# Run diagnostics
ai-dev doctor

# Check version
ai-dev --version

# Enable debug mode
ai-dev sync --verbose
```

**Still stuck?** Open an issue at: https://github.com/your-org/ai-dev-standards/issues
