# Brain MCP Server

**Exposes ai-dev-standards brain and capability graph to Claude Code**

## Purpose

The Brain MCP Server bridges the gap between the ai-dev-standards brain/orchestration system and Claude Code. It provides intelligent skill/MCP recommendations, capability graph queries, and orchestration intelligence directly to Claude Code via the MCP protocol.

## What It Does

- **Intelligent Recommendations** - Analyzes tasks and recommends optimal skills/MCPs
- **Capability Graph Queries** - Query by domain, effect, dependencies, paths
- **Skill Discovery** - Search and explore all available skills
- **Relationship Mapping** - Show how skills, MCPs, tools, and components relate
- **Dependency Resolution** - Find what's required for any capability
- **Graph Validation** - Check capability graph consistency

## Tools Provided

### Brain Commands

1. **brain_search** - Search all skills, MCPs, tools by keyword
   ```typescript
   brain_search({ query: "authentication" })
   ```

2. **brain_select_skills** - Get intelligent skill recommendations
   ```typescript
   brain_select_skills({ taskDescription: "implement RAG system" })
   ```

3. **brain_show_skill** - Get detailed skill information
   ```typescript
   brain_show_skill({ skillName: "rag-implementer" })
   ```

4. **brain_relationships** - Show skill relationships
   ```typescript
   brain_relationships({ skillName: "security-engineer" })
   ```

5. **brain_status** - Get repository status
   ```typescript
   brain_status({})
   ```

### Graph Queries

6. **graph_query_by_domain** - Find capabilities by domain
   ```typescript
   graph_query_by_domain({ domain: "ai" })
   ```

7. **graph_query_by_effect** - Find capabilities by effect
   ```typescript
   graph_query_by_effect({ effect: "implements_authentication" })
   ```

8. **graph_get_dependencies** - Get capability dependencies
   ```typescript
   graph_get_dependencies({ capabilityId: "rag-implementer" })
   ```

9. **graph_find_path** - Find path between capabilities
   ```typescript
   graph_find_path({ from: "rag-implementer", to: "frontend-builder" })
   ```

10. **graph_composition_chains** - Get composition chains
    ```typescript
    graph_composition_chains({ capabilityId: "security-engineer" })
    ```

11. **graph_stats** - Get graph statistics
    ```typescript
    graph_stats({})
    ```

12. **graph_validate** - Validate graph consistency
    ```typescript
    graph_validate({})
    ```

## Installation

### 1. Build the MCP Server

```bash
cd MCP-SERVERS/brain-mcp
npm install
npm run build
```

### 2. Configure Claude Code

Add to your project's `.claude/mcp-settings.json`:

```json
{
  "mcpServers": {
    "brain-mcp": {
      "command": "node",
      "args": [
        "/absolute/path/to/ai-dev-standards/MCP-SERVERS/brain-mcp/dist/index.js"
      ],
      "env": {
        "AI_DEV_STANDARDS_ROOT": "/absolute/path/to/ai-dev-standards"
      }
    }
  }
}
```

### 3. Test

Ask Claude Code:

```
Use brain_search to find skills related to authentication.
```

Claude Code should now have access to all brain tools!

## Usage Examples

### Example 1: Find Skills for a Task

```
Use brain_select_skills to recommend skills for "building a RAG system with vector search"
```

**Result:**
- rag-implementer
- knowledge-base-manager
- vector-database-mcp
- embedding-generator-mcp

### Example 2: Explore Domain

```
Use graph_query_by_domain to show all AI-related capabilities
```

**Result:**
- 80 capabilities including rag-implementer, multi-agent-architect, knowledge-graph-builder, etc.

### Example 3: Check Dependencies

```
Use graph_get_dependencies for rag-implementer
```

**Result:**
- Direct: openai-integration, pinecone-mcp, embedding-generator-mcp
- Transitive: None

### Example 4: Find Compositions

```
Use graph_composition_chains for security-engineer
```

**Result:**
- security-engineer → api-designer → frontend-builder
- Shows what skills work well together

## Architecture

```
┌─────────────────────────────────────────┐
│ Claude Code (in any project)           │
│                                         │
│ Asks: "What skills for RAG?"           │
└───────────────┬─────────────────────────┘
                │ MCP Protocol
                ↓
┌─────────────────────────────────────────┐
│ Brain MCP Server                        │
│ (MCP-SERVERS/brain-mcp)                │
│                                         │
│ • brain_select_skills()                 │
│ • graph_query_by_effect()              │
│ • Executes brain CLI                    │
│ • Executes graph query tool             │
└───────────────┬─────────────────────────┘
                │
                ↓
┌─────────────────────────────────────────┐
│ ai-dev-standards Brain                  │
│                                         │
│ • Brain CLI (scripts/brain/brain.ts)   │
│ • Graph Tool (scripts/graph-query-*.py)│
│ • Capability Graph (113 nodes)         │
└─────────────────────────────────────────┘
```

## Requirements

- Node.js >= 18
- TypeScript 5.x
- Python 3 (for graph queries)
- ai-dev-standards repository
- Built brain CLI (`cd scripts/brain && npm install && npm run build`)

## Environment Variables

- `AI_DEV_STANDARDS_ROOT` - Absolute path to ai-dev-standards repo (required)

## Development

```bash
# Watch mode
npm run watch

# Development with auto-restart
npm run dev
```

## Troubleshooting

### "Brain CLI not found"

Ensure brain CLI is built:
```bash
cd scripts/brain
npm install
npm run build
```

### "Capability graph missing"

Ensure graph exists:
```bash
ls META/capability-graph.json
```

If missing, generate it:
```bash
python3 scripts/generate-all-manifests.py
```

### "Graph query tool not executable"

Ensure Python 3 is installed and script exists:
```bash
python3 --version
ls scripts/graph-query-tool.py
```

## Status

- **Version:** 1.0.0
- **Status:** ✅ Production Ready
- **Coverage:** 12 tools, 113 capabilities
- **Integration:** Works with all ai-dev-standards skills and MCPs

## See Also

- [Brain CLI Documentation](../../scripts/brain/README.md)
- [Capability Graph Status](../../CAPABILITY-GRAPH-STATUS.md)
- [Repository Brain Architecture](../../META/REPOSITORY-BRAIN.md)
