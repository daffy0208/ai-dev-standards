/**
 * Unit tests for MCP Server Components
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { BaseMCPServer, MCPToolHandler, MCPResourceHandler, MCPPromptHandler } from '../../../COMPONENTS/mcp-servers';
import { z } from 'zod';

describe('BaseMCPServer', () => {
  let server: BaseMCPServer;

  beforeEach(async () => {
    class TestServer extends BaseMCPServer {
      constructor() {
        super({
          name: 'test-server',
          version: '1.0.0',
          description: 'Test MCP server'
        });
      }
    }

    server = new TestServer();
    await server.initialize();
  });

  it('should initialize successfully', () => {
    expect(server.getHealth().initialized).toBe(true);
  });

  it('should register and invoke tools', async () => {
    const mockTool = {
      name: 'test_tool',
      description: 'Test tool',
      inputSchema: z.object({ message: z.string() }),
      handler: async (args: any) => ({ echo: args.message })
    };

    // @ts-expect-error - accessing protected method for testing
    server.addTool(mockTool);

    const result = await server.invokeTool('test_tool', { message: 'hello' });
    expect(result).toEqual({ echo: 'hello' });
  });

  it('should list registered tools', () => {
    expect(server.listTools()).toBeInstanceOf(Array);
  });
});

describe('MCPToolHandler', () => {
  it('should execute tool successfully', async () => {
    const handler = new MCPToolHandler({
      name: 'echo',
      description: 'Echo tool',
      inputSchema: z.object({ message: z.string() }),
      handler: async (args) => ({ message: args.message })
    });

    const result = await handler.execute({ message: 'test' });
    expect(result.success).toBe(true);
    expect(result.data).toEqual({ message: 'test' });
  });

  it('should validate input schema', async () => {
    const handler = new MCPToolHandler({
      name: 'echo',
      description: 'Echo tool',
      inputSchema: z.object({ message: z.string() }),
      handler: async (args) => args
    });

    const result = await handler.execute({ message: 123 }); // Invalid type
    expect(result.success).toBe(false);
    expect(result.error?.code).toBe('VALIDATION_ERROR');
  });

  it('should cache results', async () => {
    const handler = new MCPToolHandler({
      name: 'expensive',
      description: 'Expensive operation',
      inputSchema: z.object({ value: z.number() }),
      handler: async (args) => ({ result: args.value * 2 }),
      cache: { enabled: true, ttl: 10000 }
    });

    // First call
    const result1 = await handler.execute({ value: 5 });
    expect(result1.metadata.cached).toBe(false);

    // Second call should be cached
    const result2 = await handler.execute({ value: 5 });
    expect(result2.metadata.cached).toBe(true);
  });

  it('should enforce rate limits', async () => {
    const handler = new MCPToolHandler({
      name: 'limited',
      description: 'Rate limited tool',
      inputSchema: z.object({}),
      handler: async () => ({ success: true }),
      rateLimits: { maxCalls: 2, windowMs: 60000 }
    });

    // First two calls should succeed
    await handler.execute({}, 'user1');
    await handler.execute({}, 'user1');

    // Third call should fail
    const result = await handler.execute({}, 'user1');
    expect(result.success).toBe(false);
    expect(result.error?.code).toBe('RATE_LIMIT_EXCEEDED');
  });
});

describe('MCPResourceHandler', () => {
  it('should retrieve resource content', async () => {
    const handler = new MCPResourceHandler({
      uri: 'test://resource',
      name: 'Test Resource',
      description: 'Test resource',
      handler: async () => 'Resource content'
    });

    const result = await handler.get();
    expect(result.success).toBe(true);
    expect(result.content).toBe('Resource content');
  });

  it('should cache resource content', async () => {
    const handler = new MCPResourceHandler({
      uri: 'test://cached',
      name: 'Cached Resource',
      description: 'Cached resource',
      handler: async () => 'Content',
      cache: { enabled: true, ttl: 10000 }
    });

    const result1 = await handler.get();
    expect(result1.cached).toBe(false);

    const result2 = await handler.get();
    expect(result2.cached).toBe(true);
  });
});

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
    });

    const result = await handler.execute({ name: 'Alice', age: 30 });
    expect(result.success).toBe(true);
    expect(result.prompt).toBe('Hello, Alice! You are 30 years old.');
  });

  it('should validate required variables', async () => {
    const handler = new MCPPromptHandler({
      name: 'test',
      description: 'Test prompt',
      template: 'Required: {{value}}',
      variables: {
        value: { type: 'string', required: true }
      }
    });

    const result = await handler.execute({});
    expect(result.success).toBe(false);
    expect(result.error?.code).toBe('MISSING_REQUIRED_VARIABLE');
  });

  it('should apply default values', async () => {
    const handler = new MCPPromptHandler({
      name: 'default-test',
      description: 'Test defaults',
      template: 'Value: {{value}}',
      variables: {
        value: { type: 'string', default: 'default-value' }
      }
    });

    const result = await handler.execute({});
    expect(result.success).toBe(true);
    expect(result.prompt).toBe('Value: default-value');
  });
});
