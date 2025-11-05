# Brain/Orchestrator Solution Summary

## Problem Statement

> "Review my repo and help me understand why my brain/orchestrator isn't working automatically and selecting the appropriate tools, skills and mcps for any given task?"

## Root Causes Identified

### 1. Configuration Issues ❌
- **Hardcoded Paths**: MCP configuration files (`.claude/mcp-settings.json`, `.codex/mcp-servers.json`) contained hardcoded paths like `/home/david/projects/...` that only worked on one specific machine
- **Result**: Brain MCP server failed to start on other systems

### 2. Build Issues ❌
- **TypeScript Compilation Error**: `scripts/brain/tsconfig.json` tried to compile test files that depended on vitest, which wasn't installed
- **Result**: `npm run build` failed, preventing brain CLI from working

### 3. Setup Complexity ❌
- **Manual Configuration Required**: Users had to manually update paths in multiple config files
- **No Automation**: No script to handle setup automatically
- **Result**: High barrier to entry, easy to misconfigure

### 4. Documentation Issues ❌
- **Unclear Usage**: Not clear how to invoke brain tools or make them automatic
- **Missing Examples**: No practical workflow examples
- **Poor Discoverability**: Hard to find relevant documentation
- **Result**: Users didn't understand how to use the brain system

### 5. Conceptual Misunderstanding ⚠️
- **Expectation**: Brain would "automatically" select tools without any interaction
- **Reality**: Brain provides MCP tools that Claude must explicitly invoke
- **Result**: Confusion about what "automatic" means in this context

## Solutions Implemented ✅

### 1. Automatic Configuration Script
**File**: `scripts/configure-mcp-paths.sh`

**What it does:**
- Automatically detects repository root path
- Updates `.claude/mcp-settings.json` with correct paths
- Updates `.codex/mcp-servers.json` with correct paths
- Builds brain-mcp server
- Builds brain CLI
- Creates config files from templates if missing

**Usage:**
```bash
./scripts/configure-mcp-paths.sh
```

**Result**: ✅ One-command setup, works on any system

### 2. Build Fix
**File**: `scripts/brain/tsconfig.json`

**Change**: Added `"tests"` to exclude list

**Result**: ✅ Brain CLI builds successfully without errors

### 3. Comprehensive Documentation

#### Quick Reference Guide
**File**: `DOCS/BRAIN-QUICK-REFERENCE.md`

**Contents:**
- Common workflows with examples
- Task → Skills mapping
- Domain → Capabilities mapping
- Brain tools cheat sheet
- CLI commands reference
- Real-world usage examples

#### Troubleshooting Guide
**File**: `DOCS/BRAIN-ORCHESTRATOR-TROUBLESHOOTING.md`

**Contents:**
- Common issues and solutions
- Step-by-step diagnosis
- Configuration verification
- Debug procedures
- FAQ

#### Project Template
**File**: `TEMPLATES/claude-instructions-with-brain.md`

**Purpose**: Copy this to `.claude/instructions.md` to guide Claude to automatically use brain tools

**Contents:**
- Skill discovery workflow
- When to use each brain tool
- Example workflows
- Best practices

### 4. README Update
**File**: `README.md`

**Changes:**
- Clearer explanation of brain/orchestrator
- How it actually works (MCP tools model)
- Quick setup instructions
- Links to all documentation
- Common workflows

### 5. Setup Integration
**File**: `setup-project.sh`

**Changes:**
- Automatically calls `configure-mcp-paths.sh`
- Ensures brain-mcp is built during project setup
- Graceful error handling

**Result**: ✅ New projects get brain-mcp configured automatically

## How It Actually Works

### The Architecture

```
┌─────────────────────────────────────────┐
│ Claude Code / Codex CLI                 │
│ "Use brain_select_skills..."            │
└───────────────┬─────────────────────────┘
                │ MCP Protocol
                ↓
┌─────────────────────────────────────────┐
│ Brain MCP Server                        │
│ (MCP-SERVERS/brain-mcp)                │
│                                         │
│ Exposes 12 tools:                       │
│ • brain_search                          │
│ • brain_select_skills                   │
│ • brain_show_skill                      │
│ • brain_relationships                   │
│ • graph_query_by_domain                 │
│ • graph_query_by_effect                 │
│ • etc.                                  │
└───────────────┬─────────────────────────┘
                │
                ↓
┌─────────────────────────────────────────┐
│ Brain CLI & Registries                  │
│ (scripts/brain/)                       │
│                                         │
│ Data Sources:                           │
│ • skill-registry.json (64 skills)      │
│ • mcp-registry.json (51 MCPs)          │
│ • relationship-mapping.json            │
│ • capability-graph.json                │
└─────────────────────────────────────────┘
```

### The Workflow

**User Request:**
```
"I need to implement authentication"
```

**What Happens:**

1. **Claude Invokes Brain Tool:**
   ```
   brain_select_skills(taskDescription: "implement authentication")
   ```

2. **Brain Analyzes and Returns:**
   ```json
   {
     "recommended": ["security-engineer", "api-designer"],
     "confidence": 85,
     "reasoning": "Pattern match: Authentication & Security"
   }
   ```

3. **Claude Gets Dependencies:**
   ```
   brain_relationships(skillName: "security-engineer")
   ```

4. **Brain Returns:**
   ```json
   {
     "mcps": ["security-scanner-mcp", "api-validator-mcp"],
     "tools": [],
     "components": []
   }
   ```

5. **Claude Loads Skill:**
   ```
   Read SKILLS/security-engineer/SKILL.md
   ```

6. **Claude Applies Methodology:**
   - Follows security-engineer's step-by-step approach
   - Uses recommended MCPs (security-scanner-mcp, api-validator-mcp)
   - Implements authentication according to best practices

### Key Insight: What "Automatic" Means

**NOT Automatic (Without Interaction):**
- ❌ Brain doesn't run in background selecting tools
- ❌ Skills aren't pre-loaded into Claude's context
- ❌ Claude doesn't automatically invoke brain without being asked

**IS Automatic (Assisted Discovery):**
- ✅ Brain provides intelligent recommendations when asked
- ✅ Relationships are mapped automatically
- ✅ Dependencies are resolved automatically
- ✅ Workflows are generated automatically

**Making It Feel Automatic:**

**Option 1**: Use project instructions (`.claude/instructions.md`)
- Copy `TEMPLATES/claude-instructions-with-brain.md`
- Claude will follow the brain workflow for every task

**Option 2**: Train yourself to ask
- "Use brain_select_skills to find skills for [task]"
- "Use brain_relationships to get dependencies"

**Option 3**: Explicit prompting
- Start every request with brain tool invocation
- Example: "Use brain to help me implement authentication"

## Usage Examples

### Example 1: Build RAG System

```
User: "I need to implement semantic search"

Claude automatically (with project instructions):
1. brain_select_skills("implement semantic search")
   → rag-implementer, knowledge-base-manager
   
2. brain_relationships("rag-implementer")
   → vector-database-mcp, embedding-generator-mcp, semantic-search-mcp
   
3. Read SKILLS/rag-implementer/SKILL.md
   
4. Follow 8-phase RAG implementation
   
5. Use recommended MCPs
```

### Example 2: Add Authentication

```
User: "Add JWT authentication to my API"

Claude (you prompt):
You: "Use brain_select_skills for JWT authentication"

1. brain_select_skills("JWT authentication")
   → security-engineer, api-designer
   
2. brain_relationships("security-engineer")
   → security-scanner-mcp, api-validator-mcp
   
3. Read SKILLS/security-engineer/SKILL.md
   
4. Implement auth following security best practices
   
5. Scan with security-scanner-mcp
   
6. Validate with api-validator-mcp
```

### Example 3: Build MVP

```
User: "Help me build an MVP for task management"

Claude (with brain_select_skills):
1. brain_select_skills("build MVP for task management")
   → mvp-builder, product-strategist, frontend-builder
   
2. brain_relationships("mvp-builder")
   → feature-prioritizer-mcp, user-insight-analyzer-mcp
   
3. Read SKILLS/mvp-builder/SKILL.md
   
4. Apply MVP methodology:
   - Identify riskiest assumption
   - Choose MVP pattern (Concierge, Wizard of Oz, etc.)
   - Prioritize features (P0/P1/P2)
   - Build only P0 features
   
5. Use feature-prioritizer-mcp for ranking
   
6. Validate with user-insight-analyzer-mcp
```

## Quick Start Guide

### Step 1: Configure (One Time)

```bash
cd /path/to/ai-dev-standards
./scripts/configure-mcp-paths.sh
```

This will:
- ✅ Build brain-mcp server
- ✅ Build brain CLI
- ✅ Update config files with correct paths
- ✅ Verify everything works

### Step 2: Restart Claude

Restart Claude Code or Codex CLI to load the new MCP configuration.

### Step 3: Test It

Ask Claude:
```
"Use brain_select_skills to find skills for building a RAG system"
```

You should see:
- Claude invokes the brain tool
- Gets recommendations (rag-implementer, knowledge-base-manager)
- Shows reasoning and confidence

### Step 4 (Optional): Enable Automatic Usage

```bash
# Copy the template to your project
cp TEMPLATES/claude-instructions-with-brain.md .claude/instructions.md
```

Now Claude will automatically:
1. Use brain tools to discover skills
2. Check dependencies
3. Load skill files
4. Apply methodologies

## Verification Checklist

After setup, verify:

- [ ] Brain CLI builds: `cd scripts/brain && npm run build`
- [ ] Brain MCP builds: `cd MCP-SERVERS/brain-mcp && npm run build`
- [ ] Paths are correct in `.claude/mcp-settings.json`
- [ ] Paths are correct in `.codex/mcp-servers.json`
- [ ] Brain CLI works: `cd scripts/brain && npm run brain -- status`
- [ ] Shows 64 skills, 51 MCPs, 239 resources
- [ ] Claude can invoke brain tools (ask Claude to use brain_status)

## Documentation Reference

1. **Quick Start**: This document
2. **Quick Reference**: `DOCS/BRAIN-QUICK-REFERENCE.md`
3. **Troubleshooting**: `DOCS/BRAIN-ORCHESTRATOR-TROUBLESHOOTING.md`
4. **Project Template**: `TEMPLATES/claude-instructions-with-brain.md`
5. **CLI Docs**: `scripts/brain/README.md`
6. **MCP Docs**: `MCP-SERVERS/brain-mcp/README.md`
7. **Architecture**: `META/REPOSITORY-BRAIN.md`

## Summary

### What Was Wrong
- ❌ Hardcoded paths (only worked on one machine)
- ❌ Build failures (TypeScript compilation errors)
- ❌ No automation (manual configuration required)
- ❌ Poor documentation (unclear usage)
- ⚠️  Conceptual confusion (what "automatic" means)

### What's Fixed
- ✅ Automatic configuration script
- ✅ Clean builds (no errors)
- ✅ One-command setup
- ✅ Comprehensive documentation
- ✅ Clear explanation of how it works

### How to Use
1. Run `./scripts/configure-mcp-paths.sh` (one time)
2. Restart Claude
3. Ask: "Use brain_select_skills to find skills for [task]"
4. Optional: Add project instructions for automatic usage

### Key Takeaway

The brain/orchestrator **is** working. It just requires explicit invocation of brain tools via MCP. With project instructions, this becomes seamless and feels automatic.

**The brain provides intelligent skill discovery and dependency resolution through MCP tools that Claude can invoke to find the right skills, MCPs, and workflows for any task.**
