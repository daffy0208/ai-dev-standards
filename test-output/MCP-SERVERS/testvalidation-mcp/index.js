#!/usr/bin/env node

/**
 * testvalidation MCP Server
 * Test validation MCP server
 */

const { Server } = require('@modelcontextprotocol/sdk/server/index.js')
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js')
const {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} = require('@modelcontextprotocol/sdk/types.js')

// Create server instance
const server = new Server(
  {
    name: 'testvalidation-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
      resources: {},
    },
  }
)

// ===========================
// TOOLS
// ===========================

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'testvalidation_action',
        description: 'Perform testvalidation action',
        inputSchema: {
          type: 'object',
          properties: {
            input: {
              type: 'string',
              description: 'Input data',
            },
          },
          required: ['input'],
        },
      },
    ],
  }
})

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params

  try {
    if (name === 'testvalidation_action') {
      // FIX: Handle missing arguments
      const { input } = args ?? {}

      // Implement your tool logic here
      const result = await performTestvalidationAction(input)

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      }
    }

    throw new Error(`Unknown tool: ${name}`)
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error.message}`,
        },
      ],
      isError: true,
    }
  }
})

/**
 * Implement your tool logic
 */
async function performTestvalidationAction(input) {
  // TODO: Implement your logic here
  return {
    success: true,
    result: `Processed: ${input}`,
  }
}

// ===========================
// RESOURCES
// ===========================

server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: 'testvalidation://data',
        name: 'testvalidation Data',
        mimeType: 'application/json',
        description: 'testvalidation data resource',
      },
    ],
  }
})

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params

  if (uri === 'testvalidation://data') {
    const data = await getTestvalidationData()

    return {
      contents: [
        {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify(data, null, 2),
        },
      ],
    }
  }

  throw new Error(`Unknown resource: ${uri}`)
})

async function getTestvalidationData() {
  // TODO: Implement your data fetching logic
  return {
    items: [],
    total: 0,
  }
}

// ===========================
// START SERVER
// ===========================

async function main() {
  const transport = new StdioServerTransport()
  await server.connect(transport)

  console.error('testvalidation MCP server running on stdio')
}

main().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
