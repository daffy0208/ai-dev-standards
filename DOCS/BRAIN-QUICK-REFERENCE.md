# Brain/Orchestrator Quick Reference

## TL;DR

The brain helps Claude discover and use skills automatically through MCP tools.

**Setup:** `./scripts/configure-mcp-paths.sh`

**Usage:** Ask Claude to use brain tools to find skills, then Claude reads and applies them.

## Common Workflows

### Workflow 1: Build New Feature

```
You: "I need to add authentication to my app"

Claude:
1. Uses: brain_select_skills(taskDescription: "implement authentication")
2. Gets: security-engineer, api-designer  
3. Uses: brain_relationships(skillName: "security-engineer")
4. Gets: security-scanner-mcp, api-validator-mcp
5. Reads: SKILLS/security-engineer/SKILL.md
6. Applies methodology + uses recommended MCPs
```

### Workflow 2: Explore Domain

```
You: "What AI capabilities are available?"

Claude:
1. Uses: graph_query_by_domain(domain: "ai")
2. Gets: rag-implementer, multi-agent-architect, knowledge-graph-builder, etc.
3. Shows: 15+ AI-related capabilities
```

### Workflow 3: Search Resources

```
You: "Find resources for testing"

Claude:
1. Uses: brain_search(query: "testing")
2. Gets: testing-strategist skill, test-runner-mcp, etc.
3. Shows: All testing-related resources
```

### Workflow 4: Understand Dependencies

```
You: "What do I need for RAG?"

Claude:
1. Uses: brain_relationships(skillName: "rag-implementer")
2. Gets: vector-database-mcp, embedding-generator-mcp, semantic-search-mcp
3. Shows: Complete dependency tree
```

## Brain Tools Cheat Sheet

| Tool | Use When | Example |
|------|----------|---------|
| `brain_select_skills` | Starting any task | "build MVP", "implement RAG", "add auth" |
| `brain_search` | Finding specific resources | "authentication", "testing", "deployment" |
| `brain_relationships` | Need dependencies | Show MCPs for "rag-implementer" |
| `brain_show_skill` | Need details | Get info on "mvp-builder" |
| `graph_query_by_domain` | Exploring domain | "ai", "security", "frontend" |
| `graph_query_by_effect` | Need specific effect | "implements_authentication" |
| `brain_status` | Check repository | Skills count, health status |

## Task → Skills Mapping

| Task | Use brain_select_skills | Returns |
|------|------------------------|---------|
| Build MVP | "build MVP" | mvp-builder, product-strategist |
| Add Auth | "implement authentication" | security-engineer, api-designer |
| RAG System | "implement RAG system" | rag-implementer, knowledge-base-manager |
| API Design | "design REST API" | api-designer, security-engineer |
| Frontend | "build React frontend" | frontend-builder, ux-designer |
| Tests | "add tests" | testing-strategist |
| Deploy | "deploy to production" | deployment-advisor |
| Optimize | "improve performance" | performance-optimizer |
| Multi-Agent | "build multi-agent system" | multi-agent-architect |
| Knowledge Graph | "build knowledge graph" | knowledge-graph-builder |

## Domain → Capabilities

| Domain | Use graph_query_by_domain | Returns |
|--------|---------------------------|---------|
| `ai` | AI/ML capabilities | rag-implementer, multi-agent-architect, etc. |
| `security` | Security capabilities | security-engineer, security-auditor, etc. |
| `frontend` | Frontend capabilities | frontend-builder, ux-designer, etc. |
| `backend` | Backend capabilities | api-designer, database-architect, etc. |
| `testing` | Testing capabilities | testing-strategist, quality-auditor, etc. |
| `devops` | DevOps capabilities | deployment-advisor, ci-cd-engineer, etc. |

## Effect → Capabilities

| Effect | Use graph_query_by_effect | Finds |
|--------|---------------------------|-------|
| `implements_authentication` | Skills that add auth | security-engineer, api-designer |
| `creates_vector_index` | Skills that add vector DB | rag-implementer, knowledge-base-manager |
| `adds_tests` | Skills that add tests | testing-strategist |
| `optimizes_performance` | Skills that improve perf | performance-optimizer |
| `generates_api_docs` | Skills that document APIs | api-designer, doc-generator |

## CLI Commands

All brain commands work from `scripts/brain/`:

```bash
# Status
npm run brain -- status

# Search
npm run brain -- search "authentication"

# Skill selection  
npm run brain -- select-skills "build RAG system"

# Relationships
npm run brain -- relationships rag-implementer

# Pattern matching
npm run brain -- patterns "need knowledge base"

# Workflow planning
npm run brain -- workflow "implement RAG"

# Comprehensive analysis (uses all engines)
npm run brain -- analyze "build AI chatbot with auth"
```

## Making It Automatic

### Option 1: Project Instructions

Copy `TEMPLATES/claude-instructions-with-brain.md` to `.claude/instructions.md`

Claude will then automatically:
1. Use brain tools to discover skills
2. Read skill files
3. Apply methodologies
4. Use recommended MCPs

### Option 2: Prompting Pattern

Train yourself to always ask:
```
"Use brain_select_skills to find skills for [task]"
"Use brain_relationships to get dependencies"
```

### Option 3: Custom Prompt

Add to your project's context:
```markdown
When implementing features:
1. Use brain_select_skills to find relevant skills
2. Use brain_relationships to find required MCPs
3. Read skill files from SKILLS/ directory
4. Follow skill methodologies
5. Use recommended MCPs
```

## Troubleshooting

**Issue:** Brain tools not available
**Fix:** Run `./scripts/configure-mcp-paths.sh` and restart Claude

**Issue:** Hardcoded paths error
**Fix:** Run `./scripts/configure-mcp-paths.sh` to fix paths

**Issue:** Build errors
**Fix:** Check `DOCS/BRAIN-ORCHESTRATOR-TROUBLESHOOTING.md`

**Issue:** Claude doesn't use brain automatically
**Fix:** Add project instructions (see "Making It Automatic" above)

## Examples

### Example 1: RAG System

```
You: "I need to implement semantic search for our docs"

Claude uses brain:
→ brain_select_skills("implement semantic search")
  Returns: rag-implementer, knowledge-base-manager

→ brain_relationships("rag-implementer")
  Returns: vector-database-mcp, embedding-generator-mcp, semantic-search-mcp

→ Reads SKILLS/rag-implementer/SKILL.md

→ Follows 8-phase RAG implementation:
  1. Choose architecture (Advanced RAG)
  2. Set up vector DB (Pinecone via vector-database-mcp)
  3. Implement embeddings (OpenAI via embedding-generator-mcp)
  4. Build ingestion pipeline
  5. Implement retrieval (semantic-search-mcp)
  6. Integrate with LLM
  7. Add evaluation
  8. Test end-to-end
```

### Example 2: MVP Development

```
You: "Help me build an MVP for a task management app"

Claude uses brain:
→ brain_select_skills("build MVP for task management")
  Returns: mvp-builder, product-strategist, frontend-builder

→ brain_relationships("mvp-builder")
  Returns: feature-prioritizer-mcp, user-insight-analyzer-mcp

→ Reads SKILLS/mvp-builder/SKILL.md

→ Follows MVP methodology:
  1. Identify riskiest assumption (using product-strategist)
  2. Choose MVP pattern (Concierge MVP recommended)
  3. Prioritize features using P0/P1/P2 (via feature-prioritizer-mcp)
  4. Build only P0 features:
     - User registration
     - Create tasks
     - Mark complete
  5. Validate with real users (user-insight-analyzer-mcp)
```

### Example 3: Adding Authentication

```
You: "Add JWT authentication to my API"

Claude uses brain:
→ brain_select_skills("implement JWT authentication")
  Returns: security-engineer, api-designer

→ brain_relationships("security-engineer")
  Returns: security-scanner-mcp, api-validator-mcp

→ Reads SKILLS/security-engineer/SKILL.md

→ Implements authentication:
  1. Add JWT library
  2. Create auth middleware
  3. Implement login/register endpoints
  4. Add token validation
  5. Secure routes
  6. Add refresh tokens
  7. Test with security-scanner-mcp
  8. Validate API with api-validator-mcp
```

## Key Insights

### What the Brain IS:
- ✅ Skill discovery system
- ✅ Dependency mapper  
- ✅ Resource search engine
- ✅ Workflow recommender

### What the Brain IS NOT:
- ❌ Automatic code generator
- ❌ Self-executing system
- ❌ AI that codes without guidance
- ❌ Replacement for Claude's judgment

### The Brain's Role:
1. **Discovers** which skills to use
2. **Maps** what MCPs are needed
3. **Guides** Claude to load skills
4. **Recommends** proven methodologies

### Claude's Role:
1. **Interprets** the task
2. **Invokes** brain tools
3. **Reads** skill files
4. **Applies** methodologies
5. **Uses** recommended MCPs

## Summary

**Setup Once:**
```bash
./scripts/configure-mcp-paths.sh
```

**Use Always:**
```
"Use brain_select_skills to find skills for [task]"
```

**Result:**
Claude discovers skills → Reads files → Applies proven methodologies → Delivers better results

See full documentation:
- Troubleshooting: `DOCS/BRAIN-ORCHESTRATOR-TROUBLESHOOTING.md`
- Project Template: `TEMPLATES/claude-instructions-with-brain.md`
- Brain CLI: `scripts/brain/README.md`
- Brain MCP: `MCP-SERVERS/brain-mcp/README.md`
