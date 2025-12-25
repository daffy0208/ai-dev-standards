# Semantic-search MCP Server

Semantic search MCP server with vector database integration and similarity search capabilities

**Pattern:** Code Execution (Advanced)  
**Vector store:** Pinecone (auto-fallback to in-memory for local testing)  
**Skills Support:** Yes

## Capabilities

- 🛠️ Tools for indexing documents, running semantic or hybrid search, reranking, and extracting citations
- 🔌 Uses Pinecone when `PINECONE_API_KEY` and `PINECONE_INDEX` are provided
- 🧪 Falls back to an in-memory vector store for local experimentation/testing
- 🔄 Progressive discovery via tool files

## Setup

Add to your Claude Code MCP settings (update paths as needed):

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

When `PINECONE_API_KEY` and `PINECONE_INDEX` are not set the server keeps documents inside the MCP process. That is useful for local testing but **not** production-ready.

## Testing

Unit tests (including vector-store smoke tests) run with the root test command:

```bash
npm test
```

Use `PINECONE_API_KEY`/`PINECONE_INDEX` environment variables when you want the tests to hit a live index. Without them, the tests automatically use the in-memory store.

For the Docker code-execution pattern validation:

```bash
# Builds the mcp-sandbox image (if needed) and runs python tools inside the sandbox
npm run test:semantic-search:docker
```

Optional Pinecone verification is triggered automatically when `PINECONE_API_KEY`, `PINECONE_INDEX`, and `PINECONE_DIMENSION` are set. The script skips the live test otherwise.

For a full walkthrough (CLI suites, docker smoke test, and direct tool invocation), see [Semantic Search MCP Usage](../../docs/SEMANTIC-SEARCH-USAGE.md).

## License

MIT
