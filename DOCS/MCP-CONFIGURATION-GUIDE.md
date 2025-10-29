# MCP Configuration Guide

## Overview

This guide explains how to configure and enable all MCP (Model Context Protocol) servers in the ai-dev-standards repository.

**Configuration Date:** 2025-10-29
**Total MCPs Configured:** 54 servers (49 repository + 2 framework + 3 marketplace)
**Configuration Files:** 2 (project-level + global)

---

## What Was Configured

### 1. Project-Level Configuration

**File:** `.claude/mcp-settings.json`
**Purpose:** Project-specific MCP configuration for Claude Code
**MCPs Configured:** 49 local MCPs

This file is used when working within the ai-dev-standards project directory.

### 2. Global Configuration

**File:** `~/.config/Claude/claude_desktop_config.json` (or Windows equivalent)
**Location (Windows):** `C:\Users\{username}\AppData\Roaming\Claude\claude_desktop_config.json`
**Purpose:** Global MCP configuration for Claude Desktop
**MCPs Configured:** 36 servers (34 from this repo + 2 framework servers)

This file is used across all Claude Desktop sessions.

---

## Configured MCP Servers (34 Total)

### AI & Knowledge Management (4)
1. **embedding-generator-mcp** - Generate embeddings for RAG systems
2. **semantic-search-mcp** - Semantic search capabilities
3. **vector-database-mcp** - Vector database operations
4. **graph-database-mcp** - Graph database management

### Development Tools (8)
5. **agent-orchestrator-mcp** - Multi-agent coordination
6. **api-validator-mcp** - REST/GraphQL API validation
7. **code-quality-scanner-mcp** - Code quality analysis
8. **component-generator-mcp** - React/Vue component generation
9. **database-migration-mcp** - Database schema migrations
10. **deployment-orchestrator-mcp** - Deployment automation
11. **doc-generator-mcp** - Documentation generation
12. **openapi-generator-mcp** - OpenAPI spec generation

### Design & UI (6)
13. **3d-asset-manager-mcp** - 3D model management
14. **animation-library-mcp** - Animation utilities
15. **asset-optimizer-mcp** - Image/asset optimization
16. **design-token-manager-mcp** - Design tokens management
17. **dark-matter-analyzer-mcp** - Repository analysis
18. **wireframe-generator-mcp** - UI wireframe generation

### Testing & Quality (4)
19. **accessibility-checker-mcp** - WCAG compliance checking
20. **performance-profiler-mcp** - Performance profiling
21. **screenshot-testing-mcp** - Visual regression testing
22. **security-scanner-mcp** - Security vulnerability scanning
23. **test-runner-mcp** - Test execution and reporting

### Product & Analytics (3)
24. **feature-prioritizer-mcp** - Feature prioritization (P0/P1/P2)
25. **market-analyzer-mcp** - Market analysis
26. **user-insight-analyzer-mcp** - User feedback analysis

### Media & Content (4)
27. **audio-processor-mcp** - Audio processing
28. **video-optimizer-mcp** - Video optimization
29. **streaming-setup-mcp** - Live streaming setup
30. **seo-analyzer-mcp** - SEO analysis

### Specialized (5)
31. **chart-builder-mcp** - Data visualization
32. **i18n-manager-mcp** - Internationalization
33. **iot-device-manager-mcp** - IoT device management
34. **mobile-builder-mcp** - Mobile app development

---

## Configuration Structure

Each MCP server is configured with:

```json
{
  "server-name-mcp": {
    "command": "node",
    "args": [
      "C:\\Users\\{username}\\...\\MCP-SERVERS\\{server-name}-mcp\\dist\\index.js"
    ]
  }
}
```

### Path Structure

**Windows Path Format:**
```
C:\\Users\\david\\OneDrive - Qolcom\\AI\\AI_Development_Projects\\ai-dev-standards\\MCP-SERVERS\\{mcp-name}\\dist\\index.js
```

**Linux/WSL Path Format:**
```
/mnt/c/Users/david/OneDrive - Qolcom/AI/AI_Development_Projects/ai-dev-standards/MCP-SERVERS/{mcp-name}/dist/index.js
```

---

## How to Use MCP Servers

### In Claude Desktop

After restarting Claude Desktop, MCP tools will be automatically available:

```
"Use the semantic-search-mcp to find documentation about RAG implementation"
"Use the component-generator-mcp to create a React component"
"Use the security-scanner-mcp to analyze this code for vulnerabilities"
```

### In Claude Code CLI

When working in the ai-dev-standards directory:

```bash
# MCPs are automatically loaded from .claude/mcp-settings.json
# No additional configuration needed
```

### Verifying MCPs Are Loaded

1. **Check MCP Resources:**
   ```
   ListMcpResourcesTool
   ```

2. **Check Logs:**
   - Windows: `C:\Users\{username}\AppData\Roaming\Claude\logs\mcp.log`
   - View individual server logs: `mcp-server-{name}.log`

3. **Test a Specific MCP:**
   ```
   "Use the accessibility-checker-mcp to check WCAG compliance"
   ```

---

## Troubleshooting

### Issue: MCPs Not Showing Up

**Symptoms:** MCP tools not available, ListMcpResourcesTool returns empty

**Solutions:**

1. **Restart Claude Desktop**
   - Close Claude Desktop completely
   - Reopen Claude Desktop
   - MCPs should load on startup

2. **Check Paths Are Correct**
   ```bash
   # Verify dist/index.js exists
   ls -la ./MCP-SERVERS/*/dist/index.js
   ```

3. **Rebuild MCPs**
   ```bash
   # If dist files are missing, rebuild all MCPs
   cd MCP-SERVERS
   for dir in */; do
     cd "$dir"
     npm install
     npm run build
     cd ..
   done
   ```

4. **Check Logs for Errors**
   ```bash
   # Windows
   cat C:/Users/david/AppData/Roaming/Claude/logs/mcp.log

   # Or check individual MCP logs
   cat C:/Users/david/AppData/Roaming/Claude/logs/mcp-server-*.log
   ```

### Issue: MCP Server Fails to Start

**Symptoms:** Error in logs, specific MCP not available

**Solutions:**

1. **Check Dependencies**
   ```bash
   cd MCP-SERVERS/{mcp-name}
   npm install
   ```

2. **Rebuild TypeScript**
   ```bash
   npm run build
   ```

3. **Test Manually**
   ```bash
   node dist/index.js
   ```

4. **Check Node Version**
   ```bash
   node --version  # Should be 18.0.0 or higher
   ```

### Issue: Wrong Paths in Configuration

**Symptoms:** Path not found errors in logs

**Solutions:**

1. **Update Paths in Config**
   - Edit `.claude/mcp-settings.json`
   - Use absolute paths
   - Use Windows path format (`C:\\Users\\...`)

2. **Verify Path Exists**
   ```bash
   # Check if file exists
   ls -la "C:\Users\david\OneDrive - Qolcom\AI\AI_Development_Projects\ai-dev-standards\MCP-SERVERS\{mcp-name}\dist\index.js"
   ```

---

## Building MCPs

### Build All MCPs

```bash
# From repository root
cd MCP-SERVERS

# Build all
for dir in */; do
  echo "Building $dir..."
  cd "$dir"
  npm install
  npm run build
  cd ..
done
```

### Build Single MCP

```bash
cd MCP-SERVERS/{mcp-name}
npm install
npm run build
```

### Development Mode

```bash
# Watch mode for active development
cd MCP-SERVERS/{mcp-name}
npm run dev
```

---

## Adding New MCPs

### 1. Create MCP Directory

```bash
mkdir MCP-SERVERS/my-new-mcp
cd MCP-SERVERS/my-new-mcp
```

### 2. Initialize Package

```bash
npm init -y
```

### 3. Add to Configuration

Add to `.claude/mcp-settings.json`:

```json
{
  "mcpServers": {
    "my-new-mcp": {
      "command": "node",
      "args": [
        "C:\\Users\\david\\...\\MCP-SERVERS\\my-new-mcp\\dist\\index.js"
      ]
    }
  }
}
```

### 4. Update Registry

Add to `META/mcp-registry.json`:

```json
{
  "id": "my-new-mcp",
  "name": "My New MCP",
  "description": "Description of what it does",
  "category": "category-name",
  "supports_skills": ["related-skill"],
  "features": ["tools", "resources"],
  "path": "/MCP-SERVERS/my-new-mcp",
  "status": "active",
  "capabilities": [
    "Capability 1",
    "Capability 2"
  ]
}
```

### 5. Restart Claude Desktop

Close and reopen Claude Desktop to load the new MCP.

---

## Configuration Files

### Project-Level Configuration

**Location:** `.claude/mcp-settings.json`

```json
{
  "mcpServers": {
    "server-name": {
      "command": "node",
      "args": ["path/to/dist/index.js"]
    }
  }
}
```

### Global Configuration

**Location (Windows):** `C:\Users\{username}\AppData\Roaming\Claude\claude_desktop_config.json`

**Location (macOS):** `~/Library/Application Support/Claude/claude_desktop_config.json`

**Location (Linux):** `~/.config/Claude/claude_desktop_config.json`

Same structure as project-level configuration.

---

## Best Practices

### 1. Keep Paths Absolute

Always use absolute paths in configuration:
```json
"args": ["C:\\Users\\...\\full\\path\\to\\index.js"]
```

### 2. Use Windows Path Format

Even in WSL, use Windows path format with escaped backslashes:
```json
"C:\\Users\\david\\..."
```

### 3. Restart After Changes

Always restart Claude Desktop after configuration changes.

### 4. Check Logs

Review logs after restart to verify MCPs loaded successfully.

### 5. Test Incrementally

When adding multiple MCPs, add a few at a time and test before adding more.

### 6. Backup Configurations

Keep backups of working configurations:
```bash
cp claude_desktop_config.json claude_desktop_config.json.backup
```

---

## Skill-to-MCP Mapping

Each skill in the repository is supported by one or more MCPs:

| Skill | Supporting MCPs |
|-------|----------------|
| **3d-visualizer** | 3d-asset-manager-mcp |
| **accessibility-engineer** | accessibility-checker-mcp |
| **api-designer** | api-validator-mcp, openapi-generator-mcp |
| **rag-implementer** | embedding-generator-mcp, semantic-search-mcp, vector-database-mcp |
| **performance-optimizer** | performance-profiler-mcp |
| **security-engineer** | security-scanner-mcp |
| **testing-strategist** | test-runner-mcp, screenshot-testing-mcp |
| **mvp-builder** | feature-prioritizer-mcp |
| **multi-agent-architect** | agent-orchestrator-mcp |
| **knowledge-graph-builder** | graph-database-mcp |

See `META/mcp-registry.json` for complete mapping.

---

## Performance Considerations

### MCP Startup Time

- Each MCP adds ~100-500ms to Claude Desktop startup
- 34 MCPs ≈ 3-17 seconds additional startup time
- Acceptable for development workflow

### Memory Usage

- Each MCP: ~50-200MB RAM
- 34 MCPs: ~1.7-6.8GB total RAM
- Ensure sufficient system memory

### Selective Loading

To reduce resource usage, comment out unused MCPs:

```json
{
  "mcpServers": {
    "frequently-used-mcp": { ... },
    // "rarely-used-mcp": { ... }  // Commented out
  }
}
```

---

## Support

### Documentation

- **MCP Registry:** `META/mcp-registry.json`
- **Individual READMEs:** `MCP-SERVERS/{mcp-name}/README.md`
- **Skill Documentation:** `SKILLS/{skill-name}/SKILL.md`

### Logs

- **Main Log:** `AppData/Roaming/Claude/logs/mcp.log`
- **Server Logs:** `AppData/Roaming/Claude/logs/mcp-server-{name}.log`

### Issues

- Repository Issues: https://github.com/daffy0208/ai-dev-standards/issues
- Claude Desktop Issues: https://github.com/anthropics/claude-code/issues

---

## Summary

✅ **34 MCP servers configured and enabled**
✅ **Project-level configuration created** (`.claude/mcp-settings.json`)
✅ **Global configuration updated** (`claude_desktop_config.json`)
✅ **All configurations use absolute Windows paths**
✅ **Backup of original configuration created**

**Next Steps:**
1. Restart Claude Desktop to load MCPs
2. Verify MCPs are available with `ListMcpResourcesTool`
3. Test specific MCPs with your skills
4. Check logs if any issues occur

**Configuration Complete!** 🎉

All 34 MCP servers from the ai-dev-standards repository are now configured and ready to use with Claude Desktop and Claude Code.
