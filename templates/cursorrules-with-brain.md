# COPY THIS ENTIRE FILE TO YOUR PROJECT AS `.cursorrules`

---

# Project AI Configuration

## AI Development Standards Integration

Repository: ~/ai-dev-standards/
Status: Active

### Instructions for Claude Code

**YOU HAVE ACCESS TO THE BRAIN MCP SERVER - USE IT!**

#### Available Brain Tools (USE THESE PROACTIVELY):

**For any task, ALWAYS start with:**

- `brain_select_skills({ taskDescription: "..." })` - Get intelligent skill recommendations

**For exploration:**

- `brain_search({ query: "..." })` - Search all skills/MCPs/tools
- `graph_query_by_domain({ domain: "ai|security|frontend|backend|..." })` - Find by domain
- `graph_query_by_effect({ effect: "..." })` - Find by effect produced

**For details:**

- `brain_show_skill({ skillName: "..." })` - Get skill details
- `brain_relationships({ skillName: "..." })` - Show dependencies
- `graph_get_dependencies({ capabilityId: "..." })` - Get full dependency tree
- `graph_composition_chains({ capabilityId: "..." })` - Find what works well together

**For validation:**

- `brain_status({})` - Check repository health
- `graph_stats({})` - Get graph statistics (113 capabilities)
- `graph_validate({})` - Validate graph consistency

---

### MANDATORY WORKFLOW FOR ALL TASKS:

**When user requests ANY feature/task:**

```
1. Use brain_select_skills to get recommendations
2. Use graph_get_dependencies to check requirements
3. Use graph_composition_chains to plan workflow
4. Load recommended skills from ~/ai-dev-standards/SKILLS/[skill-name]/
5. Apply skill methodology and patterns
6. Follow best practices from ~/ai-dev-standards/STANDARDS/
```

**Example:**

```
User: "Add authentication to my app"

You:
1. brain_select_skills({ taskDescription: "implement authentication and authorization" })
   → Recommends: security-engineer, api-designer, supabase-developer

2. graph_get_dependencies({ capabilityId: "security-engineer" })
   → Shows: security-scanner-mcp, api-validator-mcp needed

3. graph_composition_chains({ capabilityId: "security-engineer" })
   → Shows: security-engineer → api-designer → frontend-builder

4. Load ~/ai-dev-standards/SKILLS/security-engineer/SKILL.md
   Apply OWASP Top 10 practices, implement auth following skill methodology

5. Load ~/ai-dev-standards/STANDARDS/best-practices/security.md
   Apply security patterns and validation rules

6. Implement following the workflow
```

---

### When to Use Each Tool:

| Situation                    | Tool                       | Example                |
| ---------------------------- | -------------------------- | ---------------------- |
| Starting any task            | `brain_select_skills`      | "implement RAG system" |
| User asks "what's available" | `graph_query_by_domain`    | domain: "ai"           |
| Need dependencies            | `graph_get_dependencies`   | "rag-implementer"      |
| Planning workflow            | `graph_composition_chains` | "security-engineer"    |
| Searching                    | `brain_search`             | "authentication"       |
| Skill details                | `brain_show_skill`         | "api-designer"         |
| Check status                 | `brain_status`             | (no args)              |

---

### Usage Rules:

**DO:**

- ✅ ALWAYS use brain_select_skills when starting a task
- ✅ Load and follow skill methodologies precisely
- ✅ Check dependencies before implementing
- ✅ Apply patterns from STANDARDS/ directory
- ✅ Use graph tools to discover relationships

**DON'T:**

- ❌ Guess which skills exist - query the brain
- ❌ Skip the brain tools - they're there to help
- ❌ Implement without checking for existing skills/patterns
- ❌ Ignore skill recommendations without good reason

---

## Project-Specific Context

**Tech Stack:**

- Frontend: [e.g., Next.js 14, React, TypeScript, Tailwind]
- Backend: [e.g., Node.js, Express, Supabase]
- Database: [e.g., PostgreSQL, MongoDB]
- AI/LLM: [e.g., OpenAI GPT-4, Claude, Anthropic]
- Deployment: [e.g., Vercel, Railway, AWS]

**Current Phase:**

- [ ] Planning/Design
- [ ] MVP Development
- [ ] Feature Expansion
- [ ] Production/Scaling

**Key Features/Requirements:**

1. [Feature 1]
2. [Feature 2]
3. [Feature 3]

**Priorities:**

- P0 (Must Have): [list]
- P1 (Should Have): [list]
- P2 (Nice to Have): [list]

**Known Constraints:**

- [e.g., Budget: $X/month for services]
- [e.g., Timeline: Launch in X weeks]
- [e.g., Team: X developers]

---

## Available Domains in Graph

Use with `graph_query_by_domain`:

- `ai` - AI/ML, RAG, embeddings, LLMs
- `security` - Auth, encryption, OWASP, compliance
- `frontend` - React, UI, design systems, UX
- `backend` - APIs, services, microservices
- `database` - SQL, NoSQL, vector DBs, migrations
- `testing` - Unit, integration, e2e testing
- `deployment` - CI/CD, hosting, DevOps
- `performance` - Optimization, caching, monitoring
- `data` - Pipelines, ETL, analytics
- `documentation` - Docs, API specs, guides

---

## Quick Reference Commands

```bash
# Check brain connection
brain_status({})

# Find skills for a task
brain_select_skills({ taskDescription: "your task here" })

# Search everything
brain_search({ query: "keyword" })

# Explore a domain
graph_query_by_domain({ domain: "ai" })

# Get dependencies
graph_get_dependencies({ capabilityId: "skill-name" })

# See what works together
graph_composition_chains({ capabilityId: "skill-name" })
```

---

## Example Workflows

### Building a New Feature:

```
User: "Build [feature]"

Claude:
1. brain_select_skills → Get recommendations
2. graph_get_dependencies → Check requirements
3. Load skills from ai-dev-standards
4. Create implementation plan
5. Implement following methodology
```

### Adding AI/RAG:

```
User: "Add AI search to docs"

Claude:
1. graph_query_by_domain({ domain: "ai" }) → See AI capabilities
2. brain_select_skills({ taskDescription: "implement RAG system" })
3. graph_get_dependencies({ capabilityId: "rag-implementer" })
4. Load RAG patterns from STANDARDS/architecture-patterns/
5. Implement following rag-implementer skill
```

### Security Review:

```
User: "Review security"

Claude:
1. brain_search({ query: "security" })
2. brain_show_skill({ skillName: "security-engineer" })
3. Load security checklist from skill
4. Apply OWASP Top 10 checks
5. Use security-scanner-mcp if available
```

---

## Resources Available

- **Skills:** 64 expert-level development skills
- **MCPs:** 51 Model Context Protocol servers
- **Capabilities:** 113 total capabilities in graph
- **Relationships:** 169 mapped relationships
- **Effects:** 215 distinct effects
- **Patterns:** Architecture and best practice patterns
- **Standards:** Code quality and security standards

---

## Important Paths

- Skills: `~/ai-dev-standards/SKILLS/[skill-name]/SKILL.md`
- Patterns: `~/ai-dev-standards/STANDARDS/architecture-patterns/`
- Best Practices: `~/ai-dev-standards/STANDARDS/best-practices/`
- Components: `~/ai-dev-standards/COMPONENTS/`
- Integrations: `~/ai-dev-standards/INTEGRATIONS/`
- Tools: `~/ai-dev-standards/TOOLS/`

---

## Troubleshooting

**If brain tools don't work:**

1. Check `.claude/mcp-settings.json` exists and has correct paths
2. Verify paths are absolute (not relative)
3. Restart Claude Code
4. Test with: `brain_status({})`

**If skills aren't found:**

1. Verify ~/ai-dev-standards/ path is correct
2. Check you have latest version (git pull)
3. Ensure skill exists in META/skill-registry.json

---

## Status

✅ Brain MCP: Active
✅ Capability Graph: 113 capabilities loaded
✅ Skills Available: 64
✅ MCPs Available: 51

**Version:** 3.0.0
**Last Updated:** 2025-10-31

---

# END OF TEMPLATE - Everything above this line should be in your .cursorrules
