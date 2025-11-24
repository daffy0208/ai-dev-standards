# Semantic Search MCP Usage Guide

Hands-on instructions for exercising the `semantic-search-mcp` without waiting for a full AI assistant integration. These steps show how to run the CLI smoke tests, validate the Docker code-execution workflow, and invoke the MCP tools directly.

## Prerequisites

- Node.js 18+ (Node 20 recommended for CI parity)
- Docker Desktop or compatible engine (required for the sandbox smoke test)
- Optional: Pinecone account (`PINECONE_API_KEY`, `PINECONE_INDEX`, and `PINECONE_DIMENSION`) if you want to validate live vector storage

## 1. CLI Suites (TypeScript + MCP e2e)

```bash
npm run test:cli
```

This covers:

- DI-enabled CLI commands (`doctor`, `analyze`, `setup`, `sync`, `context`, `update`, etc.)
- Semantic-search in-memory e2e test (`tests/cli/semantic-search-e2e.test.ts`)

The suite runs automatically in GitHub Actions and should be green before every commit.

## 2. Docker Code-Execution Smoke Test

```bash
# Builds the mcp-sandbox image (first run) and executes the Python tools inside it
npm run test:semantic-search:docker
```

What it does:

1. Builds `mcp-sandbox` from `SECURITY/sandbox/docker-sandbox.dockerfile` if the image is missing.
2. Mounts `MCP-SERVERS/semantic-search-mcp/servers/semantic-search/tools` read-only.
3. Runs `vector_embed.py` and `index_documents.py` via `docker run ... python /workspace/tools/<tool>.py`.
4. (Optional) If `PINECONE_*` env vars are set, performs a round-trip upsert/query against the configured Pinecone index to verify the live vector store path.

Use this command any time you modify the Python toolchain or sandbox Dockerfile. GitHub Actions runs it on the Node 20 job.

## 3. Direct MCP Invocation (Index + Search Demo)

For fast local experimentation, run the example script that imports the TypeScript server, indexes sample documents, and runs a search:

```bash
npm run demo:semantic-search
```

Demo flow:

1. Configures the server (`configure` tool).
2. Indexes three example documents via `index_document`.
3. Executes the `search` tool with a deterministic embedding helper.
4. Prints a table of the top hits (IDs, scores, titles, sources).

You can adapt the script with your own documents or wire it into other workflows until a full MCP client is available.

## 4. Pinecone Validation (Optional)

To hit a live Pinecone index in either the CLI demo or the docker smoke test:

```bash
export PINECONE_API_KEY=...
export PINECONE_INDEX=...
export PINECONE_DIMENSION=1536   # Must match your index dimensions
```

The scripts automatically fall back to the in-memory vector store when these variables are absent.

### CI Configuration

In GitHub Actions we read the same variables from repository secrets so the docker smoke test can run a live Pinecone query when credentials are available. Add the following secrets in **Settings → Secrets → Actions**:

| Secret               | Description                                |
| -------------------- | ------------------------------------------ |
| `PINECONE_API_KEY`   | Your Pinecone API key                      |
| `PINECONE_INDEX`     | Target index name                          |
| `PINECONE_DIMENSION` | Dimension count for the index (e.g., 1536) |

If the secrets are missing the workflow falls back to the in-memory store and still passes.

## Troubleshooting

- **Docker not found:** Install Docker Desktop or make sure `docker` is on your PATH.
- **Permission denied on bind mount:** On Linux, ensure your user has read permissions for the repo or run with `sudo docker ...`.
- **Pinecone mismatch:** Set `PINECONE_DIMENSION` to the exact dimension configured for your Pinecone index; otherwise queries will fail.

## Next Steps

- Wire the MCP into Claude/Cursor via `.claude/mcp-settings.json` using the instructions in `MCP-SERVERS/semantic-search-mcp/README.md`.
- Extend the docker smoke script when new Python tools are added.
- Once Pinecone validation is reliable, capture a CI secret to run the live smoke test automatically.
