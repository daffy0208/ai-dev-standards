#!/usr/bin/env node
/**
 * performance-profiler-mcp - Placeholder implementation
 * TODO: Implement full functionality
 */
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { ListToolsRequestSchema, CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';

const server = new Server({ name: 'performance-profiler-mcp', version: '1.0.0' }, { capabilities: { tools: {} } });

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: [] }));
server.setRequestHandler(CallToolRequestSchema, async (request) => ({
  content: [{ type: 'text', text: 'Not yet implemented' }]
}));

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('performance-profiler-mcp running on stdio');
}

main().catch((error) => { console.error('Server error:', error); process.exit(1); });
