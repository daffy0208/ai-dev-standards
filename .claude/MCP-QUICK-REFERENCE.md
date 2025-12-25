# MCP Quick Reference

## 🚀 Quick Start

### To Use MCPs

**In Claude Desktop:**

```
"Use the {mcp-name} to {action}"
```

**Example:**

```
"Use the semantic-search-mcp to search for RAG documentation"
"Use the component-generator-mcp to create a React button component"
"Use the security-scanner-mcp to check for vulnerabilities"
```

---

## 📋 Configured MCPs (54)

### Marketplace MCPs (3)

- `domain-memory-agent` - Knowledge base with semantic search
- `project-health-auditor` - Code health and complexity analysis
- `workflow-orchestrator` - DAG-based workflow automation

---

## 📦 Repository MCPs (49)

### AI & Knowledge (4)

- `embedding-generator-mcp` - Generate embeddings
- `semantic-search-mcp` - Semantic search
- `vector-database-mcp` - Vector DB operations
- `graph-database-mcp` - Graph DB management

### Development (8)

- `agent-orchestrator-mcp` - Multi-agent coordination
- `api-validator-mcp` - API validation
- `code-quality-scanner-mcp` - Code quality
- `component-generator-mcp` - Component generation
- `database-migration-mcp` - DB migrations
- `deployment-orchestrator-mcp` - Deployments
- `doc-generator-mcp` - Documentation
- `openapi-generator-mcp` - OpenAPI specs

### Design & UI (6)

- `3d-asset-manager-mcp` - 3D models
- `animation-library-mcp` - Animations
- `asset-optimizer-mcp` - Asset optimization
- `design-token-manager-mcp` - Design tokens
- `dark-matter-analyzer-mcp` - Repository analysis
- `wireframe-generator-mcp` - Wireframes

### Testing & Quality (5)

- `accessibility-checker-mcp` - WCAG compliance
- `performance-profiler-mcp` - Performance
- `screenshot-testing-mcp` - Visual regression
- `security-scanner-mcp` - Security scanning
- `test-runner-mcp` - Test execution

### Product & Analytics (3)

- `feature-prioritizer-mcp` - Feature priorities
- `market-analyzer-mcp` - Market analysis
- `user-insight-analyzer-mcp` - User insights

### Media & Content (4)

- `audio-processor-mcp` - Audio processing
- `video-optimizer-mcp` - Video optimization
- `streaming-setup-mcp` - Live streaming
- `seo-analyzer-mcp` - SEO analysis

### Specialized (4)

- `chart-builder-mcp` - Data visualization
- `i18n-manager-mcp` - Internationalization
- `iot-device-manager-mcp` - IoT devices
- `mobile-builder-mcp` - Mobile apps

---

## 🔧 Configuration Files

### Project-Level

`.claude/mcp-settings.json`

### Global

`C:\Users\{username}\AppData\Roaming\Claude\claude_desktop_config.json`

---

## 🐛 Troubleshooting

### MCPs Not Loading?

1. **Restart Claude Desktop**
2. **Check logs:** `AppData/Roaming/Claude/logs/mcp.log`
3. **Rebuild if needed:**
   ```bash
   cd mcp-servers/{mcp-name}
   npm install && npm run build
   ```

### Verify MCPs Are Loaded

```
ListMcpResourcesTool
```

---

## 📚 Documentation

- **Full Guide:** `docs/MCP-CONFIGURATION-GUIDE.md`
- **Registry:** `meta/mcp-registry.json`
- **Individual READMEs:** `mcp-servers/{mcp-name}/README.md`

---

## ✅ Status

**Configured:** 54 MCPs (49 repository + 2 framework + 3 marketplace)
**Status:** Ready to use
**Last Updated:** 2025-10-29

### Breakdown

- Repository MCPs: 49
- Framework MCPs: 2 (framework-content, framework-orchestrator)
- Marketplace MCPs: 3 (domain-memory-agent, project-health-auditor, workflow-orchestrator)
