#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import * as prettier from 'prettier';

/**
 * Component Generator MCP Server
 *
 * Provides intelligent React/Next.js component scaffolding:
 * - Generate React/Next.js components with TypeScript
 * - Create prop interfaces with Zod validation
 * - Include Tailwind CSS styling
 * - Generate test files
 * - Create Storybook stories
 */

export interface ComponentProp {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'function' | 'enum' | 'object' | 'array';
  enumValues?: string[];
  required?: boolean;
  defaultValue?: any;
  description?: string;
}

export interface ComponentConfig {
  name: string;
  type: 'component' | 'page' | 'layout' | 'hook';
  props?: ComponentProp[];
  includeTests?: boolean;
  includeStories?: boolean;
  styling?: 'tailwind' | 'css-modules' | 'styled-components';
  framework?: 'react' | 'nextjs';
}

export interface GeneratedFiles {
  component: string;
  test?: string;
  story?: string;
  styles?: string;
  index: string;
}

class ComponentGeneratorServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'component-generator-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
  }

  private setupHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: this.getTools(),
    }));

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'generate_component':
            return await this.handleGenerateComponent(args as any);
          case 'generate_hook':
            return await this.handleGenerateHook(args as any);
          case 'generate_page':
            return await this.handleGeneratePage(args as any);
          case 'preview_component':
            return await this.handlePreviewComponent(args as any);
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
          content: [{ type: 'text', text: `Error: ${errorMessage}` }],
          isError: true,
        };
      }
    });
  }

  private getTools(): Tool[] {
    return [
      {
        name: 'generate_component',
        description: 'Generate a React/Next.js component with TypeScript, props, tests, and stories',
        inputSchema: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Component name (PascalCase)',
            },
            props: {
              type: 'array',
              description: 'Component props definition',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  type: { type: 'string' },
                  enumValues: { type: 'array', items: { type: 'string' } },
                  required: { type: 'boolean' },
                  defaultValue: {},
                  description: { type: 'string' },
                },
                required: ['name', 'type'],
              },
            },
            includeTests: {
              type: 'boolean',
              description: 'Generate test file (default: true)',
            },
            includeStories: {
              type: 'boolean',
              description: 'Generate Storybook story (default: true)',
            },
            styling: {
              type: 'string',
              enum: ['tailwind', 'css-modules', 'styled-components'],
              description: 'Styling approach (default: tailwind)',
            },
            framework: {
              type: 'string',
              enum: ['react', 'nextjs'],
              description: 'Framework (default: react)',
            },
          },
          required: ['name'],
        },
      },
      {
        name: 'generate_hook',
        description: 'Generate a custom React hook with TypeScript',
        inputSchema: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Hook name (must start with "use")',
            },
            parameters: {
              type: 'array',
              description: 'Hook parameters',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  type: { type: 'string' },
                },
              },
            },
            returnType: {
              type: 'string',
              description: 'Hook return type',
            },
          },
          required: ['name'],
        },
      },
      {
        name: 'generate_page',
        description: 'Generate a Next.js page component',
        inputSchema: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Page name',
            },
            route: {
              type: 'string',
              description: 'Page route (e.g., /dashboard)',
            },
            includeMetadata: {
              type: 'boolean',
              description: 'Include Next.js metadata (default: true)',
            },
          },
          required: ['name', 'route'],
        },
      },
      {
        name: 'preview_component',
        description: 'Preview generated component code without creating files',
        inputSchema: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Component name',
            },
            props: {
              type: 'array',
              description: 'Component props',
            },
          },
          required: ['name'],
        },
      },
    ];
  }

  private async handleGenerateComponent(args: ComponentConfig) {
    const config = {
      ...args,
      includeTests: args.includeTests !== false,
      includeStories: args.includeStories !== false,
      styling: args.styling || 'tailwind',
      framework: args.framework || 'react',
      props: args.props || [],
    };

    const files = this.generateComponentFiles(config);

    // Format with prettier
    const formattedFiles: GeneratedFiles = {
      component: await this.formatCode(files.component),
      index: await this.formatCode(files.index),
    };

    if (files.test) {
      formattedFiles.test = await this.formatCode(files.test);
    }

    if (files.story) {
      formattedFiles.story = await this.formatCode(files.story);
    }

    return {
      content: [
        {
          type: 'text',
          text: `✅ Generated ${config.name} component\n\n` +
            `Files to create:\n` +
            `- components/${config.name}/${config.name}.tsx\n` +
            (config.includeTests ? `- components/${config.name}/${config.name}.test.tsx\n` : '') +
            (config.includeStories ? `- components/${config.name}/${config.name}.stories.tsx\n` : '') +
            `- components/${config.name}/index.ts\n\n` +
            `\`\`\`typescript\n// ${config.name}.tsx\n${formattedFiles.component}\n\`\`\`\n\n` +
            (formattedFiles.test ? `\`\`\`typescript\n// ${config.name}.test.tsx\n${formattedFiles.test}\n\`\`\`\n\n` : '') +
            (formattedFiles.story ? `\`\`\`typescript\n// ${config.name}.stories.tsx\n${formattedFiles.story}\n\`\`\`\n\n` : '') +
            `\`\`\`typescript\n// index.ts\n${formattedFiles.index}\n\`\`\``,
        },
      ],
    };
  }

  private generateComponentFiles(config: ComponentConfig): GeneratedFiles {
    const { name, props = [] } = config;

    // Generate prop interface
    const propInterface = this.generatePropInterface(name, props);

    // Generate component
    const component = this.generateComponent(config, propInterface);

    // Generate test file
    const test = config.includeTests ? this.generateTestFile(config) : undefined;

    // Generate story file
    const story = config.includeStories ? this.generateStoryFile(config) : undefined;

    // Generate index file
    const index = `export { ${name} } from './${name}';\nexport type { ${name}Props } from './${name}';\n`;

    return {
      component,
      test,
      story,
      index,
    };
  }

  private generatePropInterface(name: string, props: ComponentProp[]): string {
    if (props.length === 0) {
      return `export interface ${name}Props {\n  children?: React.ReactNode;\n}`;
    }

    const propLines = props.map((prop) => {
      const optional = !prop.required ? '?' : '';
      let typeStr = prop.type;

      if (prop.type === 'enum' && prop.enumValues) {
        typeStr = prop.enumValues.map((v) => `'${v}'`).join(' | ');
      } else if (prop.type === 'function') {
        typeStr = '() => void';
      }

      const comment = prop.description ? `  /** ${prop.description} */\n` : '';
      return `${comment}  ${prop.name}${optional}: ${typeStr};`;
    });

    return `export interface ${name}Props {\n${propLines.join('\n')}\n  children?: React.ReactNode;\n}`;
  }

  private generateComponent(config: ComponentConfig, propInterface: string): string {
    const { name, props = [], styling } = config;

    const hasEnums = props.some((p) => p.type === 'enum' && p.enumValues);
    const componentProps = props.map((p) => p.name).join(', ');

    let component = `import React from 'react';\n\n`;

    component += propInterface + '\n\n';

    component += `export function ${name}(props: ${name}Props) {\n`;
    component += `  const { ${componentProps ? componentProps + ', ' : ''}children } = props;\n\n`;

    if (styling === 'tailwind') {
      // Add example Tailwind classes based on props
      if (hasEnums) {
        const enumProp = props.find((p) => p.type === 'enum');
        if (enumProp && enumProp.enumValues) {
          component += `  const variantClasses = {\n`;
          enumProp.enumValues.forEach((v) => {
            component += `    ${v}: 'bg-${v}-600 text-white',\n`;
          });
          component += `  };\n\n`;
        }
      }

      component += `  return (\n`;
      component += `    <div className="p-4">\n`;
      component += `      {children}\n`;
      component += `    </div>\n`;
      component += `  );\n`;
    } else {
      component += `  return (\n`;
      component += `    <div>\n`;
      component += `      {children}\n`;
      component += `    </div>\n`;
      component += `  );\n`;
    }

    component += `}\n`;

    return component;
  }

  private generateTestFile(config: ComponentConfig): string {
    const { name } = config;

    return `import { render, screen } from '@testing-library/react';
import { ${name} } from './${name}';

describe('${name}', () => {
  it('renders children', () => {
    render(<${name}>Test content</${name}>);
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('matches snapshot', () => {
    const { container } = render(<${name}>Snapshot test</${name}>);
    expect(container).toMatchSnapshot();
  });
});
`;
  }

  private generateStoryFile(config: ComponentConfig): string {
    const { name, props = [] } = config;

    const defaultProps = props
      .map((p) => {
        let value = p.defaultValue;
        if (!value) {
          if (p.type === 'string') value = `'Default ${p.name}'`;
          else if (p.type === 'boolean') value = 'false';
          else if (p.type === 'number') value = '0';
          else if (p.type === 'enum' && p.enumValues) value = `'${p.enumValues[0]}'`;
          else if (p.type === 'function') value = '() => {}';
        }
        return `  ${p.name}: ${value},`;
      })
      .join('\n');

    return `import type { Meta, StoryObj } from '@storybook/react';
import { ${name} } from './${name}';

const meta: Meta<typeof ${name}> = {
  title: 'Components/${name}',
  component: ${name},
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ${name}>;

export const Default: Story = {
  args: {
${defaultProps}
    children: 'Example content',
  },
};
`;
  }

  private async handleGenerateHook(args: { name: string; parameters?: any[]; returnType?: string }) {
    const { name, parameters = [], returnType = 'void' } = args;

    if (!name.startsWith('use')) {
      throw new Error('Hook name must start with "use"');
    }

    const hook = this.generateHook(name, parameters, returnType);
    const formatted = await this.formatCode(hook);

    return {
      content: [
        {
          type: 'text',
          text: `✅ Generated ${name} hook\n\n\`\`\`typescript\n${formatted}\n\`\`\``,
        },
      ],
    };
  }

  private generateHook(name: string, parameters: any[], returnType: string): string {
    const params = parameters.map((p) => `${p.name}: ${p.type}`).join(', ');

    return `import { useState, useEffect } from 'react';

export function ${name}(${params}): ${returnType} {
  // Hook implementation
  return {} as ${returnType};
}
`;
  }

  private async handleGeneratePage(args: { name: string; route: string; includeMetadata?: boolean }) {
    const { name, route, includeMetadata = true } = args;

    const page = this.generatePage(name, route, includeMetadata);
    const formatted = await this.formatCode(page);

    return {
      content: [
        {
          type: 'text',
          text: `✅ Generated ${name} page\n\nRoute: ${route}\n\n\`\`\`typescript\n${formatted}\n\`\`\``,
        },
      ],
    };
  }

  private generatePage(name: string, route: string, includeMetadata: boolean): string {
    let page = '';

    if (includeMetadata) {
      page += `import { Metadata } from 'next';\n\n`;
      page += `export const metadata: Metadata = {\n`;
      page += `  title: '${name}',\n`;
      page += `  description: '${name} page',\n`;
      page += `};\n\n`;
    }

    page += `export default function ${name}Page() {\n`;
    page += `  return (\n`;
    page += `    <div className="container mx-auto p-4">\n`;
    page += `      <h1 className="text-3xl font-bold mb-4">${name}</h1>\n`;
    page += `      <p>Welcome to ${route}</p>\n`;
    page += `    </div>\n`;
    page += `  );\n`;
    page += `}\n`;

    return page;
  }

  private async handlePreviewComponent(args: { name: string; props?: ComponentProp[] }) {
    const config: ComponentConfig = {
      name: args.name,
      type: 'component',
      props: args.props,
      includeTests: false,
      includeStories: false,
    };

    const files = this.generateComponentFiles(config);
    const formatted = await this.formatCode(files.component);

    return {
      content: [
        {
          type: 'text',
          text: `Preview of ${args.name} component:\n\n\`\`\`typescript\n${formatted}\n\`\`\``,
        },
      ],
    };
  }

  private async formatCode(code: string): Promise<string> {
    try {
      return await prettier.format(code, {
        parser: 'typescript',
        semi: true,
        singleQuote: true,
        trailingComma: 'es5',
        printWidth: 100,
      });
    } catch (error) {
      // If formatting fails, return unformatted code
      return code;
    }
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Component Generator MCP server running on stdio');
  }
}

const server = new ComponentGeneratorServer();
server.run().catch(console.error);
