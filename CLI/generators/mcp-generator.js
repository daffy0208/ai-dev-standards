const prettier = require('prettier')

/**
 * MCP Server Generator
 *
 * Generates Model Context Protocol (MCP) servers with:
 * - Full server implementation
 * - Tools, Resources, and Prompts
 * - Package.json configuration
 * - README documentation
 */
class McpGenerator {
  async generate(config) {
    const { name, template = 'custom', description = '', features = ['tools'] } = config

    const files = []

    // index.js - Main server implementation
    files.push({
      path: `MCP-SERVERS/${name}-mcp/index.js`,
      content: await this.formatCode(this.generateServerCode(name, description, features))
    })

    // package.json
    files.push({
      path: `MCP-SERVERS/${name}-mcp/package.json`,
      content: this.generatePackageJson(name, description)
    })

    // README.md
    files.push({
      path: `MCP-SERVERS/${name}-mcp/README.md`,
      content: this.generateReadme(name, description, features)
    })

    // .env.example
    files.push({
      path: `MCP-SERVERS/${name}-mcp/.env.example`,
      content: this.generateEnvExample(name)
    })

    return files
  }

  /**
   * Generate MCP server code
   */
  generateServerCode(name, description, features) {
    const hasTools = features.includes('tools')
    const hasResources = features.includes('resources')
    const hasPrompts = features.includes('prompts')

    return `#!/usr/bin/env node

/**
 * ${name} MCP Server
 * ${description}
 */

const { Server } = require('@modelcontextprotocol/sdk/server/index.js')
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js')
const {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ${hasResources ? 'ListResourcesRequestSchema,' : ''}
  ${hasResources ? 'ReadResourceRequestSchema,' : ''}
  ${hasPrompts ? 'ListPromptsRequestSchema,' : ''}
  ${hasPrompts ? 'GetPromptRequestSchema,' : ''}
} = require('@modelcontextprotocol/sdk/types.js')

// Create server instance
const server = new Server(
  {
    name: '${name}-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      ${hasTools ? 'tools: {},' : ''}
      ${hasResources ? 'resources: {},' : ''}
      ${hasPrompts ? 'prompts: {},' : ''}
    },
  }
)

${hasTools ? `
// ===========================
// TOOLS
// ===========================

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: '${name}_action',
        description: 'Perform ${name} action',
        inputSchema: {
          type: 'object',
          properties: {
            input: {
              type: 'string',
              description: 'Input data'
            }
          },
          required: ['input']
        }
      }
    ]
  }
})

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params

  try {
    if (name === '${name}_action') {
      const { input } = args

      // Implement your tool logic here
      const result = await perform${name.charAt(0).toUpperCase() + name.slice(1)}Action(input)

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2)
          }
        ]
      }
    }

    throw new Error(\`Unknown tool: \${name}\`)
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: \`Error: \${error.message}\`
        }
      ],
      isError: true
    }
  }
})

/**
 * Implement your tool logic
 */
async function perform${name.charAt(0).toUpperCase() + name.slice(1)}Action(input) {
  // TODO: Implement your logic here
  return {
    success: true,
    result: \`Processed: \${input}\`
  }
}
` : ''}

${hasResources ? `
// ===========================
// RESOURCES
// ===========================

server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: '${name}://data',
        name: '${name} Data',
        mimeType: 'application/json',
        description: '${name} data resource'
      }
    ]
  }
})

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params

  if (uri === '${name}://data') {
    const data = await get${name.charAt(0).toUpperCase() + name.slice(1)}Data()

    return {
      contents: [
        {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify(data, null, 2)
        }
      ]
    }
  }

  throw new Error(\`Unknown resource: \${uri}\`)
})

async function get${name.charAt(0).toUpperCase() + name.slice(1)}Data() {
  // TODO: Implement your data fetching logic
  return {
    items: [],
    total: 0
  }
}
` : ''}

${hasPrompts ? `
// ===========================
// PROMPTS
// ===========================

server.setRequestHandler(ListPromptsRequestSchema, async () => {
  return {
    prompts: [
      {
        name: '${name}_prompt',
        description: '${name} prompt template',
        arguments: [
          {
            name: 'context',
            description: 'Context for the prompt',
            required: true
          }
        ]
      }
    ]
  }
})

server.setRequestHandler(GetPromptRequestSchema, async (request) => {
  const { name, arguments: args } = request.params

  if (name === '${name}_prompt') {
    const { context } = args

    return {
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: \`Please help with ${name} using this context: \${context}\`
          }
        }
      ]
    }
  }

  throw new Error(\`Unknown prompt: \${name}\`)
})
` : ''}

// ===========================
// START SERVER
// ===========================

async function main() {
  const transport = new StdioServerTransport()
  await server.connect(transport)

  console.error('${name} MCP server running on stdio')
}

main().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
`
  }

  /**
   * Generate package.json
   */
  generatePackageJson(name, description) {
    return JSON.stringify({
      "name": `${name}-mcp`,
      "version": "1.0.0",
      "description": description || `MCP server for ${name}`,
      "type": "commonjs",
      "main": "index.js",
      "bin": {
        [`${name}-mcp`]: "./index.js"
      },
      "scripts": {
        "start": "node index.js",
        "test": "echo \"No tests yet\" && exit 0"
      },
      "keywords": ["mcp", "server", name],
      "dependencies": {
        "@modelcontextprotocol/sdk": "^0.5.0"
      },
      "engines": {
        "node": ">=18.0.0"
      }
    }, null, 2)
  }

  /**
   * Generate README
   */
  generateReadme(name, description, features) {
    return `# ${name.charAt(0).toUpperCase() + name.slice(1)} MCP Server

${description}

## What This MCP Does

${features.includes('tools') ? '- 🛠️ Provides tools for ' + name + ' operations' : ''}
${features.includes('resources') ? '- 📦 Exposes ' + name + ' resources' : ''}
${features.includes('prompts') ? '- 💬 Includes prompt templates' : ''}

## Installation

\`\`\`bash
# Install dependencies
cd MCP-SERVERS/${name}-mcp
npm install
\`\`\`

## Setup

Add to your Claude Code MCP settings:

\`\`\`json
{
  "mcpServers": {
    "${name}": {
      "command": "node",
      "args": ["${process.cwd()}/MCP-SERVERS/${name}-mcp/index.js"],
      "env": {
        // Add environment variables here
      }
    }
  }
}
\`\`\`

## Usage

${features.includes('tools') ? `
### Tools

\`\`\`javascript
// Use the ${name} tool
await ${name}_action({
  input: 'your-input-here'
})
\`\`\`
` : ''}

${features.includes('resources') ? `
### Resources

\`\`\`javascript
// Access ${name} data
const data = await read('${name}://data')
\`\`\`
` : ''}

${features.includes('prompts') ? `
### Prompts

\`\`\`javascript
// Use ${name} prompt
await ${name}_prompt({
  context: 'your-context'
})
\`\`\`
` : ''}

## Configuration

Copy \`.env.example\` to \`.env\` and fill in your values:

\`\`\`bash
cp .env.example .env
\`\`\`

## Testing

\`\`\`bash
npm test
\`\`\`

## Development

To test the MCP server locally:

\`\`\`bash
npm start
\`\`\`

## License

MIT
`
  }

  /**
   * Generate .env.example
   */
  generateEnvExample(name) {
    return `# ${name.charAt(0).toUpperCase() + name.slice(1)} MCP Server Configuration

# Add your environment variables here
# Example:
# API_KEY=your-api-key-here
# API_URL=https://api.example.com
`
  }

  /**
   * Format code
   */
  async formatCode(code) {
    try {
      return await prettier.format(code, {
        parser: 'babel',
        semi: false,
        singleQuote: true,
        trailingComma: 'es5',
        printWidth: 100
      })
    } catch (error) {
      return code
    }
  }
}

module.exports = McpGenerator
