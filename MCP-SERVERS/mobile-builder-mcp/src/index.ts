#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

const server = new Server(
  { name: 'mobile-builder-mcp', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'configure',
      description: 'Configure mobile-builder-mcp settings',
      inputSchema: { type: 'object', properties: { projectPath: { type: 'string' } }, required: ['projectPath'] }
    }
  ]
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    return {
      content: [{ type: 'text', text: 'mobile-builder-mcp: Not yet fully implemented' }]
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
  console.error('mobile-builder-mcp running on stdio');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
