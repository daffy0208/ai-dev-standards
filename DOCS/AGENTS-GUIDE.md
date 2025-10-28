# Comprehensive Agent Guide

Complete guide to using agents in Claude Code and the ai-dev-standards repository.

---

## What Are Agents?

Agents are autonomous AI entities that can make decisions, coordinate with other agents, and execute complex workflows. In this repository, we have **10 agent types** that work together to accomplish development tasks.

---

## Agent Types Overview

### Claude Code Built-in Agents (4)

1. **General-Purpose Agent** - Default development agent for most tasks
2. **Explore Agent** - Fast codebase exploration (3 modes)
3. **Status Line Setup** - Configure CLI status display
4. **Output Style Setup** - Configure CLI output styling

### Skill-Based Agents (6)

5. **Archon-Manager** - Strategic project management
6. **Multi-Agent Architect** - Agent coordination and orchestration
7. **Framework-Orchestrator** - Meta-level framework coordination
8. **Codex-Review-Workflow** - Automated code review
9. **Design-System Architect** - Design system governance
10. **Security-Architect** - Security architecture and compliance

---

## Quick Start

### For Most Tasks: General-Purpose Agent
```
This is the default agent - it's already active!
Just start working and it handles most development tasks.
```

### For Exploring Code: Explore Agent
```bash
# Quick overview (1 minute)
claude explore --mode quick

# Balanced exploration (10 minutes) - DEFAULT
claude explore

# Deep analysis (30+ minutes)
claude explore --mode very-thorough
```

### For Project Management: Archon-Manager
```
"Use archon-manager to create a project for building a RAG application"
```

---

## When to Use Each Agent

### Use General-Purpose for:
- Bug fixes
- Feature implementation
- Refactoring
- Code reviews
- Daily development work

### Use Explore for:
- New codebases
- Understanding architecture
- Pre-refactoring analysis
- Documentation generation

### Use Archon-Manager for:
- Managing complex projects
- Task coordination
- Knowledge base operations
- Strategic planning

### Use Multi-Agent Architect for:
- Building multi-agent systems
- Parallel processing needs
- Complex agent coordination

### Use Framework-Orchestrator for:
- Complete project lifecycle
- Multi-framework projects
- Intelligent skill sequencing

### Use Codex-Review-Workflow for:
- Automated code validation
- CI/CD integration
- Quality gates
- Security compliance

### Use Design-System Architect for:
- Building design systems
- Component libraries
- Design consistency

### Use Security-Architect for:
- Security audits
- Threat modeling
- Compliance validation

---

## Common Workflows

### Workflow 1: New Repository
```
Day 1:
1. Explore Agent (Quick) → Get overview (1 min)
2. Explore Agent (Medium) → Understand key areas (10 min)
3. General-Purpose → Start coding

Week 1:
- Use General-Purpose for daily work
- Use Explore (Very Thorough) for critical sections as needed
```

### Workflow 2: Feature Development
```
1. Explore (Medium) → Understand existing code (10 min)
2. Archon-Manager → Create project and tasks (5 min)
3. General-Purpose + skill → Implement feature (2-4 hrs)
4. Codex-Review-Workflow → Validate code (5-10 min)
5. General-Purpose → Fix issues and merge (30 min)
```

### Workflow 3: Security Audit
```
1. Explore (Very Thorough) → Map security-critical code (30 min)
2. Security-Architect → Threat modeling + architecture (1 hr)
3. Multi-Agent Architect → Parallel security checks (30 min)
4. Codex-Review-Workflow → Automated validation (15 min)
5. General-Purpose → Fix issues (variable)
```

---

## Agent Coordination

### Simple Tasks (1 agent)
```
Task: Fix bug
Agent: General-Purpose
```

### Moderate Tasks (2-3 agents)
```
Task: Implement feature
Agents:
1. Explore → Understand code
2. General-Purpose → Implement
3. Codex-Review-Workflow → Validate
```

### Complex Tasks (4+ agents)
```
Task: Build SaaS application
Coordinator: Framework-Orchestrator
Agents: 8-10 different agents
Skills: 15-20 different skills
```

---

## Agent Capabilities

### Autonomy Levels

**Very High Autonomy:**
- Framework-Orchestrator (strategic decisions)

**High Autonomy:**
- Archon-Manager (project decisions)
- Multi-Agent Architect (coordination decisions)

**Medium-High Autonomy:**
- Codex-Review-Workflow (quality decisions)
- Security-Architect (security decisions)

**Medium Autonomy:**
- Design-System Architect (design decisions)

**Low Autonomy:**
- General-Purpose (executes instructions)
- Explore (gathers information)
- Setup Agents (configuration)

### Decision Scopes

**Meta-Strategic:** Framework-Orchestrator
**Strategic:** Archon-Manager
**Tactical:** Multi-Agent, Security, Design-System Architects
**Operational:** General-Purpose, Codex-Review-Workflow
**Discovery:** Explore
**Configuration:** Setup Agents

---

## Integration with Skills

All agents can work with the **59 specialized skills** in this repository:

### Core Integration Pattern
```
Agent provides: Strategy, Coordination, Execution
Skill provides: Specialized knowledge, Best practices
Together: Complete, high-quality solution
```

### Example: Security Task
```
Agent: Security-Architect
Skills: security-engineer, testing-strategist, quality-assurance
Result: Comprehensive security implementation
```

---

## Performance Tips

### For Speed:
- Use Quick explore mode for overviews
- Use parallel agents for independent tasks
- Cache results when possible

### For Depth:
- Use Very Thorough explore mode
- Use high-autonomy agents for decisions
- Let agents coordinate complex workflows

### For Reliability:
- Implement fallback agents
- Use Codex-Review-Workflow for validation
- Enable logging and monitoring

---

## Best Practices

### 1. Start Simple
Begin with the simplest agent that meets your needs:
- General-Purpose for most tasks
- Explore for understanding
- Specialized agents when needed

### 2. Progressive Refinement
```
Quick pass → Overview
Medium pass → Key areas
Thorough pass → Critical sections
```

### 3. Let Agents Coordinate
For complex tasks:
- Use Framework-Orchestrator for strategy
- Use Multi-Agent Architect for coordination
- Let specialized agents handle details

### 4. Combine Agents and Skills
```
Best Practice: Agent + Skill
✓ General-Purpose + security-engineer
✓ Explore + dark-matter-analyzer
✓ Archon-Manager + knowledge-base-manager
```

### 5. Validate Results
Always validate agent work:
- Use Codex-Review-Workflow
- Use Security-Architect for security
- Manual review for critical changes

---

## Troubleshooting

### Problem: Task too slow
**Solutions:**
- Use faster agent/mode
- Reduce scope
- Use parallel execution
- Cache results

### Problem: Results not good enough
**Solutions:**
- Use more thorough agent/mode
- Add specialized skill
- Increase autonomy level
- Provide more context

### Problem: Agent failures
**Solutions:**
- Add fallback agents
- Implement retry logic
- Check prerequisites
- Review error logs

### Problem: Too complex
**Solutions:**
- Break into smaller tasks
- Use simpler agent
- Reduce coordination
- Sequential instead of parallel

---

## Resources

### Documentation
- **Agent Types:** `.claude/agents/agent-types.md`
- **Skill-Based Agents:** `.claude/agents/skill-agents.md`
- **Workflows:** `.claude/agents/agent-workflows.md`
- **Selection Guide:** `.claude/agents/agent-selection-guide.md`
- **Multi-Agent Patterns:** `.claude/agents/multi-agent-patterns.md`

### Registries
- **Agent Registry:** `META/agent-registry.json`
- **Skill Registry:** `META/skill-registry.json`
- **MCP Registry:** `META/mcp-registry.json`

### Skills
- **59 Skills:** `/SKILLS/` directory
- **Skill Documentation:** Each skill has `SKILL.md`

### MCPs
- **36 MCP Servers:** `/MCP/` directory
- **MCP Documentation:** Each MCP has `README.md`

---

## Getting Help

### Quick Reference
```
Most tasks → General-Purpose
Explore code → Explore Agent
Manage project → Archon-Manager
Coordinate agents → Multi-Agent Architect
Orchestrate lifecycle → Framework-Orchestrator
Validate code → Codex-Review-Workflow
Design system → Design-System Architect
Security audit → Security-Architect
```

### Documentation
1. Start with this guide
2. Check agent-specific docs
3. Review usage examples
4. Consult skill documentation

### Support
- **GitHub Issues:** Report problems
- **Documentation:** Check docs first
- **Examples:** See usage-examples.md
- **Community:** Share learnings

---

## Next Steps

### Beginners
1. Read this guide
2. Try General-Purpose agent
3. Explore a codebase with Explore agent
4. Combine agents and skills

### Intermediate
1. Learn agent coordination
2. Use Archon-Manager for projects
3. Implement multi-agent workflows
4. Optimize for your workflow

### Advanced
1. Design multi-agent systems
2. Use Framework-Orchestrator
3. Build custom agent patterns
4. Contribute improvements

---

## Version History

- **v1.0.0** (2025-10-28) - Initial comprehensive agent guide
