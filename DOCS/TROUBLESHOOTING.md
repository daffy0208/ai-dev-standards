# Troubleshooting Guide - ai-dev-standards

## Quick Start - Can't Get Commands to Work?

### Option 1: Use the Setup Script (Easiest)

```bash
cd /your/new/project

# Run setup from ai-dev-standards directory
bash ~/ai-dev-standards/setup-project.sh
```

**This will:**
1. Install the CLI if needed
2. Set up your project
3. Run automatic analysis
4. Give you recommendations on where to start

### Option 2: Install CLI First

```bash
cd ~/ai-dev-standards/CLI
npm install
npm link

# Now commands work
cd /your/project
ai-dev sync --yes
```

### Option 3: Direct npx (if published)

```bash
# This won't work yet (not published to npm)
npx @ai-dev-standards/bootstrap
```

---

## Common Issues

### 1. "Command not found: ai-dev"

**Problem:** CLI not installed

**Solution:**
```bash
cd ~/ai-dev-standards/CLI
npm install
npm link
```

### 2. "Not a project directory"

**Problem:** No package.json or .git

**Solution:**
```bash
# Either initialize git
git init

# Or initialize npm
npm init -y

# Then run setup
bash ~/ai-dev-standards/setup-project.sh
```

### 3. "Cannot find module"

**Problem:** Dependencies not installed

**Solution:**
```bash
cd ~/ai-dev-standards/CLI
npm install
```

### 4. Bootstrap script fails

**Problem:** Package not on npm yet

**Solution:** Use setup-project.sh instead:
```bash
bash ~/ai-dev-standards/setup-project.sh
```

---

## Setup for a GitHub Project

### New Project (just created)

```bash
# 1. Clone your repo
git clone git@github.com:yourusername/your-repo.git
cd your-repo

# 2. Run setup
bash ~/ai-dev-standards/setup-project.sh

# 3. Review the automatic analysis
# It will show:
# - Project health score
# - Recommended next steps
# - Which skills to use
# - Quick wins you can implement
```

### Existing Project

```bash
# 1. Navigate to your project
cd /path/to/your/project

# 2. Run setup (works on any project stage)
bash ~/ai-dev-standards/setup-project.sh

# 3. Review analysis and recommendations
```

---

## What the Setup Does

### Automatic Steps

1. ✅ Checks if CLI is installed (installs if needed)
2. ✅ Detects your project type (Next.js, React, Expo, etc.)
3. ✅ Copies appropriate template
4. ✅ Updates paths to absolute paths
5. ✅ Runs initial sync (installs all 103 resources)
6. ✅ **NEW:** Analyzes your repository
7. ✅ **NEW:** Provides customized recommendations

### What You Get

After setup completes, you'll see:

```
🔍 AI Dev Standards - Project Analysis

✓ Git repository detected
✓ package.json found
✓ Languages detected: TypeScript JavaScript

📊 Project Statistics
Total files: 50
Code files: 35

🎯 Analysis & Recommendations

Project Health: Good (75/100)
Project Stage: growing
Project Type: nextjs

📝 Recommended Next Steps:

Priority 1: Scale & Optimize
  1. Add test coverage - Aim for 80%+ coverage
  2. Create documentation - API docs, architecture diagrams
  3. Automate deployment - Set up CI/CD pipeline

Recommended Skills:
  • performance-optimizer - Optimize for scale
  • security-engineer - Security audit and hardening
  • design-system-architect - Build component library

⚡ Quick Wins (Do These First):
  1. Create README.md with project description
  2. Add .gitignore file
  3. Create .env.example for environment variables

✅ Analysis Complete
```

---

## Understanding the Analysis

### Project Health Score (0-100)

- **80-100:** Excellent - Well-structured project
- **60-79:** Good - Solid foundation, room for improvement
- **40-59:** Fair - Basic setup, needs enhancements
- **0-39:** Needs Work - Missing critical components

### Project Stages

- **empty:** No code yet, starting from scratch
- **early:** Less than 10 code files, just getting started
- **growing:** 10-50 files, actively developing
- **established:** 50+ files, mature codebase

### Recommendations

The analysis provides:
1. **Priority tasks** - What to focus on now
2. **Recommended skills** - Which ai-dev skills to use
3. **Quick wins** - Easy improvements you can make today
4. **Framework-specific** - Tailored to your tech stack

---

## Using the Analysis

### Example: New Next.js Project

```bash
# After seeing the analysis, ask Claude:
"I have a new Next.js project at the early stage.
The analysis recommended using frontend-builder and testing-strategist.
Help me set up the project structure and add tests."
```

Claude will:
- Reference the appropriate skills
- Use the recommended approaches
- Help you implement the priority tasks

### Example: Growing React App

```bash
# After analysis shows need for tests:
"The analysis shows I need test coverage.
Use the testing-strategist skill to help me add tests
for my React components."
```

---

## Manual Analysis (Without Setup)

You can run analysis on any project without setting up ai-dev:

```bash
bash ~/ai-dev-standards/scripts/analyze-project.sh /path/to/your/project
```

This will:
- Analyze the project
- Show recommendations
- NOT install anything

---

## Getting Help

### Check Installation

```bash
# Verify CLI is installed
ai-dev --version

# Check what's been synced
cat .ai-dev.json

# See what skills are available
cat .claude/claude.md
```

### Re-run Analysis

```bash
bash ~/ai-dev-standards/scripts/analyze-project.sh .
```

### Re-sync Resources

```bash
ai-dev sync --yes
```

### Force Re-install

```bash
# Remove config
rm .ai-dev.json
rm -rf .claude/

# Run setup again
bash ~/ai-dev-standards/setup-project.sh
```

---

## Common Workflows

### 1. Brand New Project

```bash
mkdir my-new-app
cd my-new-app
git init
bash ~/ai-dev-standards/setup-project.sh

# Analysis will show "empty" stage
# Recommended: mvp-builder, product-strategist
```

### 2. Existing Project (First Time)

```bash
cd ~/my-existing-app
bash ~/ai-dev-standards/setup-project.sh

# Analysis will detect project stage
# Give customized recommendations
```

### 3. Update Existing Integration

```bash
cd ~/my-project-with-ai-dev
ai-dev sync --yes

# Re-run analysis to get updated recommendations
bash ~/ai-dev-standards/scripts/analyze-project.sh .
```

---

## Advanced Options

### Skip Analysis

```bash
# Set environment variable
SKIP_ANALYSIS=true bash ~/ai-dev-standards/setup-project.sh
```

### Analysis Only

```bash
# Don't install anything, just analyze
bash ~/ai-dev-standards/scripts/analyze-project.sh .
```

### Custom Template

```bash
# Before running setup, copy your preferred template
cp ~/ai-dev-standards/TEMPLATES/cursorrules-ai-rag.md .cursorrules

# Then run setup (will skip template copy)
bash ~/ai-dev-standards/setup-project.sh
```

---

## Questions?

### "The analysis says I need tests but I don't know where to start"

Ask Claude:
```
"Use the testing-strategist skill to help me set up tests.
My project is a [Next.js/React/Python] app."
```

### "I got recommendations but I'm overwhelmed"

Focus on Quick Wins first! They're small, easy tasks that give immediate value.

### "The analysis detected the wrong project type"

The setup script auto-detects, but you can manually:
1. Copy a different template from `TEMPLATES/`
2. Edit `.cursorrules` to reflect your stack
3. Ask Claude for guidance using specific skills

---

## Still Having Issues?

1. Check the [README.md](../README.md)
2. See [QUICK-START.md](./QUICK-START.md)
3. Review [GETTING-STARTED.md](./GETTING-STARTED.md)
4. Open an issue on GitHub

---

**Built for excellence in AI-assisted development** 🚀
