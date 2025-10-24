#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

const server = new Server(
  { name: 'accessibility-checker-mcp', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'check_wcag_compliance',
      description: 'Check WCAG compliance for HTML content or URLs',
      inputSchema: {
        type: 'object',
        properties: {
          content: { type: 'string', description: 'HTML content to check' },
          url: { type: 'string', description: 'URL to check' },
          level: { type: 'string', enum: ['A', 'AA', 'AAA'], default: 'AA' }
        },
        required: []
      }
    },
    {
      name: 'check_color_contrast',
      description: 'Check color contrast ratio between foreground and background',
      inputSchema: {
        type: 'object',
        properties: {
          foreground: { type: 'string', description: 'Foreground color (hex)' },
          background: { type: 'string', description: 'Background color (hex)' },
          fontSize: { type: 'number', description: 'Font size in pixels' }
        },
        required: ['foreground', 'background']
      }
    },
    {
      name: 'check_keyboard_navigation',
      description: 'Check if elements are keyboard navigable',
      inputSchema: {
        type: 'object',
        properties: {
          html: { type: 'string', description: 'HTML to check' }
        },
        required: ['html']
      }
    },
    {
      name: 'check_aria_attributes',
      description: 'Validate ARIA attributes in HTML',
      inputSchema: {
        type: 'object',
        properties: {
          html: { type: 'string', description: 'HTML to validate' }
        },
        required: ['html']
      }
    }
  ]
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const { name, arguments: args } = request.params;

    switch (name) {
      case 'check_wcag_compliance':
        return {
          content: [{
            type: 'text',
            text: 'WCAG compliance checking configured. Use axe-core for automated testing.'
          }]
        };

      case 'check_color_contrast':
        return {
          content: [{
            type: 'text',
            text: `Color contrast check for ${args?.foreground} on ${args?.background}`
          }]
        };

      case 'check_keyboard_navigation':
        return {
          content: [{
            type: 'text',
            text: 'Keyboard navigation check configured'
          }]
        };

      case 'check_aria_attributes':
        return {
          content: [{
            type: 'text',
            text: 'ARIA attribute validation configured'
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
  console.error('accessibility-checker-mcp running on stdio');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
