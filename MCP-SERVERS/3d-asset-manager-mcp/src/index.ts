#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

const server = new Server(
  { name: '3d-asset-manager-mcp', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'configure',
      description: 'Configure 3d-asset-manager-mcp settings',
      inputSchema: { type: 'object', properties: { projectPath: { type: 'string' } }, required: ['projectPath'] }
    }
  ]
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    return {
      content: [{ type: 'text', text: '3d-asset-manager-mcp: Not yet fully implemented' }]
    };
  } catch (error) {
    return {
      content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
      isError: true
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('3d-asset-manager-mcp running on stdio');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
