# Semantic-search MCP Server

Semantic search MCP server with vector database integration and similarity search capabilities

**Pattern:** Code Execution (Advanced)
**Progressive Discovery:** Enabled
**Skills Support:** Yes

## What This MCP Does

- 🛠️ Provides tools for semantic-search operations

- 🔄 Progressive discovery with tool file navigation
- 💾 Persistent skill library support

## Installation

```bash
# Install dependencies
cd MCP-SERVERS/semantic-search-mcp
# Code Execution pattern uses tool files - no npm install needed
```

## Setup

Add to your Claude Code MCP settings:

```json
{
  "mcpServers": {
    "semantic-search": {
      "command": "mcp-code-execution",
      "args": [
        "--servers-path",
        "/home/david/projects/ai-dev-standards/MCP-SERVERS/semantic-search-mcp/servers"
      ],
      "env": {
        "SKILLS_PATH": "/home/david/projects/ai-dev-standards/MCP-SERVERS/semantic-search-mcp/skills"
      }
    }
  }
}
```

## Usage

### Tools

```javascript
// Use the semantic-search tool
;(await semantic) -
  search_action({
    input: 'your-input-here'
  })
```

## Configuration

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

## Testing

```bash
npm test
```

## Development

To test the MCP server locally:

```bash
npm start
```

## License

MIT
