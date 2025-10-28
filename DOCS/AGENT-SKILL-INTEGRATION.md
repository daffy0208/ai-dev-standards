# Agent-Skill Integration Guide

How agents and skills work together to deliver powerful development capabilities.

---

## Overview

**Agents** provide strategy, coordination, and execution capabilities.
**Skills** provide specialized knowledge and best practices.
**Together** they create a complete development system.

**Total Resources:**
- **10 Agents** (4 built-in + 6 skill-based)
- **59 Skills** (specialized capabilities)
- **36 MCPs** (executable servers)
- **24 Tools** (LangChain/CrewAI)
- **13 Components** (React components)

---

## Integration Architecture

### Two-Layer System

```
Layer 1: STRATEGY & COORDINATION (Agents)
├── What to do
├── When to do it
├── Who should do it
└── How to coordinate

Layer 2: EXECUTION & EXPERTISE (Skills)
├── How to do it
├── Best practices
├── Domain knowledge
└── Implementation details
```

### The Archon+Skills Pattern

```
Archon-Manager (Strategic Agent)
├── WHAT: Project goals
├── WHEN: Task timing
├── WHO: Resource allocation
└── Coordinates with Skills for HOW

Skills (Execution Layer)
├── HOW: Implementation details
├── BEST PRACTICES: Quality standards
├── DOMAIN KNOWLEDGE: Specialized expertise
└── Execute under Archon's coordination
```

---

## Integration Patterns

### Pattern 1: Single Agent + Single Skill

**Structure:**
```
General-Purpose Agent + Specialized Skill
```

**Example:**
```
Task: Implement authentication
Agent: General-Purpose
Skill: security-engineer

Agent provides:
- Task execution
- File operations
- Coordination

Skill provides:
- Security best practices
- Auth patterns
- Vulnerability prevention
```

### Pattern 2: Agent + Multiple Skills

**Structure:**
```
Agent + Skill A + Skill B + Skill C
```

**Example:**
```
Task: Build complete feature
Agent: General-Purpose
Skills: frontend-builder, api-designer, testing-strategist

Workflow:
1. frontend-builder → UI implementation
2. api-designer → Backend API
3. testing-strategist → Test coverage
```

### Pattern 3: Agent Coordination + Skills

**Structure:**
```
Coordinator Agent
├── Worker Agent 1 + Skill A
├── Worker Agent 2 + Skill B
└── Worker Agent 3 + Skill C
```

**Example:**
```
Task: Security audit
Coordinator: Multi-Agent Architect
Workers:
├── General-Purpose + security-engineer → Auth review
├── General-Purpose + security-engineer → Data validation
└── General-Purpose + security-engineer → API security
```

### Pattern 4: Framework Orchestration

**Structure:**
```
Framework-Orchestrator
├── Archon-Manager (strategy)
│   └── Skills (execution)
└── Multi-Agent Architect (coordination)
    └── Skills (parallel execution)
```

**Example:**
```
Task: Complete SaaS application
Orchestrator: Framework-Orchestrator
Phases:
├── Discovery: product-strategist, user-researcher
├── Design: ux-designer, visual-designer
├── Implementation: frontend-builder, api-designer, supabase-developer
├── Testing: testing-strategist, security-architect
└── Deployment: deployment-advisor, release-manager
```

---

## Agent-Skill Combinations

### Development Tasks

| Task | Agent | Skills |
|------|-------|--------|
| Feature Implementation | General-Purpose | frontend-builder, api-designer |
| Bug Fix | General-Purpose | - |
| Refactoring | General-Purpose | performance-optimizer |
| Testing | General-Purpose | testing-strategist, quality-assurance |

### Architecture Tasks

| Task | Agent | Skills |
|------|-------|--------|
| Security Architecture | Security-Architect | security-engineer |
| Design System | Design-System Architect | visual-designer, frontend-builder |
| System Design | Explore + General-Purpose | dark-matter-analyzer |
| Performance Audit | General-Purpose | performance-optimizer |

### Management Tasks

| Task | Agent | Skills |
|------|-------|--------|
| Project Management | Archon-Manager | All skills as needed |
| Task Coordination | Archon-Manager | - |
| Knowledge Management | Archon-Manager | knowledge-base-manager |
| Strategic Planning | Framework-Orchestrator | product-strategist |

---

## Skill Categories & Agent Pairing

### Product Development Skills
**Best Agent:** General-Purpose or Archon-Manager
- product-strategist
- mvp-builder
- go-to-market-planner
- pricing-strategist
- product-analyst

### AI-Native Skills
**Best Agent:** Multi-Agent Architect or Archon-Manager
- rag-implementer
- multi-agent-architect
- knowledge-base-manager
- knowledge-graph-builder

### Technical Skills
**Best Agent:** General-Purpose
- frontend-builder
- api-designer
- supabase-developer
- data-engineer
- data-visualizer

### Infrastructure Skills
**Best Agent:** General-Purpose
- deployment-advisor
- performance-optimizer
- release-manager
- security-engineer

### UX/Design Skills
**Best Agent:** Design-System Architect or General-Purpose
- ux-designer
- visual-designer
- design-system-architect
- accessibility-engineer

### Quality/Security Skills
**Best Agent:** Security-Architect or Codex-Review-Workflow
- testing-strategist
- quality-assurance
- security-architect
- security-engineer

### ADHD Support Skills
**Best Agent:** General-Purpose or Archon-Manager
- task-breakdown-specialist
- context-preserver
- focus-session-manager

---

## Practical Examples

### Example 1: Feature Development

**Setup:**
```
Agent: General-Purpose
Skills: frontend-builder, api-designer, testing-strategist
Coordinator: Archon-Manager (optional, for complex features)
```

**Workflow:**
```
1. Archon-Manager: Create project and tasks
2. Explore Agent: Understand existing code
3. General-Purpose + frontend-builder: Build UI
4. General-Purpose + api-designer: Create API
5. General-Purpose + testing-strategist: Add tests
6. Codex-Review-Workflow: Validate code
```

### Example 2: Security Audit

**Setup:**
```
Agent: Security-Architect
Skills: security-engineer, testing-strategist, quality-assurance
Coordinator: Multi-Agent Architect (for parallel audits)
```

**Workflow:**
```
1. Explore Agent (Very Thorough): Map security-critical code
2. Security-Architect + security-engineer: Threat modeling
3. Multi-Agent Architect: Coordinate parallel audits
   ├── Agent 1 + security-engineer: OWASP checks
   ├── Agent 2 + security-engineer: Dependency scan
   └── Agent 3 + security-engineer: Code review
4. Codex-Review-Workflow: Automated validation
5. General-Purpose + security-engineer: Fix issues
```

### Example 3: Design System Creation

**Setup:**
```
Agent: Design-System Architect
Skills: visual-designer, frontend-builder, figma-developer
```

**Workflow:**
```
1. Design-System Architect: Architecture and planning
2. General-Purpose + visual-designer: Design tokens
3. General-Purpose + figma-developer: Extract from Figma
4. General-Purpose + frontend-builder: Build components
5. Design-System Architect: Set up Storybook
6. Design-System Architect: Establish governance
```

---

## When to Use What

### Simple Task (1 agent, 0-1 skills)
```
Task: Fix a bug
Solution: General-Purpose Agent
Maybe: + testing-strategist (if complex)
```

### Moderate Task (1-2 agents, 1-3 skills)
```
Task: Implement feature
Solution:
├── Agent: General-Purpose
└── Skills: frontend-builder, api-designer
```

### Complex Task (2-4 agents, 3-8 skills)
```
Task: Security audit
Solution:
├── Agents: Explore, Security-Architect, Multi-Agent Architect
└── Skills: security-engineer, testing-strategist, quality-assurance
```

### Very Complex Task (4+ agents, 8+ skills)
```
Task: Build SaaS application
Solution:
├── Agents: Framework-Orchestrator, Archon-Manager, Multi-Agent Architect, etc.
└── Skills: 15-20 different skills
```

---

## Best Practices

### 1. Match Agent to Task Scope
- **Simple → General-Purpose**
- **Complex → Specialized Agent**
- **Very Complex → Coordinator Agent**

### 2. Add Skills for Expertise
- Don't ask agent to do specialized work alone
- Invoke appropriate skill
- Example: Security task? Use security-engineer skill

### 3. Use Archon for Strategy
- Let Archon-Manager handle project strategy
- Skills handle tactical execution
- Clear WHAT/WHEN vs HOW separation

### 4. Coordinate for Complexity
- Use Multi-Agent Architect for parallel work
- Use Framework-Orchestrator for lifecycle
- Let coordinators manage other agents

### 5. Validate with Agents
- Use Codex-Review-Workflow for code quality
- Use Security-Architect for security
- Use Quality-Assurance skill for comprehensive checks

---

## Integration Benefits

### Separation of Concerns
- Agents: Strategy and coordination
- Skills: Execution and expertise
- Clear responsibilities

### Composability
- Mix and match agents
- Combine any skills
- Build custom workflows

### Scalability
- Add more agents for parallelism
- Add more skills for capabilities
- Grow system as needed

### Maintainability
- Update agents independently
- Update skills independently
- Clear interfaces

---

## Common Patterns

### Pattern: Explore → Plan → Execute
```
1. Explore Agent → Understand codebase
2. Archon-Manager → Plan work
3. General-Purpose + Skills → Execute
4. Codex-Review-Workflow → Validate
```

### Pattern: Parallel Execution
```
1. Multi-Agent Architect → Coordinate
2. Multiple General-Purpose + Skills → Execute in parallel
3. Multi-Agent Architect → Aggregate results
```

### Pattern: Iterative Improvement
```
1. General-Purpose + Skill → Initial implementation
2. Codex-Review-Workflow → Validate
3. If issues: General-Purpose + Skill → Fix
4. Repeat until passing
```

### Pattern: Lifecycle Management
```
1. Framework-Orchestrator → Determine phases
2. For each phase:
   ├── Archon-Manager → Manage tasks
   ├── General-Purpose + Skills → Execute
   └── Validation Agents → Check quality
```

---

## Resources

### Agent Documentation
- Agent Types: `.claude/agents/agent-types.md`
- Skill-Based Agents: `.claude/agents/skill-agents.md`
- Agent Workflows: `.claude/agents/agent-workflows.md`

### Skill Documentation
- Skill Registry: `META/skill-registry.json`
- Individual Skills: `/SKILLS/*/SKILL.md`
- CLAUDE.md: Complete skill list

### Integration Documentation
- This guide: `DOCS/AGENT-SKILL-INTEGRATION.md`
- Agents Guide: `DOCS/AGENTS-GUIDE.md`
- System Overview: `DOCS/SYSTEM-OVERVIEW.md`

---

## Quick Reference

### For Each Task, Ask:

1. **What's the scope?**
   - Simple → General-Purpose
   - Complex → Specialized Agent
   - Very Complex → Coordinator

2. **What expertise needed?**
   - General → No skill needed
   - Specialized → Add appropriate skill
   - Multiple domains → Add multiple skills

3. **How many agents?**
   - 1 task → 1 agent
   - Parallel tasks → Multi-Agent Architect
   - Complete lifecycle → Framework-Orchestrator

4. **What's the strategy?**
   - Tactical → Direct execution
   - Strategic → Use Archon-Manager
   - Meta → Use Framework-Orchestrator

---

## Version History

- **v1.0.0** (2025-10-28) - Initial Agent-Skill integration guide
