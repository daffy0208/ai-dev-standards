#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema
} from '@modelcontextprotocol/sdk/types.js'
import * as fs from 'fs'
import * as path from 'path'

interface StoryTemplate {
  name: string
  template: string
  description: string
}

const storyTemplates: StoryTemplate[] = [
  {
    name: 'basic',
    template: `import type { Meta, StoryObj } from '@storybook/react'
import { {{componentName}} } from './{{componentName}}'

const meta = {
  title: '{{category}}/{{componentName}}',
  component: {{componentName}},
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof {{componentName}}>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {},
}`,
    description: 'Basic Storybook story template'
  },
  {
    name: 'with-variants',
    template: `import type { Meta, StoryObj } from '@storybook/react'
import { {{componentName}} } from './{{componentName}}'

const meta = {
  title: '{{category}}/{{componentName}}',
  component: {{componentName}},
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
} satisfies Meta<typeof {{componentName}}>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: '{{componentName}}',
  },
}

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: '{{componentName}}',
  },
}

export const Small: Story = {
  args: {
    size: 'sm',
    children: 'Small {{componentName}}',
  },
}

export const Large: Story = {
  args: {
    size: 'lg',
    children: 'Large {{componentName}}',
  },
}`,
    description: 'Story template with multiple variants'
  }
]

const server = new Server(
  { name: 'storybook-generator-mcp', version: '1.0.0' },
  { capabilities: { tools: {}, resources: {} } }
)

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'generate_story',
      description: 'Generate a Storybook story for a React component',
      inputSchema: {
        type: 'object',
        properties: {
          componentPath: {
            type: 'string',
            description: 'Path to the React component file'
          },
          template: {
            type: 'string',
            description: 'Story template to use (basic, with-variants)',
            enum: ['basic', 'with-variants']
          },
          category: {
            type: 'string',
            description: 'Storybook category (e.g., Components, UI, Forms)'
          }
        },
        required: ['componentPath']
      }
    },
    {
      name: 'generate_all_stories',
      description: 'Generate Storybook stories for all components in a directory',
      inputSchema: {
        type: 'object',
        properties: {
          componentDir: {
            type: 'string',
            description: 'Directory containing React components'
          },
          template: {
            type: 'string',
            description: 'Story template to use',
            enum: ['basic', 'with-variants']
          },
          category: {
            type: 'string',
            description: 'Storybook category'
          }
        },
        required: ['componentDir']
      }
    },
    {
      name: 'update_storybook_config',
      description: 'Update or create Storybook configuration',
      inputSchema: {
        type: 'object',
        properties: {
          projectPath: {
            type: 'string',
            description: 'Project root path'
          },
          options: {
            type: 'object',
            description: 'Storybook configuration options',
            properties: {
              addons: {
                type: 'array',
                items: { type: 'string' }
              },
              stories: {
                type: 'array',
                items: { type: 'string' }
              }
            }
          }
        },
        required: ['projectPath']
      }
    }
  ]
}))

// List available resources
server.setRequestHandler(ListResourcesRequestSchema, async () => ({
  resources: [
    {
      uri: 'storybook://templates/list',
      name: 'Story Templates',
      description: 'Available Storybook story templates',
      mimeType: 'application/json'
    }
  ]
}))

// Read resource content
server.setRequestHandler(ReadResourceRequestSchema, async request => {
  const uri = request.params.uri

  if (uri === 'storybook://templates/list') {
    return {
      contents: [
        {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify(storyTemplates, null, 2)
        }
      ]
    }
  }

  throw new Error(`Unknown resource: ${uri}`)
})

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async request => {
  const { name, arguments: args } = request.params

  try {
    switch (name) {
      case 'generate_story': {
        const {
          componentPath,
          template = 'basic',
          category = 'Components'
        } = args as {
          componentPath: string
          template?: string
          category?: string
        }

        const result = generateStory(componentPath, template, category)
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
        }
      }

      case 'generate_all_stories': {
        const {
          componentDir,
          template = 'basic',
          category = 'Components'
        } = args as {
          componentDir: string
          template?: string
          category?: string
        }

        const result = generateAllStories(componentDir, template, category)
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
        }
      }

      case 'update_storybook_config': {
        const { projectPath, options } = args as {
          projectPath: string
          options?: any
        }

        const result = updateStorybookConfig(projectPath, options)
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
        }
      }

      default:
        throw new Error(`Unknown tool: ${name}`)
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error instanceof Error ? error.message : String(error)}`
        }
      ],
      isError: true
    }
  }
})

function generateStory(componentPath: string, templateName: string, category: string) {
  if (!fs.existsSync(componentPath)) {
    throw new Error(`Component file not found: ${componentPath}`)
  }

  const template = storyTemplates.find(t => t.name === templateName)
  if (!template) {
    throw new Error(`Template not found: ${templateName}`)
  }

  const componentName = path.basename(componentPath, path.extname(componentPath))
  const storyContent = template.template
    .replace(/\{\{componentName\}\}/g, componentName)
    .replace(/\{\{category\}\}/g, category)

  const storyPath = componentPath.replace(/\.(tsx?|jsx?)$/, '.stories.$1')

  fs.writeFileSync(storyPath, storyContent)

  return {
    success: true,
    componentName,
    storyPath,
    template: templateName,
    message: `Generated ${templateName} story for ${componentName}`
  }
}

function generateAllStories(componentDir: string, templateName: string, category: string) {
  if (!fs.existsSync(componentDir)) {
    throw new Error(`Directory not found: ${componentDir}`)
  }

  const files = fs.readdirSync(componentDir)
  const componentFiles = files.filter(
    file =>
      (file.endsWith('.tsx') ||
        file.endsWith('.jsx') ||
        file.endsWith('.ts') ||
        file.endsWith('.js')) &&
      !file.includes('.stories.') &&
      !file.includes('.test.') &&
      !file.includes('.spec.')
  )

  const results = []

  for (const file of componentFiles) {
    const componentPath = path.join(componentDir, file)
    try {
      const result = generateStory(componentPath, templateName, category)
      results.push(result)
    } catch (error) {
      results.push({
        success: false,
        file,
        error: error instanceof Error ? error.message : String(error)
      })
    }
  }

  return {
    success: true,
    total: componentFiles.length,
    generated: results.filter(r => r.success).length,
    failed: results.filter(r => !r.success).length,
    results
  }
}

function updateStorybookConfig(projectPath: string, options: any = {}) {
  const storybookDir = path.join(projectPath, '.storybook')

  if (!fs.existsSync(storybookDir)) {
    fs.mkdirSync(storybookDir, { recursive: true })
  }

  const mainConfigPath = path.join(storybookDir, 'main.ts')

  const defaultConfig = {
    stories: options.stories || ['../src/**/*.stories.@(js|jsx|ts|tsx)'],
    addons: options.addons || [
      '@storybook/addon-links',
      '@storybook/addon-essentials',
      '@storybook/addon-interactions'
    ],
    framework: {
      name: '@storybook/react-vite',
      options: {}
    },
    docs: {
      autodocs: 'tag'
    }
  }

  const configContent = `import type { StorybookConfig } from '@storybook/react-vite'

const config: StorybookConfig = ${JSON.stringify(defaultConfig, null, 2)}

export default config
`

  fs.writeFileSync(mainConfigPath, configContent)

  return {
    success: true,
    configPath: mainConfigPath,
    message: 'Storybook configuration created/updated'
  }
}

async function main() {
  const transport = new StdioServerTransport()
  await server.connect(transport)
  console.error('storybook-generator-mcp running on stdio')
}

main().catch(error => {
  console.error('Server error:', error)
  process.exit(1)
})
