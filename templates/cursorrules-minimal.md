# Minimal .cursorrules Template

Copy this into your project root as `.cursorrules` for basic integration.

```markdown
# Project: [Your Project Name]

## AI Development Standards

Repository: ~/ai-dev-standards/
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

**Load on every session:**
1. ~/ai-dev-standards/META/PROJECT-CONTEXT.md
2. ~/ai-dev-standards/META/HOW-TO-USE.md
3. ~/ai-dev-standards/META/DECISION-FRAMEWORK.md

### Available Resources
This project has access to:
- **64 Skills** - Specialized development methodologies (see META/skill-registry.json)
- **50 MCPs** - Executable development tools with comprehensive skill coverage
- **15 Workflow Types** - Automated workflow templates for common scenarios
- **Multiple Registries** - Components, integrations, tools, standards, templates
- **Brain-MCP Integration** - Intelligent skill selection and orchestration

### Primary Skills
- mvp-builder
- frontend-builder
- api-designer
- deployment-advisor

### Tech Stack
- Frontend: [e.g., Next.js, React]
- Backend: [e.g., Node.js, Python]
- Database: [e.g., PostgreSQL, MongoDB]
- Deployment: [e.g., Vercel, Railway]

### Project Phase
- [x] Planning
- [ ] MVP Development
- [ ] Production
```

## How to Use

1. Copy content above
2. Create `.cursorrules` in your project root
3. Replace `[Your Project Name]` with your actual project name
4. Update Tech Stack section
5. Start working with Claude - it will automatically load the standards
