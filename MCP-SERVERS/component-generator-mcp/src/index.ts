#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import Handlebars from 'handlebars';
import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import * as prettier from 'prettier';

/**
 * Component Generator MCP Server
 *
 * Provides tools for scaffolding React/Next.js components:
 * - Generate component with TypeScript + Zod validation
 * - Generate test files
 * - Generate Storybook stories
 * - Customize templates and output directory
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface ComponentConfig {
  name: string;
  description?: string;
  props?: Record<string, PropDefinition>;
  outputDir?: string;
  framework?: 'react' | 'nextjs';
  styling?: 'tailwind' | 'css-modules' | 'styled-components';
  includeTests?: boolean;
  includeStories?: boolean;
}

interface PropDefinition {
  type: string;
  required?: boolean;
  default?: any;
  description?: string;
  enum?: string[];
}

interface GeneratorConfig {
  outputDir: string;
  framework: 'react' | 'nextjs';
  styling: 'tailwind' | 'css-modules' | 'styled-components';
}

class ComponentGeneratorServer {
  private server: Server;
  private config: GeneratorConfig = {
    outputDir: './components',
    framework: 'react',
    styling: 'tailwind',
  };
  private templates: Map<string, HandlebarsTemplateDelegate> = new Map();

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

    this.setupHandlebars();
    this.setupHandlers();
  }

  private setupHandlebars() {
    // Register helpers
    Handlebars.registerHelper('pascalCase', (str: string) => {
      return str
        .replace(/(?:^\w|[A-Z]|\b\w)/g, (letter) => letter.toUpperCase())
        .replace(/\s+/g, '')
        .replace(/-/g, '');
    });

    Handlebars.registerHelper('camelCase', (str: string) => {
      const pascal = str
        .replace(/(?:^\w|[A-Z]|\b\w)/g, (letter) => letter.toUpperCase())
        .replace(/\s+/g, '')
        .replace(/-/g, '');
      return pascal.charAt(0).toLowerCase() + pascal.slice(1);
    });

    Handlebars.registerHelper('kebabCase', (str: string) => {
      return str
        .replace(/([a-z])([A-Z])/g, '$1-$2')
        .replace(/\s+/g, '-')
        .toLowerCase();
    });

    Handlebars.registerHelper('isTestable', (propName: string, testableProps: string[]) => {
      return testableProps.includes(propName);
    });
  }

  private setupHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: this.getTools(),
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'configure':
            return await this.handleConfigure(args as any);
          case 'generate_component':
            return await this.handleGenerateComponent(args as any);
          case 'generate_test':
            return await this.handleGenerateTest(args as any);
          case 'generate_story':
            return await this.handleGenerateStory(args as any);
          case 'list_templates':
            return await this.handleListTemplates();
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
        name: 'configure',
        description: 'Configure component generator settings (output directory, framework, styling)',
        inputSchema: {
          type: 'object',
          properties: {
            outputDir: {
              type: 'string',
              description: 'Output directory for generated components (default: ./components)',
            },
            framework: {
              type: 'string',
              enum: ['react', 'nextjs'],
              description: 'Framework to generate for (default: react)',
            },
            styling: {
              type: 'string',
              enum: ['tailwind', 'css-modules', 'styled-components'],
              description: 'Styling approach (default: tailwind)',
            },
          },
        },
      },
      {
        name: 'generate_component',
        description: 'Generate a React/Next.js component with TypeScript, Zod validation, and optional tests/stories',
        inputSchema: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Component name (PascalCase)',
            },
            description: {
              type: 'string',
              description: 'Component description',
            },
            props: {
              type: 'object',
              description: 'Component props definition',
              additionalProperties: {
                type: 'object',
                properties: {
                  type: {
                    type: 'string',
                    description: 'Prop type (string, number, boolean, function, array, object)',
                  },
                  required: {
                    type: 'boolean',
                    description: 'Is prop required?',
                  },
                  default: {
                    description: 'Default value',
                  },
                  enum: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Enum values for string types',
                  },
                },
                required: ['type'],
              },
            },
            outputDir: {
              type: 'string',
              description: 'Output directory (overrides configured directory)',
            },
            includeTests: {
              type: 'boolean',
              description: 'Generate test file (default: true)',
            },
            includeStories: {
              type: 'boolean',
              description: 'Generate Storybook story (default: false)',
            },
          },
          required: ['name'],
        },
      },
      {
        name: 'generate_test',
        description: 'Generate test file for existing component',
        inputSchema: {
          type: 'object',
          properties: {
            componentName: {
              type: 'string',
              description: 'Component name',
            },
            componentPath: {
              type: 'string',
              description: 'Path to component file',
            },
          },
          required: ['componentName', 'componentPath'],
        },
      },
      {
        name: 'generate_story',
        description: 'Generate Storybook story for existing component',
        inputSchema: {
          type: 'object',
          properties: {
            componentName: {
              type: 'string',
              description: 'Component name',
            },
            componentPath: {
              type: 'string',
              description: 'Path to component file',
            },
          },
          required: ['componentName', 'componentPath'],
        },
      },
      {
        name: 'list_templates',
        description: 'List available component templates',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
    ];
  }

  private async handleConfigure(args: Partial<GeneratorConfig>) {
    if (args.outputDir) this.config.outputDir = args.outputDir;
    if (args.framework) this.config.framework = args.framework;
    if (args.styling) this.config.styling = args.styling;

    return {
      content: [
        {
          type: 'text',
          text: `Configuration updated:\n${JSON.stringify(this.config, null, 2)}`,
        },
      ],
    };
  }

  private async handleGenerateComponent(args: ComponentConfig) {
    const { name, description, props = {}, includeTests = true, includeStories = false } = args;
    const outputDir = args.outputDir || this.config.outputDir;

    // Prepare component data
    const componentData = this.prepareComponentData(name, description, props);
    const componentDir = join(outputDir, componentData.pascalName);

    try {
      // Create component directory
      await fs.mkdir(componentDir, { recursive: true });

      // Generate component file
      const componentContent = await this.generateFromTemplate('component', componentData);
      const componentPath = join(componentDir, `${componentData.pascalName}.tsx`);
      await fs.writeFile(componentPath, componentContent);

      // Generate index file
      const indexContent = await this.generateFromTemplate('index', componentData);
      const indexPath = join(componentDir, 'index.ts');
      await fs.writeFile(indexPath, indexContent);

      const generatedFiles = [componentPath, indexPath];

      // Generate test file if requested
      if (includeTests) {
        const testContent = await this.generateFromTemplate('test', componentData);
        const testPath = join(componentDir, `${componentData.pascalName}.test.tsx`);
        await fs.writeFile(testPath, testContent);
        generatedFiles.push(testPath);
      }

      // Generate story file if requested
      if (includeStories) {
        const storyContent = await this.generateFromTemplate('story', componentData);
        const storyPath = join(componentDir, `${componentData.pascalName}.stories.tsx`);
        await fs.writeFile(storyPath, storyContent);
        generatedFiles.push(storyPath);
      }

      return {
        content: [
          {
            type: 'text',
            text: `✅ Component generated successfully!\n\nFiles created:\n${generatedFiles.map((f) => `  - ${f}`).join('\n')}\n\nComponent: ${componentData.pascalName}\nLocation: ${componentDir}`,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to generate component: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async handleGenerateTest(args: { componentName: string; componentPath: string }) {
    const { componentName, componentPath } = args;
    const componentData = this.prepareComponentData(componentName, undefined, {});
    
    const testContent = await this.generateFromTemplate('test', componentData);
    const testPath = componentPath.replace(/\.tsx?$/, '.test.tsx');
    
    await fs.writeFile(testPath, testContent);

    return {
      content: [
        {
          type: 'text',
          text: `✅ Test file generated: ${testPath}`,
        },
      ],
    };
  }

  private async handleGenerateStory(args: { componentName: string; componentPath: string }) {
    const { componentName, componentPath } = args;
    const componentData = this.prepareComponentData(componentName, undefined, {});
    
    const storyContent = await this.generateFromTemplate('story', componentData);
    const storyPath = componentPath.replace(/\.tsx?$/, '.stories.tsx');
    
    await fs.writeFile(storyPath, storyContent);

    return {
      content: [
        {
          type: 'text',
          text: `✅ Story file generated: ${storyPath}`,
        },
      ],
    };
  }

  private async handleListTemplates() {
    const templates = [
      { name: 'component', description: 'React/Next.js component with TypeScript and Zod' },
      { name: 'test', description: 'Vitest test file' },
      { name: 'story', description: 'Storybook story file' },
      { name: 'index', description: 'Index export file' },
    ];

    return {
      content: [
        {
          type: 'text',
          text: `Available templates:\n${templates.map((t) => `  - ${t.name}: ${t.description}`).join('\n')}`,
        },
      ],
    };
  }

  private prepareComponentData(
    name: string,
    description?: string,
    props: Record<string, PropDefinition> = {}
  ) {
    const pascalName = name
      .replace(/(?:^\w|[A-Z]|\b\w)/g, (letter) => letter.toUpperCase())
      .replace(/\s+/g, '')
      .replace(/-/g, '');
    
    const camelName = pascalName.charAt(0).toLowerCase() + pascalName.slice(1);
    const kebabName = name
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/\s+/g, '-')
      .toLowerCase();

    const propsData = Object.entries(props).map(([key, value]) => ({
      key,
      zodType: this.getZodType(value),
      ...value,
    }));

    const propsDestructure = Object.keys(props).join(', ');
    const testableProps = Object.keys(props).filter((key) => 
      ['onClick', 'onSubmit', 'onChange'].includes(key)
    );

    const defaultArgs = Object.entries(props).reduce((acc, [key, value]) => {
      if (value.default !== undefined) {
        acc[key] = JSON.stringify(value.default);
      } else if (value.enum && value.enum.length > 0) {
        acc[key] = `'${value.enum[0]}'`;
      }
      return acc;
    }, {} as Record<string, string>);

    return {
      pascalName,
      camelName,
      kebabName,
      description,
      props: propsData.reduce((acc, prop) => {
        acc[prop.key] = prop.zodType;
        return acc;
      }, {} as Record<string, string>),
      propsDestructure,
      testableProps,
      defaultArgs,
      variants: [],
    };
  }

  private getZodType(prop: PropDefinition): string {
    const { type, required = true, default: defaultValue, enum: enumValues } = prop;

    let zodType = '';

    if (enumValues && enumValues.length > 0) {
      zodType = `z.enum([${enumValues.map((v) => `'${v}'`).join(', ')}])`;
    } else {
      switch (type.toLowerCase()) {
        case 'string':
          zodType = 'z.string()';
          break;
        case 'number':
          zodType = 'z.number()';
          break;
        case 'boolean':
          zodType = 'z.boolean()';
          break;
        case 'function':
          zodType = 'z.function()';
          break;
        case 'array':
          zodType = 'z.array(z.any())';
          break;
        case 'object':
          zodType = 'z.object({})';
          break;
        default:
          zodType = 'z.any()';
      }
    }

    if (defaultValue !== undefined) {
      zodType += `.default(${JSON.stringify(defaultValue)})`;
    } else if (!required) {
      zodType += '.optional()';
    }

    return zodType;
  }

  private async generateFromTemplate(templateName: string, data: any): Promise<string> {
    // Load template if not cached
    if (!this.templates.has(templateName)) {
      const templatePath = join(__dirname, '..', 'src', 'templates', `${templateName}.hbs`);
      const templateContent = await fs.readFile(templatePath, 'utf-8');
      this.templates.set(templateName, Handlebars.compile(templateContent));
    }

    const template = this.templates.get(templateName)!;
    const content = template(data);

    // Format with Prettier
    try {
      return await prettier.format(content, {
        parser: templateName === 'index' ? 'typescript' : 'typescript',
        semi: false,
        singleQuote: true,
        trailingComma: 'es5',
      });
    } catch {
      // Return unformatted if prettier fails
      return content;
    }
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Component Generator MCP Server running on stdio');
  }
}

const server = new ComponentGeneratorServer();
server.run().catch(console.error);
