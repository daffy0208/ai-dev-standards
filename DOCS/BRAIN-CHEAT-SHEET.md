# Brain MCP Cheat Sheet

**Quick reference for using the ai-dev-standards brain in your projects**

---

## 🔧 One-Time Setup

```bash
# 1. Create .claude/mcp-settings.json in your project
mkdir -p .claude && cat > .claude/mcp-settings.json << 'EOF'
{
  "mcpServers": {
    "brain-mcp": {
      "command": "node",
      "args": ["/FULL/PATH/TO/ai-dev-standards/MCP-SERVERS/brain-mcp/dist/index.js"],
      "env": {
        "AI_DEV_STANDARDS_ROOT": "/FULL/PATH/TO/ai-dev-standards"
      }
    }
  }
}
EOF

# 2. Add this to your .cursorrules
# See PROJECT-SETUP-QUICKSTART.md for full template
```

---

## 💡 Essential Prompts

### When Starting Any Feature:
```
Use brain_select_skills to recommend skills for: [describe your task]
```

### Explore What's Available:
```
Use graph_query_by_domain to show capabilities in: [ai|security|frontend|backend|etc]
```

### Check What You Need:
```
Use graph_get_dependencies for: [skill-name]
```

### Find What Works Together:
```
Use graph_composition_chains for: [skill-name]
```

### Search Everything:
```
Use brain_search to find: [keyword]
```

---

## 🛠️ All Brain MCP Tools

| Tool | Purpose | Example |
|------|---------|---------|
| `brain_select_skills` | Get skill recommendations | "implement RAG system" |
| `brain_search` | Search all resources | "authentication" |
| `brain_show_skill` | Get skill details | "rag-implementer" |
| `brain_relationships` | Show dependencies | "security-engineer" |
| `brain_status` | Repository health | (no args) |
| `graph_query_by_domain` | Find by domain | "ai", "security" |
| `graph_query_by_effect` | Find by effect | "implements_auth" |
| `graph_get_dependencies` | Get dependencies | "rag-implementer" |
| `graph_composition_chains` | Find compositions | "api-designer" |
| `graph_find_path` | Path between skills | from/to |
| `graph_stats` | Graph statistics | (no args) |
| `graph_validate` | Validate graph | (no args) |

---

## 📊 Common Domains

- `ai` - AI/ML, RAG, embeddings, agents
- `security` - Auth, encryption, OWASP
- `frontend` - React, UI, design systems
- `backend` - APIs, databases, services
- `data` - Databases, pipelines, analytics
- `testing` - Testing strategies, QA
- `deployment` - CI/CD, hosting, DevOps
- `performance` - Optimization, monitoring

---

## ✅ Verify It's Working

```
Use brain_status

Expected:
  Skills: 64
  MCPs: 51
  Health: HEALTHY
```

---

## 🚨 Quick Fixes

**"MCP not found"**
```bash
cd /path/to/ai-dev-standards/MCP-SERVERS/brain-mcp
npm install && npm run build
```

**"Brain CLI not found"**
```bash
cd /path/to/ai-dev-standards/scripts/brain
npm install && npm run build
```

**"Can't find tools"**
- Check paths in `.claude/mcp-settings.json` are absolute
- Restart Claude Code

---

## 🎯 Workflow Template

```
1. Describe what you want to build
2. Claude uses brain_select_skills → Gets recommendations
3. Claude uses graph_get_dependencies → Checks requirements
4. Claude loads skills from ai-dev-standards/SKILLS/
5. Claude implements following skill methodology
6. Claude applies patterns from STANDARDS/
```

---

## 📝 Example Flow

```
You: "Build authentication for my app"

Claude:
  1. Uses brain_select_skills → Recommends: security-engineer, api-designer
  2. Uses graph_get_dependencies → Shows: security-scanner-mcp needed
  3. Loads skills from ai-dev-standards/SKILLS/security-engineer/
  4. Implements auth following OWASP best practices
  5. Creates tests following patterns
```

---

## 🔗 More Info

- Full Guide: `DOCS/PROJECT-SETUP-QUICKSTART.md`
- Brain MCP: `MCP-SERVERS/brain-mcp/README.md`
- All Skills: `META/skill-registry.json`
- Capability Graph: `META/capability-graph.json`

---

**Resources:**
- 64 Skills
- 51 MCPs
- 113 Capabilities
- 169 Relationships
- 215 Effects

**Status:** ✅ Production Ready (v3.0.0)
