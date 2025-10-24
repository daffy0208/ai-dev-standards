/**
 * MCP Client Tool
 *
 * Tool for interacting with Model Context Protocol (MCP) servers.
 * Allows calling MCP server tools, fetching resources, and managing prompts.
 *
 * @example
 * ```typescript
 * import { MCPClientTool } from './mcp-client-tool'
 *
 * const tool = new MCPClientTool({
 *   serverUrl: 'http://localhost:3000/mcp',
 *   serverName: 'document-processor'
 * })
 *
 * // Use in agent frameworks
 * const result = await tool._run(JSON.stringify({
 *   action: 'call_tool',
 *   toolName: 'process_document',
 *   arguments: { path: './doc.pdf' }
 * }))
 * ```
 */

export interface MCPClientOptions {
  /**
   * MCP server URL
   */
  serverUrl: string

  /**
   * Server name/identifier
   */
  serverName?: string

  /**
   * Authentication token
   */
  authToken?: string

  /**
   * Request timeout
   */
  timeout?: number
}

export interface MCPTool {
  name: string
  description: string
  inputSchema: {
    type: string
    properties: Record<string, any>
    required?: string[]
  }
}

export interface MCPResource {
  uri: string
  name: string
  description?: string
  mimeType?: string
}

export interface MCPPrompt {
  name: string
  description?: string
  arguments?: Array<{
    name: string
    description?: string
    required?: boolean
  }>
}

export class MCPClientTool {
  name = 'mcp_client'
  description = `Interact with MCP (Model Context Protocol) servers.
Input should be a JSON string with action and parameters.
Actions: call_tool, get_resource, list_tools, list_resources, list_prompts
Returns: Tool results, resource contents, or list of available capabilities.`

  private options: Required<MCPClientOptions>

  constructor(options: MCPClientOptions) {
    this.options = {
      serverUrl: options.serverUrl,
      serverName: options.serverName || 'mcp-server',
      authToken: options.authToken || '',
      timeout: options.timeout || 30000,
    }
  }

  async _run(input: string): Promise<string> {
    try {
      const request = JSON.parse(input)

      switch (request.action) {
        case 'call_tool':
          return await this.callTool(request.toolName, request.arguments)

        case 'get_resource':
          return await this.getResource(request.uri)

        case 'list_tools':
          return await this.listTools()

        case 'list_resources':
          return await this.listResources()

        case 'list_prompts':
          return await this.listPrompts()

        case 'get_prompt':
          return await this.getPrompt(request.promptName, request.arguments)

        default:
          return `Unknown action: ${request.action}`
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      return `Error: ${errorMessage}`
    }
  }

  /**
   * Call an MCP tool
   */
  async callTool(toolName: string, args: Record<string, any>): Promise<string> {
    const response = await this.request('tools/call', {
      name: toolName,
      arguments: args,
    })

    if (response.error) {
      return `Tool error: ${response.error}`
    }

    return JSON.stringify(response.result, null, 2)
  }

  /**
   * Get an MCP resource
   */
  async getResource(uri: string): Promise<string> {
    const response = await this.request('resources/read', { uri })

    if (response.error) {
      return `Resource error: ${response.error}`
    }

    return response.contents || response.result
  }

  /**
   * List available tools
   */
  async listTools(): Promise<string> {
    const response = await this.request('tools/list')

    if (response.error) {
      return `Error: ${response.error}`
    }

    const tools: MCPTool[] = response.tools || []

    if (tools.length === 0) {
      return 'No tools available'
    }

    const formatted = tools.map((tool) => {
      const params = Object.keys(tool.inputSchema.properties || {}).join(', ')
      return `- ${tool.name}(${params}): ${tool.description}`
    })

    return `Available Tools:\n${formatted.join('\n')}`
  }

  /**
   * List available resources
   */
  async listResources(): Promise<string> {
    const response = await this.request('resources/list')

    if (response.error) {
      return `Error: ${response.error}`
    }

    const resources: MCPResource[] = response.resources || []

    if (resources.length === 0) {
      return 'No resources available'
    }

    const formatted = resources.map((resource) => {
      return `- ${resource.uri} (${resource.name}): ${resource.description || 'No description'}`
    })

    return `Available Resources:\n${formatted.join('\n')}`
  }

  /**
   * List available prompts
   */
  async listPrompts(): Promise<string> {
    const response = await this.request('prompts/list')

    if (response.error) {
      return `Error: ${response.error}`
    }

    const prompts: MCPPrompt[] = response.prompts || []

    if (prompts.length === 0) {
      return 'No prompts available'
    }

    const formatted = prompts.map((prompt) => {
      const args = prompt.arguments?.map((arg) => arg.name).join(', ') || ''
      return `- ${prompt.name}(${args}): ${prompt.description || 'No description'}`
    })

    return `Available Prompts:\n${formatted.join('\n')}`
  }

  /**
   * Get a prompt
   */
  async getPrompt(
    promptName: string,
    args?: Record<string, string>
  ): Promise<string> {
    const response = await this.request('prompts/get', {
      name: promptName,
      arguments: args,
    })

    if (response.error) {
      return `Prompt error: ${response.error}`
    }

    const messages = response.messages || []
    return messages.map((msg: any) => msg.content).join('\n\n')
  }

  /**
   * Make request to MCP server
   */
  private async request(
    endpoint: string,
    body?: any
  ): Promise<any> {
    const url = `${this.options.serverUrl}/${endpoint}`

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }

    if (this.options.authToken) {
      headers['Authorization'] = `Bearer ${this.options.authToken}`
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.options.timeout)

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: response.statusText }))
        return { error: error.error || response.statusText }
      }

      return response.json()
    } catch (error) {
      clearTimeout(timeoutId)

      if (error instanceof Error && error.name === 'AbortError') {
        return { error: 'Request timeout' }
      }

      throw error
    }
  }

  /**
   * Test connection to MCP server
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.listTools()
      return !response.startsWith('Error')
    } catch {
      return false
    }
  }
}

/**
 * Create MCP client tool
 */
export function createMCPClientTool(options: MCPClientOptions): MCPClientTool {
  return new MCPClientTool(options)
}

/**
 * Multi-server MCP client (manages multiple MCP servers)
 */
export class MultiServerMCPClient {
  private clients = new Map<string, MCPClientTool>()

  /**
   * Register an MCP server
   */
  register(name: string, options: MCPClientOptions): void {
    this.clients.set(name, new MCPClientTool({ ...options, serverName: name }))
  }

  /**
   * Call tool on specific server
   */
  async callTool(
    serverName: string,
    toolName: string,
    args: Record<string, any>
  ): Promise<string> {
    const client = this.clients.get(serverName)
    if (!client) {
      throw new Error(`Server not found: ${serverName}`)
    }

    return client.callTool(toolName, args)
  }

  /**
   * List all servers
   */
  listServers(): string[] {
    return Array.from(this.clients.keys())
  }

  /**
   * List tools from all servers
   */
  async listAllTools(): Promise<Map<string, string>> {
    const allTools = new Map<string, string>()

    for (const [serverName, client] of this.clients) {
      const tools = await client.listTools()
      allTools.set(serverName, tools)
    }

    return allTools
  }
}
