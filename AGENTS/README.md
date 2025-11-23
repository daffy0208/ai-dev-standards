# Agents Directory

## Overview

This directory contains definitions, templates, and implementations for **AI agents** - autonomous systems that perceive, reason, and act to achieve specific goals. Agents orchestrate skills, tools, and MCPs to execute complex workflows with minimal human intervention.

## What's in This Directory

```
AGENTS/
├── AGENT.md              # Comprehensive guide to agents (fundamentals, types, architecture)
├── README.md             # This file - directory overview
├── _TEMPLATE/            # Template for creating new agents
│   └── AGENT.md
└── [future agents]/      # Individual agent implementations
    └── agent-name/
        ├── AGENT.md      # Agent specification
        ├── config.yaml   # Configuration
        └── examples/     # Usage examples
```

## Understanding Agents

### What is an Agent?

An **agent** is an AI system that:

1. **Perceives** - Understands context and inputs
2. **Reasons** - Makes decisions based on goals and constraints
3. **Acts** - Executes tools and invokes skills
4. **Adapts** - Adjusts strategy based on results

### Agents vs Skills vs MCPs

```
┌─────────────────────────────────────────────────────┐
│   AGENTS (Execution Layer)          │ WHEN/WHO      │
│   Orchestrate workflows autonomously │               │
└────────────┬────────────────────────────────────────┘
             │
             ├──> SKILLS (Knowledge Layer - HOW)
             │    Domain expertise and methodologies
             │
             └──> MCPs (Tool Layer - WHAT)
                  Executable tools and capabilities
```

**Key Differences:**

| Aspect           | Agent                      | Skill                      | MCP                       |
| ---------------- | -------------------------- | -------------------------- | ------------------------- |
| **Purpose**      | Execute workflows          | Provide expertise          | Provide tools             |
| **Autonomy**     | High (makes decisions)     | Medium (guides approach)   | Low (executes commands)   |
| **State**        | Stateful (tracks progress) | Stateless (pure knowledge) | Stateless (pure function) |
| **Adaptability** | Adapts to results          | Fixed methodology          | Fixed interface           |
| **Invokes**      | Skills + MCPs              | MCPs + patterns            | External systems          |

## Agent Types

### 1. Task-Oriented Agents

**Purpose:** Execute specific, well-defined tasks

**Examples:**

- Code review agent
- Documentation generator
- Test creator
- Bug fixer

**When to use:** Single-purpose automation, repeatable workflows, quality assurance

### 2. Skill-Based Agents

**Purpose:** Embody domain expertise for complex implementations

**Examples:**

- MVP builder agent (uses `mvp-builder` skill)
- RAG implementer agent (uses `rag-implementer` skill)
- Security auditor agent (uses `security-engineer` skill)

**When to use:** Domain-specific development, methodology enforcement, best practices application

### 3. Tool-Powered Agents

**Purpose:** Orchestrate multiple tools for complex operations

**Examples:**

- Database migration agent (uses database MCPs)
- Deployment agent (uses CI/CD MCPs)
- Monitoring agent (uses observability MCPs)

**When to use:** Heavy tool integration, external system interaction, infrastructure operations

### 4. Multi-Agent Systems

**Purpose:** Coordinate multiple specialized agents

**Examples:**

- Product team (strategist + designer + builder + tester)
- CI/CD pipeline (linter + tester + builder + deployer)
- Content pipeline (writer + editor + publisher + analyzer)

**When to use:** Complex problems requiring specialization, parallel processing, modular architecture

## Execution Patterns

### ReAct (Reason + Act)

Iterative reasoning and action loop:

```
Thought: Analyze current state
Action: Execute tool/skill
Observation: Process results
Thought: Determine next step
Action: Execute next tool/skill
...
Final Answer: Complete goal
```

**Best for:** Exploratory tasks, debugging, adaptive workflows

### Plan-Execute

Planning phase followed by execution:

```
Planning:
1. Analyze requirements
2. Break down into steps
3. Identify tools needed

Execution:
1. Execute step 1
2. Execute step 2
3. Validate and complete
```

**Best for:** Well-understood tasks, structured workflows, predictable outcomes

### Hierarchical

Manager agent coordinating sub-agents:

```
Manager Agent
├── Planning Agent
├── Execution Agents (parallel)
│   ├── Frontend Agent
│   ├── Backend Agent
│   └── Database Agent
└── Review Agent
```

**Best for:** Complex projects, parallel work streams, specialized domains

### Feedback Loop

Iterative improvement cycle:

```
1. Attempt task
2. Validate results
3. If failure → feedback → adjust → retry
4. If success → proceed
5. Repeat until goal achieved
```

**Best for:** Quality-focused tasks, automated testing, iterative refinement

## Creating a New Agent

### Step 1: Define the Need

Ask yourself:

- **Problem:** What problem does this agent solve?
- **Value:** Why is autonomous execution beneficial?
- **Scope:** What is in/out of scope?
- **Alternative:** Could a skill or MCP suffice?

### Step 2: Choose Agent Type

Select based on:

- **Task-Oriented:** Single, specific purpose
- **Skill-Based:** Requires domain methodology
- **Tool-Powered:** Heavy tool orchestration
- **Multi-Agent:** Multiple specialized roles

### Step 3: Design Architecture

Identify:

- **Required Skills:** Which domain expertise is needed?
- **Required MCPs:** Which tools are necessary?
- **Execution Pattern:** ReAct, Plan-Execute, Hierarchical, or Feedback Loop?
- **State Management:** What state needs tracking?

### Step 4: Use the Template

```bash
# Create new agent directory
mkdir -p AGENTS/agent-name

# Copy template
cp AGENTS/_TEMPLATE/AGENT.md AGENTS/agent-name/AGENT.md

# Edit and fill in all sections
$EDITOR AGENTS/agent-name/AGENT.md
```

### Step 5: Document Dependencies

In your AGENT.md frontmatter:

```yaml
---
name: agent-name
required-skills:
  - skill-name-1
  - skill-name-2
required-mcps:
  - mcp-server-1
  - mcp-server-2
---
```

### Step 6: Add to Registry

Register in `META/agent-registry.json`:

```json
{
  "name": "agent-name",
  "type": "task-oriented",
  "version": "1.0.0",
  "path": "/AGENTS/agent-name/AGENT.md",
  "skills": ["skill-name-1", "skill-name-2"],
  "mcps": ["mcp-server-1", "mcp-server-2"]
}
```

### Step 7: Update Relationships

Update `META/relationship-mapping.json` to show:

- Agent → Skill dependencies
- Agent → MCP dependencies
- Agent → Component usage

### Step 8: Create Examples

Add concrete examples showing:

- Input format
- Execution trace
- Output format
- Common variations
- Error handling

## Best Practices

### 1. Single Responsibility

**✅ Do:**

- One clear purpose per agent
- Compose agents for complex tasks
- Keep agents focused and testable

**❌ Don't:**

- Create "god agents" that do everything
- Mix unrelated responsibilities
- Overload agents with too many skills

### 2. Explicit Dependencies

**✅ Do:**

- Document all required skills
- List all required MCPs
- Specify minimum capabilities
- Provide fallback strategies

**❌ Don't:**

- Assume tools are available
- Hide dependencies
- Fail silently when tools missing

### 3. Graceful Degradation

**✅ Do:**

- Check tool availability before use
- Provide fallback strategies
- Return clear error messages
- Log decision points

**❌ Don't:**

- Crash on missing dependencies
- Fail without explanation
- Leave agents in inconsistent state

### 4. Observable Behavior

**✅ Do:**

- Log all major decisions
- Track state transitions
- Report progress incrementally
- Enable debugging

**❌ Don't:**

- Operate as a black box
- Hide internal state
- Suppress error details

### 5. Testability

**✅ Do:**

- Write unit tests for decision logic
- Create integration tests with real tools
- Test error scenarios
- Validate against edge cases

**❌ Don't:**

- Skip testing complex logic
- Test only happy paths
- Ignore error conditions

## Example Agent Implementations

### Example 1: Code Review Agent

```yaml
name: code-review-agent
type: task-oriented
pattern: ReAct
skills:
  - security-engineer
  - testing-strategist
  - quality-auditor
mcps:
  - codex-mcp
  - git-mcp
```

**Flow:**

1. Fetch code changes via `git-mcp`
2. Analyze security with `security-engineer` skill
3. Check test coverage with `testing-strategist` skill
4. Run quality audit with `quality-auditor` skill
5. Generate review report via `codex-mcp`

### Example 2: MVP Builder Agent

```yaml
name: mvp-builder-agent
type: skill-based
pattern: Plan-Execute
skills:
  - mvp-builder
  - frontend-builder
  - api-designer
mcps:
  - component-generator-mcp
  - api-scaffold-mcp
```

**Flow:**

1. Plan: Use `mvp-builder` to prioritize features
2. Design: Use `api-designer` to define contracts
3. Build Frontend: Use `frontend-builder` + `component-generator-mcp`
4. Build Backend: Use `api-scaffold-mcp`
5. Validate: Check against MVP criteria

### Example 3: Multi-Agent RAG Pipeline

```yaml
name: rag-pipeline-orchestrator
type: multi-agent
pattern: Hierarchical
sub-agents:
  - document-chunker-agent
  - embedding-generator-agent
  - vector-indexer-agent
  - retrieval-agent
skills:
  - rag-implementer
mcps:
  - document-processor-mcp
  - embedding-mcp
  - vector-database-mcp
```

**Flow:**

1. Orchestrator uses `rag-implementer` skill for strategy
2. Delegates chunking to `document-chunker-agent`
3. Parallel: Generate embeddings via `embedding-generator-agent`
4. Index vectors via `vector-indexer-agent`
5. Enable retrieval through `retrieval-agent`

## Integration with Repository

### With Skills

Agents **invoke** skills to get domain expertise:

```javascript
const skill = await skillRegistry.get('mvp-builder')
const approach = await skill.recommend(context)
```

### With MCPs

Agents **use** MCPs to execute tools:

```javascript
const mcp = await mcpRegistry.get('component-generator-mcp')
const result = await mcp.invoke('generate', params)
```

### With Components

Agents **leverage** components for common patterns:

```javascript
import { ErrorBoundary } from '@/components/error-boundary'
// Use in agent's UI layer
```

## File Naming Conventions

```
AGENTS/
├── agent-name/              # kebab-case, descriptive
│   ├── AGENT.md            # Always uppercase
│   ├── config.yaml         # Configuration
│   ├── schema.json         # Input/output schema
│   ├── examples/
│   │   ├── basic.md        # Simple example
│   │   └── advanced.md     # Complex example
│   └── tests/
│       ├── unit.test.js
│       └── integration.test.js
```

## Related Documentation

**Fundamentals:**

- `AGENTS/AGENT.md` - Complete agent guide
- `DOCS/AGENTS-GUIDE.md` - Agent usage guide
- `DOCS/AGENT-SKILL-INTEGRATION.md` - Integration patterns

**Skills:**

- `SKILLS/README.md` - Skill directory overview
- `SKILLS/_TEMPLATE/SKILL.md` - Skill template

**MCPs:**

- `MCP-SERVERS/README.md` - MCP directory overview
- `DOCS/MCP-DEVELOPMENT-ROADMAP.md` - MCP development guide

**Playbooks:**

- `PLAYBOOKS/multi-agent-systems.md` - Multi-agent orchestration
- `PLAYBOOKS/deployment-checklist.md` - Agent deployment

## Future Directions

### Planned Agent Types

1. **ADHD-Optimized Agents**
   - Task breakdown agent
   - Focus session agent
   - Context preservation agent

2. **Quality Assurance Agents**
   - Automated testing agent
   - Performance profiling agent
   - Security scanning agent

3. **Product Development Agents**
   - User research agent
   - Feature prioritization agent
   - Launch planning agent

4. **Infrastructure Agents**
   - Deployment automation agent
   - Monitoring setup agent
   - Incident response agent

### Enhancements

- Agent registry and discovery system
- Agent orchestration framework
- Inter-agent communication protocol
- Agent monitoring dashboard
- Agent performance analytics

## Contributing

### Adding a New Agent

1. Use the template in `_TEMPLATE/AGENT.md`
2. Fill out all required sections
3. Add examples and tests
4. Register in `META/agent-registry.json`
5. Update `META/relationship-mapping.json`
6. Submit PR with documentation

### Improving Existing Agents

1. Update version number
2. Document changes in version history
3. Update examples if behavior changed
4. Update tests for new scenarios
5. Submit PR with clear rationale

## Questions?

- **General Questions:** See `AGENTS/AGENT.md`
- **Integration:** See `DOCS/AGENT-SKILL-INTEGRATION.md`
- **Multi-Agent Systems:** See `PLAYBOOKS/multi-agent-systems.md`
- **Architecture:** See `DOCS/SYSTEM-OVERVIEW.md`

---

**Last Updated:** 2025-10-28
**Version:** 1.0.0
**Maintainers:** AI Dev Standards Team
