# Quick Start: Use AI Dev Standards Brain in Your Projects

**Get Claude Code or Codex to automatically use skills, MCPs, and the brain orchestrator in ANY project**

---

## 🚀 5-Minute Setup

Choose your platform:
- **[Claude Code](#setup-for-claude-code)** - Desktop IDE with inline editing
- **[Codex CLI](#setup-for-codex-cli)** - Terminal-first automation and scripting

---

## Setup for Claude Code

### Step 1: Install Brain MCP

In your project directory:

```bash
mkdir -p .claude
cat > .claude/mcp-settings.json << 'EOF'
{
  "mcpServers": {
    "brain-mcp": {
      "command": "node",
      "args": [
        "/ABSOLUTE/PATH/TO/ai-dev-standards/MCP-SERVERS/brain-mcp/dist/index.js"
      ],
      "env": {
        "AI_DEV_STANDARDS_ROOT": "/ABSOLUTE/PATH/TO/ai-dev-standards"
      }
    }
  }
}
EOF
```

**⚠️ Replace `/ABSOLUTE/PATH/TO/ai-dev-standards` with YOUR actual path!**

Example paths:
- macOS/Linux: `/Users/yourname/ai-dev-standards`
- Windows (WSL): `/home/yourname/projects/ai-dev-standards`
- Windows: `C:\\Users\\yourname\\ai-dev-standards`

### Step 2: Create .cursorrules

```bash
cat > .cursorrules << 'EOF'
# Project AI Configuration

## AI Development Standards Integration
Repository: ~/ai-dev-standards/
Status: Active

### Instructions for Claude Code

**CRITICAL: You have access to the Brain MCP server with these tools:**

#### Brain Intelligence Tools:
- `brain_search` - Search all skills, MCPs, tools by keyword
- `brain_select_skills` - Get intelligent skill recommendations for any task
- `brain_show_skill` - Get detailed information about a specific skill
- `brain_relationships` - Show all dependencies for a skill
- `brain_status` - Get repository health and statistics

#### Capability Graph Tools:
- `graph_query_by_domain` - Find capabilities by domain (ai, security, frontend, etc.)
- `graph_query_by_effect` - Find capabilities by effect they produce
- `graph_get_dependencies` - Get all dependencies for a capability
- `graph_composition_chains` - Find what capabilities work well together
- `graph_find_path` - Find path between two capabilities
- `graph_stats` - Get graph statistics (113 capabilities, 169 relationships)
- `graph_validate` - Validate graph consistency

### MANDATORY WORKFLOW:

**When user asks to build/implement ANY feature:**

1. **ALWAYS start by using `brain_select_skills`** to get recommendations
   Example: `brain_select_skills({ taskDescription: "implement authentication" })`

2. **Check dependencies** with `graph_get_dependencies`
   Example: `graph_get_dependencies({ capabilityId: "security-engineer" })`

3. **Discover what works together** with `graph_composition_chains`
   Example: `graph_composition_chains({ capabilityId: "rag-implementer" })`

4. **Load the recommended skills** from ai-dev-standards/SKILLS/[skill-name]/

5. **Follow the skill methodology** for implementation

### Example Conversation Flow:

```
User: "I need to add authentication to my app"

You (Claude):
1. First, let me use brain_select_skills to find the best approach...
   [Uses brain_select_skills with "implement authentication"]

2. The brain recommends:
   - security-engineer (primary)
   - api-designer (for auth endpoints)
   - supabase-developer (if using Supabase)

3. Let me check dependencies...
   [Uses graph_get_dependencies for security-engineer]

4. Required MCPs:
   - security-scanner-mcp
   - api-validator-mcp

5. Now let me load the security-engineer skill and implement following its methodology...
   [Reads ~/ai-dev-standards/SKILLS/security-engineer/SKILL.md]
```

### When to Use Each Tool:

- **Starting any task** → `brain_select_skills`
- **User asks "what's available"** → `graph_query_by_domain` or `brain_search`
- **Need to know requirements** → `graph_get_dependencies`
- **Planning multi-skill workflow** → `graph_composition_chains`
- **User asks about a specific skill** → `brain_show_skill`

### Project Context

**Tech Stack:**
- Frontend: [e.g., Next.js 14, React, TypeScript]
- Backend: [e.g., Node.js, Express, Supabase]
- Database: [e.g., PostgreSQL, MongoDB]
- AI/LLM: [e.g., OpenAI, Claude]

**Current Phase:** [MVP / Feature Expansion / Production]

**Key Features:**
1. [Feature 1]
2. [Feature 2]
3. [Feature 3]

---

## Usage Rules

**DO:**
- ✅ Use brain_select_skills for EVERY new task
- ✅ Check dependencies before implementing
- ✅ Follow skill methodologies precisely
- ✅ Load and apply relevant patterns from STANDARDS/

**DON'T:**
- ❌ Guess which skills to use - always query the brain
- ❌ Skip dependency checks
- ❌ Implement without checking if a skill exists
- ❌ Ignore skill recommendations
EOF
```

### Step 3: Restart Claude Code

Close and reopen your project in Claude Code to load the new configuration.

---

## Setup for Codex CLI

### Step 1: Install Brain MCP

In your project directory:

```bash
mkdir -p .codex
cat > .codex/mcp-settings.json << 'EOF'
{
  "brain-mcp": {
    "command": "node",
    "args": [
      "/ABSOLUTE/PATH/TO/ai-dev-standards/MCP-SERVERS/brain-mcp/dist/index.js"
    ],
    "env": {
      "AI_DEV_STANDARDS_ROOT": "/ABSOLUTE/PATH/TO/ai-dev-standards"
    }
  }
}
EOF
```

**⚠️ Replace `/ABSOLUTE/PATH/TO/ai-dev-standards` with YOUR actual path!**

### Step 2: Create .codex/codex.md

The brain setup script auto-generates this for you, but you can customize:

```bash
# Run the setup script
cd /path/to/ai-dev-standards
./setup-codex-cli.sh
```

Or manually create `.codex/codex.md` using the template from `TEMPLATES/codex-with-brain.md`

### Step 3: Test Connection

```bash
codex exec "Use brain_status to check connection"
```

Should show:
```
Skills: 64
MCPs: 51
Health: HEALTHY
```

---

## 📝 Prompts to Use

### For Claude Code:

Use natural language prompts directly in the chat:

#### 1️⃣ Starting a New Feature
```
I need to [describe your feature].

First, use brain_select_skills to recommend the best skills for this task,
then check dependencies with graph_get_dependencies, and finally load and
apply the recommended skills from ai-dev-standards.
```

#### 2️⃣ Exploring What's Available
```
Use graph_query_by_domain to show me all capabilities in the "[domain]" domain.
Domains: ai, security, frontend, backend, database, testing, deployment, data
```

#### 3️⃣ RAG/AI Implementation
```
I want to implement [RAG system / AI feature / etc.].

1. Use brain_select_skills with "implement [your feature]"
2. Show me the recommended skills and their descriptions
3. Check dependencies for each skill
4. Create an implementation plan following the skill methodologies
```

#### 4️⃣ Finding the Right Skill
```
Use brain_search to find skills related to "[your topic]".
Show me the top 3 matches and their descriptions.
```

#### 5️⃣ Understanding Dependencies
```
For the [skill-name] skill:
1. Use graph_get_dependencies to show what it needs
2. Use graph_composition_chains to show what skills work well with it
3. Create a recommended implementation order
```

#### 6️⃣ Architecture Decisions
```
I need to decide between [option A] and [option B] for [feature].

1. Search the brain for relevant skills and patterns
2. Use graph_query_by_effect to find capabilities that produce the effects I need
3. Recommend the best approach based on the patterns and skills available
```

---

### For Codex CLI:

Use `codex exec` with quoted prompts:

#### 1️⃣ Starting a New Feature
```bash
codex exec "I need to implement authentication. Use brain_select_skills to recommend the best skills, then check dependencies with graph_get_dependencies."
```

#### 2️⃣ Exploring What's Available
```bash
codex exec "Use graph_query_by_domain to show all capabilities in the 'ai' domain"
```

#### 3️⃣ RAG/AI Implementation
```bash
codex exec "I want to implement a RAG system. First use brain_select_skills, then show dependencies, then create an implementation plan following the recommended skill methodologies."
```

#### 4️⃣ Finding the Right Skill
```bash
codex exec "Use brain_search to find skills related to 'security'. Show the top 3 matches."
```

#### 5️⃣ Automated Review Workflow
```bash
# Run iterative code review using Codex
cd /path/to/ai-dev-standards
./scripts/ci/codex-review.sh src/your-file.ts
```

#### 6️⃣ Scripted Brain Queries
```bash
# Save brain output to a file
codex exec "Use graph_get_dependencies for rag-implementer" > dependencies.txt

# Chain multiple brain queries
codex exec "Use brain_select_skills with 'implement payments'" | \
codex exec "Based on those skills, use graph_composition_chains to show workflow"
```

---

## ✅ Verification - Is It Working?

### Test 1: Check Brain Access

**Claude Code Prompt:**
```
Use brain_status to show me the current ai-dev-standards repository status.
```

**Codex CLI Command:**
```bash
codex exec "Use brain_status"
```

**Expected Response (Both):**
```
Repository Status:
  Skills: 64
  MCPs: 51
  Total Resources: 239
  Health: HEALTHY
```

✅ **If you see this → Working!**
❌ **If error → Check paths in mcp-settings.json**

---

### Test 2: Get Recommendations

**Claude Code Prompt:**
```
Use brain_select_skills with taskDescription "build a REST API with authentication"
```

**Codex CLI Command:**
```bash
codex exec "Use brain_select_skills with taskDescription 'build a REST API with authentication'"
```

**Expected Response (Both):**
```
Recommended Skills:
  • api-designer (REST API design)
  • security-engineer (authentication/authorization)
  • supabase-developer (if using Supabase)

Required MCPs:
  • api-validator-mcp
  • security-scanner-mcp
```

✅ **If you see recommendations → Brain is working!**

---

### Test 3: Check Graph Access

**Claude Code Prompt:**
```
Use graph_stats to show me the capability graph statistics.
```

**Codex CLI Command:**
```bash
codex exec "Use graph_stats"
```

**Expected Response (Both):**
```
Capability Graph Statistics:
  Total Capabilities: 113
  Total Relationships: 169
  Total Effects: 215
  Total Domains: 84
```

✅ **If you see stats → Full integration working!**

---

## 🎯 Real-World Examples

### Example 1: Building a SaaS App

**Your prompt:**
```
I'm building a SaaS application for team task management. I need:
- User authentication
- Real-time task updates
- Team collaboration features
- Stripe payment integration

Use brain_select_skills to recommend which skills I should use, then create
an implementation plan following those skill methodologies.
```

**Claude will:**
1. Use `brain_select_skills` → Recommends mvp-builder, frontend-builder, api-designer, etc.
2. Use `graph_get_dependencies` → Shows required MCPs
3. Use `graph_composition_chains` → Shows optimal workflow
4. Load skills from ai-dev-standards
5. Create prioritized implementation plan using MVP methodology

---

### Example 2: Adding RAG to Existing App

**Your prompt:**
```
I have an existing Express + React app. I want to add AI-powered search over
our documentation (1000 pages, need <3s response time).

1. Use brain_select_skills to find RAG-related skills
2. Check dependencies for the recommended skills
3. Load the RAG pattern from ai-dev-standards
4. Create detailed implementation plan with architecture
```

**Claude will:**
1. Query brain → Recommends rag-implementer
2. Check dependencies → vector-database-mcp, embedding-generator-mcp, etc.
3. Load RAG pattern from `STANDARDS/architecture-patterns/rag-pattern.md`
4. Provide detailed architecture following the pattern
5. Create phased implementation plan

---

### Example 3: Security Review

**Your prompt:**
```
I need a security review of my API. Use the brain to:
1. Find security-related skills
2. Show what MCPs can help with security scanning
3. Create a security checklist following ai-dev-standards best practices
```

**Claude will:**
1. Use `brain_search` with "security"
2. Find security-engineer skill
3. Load security patterns and checklists
4. Use security-scanner-mcp recommendations
5. Create comprehensive security review plan

---

## 🛠️ Troubleshooting

### Issue: "MCP server not found"

**Fix:**
```bash
# Check MCP is built
cd /path/to/ai-dev-standards/MCP-SERVERS/brain-mcp
ls dist/index.js

# If missing, build it:
npm install
npm run build
```

### Issue: "Brain CLI not found"

**Fix:**
```bash
# Build brain CLI
cd /path/to/ai-dev-standards/scripts/brain
npm install
npm run build
```

### Issue: "Capability graph missing"

**Fix:**
```bash
# Check graph exists
ls /path/to/ai-dev-standards/META/capability-graph.json

# Should show 113 nodes - if missing, check your ai-dev-standards is up to date
```

### Issue: Claude doesn't use the tools automatically

**Solution:** Be explicit in your prompts:
```
❌ Bad: "Add authentication"
✅ Good: "Use brain_select_skills to find auth skills, then implement"
```

After a few interactions, Claude will learn to use the brain proactively.

---

## 📋 Template for Your Team

Share this with your team:

```markdown
# Using AI Dev Standards in [Your Project Name]

## Setup (5 minutes)

1. **Add MCP Configuration:**
   - Copy `.claude/mcp-settings.json` from this guide
   - Update paths to point to ai-dev-standards
   - Restart Claude Code

2. **Add .cursorrules:**
   - Copy `.cursorrules` from this guide
   - Update project-specific context (tech stack, features)

3. **Verify:**
   - Open Claude Code
   - Say: "Use brain_status to check connection"
   - Should see repository status

## Daily Usage

**When starting ANY feature:**
```
Use brain_select_skills to recommend skills for [your task]
```

**When exploring options:**
```
Use graph_query_by_domain to explore [domain] capabilities
```

**When planning architecture:**
```
Use graph_composition_chains to see what works together
```

## Available Domains
ai, security, frontend, backend, database, testing, deployment, data,
performance, monitoring, documentation, devops, ux, design

## Questions?
- Check: `/path/to/ai-dev-standards/DOCS/BRAIN-MCP-INTEGRATION.md`
- Brain CLI: `cd ai-dev-standards && node scripts/brain/dist/brain.js --help`
```

---

## 🤔 Claude Code vs Codex: Which Should I Use?

| Use Case | Best Tool | Why |
|----------|-----------|-----|
| **Heavy Code Editing** | Claude Code | Rich IDE experience, inline edits |
| **Terminal Automation** | Codex CLI | Scriptable, CI/CD integration |
| **Interactive Development** | Claude Code | Better for back-and-forth conversation |
| **Code Reviews** | Codex CLI | Automated review scripts available |
| **Quick Queries** | Codex CLI | Fast one-liners in terminal |
| **Complex Multi-file Changes** | Claude Code | Better context management |
| **CI/CD Pipelines** | Codex CLI | Easy to script and automate |
| **Learning/Exploring** | Claude Code | More conversational |

### Hybrid Workflow (Best of Both)

```bash
# 1. Plan with Codex
codex exec "Use brain_select_skills for implementing payments"

# 2. Code in Claude Code (rich IDE experience)
# - Open Claude Code
# - Use the recommended skills
# - Implement features with inline help

# 3. Review with Codex
cd /path/to/ai-dev-standards
./scripts/ci/codex-review.sh src/payments.ts
```

---

## 🎉 You're Ready!

The brain will now intelligently guide your development in **both Claude Code and Codex**:
- **Recommends** the right skills for your tasks
- **Shows** what dependencies you need
- **Suggests** what works well together
- **Loads** the right patterns and best practices
- **Orchestrates** complex workflows automatically

**Next Steps:**
- **Claude Code users:** Start your next feature by asking "Use brain_select_skills to recommend skills for [your task]"
- **Codex users:** Try `codex exec "Use brain_select_skills with taskDescription 'your task'"`

---

## 📚 Further Reading

- [Full Integration Guide](INTEGRATION-GUIDE.md)
- [Brain MCP Integration](BRAIN-MCP-INTEGRATION.md)
- [Claude Code vs Codex Comparison](../.codex/CLAUDE-VS-CODEX.md)
- [Brain MCP Server README](../MCP-SERVERS/brain-mcp/README.md)
- [Brain CLI Documentation](../scripts/brain/README.md)
- [All Available Skills](../META/skill-registry.json)
- [Capability Graph](../META/capability-graph.json)

---

**Status:** ✅ Production Ready
**Version:** 3.0.0
**Last Updated:** 2025-10-31
