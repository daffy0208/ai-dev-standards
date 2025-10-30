# Brain MCP Integration Guide

**Making the brain accessible to Claude Code in any project**

## Problem Solved

Previously, the ai-dev-standards brain was only accessible via CLI in the ai-dev-standards repository. When working in other projects, Claude Code couldn't:
- Query the capability graph
- Get intelligent skill recommendations
- Find MCPs for specific tasks
- Discover relationships between capabilities

**Now with Brain MCP:** Claude Code has full access to brain intelligence in ANY project!

---

## What Brain MCP Provides

### 12 Tools for Claude Code

1. **brain_search** - Search all skills/MCPs/tools by keyword
2. **brain_select_skills** - Get intelligent skill recommendations
3. **brain_show_skill** - Get detailed skill information
4. **brain_relationships** - Show skill dependencies
5. **graph_query_by_domain** - Find capabilities by domain (ai, security, etc.)
6. **graph_query_by_effect** - Find by effect (implements_authentication, etc.)
7. **graph_get_dependencies** - Get capability dependencies
8. **graph_find_path** - Find path between capabilities
9. **graph_composition_chains** - See what works well together
10. **graph_stats** - Get graph statistics
11. **graph_validate** - Validate graph consistency
12. **brain_status** - Get repository status

---

## Setup

### For ai-dev-standards Repository (Already Done)

Brain MCP is already configured in `.claude/mcp-settings.json`:

```json
{
  "mcpServers": {
    "brain-mcp": {
      "command": "node",
      "args": [
        "C:\\Users\\david\\OneDrive - Qolcom\\AI\\AI_Development_Projects\\ai-dev-standards\\MCP-SERVERS\\brain-mcp\\dist\\index.js"
      ],
      "env": {
        "AI_DEV_STANDARDS_ROOT": "C:\\Users\\david\\OneDrive - Qolcom\\AI\\AI_Development_Projects\\ai-dev-standards"
      }
    }
  }
}
```

### For Other Projects

When you run `setup-project.sh`, brain-mcp should be automatically configured. If not, manually add it:

1. **Edit `.claude/mcp-settings.json`** in your project:

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

2. **Replace paths** with your actual ai-dev-standards location

3. **Restart Claude Code** to load the new MCP

---

## Usage Examples

### Example 1: Find Skills for Your Task

**Instead of:**
```
"I need to implement authentication. What skills should I use?"
```

**Now do:**
```
Use brain_select_skills with taskDescription: "implement authentication and authorization"
```

**Result:**
```
Recommended Skills:
  • security-engineer - Security best practices, OWASP Top 10
  • api-designer - REST API design with auth
  • supabase-developer - Supabase Auth integration

Required MCPs:
  • security-scanner-mcp
```

### Example 2: Explore a Domain

**Ask:**
```
Use graph_query_by_domain to show me all AI-related capabilities.
```

**Result:**
```
80 capabilities in domain 'ai':
  • rag-implementer
  • knowledge-base-manager
  • multi-agent-architect
  • embedding-generator-mcp
  • vector-database-mcp
  ... and 75 more
```

### Example 3: Check Dependencies

**Ask:**
```
Use graph_get_dependencies for rag-implementer to see what it needs.
```

**Result:**
```
Dependencies for rag-implementer:
  Direct:
    • openai-integration
    • pinecone-mcp
    • embedding-generator-mcp
  Transitive: None
```

### Example 4: Find What Works Together

**Ask:**
```
Use graph_composition_chains for security-engineer to see what skills compose well.
```

**Result:**
```
Composition chains:
  1. security-engineer → api-designer
  2. security-engineer → api-designer → frontend-builder
  3. security-engineer → deployment-advisor
  4. security-engineer → testing-strategist
```

### Example 5: Search Everything

**Ask:**
```
Use brain_search with query "rag" to find all RAG-related resources.
```

**Result:**
```
7 results:
  Skills:
    • rag-implementer - RAG implementation
    • knowledge-base-manager - Knowledge systems
  MCPs:
    • embedding-generator-mcp
    • semantic-search-mcp
    • vector-database-mcp
  ... and 2 more
```

---

## How It Works

```
┌─────────────────────────────────────────┐
│ Your Project                            │
│                                         │
│ You ask Claude Code:                    │
│ "Use brain_select_skills for RAG"      │
└───────────────┬─────────────────────────┘
                │
                ↓ MCP Protocol
┌─────────────────────────────────────────┐
│ Brain MCP Server                        │
│ (Running as MCP)                        │
│                                         │
│ • Receives tool call                    │
│ • Executes brain CLI                    │
│ • Queries capability graph              │
│ • Returns recommendations               │
└───────────────┬─────────────────────────┘
                │
                ↓
┌─────────────────────────────────────────┐
│ ai-dev-standards Brain                  │
│                                         │
│ • 113 capabilities                      │
│ • 169 relationships                     │
│ • 215 effects                           │
│ • 84 domains                            │
└─────────────────────────────────────────┘
```

---

## Benefits

### Before Brain MCP ❌

- **Manual Selection** - Had to remember which skills existed
- **No Recommendations** - Couldn't get intelligent suggestions
- **No Discovery** - Hard to find related capabilities
- **CLI Only** - Brain only worked in ai-dev-standards repo
- **Passive Integration** - Skills listed but not actively suggested

### After Brain MCP ✅

- **Intelligent Recommendations** - Ask for task, get optimal skills
- **Graph Queries** - Search by domain, effect, dependencies
- **Relationship Discovery** - See what works well together
- **Universal Access** - Works in ANY project with ai-dev-standards
- **Active Intelligence** - Claude Code can query brain proactively

---

## Advanced Usage

### Combine Multiple Queries

```
1. Use graph_query_by_effect with "implements_authentication"
2. For each result, use brain_show_skill to get details
3. Use graph_get_dependencies to check what's needed
4. Choose the best skill based on my project needs
```

### Validate Your Approach

```
1. Use brain_select_skills for my task
2. Use graph_composition_chains for each recommended skill
3. Use graph_find_path between skills to see relationships
4. Build implementation plan based on dependencies
```

### Explore the Graph

```
1. Use graph_stats to see overview
2. Use graph_query_by_domain for my domain
3. Use graph_validate to check consistency
4. Report any issues found
```

---

## Troubleshooting

### "Brain MCP not available"

**Check MCP configuration:**
```bash
cat .claude/mcp-settings.json | grep brain-mcp
```

**Ensure brain-mcp is built:**
```bash
cd /path/to/ai-dev-standards/MCP-SERVERS/brain-mcp
ls dist/index.js
```

If missing:
```bash
npm install
npm run build
```

### "Brain CLI not found"

**Ensure brain CLI is built:**
```bash
cd /path/to/ai-dev-standards/scripts/brain
npm install
npm run build
```

### "Capability graph missing"

**Check graph exists:**
```bash
ls /path/to/ai-dev-standards/META/capability-graph.json
```

If missing, it should exist (113 nodes). Check that you're pointing to the right ai-dev-standards directory.

### "Python not found"

Graph queries use Python. Ensure Python 3 is installed:
```bash
python3 --version
```

### "Permission denied"

**Check executable permissions:**
```bash
chmod +x /path/to/ai-dev-standards/scripts/graph-query-tool.py
```

---

## Performance

- **Query Time:** < 100ms for most queries
- **Search Time:** < 200ms for full text search
- **Graph Loading:** One-time cost, cached in memory
- **Recommendation Time:** < 500ms for skill selection

---

## What This Enables

### Intelligent Development Workflow

1. **Start Task** - Ask brain_select_skills for recommendations
2. **Check Dependencies** - Use graph_get_dependencies
3. **Find Related** - Use graph_composition_chains
4. **Implement** - Use recommended skills/MCPs
5. **Validate** - Use graph_validate for consistency

### Discovery-Driven Development

1. **Explore Domain** - graph_query_by_domain
2. **Find Effects** - graph_query_by_effect
3. **See Relationships** - graph_composition_chains
4. **Build Mental Model** - graph_stats
5. **Implement with Confidence** - Know what works together

### Proactive Recommendations

Claude Code can now:
- Suggest skills based on file changes
- Recommend MCPs for detected patterns
- Warn about missing dependencies
- Offer composition suggestions

---

## Next Steps

1. **Try It Out** - Ask Claude Code to use brain tools
2. **Explore Capabilities** - Use graph_query_by_domain to see what's available
3. **Build Something** - Use brain_select_skills for your next task
4. **Provide Feedback** - Report what works and what could be better

---

## See Also

- [Brain MCP Server README](../MCP-SERVERS/brain-mcp/README.md)
- [Brain CLI Documentation](../scripts/brain/README.md)
- [Capability Graph Status](../CAPABILITY-GRAPH-STATUS.md)
- [Repository Brain Architecture](../META/REPOSITORY-BRAIN.md)

---

**Status:** ✅ Production Ready
**Version:** 1.0.0
**Date:** 2025-10-30
