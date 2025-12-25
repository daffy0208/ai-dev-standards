/**
 * Unit tests for MCP Server Components
 */

import { describe, it, expect, beforeEach } from 'vitest'
import {
  BaseMCPServer,
  MCPToolHandler,
  MCPResourceHandler,
  MCPPromptHandler
} from '../../../components/mcp-servers'
import { z } from 'zod'
import type { MCPToolArgs, MCPToolDefinition } from '../../../types/mcp'

type MessageArgs = { message: string }

describe('BaseMCPServer', () => {
  class TestServer extends BaseMCPServer {
    constructor() {
      super('test-server', '1.0.0')
    }

    public registerTool(tool: MCPToolDefinition) {
      this.addTool({
        ...tool,
        handler: async (args: MCPToolArgs) => await tool.handler(args)
      })
    }

    public getRegisteredToolNames() {
      return Array.from(this.tools.keys())
    }

    public async executeTool(name: string, args: MCPToolArgs) {
      const tool = this.tools.get(name)
      if (!tool) {
        throw new Error(`Unknown tool: ${name}`)
      }
      return tool.handler(args)
    }
  }

  let server: TestServer

  beforeEach(async () => {
    server = new TestServer()
  })

  it('should register and invoke tools', async () => {
    const mockTool = {
      name: 'test_tool',
      description: 'Test tool',
      inputSchema: {
        type: 'object' as const,
        properties: {
          message: { type: 'string' }
        },
        required: ['message']
      },
      handler: async (args: { message: string }) => ({ echo: args.message })
    }

    server.registerTool(mockTool)

    const result = await server.executeTool('test_tool', { message: 'hello' })
    expect(result).toEqual({ echo: 'hello' })
  })

  it('should list registered tools', () => {
    server.registerTool({
      name: 'another',
      description: 'Another tool',
      inputSchema: {
        type: 'object' as const,
        properties: {}
      },
      handler: async () => ({ ok: true })
    })

    expect(server.getRegisteredToolNames()).toContain('another')
  })
})

describe('MCPToolHandler', () => {
  it('should execute tool successfully', async () => {
    const handler = new MCPToolHandler({
      name: 'echo',
      description: 'Echo tool',
      inputSchema: z.object({ message: z.string() }),
      handler: async (args: MessageArgs) => ({ message: args.message })
    })

    const result = await handler.execute({ message: 'test' })
    expect(result.success).toBe(true)
    expect(result.data).toEqual({ message: 'test' })
  })

  it('should validate input schema', async () => {
    const handler = new MCPToolHandler({
      name: 'echo',
      description: 'Echo tool',
      inputSchema: z.object({ message: z.string() }),
      handler: async (args: MessageArgs) => args
    })

    const result = await handler.execute({ message: 123 } as unknown as MessageArgs) // Invalid type
    expect(result.success).toBe(false)
    expect(result.error?.code).toBe('VALIDATION_ERROR')
  })

  it('should cache results', async () => {
    const handler = new MCPToolHandler({
      name: 'expensive',
      description: 'Expensive operation',
      inputSchema: z.object({ value: z.number() }),
      handler: async (args: { value: number }) => ({ result: args.value * 2 }),
      cache: { enabled: true, ttl: 10000 }
    })

    // First call
    const result1 = await handler.execute({ value: 5 })
    expect(result1.metadata.cached).toBe(false)

    // Second call should be cached
    const result2 = await handler.execute({ value: 5 })
    expect(result2.metadata.cached).toBe(true)
  })

  it('should enforce rate limits', async () => {
    const handler = new MCPToolHandler({
      name: 'limited',
      description: 'Rate limited tool',
      inputSchema: z.object({}),
      handler: async () => ({ success: true }),
      rateLimits: { maxCalls: 2, windowMs: 60000 }
    })

    // First two calls should succeed
    await handler.execute({}, 'user1')
    await handler.execute({}, 'user1')

    // Third call should fail
    const result = await handler.execute({}, 'user1')
    expect(result.success).toBe(false)
    expect(result.error?.code).toBe('RATE_LIMIT_EXCEEDED')
  })
})

describe('MCPResourceHandler', () => {
  it('should retrieve resource content', async () => {
    const handler = new MCPResourceHandler({
      uri: 'test://resource',
      name: 'Test Resource',
      description: 'Test resource',
      handler: async () => 'Resource content'
    })

    const result = await handler.get()
    expect(result.success).toBe(true)
    expect(result.content).toBe('Resource content')
  })

  it('should cache resource content', async () => {
    const handler = new MCPResourceHandler({
      uri: 'test://cached',
      name: 'Cached Resource',
      description: 'Cached resource',
      handler: async () => 'Content',
      cache: { enabled: true, ttl: 10000 }
    })

    const result1 = await handler.get()
    expect(result1.cached).toBe(false)

    const result2 = await handler.get()
    expect(result2.cached).toBe(true)
  })
})

describe('MCPPromptHandler', () => {
  it('should execute prompt with variable substitution', async () => {
    const handler = new MCPPromptHandler({
      name: 'greeting',
      description: 'Greeting prompt',
      template: 'Hello, {{name}}! You are {{age}} years old.',
      variables: {
        name: { type: 'string', required: true },
        age: { type: 'number', required: true }
      }
    })

    const result = await handler.execute({ name: 'Alice', age: 30 })
    expect(result.success).toBe(true)
    expect(result.prompt).toBe('Hello, Alice! You are 30 years old.')
  })

  it('should validate required variables', async () => {
    const handler = new MCPPromptHandler({
      name: 'test',
      description: 'Test prompt',
      template: 'Required: {{value}}',
      variables: {
        value: { type: 'string', required: true }
      }
    })

    const result = await handler.execute({})
    expect(result.success).toBe(false)
    expect(result.error?.code).toBe('MISSING_REQUIRED_VARIABLE')
  })

  it('should apply default values', async () => {
    const handler = new MCPPromptHandler({
      name: 'default-test',
      description: 'Test defaults',
      template: 'Value: {{value}}',
      variables: {
        value: { type: 'string', default: 'default-value' }
      }
    })

    const result = await handler.execute({})
    expect(result.success).toBe(true)
    expect(result.prompt).toBe('Value: default-value')
  })
})
