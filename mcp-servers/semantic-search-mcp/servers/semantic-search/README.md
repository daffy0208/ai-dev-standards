# Semantic-search Server

Semantic search MCP server with vector database integration and similarity search capabilities

## Pattern: Code Execution (Advanced)

This server uses the Code Execution pattern with progressive discovery.

## Features

- **Progressive Discovery**: Tools are discovered on-demand through file navigation
- **Skill Library**: Reusable code artifacts persist across sessions
- **Token Efficiency**: Only load tool definitions when needed
- **IPython Integration**: Tools execute in sandboxed Python environment

## Directory Structure

```
semantic-search-mcp/
├── servers/semantic-search/
│   ├── README.md           # This file
│   ├── tool_list.txt       # List of available tools
│   └── tools/              # Tool implementations
│       └── example_tool.py
└── skills/                 # Persistent skill library
```

## Available Tools

See `tool_list.txt` for the complete list of available tools.

## Usage

1. Agent reads `README.md` to understand the server
2. Agent reads `tool_list.txt` to see available tools
3. Agent reads specific tool files from `tools/` as needed
4. Agent generates skills that persist in `skills/`

## Adding New Tools

1. Create a new Python file in `tools/`
2. Add the tool name to `tool_list.txt`
3. Document the tool in this README

## Security

- Tools execute in sandboxed environment
- PII is automatically tokenized
- Skills are stored in isolated directory
