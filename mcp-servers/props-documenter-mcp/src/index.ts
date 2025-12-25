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

interface PropDefinition {
  name: string
  type: string
  required: boolean
  defaultValue?: string
  description?: string
}

const server = new Server(
  { name: 'props-documenter-mcp', version: '1.0.0' },
  { capabilities: { tools: {}, resources: {} } }
)

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'extract_props',
      description: 'Extract prop types from a React component',
      inputSchema: {
        type: 'object',
        properties: {
          componentPath: {
            type: 'string',
            description: 'Path to the React component file'
          }
        },
        required: ['componentPath']
      }
    },
    {
      name: 'generate_props_table',
      description: 'Generate a markdown table of component props',
      inputSchema: {
        type: 'object',
        properties: {
          componentPath: {
            type: 'string',
            description: 'Path to the React component file'
          },
          outputPath: {
            type: 'string',
            description: 'Path to save the markdown table'
          }
        },
        required: ['componentPath']
      }
    },
    {
      name: 'add_jsdoc',
      description: 'Add JSDoc comments to component props',
      inputSchema: {
        type: 'object',
        properties: {
          componentPath: {
            type: 'string',
            description: 'Path to the React component file'
          },
          propDescriptions: {
            type: 'object',
            description: 'Object mapping prop names to descriptions'
          }
        },
        required: ['componentPath']
      }
    }
  ]
}))

server.setRequestHandler(ListResourcesRequestSchema, async () => ({
  resources: [
    {
      uri: 'props://prop-type-definitions',
      name: 'Prop Type Definitions',
      description: 'Common TypeScript prop type patterns',
      mimeType: 'application/json'
    }
  ]
}))

server.setRequestHandler(ReadResourceRequestSchema, async request => {
  const uri = request.params.uri

  if (uri === 'props://prop-type-definitions') {
    const definitions = {
      common: {
        children: 'React.ReactNode',
        className: 'string',
        style: 'React.CSSProperties',
        onClick: '(event: React.MouseEvent) => void',
        onChange: '(event: React.ChangeEvent<HTMLInputElement>) => void'
      },
      variants: {
        size: '"sm" | "md" | "lg"',
        variant: '"primary" | "secondary" | "outline"',
        color: '"default" | "primary" | "secondary" | "success" | "warning" | "error"'
      },
      states: {
        disabled: 'boolean',
        loading: 'boolean',
        error: 'boolean',
        required: 'boolean'
      }
    }

    return {
      contents: [
        {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify(definitions, null, 2)
        }
      ]
    }
  }

  throw new Error(`Unknown resource: ${uri}`)
})

server.setRequestHandler(CallToolRequestSchema, async request => {
  const { name, arguments: args } = request.params

  try {
    switch (name) {
      case 'extract_props': {
        const { componentPath } = args as { componentPath: string }
        const result = extractProps(componentPath)
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
        }
      }

      case 'generate_props_table': {
        const { componentPath, outputPath } = args as {
          componentPath: string
          outputPath?: string
        }
        const result = generatePropsTable(componentPath, outputPath)
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
        }
      }

      case 'add_jsdoc': {
        const { componentPath, propDescriptions } = args as {
          componentPath: string
          propDescriptions?: Record<string, string>
        }
        const result = addJsDoc(componentPath, propDescriptions)
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

function extractProps(componentPath: string): any {
  if (!fs.existsSync(componentPath)) {
    throw new Error(`Component file not found: ${componentPath}`)
  }

  const content = fs.readFileSync(componentPath, 'utf-8')
  const props: PropDefinition[] = []

  // Match interface/type definitions
  const interfaceRegex = /(?:interface|type)\s+(\w+Props)\s*=?\s*{([^}]*)}/gs
  const matches = content.matchAll(interfaceRegex)

  for (const match of matches) {
    const [, interfaceName, propsBody] = match

    // Extract individual props
    const propLines = propsBody.split('\n').filter(line => line.trim())

    for (const line of propLines) {
      const propMatch = line.match(/^\s*(\w+)(\?)?:\s*([^;]+)/)
      if (propMatch) {
        const [, name, optional, type] = propMatch

        props.push({
          name,
          type: type.trim(),
          required: !optional
        })
      }
    }
  }

  const componentName = path.basename(componentPath, path.extname(componentPath))

  return {
    success: true,
    componentName,
    props,
    total: props.length
  }
}

function generatePropsTable(componentPath: string, outputPath?: string): any {
  const extracted = extractProps(componentPath)

  if (!extracted.success) {
    return extracted
  }

  const lines: string[] = []
  lines.push(`# ${extracted.componentName} Props`)
  lines.push('')
  lines.push('| Prop | Type | Required | Default | Description |')
  lines.push('|------|------|----------|---------|-------------|')

  for (const prop of extracted.props) {
    const required = prop.required ? '✓' : ''
    const defaultValue = prop.defaultValue || '-'
    const description = prop.description || ''

    lines.push(
      `| \`${prop.name}\` | \`${prop.type}\` | ${required} | ${defaultValue} | ${description} |`
    )
  }

  const markdown = lines.join('\n')

  if (outputPath) {
    fs.writeFileSync(outputPath, markdown)
    return {
      success: true,
      outputPath,
      props: extracted.props,
      markdown
    }
  }

  return {
    success: true,
    props: extracted.props,
    markdown
  }
}

function addJsDoc(componentPath: string, propDescriptions?: Record<string, string>): any {
  if (!fs.existsSync(componentPath)) {
    throw new Error(`Component file not found: ${componentPath}`)
  }

  let content = fs.readFileSync(componentPath, 'utf-8')
  const extracted = extractProps(componentPath)

  if (!extracted.success) {
    return extracted
  }

  // Add JSDoc comments
  const descriptions = propDescriptions || {}
  let modified = false

  for (const prop of extracted.props) {
    const description = descriptions[prop.name] || `${prop.name} prop`

    // Check if JSDoc already exists
    const jsDocPattern = new RegExp(`\\/\\*\\*[\\s\\S]*?\\*\\/\\s*${prop.name}\\??:`, 'm')
    if (jsDocPattern.test(content)) {
      continue
    }

    // Add JSDoc
    const propPattern = new RegExp(`(\\s*)(${prop.name}\\??:)`, 'm')
    const jsDoc = `$1/**\n$1 * ${description}\n$1 */\n$1$2`

    content = content.replace(propPattern, jsDoc)
    modified = true
  }

  if (modified) {
    fs.writeFileSync(componentPath, content)
  }

  return {
    success: true,
    componentPath,
    modified,
    propsDocumented: extracted.props.length
  }
}

async function main() {
  const transport = new StdioServerTransport()
  await server.connect(transport)
  console.error('props-documenter-mcp running on stdio')
}

main().catch(error => {
  console.error('Server error:', error)
  process.exit(1)
})
