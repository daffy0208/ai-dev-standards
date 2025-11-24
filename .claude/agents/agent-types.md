# Agent Types: Complete Taxonomy

Comprehensive classification of all agent types available in Claude Code and the ai-dev-standards repository.

---

## Overview

**Total Agent Types: 10**

- **4 Claude Code Built-in Agents** - Native CLI agents
- **6 Skill-Based Agents** - Skills that function as autonomous agents

---

## 1. Claude Code Built-in Agents (4)

### 1.1 General-Purpose Agent

**Type:** Default, Multi-Purpose
**Status:** Active
**Invocation:** Default mode

**Purpose:**
Comprehensive development agent for most tasks including code search, analysis, editing, and multi-step research.

**Core Capabilities:**

- Multi-file analysis and editing
- Complex codebase exploration
- System architecture understanding
- Multi-step research tasks
- File operations (read, write, edit)
- Pattern recognition and matching

**Best For:**

- Bug investigation and fixes
- Feature implementation
- Refactoring
- Code review preparation
- Ongoing development work

**Performance:**

- Speed: Variable (depends on task)
- Depth: High
- Memory: Handles large files efficiently

**Integration:**

- Can invoke any of 59 skills
- Access to 36 MCP servers
- Works with all tools and components

**Documentation:** `general-purpose.md`

---

### 1.2 Explore Agent

**Type:** Codebase Discovery
**Status:** Active
**Invocation:** Via explore mode

**Purpose:**
Fast, configurable codebase exploration with three thoroughness levels.

**Modes:**

1. **Quick** - Fast overview (seconds to minutes)
2. **Medium** - Balanced exploration (5-15 minutes) [Default]
3. **Very Thorough** - Deep analysis (30+ minutes)

**Core Capabilities:**

- Initial repository assessment
- Architecture understanding
- Pattern discovery
- Rapid familiarization
- Dependency mapping

**Best For:**

- New codebase onboarding
- Pre-refactoring analysis
- Security audit preparation
- Architecture documentation
- Migration planning

**Performance:**

- Speed: Configurable (Quick/Medium/Very Thorough)
- Depth: Configurable by mode
- Memory: Scales with thoroughness level

**Integration:**

- Works well with dark-matter-analyzer skill
- Pairs with knowledge-base-manager
- Complements technical-writer skill

**Documentation:** `explore.md`

---

### 1.3 Status Line Setup Agent

**Type:** Configuration
**Status:** Active
**Invocation:** Via setup command

**Purpose:**
Configure status line display settings for Claude Code CLI.

**Core Capabilities:**

- Customize CLI output format
- Configure status indicators
- Set display preferences
- Adjust verbosity levels

**Best For:**

- Initial CLI setup
- Team standardization
- Personal preferences
- Accessibility adjustments

**Performance:**

- Speed: Fast
- Depth: N/A
- Memory: Minimal

---

### 1.4 Output Style Setup Agent

**Type:** Configuration
**Status:** Active
**Invocation:** Via setup command

**Purpose:**
Create and manage output style configurations for Claude Code.

**Core Capabilities:**

- Customize output formatting
- Set up color schemes
- Configure display styles
- Manage style templates

**Best For:**

- Personalizing CLI appearance
- Team style standards
- Accessibility needs
- Output formatting

**Performance:**

- Speed: Fast
- Depth: N/A
- Memory: Minimal

---

## 2. Skill-Based Agents (6)

### 2.1 Archon-Manager Agent

**Type:** Strategic Project Management
**Status:** Active
**Location:** `/SKILLS/archon-manager/`

**Purpose:**
Master Archon MCP for strategic project management, task tracking, and knowledge base operations. The strategic layer (WHAT/WHEN) that coordinates with Skills (HOW).

**Core Capabilities:**

- Project creation and management
- Task tracking and coordination
- Knowledge base operations (RAG search)
- Document management
- Version control for project data
- Feature tracking

**Agent Characteristics:**

- Autonomous decision-making for project strategy
- Orchestrates other skills for execution
- Maintains project state and context
- Provides strategic recommendations

**Best For:**

- Managing complex projects
- Coordinating multiple tasks
- Implementing Archon+Skills two-layer architecture
- Knowledge-intensive applications
- Strategic planning

**Integration:**

- Works with all execution skills
- Provides strategic layer above tactical skills
- Integrates with MCP servers for data persistence

**Triggers:**

- "archon-manager"
- "archon"
- "project management mcp"
- "task tracking"

---

### 2.2 Multi-Agent Architect

**Type:** Agent Orchestration
**Status:** Active
**Location:** `/SKILLS/multi-agent-architect/`

**Purpose:**
Design and orchestrate multi-agent systems for complex AI applications requiring specialization, parallel processing, or collaborative problem-solving.

**Core Capabilities:**

- Agent coordination patterns
- Communication protocols
- Task delegation strategies
- Parallel agent execution
- Agent lifecycle management
- Inter-agent messaging

**Agent Characteristics:**

- Meta-agent that manages other agents
- Designs agent topologies
- Implements coordination patterns
- Handles agent communication

**Best For:**

- Building complex AI systems
- Parallel processing requirements
- Specialized agent teams
- Collaborative problem-solving
- Scalable agent architectures

**Integration:**

- Coordinates with all other agents
- Works with framework-orchestrator
- Integrates with LangChain/CrewAI tools

**Triggers:**

- "multi-agent-architect"
- "multi agent architect"

---

### 2.3 Framework-Orchestrator Agent

**Type:** Meta-Coordination
**Status:** Active
**Location:** `/SKILLS/framework-orchestrator/`

**Purpose:**
Meta-skill that coordinates all frameworks and skills throughout the project lifecycle, providing intelligent sequencing based on project patterns.

**Core Capabilities:**

- Skill sequencing intelligence
- Framework coordination
- Project lifecycle management
- Pattern-based recommendations
- Resource orchestration

**Agent Characteristics:**

- Highest-level coordination agent
- Determines which skills to invoke when
- Optimizes workflow sequences
- Provides framework-level decisions

**Best For:**

- Complex multi-framework projects
- Project lifecycle automation
- Intelligent skill orchestration
- Workflow optimization
- Strategic framework decisions

**Integration:**

- Coordinates all 59 skills
- Works with archon-manager for strategy
- Integrates with multi-agent-architect

**Triggers:**

- "framework-orchestrator"
- "framework orchestrator"
- "orchestrate frameworks"
- "coordinate skills"
- "project orchestration"

---

### 2.4 Codex-Review-Workflow Agent

**Type:** Automated Code Review
**Status:** Active
**Location:** `/SKILLS/codex-review-workflow/`

**Purpose:**
Automated code review workflow using OpenAI Codex CLI. Implements iterative fix-and-review cycles until code passes validation or reaches iteration limit.

**Core Capabilities:**

- Automated code validation
- Security checks
- Quality assurance
- Iterative fix-and-review cycles
- Codex CLI integration
- Validation gate enforcement

**Agent Characteristics:**

- Autonomous code review process
- Iterative improvement loop
- Decision-making on code quality
- Automated fix application

**Best For:**

- Automated code validation
- CI/CD integration
- Security compliance
- Quality gates
- Pre-commit validation

**Integration:**

- Works with quality-assurance skill
- Integrates with security-architect
- Uses Codex CLI for validation

**Triggers:**

- "review with codex"
- "run codex review"
- "automated code review"
- "validate with codex"
- "codex cli"

---

### 2.5 Design-System Architect

**Type:** Design System Management
**Status:** Active
**Location:** `/SKILLS/design-system-architect/`

**Purpose:**
Build scalable, maintainable design systems that unify product experiences. Autonomous management of design tokens, components, and standards.

**Core Capabilities:**

- Design system architecture
- Component library management
- Design token governance
- Atomic design implementation
- Storybook integration
- Design system maintenance

**Agent Characteristics:**

- Autonomous design decisions
- Maintains design consistency
- Enforces design standards
- Evolves design system

**Best For:**

- Building design systems
- Component library creation
- Design token management
- Design standardization
- UI consistency

**Integration:**

- Works with visual-designer skill
- Pairs with frontend-builder
- Integrates with Figma-developer

**Triggers:**

- "design-system-architect"
- "design system architect"

---

### 2.6 Security Architect

**Type:** Security Governance
**Status:** Active
**Location:** `/SKILLS/security-architect/`

**Purpose:**
Comprehensive security architecture combining threat modeling, security-first design, secure coding review, and compliance validation.

**Core Capabilities:**

- Threat modeling
- Security-first design
- Secure coding review
- Compliance validation
- Security architecture patterns
- Risk assessment

**Agent Characteristics:**

- Autonomous security decisions
- Proactive threat identification
- Security policy enforcement
- Compliance monitoring

**Best For:**

- Security architecture design
- Threat modeling
- Compliance validation
- Security audits
- Secure system design

**Integration:**

- Works with security-engineer skill
- Pairs with codex-review-workflow
- Integrates with quality-assurance

**Triggers:**

- "security-architect"
- "security architect"
- "threat modeling"
- "security design"
- "secure coding"
- "compliance validation"

---

## Agent Classification Matrix

### By Autonomy Level

| Level      | Agents                                                             | Description                                       |
| ---------- | ------------------------------------------------------------------ | ------------------------------------------------- |
| **High**   | framework-orchestrator, archon-manager, multi-agent-architect      | Make strategic decisions, coordinate other agents |
| **Medium** | codex-review-workflow, security-architect, design-system-architect | Autonomous within domain, enforce policies        |
| **Low**    | general-purpose, explore, setup agents                             | Execute instructions, provide information         |

### By Scope

| Scope             | Agents                                                             | Description             |
| ----------------- | ------------------------------------------------------------------ | ----------------------- |
| **Strategic**     | framework-orchestrator, archon-manager                             | Project-level decisions |
| **Tactical**      | multi-agent-architect, security-architect, design-system-architect | Domain-level decisions  |
| **Operational**   | general-purpose, codex-review-workflow                             | Task execution          |
| **Configuration** | setup agents                                                       | Settings management     |
| **Discovery**     | explore                                                            | Information gathering   |

### By Coordination Role

| Role             | Agents                                        | Description                    |
| ---------------- | --------------------------------------------- | ------------------------------ |
| **Orchestrator** | framework-orchestrator, multi-agent-architect | Coordinate other agents        |
| **Manager**      | archon-manager                                | Manage projects and tasks      |
| **Enforcer**     | codex-review-workflow, security-architect     | Enforce policies and standards |
| **Architect**    | design-system-architect, security-architect   | Design and maintain systems    |
| **Worker**       | general-purpose, explore                      | Execute tasks                  |

### By Integration Pattern

| Pattern         | Agents                                         | Description                |
| --------------- | ---------------------------------------------- | -------------------------- |
| **Hub**         | framework-orchestrator, archon-manager         | Central coordination point |
| **Peer**        | multi-agent-architect, security-architect      | Collaborate with others    |
| **Specialized** | codex-review-workflow, design-system-architect | Domain-specific            |
| **General**     | general-purpose, explore                       | Work with anything         |

---

## Agent Hierarchies

### Coordination Hierarchy

```
framework-orchestrator (Meta-Coordinator)
├── archon-manager (Strategic Manager)
│   ├── multi-agent-architect (Tactical Orchestrator)
│   │   ├── general-purpose (Worker)
│   │   └── specialized agents (Workers)
│   └── skill-based agents (Domain Specialists)
└── setup agents (Configuration)
```

### Decision-Making Hierarchy

```
Strategic Level:
├── framework-orchestrator (Framework decisions)
└── archon-manager (Project strategy)

Tactical Level:
├── multi-agent-architect (Agent coordination)
├── security-architect (Security decisions)
└── design-system-architect (Design decisions)

Operational Level:
├── codex-review-workflow (Code validation)
├── general-purpose (Task execution)
└── explore (Information gathering)
```

---

## Selection Criteria

### When to Use Each Agent Type

**Use General-Purpose Agent when:**

- Performing standard development tasks
- Need flexibility and adaptability
- Working on implementation
- Default choice for most work

**Use Explore Agent when:**

- New to codebase
- Need architecture understanding
- Planning major changes
- Generating documentation

**Use Archon-Manager when:**

- Managing complex projects
- Need strategic coordination
- Building knowledge-intensive apps
- Implementing Archon+Skills architecture

**Use Multi-Agent Architect when:**

- Building multi-agent systems
- Need agent coordination
- Parallel processing required
- Complex AI system design

**Use Framework-Orchestrator when:**

- Complex multi-framework projects
- Need intelligent skill sequencing
- Project lifecycle automation
- Strategic framework decisions

**Use Codex-Review-Workflow when:**

- Automated code validation needed
- CI/CD integration
- Quality gates enforcement
- Security compliance

**Use Design-System Architect when:**

- Building design systems
- Need design consistency
- Component library management
- Design token governance

**Use Security-Architect when:**

- Security architecture needed
- Threat modeling required
- Compliance validation
- Security audits

---

## Agent Interaction Patterns

### Pattern 1: Sequential

```
Agent A → Agent B → Agent C
```

One agent completes, next begins.

### Pattern 2: Hierarchical

```
Coordinator Agent
├── Worker Agent 1
├── Worker Agent 2
└── Worker Agent 3
```

One agent manages others.

### Pattern 3: Collaborative

```
Agent A ←→ Agent B ←→ Agent C
```

Agents communicate and collaborate.

### Pattern 4: Pipeline

```
Agent A → [Process] → Agent B → [Process] → Agent C
```

Agents process in stages.

### Pattern 5: Hub-and-Spoke

```
     Agent B
         ↑
Agent A ← Central Agent → Agent C
         ↓
     Agent D
```

Central agent coordinates all others.

---

## Performance Characteristics

| Agent Type              | Startup | Processing | Memory | Scalability |
| ----------------------- | ------- | ---------- | ------ | ----------- |
| General-Purpose         | Fast    | Variable   | Medium | High        |
| Explore (Quick)         | Fast    | Fast       | Low    | High        |
| Explore (Medium)        | Medium  | Medium     | Medium | Medium      |
| Explore (Very Thorough) | Slow    | Slow       | High   | Low         |
| Archon-Manager          | Fast    | Fast       | Low    | High        |
| Multi-Agent Architect   | Medium  | Variable   | Medium | High        |
| Framework-Orchestrator  | Fast    | Fast       | Low    | High        |
| Codex-Review-Workflow   | Medium  | Variable   | Medium | Medium      |
| Design-System Architect | Fast    | Medium     | Low    | High        |
| Security-Architect      | Fast    | Medium     | Low    | High        |

---

## Best Practices

### 1. Agent Selection

- Start with simplest agent that meets needs
- Use specialized agents for domain tasks
- Escalate to coordinating agents for complex workflows

### 2. Agent Coordination

- Use framework-orchestrator for strategic coordination
- Use multi-agent-architect for tactical coordination
- Use archon-manager for project management

### 3. Agent Combination

- Combine exploration with execution
- Pair specialists with generalists
- Use orchestrators for complex workflows

### 4. Performance Optimization

- Choose appropriate thoroughness levels
- Limit agent scope when possible
- Use parallel execution where feasible

### 5. Integration

- Leverage skill integration
- Use MCP servers for persistence
- Combine with tools and components

---

## Related Documentation

- **general-purpose.md** - General-Purpose Agent details
- **explore.md** - Explore Agent details
- **skill-agents.md** - Skill-based agent details
- **agent-workflows.md** - Agent coordination patterns
- **agent-selection-guide.md** - Decision tree
- **multi-agent-patterns.md** - Multi-agent patterns

---

## Version History

- **v1.0.0** (2025-10-28) - Initial taxonomy with 10 agent types
