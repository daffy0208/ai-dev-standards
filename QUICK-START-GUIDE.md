# Semantic Search (Code Execution) – Quick Start

This guide walks through the current, working slice of the Code Execution pattern:

- `semantic-search-mcp` (TypeScript server + Pinecone/in-memory vector stores)
- CLI smoke validation (`doctor`, `analyze`)

Everything else is paused until this MVP lands.

---

## Prerequisites

| Requirement                 | Notes                                                                                                                              |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Node.js ≥ 18                | CLI + tests                                                                                                                        |
| Docker (optional)           | For the `mcp-sandbox` image                                                                                                        |
| Pinecone account (optional) | Set `PINECONE_API_KEY` + `PINECONE_INDEX` for real vector storage. Without them the MCP uses an in-memory store for local testing. |

Copy `.env.example` in the repo root (or your project) and fill in Pinecone keys if you have them:

```bash
cp .env.example .env
export PINECONE_API_KEY=...    # optional but recommended
export PINECONE_INDEX=...      # optional but recommended
```

---

## 1. Run CLI Smoke Tests

```bash
npm install
npm test                  # runs registry tests + CLI smoke + vector-store tests
npm run typecheck
```

If the smoke suite fails make sure `AI_DEV_SKIP_NPM_OUTDATED=1` is set (the tests do that automatically). For manual runs you can call:

```bash
AI_DEV_SKIP_NPM_OUTDATED=1 node CLI/bin/cli.js doctor
AI_DEV_SKIP_NPM_OUTDATED=1 node CLI/bin/cli.js analyze --directory .
```

---

## 2. Configure Semantic Search MCP

1. Update your Claude Code MCP settings:

```json
{
  "mcpServers": {
    "semantic-search": {
      "command": "mcp-code-execution",
      "args": [
        "--servers-path",
        "/path/to/ai-dev-standards/mcp-servers/semantic-search-mcp/servers"
      ],
      "env": {
        "SKILLS_PATH": "/path/to/ai-dev-standards/mcp-servers/semantic-search-mcp/skills",
        "PINECONE_API_KEY": "your-api-key",
        "PINECONE_INDEX": "your-index-name"
      }
    }
  }
}
```

2. If you don’t have Pinecone access yet, leave those env vars empty—the MCP will store vectors in-memory for the session (useful for local experiments, not production).

---

## 3. Run the CLI Demo (Optional)

Want to see the TypeScript server run end-to-end without wiring up an MCP client yet? Use the demo script:

```bash
npm run demo:semantic-search
```

The script:

- Configures the MCP (topK/reranker)
- Indexes three example documents using deterministic embeddings
- Runs a semantic search and prints the results as a table

Use this flow as a template for your own documents or to verify that embeddings + search behave as expected before integrating the MCP into Claude/Cursor.

## 4. Validate the Docker Sandbox

```bash
npm run test:semantic-search:docker
```

This builds the `mcp-sandbox` image (first run only), mounts the semantic-search Python tools, and executes them inside Docker. When `PINECONE_API_KEY`, `PINECONE_INDEX`, and `PINECONE_DIMENSION` are set, the script also performs a Pinecone upsert/query round trip.

GitHub Actions runs this job on the Node 20 matrix entry, but run it locally whenever you touch the sandbox Dockerfile or the Python tools.

> CI Tip: Add `PINECONE_API_KEY`, `PINECONE_INDEX`, and `PINECONE_DIMENSION` as GitHub Actions secrets to enable the live Pinecone check in the workflow.

For a full walkthrough of the CLI demo + docker validation, see [docs/SEMANTIC-SEARCH-USAGE.md](docs/SEMANTIC-SEARCH-USAGE.md).

## 5. Use the MCP

- `configure` – set defaults (`topK`, reranker options).
- `index_document` – pass `{ id, text, embedding, metadata }`. Pair it with the CLI or your own embedding pipeline.
- `search` / `hybrid_search` – send embeddings, receive ranked results. Output includes whether Pinecone or memory was used.
- `list_documents` – works only when using the in-memory store (Pinecone doesn’t expose listing via API).

For local testing you can call the handlers directly or use Claude Code’s MCP UI. When running without Pinecone, embeddings are whatever you provide—there’s no automatic embedding generation.

---

## 6. What’s Next?

1. **Finish MCP catalog** – Once semantic search is stable we’ll adapt the generator script to output real tools for vector-database, api-validator, deployment-orchestrator, and brain MCPs.
2. **CLI coverage** – Additional smoke tests (e.g., `setup`) and documentation examples.
3. **Docker validation** – End-to-end scripts that run the MCP inside `mcp-sandbox` with Pinecone credentials.

```bash
# As you use MCPs, skills will be saved here:
watch -n 5 'ls -lh skills/'
# Skills = reusable code = 85-95% token savings
```

---

## Pattern Benefits

### Code Execution vs Direct MCP

| Feature                   | Direct MCP    | Code Execution  |
| ------------------------- | ------------- | --------------- |
| Tools loaded              | All upfront   | On-demand       |
| Token usage (first run)   | Baseline      | 40-60% less     |
| Token usage (with skills) | Baseline      | 85-95% less     |
| Scalability               | ~50 tools max | 1000+ tools     |
| Setup time                | 0             | Done! (6 hours) |

**You chose Code Execution: Token efficient from day 1!**

---

## Important Files

### Documentation

- **Setup complete**: `/CODE-EXECUTION-SETUP-COMPLETE.md` (detailed)
- **This file**: Quick reference
- **Full docs**: `/docs/mcp-patterns/` (~81K words)

### Generated MCP

- **Main README**: `/mcp-servers/semantic-search-mcp/README.md`
- **Tool list**: `/mcp-servers/semantic-search-mcp/servers/semantic-search/tool_list.txt`
- **Tools**: `/mcp-servers/semantic-search-mcp/servers/semantic-search/tools/`

### Configuration

- **MCP config**: `/config/mcp-patterns.json` (Code Execution enabled)
- **Docker**: `/security/sandbox/docker-sandbox.dockerfile`
- **Skills**: `/skills/README.md`

---

## Common Tasks

### Add a New Tool to Existing MCP

```bash
# 1. Create tool file
cd mcp-servers/semantic-search-mcp/servers/semantic-search/tools
nano my_new_tool.py

# 2. Update tool list
nano ../tool_list.txt
# Add: - my_new_tool: Description

# 3. Test
docker run --rm -v $(pwd):/workspace/tools mcp-sandbox python /workspace/tools/my_new_tool.py
```

### View Skills Generated

```bash
ls -la skills/
cat skills/some_generated_skill.py
```

### Rebuild Docker Image

```bash
docker build -f security/sandbox/docker-sandbox.dockerfile -t mcp-sandbox .
```

---

## Troubleshooting

### Tool fails in Docker

```bash
# Check tool file syntax
python mcp-servers/semantic-search-mcp/servers/semantic-search/tools/vector_embed.py

# Check Docker has tool mounted
docker run --rm -v $(pwd):/workspace -it mcp-sandbox ls /workspace
```

### Skills not being created

- Skills are created BY USAGE (not automatically)
- Use your MCPs → Skills will appear in `/skills/`
- First few runs won't have skills (being learned)

### Docker image too large

```bash
# Current size: 311MB (acceptable)
# If needed, remove unused packages:
docker build -f security/sandbox/docker-sandbox.dockerfile -t mcp-sandbox-slim .
```

---

## Resources

### Learn More

1. **Pattern details**: `/docs/mcp-patterns/03-mcp-code-execution-pattern.md`
2. **Progressive discovery**: `/docs/mcp-patterns/06-mcp-progressive-discovery-patterns.md`
3. **Security**: `/docs/mcp-patterns/07-mcp-security-privacy-best-practices.md`

### Get Help

- **Brain orchestrator**: Automatic pattern selection (if enabled)
- **Documentation**: ~81K words in `/docs/mcp-patterns/`
- **Examples**: See `semantic-search-mcp` pilot

---

## Timeline

- ✅ **Week 1** (NOW): Infrastructure + first MCP complete
- 🎯 **Weeks 2-4**: Generate 5-10 priority MCPs
- 📊 **Months 2-3**: Implement logic, measure savings
- 🚀 **Months 4-12**: Complete remaining MCPs

---

**You're ready to build!** 🚀

Start with: `node scripts/generate-code-execution-mcp.cjs <mcp-name> "<description>"`
