# Plugin Integration Guide

## Overview

This guide explains how the Claude Code Plugins Plus marketplace is integrated with the ai-dev-standards repository, including registry management, relationship mappings, and validation procedures.

## Installed Plugins

### High Priority Plugins (Installed)

1. **AI/ML Engineering Pack** (AI Instruction)
   - Enhances: rag-implementer, knowledge-base-manager, knowledge-graph-builder
   - Category: ai-ml
   - Auto-loads guidance for RAG systems, LLM integration, vector databases

2. **Skills Powerkit** (Agent Skill)
   - Enhances: ALL skills
   - Category: productivity
   - Auto-activates for plugin management tasks

3. **DevOps Automation Pack** (AI Instruction)
   - Enhances: deployment-advisor
   - Category: devops
   - Provides CI/CD, Docker, Kubernetes guidance

4. **Workflow Orchestrator** (MCP Server)
   - Enhances: orchestration-planner, multi-agent-architect
   - Category: orchestration
   - DAG-based task automation with dependencies

5. **Project Health Auditor** (MCP Server)
   - Enhances: quality-auditor, system-diagnostician
   - Category: quality
   - Code health analysis and quality metrics

6. **Domain Memory Agent** (MCP Server)
   - Enhances: rag-implementer, knowledge-base-manager
   - Category: ai-ml
   - Semantic search with embeddings

7. **Security Pro Pack** (AI Instruction)
   - Enhances: security-engineer
   - Category: security
   - OWASP auditing, threat modeling templates

8. **Agent Context Manager** (Agent Skill)
   - Enhances: context-preserver
   - Category: productivity
   - Auto-detects AGENTS.md files

9. **Fullstack Starter Pack** (AI Instruction)
   - Enhances: frontend-builder, api-designer
   - Category: fullstack
   - React patterns, API scaffolding

10. **Design to Code** (MCP Server)
    - Enhances: frontend-builder, design-system-architect
    - Category: frontend
    - Converts designs to React/Vue/Svelte

## Registry Structure

### Plugin Registry (`meta/plugin-registry.json`)

```json
{
  "plugins": [
    {
      "id": "plugin-id",
      "name": "Display Name",
      "type": "ai-instruction|mcp-server|agent-skill",
      "source": "claude-code-plugins-plus",
      "description": "What the plugin does",
      "category": "category-name",
      "enhances_skills": ["skill-1", "skill-2"],
      "install_command": "/plugin install ...",
      "status": "recommended|optional",
      "mcp_server": true, // if MCP server
      "auto_activates": true // if agent skill
    }
  ],
  "metadata": {
    "total_plugins": 10,
    "mcp_servers": 4,
    "ai_instructions": 4,
    "agent_skills": 2
  }
}
```

### Relationship Mapping (`meta/relationship-mapping.json`)

The relationship mapping now includes two new sections:

1. **plugin_to_skill**: Maps which plugins enhance which skills
2. **plugin_to_mcp**: Maps MCP server plugins with their capabilities

## Integration Scripts

### 1. Test Plugins (`scripts/test-plugins.cjs`)

Verifies plugin installation and integration:

```bash
node scripts/test-plugins.cjs
```

**Checks:**

- Plugin installation status
- MCP server processes running
- AI instruction templates loaded
- Agent skills accessible
- Skill relationships valid

### 2. Update Plugin Relationships (`scripts/update-plugin-relationships.cjs`)

Updates relationship-mapping.json with plugin data:

```bash
node scripts/update-plugin-relationships.cjs
```

**Updates:**

- plugin_to_skill mappings
- plugin_to_mcp mappings
- Plugin metadata in relationship file

### 3. Validate Complete System (`scripts/validate-complete-system.cjs`)

Enhanced to include plugin validation:

```bash
node scripts/validate-complete-system.cjs
```

**Validates:**

- All existing registries (skills, MCPs, tools, etc.)
- Plugin registry consistency
- Plugin-to-skill relationships
- MCP server plugin requirements

## Adding New Plugins

When adding new plugins to the marketplace:

1. **Install the plugin:**

   ```bash
   /plugin install plugin-name@claude-code-plugins-plus
   ```

2. **Add to plugin-registry.json:**

   ```json
   {
     "id": "new-plugin",
     "name": "New Plugin Name",
     "type": "ai-instruction|mcp-server|agent-skill",
     "source": "claude-code-plugins-plus",
     "description": "Plugin description",
     "category": "category",
     "enhances_skills": ["skill-names"],
     "install_command": "/plugin install new-plugin@claude-code-plugins-plus",
     "status": "recommended|optional"
   }
   ```

3. **Update relationships:**

   ```bash
   node scripts/update-plugin-relationships.cjs
   ```

4. **Validate:**

   ```bash
   node scripts/validate-complete-system.cjs
   node scripts/test-plugins.cjs
   ```

5. **Commit changes:**
   ```bash
   git add meta/plugin-registry.json meta/relationship-mapping.json
   git commit -m "feat: Add new-plugin integration"
   ```

## Plugin Types

### AI Instruction Templates (4 plugins)

- Loaded on-demand when Claude needs guidance
- No separate process required
- Automatically available after installation

### MCP Server Plugins (4 plugins)

- Run as Node.js processes
- Provide executable tools and capabilities
- Require Node.js runtime
- Check if running: `ps aux | grep mcp`

### Agent Skills (2 plugins)

- Auto-activate based on context
- No manual invocation needed
- Integrated into Claude's capability set

## Verification Checklist

After plugin installation:

- [ ] Run `node scripts/test-plugins.cjs` - All checks pass
- [ ] Run `node scripts/update-plugin-relationships.cjs` - Relationships updated
- [ ] Run `node scripts/validate-complete-system.cjs` - No new issues
- [ ] Verify MCP servers running: `ps aux | grep mcp`
- [ ] Test AI instructions with relevant prompts
- [ ] Verify agent skills auto-activate
- [ ] Check plugin-registry.json has correct metadata
- [ ] Check relationship-mapping.json includes plugins
- [ ] Commit changes to Git

## Resource Count Updates

With plugins integrated, total resources are now:

- **64 skills** (unchanged)
- **50 MCPs** (unchanged)
- **72 components** (unchanged)
- **28 integrations** (baseline)
- **10 plugins** (NEW)
- **248 total resources** (238 + 10 plugins)

## Troubleshooting

### Plugin Not Found

If `/plugin install` fails:

1. Verify marketplace is added: `/plugin marketplace add jeremylongshore/claude-code-plugins`
2. Check plugin name spelling
3. Confirm internet connection

### MCP Server Not Running

If MCP server plugin isn't working:

1. Check if Node.js is installed: `node --version`
2. Look for process: `ps aux | grep plugin-name`
3. Check Claude Code logs
4. Restart Claude Code

### Plugin Not Enhancing Skill

If plugin isn't working with a skill:

1. Verify plugin-registry.json has correct `enhances_skills` array
2. Run `node scripts/update-plugin-relationships.cjs`
3. Check relationship-mapping.json for plugin_to_skill entry
4. Restart Claude Code to reload relationships

## Marketplace Information

- **Source**: https://github.com/jeremylongshore/claude-code-plugins-plus
- **Website**: https://claudecodeplugins.io
- **Total Available**: 227 plugins
- **Agent Skills Available**: 168 (Anthropic Spec v1.0)
- **Categories**: 15 (DevOps, Security, AI/ML, etc.)

## Next Steps

1. Test plugins with real workflows
2. Integrate plugin capabilities into skill documentation
3. Create examples using plugin-enhanced skills
4. Monitor plugin performance and usefulness
5. Add more plugins as needed from marketplace

## Notes

- Plugins complement existing skills rather than replace them
- MCP server plugins provide executable tools vs. guidance
- Agent skills auto-activate - no manual invocation needed
- Plugin registry is separate from skill/MCP registries for clarity
- Relationship mapping connects all resource types
