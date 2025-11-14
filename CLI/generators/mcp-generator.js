const prettier = require('prettier')
const { sanitizeName, validateIdentifier } = require('../utils/validation')

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
    const { name, template = 'custom', description = '', features = ['tools'], pattern = 'direct' } = config

    // Validate and sanitize MCP name (SECURITY: prevent path traversal)
    // Note: MCP names are used as directory names, not JS identifiers
    // So we only need sanitizeName, not validateIdentifier
    const sanitizedName = sanitizeName(name, 'MCP server')

    // Validate pattern
    if (!['direct', 'code-execution'].includes(pattern)) {
      throw new Error(`Invalid pattern: ${pattern}. Must be 'direct' or 'code-execution'`)
    }

    const files = []

    // Generate based on pattern
    if (pattern === 'direct') {
      // Direct MCP: Traditional structure
      files.push({
        path: `MCP-SERVERS/${sanitizedName}-mcp/index.js`,
        content: await this.formatCode(this.generateServerCode(sanitizedName, description, features))
      })

      files.push({
        path: `MCP-SERVERS/${sanitizedName}-mcp/package.json`,
        content: this.generatePackageJson(sanitizedName, description)
      })

      files.push({
        path: `MCP-SERVERS/${sanitizedName}-mcp/README.md`,
        content: this.generateReadme(sanitizedName, description, features, pattern)
      })

      files.push({
        path: `MCP-SERVERS/${sanitizedName}-mcp/.env.example`,
        content: this.generateEnvExample(sanitizedName)
      })
    } else {
      // Code Execution: Advanced structure with /servers/ and /skills/
      files.push({
        path: `MCP-SERVERS/${sanitizedName}-mcp/servers/${sanitizedName}/README.md`,
        content: this.generateCodeExecutionReadme(sanitizedName, description, features)
      })

      files.push({
        path: `MCP-SERVERS/${sanitizedName}-mcp/servers/${sanitizedName}/tool_list.txt`,
        content: this.generateToolList(sanitizedName, features)
      })

      files.push({
        path: `MCP-SERVERS/${sanitizedName}-mcp/servers/${sanitizedName}/tools/example_tool.py`,
        content: this.generateToolFile(sanitizedName, 'example_tool')
      })

      files.push({
        path: `MCP-SERVERS/${sanitizedName}-mcp/skills/.gitkeep`,
        content: '# Skills directory for persistent skill files\n'
      })

      files.push({
        path: `MCP-SERVERS/${sanitizedName}-mcp/README.md`,
        content: this.generateReadme(sanitizedName, description, features, pattern)
      })

      files.push({
        path: `MCP-SERVERS/${sanitizedName}-mcp/.env.example`,
        content: this.generateEnvExample(sanitizedName)
      })
    }

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
      // FIX: Handle missing arguments
      const { input } = args ?? {}

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
  // IMPLEMENTATION NOTE: Replace with real business logic for this MCP action
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
  // IMPLEMENTATION NOTE: Replace with real data fetching logic
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
    // FIX: Handle missing arguments
    const { context } = args ?? {}

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
  generateReadme(name, description, features, pattern = 'direct') {
    const patternInfo = pattern === 'code-execution'
      ? `\n**Pattern:** Code Execution (Advanced)\n**Progressive Discovery:** Enabled\n**Skills Support:** Yes\n`
      : `\n**Pattern:** Direct MCP (Traditional)\n`

    return `# ${name.charAt(0).toUpperCase() + name.slice(1)} MCP Server

${description}
${patternInfo}
## What This MCP Does

${features.includes('tools') ? '- 🛠️ Provides tools for ' + name + ' operations' : ''}
${features.includes('resources') ? '- 📦 Exposes ' + name + ' resources' : ''}
${features.includes('prompts') ? '- 💬 Includes prompt templates' : ''}
${pattern === 'code-execution' ? '- 🔄 Progressive discovery with tool file navigation' : ''}
${pattern === 'code-execution' ? '- 💾 Persistent skill library support' : ''}

## Installation

\`\`\`bash
# Install dependencies
cd MCP-SERVERS/${name}-mcp
${pattern === 'direct' ? 'npm install' : '# Code Execution pattern uses tool files - no npm install needed'}
\`\`\`

## Setup

Add to your Claude Code MCP settings:

${pattern === 'direct' ? `\`\`\`json
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
\`\`\`` : `\`\`\`json
{
  "mcpServers": {
    "${name}": {
      "command": "mcp-code-execution",
      "args": ["--servers-path", "${process.cwd()}/MCP-SERVERS/${name}-mcp/servers"],
      "env": {
        "SKILLS_PATH": "${process.cwd()}/MCP-SERVERS/${name}-mcp/skills"
      }
    }
  }
}
\`\`\``}

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
   * Generate Code Execution pattern README
   */
  generateCodeExecutionReadme(name, description, features) {
    return `# ${name.charAt(0).toUpperCase() + name.slice(1)} Server

${description}

## Pattern: Code Execution (Advanced)

This server uses the Code Execution pattern with progressive discovery.

## Features

- **Progressive Discovery**: Tools are discovered on-demand through file navigation
- **Skill Library**: Reusable code artifacts persist across sessions
- **Token Efficiency**: Only load tool definitions when needed
- **IPython Integration**: Tools execute in sandboxed Python environment

## Directory Structure

\`\`\`
${name}-mcp/
├── servers/${name}/
│   ├── README.md           # This file
│   ├── tool_list.txt       # List of available tools
│   └── tools/              # Tool implementations
│       └── example_tool.py
└── skills/                 # Persistent skill library
\`\`\`

## Available Tools

See \`tool_list.txt\` for the complete list of available tools.

## Usage

1. Agent reads \`README.md\` to understand the server
2. Agent reads \`tool_list.txt\` to see available tools
3. Agent reads specific tool files from \`tools/\` as needed
4. Agent generates skills that persist in \`skills/\`

## Adding New Tools

1. Create a new Python file in \`tools/\`
2. Add the tool name to \`tool_list.txt\`
3. Document the tool in this README

## Security

- Tools execute in sandboxed environment
- PII is automatically tokenized
- Skills are stored in isolated directory
`
  }

  /**
   * Generate tool list file
   */
  generateToolList(name, features) {
    return `# Available Tools for ${name.charAt(0).toUpperCase() + name.slice(1)}

## Core Tools

- example_tool: Example tool demonstrating the pattern

## Instructions

Add new tools to this list as you implement them.
Each line should contain:
- tool_name: Brief description
`
  }

  /**
   * Generate tool file (Python)
   */
  generateToolFile(serverName, toolName) {
    return `"""
${toolName} Tool

Example tool implementation for ${serverName} server.
"""

def ${toolName}(input_data: str, options: dict = None) -> dict:
    """
    Execute the ${toolName} operation.

    Args:
        input_data: Input data for the tool
        options: Optional parameters

    Returns:
        dict: Result of the operation
    """
    # IMPLEMENTATION NOTE: Replace with actual tool logic

    result = {
        "success": True,
        "result": f"Processed: {input_data}",
        "tool": "${toolName}"
    }

    return result


# Example usage
if __name__ == "__main__":
    test_result = ${toolName}("test input", {"verbose": True})
    print(test_result)
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
