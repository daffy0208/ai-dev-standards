# Claude Code Marketplace Recommendations for ai-dev-standards

**Date:** 2025-10-29
**Repository:** ai-dev-standards (ONE repository with 49 MCPs + 70+ Skills)

---

## Already Installed & Configured ✅

### MCPs (3)

1. **domain-memory-agent** - Knowledge base with semantic search for 7092 markdown files
2. **project-health-auditor** - Code health and complexity analysis
3. **workflow-orchestrator** - DAG-based workflow automation

**Status:** Built, configured in `.claude/mcp-settings.json`, ready after restart

---

## High Priority - Recommended to Install

### 1. agent-context-manager (HIGHEST PRIORITY)

**Type:** Plugin (auto-loads AGENTS.md files)
**Why You Need This:**

- Your repo has 70+ skills - each needs agent-specific instructions
- Currently using CLAUDE.md for everything (gets cluttered)
- This lets you create AGENTS.md files that auto-load

**What It Does:**

- Automatically loads `AGENTS.md` files alongside `CLAUDE.md`
- Separate agent-specific rules from general project context
- Three-layer system: auto-load, hooks, manual sync

**How to Use:**

```bash
# 1. Install
/plugin install agent-context-manager@claude-code-plugins-plus

# 2. Create AGENTS.md in your repo
Create .claude/AGENTS.md with agent-specific rules

# 3. Auto-loads on session start
```

**Value:** Keeps CLAUDE.md clean, agent rules separate and organized

---

### 2. ai-sdk-agents (HIGH PRIORITY)

**Type:** Plugin (multi-agent orchestration)
**Why You Need This:**

- You already have agent-orchestrator-mcp
- This provides alternative approach using Vercel AI SDK v5
- Enables handoffs, routing, coordination across LLMs

**What It Does:**

- Specialized agents hand off tasks automatically
- Intelligent routing to best-suited agent
- Coordinate complex workflows across multiple models

**Slash Commands:**

- `/ai-agents-setup` - Initialize multi-agent structure
- `/ai-agent-create [name] [specialization]` - Create new agent
- `/ai-agents-test` - Test multi-agent system

**Value:** Complement your existing agent-orchestrator-mcp with modern SDK approach

---

### 3. Remaining Marketplace MCPs

#### ai-experiment-logger

**Status:** Available, not installed
**Value:** Track experiments when testing your 70+ skills
**Use Case:** Log which skills work best for different tasks

#### conversational-api-debugger

**Status:** Available, not installed
**Value:** Interactive debugging of API issues
**Use Case:** Debug your MCP tool calls interactively

#### design-to-code

**Status:** Available, not installed
**Value:** Lower - unless you're building UI-heavy projects
**Use Case:** Convert Figma designs to React components

---

## Medium Priority - Consider Installing

### Plugin Packs

#### ai-ml-engineering-pack

**Type:** Plugin pack (12 plugins)
**What's Included:**

- Prompt Engineering (3): architect, optimizer, template generator
- LLM Integration (3): integration expert, model selector, API scaffold
- RAG Systems (3): architect, vector DB expert, pipeline generator
- AI Safety (3): safety expert, prompt injection defender, monitoring

**Why Consider:**

- Your repo is focused on AI development standards
- These plugins teach best practices for prompt engineering, RAG, safety
- Could inform your own skill development

**Cost:** Mentioned as paid ($79) but may vary for marketplace version

**Recommendation:** Test individual plugins first:

```bash
/plugin install prompt-architect@claude-code-plugins-plus
/plugin install rag-architect@claude-code-plugins-plus
```

---

### Individual AI/ML Plugins

#### prompt-architect

**Value:** Design advanced prompts using CoT, few-shot patterns
**Use Case:** Improve prompts for your 70+ skills

#### rag-architect

**Value:** Design RAG systems (you already have embedding/vector MCPs)
**Use Case:** Enhance your existing semantic-search capabilities

#### experiment-tracking-setup

**Value:** Set up ML experiment tracking
**Use Case:** Track performance of different skill configurations

---

## Lower Priority

### Skill Enhancers

- file-to-code
- research-to-deploy
- calendar-to-workflow
- web-to-github-issue

**Reason:** Generic workflow tools, not specific to your AI standards repository

### Other Packs

- devops-automation-pack
- security-pro-pack
- fullstack-starter-pack
- creator-studio-pack

**Reason:** Your focus is AI development standards, not full-stack/DevOps

---

## Installation Priority Order

### Phase 1 (Do Now)

1. ✅ **Test marketplace MCPs** - Restart Claude Code to verify they load
2. **Install agent-context-manager** - Most valuable for organizing 70+ skills
   ```bash
   /plugin install agent-context-manager@claude-code-plugins-plus
   ```

### Phase 2 (This Week)

3. **Install ai-sdk-agents** - Modern multi-agent orchestration
   ```bash
   /plugin install ai-sdk-agents@claude-code-plugins-plus
   ```
4. **Install remaining MCPs** - Complete MCP coverage
   ```bash
   # Install, build, configure ai-experiment-logger
   # Install, build, configure conversational-api-debugger
   ```

### Phase 3 (Next Week)

5. **Test individual AI/ML plugins**
   ```bash
   /plugin install prompt-architect@claude-code-plugins-plus
   /plugin install rag-architect@claude-code-plugins-plus
   ```

### Phase 4 (Future)

6. **Evaluate ai-ml-engineering-pack** - If individual plugins prove valuable

---

## What NOT to Install

### Avoid These (Low Value for Your Project)

- Crypto plugins (27 plugins)
- Finance plugins
- Business tools
- Most devops plugins (unless deploying your standards)
- Testing plugins (you have test-runner-mcp)
- Database plugins (you have database-migration-mcp)

**Reason:** Your repository is about AI development standards, not production apps

---

## Key Insight: Your Repository's Purpose

**ai-dev-standards is:**

- A framework library of AI development standards
- 70+ reusable skills
- 49 MCP servers
- Templates, patterns, tools
- NOT a production application

**Therefore, install plugins that:**
✅ Help organize and enhance your skills
✅ Improve prompt engineering for skills
✅ Provide multi-agent orchestration patterns
✅ Track experiments with different skills
✅ Document best practices

**Avoid plugins that:**
❌ Deploy production applications
❌ Manage infrastructure
❌ Handle specific business domains
❌ Build full-stack apps

---

## Testing Marketplace MCPs

After restarting Claude Code, test the 3 installed MCPs:

### domain-memory-agent

```
"Use domain-memory-agent to store this document:
Title: 'Testing Marketplace MCPs'
Content: 'Successfully installed 3 marketplace MCPs for ai-dev-standards'
Tags: ['marketplace', 'mcp', 'testing']"

"Use domain-memory-agent to search for documents about 'archon-manager'"
```

### project-health-auditor

```
"Use project-health-auditor to analyze code health in the SKILLS directory"
"Use project-health-auditor to identify high-complexity files"
"Use project-health-auditor to show git churn for the last 30 days"
```

### workflow-orchestrator

```
"Use workflow-orchestrator to create a workflow for:
1. Build all MCPs
2. Run validation (depends on build)
3. Update documentation (depends on validation)"

"Use workflow-orchestrator to execute the build workflow"
```

---

## Summary

**Already Done:**

- ✅ 3 marketplace MCPs installed and configured
- ✅ 52 total MCPs in Claude Code (49 repo + 3 marketplace)
- ✅ Configuration files updated

**Next Steps:**

1. Restart Claude Code to load marketplace MCPs
2. Test the 3 marketplace MCPs
3. Install agent-context-manager (highest value)
4. Consider ai-sdk-agents for multi-agent patterns

**Avoid:**

- Don't install every plugin "just because"
- Focus on plugins that enhance your AI standards repository
- Skip production app/deployment/business domain plugins

---

## Configuration Summary

**Total MCPs:** 52

- Repository MCPs: 49 (in MCP-SERVERS/)
- Marketplace MCPs: 3 (domain-memory-agent, project-health-auditor, workflow-orchestrator)

**Config File:** `.claude/mcp-settings.json`
**Status:** Complete and verified
**Ready:** After Claude Code restart

---

**Your repository is about AI development STANDARDS, not production apps. Choose plugins accordingly.**
