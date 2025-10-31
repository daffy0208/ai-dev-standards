# Codex CLI Configuration for ai-dev-standards

This guide walks you through connecting the **Codex CLI** to the **ai-dev-standards** brain so you can get the same skills, MCP servers, and orchestration intelligence that Claude Code enjoys.

---

## Why Use Codex?

- ✅ Access the full ai-dev-standards brain (64 skills, 50 MCPs, capability graph)
- ✅ Run brain-first workflows directly from your terminal
- ✅ Keep automated review and planning flows in a single CLI
- ✅ Mirror the Claude Code experience while staying inside Codex
- ✅ `./setup-codex-cli.sh` now installs & compiles the brain CLI automatically

---

## Prerequisites

1. Install the Codex CLI  
   ```bash
   npm install -g @anthropics/codex-cli
   ```

2. Configure your API key  
   ```bash
   export CODEX_API_KEY="your-api-key"
   ```

3. Build the Brain MCP  
   ```bash
   cd MCP-SERVERS/brain-mcp
   npm install
   npm run build
   cd ../..
   ```

---

## Step 1 · Add Brain MCP to Codex

The Codex CLI reads MCP settings from `~/.codex/mcp-servers.json`. You can either run the setup script (recommended) or copy the configuration manually.

### Option A · Run the Setup Script
```bash
./setup-codex-cli.sh
```

### Option B · Configure Manually
```bash
mkdir -p ~/.codex
cat > ~/.codex/mcp-servers.json <<'JSON'
{
  "mcpServers": {
    "brain-mcp": {
      "command": "node",
      "args": [
        "/mnt/c/Users/david/OneDrive - Qolcom/AI/AI_Development_Projects/ai-dev-standards/MCP-SERVERS/brain-mcp/dist/index.js"
      ],
      "env": {
        "AI_DEV_STANDARDS_ROOT": "/mnt/c/Users/david/OneDrive - Qolcom/AI/AI_Development_Projects/ai-dev-standards"
      },
      "description": "Brain MCP for querying skills, MCPs, and capabilities in ai-dev-standards",
      "timeout": 30000
    }
  }
}
JSON
```

Update the paths if your repository lives somewhere else.

---

## Step 2 · Verify the Connection

```bash
codex mcp list
# Expected output includes: brain-mcp (connected)
```

Test a brain query:
```bash
codex exec "Use brain_search with keyword 'rag'"
```

You should see skills such as `rag-implementer`, `knowledge-base-manager`, and `vector-database-mcp`.

---

## Brain Tools Available

Once connected, Codex can access the same 12 tools that power the brain-first workflow:

- `brain_search` – Search skills and MCPs by keyword
- `brain_select_skills` – Get intelligent skill recommendations
- `brain_show_skill` – Inspect a skill in detail
- `brain_relationships` – Visualise dependencies
- `brain_status` – Show overall brain status
- `graph_query_by_domain` – Discover skills by domain (frontend, backend, ai…)
- `graph_query_by_effect` – Find skills by effect (implements_authentication, builds_vector_index…)
- `graph_get_dependencies` – List requirements for a capability
- `graph_find_path` – Connect two capabilities
- `graph_composition_chains` – Suggest compatible skills
- `graph_stats` – Show graph metrics
- `graph_validate` – Validate graph consistency

---

## Working the Brain-First Way in Codex

1. **Ask the Brain First**  
   ```bash
   codex exec "Use brain_search with keyword 'authentication'"
   ```
2. **Inspect Dependencies**  
   ```bash
   codex exec "Use graph_get_dependencies for skill 'security-engineer'"
   ```
3. **Implement with the Recommended Skills** – switch back to your editor once you understand what to build.

Use interactive mode if you prefer a conversation loop:
```bash
codex chat
# or
codex exec -i
```

---

## Quick Commands Cheat Sheet

```bash
codex mcp list
codex exec "Use brain_status"
codex exec "Use graph_query_by_domain with domain 'frontend'"
codex exec "Use brain_select_skills with taskDescription 'build analytics dashboard'"
```

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `codex: command not found` | Reinstall: `npm install -g @anthropics/codex-cli` |
| Authentication error | Ensure `CODEX_API_KEY` is exported |
| `brain-mcp` not listed | Re-run `./setup-codex-cli.sh` or re-create `~/.codex/mcp-servers.json` |
| Permission denied when running script | `chmod +x setup-codex-cli.sh` |
| Timeouts on complex queries | Increase `timeout` in the MCP config to `60000` |

---

## Next Steps

1. Read `.codex/QUICK-START.md` for a 5-minute walkthrough  
2. Compare workflows in `.codex/CLAUDE-VS-CODEX.md`  
3. Run `codex exec "Use brain_status"` to confirm everything works  
4. Explore skills via `META/skill-registry.json` and invoke them with Codex

---

## End-to-End Workflow (Example)

Mirror the Claude Code flow without leaving the terminal:

1. **Discover**  
   ```bash
   codex exec "Use brain_search with keyword 'authentication'"
   ```
2. **Check dependencies**  
   ```bash
   codex exec "Use graph_get_dependencies for skill 'security-engineer'"
   ```
3. **Implement**  
   Follow the skill guidance in your editor.
4. **Automated review**  
   ```bash
   ./scripts/ci/codex-review.sh src/auth/index.ts
   ```
5. **Verify fixes**  
   ```bash
   codex exec "Review the updated src/auth/index.ts. Confirm the previous issues are resolved."
   ```

This loop keeps planning, implementation, and verification aligned with the brain.

---

## Health Check

Use the repository smoke test to make sure the Brain CLI works even on shell-limited systems:

```bash
node scripts/tests/brain-mcp-smoke.cjs
```

If this passes, Codex can reach `brain-mcp` regardless of whether `/bin/bash` is installed.

> Tip: The smoke test assumes the brain CLI has been built. Running `./setup-codex-cli.sh` (or `npm run build` inside `scripts/brain`) keeps it fresh.

---

Happy building with Codex! 🚀
