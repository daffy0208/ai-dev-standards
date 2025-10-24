#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

const server = new Server(
  { name: 'component-generator-mcp', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'generate_component',
      description: 'Generate a React/Next.js component with TypeScript, tests, and stories',
      inputSchema: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Component name (PascalCase)' },
          props: {
            type: 'object',
            description: 'Component props with types',
            additionalProperties: true
          },
          includeTests: { type: 'boolean', default: true },
          includeStories: { type: 'boolean', default: true },
          outputDir: { type: 'string', default: './components' }
        },
        required: ['name']
      }
    },
    {
      name: 'generate_hook',
      description: 'Generate a custom React hook with TypeScript',
      inputSchema: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Hook name (camelCase with use prefix)' },
          params: { type: 'object', description: 'Hook parameters' },
          outputDir: { type: 'string', default: './hooks' }
        },
        required: ['name']
      }
    },
    {
      name: 'generate_context',
      description: 'Generate a React context provider with TypeScript',
      inputSchema: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Context name (PascalCase)' },
          state: { type: 'object', description: 'Context state shape' },
          outputDir: { type: 'string', default: './contexts' }
        },
        required: ['name']
      }
    },
    {
      name: 'generate_page',
      description: 'Generate a Next.js page component',
      inputSchema: {
        type: 'object',
        properties: {
          path: { type: 'string', description: 'Page route path' },
          layout: { type: 'string', enum: ['default', 'dashboard', 'auth'] },
          outputDir: { type: 'string', default: './app' }
        },
        required: ['path']
      }
    }
  ]
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const { name, arguments: args } = request.params;

    switch (name) {
      case 'generate_component':
        return {
          content: [{
            type: 'text',
            text: `Component generation configured for: ${args?.name}\nOutputDir: ${args?.outputDir || './components'}`
          }]
        };

      case 'generate_hook':
        return {
          content: [{
            type: 'text',
            text: `Hook generation configured for: ${args?.name}`
          }]
        };

      case 'generate_context':
        return {
          content: [{
            type: 'text',
            text: `Context generation configured for: ${args?.name}`
          }]
        };

      case 'generate_page':
        return {
          content: [{
            type: 'text',
            text: `Page generation configured for path: ${args?.path}`
          }]
        };

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
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
  console.error('component-generator-mcp running on stdio');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
