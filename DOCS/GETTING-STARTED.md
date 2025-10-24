# Getting Started with AI Dev Standards

**Complete guide to connecting ai-dev-standards to any project**

This guide will help you set up ai-dev-standards in any new or existing project, giving you access to 37 skills, 34 MCPs, 9 tools, 13 components, and 6 integrations.

---

## Table of Contents

1. [Quick Start (Recommended)](#quick-start-recommended)
2. [Manual Setup](#manual-setup)
3. [For New Projects](#for-new-projects)
4. [For Existing Projects](#for-existing-projects)
5. [Verification & Testing](#verification--testing)
6. [Usage Guide](#usage-guide)
7. [Troubleshooting](#troubleshooting)
8. [Advanced Configuration](#advanced-configuration)

---

## Quick Start (Recommended)

### Option A: Auto-Bootstrap (Coming Soon)

**One command to set up everything:**

```bash
npx @ai-dev-standards/bootstrap
```

This will automatically:
- ✅ Install the ai-dev CLI
- ✅ Create `.ai-dev.json` configuration
- ✅ Set up `.claude/` directory with skills
- ✅ Configure `.cursorrules` with standards
- ✅ Update `.gitignore` with best practices
- ✅ Set up git hooks for auto-sync
- ✅ Run initial sync

**Note:** Bootstrap is tracked for next release. Use manual setup below for now.

---

## Manual Setup

### Step 1: Clone ai-dev-standards Repository

First, clone the ai-dev-standards repository to a location on your machine:

```bash
# Clone to your preferred location
cd ~/
git clone https://github.com/daffy0208/ai-dev-standards.git

# Or clone to a specific location
cd /path/to/your/workspace
git clone https://github.com/daffy0208/ai-dev-standards.git
```

**Recommended location:** `~/ai-dev-standards/` (home directory)

### Step 2: Install the CLI (Optional but Recommended)

```bash
cd ~/ai-dev-standards/CLI
npm install
npm link
```

This makes the `ai-dev` command available globally.

**Verify installation:**
```bash
ai-dev --version
```

### Step 3: Set Up Your Project

Navigate to your project:

```bash
cd /path/to/your/project
```

### Step 4: Initialize ai-dev Sync

```bash
ai-dev sync
```

This will:
1. Ask what you want to track (skills, MCPs, tools, components, integrations)
2. Create `.ai-dev.json` configuration
3. Set up `.claude/` directory
4. Optionally set up git hooks for auto-sync

**OR use non-interactive mode:**

```bash
ai-dev sync --yes
```

This uses default settings:
- Tracks: skills, MCPs, tools, components, integrations
- Frequency: git-hook (auto-sync on pull)

### Step 5: Create `.cursorrules` File

Create a `.cursorrules` file in your project root. Choose a template:

**For New Projects (MVP/SaaS):**
```bash
cp ~/ai-dev-standards/TEMPLATES/cursorrules-saas.md .cursorrules
```

**For Existing Projects:**
```bash
cp ~/ai-dev-standards/TEMPLATES/cursorrules-existing-project.md .cursorrules
```

**For Quick Testing:**
```bash
cp ~/ai-dev-standards/TEMPLATES/cursorrules-quick-test.md .cursorrules
```

**For AI/RAG Projects:**
```bash
cp ~/ai-dev-standards/TEMPLATES/cursorrules-ai-rag.md .cursorrules
```

**For Minimal Setup:**
```bash
cp ~/ai-dev-standards/TEMPLATES/cursorrules-minimal.md .cursorrules
```

### Step 6: Customize Your `.cursorrules`

Edit `.cursorrules` and fill in:
- Project name
- Tech stack
- Current phase
- Any project-specific context

**Example customization:**
```markdown
# Project: TaskMaster Pro

## AI Development Standards
Repository: ~/ai-dev-standards/
Status: Active

### Tech Stack
- Frontend: Next.js 14, TypeScript, Tailwind CSS
- Backend: Next.js API Routes
- Database: PostgreSQL (Supabase)
- Deployment: Vercel

### Current Phase
- [x] Planning
- [x] MVP Development
- [ ] Beta Launch (Week 9)
- [ ] Production Launch
```

---

## For New Projects

### Recommended Setup Flow

1. **Create your project directory:**
```bash
mkdir my-new-project
cd my-new-project
git init
```

2. **Initialize your project:**
```bash
# For Node.js/TypeScript
npm init -y

# For Next.js
npx create-next-app@latest . --typescript --tailwind --app --src-dir

# For other frameworks, use their init commands
```

3. **Set up ai-dev-standards:**
```bash
# Copy template
cp ~/ai-dev-standards/TEMPLATES/cursorrules-saas.md .cursorrules

# Initialize sync
ai-dev sync --yes

# Copy gitignore (optional)
cp ~/ai-dev-standards/.gitignore .gitignore
```

4. **Customize `.cursorrules`:**
- Fill in project name
- Define tech stack
- Set MVP scope and P0/P1/P2 features
- Define target customer

5. **Start coding with AI assistance:**
```bash
# Open in VS Code or Cursor
code .
# or
cursor .
```

### Template Recommendations by Project Type

**SaaS Applications:**
- Template: `cursorrules-saas.md`
- Best for: B2B SaaS, consumer apps
- Includes: MVP matrix, go-to-market, monetization

**AI/RAG Projects:**
- Template: `cursorrules-ai-rag.md`
- Best for: AI search, chatbots, document Q&A
- Includes: RAG architecture, vector DBs, LLM config

**Internal Tools:**
- Template: `cursorrules-existing-project.md`
- Best for: Company internal tools, utilities
- Includes: Existing codebase documentation

**Prototypes/MVPs:**
- Template: `cursorrules-minimal.md`
- Best for: Quick prototypes, proof of concepts
- Includes: Essential configuration only

---

## For Existing Projects

### Step-by-Step Integration

1. **Navigate to your existing project:**
```bash
cd /path/to/existing/project
```

2. **Backup your current config (if you have one):**
```bash
# Backup existing .cursorrules if present
[ -f .cursorrules ] && cp .cursorrules .cursorrules.backup
```

3. **Copy the existing-project template:**
```bash
cp ~/ai-dev-standards/TEMPLATES/cursorrules-existing-project.md .cursorrules
```

4. **Document your existing project in `.cursorrules`:**

Edit the `.cursorrules` file and fill in:

```markdown
## Existing Project Status

### Basic Info
- **Project Name:** TaskMaster Pro
- **Age:** Built in 2022, launched 2023, now in production
- **Stage:** Production
- **Team:** 3 developers, 1 designer
- **Users:** 5,000 active users
- **Business:** $10k MRR SaaS

### What This Project Does
Task management SaaS for remote teams. Users create projects,
assign tasks, track progress with Kanban boards, and get automated
reports. Serves 5k teams.

### Current Tech Stack
- Frontend: React 18, Material-UI
- Backend: Node.js, Express
- Database: PostgreSQL
- Hosting: AWS EC2 + RDS
- CI/CD: GitHub Actions

### Why We're Using ai-dev-standards
- [x] Faster feature development
- [x] Add AI features (smart task suggestions)
- [x] Better code quality on new features
- [ ] Performance improvements
- [ ] Better documentation

### Current Goals
1. Add AI-powered task suggestions (RAG)
2. Improve performance of dashboard queries
3. Build mobile app (React Native)
```

5. **Initialize ai-dev sync:**
```bash
ai-dev sync
```

Choose what to track:
- ✅ Skills (recommended for all projects)
- ✅ MCPs (if adding AI features)
- ✅ Tools (if need automation)
- ✅ Components (if building new UI)
- ✅ Integrations (if connecting services)

6. **Gradually adopt practices:**

**Don't refactor everything at once!** Use ai-dev-standards for:
- New features
- Bug fixes in modified files
- New components
- API endpoints you're touching

Let Claude suggest improvements based on standards as you work.

### Migration Strategy

**Week 1: Setup & Documentation**
- Set up `.cursorrules`
- Document existing architecture
- Identify pain points

**Week 2-3: Apply to New Work**
- Use skills for new features
- Apply standards to new code
- Don't touch old code yet

**Week 4+: Gradual Improvement**
- Refactor files you're already changing
- Apply standards when fixing bugs
- Improve code as you touch it

---

## Verification & Testing

### Verify Setup is Working

1. **Check ai-dev configuration:**
```bash
cat .ai-dev.json
```

Should show:
```json
{
  "version": "1.3.0",
  "lastSync": "2025-10-24T...",
  "tracking": ["skills", "mcps", "tools", "components", "integrations"],
  "frequency": "git-hook",
  "installed": {
    "skills": [],
    "mcps": [],
    "tools": [],
    "scripts": [],
    "components": [],
    "integrations": []
  }
}
```

2. **Check `.claude/` directory:**
```bash
ls -la .claude/
```

Should show:
```
.claude/
  claude.md          # All 37 skills listed
  mcp-settings.json  # (optional) MCP configuration
```

3. **Verify `.cursorrules` exists:**
```bash
cat .cursorrules | head -20
```

Should show your project configuration.

### Test with Claude

Open your project in VS Code with Claude Code or Cursor:

```bash
code .  # VS Code with Claude Code
# or
cursor .  # Cursor
```

**Test prompts:**

1. **Test skill activation:**
```
You: "I need to build an MVP for a task management app. What should I focus on first?"
```

Claude should activate the `mvp-builder` skill and provide P0/P1/P2 prioritization.

2. **Test resource discovery:**
```
You: "What skills are available in this project?"
```

Claude should list all 37 skills from the registry.

3. **Test integration suggestions:**
```
You: "I want to add user authentication. What should I use?"
```

Claude should reference the decision framework and suggest integrations like Supabase.

---

## Usage Guide

### Working with Skills

Skills activate automatically based on your task. You can also explicitly request them:

**Automatic activation:**
```
You: "I need to implement a RAG system for document search"
```
Claude will automatically activate the `rag-implementer` skill.

**Explicit activation:**
```
You: "Use the mvp-builder skill to help me prioritize features"
```

**Available skills (37 total):**
- Product: mvp-builder, product-strategist, go-to-market-planner
- AI/Data: rag-implementer, knowledge-graph-builder, multi-agent-architect
- Frontend: frontend-builder, ux-designer, visual-designer
- Backend: api-designer, deployment-advisor, security-engineer
- Testing: testing-strategist, quality-auditor
- And 22 more...

### Using MCPs (Model Context Protocol Tools)

MCPs are executable tools that Claude can use. Examples:

**Vector Database MCP:**
```
You: "Store these documents in a vector database for semantic search"
```

**Component Generator MCP:**
```
You: "Generate a login form component with validation"
```

**Deployment Orchestrator MCP:**
```
You: "Deploy this to production"
```

### Using Components

Reference reusable components in your requests:

```
You: "Add the login-form component to my auth page"
```

Claude will fetch the component from `COMPONENTS/auth/LoginForm.tsx`.

### Using Integrations

Request pre-configured integrations:

```
You: "Set up Supabase authentication"
```

Claude will use the integration code from `INTEGRATIONS/platforms/supabase/`.

### Keeping Up to Date

**Automatic sync (recommended):**
```bash
# Already set up if you chose git-hook frequency
# Syncs automatically after every git pull
```

**Manual sync:**
```bash
ai-dev sync
```

**Check for updates:**
```bash
ai-dev sync --check
```

---

## Troubleshooting

### Issue: Claude doesn't see the skills

**Solution 1: Verify .cursorrules path**
```bash
# Check if .cursorrules exists
ls -la .cursorrules

# Check if it references ai-dev-standards
grep "ai-dev-standards" .cursorrules
```

**Solution 2: Use absolute paths**

In `.cursorrules`, use full paths:
```markdown
Repository: /home/username/ai-dev-standards/
```

Not relative paths like:
```markdown
Repository: ~/ai-dev-standards/  # May not work
```

**Solution 3: Restart Claude/Cursor**
- Close and reopen your editor
- Claude Code reloads `.cursorrules` on restart

### Issue: ai-dev command not found

**Solution:**
```bash
cd ~/ai-dev-standards/CLI
npm link
```

Or use npx:
```bash
npx ~/ai-dev-standards/CLI/index.js sync
```

### Issue: Git hook not working

**Solution: Reinstall git hook**
```bash
# Check if hook exists
cat .git/hooks/post-merge

# Reinstall
ai-dev sync --setup-hooks
```

### Issue: Can't find ai-dev-standards repository

**Solution: Update path in .cursorrules**
```markdown
## AI Development Standards
Repository: /full/path/to/ai-dev-standards/
```

Replace with your actual path:
```bash
# Find it with:
find ~ -name "ai-dev-standards" -type d 2>/dev/null
```

### Issue: Sync fails with registry errors

**Solution: Update ai-dev-standards**
```bash
cd ~/ai-dev-standards
git pull origin main
```

### Issue: Skills not activating correctly

**Checklist:**
1. ✅ `.cursorrules` exists in project root
2. ✅ `.cursorrules` references ai-dev-standards path
3. ✅ Path in `.cursorrules` is correct and absolute
4. ✅ ai-dev-standards repo is cloned and accessible
5. ✅ Editor (VS Code/Cursor) has been restarted
6. ✅ Claude Code extension is installed and active

---

## Advanced Configuration

### Custom Skill Selection

Edit `.cursorrules` to focus on specific skills:

```markdown
### Primary Skills for This Project
- **mvp-builder** - Feature prioritization
- **rag-implementer** - AI features
- **frontend-builder** - React/Next.js
- **api-designer** - Backend APIs
- **deployment-advisor** - Infrastructure
```

### Project-Specific Conventions

Add your own coding standards:

```markdown
## Our Coding Conventions

### File Naming
- Components: PascalCase (LoginForm.tsx)
- Utilities: camelCase (formatDate.ts)
- Constants: UPPER_SNAKE_CASE (API_URL.ts)

### Folder Structure
src/
  components/    # React components
  lib/          # Utilities and helpers
  app/          # Next.js app router pages
  api/          # API routes
```

### Integrating with CI/CD

Add sync to your CI pipeline:

```yaml
# .github/workflows/sync-standards.yml
name: Sync AI Dev Standards

on:
  schedule:
    - cron: '0 0 * * *'  # Daily
  workflow_dispatch:      # Manual trigger

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Clone ai-dev-standards
        run: git clone https://github.com/daffy0208/ai-dev-standards.git

      - name: Install CLI
        run: |
          cd ai-dev-standards/CLI
          npm install
          npm link

      - name: Sync
        run: ai-dev sync --yes

      - name: Commit changes
        run: |
          git config user.name "AI Dev Bot"
          git config user.email "bot@example.com"
          git add .
          git commit -m "chore: Sync with ai-dev-standards" || true
          git push
```

### Multi-Project Setup

If you have multiple projects, set up once and reference from all:

```bash
# Set up ai-dev-standards once
cd ~/
git clone https://github.com/daffy0208/ai-dev-standards.git
cd ai-dev-standards/CLI
npm install
npm link

# Use in project 1
cd ~/projects/project1
ai-dev sync --yes
cp ~/ai-dev-standards/TEMPLATES/cursorrules-saas.md .cursorrules

# Use in project 2
cd ~/projects/project2
ai-dev sync --yes
cp ~/ai-dev-standards/TEMPLATES/cursorrules-ai-rag.md .cursorrules

# Use in project 3
cd ~/projects/project3
ai-dev sync --yes
cp ~/ai-dev-standards/TEMPLATES/cursorrules-minimal.md .cursorrules
```

All projects reference the same `~/ai-dev-standards/` repository.

---

## Quick Reference

### Essential Commands

```bash
# Initial setup
ai-dev sync                    # Interactive setup
ai-dev sync --yes             # Non-interactive setup

# Updates
ai-dev sync                    # Check and apply updates
ai-dev sync --check           # Check for updates only

# Help
ai-dev --help                 # Show all commands
ai-dev sync --help            # Show sync options
```

### Essential Files

```
your-project/
├── .cursorrules              # AI assistant configuration
├── .ai-dev.json              # ai-dev sync configuration
├── .claude/
│   └── claude.md             # All 37 skills listed
└── .git/hooks/
    └── post-merge            # Auto-sync on git pull
```

### Template Paths

```bash
# All templates in ai-dev-standards
~/ai-dev-standards/TEMPLATES/

cursorrules-minimal.md           # Basic setup
cursorrules-saas.md              # SaaS projects
cursorrules-ai-rag.md            # AI/RAG projects
cursorrules-existing-project.md  # Existing codebases
cursorrules-quick-test.md        # Quick testing
```

### Registry Paths

```bash
# All registries in ai-dev-standards
~/ai-dev-standards/META/

skill-registry.json              # 37 skills
mcp-registry.json                # 34 MCPs
tool-registry.json               # 9 tools + 4 scripts
component-registry.json          # 13 components
integration-registry.json        # 6 integrations
relationship-mapping.json        # Complete dependency graph
```

---

## What's Next?

After setup, you can:

1. **Start a new feature** - Claude will activate relevant skills
2. **Request specific tools** - "Use the rag-implementer skill"
3. **Get architecture advice** - "What's the best RAG architecture?"
4. **Use components** - "Add the login-form component"
5. **Set up integrations** - "Configure Supabase auth"

Claude will automatically reference the standards, skills, and resources to provide better, more consistent assistance.

---

## Getting Help

### Documentation
- **Main README:** `~/ai-dev-standards/README.md`
- **CLI Guide:** `~/ai-dev-standards/DOCS/CLI.md`
- **Bootstrap Guide:** `~/ai-dev-standards/DOCS/BOOTSTRAP.md`
- **Decision Framework:** `~/ai-dev-standards/META/DECISION-FRAMEWORK.md`

### Community
- **GitHub Issues:** https://github.com/daffy0208/ai-dev-standards/issues
- **Discussions:** https://github.com/daffy0208/ai-dev-standards/discussions

### Quick Questions
- Check `META/PROJECT-CONTEXT.md` for system overview
- Check `META/HOW-TO-USE.md` for navigation guide
- Check specific skill files in `SKILLS/[skill-name]/SKILL.md`

---

## Success Checklist

Before you start coding, verify:

- ✅ ai-dev-standards cloned to `~/ai-dev-standards/`
- ✅ CLI installed with `npm link` (optional but recommended)
- ✅ `.cursorrules` exists in your project root
- ✅ `.cursorrules` references correct ai-dev-standards path
- ✅ `.ai-dev.json` created by running `ai-dev sync`
- ✅ `.claude/claude.md` exists with all 37 skills
- ✅ Tested with Claude - skills activate correctly
- ✅ Git hook set up for auto-sync (optional)

**You're ready to build with AI assistance!** 🚀

---

## Version

**Guide Version:** 1.0.0
**ai-dev-standards Version:** 1.3.0
**Last Updated:** 2025-10-24
