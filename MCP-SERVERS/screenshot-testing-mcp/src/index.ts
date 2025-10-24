#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

const server = new Server(
  { name: 'screenshot-testing-mcp', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'capture_screenshot',
      description: 'Capture a screenshot of a URL or component',
      inputSchema: {
        type: 'object',
        properties: {
          url: { type: 'string', description: 'URL to capture' },
          name: { type: 'string', description: 'Screenshot name' },
          viewport: {
            type: 'object',
            properties: {
              width: { type: 'number', default: 1280 },
              height: { type: 'number', default: 720 }
            }
          },
          fullPage: { type: 'boolean', default: false },
          outputDir: { type: 'string', default: './.screenshots/baseline' }
        },
        required: ['url', 'name']
      }
    },
    {
      name: 'compare_screenshots',
      description: 'Compare two screenshots for visual regression',
      inputSchema: {
        type: 'object',
        properties: {
          baseline: { type: 'string', description: 'Path to baseline image' },
          current: { type: 'string', description: 'Path to current image' },
          threshold: { type: 'number', description: 'Difference threshold percentage', default: 0.1 },
          outputDiff: { type: 'string', description: 'Path to save diff image' }
        },
        required: ['baseline', 'current']
      }
    },
    {
      name: 'capture_responsive',
      description: 'Capture screenshots at multiple viewport sizes',
      inputSchema: {
        type: 'object',
        properties: {
          url: { type: 'string', description: 'URL to capture' },
          name: { type: 'string', description: 'Base screenshot name' },
          viewports: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                width: { type: 'number' },
                height: { type: 'number' },
                name: { type: 'string' }
              }
            },
            default: [
              { width: 375, height: 667, name: 'mobile' },
              { width: 768, height: 1024, name: 'tablet' },
              { width: 1920, height: 1080, name: 'desktop' }
            ]
          }
        },
        required: ['url', 'name']
      }
    },
    {
      name: 'capture_themes',
      description: 'Capture screenshots in different themes (light/dark)',
      inputSchema: {
        type: 'object',
        properties: {
          url: { type: 'string', description: 'URL to capture' },
          name: { type: 'string', description: 'Base screenshot name' },
          themes: {
            type: 'array',
            items: { type: 'string' },
            default: ['light', 'dark']
          }
        },
        required: ['url', 'name']
      }
    },
    {
      name: 'update_baseline',
      description: 'Update baseline screenshot with current version',
      inputSchema: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Screenshot name to update' }
        },
        required: ['name']
      }
    }
  ]
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const { name, arguments: args } = request.params;

    switch (name) {
      case 'capture_screenshot':
        return {
          content: [{
            type: 'text',
            text: `Screenshot capture configured for: ${args?.url}\nName: ${args?.name}\nViewport: ${JSON.stringify(args?.viewport || { width: 1280, height: 720 })}`
          }]
        };

      case 'compare_screenshots':
        return {
          content: [{
            type: 'text',
            text: `Screenshot comparison configured\nBaseline: ${args?.baseline}\nCurrent: ${args?.current}\nThreshold: ${args?.threshold || 0.1}%`
          }]
        };

      case 'capture_responsive':
        return {
          content: [{
            type: 'text',
            text: `Responsive capture configured for: ${args?.url}\nViewports: ${JSON.stringify(args?.viewports || ['mobile', 'tablet', 'desktop'])}`
          }]
        };

      case 'capture_themes':
        return {
          content: [{
            type: 'text',
            text: `Theme capture configured for: ${args?.url}\nThemes: ${JSON.stringify(args?.themes || ['light', 'dark'])}`
          }]
        };

      case 'update_baseline':
        return {
          content: [{
            type: 'text',
            text: `Baseline update configured for: ${args?.name}`
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
  console.error('screenshot-testing-mcp running on stdio');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
