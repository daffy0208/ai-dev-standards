# Integration Usage Guide

**Integrating ai-dev-standards into Your Projects**

This guide shows how to integrate ai-dev-standards into your projects for automatic skill activation, resource syncing, and AI assistant integration.

---

## 📖 Overview

In integration mode, ai-dev-standards becomes part of your project:

- **Automatic skill activation** - Claude/AI assistants use skills based on context
- **Auto-sync** - Resources stay up-to-date via git hooks
- **Brain-MCP integration** - Intelligent resource discovery and orchestration
- **Project analysis** - Get personalized recommendations
- **Zero configuration** - One command does everything

**When to use integration mode:**

- Active development on a project
- Want AI assistants to automatically use best practices
- Need automatic updates when standards evolve
- Building new features and want guided workflows
- Want the full power of 238 core resources at your fingertips

---

## 🚀 Quick Start (One Command)

### For New or Existing Projects

```bash
cd /your/project
bash ~/ai-dev-standards/setup-project.sh
```

**That's it!** The script automatically:

1. Detects your project type (Next.js, React, Node.js, etc.)
2. Installs the ai-dev CLI globally
3. Syncs all 238 core resources
4. Configures brain-mcp for intelligent orchestration
5. Analyzes your project and provides recommendations
6. Sets up auto-sync via git hooks

---

## 📋 Step-by-Step Setup

### Step 1: Clone ai-dev-standards (One-Time)

If you haven't already:

```bash
cd ~
git clone https://github.com/daffy0208/ai-dev-standards.git
```

This creates `~/ai-dev-standards/` on your machine.

### Step 2: Run Setup in Your Project

```bash
cd /path/to/your/project
bash ~/ai-dev-standards/setup-project.sh
```

### Step 3: Build brain-mcp (First-Time Only)

After initial setup, build the brain-mcp server:

```bash
cd ~/ai-dev-standards/MCP-SERVERS/brain-mcp
npm install
npm run build
```

This creates the `dist/index.js` file that AI assistants use for intelligent skill recommendations.

### Step 4: Review START-HERE.md

The setup creates a personalized guide:

```bash
cat START-HERE.md
```

This includes:

- Project health score
- Recommended skills for your project
- Priority tasks
- Quick wins
- Next steps

---

## 📂 What Gets Installed

After integration, your project contains:

```
your-project/
├── .ai-dev.json                    # Sync configuration and version tracking
├── .claude/
│   ├── claude.md                   # Skills available to Claude
│   └── mcp-settings.json           # MCP server configuration
├── .codex/
│   └── mcp-settings.json           # Codex CLI configuration (if using Codex)
├── .cursorrules                    # Brain-First Development workflow
├── START-HERE.md                   # Your personalized getting started guide
└── .gitignore                      # Updated with orchestration patterns
```

**What's NOT committed (automatically in .gitignore):**

- `START-HERE.md` - Personal guide
- `.ai-dev/backups/` - Backup files
- `orchestration-requests/` - Agent tracking
- `orchestration-results/` - Agent results

---

## 🎯 How It Works

### 1. Skills Activate Automatically

Claude/AI assistants automatically use relevant skills based on your conversation:

**Example:**

```
You: "I want to build an MVP for a task management app"

Claude: "I'll use the mvp-builder skill to help prioritize features.
Let's identify your riskiest assumption first, then use the P0/P1/P2
matrix to focus on core value..."
```

No need to remember skill names - they activate based on context!

### 2. Brain-MCP Provides Intelligence

The brain-mcp server enables:

```
Claude asks: "What skills for building an MVP?"
    ↓
Uses: brain_select_skills(taskDescription: "build MVP")
    ↓
Brain returns: mvp-builder, product-strategist, frontend-builder
    ↓
Claude reads those skill files and applies their methodologies
```

### 3. Auto-Sync Keeps You Updated

When you `git pull` your project, it automatically syncs the latest resources from ai-dev-standards.

---

## 🔄 Updating Your Project

### Automatic Updates (Recommended)

If you set up the git hook during installation, updates happen automatically:

```bash
cd /your/project
git pull
# Automatically runs: ai-dev sync --yes
```

### Manual Updates

Update at any time:

```bash
cd /your/project
ai-dev sync
```

Or re-run the setup script:

```bash
bash ~/ai-dev-standards/setup-project.sh
```

### What Gets Updated

The sync updates:

- **Skills** (SKILLS/) - <!-- AUTO-GEN:START:skills -->65<!-- AUTO-GEN:END:skills --> specialized methodologies
- **MCP Servers** (MCP-SERVERS/) - <!-- AUTO-GEN:START:mcps -->50<!-- AUTO-GEN:END:mcps --> automation tools
- **Configuration** (.cursorrules, .gitignore, etc.)
- **Standards** (STANDARDS/) - Best practices and patterns
- **Components** (COMPONENTS/) - <!-- AUTO-GEN:START:components -->72<!-- AUTO-GEN:END:components --> React components
- **Integrations** (INTEGRATIONS/) - <!-- AUTO-GEN:START:integrations -->28<!-- AUTO-GEN:END:integrations --> service integrations
- **Tools** (TOOLS/) - <!-- AUTO-GEN:START:tools -->24<!-- AUTO-GEN:END:tools --> development tools

Your customizations in other directories are preserved.

---

## 🧠 Using Brain-MCP

### Available Brain Tools

AI assistants can invoke these tools automatically:

**Discovery:**

- `brain_search` - Search all skills, MCPs, tools by keyword
- `brain_select_skills` - Get skill recommendations for a task
- `brain_show_skill` - Get detailed skill information

**Relationships:**

- `brain_relationships` - Show skill dependencies (MCPs, tools, components)
- `graph_query_by_domain` - Find capabilities by domain (ai, security, etc.)
- `graph_query_by_effect` - Find capabilities by effect (implements_auth, etc.)

**Status:**

- `brain_status` - Repository status (64 skills, 50 MCPs, 238 core resources)

### Using with Claude

Just ask naturally:

```
"Use brain_select_skills to find skills for building a RAG system"
"Use brain_relationships to show dependencies for rag-implementer"
"Use brain_search to find authentication resources"
```

### Using with CLI

You can also use the brain CLI directly:

```bash
brain status                    # Current state
brain search "authentication"   # Search resources
brain select-skills "build MVP" # Get skill recommendations
brain relationships rag-implementer # Show dependencies
```

---

## 💡 Common Workflows

### Starting a New Feature

```
You: "I need to add user authentication"

Claude: (Automatically)
1. Uses brain_search to find auth resources
2. Activates security-auditor and api-designer skills
3. References relevant components from COMPONENTS/auth/
4. Follows best practices from STANDARDS/
5. Suggests implementation steps
```

### Building an MVP

```
You: "Help me build an MVP for [idea]"

Claude: (Automatically)
1. Activates mvp-builder skill
2. Guides through P0/P1/P2 prioritization
3. Uses product-strategist for validation
4. References deployment-advisor for hosting
5. Creates implementation roadmap
```

### Implementing AI Features

```
You: "Add AI-powered search to our docs"

Claude: (Automatically)
1. Activates rag-implementer skill
2. References rag-pattern.md for architecture
3. Recommends vector database and approach
4. Suggests relevant MCP servers
5. Provides implementation steps
```

---

## 🔧 Configuration

### Customizing .cursorrules

The `.cursorrules` file configures the Brain-First Development workflow:

```markdown
# Edit to customize for your project

vim .cursorrules
```

### Adding Custom Skills

Add project-specific skills:

```bash
mkdir -p .ai-dev/custom-skills/my-skill/
cat > .ai-dev/custom-skills/my-skill/skill.md << 'EOF'
---
name: my-custom-skill
description: My project-specific skill
---
# My Custom Skill
...
EOF
```

### Configuring MCP Servers

Edit MCP configuration:

```bash
# For Claude
vim .claude/mcp-settings.json

# For Codex
vim .codex/mcp-settings.json
```

---

## 🎛️ Advanced Features

### Brain-First Development Workflow

The `.cursorrules` file enables a discovery-first approach:

1. **Discover** - AI queries brain for relevant resources
2. **Plan** - AI creates approach using discovered skills
3. **Implement** - AI applies methodologies during development
4. **Validate** - AI ensures best practices are followed

### Project-Specific Recommendations

After setup, `START-HERE.md` provides:

- Health score based on your codebase
- Skills most relevant to your project
- Priority issues to address
- Quick wins for improvement

### Skill Auto-Activation

Skills activate based on:

- **File context** - Which files you're editing
- **Conversation context** - What you're discussing
- **Task type** - Building, testing, deploying, etc.

No need to remember to ask for specific skills!

---

## 🔍 Checking for Updates

### Method 1: Automated Check Script

```bash
cd /your/project
~/ai-dev-standards/scripts/check-updates.sh
```

Shows:

- New commits available
- What's changed
- How to update

### Method 2: Check ai-dev.json

```bash
cat .ai-dev.json
```

Shows:

- Current version
- Last sync timestamp
- Resources installed

### Applying Updates

After checking:

```bash
# Update ai-dev-standards first
cd ~/ai-dev-standards
git pull

# Then sync your project
cd /your/project
bash ~/ai-dev-standards/setup-project.sh
```

Or use auto-sync:

```bash
cd /your/project
git pull  # If git hook is configured
```

---

## 🛡️ Security & Privacy

### What Gets Committed

Safe to commit:

- `.ai-dev.json` - Version tracking
- `.cursorrules` - Development workflow
- `.claude/` and `.codex/` directories - Configurations
- `.gitignore` additions - Orchestration patterns

### What Stays Local

Automatically excluded (in `.gitignore`):

- `START-HERE.md` - Personalized guide
- `.ai-dev/backups/` - Backup files
- `orchestration-requests/` - Request tracking
- `orchestration-results/` - Result tracking

### Secrets Management

- Never commit `.env` files with real secrets
- Use `.env.example` for templates
- The sync respects existing `.gitignore` patterns

### Project Isolation (v3.0.0+)

Version 3.0.0+ uses **local-first architecture**:

- Complete project isolation
- No shared state between projects
- No cross-project data exposure
- 10x faster, works offline

---

## 🧪 Project Types Supported

### Next.js Projects

- Auto-detects and uses `cursorrules-saas.md` template
- Configures for React + Server Components
- Sets up recommended deployment patterns

### React Projects

- Auto-detects and uses `cursorrules-saas.md` template
- Configures for SPA patterns
- Sets up component best practices

### Node.js / Backend Projects

- Uses minimal configuration
- Focuses on API design and backend skills
- Configures for Express/Fastify patterns

### Existing Projects

- Uses `cursorrules-existing-project.md` template
- Focuses on documentation and improvement
- Provides analysis and recommendations

### Empty Projects

- Uses minimal template
- Helps bootstrap new projects
- Guides through initial setup

---

## 🐛 Troubleshooting

### "ai-dev command not found"

Install the CLI:

```bash
cd ~/ai-dev-standards/CLI
npm install
npm link
```

### "brain-mcp not working in Claude"

Build brain-mcp:

```bash
cd ~/ai-dev-standards/MCP-SERVERS/brain-mcp
npm install
npm run build
```

Then restart Claude/Codex.

### "Setup script fails with permission error"

Make script executable:

```bash
chmod +x ~/ai-dev-standards/setup-project.sh
```

### "Git hook not running"

Verify and fix:

```bash
chmod +x .git/hooks/post-merge
# Test manually:
.git/hooks/post-merge
```

### "Sync overwrote my customizations"

**Prevention:** Keep customizations in:

- `.ai-dev/custom-skills/` - Custom skills
- Your own directories - The sync only touches specific directories

**Recovery:** Check git history:

```bash
git diff HEAD^ HEAD -- [file-that-changed]
git checkout HEAD^ -- [file-to-restore]
```

### "Skills not activating automatically"

Check configuration:

```bash
# Verify .cursorrules exists
cat .cursorrules

# Check MCP configuration
cat .claude/mcp-settings.json

# Rebuild brain-mcp
cd ~/ai-dev-standards/MCP-SERVERS/brain-mcp
npm run build
```

---

## 🚀 Best Practices

### 1. Update Regularly

Update ai-dev-standards weekly:

```bash
# Update ai-dev-standards
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

### 3. Use Brain-First Workflow

When starting any task:

```
"Use brain_search to find relevant skills for [your task]"
```

Let the brain guide you to the right resources.

### 4. Test After Major Updates

After updating to a new major version:

1. Run your test suite
2. Test brain-mcp connectivity
3. Verify Claude can access skills
4. Check that your build still works

### 5. Document Your Setup

Keep a log for your team:

```bash
cat > AI-DEV-STANDARDS-SETUP.md << 'EOF'
# AI-Dev-Standards Setup

**Date:** [Date]
**Version:** [Version from .ai-dev.json]

## Configuration
- Template: [minimal/saas/ai-rag/existing]
- Auto-sync: [enabled/disabled]
- Brain-MCP: [enabled/disabled]

## Resources Installed
- Skills: 64
- MCPs: 50
- Components: 72
- Integrations: 28
- Tools: 24
- Total: 238 core resources

## Team Guidelines
[Add your team's specific guidelines here]
EOF
```

---

## 📚 Additional Resources

### Documentation

- [STANDALONE-USAGE.md](STANDALONE-USAGE.md) - Using as reference library
- [DOCS/TROUBLESHOOTING.md](DOCS/TROUBLESHOOTING.md) - Common issues
- [CONTRIBUTING.md](CONTRIBUTING.md) - Contributing guidelines

### Getting Help

- Check [DOCS/INDEX.md](DOCS/INDEX.md) for all documentation
- Review [META/HOW-TO-USE.md](META/HOW-TO-USE.md) for navigation
- Open an issue on GitHub for bugs

### What's New

- [CHANGELOG.md](CHANGELOG.md) - Version history
- [VERSION-POLICY.md](VERSION-POLICY.md) - Versioning strategy

---

## 📊 What You Get (238 Core Resources)

### 64 Specialized Skills

Methodologies covering product development, AI development, technical development, infrastructure, and UX/design.

### 50 MCP Servers

Automation tools for AI/ML, product management, engineering, quality, and design.

### 72 Components

React components for auth, forms, errors, feedback, media, layouts, and advanced UI.

### 28 Service Integrations

Pre-configured connections to OpenAI, Supabase, Stripe, and other essential services.

### 24 Essential Tools

Development utilities and automation scripts.

---

## 🎯 Comparison: Integration vs Standalone

| Feature              | Integration Mode    | Standalone Mode    |
| -------------------- | ------------------- | ------------------ |
| **Setup**            | One command         | Clone + browse     |
| **AI Integration**   | Automatic via MCP   | Manual prompts     |
| **Updates**          | Auto-sync           | Manual git pull    |
| **Skill Activation** | Automatic           | Manual reference   |
| **Project Analysis** | Yes (START-HERE.md) | No                 |
| **Best For**         | Active development  | Learning, browsing |
| **Overhead**         | Adds config files   | None               |

---

**Last Updated:** 2025-11-09
**Version:** 3.0.3

---

**Want to browse first?** See [STANDALONE-USAGE.md](STANDALONE-USAGE.md) for reference library usage.
