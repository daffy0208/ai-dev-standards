# Specialized Agents Guide

**Phase 3 Implementation Complete** ✅

This guide explains the specialized agents system in ai-dev-standards - autonomous Claude instances that handle complex, multi-step tasks.

---

## What Are Specialized Agents?

**Agents vs Skills:**

- **Skills** provide inline guidance (you follow instructions)
- **Agents** work autonomously (they do the work for you)

**When to use agents:**

- Complex tasks requiring multiple steps
- Autonomous validation and testing
- Code reviews and refactoring
- Documentation generation
- Tasks that benefit from focused attention

---

## Available Agents

### From claude-code-infrastructure-showcase (10 agents)

Located in `.claude/agents/showcase/`:

1. **code-architecture-reviewer** - Review code for architectural consistency
2. **code-refactor-master** - Plan and execute comprehensive refactoring
3. **documentation-architect** - Create comprehensive documentation
4. **frontend-error-fixer** - Debug and fix frontend errors
5. **plan-reviewer** - Review development plans before implementation
6. **refactor-planner** - Create detailed refactoring plans
7. **auth-route-debugger** - Debug authentication and route issues
8. **auth-route-tester** - Test authenticated API routes
9. **auto-error-resolver** - Automatically resolve common errors
10. **web-research-specialist** - Research best practices and solutions

### ai-dev-standards Specific Agents (3 agents)

Located in `.claude/agents/`:

11. **registry-validator-agent** - Validate and fix registry consistency
12. **skill-tester-agent** - Test skill auto-activation
13. **mcp-builder-agent** - Build new MCP servers

---

## How to Use Agents

Tell Claude to use a specific agent:

\`\`\`
"Use the code-architecture-reviewer agent to review my authentication implementation"
"Invoke the registry-validator-agent to check for consistency issues"
"Run the mcp-builder-agent to create a new MCP for code analysis"
\`\`\`

---

## Agent Selection Guide

| Task Type           | Recommended Agent          |
| ------------------- | -------------------------- |
| Code review         | code-architecture-reviewer |
| Refactoring         | code-refactor-master       |
| Documentation       | documentation-architect    |
| Frontend errors     | frontend-error-fixer       |
| Registry validation | registry-validator-agent   |
| Skill testing       | skill-tester-agent         |
| MCP creation        | mcp-builder-agent          |

---

**Status:** ✅ Phase 3 Complete - 13 Specialized Agents Available

**Last Updated:** 2025-11-04
