# Brain/Orchestrator Troubleshooting Guide

## Overview

The Brain/Orchestrator system enables Claude to automatically select and invoke the appropriate skills, tools, and MCPs for any given task. If it's not working, this guide will help you diagnose and fix the issue.

## Architecture Overview

```
┌─────────────────────────────────────────┐
│ Claude Code / Codex CLI                 │
│ (Your AI Assistant)                     │
└───────────────┬─────────────────────────┘
                │ Invokes via MCP Protocol
                ↓
┌─────────────────────────────────────────┐
│ Brain MCP Server                        │
│ (mcp-servers/brain-mcp)                │
│                                         │
│ Tools:                                  │
│ • brain_search                          │
│ • brain_select_skills                   │
│ • brain_show_skill                      │
│ • brain_relationships                   │
│ • graph_query_by_domain                 │
│ • etc.                                  │
└───────────────┬─────────────────────────┘
                │ Calls
                ↓
┌─────────────────────────────────────────┐
│ Brain CLI & Registries                  │
│ (scripts/brain/)                       │
│                                         │
│ • skill-registry.json (64 skills)      │
│ • mcp-registry.json (51 MCPs)          │
│ • relationship-mapping.json            │
│ • capability-graph.json                │
└─────────────────────────────────────────┘
```

## Quick Diagnosis

Run this command to check your setup:

```bash
# From repository root
./scripts/configure-mcp-paths.sh
```

This will:

- ✅ Build brain-mcp server
- ✅ Build brain CLI
- ✅ Update configuration files with correct paths
- ✅ Show next steps

## Common Issues & Solutions

### Issue 1: MCP Server Not Found

**Symptoms:**

- Claude says "brain_search is not available"
- MCP tools don't appear in Claude's tool list

**Diagnosis:**

```bash
# Check if brain-mcp is built
ls -la mcp-servers/brain-mcp/dist/index.js

# Check if configuration exists
cat .claude/mcp-settings.json | grep brain-mcp
```

**Solution:**

```bash
# Option 1: Use the configuration script (recommended)
./scripts/configure-mcp-paths.sh

# Option 2: Manual build
cd mcp-servers/brain-mcp
npm install
npm run build
```

### Issue 2: Incorrect Paths in Configuration

**Symptoms:**

- MCP server fails to start
- Error: "Cannot find module '/home/david/projects/...'"
- Paths point to another user's directory

**Diagnosis:**

```bash
# Check for hardcoded paths
grep -r "/home/david" .claude/ .codex/ 2>/dev/null
```

**Solution:**

```bash
# Run the configuration script to fix paths
./scripts/configure-mcp-paths.sh
```

The script will:

1. Detect your repository's absolute path
2. Update `.claude/mcp-settings.json`
3. Update `.codex/mcp-servers.json`
4. Create configs from templates if missing

### Issue 3: Brain CLI Not Built

**Symptoms:**

- Brain MCP returns errors about missing brain CLI
- TypeScript compilation errors

**Diagnosis:**

```bash
# Check if brain CLI is built
ls -la scripts/brain/dist/brain.js

# Try to run brain CLI
cd scripts/brain
npm run brain -- status
```

**Solution:**

```bash
# Build the brain CLI
cd scripts/brain
npm install
npm run build

# Test it works
npm run brain -- status
```

**If build fails with vitest error:**

```bash
# The tsconfig.json should exclude tests/
# This is fixed in the latest version
cd scripts/brain
cat tsconfig.json | grep -A 3 exclude
# Should show: "tests" in exclude list
```

### Issue 4: Claude Doesn't Invoke Brain Automatically

**Symptoms:**

- Brain MCP is configured but Claude doesn't use it
- You have to explicitly ask Claude to use brain_search

**Root Cause:**
Claude doesn't automatically invoke MCP tools unless:

1. The task explicitly requires them, OR
2. You ask Claude to use them

**Solution:**

**For automatic invocation**, update your system prompt or project instructions:

Create/update `.claude/instructions.md`:

```markdown
# Project Instructions

## Resource Discovery

When I need to:

- Find relevant skills for a task → Use brain_select_skills
- Search for MCPs or tools → Use brain_search
- Understand skill relationships → Use brain_relationships
- Query capabilities by domain → Use graph_query_by_domain

## Workflow

1. For any development task, first use brain_select_skills to find relevant skills
2. Check skill relationships to find required MCPs
3. Load the skill files and follow their methodologies
4. Use the recommended MCPs and tools
```

**For explicit invocation**, ask Claude directly:

```
"Use brain_select_skills to find the best skills for building a RAG system"
"Use brain_search to find authentication-related resources"
```

### Issue 5: Skills Not Auto-Activating

**Symptoms:**

- Skills exist but Claude doesn't use them automatically
- You have to manually tell Claude which skill to use

**Understanding:**
Skills in the `skills/` directory are **NOT automatically loaded into Claude's context**. They must be:

1. Referenced via brain MCP tools, OR
2. Explicitly loaded by reading the skill file

**How Skills Work:**

```markdown
# Traditional (Manual):

You: "I need to build an MVP"
Claude: _doesn't know about mvp-builder skill_
You: "Use the mvp-builder skill"
Claude: _reads skills/mvp-builder/SKILL.md_

# With Brain MCP (Automatic):

You: "I need to build an MVP"
Claude: _uses brain_select_skills("build mvp")_
Claude: _discovers mvp-builder skill_
Claude: _reads skills/mvp-builder/SKILL.md_
Claude: _applies methodology_
```

**Solution:**

Add to `.claude/instructions.md`:

```markdown
## Skill Discovery Workflow

For any development task:

1. Use brain_select_skills with task description
2. Read the recommended skill files
3. Follow the skill's methodology
4. Use recommended MCPs from brain_relationships
```

### Issue 6: Environment Variable Not Set

**Symptoms:**

- Error: "AI_DEV_STANDARDS_ROOT not set"
- Brain MCP can't find repository root

**Diagnosis:**

```bash
# Check MCP config
cat .claude/mcp-settings.json | grep AI_DEV_STANDARDS_ROOT
```

**Solution:**

```bash
# Run configuration script
./scripts/configure-mcp-paths.sh
```

Or manually edit `.claude/mcp-settings.json`:

```json
{
  "mcpServers": {
    "brain-mcp": {
      "env": {
        "AI_DEV_STANDARDS_ROOT": "/absolute/path/to/ai-dev-standards"
      }
    }
  }
}
```

### Issue 7: MCP Server Crashes on Startup

**Symptoms:**

- Claude reports MCP connection error
- Brain MCP won't start

**Diagnosis:**

```bash
# Test brain MCP directly
cd mcp-servers/brain-mcp
node dist/index.js

# Check logs
# (Claude typically shows MCP logs in developer console)
```

**Common Causes:**

1. Missing dependencies → Run `npm install`
2. TypeScript not compiled → Run `npm run build`
3. Missing capability-graph.json → See Issue 8

**Solution:**

```bash
# Rebuild everything
./scripts/configure-mcp-paths.sh
```

### Issue 8: Missing Capability Graph

**Symptoms:**

- Error: "Failed to load capability graph"
- Graph query tools fail

**Diagnosis:**

```bash
ls -la meta/capability-graph.json
```

**Solution:**

The capability graph should exist in the repository. If it's missing:

```bash
# Check if it's in the repository
git ls-files meta/capability-graph.json

# If missing from git, you may need to generate it
# (This requires the manifest generator which needs Codex)
cd scripts/brain
npm run brain -- build-graph
```

## Verification Steps

After fixing issues, verify everything works:

### 1. Test Brain CLI

```bash
cd scripts/brain
npm run brain -- status

# Should show:
# Skills: 64
# MCPs: 51
# Total Resources: 239
```

### 2. Test Brain MCP

```bash
# In Claude Code, ask:
"Use brain_status to show repository status"

# Should return skill count, MCP count, health status
```

### 3. Test Skill Selection

```bash
# In Claude Code, ask:
"Use brain_select_skills to recommend skills for building a RAG system"

# Should return:
# - rag-implementer
# - knowledge-base-manager
# - etc.
```

### 4. Test Skill Loading

```bash
# In Claude Code, ask:
"Use brain_select_skills for 'build MVP', then read and apply the recommended skills"

# Claude should:
# 1. Use brain_select_skills
# 2. Get mvp-builder recommendation
# 3. Read skills/mvp-builder/SKILL.md
# 4. Apply the methodology
```

## Understanding Automatic Selection

The brain/orchestrator provides **assisted discovery**, not fully automatic selection. Here's how it works:

### What IS Automatic:

- ✅ Brain MCP provides skill recommendations when asked
- ✅ Relationship mapping shows required MCPs
- ✅ Graph queries find relevant capabilities

### What IS NOT Automatic:

- ❌ Claude doesn't automatically invoke brain tools without prompting
- ❌ Skills aren't pre-loaded into context
- ❌ MCPs aren't auto-selected for tasks

### How to Make It Feel Automatic:

**Option 1: Project Instructions**
Create `.claude/instructions.md` with brain workflow (see Issue 4)

**Option 2: Explicit Prompts**
Train yourself to ask:

- "What skills should I use for [task]?"
- "Find resources for [topic]"
- "What MCPs do I need for [skill]?"

**Option 3: Custom Workflows**
Create project-specific workflows that invoke brain tools:

```markdown
# In your project's .claude/project.md

When implementing a new feature:

1. Use brain_select_skills to find relevant skills
2. Use brain_relationships to get required MCPs
3. Read skill files and follow methodologies
```

## Advanced Debugging

### Enable MCP Debug Logging

For Claude Desktop, edit `~/.config/Claude/config.json`:

```json
{
  "mcpDebug": true
}
```

### Check MCP Tool List

In Claude Code, you can ask:

```
"What MCP tools do you have available?"
```

Should include:

- brain_search
- brain_select_skills
- brain_show_skill
- brain_relationships
- graph_query_by_domain
- (and 7+ more)

### Manual Brain CLI Testing

Test each brain command:

```bash
cd scripts/brain

# Status
npm run brain -- status

# Search
npm run brain -- search "authentication"

# Skill selection
npm run brain -- select-skills "build RAG system"

# Relationships
npm run brain -- relationships rag-implementer

# Pattern matching
npm run brain -- patterns "need knowledge base"

# Workflow planning
npm run brain -- workflow "implement authentication"

# Comprehensive analysis
npm run brain -- analyze "build AI chatbot"
```

## Getting Help

If you're still having issues:

1. **Check Logs**: Look at Claude's developer console for MCP errors
2. **Test Locally**: Run brain CLI commands to isolate the issue
3. **Verify Paths**: Ensure all paths in config files are correct
4. **Rebuild**: Run `./scripts/configure-mcp-paths.sh` again
5. **Check Versions**: Ensure Node.js >= 18 and npm are up to date

## Summary

The brain/orchestrator system requires:

1. ✅ Brain CLI built (`scripts/brain/dist/brain.js`)
2. ✅ Brain MCP built (`mcp-servers/brain-mcp/dist/index.js`)
3. ✅ Correct paths in `.claude/mcp-settings.json`
4. ✅ Claude configured to use brain MCP
5. ✅ Project instructions to prompt brain usage

**Quick Fix**: Run `./scripts/configure-mcp-paths.sh` to set up everything automatically.

**For Automatic Behavior**: Add project instructions to guide Claude to use brain tools for skill discovery.
