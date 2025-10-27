# Registry Synchronization Update Plan

## ✅ Completed

### 1. Registry Files (All Updated)
- ✅ `META/tool-registry.json` - Created with 9 tools + 4 scripts
- ✅ `META/relationship-mapping.json` - v2.0.0 with new structure
- ✅ `META/component-registry.json` - Enhanced with cross-refs
- ✅ `META/integration-registry.json` - Enhanced with cross-refs
- ✅ `scripts/regenerate-relationships.ts` - Automation script

### 2. CLI Utils
- ✅ `CLI/utils/github-fetch.js` - Now fetches all 5 registries + relationships

## 🔄 In Progress

### 3. CLI Commands
**File:** `CLI/commands/sync.js`

**Current Issues:**
- Line 195-208: Only checks skills
- Line 210-224: Only checks MCPs
- Line 226-240: Checks tools but structure changed
- Missing: Component checking
- Missing: Integration checking

**Needed Changes:**
```javascript
// Add to checkForUpdates():

// Check components
if (config.tracking.includes('components')) {
  const newComponents = latest.components.filter(comp =>
    !config.installed.components.includes(comp.id)
  )
  for (const comp of newComponents) {
    updates.push({
      type: 'component',
      name: comp.name,
      description: comp.description,
      data: comp
    })
  }
}

// Check integrations
if (config.tracking.includes('integrations')) {
  const newIntegrations = latest.integrations.filter(int =>
    !config.installed.integrations.includes(int.id)
  )
  for (const integration of newIntegrations) {
    updates.push({
      type: 'integration',
      name: integration.name,
      description: integration.description,
      data: integration
    })
  }
}

// Update tool checking to use new structure:
if (config.tracking.includes('tools')) {
  const newTools = latest.tools.filter(tool =>
    !config.installed.tools.includes(tool.id)  // Changed from tool.name to tool.id
  )
  // Also check scripts
  const newScripts = latest.scripts.filter(script =>
    !config.installed.scripts.includes(script.id)
  )
}
```

**Add to applyUpdate() switch:**
```javascript
case 'component':
  await addComponentToProject(projectPath, update.data)
  config.installed.components.push(update.data.id)
  break

case 'integration':
  await addIntegrationToProject(projectPath, update.data)
  config.installed.integrations.push(update.data.id)
  break

case 'script':
  await addScriptToProject(projectPath, update.data)
  config.installed.scripts.push(update.data.id)
  break
```

**Add new functions:**
```javascript
async function addComponentToProject(projectPath, component) {
  // Copy component to components directory
  const componentsDir = path.join(projectPath, 'components', component.category)
  await fs.ensureDir(componentsDir)

  // Fetch component file from GitHub
  const { fetchText } = require('../utils/github-fetch')
  const content = await fetchText(component.path.substring(1)) // Remove leading /

  const componentFile = path.basename(component.path)
  await fs.writeFile(path.join(componentsDir, componentFile), content)
}

async function addIntegrationToProject(projectPath, integration) {
  // Copy integration to lib directory
  const integrationsDir = path.join(projectPath, 'lib', 'integrations', integration.category)
  await fs.ensureDir(integrationsDir)

  // Fetch integration file from GitHub
  const { fetchText } = require('../utils/github-fetch')
  const content = await fetchText(integration.path.substring(1))

  const integrationFile = path.basename(integration.path)
  await fs.writeFile(path.join(integrationsDir, integrationFile), content)
}

async function addScriptToProject(projectPath, script) {
  // Copy script to scripts directory
  const scriptsDir = path.join(projectPath, 'scripts')
  await fs.ensureDir(scriptsDir)

  const { fetchText } = require('../utils/github-fetch')
  const content = await fetchText(script.path.substring(1))

  const scriptFile = path.basename(script.path)
  const scriptPath = path.join(scriptsDir, scriptFile)
  await fs.writeFile(scriptPath, content, { mode: 0o755 })
}
```

**Update initializeSync() tracking choices:**
```javascript
choices: [
  { name: 'Skills (claude.md)', value: 'skills', checked: true },
  { name: 'MCP Servers', value: 'mcps', checked: true },
  { name: 'Tools', value: 'tools', checked: true },
  { name: 'Components', value: 'components', checked: true },
  { name: 'Integrations', value: 'integrations', checked: true },
  { name: 'Cursor Rules (.cursorrules)', value: 'cursorrules', checked: true },
  { name: 'Git Ignore (.gitignore)', value: 'gitignore', checked: true },
  { name: 'Templates', value: 'templates', checked: false }
]
```

**Update config.installed initialization:**
```javascript
installed: {
  skills: [],
  mcps: [],
  tools: [],
  scripts: [],
  components: [],
  integrations: []
}
```

## 📋 Pending Updates

### 4. Documentation Files

**`.claude/claude.md`** - Needs all 37 skills listed

Current format needed:
```markdown
# Claude Configuration

## Skills

### 3d-visualizer
Expert in Three.js, 3D graphics, and interactive 3D visualizations
**Location:** `/SKILLS/3d-visualizer/SKILL.md`

### accessibility-engineer
Implement accessibility (a11y) best practices...
**Location:** `/SKILLS/accessibility-engineer/SKILL.md`

...all 37 skills
```

**`.cursorrules`** - Update registry references

Add section:
```markdown
## Available Resources

This project has access to:
- **37 Skills** - Specialized development methodologies
- **34 MCPs** - Executable Model Context Protocol servers
- **9 Tools** - LangChain, CrewAI, and custom tools
- **13 Components** - React components, agents, workflows
- **6 Integrations** - OpenAI, Anthropic, Supabase, Stripe, etc.
- **4 Scripts** - db-backup, db-migrate, test-runner, deploy

See registries in `/META/`:
- `skill-registry.json` - All available skills
- `mcp-registry.json` - All MCP servers
- `tool-registry.json` - All tools and scripts
- `component-registry.json` - All components
- `integration-registry.json` - All integrations
- `relationship-mapping.json` - Resource dependencies
```

**`TEMPLATES/cursorrules-*.md`** - Update all templates

Same registry references as above should be added to:
- `cursorrules-ai-rag.md`
- `cursorrules-existing-project.md`
- `cursorrules-minimal.md`
- `cursorrules-quick-test.md`
- `cursorrules-saas.md`

**`README.md`** - Update statistics (lines 9-26)

Current shows:
```
**Version 1.2.0** | **Last Updated:** 2025-10-23
```

Update to:
```
**Version 1.3.0** | **Last Updated:** 2025-10-24

- **37 Specialized Skills** - From RAG to deployment
- **34 MCP Servers** - Executable tools (92% skill coverage)
- **9 Tools** - LangChain, CrewAI, custom utilities
- **13 Components** - React components, agents, UI elements
- **6 Integrations** - LLM providers, platforms, vector DBs
- **100% Discoverability** - Complete registry system
```

Line 24 currently:
```
**MCP Development Status:** 7/37 tools built (19%) — [See roadmap](BUILD_FOCUS.md)
```

Update to:
```
**Resource Status:** 34 MCPs, 9 Tools, 13 Components, 6 Integrations - [See registries](META/)
```

### 5. Bootstrap Installer

**`INSTALLERS/bootstrap/`** directory

The bootstrap installer needs to:
1. Fetch all 5 registries
2. Install from tool-registry
3. Install from component-registry
4. Install from integration-registry
5. Use relationship-mapping.json to understand dependencies

### 6. Testing

Before committing, test:
```bash
# Test CLI
cd CLI
npm link
cd /tmp/test-project
ai-dev sync --yes

# Verify it fetches all 5 registries
# Verify .ai-dev.json has all resource types
# Verify .claude/claude.md has all 37 skills
```

## 📊 Updated Statistics

**New Totals:**
- Skills: 37
- MCPs: 34
- Tools: 9
- Scripts: 4
- Components: 13
- Integrations: 6
- **Total Resources: 103**

**Coverage:**
- Skills with MCP support: 31/37 (84%)
- Skills with at least one resource: 37/37 (100%)
- MCPs with dependencies mapped: 34/34 (100%)
- Tools with supports_skills: 9/9 (100%)
- Components with cross-refs: 13/13 (100%)
- Integrations with cross-refs: 6/6 (100%)

**Relationship Mapping v2.0:**
- Per-skill mappings: All 37 skills
- Per-MCP mappings: All 34 MCPs
- Most used tool: filesystem-tool (20 usages)
- Most used component: loading-spinner (5 usages)
- Most used integration: supabase (9 usages)
- Most used script: deploy (4 usages)

## 🎯 Next Steps

1. ✅ Update `CLI/utils/github-fetch.js` (DONE)
2. ⏳ Update `CLI/commands/sync.js` with component/integration support
3. ⏳ Update `.claude/claude.md` with all 37 skills
4. ⏳ Update `.cursorrules` and all templates
5. ⏳ Update `README.md` with new statistics
6. ⏳ Update bootstrap installer
7. ⏳ Test sync command
8. ⏳ Commit and push all changes

## 🔧 Manual Updates Needed

Some files are too complex to auto-generate and need manual review:
- CLI command handlers (sync, add, generate)
- Bootstrap installer logic
- Template content (cursorrules templates)

Should I continue with the updates or would you like to review this plan first?
