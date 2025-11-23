# Agent Selection Guide

Decision tree and practical guidance for choosing the right agent for your task.

---

## Quick Decision Tree

```
START: What do you need to do?

├─ Configure Claude Code settings?
│  └─→ USE: Setup Agents (statusline-setup or output-style-setup)
│
├─ Explore new/unfamiliar codebase?
│  ├─ Quick overview needed? → USE: Explore Agent (Quick mode)
│  ├─ Balanced understanding? → USE: Explore Agent (Medium mode)
│  └─ Deep analysis needed? → USE: Explore Agent (Very Thorough mode)
│
├─ Manage complex project?
│  └─→ USE: Archon-Manager Agent
│
├─ Coordinate multiple agents?
│  └─→ USE: Multi-Agent Architect
│
├─ Orchestrate entire project lifecycle?
│  └─→ USE: Framework-Orchestrator Agent
│
├─ Automated code review needed?
│  └─→ USE: Codex-Review-Workflow Agent
│
├─ Build/maintain design system?
│  └─→ USE: Design-System Architect
│
├─ Security architecture/audit?
│  └─→ USE: Security-Architect
│
└─ Everything else? (implementation, bug fixes, features)
   └─→ USE: General-Purpose Agent (default)
```

---

## Detailed Selection Criteria

### 1. By Task Type

**Exploration Tasks**

- New codebase → Explore Agent (Quick/Medium)
- Architecture analysis → Explore Agent (Very Thorough)
- Pattern discovery → Explore Agent (Medium)
- Pre-refactoring → Explore Agent (Very Thorough)

**Implementation Tasks**

- Feature development → General-Purpose Agent
- Bug fixes → General-Purpose Agent
- Refactoring → General-Purpose Agent
- Testing → General-Purpose Agent + testing-strategist

**Management Tasks**

- Project management → Archon-Manager
- Task coordination → Archon-Manager
- Knowledge management → Archon-Manager + knowledge-base-manager

**Orchestration Tasks**

- Multi-agent coordination → Multi-Agent Architect
- Framework coordination → Framework-Orchestrator
- Complex workflows → Framework-Orchestrator + Multi-Agent Architect

**Quality Tasks**

- Code review → Codex-Review-Workflow
- Security audit → Security-Architect
- Quality assurance → Codex-Review-Workflow + quality-assurance

**Design Tasks**

- Design system → Design-System Architect
- UI/UX → General-Purpose + ux-designer/visual-designer
- Component library → Design-System Architect

---

### 2. By Project Phase

**Discovery Phase**

- Framework-Orchestrator (coordinate discovery)
- Archon-Manager (create project)
- product-strategist skill
- user-researcher skill

**Planning Phase**

- Archon-Manager (plan tasks)
- Framework-Orchestrator (sequence skills)
- General-Purpose + product-strategist

**Design Phase**

- Design-System Architect (if building design system)
- General-Purpose + ux-designer
- General-Purpose + visual-designer

**Implementation Phase**

- General-Purpose Agent (default)
- Multi-Agent Architect (if complex)
- Archon-Manager (track progress)

**Testing Phase**

- Codex-Review-Workflow (automated validation)
- General-Purpose + testing-strategist
- Security-Architect (security testing)

**Deployment Phase**

- General-Purpose + deployment-advisor
- General-Purpose + release-manager
- Archon-Manager (update project status)

---

### 3. By Complexity Level

**Simple (Single agent sufficient)**

```
Task: Fix a bug in one file
Agent: General-Purpose Agent
Time: 15-30 minutes
```

**Moderate (Agent + Skill)**

```
Task: Implement authentication
Agent: General-Purpose + security-engineer
Time: 2-4 hours
```

**Complex (Multiple agents, sequential)**

```
Task: Major refactoring
Workflow:
1. Explore Agent (Very Thorough) → Map code
2. Archon-Manager → Plan refactoring
3. General-Purpose → Execute refactoring
4. Codex-Review-Workflow → Validate
Time: Days to weeks
```

**Very Complex (Multiple agents, parallel + coordination)**

```
Task: Build complete SaaS application
Coordinator: Framework-Orchestrator
Agents: 8-10 different agents
Skills: 15-20 different skills
Time: Weeks to months
```

---

### 4. By Autonomy Needed

**Low Autonomy (User-driven)**

- General-Purpose Agent
- Explore Agent
- Setup Agents

**Medium Autonomy (Domain decisions)**

- Design-System Architect
- Codex-Review-Workflow
- Security-Architect

**High Autonomy (Strategic decisions)**

- Archon-Manager
- Multi-Agent Architect
- Framework-Orchestrator

---

## Common Scenarios

### Scenario 1: New to Codebase

```
Day 1:
├─ Morning: Explore Agent (Quick) → Get overview
└─ Afternoon: Explore Agent (Medium) → Key areas

Week 1:
└─ As needed: Explore Agent (Very Thorough) → Critical sections

Ongoing:
└─ General-Purpose Agent → Development work
```

### Scenario 2: Building New Feature

```
Step 1: Explore Agent (Medium) → Understand existing code
Step 2: Archon-Manager → Create feature project/tasks
Step 3: General-Purpose + skill → Implement feature
Step 4: Codex-Review-Workflow → Validate
Step 5: General-Purpose + testing-strategist → Add tests
```

### Scenario 3: Security Audit

```
Phase 1: Explore Agent (Very Thorough) → Map security-critical code
Phase 2: Security-Architect → Threat modeling + architecture review
Phase 3: Multi-Agent Architect → Parallel security checks
Phase 4: Codex-Review-Workflow → Automated validation
Phase 5: General-Purpose → Fix issues
```

### Scenario 4: Design System Creation

```
Phase 1: Design-System Architect → Architecture & planning
Phase 2: General-Purpose + visual-designer → Design tokens
Phase 3: General-Purpose + frontend-builder → Components
Phase 4: Design-System Architect → Governance & docs
```

### Scenario 5: Large Refactoring

```
Phase 1: Explore Agent (Very Thorough) → Complete code map
Phase 2: Archon-Manager → Refactoring project & tasks
Phase 3: Multi-Agent Architect → Parallel refactoring
Phase 4: Codex-Review-Workflow → Iterative validation
Phase 5: General-Purpose + testing-strategist → Update tests
```

---

## Agent Combination Patterns

### Pattern 1: Explore → Execute

```
Good for: Any new task in existing code
1. Explore Agent → Understand
2. General-Purpose → Implement
```

### Pattern 2: Plan → Execute → Validate

```
Good for: Feature development
1. Archon-Manager → Plan
2. General-Purpose + skill → Implement
3. Codex-Review-Workflow → Validate
```

### Pattern 3: Coordinate → Parallel Execute

```
Good for: Complex tasks with independent subtasks
1. Multi-Agent Architect → Coordinate
2. Multiple General-Purpose → Execute in parallel
```

### Pattern 4: Orchestrate → Sequence → Execute

```
Good for: Complete project lifecycle
1. Framework-Orchestrator → Determine sequence
2. Archon-Manager → Manage project
3. Various agents/skills → Execute phases
```

---

## When NOT to Use Agents

**Don't use agents for:**

- Simple single-line changes
- Configuration file edits
- Trivial refactoring
- Well-known patterns
- Very clear, simple tasks

**Just do it yourself if:**

- Task takes < 5 minutes
- You know exactly what to do
- No exploration needed
- No coordination needed

---

## Performance Considerations

### Fast Agents (< 1 minute)

- Archon-Manager (simple operations)
- Setup Agents
- Explore Agent (Quick mode)
- Framework-Orchestrator (planning)

### Medium Speed (1-15 minutes)

- Explore Agent (Medium mode)
- General-Purpose Agent (most tasks)
- Codex-Review-Workflow (single iteration)
- Multi-Agent Architect (coordination)

### Slow Agents (15+ minutes)

- Explore Agent (Very Thorough mode)
- Multi-Agent Architect (complex coordination)
- Security-Architect (full audit)
- Multiple parallel agents

---

## Best Practices

### 1. Start Simple

- Begin with simplest agent that works
- Add complexity only if needed
- Don't over-engineer

### 2. Progressive Refinement

```
First pass: Explore (Quick) → Get overview
Second pass: Explore (Medium) → Key areas
Third pass: Explore (Very Thorough) → Critical sections
```

### 3. Know When to Coordinate

**Use coordinator when:**

- 3+ agents involved
- Complex dependencies
- Need central control

**Don't coordinate when:**

- 1-2 agents
- Simple sequential flow
- Low complexity

### 4. Leverage Specialization

```
Don't: General-Purpose for everything
Do: General-Purpose + specialized skills/agents

Example:
✗ General-Purpose: "Do security audit"
✓ Security-Architect: "Perform security audit"
```

### 5. Match Autonomy to Trust

```
High Trust Task → High Autonomy Agent
- Project planning → Framework-Orchestrator
- Code validation → Codex-Review-Workflow

Low Trust Task → Low Autonomy Agent
- Critical changes → General-Purpose (supervised)
- New patterns → General-Purpose with review
```

---

## Troubleshooting Agent Selection

### Problem: Task taking too long

**Solution:**

- Use faster agent/mode
- Reduce scope
- Use parallel execution

### Problem: Results not good enough

**Solution:**

- Use more thorough agent/mode
- Add specialized skill
- Increase autonomy level

### Problem: Too complex

**Solution:**

- Break into smaller tasks
- Use simpler agent
- Reduce coordination overhead

### Problem: Agent failures

**Solution:**

- Add fallback agent
- Implement retry logic
- Use more reliable agent

---

## Quick Reference Table

| Task               | Primary Agent           | Secondary | Time     | Complexity |
| ------------------ | ----------------------- | --------- | -------- | ---------- |
| New repo overview  | Explore (Quick)         | -         | 1 min    | Low        |
| Understand feature | Explore (Medium)        | -         | 10 min   | Low        |
| Architecture map   | Explore (Very Thorough) | -         | 45 min   | Medium     |
| Bug fix            | General-Purpose         | -         | 30 min   | Low        |
| Feature implement  | General-Purpose         | + skill   | 2-4 hrs  | Medium     |
| Project management | Archon-Manager          | -         | Variable | Medium     |
| Multi-agent system | Multi-Agent Architect   | -         | Variable | High       |
| Project lifecycle  | Framework-Orchestrator  | + others  | Weeks    | Very High  |
| Code review        | Codex-Review-Workflow   | -         | 5-15 min | Medium     |
| Design system      | Design-System Architect | -         | Days     | High       |
| Security audit     | Security-Architect      | + others  | 4-6 hrs  | High       |

---

## Version History

- **v1.0.0** (2025-10-28) - Initial selection guide
