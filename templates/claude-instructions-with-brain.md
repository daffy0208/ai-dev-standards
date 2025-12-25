# Claude Project Instructions

## Overview

This project uses the ai-dev-standards repository with intelligent skill, MCP, and tool selection via the Brain MCP server.

## Resource Discovery Workflow

### For Any Development Task

**ALWAYS follow this workflow:**

1. **Discover Skills**: Use `brain_select_skills` with task description
2. **Check Dependencies**: Use `brain_relationships` for required MCPs/tools
3. **Load Skills**: Read recommended skill files from `SKILLS/` directory
4. **Apply Methodology**: Follow the skill's instructions
5. **Use MCPs**: Invoke recommended MCPs and tools

### Example Workflow

```
User: "I need to implement authentication"

Assistant Steps:
1. brain_select_skills(taskDescription: "implement authentication system")
   → Recommends: security-engineer, api-designer

2. brain_relationships(skillName: "security-engineer")
   → Shows required MCPs: oauth-provider-mcp, jwt-manager-mcp

3. Read SKILLS/security-engineer/SKILL.md

4. Follow security-engineer methodology for authentication

5. Use recommended MCPs for implementation
```

## When to Use Brain Tools

### brain_select_skills

**Use for:** Finding the right skills for any task

**Examples:**

- "I need to build an MVP" → mvp-builder, product-strategist
- "Implement RAG system" → rag-implementer, knowledge-base-manager
- "Design an API" → api-designer, security-engineer
- "Optimize performance" → performance-optimizer
- "Build frontend" → frontend-builder, ux-designer

**Always invoke this FIRST when starting a new task.**

### brain_search

**Use for:** Finding specific resources by keyword

**Examples:**

- brain_search(query: "authentication")
- brain_search(query: "vector database")
- brain_search(query: "testing")
- brain_search(query: "deployment")

### brain_relationships

**Use for:** Finding dependencies for a skill

**Examples:**

- brain_relationships(skillName: "rag-implementer")
  → Shows: vector-database-mcp, embedding-generator-mcp, semantic-search-mcp
- brain_relationships(skillName: "frontend-builder")
  → Shows: component-generator-mcp, design-token-manager-mcp

### brain_show_skill

**Use for:** Getting detailed information about a specific skill

**Examples:**

- brain_show_skill(skillName: "mvp-builder")
- brain_show_skill(skillName: "security-engineer")

### graph_query_by_domain

**Use for:** Exploring all capabilities in a domain

**Examples:**

- graph_query_by_domain(domain: "ai")
- graph_query_by_domain(domain: "security")
- graph_query_by_domain(domain: "frontend")

### graph_query_by_effect

**Use for:** Finding capabilities that produce specific effects

**Examples:**

- graph_query_by_effect(effect: "implements_authentication")
- graph_query_by_effect(effect: "creates_vector_index")
- graph_query_by_effect(effect: "adds_tests")

## Skill Loading Pattern

After discovering a skill with brain tools:

1. **Read the skill file**: `SKILLS/{skill-name}/SKILL.md`
2. **Study the methodology**: Understand the approach
3. **Apply the patterns**: Follow the skill's instructions
4. **Use required MCPs**: From brain_relationships results

## Example: Building an MVP

```
Step 1: Discover skills
→ brain_select_skills(taskDescription: "build MVP for task management app")
  Result: mvp-builder, product-strategist, frontend-builder

Step 2: Check dependencies
→ brain_relationships(skillName: "mvp-builder")
  Result: feature-prioritizer-mcp, user-insight-analyzer-mcp

Step 3: Read skill file
→ Read SKILLS/mvp-builder/SKILL.md
  Learn: P0/P1/P2 prioritization, 5 MVP patterns

Step 4: Apply methodology
→ Follow mvp-builder approach:
  - Identify riskiest assumption
  - Choose MVP pattern (Concierge, Wizard of Oz, etc.)
  - Prioritize features using P0/P1/P2
  - Build only P0 features first

Step 5: Use MCPs
→ feature-prioritizer-mcp to rank features
→ user-insight-analyzer-mcp to validate assumptions
```

## Example: Implementing RAG

```
Step 1: Discover skills
→ brain_select_skills(taskDescription: "implement RAG for documentation search")
  Result: rag-implementer, knowledge-base-manager

Step 2: Check dependencies
→ brain_relationships(skillName: "rag-implementer")
  Result: vector-database-mcp, embedding-generator-mcp, semantic-search-mcp

Step 3: Read skill file
→ Read SKILLS/rag-implementer/SKILL.md
  Learn: 8-phase RAG implementation, 3 architecture styles

Step 4: Check patterns
→ Read STANDARDS/architecture-patterns/rag-pattern.md
  Learn: Naive vs Advanced vs Modular RAG

Step 5: Apply methodology
→ Follow rag-implementer 8 phases:
  - Choose architecture (Advanced RAG for production)
  - Set up vector database
  - Implement embedding pipeline
  - Build retrieval system
  - Integrate with LLM
  - Add evaluation

Step 6: Use MCPs
→ vector-database-mcp for Pinecone/Weaviate
→ embedding-generator-mcp for OpenAI embeddings
→ semantic-search-mcp for retrieval
```

## Best Practices

### Always Start With Brain Tools

```
❌ Don't: Immediately start coding
✅ Do: First discover relevant skills and dependencies
```

### Load Skills Before Implementing

```
❌ Don't: Guess at implementation approach
✅ Do: Read skill files and follow proven methodologies
```

### Check Relationships for MCPs

```
❌ Don't: Manually implement tools that exist
✅ Do: Use brain_relationships to find available MCPs
```

### Follow Skill Methodologies

```
❌ Don't: Skip steps in skill workflows
✅ Do: Follow the skill's phases/stages systematically
```

## Repository Structure

```
ai-dev-standards/
├── SKILLS/                    # 64 specialized skills
│   ├── mvp-builder/
│   ├── rag-implementer/
│   ├── security-engineer/
│   ├── frontend-builder/
│   └── [60 more...]
│
├── MCP-SERVERS/               # 51 MCP servers
│   ├── brain-mcp/            # This server!
│   ├── vector-database-mcp/
│   ├── feature-prioritizer-mcp/
│   └── [48 more...]
│
├── STANDARDS/                 # Architecture patterns
│   ├── architecture-patterns/
│   └── best-practices/
│
├── META/                      # Registries & mappings
│   ├── skill-registry.json
│   ├── mcp-registry.json
│   └── relationship-mapping.json
│
└── COMPONENTS/                # Reusable components
```

## Quick Reference

### Common Tasks → Skills

| Task                 | Skills to Use                           |
| -------------------- | --------------------------------------- |
| Build MVP            | mvp-builder, product-strategist         |
| Implement RAG        | rag-implementer, knowledge-base-manager |
| Design API           | api-designer, security-engineer         |
| Build Frontend       | frontend-builder, ux-designer           |
| Optimize Performance | performance-optimizer                   |
| Secure Application   | security-engineer, security-auditor     |
| Write Tests          | testing-strategist                      |
| Deploy Application   | deployment-advisor                      |
| Build Multi-Agent    | multi-agent-architect                   |
| Knowledge Graph      | knowledge-graph-builder                 |

### Domain → Brain Query

| Domain   | Query                                     |
| -------- | ----------------------------------------- |
| AI/ML    | graph_query_by_domain(domain: "ai")       |
| Security | graph_query_by_domain(domain: "security") |
| Frontend | graph_query_by_domain(domain: "frontend") |
| Backend  | graph_query_by_domain(domain: "backend")  |
| Testing  | graph_query_by_domain(domain: "testing")  |
| DevOps   | graph_query_by_domain(domain: "devops")   |

## Troubleshooting

If brain tools aren't working:

1. Check MCP configuration: `.claude/mcp-settings.json`
2. Verify paths are correct (not hardcoded to another user's directory)
3. Run: `./scripts/configure-mcp-paths.sh`
4. See: `DOCS/BRAIN-ORCHESTRATOR-TROUBLESHOOTING.md`

## Summary

**Core Principle**: Always discover skills and dependencies before implementing.

**Workflow**:

1. 🔍 Discover (brain_select_skills)
2. 🔗 Check dependencies (brain_relationships)
3. 📖 Read skill files
4. ⚙️ Apply methodology
5. 🛠️ Use MCPs

This ensures you leverage the full power of the ai-dev-standards repository!
