# Quick Test .cursorrules

Copy this EXACTLY to test in another project.

```markdown
# Project: Test Project

## AI Development Standards

Repository: /mnt/c/Users/david/OneDrive - Qolcom/AI/AI_Development_Projects/ai-dev-standards/
Status: Active

### ⚡ CRITICAL: Brain-First Development (MANDATORY)

**YOU MUST use brain-mcp tools PROACTIVELY for EVERY task.**

**Workflow for Every Task:**

1. **BEFORE starting ANY task, query the brain:**
   - Use `brain_search` with relevant keywords
   - OR use `graph_query_by_domain` if you know the domain
   - OR use `graph_query_by_effect` if you know what effect is needed

2. **Show me what you found:**
   - List the skills/MCPs the brain recommended
   - Explain why they're relevant

3. **Check dependencies:**
   - Use `graph_get_dependencies` for each skill

4. **Then implement using those skills**

**Example:**
```

Task: "Add user authentication"
Step 1: Use graph_query_by_effect("implements_authentication")
Step 2: Returns: security-engineer, api-designer
Step 3: Use graph_get_dependencies("security-engineer")
Step 4: Implement using security-engineer skill

```

**Brain-MCP Tools Available:**
- brain_search, brain_show_skill, brain_relationships
- graph_query_by_domain, graph_query_by_effect
- graph_get_dependencies, graph_composition_chains

**Rules:**
1. ✅ ALWAYS query brain FIRST
2. ✅ ALWAYS show what you found
3. ✅ ALWAYS check dependencies
4. ❌ NEVER skip the brain

---

### Instructions for Claude Code

**ALWAYS load on session start:**
1. /mnt/c/Users/david/OneDrive - Qolcom/AI/AI_Development_Projects/ai-dev-standards/META/PROJECT-CONTEXT.md
2. /mnt/c/Users/david/OneDrive - Qolcom/AI/AI_Development_Projects/ai-dev-standards/META/HOW-TO-USE.md
3. /mnt/c/Users/david/OneDrive - Qolcom/AI/AI_Development_Projects/ai-dev-standards/META/DECISION-FRAMEWORK.md

### Available Resources

This project has access to:
- **64 Skills** - Specialized development methodologies (see META/skill-registry.json)
- **50 MCPs** - Executable development tools with comprehensive skill coverage
- **15 Workflow Types** - Automated workflow templates for common scenarios
- **Multiple Registries** - Components, integrations, tools, standards, templates
- **Brain-MCP Integration** - Intelligent skill selection and orchestration

Key skills for quick start:
- mvp-builder, frontend-builder, api-designer, deployment-advisor
- rag-implementer, multi-agent-architect, knowledge-graph-builder
- product-strategist, user-researcher, ux-designer, go-to-market-planner

See all registries in:
/mnt/c/Users/david/OneDrive - Qolcom/AI/AI_Development_Projects/ai-dev-standards/META/

### Tech Stack
[Add your tech stack here when you customize this]

### Current Phase
[Add what you're working on]
```

## How to Use

1. **Copy this to your other project:**

   ```bash
   cd /path/to/your/other/project
   cp /mnt/c/Users/david/OneDrive\ -\ Qolcom/AI/AI_Development_Projects/ai-dev-standards/TEMPLATES/cursorrules-quick-test.md .cursorrules
   ```

2. **Open in Cursor/Claude Code:**

   ```bash
   cursor .
   ```

3. **Test it works:**
   ```
   You: "What skills are available?"
   ```

## Customize Later

Once it's working, you can customize by adding:

- Your tech stack
- Your code conventions
- Your current goals
