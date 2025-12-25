# Claude Code Subagent System

**Last Updated:** 2025-10-27
**Status:** Active

---

## Overview

Claude Code has a **powerful built-in subagent system** via the **Task tool**. This is different from custom LLM agents you build yourself.

**Two Types of Agents in This Repository:**

1. **Claude Code Native Agents** (Task tool) ← **THIS DOCUMENT**
   - Built into Claude Code
   - Spawned via Task tool
   - Specialized for specific tasks
   - Can run in parallel

2. **Custom LLM Agents** (components/agents)
   - You build these yourself
   - Generic task execution
   - Use OpenAI, Anthropic, etc.
   - See: `components/agents/simple-task-agent.ts`

---

## Claude Code's Built-in Agent Types

### 1. general-purpose

**Best for:** Complex multi-step tasks, code searching, research

**Tools Available:** All tools (Read, Write, Edit, Bash, Grep, Glob, WebFetch, WebSearch, etc.)

**Use when:**

- Multi-step implementation tasks
- Searching for code patterns across files
- Research requiring web access
- Tasks requiring file reads + web searches

**Example from Phase 3:**

```
We used this 8 times to create 75 design resources in parallel:
- Image Management Suite (16 files, 6,290 lines)
- Icon & Font Systems (18 files, 5,294 lines)
- Advanced UI Components Part 1 (5 files, 1,915 lines)
- Advanced UI Components Part 2 (12 files, 3,877 lines)
- Layout & Utility Components (10 files, 1,191 lines)
- AI & Design Tool MCPs (14 files, 6,348 lines)
- Design Tool Integrations (11 files)
- Design Tools & Utilities (22 files, 3,595 lines)

Total: 108 files, ~28,000+ lines of code created in parallel
```

### 2. Explore

**Best for:** Fast codebase exploration, pattern discovery

**Tools Available:** Glob, Grep, Read, Bash (limited)

**Thoroughness Levels:**

- `quick` - Basic searches
- `medium` - Moderate exploration
- `very thorough` - Comprehensive analysis

**Use when:**

- Finding files by patterns
- Searching code for keywords
- Answering "how does X work?" questions
- Quick codebase orientation

### 3. statusline-setup

**Best for:** Configuring Claude Code status line

**Tools Available:** Read, Edit

### 4. output-style-setup

**Best for:** Creating Claude Code output styles

**Tools Available:** Read, Write, Edit, Glob, Grep

---

## When to Use Task Tool

### ✅ Use Task Tool When:

1. **Parallel Work** - Multiple independent tasks (most powerful use case!)
2. **Code Search** - Finding patterns across codebase
3. **Complex Research** - Web + code + file reads combined
4. **Large File Creation** - Creating many related files

### ❌ Don't Use Task Tool When:

1. **Reading specific files** - Use Read tool directly
2. **Simple edits** - Use Edit tool directly
3. **Single commands** - Use Bash directly
4. **Already know exact location** - Use direct tools

---

## The Power of Parallel Execution

**Key Insight:** Launch multiple agents in ONE message for massive parallelism!

In Phase 3, we launched 8 agents simultaneously to create 108 files. Each agent worked independently and completed in ~5-10 minutes. Without parallelism, this would have taken 40-80 minutes sequentially.

---

## Custom Agents vs Claude Code Agents

### Custom Agents (components/agents)

**What they are:**

- LLM-based agents you build
- Located in `components/agents/`
- Currently: 1 agent (simple-task-agent.ts)
- Planned: 4 more (rag-agent, research-agent, code-review-agent, multi-agent-coordinator)

**When to use:**

- Building multi-agent systems
- Need persistent agent instances
- Implementing specific workflows
- Using with `multi-agent-architect` skill

**Example:**

```typescript
import { SimpleTaskAgent } from 'components/agents/simple-task-agent'

const agent = new SimpleTaskAgent({
  name: 'DataAnalyzer',
  model: 'gpt-4',
  temperature: 0.3
})

const result = await agent.execute({
  task: 'Analyze sales data',
  context: { sales: [...] }
})
```

### Claude Code Native Agents (Task tool)

**What they are:**

- Built into Claude Code
- No installation required
- Specialized for development tasks
- Run in isolated contexts

**When to use:**

- Within Claude Code conversations
- Parallel task execution
- Code exploration and search
- File creation and modification

---

## Skills That Benefit from Task Tool

Many skills explicitly recommend using Task tool for optimal performance:

### Exploration & Research

- `dark-matter-analyzer` - Use Explore agent for repository analysis
- `user-researcher` - Use general-purpose for data collection
- `knowledge-graph-builder` - Use Explore to find entity relationships

### Multi-Step Implementation

- `mvp-builder` - Use general-purpose for parallel feature creation
- `frontend-builder` - Use for component generation
- `design-system-architect` - Use for token extraction and component creation

### Code Quality & Analysis

- `performance-optimizer` - Use Explore to find bottlenecks
- `security-engineer` - Use Explore for vulnerability scanning
- `quality-auditor` - Use general-purpose for comprehensive audits

---

## Relationship to multi-agent-architect Skill

The `multi-agent-architect` skill helps you **design** multi-agent systems, while Task tool helps you **use** agents within Claude Code.

**multi-agent-architect** covers:

- Agent coordination patterns
- Communication strategies
- Task delegation
- Orchestration frameworks

**Task tool** provides:

- Immediate agent spawning
- Parallel execution
- Built-in specializations
- No setup required

**Use together:**

1. Use `multi-agent-architect` skill to design your system
2. Use Task tool to implement parts of it
3. Build custom agents (components/agents) for persistent instances
4. Use `agent-orchestrator-mcp` to run your custom system

---

## Future: agents.md vs skills.md

**Question:** Should we have separate `agents.md` alongside `skills.md`?

**Answer:** No need. Here's why:

1. **Task tool is a Claude Code feature**, not a repository resource
2. **Custom agents are components**, already in `component-registry.json`
3. **multi-agent-architect is a skill**, already in `skill-registry.json`
4. **THIS document covers the gap** - how Task tool relates to our resources

**If anything needs a separate file**, it would be:

- `WORKFLOWS/parallel-agent-pattern.md` - Best practices for Task tool
- `examples/task-tool-examples.md` - Real-world examples

---

## Registry Coverage

**Current Status:**

- ✅ Custom agents registered in `component-registry.json` (1 active, 4 planned)
- ✅ `multi-agent-architect` skill documented
- ✅ `agent-orchestrator-mcp` provides agent coordination
- ✅ THIS DOCUMENT explains Claude Code's native agents
- ✅ `components/agents/` directory for custom implementations

**No gaps!** We have full coverage of both agent types.

---

## Summary

**You asked:** "Are we missing a category of agents?"

**Answer:** No! We have both:

1. ✅ **Claude Code native agents** (Task tool) - Now documented here
2. ✅ **Custom LLM agents** (components/agents) - Already in registry

The confusion was that **we used Task tool extensively** (8 agents in Phase 3) but **never documented it**. This document closes that gap.

**Key Takeaway:** Use Task tool for parallel execution within Claude Code. Build custom agents (components/agents) for persistent multi-agent systems outside Claude Code.

---

## See Also

- `skills/multi-agent-architect/` - Design multi-agent systems
- `mcp-servers/agent-orchestrator-mcp/` - Orchestrate custom agents
- `components/agents/simple-task-agent.ts` - Custom agent template
- `meta/component-registry.json` - All registered components including agents

---

_Last Updated: 2025-10-27_
