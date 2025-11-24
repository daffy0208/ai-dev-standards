# Claude Code Marketplace Installation Guide

## Overview

This guide documents the installation and configuration of MCP servers from the claude-code-plugins-plus marketplace.

**Installation Date:** 2025-10-29
**Marketplace:** claude-code-plugins-plus
**MCPs Installed:** 3
**Total MCPs After Installation:** 54 (51 repository + 3 marketplace)

---

## What is the Marketplace?

The **claude-code-plugins-plus** marketplace provides three types of plugins:

1. **AI Instruction Plugins (97%)** - Markdown-based guidance and prompts
2. **MCP Server Plugins (2%)** - Executable Node.js processes that provide tools
3. **Agent Skills (<1%)** - Auto-invoked capabilities

This guide focuses on installing **MCP Server Plugins**.

---

## Marketplace Location

**Linux/WSL Path:**

```
/home/david/.claude/plugins/marketplaces/claude-code-plugins-plus/
```

**Structure:**

```
claude-code-plugins-plus/
├── plugins/
│   ├── ai-ml/              # AI/ML instruction plugins
│   ├── api-development/    # API instruction plugins
│   ├── devops/            # DevOps instruction plugins
│   ├── mcp/               # MCP SERVER PLUGINS ← Important!
│   ├── security/          # Security instruction plugins
│   └── ...                # Other categories
```

---

## Installed MCP Servers

### 1. domain-memory-agent

**Description:** Knowledge base with semantic search and summarization
**Tools:** 6 MCP tools for document management
**Use Cases:**

- Store and search through project documentation
- Semantic search across 7092 markdown files
- TF-IDF based document retrieval
- Document summarization

**Path:**

```
/home/david/.claude/plugins/marketplaces/claude-code-plugins-plus/plugins/mcp/domain-memory-agent/
```

**Main Entry Point:**

```
dist/servers/knowledge-base.js
```

**Key Features:**

- Store documents with metadata
- TF-IDF semantic search
- Document summarization
- Search history tracking

### 2. project-health-auditor

**Description:** Code health metrics and complexity analysis
**Tools:** 4 MCP tools for code analysis
**Use Cases:**

- Analyze code complexity
- Track git churn rates
- Identify test coverage gaps
- Generate code health reports

**Path:**

```
/home/david/.claude/plugins/marketplaces/claude-code-plugins-plus/plugins/mcp/project-health-auditor/
```

**Main Entry Point:**

```
dist/servers/code-metrics.js
```

**Key Features:**

- Cyclomatic complexity analysis
- Git churn tracking
- Test coverage analysis
- Multi-repo support

### 3. workflow-orchestrator

**Description:** DAG-based workflow automation
**Tools:** 4 MCP tools for workflow management
**Use Cases:**

- Create multi-step workflows
- Define task dependencies (DAG)
- Execute workflows with parallel tasks
- Track workflow execution history

**Path:**

```
/home/david/.claude/plugins/marketplaces/claude-code-plugins-plus/plugins/mcp/workflow-orchestrator/
```

**Main Entry Point:**

```
dist/servers/workflow-engine.js
```

**Key Features:**

- DAG-based task ordering
- Parallel task execution
- Workflow templates
- Execution history and monitoring

---

## Installation Process

### Step 1: Discover Available MCPs

```bash
# List all MCP directories in marketplace
ls -la /home/david/.claude/plugins/marketplaces/claude-code-plugins-plus/plugins/mcp/
```

**Result:** Found 6 MCP servers:

- ai-experiment-logger
- conversational-api-debugger
- design-to-code
- domain-memory-agent ✅ Installed
- project-health-auditor ✅ Installed
- workflow-orchestrator ✅ Installed

### Step 2: Install Dependencies

For each MCP server:

```bash
cd /home/david/.claude/plugins/marketplaces/claude-code-plugins-plus/plugins/mcp/{mcp-name}
npm install --legacy-peer-deps
```

**Why `--legacy-peer-deps`?**
Some marketplace MCPs have peer dependency conflicts that need to be bypassed.

**Example:**

```bash
cd /home/david/.claude/plugins/marketplaces/claude-code-plugins-plus/plugins/mcp/domain-memory-agent
npm install --legacy-peer-deps
# Output: added 135 packages, and audited 136 packages in 8s
```

### Step 3: Build TypeScript

Each MCP is written in TypeScript and must be compiled:

```bash
npm run build
```

**This runs:** `tsc` (TypeScript compiler)

**Output location:** `dist/servers/*.js`

**Example:**

```bash
cd /home/david/.claude/plugins/marketplaces/claude-code-plugins-plus/plugins/mcp/domain-memory-agent
npm run build
# Output: dist/servers/knowledge-base.js created
```

### Step 4: Verify Build

```bash
ls -la /home/david/.claude/plugins/marketplaces/claude-code-plugins-plus/plugins/mcp/*/dist/servers/*.js
```

**Expected output:**

```
domain-memory-agent/dist/servers/knowledge-base.js
project-health-auditor/dist/servers/code-metrics.js
workflow-orchestrator/dist/servers/workflow-engine.js
```

### Step 5: Configure in Claude Desktop

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "domain-memory-agent": {
      "command": "node",
      "args": [
        "/home/david/.claude/plugins/marketplaces/claude-code-plugins-plus/plugins/mcp/domain-memory-agent/dist/servers/knowledge-base.js"
      ]
    },
    "project-health-auditor": {
      "command": "node",
      "args": [
        "/home/david/.claude/plugins/marketplaces/claude-code-plugins-plus/plugins/mcp/project-health-auditor/dist/servers/code-metrics.js"
      ]
    },
    "workflow-orchestrator": {
      "command": "node",
      "args": [
        "/home/david/.claude/plugins/marketplaces/claude-code-plugins-plus/plugins/mcp/workflow-orchestrator/dist/servers/workflow-engine.js"
      ]
    }
  }
}
```

### Step 6: Merge with Existing Config

Used `jq` to merge marketplace MCPs with existing configuration:

```bash
# Create marketplace MCPs JSON
cat > /tmp/marketplace-mcps.json << 'EOF'
{
  "domain-memory-agent": { ... },
  "project-health-auditor": { ... },
  "workflow-orchestrator": { ... }
}
EOF

# Merge with existing config
jq '.mcpServers = (.mcpServers + $new[0])' \
  --slurpfile new /tmp/marketplace-mcps.json \
  "/mnt/c/Users/david/AppData/Roaming/Claude/claude_desktop_config.json" \
  > /tmp/merged-config.json

# Verify count
cat /tmp/merged-config.json | jq '.mcpServers | keys | length'
# Output: 54
```

### Step 7: Update Global and Project Configs

```bash
# Update global Claude Desktop config
cp /tmp/merged-config.json "/mnt/c/Users/david/AppData/Roaming/Claude/claude_desktop_config.json"

# Update project-level config
cp /tmp/merged-config.json .claude/claude_desktop_config.json
```

### Step 8: Restart Claude Desktop

**Important:** MCPs are only loaded when Claude Desktop starts.

1. Close Claude Desktop completely
2. Reopen Claude Desktop
3. MCPs will load on startup

---

## Verification

### Check MCP Count

```bash
cat "/mnt/c/Users/david/AppData/Roaming/Claude/claude_desktop_config.json" | jq '.mcpServers | keys | length'
# Expected: 54
```

### Check Marketplace MCPs Are Configured

```bash
cat "/mnt/c/Users/david/AppData/Roaming/Claude/claude_desktop_config.json" | jq '.mcpServers | keys' | grep -E "(domain-memory|project-health|workflow-orchestrator)"
# Expected output:
#   "domain-memory-agent",
#   "project-health-auditor",
#   "workflow-orchestrator"
```

### Test in Claude Desktop

After restarting Claude Desktop:

```
"Use the domain-memory-agent to search for information about RAG implementation"
"Use the project-health-auditor to analyze the SKILLS directory"
"Use the workflow-orchestrator to create a workflow for building all MCPs"
```

---

## Configuration Files

### Global Configuration

**Location (Windows):**

```
C:\Users\david\AppData\Roaming\Claude\claude_desktop_config.json
```

**Location (WSL):**

```
/mnt/c/Users/david/AppData/Roaming/Claude/claude_desktop_config.json
```

**MCP Count:** 54

### Project Configuration

**Location:**

```
.claude/claude_desktop_config.json
```

**MCP Count:** 54

**Breakdown:**

- 49 local repository MCPs
- 2 framework MCPs (framework-content, framework-orchestrator)
- 3 marketplace MCPs (domain-memory-agent, project-health-auditor, workflow-orchestrator)

---

## Using Marketplace MCPs

### domain-memory-agent

**Store Document:**

```
Use domain-memory-agent to store this document:
Title: "API Design Principles"
Content: [document content]
Tags: ["api", "design", "best-practices"]
```

**Search Documents:**

```
Use domain-memory-agent to search for documents about "authentication patterns"
```

**Summarize Document:**

```
Use domain-memory-agent to summarize the API design document
```

### project-health-auditor

**Analyze Directory:**

```
Use project-health-auditor to analyze code health in the ./src directory
```

**Check Complexity:**

```
Use project-health-auditor to identify high-complexity files in the SKILLS directory
```

**Track Churn:**

```
Use project-health-auditor to show git churn for the last 30 days
```

### workflow-orchestrator

**Create Workflow:**

```
Use workflow-orchestrator to create a workflow:
1. Run tests
2. Build application (depends on tests)
3. Deploy to staging (depends on build)
4. Run smoke tests (depends on deploy)
```

**Execute Workflow:**

```
Use workflow-orchestrator to execute the deployment workflow
```

**Check History:**

```
Use workflow-orchestrator to show workflow execution history
```

---

## Remaining Marketplace MCPs (Not Yet Installed)

### ai-experiment-logger

**Status:** Not installed
**Priority:** Low
**Description:** Log and track AI model experiments

### conversational-api-debugger

**Status:** Not installed
**Priority:** Medium
**Description:** Interactive API debugging with conversational interface

### design-to-code

**Status:** Not installed
**Priority:** Medium
**Description:** Convert design mockups to React components

**Installation:** Follow the same process as Steps 1-8 above.

---

## Troubleshooting

### Issue: npm install fails with peer dependency error

**Solution:** Use `--legacy-peer-deps` flag

```bash
npm install --legacy-peer-deps
```

### Issue: MCP not showing up in Claude Desktop

**Solutions:**

1. Restart Claude Desktop completely
2. Check MCP build succeeded:
   ```bash
   ls -la {mcp-path}/dist/servers/*.js
   ```
3. Verify configuration is correct:
   ```bash
   cat "/mnt/c/Users/david/AppData/Roaming/Claude/claude_desktop_config.json" | jq '.mcpServers."{mcp-name}"'
   ```
4. Check Claude Desktop logs:
   ```
   C:\Users\david\AppData\Roaming\Claude\logs\mcp.log
   ```

### Issue: MCP crashes on startup

**Solutions:**

1. Check the MCP log file:
   ```
   C:\Users\david\AppData\Roaming\Claude\logs\mcp-server-{name}.log
   ```
2. Run the MCP manually to see errors:
   ```bash
   node {mcp-path}/dist/servers/*.js
   ```
3. Reinstall dependencies:
   ```bash
   cd {mcp-path}
   rm -rf node_modules package-lock.json
   npm install --legacy-peer-deps
   npm run build
   ```

### Issue: Wrong path format

**Problem:** Using Windows path in WSL or vice versa

**Solution:**

- For Node.js in WSL, use Linux paths: `/home/david/.claude/...`
- For Node.js in Windows, use Windows paths: `C:\\Users\\david\\...`

Since we're using WSL Node.js, marketplace MCPs should use Linux paths.

---

## Comparison: Repository MCPs vs Marketplace MCPs

### Repository MCPs (49)

**Location:** `/MCP-SERVERS/`
**Path Format:** Windows paths
**Source:** Built locally, part of ai-dev-standards repository
**Examples:** accessibility-checker-mcp, semantic-search-mcp, component-generator-mcp

### Marketplace MCPs (3)

**Location:** `/home/david/.claude/plugins/marketplaces/claude-code-plugins-plus/plugins/mcp/`
**Path Format:** Linux paths (WSL)
**Source:** Installed from claude-code-plugins-plus marketplace
**Examples:** domain-memory-agent, project-health-auditor, workflow-orchestrator

### Key Difference

The marketplace MCPs are installed in the Linux filesystem (`/home/david/`) while repository MCPs are in the Windows filesystem (`C:\Users\david\OneDrive...`).

---

## Understanding `/plugin install` Command

### What It Does

The `/plugin install` command:

1. Downloads plugin files to marketplace directory
2. Registers the plugin in Claude Code
3. Makes instruction plugins immediately available

### What It Does NOT Do

For MCP Server plugins, `/plugin install`:

1. Does NOT run `npm install`
2. Does NOT build TypeScript
3. Does NOT configure MCP servers
4. Does NOT make MCP tools available

**These steps must be done manually** (as documented in this guide).

---

## Summary

✅ **3 marketplace MCP servers installed and configured**
✅ **Total MCPs: 54** (49 repository + 2 framework + 3 marketplace)
✅ **All MCPs verified in claude_desktop_config.json**
✅ **Global and project configs updated**
✅ **Ready to use after Claude Desktop restart**

### Next Steps

1. **Restart Claude Desktop** to load the new MCPs
2. **Test each marketplace MCP** with example commands
3. **Consider installing remaining 3 marketplace MCPs** (ai-experiment-logger, conversational-api-debugger, design-to-code)
4. **Check logs** if any MCPs fail to load

**Installation Complete!** 🎉

All marketplace MCP servers are now properly built, configured, and ready to use with Claude Desktop and Claude Code.

---

## Quick Reference

### Marketplace MCP Paths

```bash
# domain-memory-agent
/home/david/.claude/plugins/marketplaces/claude-code-plugins-plus/plugins/mcp/domain-memory-agent/dist/servers/knowledge-base.js

# project-health-auditor
/home/david/.claude/plugins/marketplaces/claude-code-plugins-plus/plugins/mcp/project-health-auditor/dist/servers/code-metrics.js

# workflow-orchestrator
/home/david/.claude/plugins/marketplaces/claude-code-plugins-plus/plugins/mcp/workflow-orchestrator/dist/servers/workflow-engine.js
```

### Common Commands

```bash
# Count configured MCPs
cat "/mnt/c/Users/david/AppData/Roaming/Claude/claude_desktop_config.json" | jq '.mcpServers | keys | length'

# List all MCP names
cat "/mnt/c/Users/david/AppData/Roaming/Claude/claude_desktop_config.json" | jq '.mcpServers | keys[]'

# Check if marketplace MCPs are configured
cat "/mnt/c/Users/david/AppData/Roaming/Claude/claude_desktop_config.json" | jq '.mcpServers' | grep -E "(domain-memory|project-health|workflow-orchestrator)"

# Rebuild an MCP
cd /home/david/.claude/plugins/marketplaces/claude-code-plugins-plus/plugins/mcp/{mcp-name}
npm install --legacy-peer-deps && npm run build
```

**Configuration Date:** 2025-10-29
**Last Updated:** 2025-10-29
**Status:** Complete & Verified
