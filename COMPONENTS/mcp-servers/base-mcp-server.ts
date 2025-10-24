/**
 * Base MCP Server Template
 *
 * This is a reusable base class for creating MCP (Model Context Protocol) servers.
 * Extend this class to create custom MCP servers with tools, resources, and prompts.
 *
 * @example
 * ```typescript
 * import { BaseMCPServer } from './base-mcp-server'
 *
 * class MyMCPServer extends BaseMCPServer {
 *   constructor() {
 *     super('my-mcp-server', '1.0.0')
 *     this.registerTools()
 *   }
 *
 *   protected registerTools() {
 *     this.addTool({
 *       name: 'my_tool',
 *       description: 'Does something useful',
 *       inputSchema: {
 *         type: 'object',
 *         properties: {
 *           input: { type: 'string' }
 *         },
 *         required: ['input']
 *       },
 *       handler: async (args) => {
 *         return { result: `Processed: ${args.input}` }
 *       }
 *     })
 *   }
 * }
 * ```
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
} from '@modelcontextprotocol/sdk/types.js'

export interface MCPTool {
  name: string
  description: string
  inputSchema: {
    type: 'object'
    properties: Record<string, any>
    required?: string[]
  }
  handler: (args: any) => Promise<any>
}

export interface MCPResource {
  uri: string
  name: string
  description: string
  mimeType: string
  handler: () => Promise<string>
}

export interface MCPPrompt {
  name: string
  description: string
  arguments?: Array<{
    name: string
    description: string
    required?: boolean
  }>
  handler: (args: Record<string, string>) => Promise<{
    messages: Array<{
      role: 'user' | 'assistant'
      content: { type: 'text'; text: string }
    }>
  }>
}

/**
 * Base class for MCP servers
 */
export abstract class BaseMCPServer {
  protected server: Server
  protected tools: Map<string, MCPTool> = new Map()
  protected resources: Map<string, MCPResource> = new Map()
  protected prompts: Map<string, MCPPrompt> = new Map()

  constructor(
    protected serverName: string,
    protected serverVersion: string
  ) {
    this.server = new Server(
      {
        name: serverName,
        version: serverVersion,
      },
      {
        capabilities: {
          tools: {},
          resources: {},
          prompts: {},
        },
      }
    )

    this.setupHandlers()
  }

  /**
   * Set up MCP protocol handlers
   */
  private setupHandlers(): void {
    // Tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: Array.from(this.tools.values()).map(tool => ({
        name: tool.name,
        description: tool.description,
        inputSchema: tool.inputSchema,
      })),
    }))

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const tool = this.tools.get(request.params.name)
      if (!tool) {
        throw new Error(`Unknown tool: ${request.params.name}`)
      }

      try {
        const result = await tool.handler(request.params.arguments || {})
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${errorMessage}`,
            },
          ],
          isError: true,
        }
      }
    })

    // Resources
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => ({
      resources: Array.from(this.resources.values()).map(resource => ({
        uri: resource.uri,
        name: resource.name,
        description: resource.description,
        mimeType: resource.mimeType,
      })),
    }))

    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const resource = this.resources.get(request.params.uri)
      if (!resource) {
        throw new Error(`Unknown resource: ${request.params.uri}`)
      }

      try {
        const content = await resource.handler()
        return {
          contents: [
            {
              uri: resource.uri,
              mimeType: resource.mimeType,
              text: content,
            },
          ],
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to read resource: ${errorMessage}`)
      }
    })

    // Prompts
    this.server.setRequestHandler(ListPromptsRequestSchema, async () => ({
      prompts: Array.from(this.prompts.values()).map(prompt => ({
        name: prompt.name,
        description: prompt.description,
        arguments: prompt.arguments,
      })),
    }))

    this.server.setRequestHandler(GetPromptRequestSchema, async (request) => {
      const prompt = this.prompts.get(request.params.name)
      if (!prompt) {
        throw new Error(`Unknown prompt: ${request.params.name}`)
      }

      try {
        return await prompt.handler(request.params.arguments || {})
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to get prompt: ${errorMessage}`)
      }
    })
  }

  /**
   * Add a tool to the server
   */
  protected addTool(tool: MCPTool): void {
    this.tools.set(tool.name, tool)
  }

  /**
   * Add a resource to the server
   */
  protected addResource(resource: MCPResource): void {
    this.resources.set(resource.uri, resource)
  }

  /**
   * Add a prompt to the server
   */
  protected addPrompt(prompt: MCPPrompt): void {
    this.prompts.set(prompt.name, prompt)
  }

  /**
   * Start the MCP server
   */
  async start(): Promise<void> {
    const transport = new StdioServerTransport()
    await this.server.connect(transport)
    console.error(`${this.serverName} v${this.serverVersion} running on stdio`)
  }

  /**
   * Stop the MCP server
   */
  async stop(): Promise<void> {
    await this.server.close()
  }
}

/**
 * Helper function to validate required arguments
 */
export function validateArgs(
  args: Record<string, any>,
  required: string[]
): void {
  for (const field of required) {
    if (!(field in args) || args[field] === undefined || args[field] === null) {
      throw new Error(`Missing required argument: ${field}`)
    }
  }
}

/**
 * Helper function to create error response
 */
export function createErrorResponse(error: unknown): {
  error: string
  details?: string
} {
  if (error instanceof Error) {
    return {
      error: error.message,
      details: error.stack,
    }
  }
  return {
    error: String(error),
  }
}
