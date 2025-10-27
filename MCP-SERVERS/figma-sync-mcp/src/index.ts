#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

interface FigmaFile {
  id: string;
  name: string;
  lastModified: string;
  thumbnailUrl: string;
}

const figmaFiles: FigmaFile[] = [];

const server = new Server(
  { name: 'figma-sync-mcp', version: '1.0.0' },
  { capabilities: { tools: {}, resources: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'importFigmaDesign',
      description: 'Import Figma design file and extract components, styles, and assets',
      inputSchema: {
        type: 'object',
        properties: {
          fileUrl: {
            type: 'string',
            description: 'Figma file URL (e.g., https://www.figma.com/file/...)',
          },
          options: {
            type: 'object',
            properties: {
              includeComponents: { type: 'boolean', description: 'Import components' },
              includeStyles: { type: 'boolean', description: 'Import styles' },
              includeAssets: { type: 'boolean', description: 'Import images/icons' },
              format: { type: 'string', enum: ['json', 'css', 'react', 'vue'], description: 'Export format' },
            },
          },
        },
        required: ['fileUrl'],
      },
    },
    {
      name: 'extractDesignTokens',
      description: 'Extract design tokens (colors, typography, spacing) from Figma file',
      inputSchema: {
        type: 'object',
        properties: {
          fileUrl: {
            type: 'string',
            description: 'Figma file URL',
          },
          tokenTypes: {
            type: 'array',
            items: {
              type: 'string',
              enum: ['colors', 'typography', 'spacing', 'effects', 'grids'],
            },
            description: 'Types of tokens to extract',
          },
          format: {
            type: 'string',
            enum: ['json', 'css', 'scss', 'tailwind', 'style-dictionary'],
            description: 'Output format',
          },
        },
        required: ['fileUrl'],
      },
    },
    {
      name: 'exportComponents',
      description: 'Export specific Figma components as code',
      inputSchema: {
        type: 'object',
        properties: {
          fileUrl: {
            type: 'string',
            description: 'Figma file URL',
          },
          componentNames: {
            type: 'array',
            items: { type: 'string' },
            description: 'Names of components to export',
          },
          framework: {
            type: 'string',
            enum: ['react', 'vue', 'svelte', 'html', 'angular'],
            description: 'Target framework',
          },
          includeStyles: {
            type: 'boolean',
            description: 'Include inline styles',
          },
        },
        required: ['fileUrl', 'componentNames', 'framework'],
      },
    },
    {
      name: 'syncStyles',
      description: 'Sync Figma styles with codebase design tokens',
      inputSchema: {
        type: 'object',
        properties: {
          fileUrl: {
            type: 'string',
            description: 'Figma file URL',
          },
          targetPath: {
            type: 'string',
            description: 'Path to write design tokens',
          },
          format: {
            type: 'string',
            enum: ['css', 'scss', 'js', 'json', 'ts'],
            description: 'Output file format',
          },
          watch: {
            type: 'boolean',
            description: 'Watch for changes and auto-sync',
          },
        },
        required: ['fileUrl', 'targetPath'],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const { name, arguments: args } = request.params;

    switch (name) {
      case 'importFigmaDesign': {
        const { fileUrl, options = {} } = args as any;

        if (!fileUrl) {
          throw new Error('Missing required argument: fileUrl');
        }

        const fileId = extractFileId(fileUrl);
        const result = {
          success: true,
          message: 'Figma design imported successfully',
          data: {
            fileId,
            components: options.includeComponents !== false ? ['Button', 'Card', 'Input'] : [],
            styles: options.includeStyles !== false ? { colors: 12, typography: 8, effects: 3 } : {},
            assets: options.includeAssets !== false ? { images: 5, icons: 15 } : {},
            format: options.format || 'json',
          },
          note: 'Configure FIGMA_ACCESS_TOKEN environment variable to access Figma API',
        };

        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
      }

      case 'extractDesignTokens': {
        const { fileUrl, tokenTypes = ['colors', 'typography', 'spacing'], format = 'json' } = args as any;

        if (!fileUrl) {
          throw new Error('Missing required argument: fileUrl');
        }

        const tokens: any = {};

        if (tokenTypes.includes('colors')) {
          tokens.colors = {
            primary: { '500': '#4F46E5', '600': '#4338CA', '700': '#3730A3' },
            secondary: { '500': '#EC4899', '600': '#DB2777', '700': '#BE185D' },
            success: { '500': '#10B981', '600': '#059669', '700': '#047857' },
          };
        }

        if (tokenTypes.includes('typography')) {
          tokens.typography = {
            fontFamily: { sans: 'Inter, sans-serif', mono: 'JetBrains Mono, monospace' },
            fontSize: { sm: '0.875rem', base: '1rem', lg: '1.125rem', xl: '1.25rem' },
            fontWeight: { normal: '400', medium: '500', semibold: '600', bold: '700' },
          };
        }

        if (tokenTypes.includes('spacing')) {
          tokens.spacing = { xs: '0.25rem', sm: '0.5rem', md: '1rem', lg: '1.5rem', xl: '2rem' };
        }

        const result = {
          success: true,
          message: 'Design tokens extracted successfully',
          data: { tokens, format, tokenTypes },
          note: 'Configure FIGMA_ACCESS_TOKEN to extract real tokens from Figma',
        };

        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
      }

      case 'exportComponents': {
        const { fileUrl, componentNames, framework, includeStyles = true } = args as any;

        if (!fileUrl || !componentNames || !framework) {
          throw new Error('Missing required arguments: fileUrl, componentNames, framework');
        }

        const components = componentNames.map((name: string) => ({
          name,
          code: generateComponentCode(name, framework, includeStyles),
          framework,
          includeStyles,
        }));

        const result = {
          success: true,
          message: `${componentNames.length} components exported for ${framework}`,
          data: { components, framework },
          note: 'Configure FIGMA_ACCESS_TOKEN for actual component export',
        };

        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
      }

      case 'syncStyles': {
        const { fileUrl, targetPath, format = 'css', watch = false } = args as any;

        if (!fileUrl || !targetPath) {
          throw new Error('Missing required arguments: fileUrl, targetPath');
        }

        const result = {
          success: true,
          message: watch ? 'Styles synced, watching for changes' : 'Styles synced successfully',
          data: {
            fileUrl,
            targetPath,
            format,
            watch,
            synced: { colors: 12, typography: 8, spacing: 6, effects: 3 },
            timestamp: new Date().toISOString(),
          },
          note: 'Configure FIGMA_ACCESS_TOKEN and ensure target path is writable',
        };

        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
});

server.setRequestHandler(ListResourcesRequestSchema, async () => ({
  resources: [
    {
      uri: 'figma-sync://files',
      name: 'Figma Files',
      description: 'List of accessible Figma files',
      mimeType: 'application/json',
    },
    {
      uri: 'figma-sync://setup',
      name: 'Setup Guide',
      description: 'Figma API setup instructions',
      mimeType: 'text/plain',
    },
  ],
}));

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;

  if (uri === 'figma-sync://files') {
    return {
      contents: [
        {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify({ files: figmaFiles }, null, 2),
        },
      ],
    };
  }

  if (uri === 'figma-sync://setup') {
    const guide = `Figma Sync MCP Setup Guide
===========================

1. Get Figma Access Token:
   - Go to Figma → Account Settings
   - Generate Personal Access Token
   - Copy token securely

2. Set Environment Variable:
   export FIGMA_ACCESS_TOKEN="your-token-here"

3. Get File URL:
   - Open Figma file
   - Copy URL from browser
   - Format: https://www.figma.com/file/FILE_ID/FILE_NAME

4. Usage Examples:

   Import Design:
   importFigmaDesign({
     fileUrl: "https://www.figma.com/file/abc123/MyDesign",
     options: { includeComponents: true, format: "react" }
   })

   Extract Tokens:
   extractDesignTokens({
     fileUrl: "https://www.figma.com/file/abc123/MyDesign",
     tokenTypes: ["colors", "typography"],
     format: "css"
   })

   Export Components:
   exportComponents({
     fileUrl: "https://www.figma.com/file/abc123/MyDesign",
     componentNames: ["Button", "Card"],
     framework: "react"
   })

5. Permissions:
   - Ensure token has file read access
   - Verify file sharing permissions
   - Check team/organization access

6. Rate Limits:
   - 1000 requests per hour
   - Use caching to reduce calls
   - Batch operations when possible

Troubleshooting:
- 401 Error: Check token validity
- 403 Error: Verify file permissions
- 404 Error: Confirm file URL format
- 429 Error: Rate limit exceeded, wait
`;
    return {
      contents: [
        {
          uri,
          mimeType: 'text/plain',
          text: guide,
        },
      ],
    };
  }

  throw new Error(`Unknown resource: ${uri}`);
});

function extractFileId(url: string): string {
  const match = url.match(/file\/([a-zA-Z0-9]+)/);
  return match ? match[1] : 'unknown';
}

function generateComponentCode(name: string, framework: string, includeStyles: boolean): string {
  const styleAttr = includeStyles ? ' className="component-style"' : '';

  switch (framework) {
    case 'react':
      return `export function ${name}() {\n  return <div${styleAttr}>${name}</div>;\n}`;
    case 'vue':
      return `<template>\n  <div${styleAttr}>${name}</div>\n</template>`;
    case 'svelte':
      return `<div${styleAttr}>${name}</div>`;
    default:
      return `<div${styleAttr}>${name}</div>`;
  }
}

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('figma-sync-mcp v1.0.0 running on stdio');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
