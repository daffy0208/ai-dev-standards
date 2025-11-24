# MCP Server Components

Base components and patterns for building Model Context Protocol (MCP) servers.

## Components

### 1. BaseMCPServer

Foundation class for all MCP servers. Provides standard patterns for:

- Tool registration and invocation
- Resource registration and access
- Prompt registration and execution
- Error handling
- Logging and monitoring
- Health checks

**File**: `base-mcp-server.ts`

**Usage**:

```typescript
import { BaseMCPServer } from './base-mcp-server'

class MyMCPServer extends BaseMCPServer {
  constructor() {
    super({
      name: 'my-mcp-server',
      version: '1.0.0',
      description: 'My custom MCP server'
    })
  }

  async initialize(): Promise<void> {
    await super.initialize()

    // Register your tools, resources, and prompts
    this.addTool({
      name: 'my_tool',
      description: 'Does something useful',
      inputSchema: z.object({ query: z.string() }),
      handler: async args => {
        return { result: 'success' }
      }
    })
  }
}

// Use the server
const server = new MyMCPServer()
await server.initialize()
const result = await server.invokeTool('my_tool', { query: 'test' })
```

### 2. MCPToolHandler

Standardized tool handling with advanced features:

- Input/output validation
- Rate limiting
- Caching
- Retry logic with backoff
- Timeout handling
- Performance metrics

**File**: `mcp-tool-handler.ts`

**Usage**:

```typescript
import { MCPToolHandler } from './mcp-tool-handler'
import { z } from 'zod'

const toolHandler = new MCPToolHandler({
  name: 'search',
  description: 'Search documents',
  inputSchema: z.object({
    query: z.string(),
    limit: z.number().optional()
  }),
  handler: async args => {
    // Your tool implementation
    return { results: [] }
  },
  rateLimits: {
    maxCalls: 100,
    windowMs: 60000 // 100 calls per minute
  },
  cache: {
    ttl: 300000, // 5 minutes
    enabled: true
  },
  retries: {
    maxAttempts: 3,
    backoffMs: 1000,
    backoffStrategy: 'exponential'
  }
})

const result = await toolHandler.execute({ query: 'test' })
if (result.success) {
  console.log(result.data)
}
```

### 3. MCPResourceHandler

Handles resource access with:

- Content caching
- Version management
- ETags for cache validation
- Access control
- Size limiting

**File**: `mcp-resource-handler.ts`

**Usage**:

```typescript
import { MCPResourceHandler } from './mcp-resource-handler'

const resourceHandler = new MCPResourceHandler({
  uri: 'myapp://docs/readme',
  name: 'README',
  description: 'Application documentation',
  mimeType: 'text/markdown',
  handler: async version => {
    return fs.readFileSync(`README-${version}.md`, 'utf-8')
  },
  cache: {
    enabled: true,
    ttl: 600000, // 10 minutes
    maxSize: 10485760 // 10MB
  },
  versioning: {
    enabled: true,
    currentVersion: '1.0.0',
    availableVersions: ['1.0.0', '1.1.0']
  }
})

const result = await resourceHandler.get({ version: '1.0.0' })
if (result.success) {
  console.log(result.content)
}
```

### 4. MCPPromptHandler

Manages prompt templates with:

- Variable substitution
- Type validation
- Dynamic generation
- Example management
- Prompt validation

**File**: `mcp-prompt-handler.ts`

**Usage**:

```typescript
import { MCPPromptHandler } from './mcp-prompt-handler'

const promptHandler = new MCPPromptHandler({
  name: 'code_review',
  description: 'Generate code review prompt',
  template: `Review the following {{language}} code:

{{code}}

Focus on: {{focus_areas}}`,
  variables: {
    language: {
      type: 'string',
      required: true,
      description: 'Programming language'
    },
    code: {
      type: 'string',
      required: true,
      description: 'Code to review'
    },
    focus_areas: {
      type: 'array',
      default: ['security', 'performance'],
      description: 'Areas to focus on'
    }
  },
  validation: {
    maxLength: 10000,
    minLength: 100
  }
})

const result = await promptHandler.execute({
  language: 'TypeScript',
  code: 'const x = 1;',
  focus_areas: ['security', 'style']
})

if (result.success) {
  console.log(result.prompt)
}
```

## Complete Example: Building an MCP Server

```typescript
import { BaseMCPServer } from './base-mcp-server'
import { MCPToolHandler } from './mcp-tool-handler'
import { MCPResourceHandler } from './mcp-resource-handler'
import { MCPPromptHandler } from './mcp-prompt-handler'
import { z } from 'zod'

class DocumentSearchMCP extends BaseMCPServer {
  private searchTool: MCPToolHandler
  private docsResource: MCPResourceHandler
  private queryPrompt: MCPPromptHandler

  constructor() {
    super({
      name: 'document-search-mcp',
      version: '1.0.0',
      description: 'Search and manage documentation',
      capabilities: ['tools', 'resources', 'prompts']
    })

    // Initialize handlers
    this.searchTool = new MCPToolHandler({
      name: 'search_documents',
      description: 'Search documentation',
      inputSchema: z.object({
        query: z.string(),
        limit: z.number().default(10)
      }),
      handler: async args => {
        // Your search implementation
        return { results: [] }
      },
      rateLimits: { maxCalls: 100, windowMs: 60000 },
      cache: { enabled: true, ttl: 300000 }
    })

    this.docsResource = new MCPResourceHandler({
      uri: 'docs://api',
      name: 'API Documentation',
      description: 'API reference documentation',
      mimeType: 'text/markdown',
      handler: async () => {
        return fs.readFileSync('api-docs.md', 'utf-8')
      },
      cache: { enabled: true, ttl: 600000 }
    })

    this.queryPrompt = new MCPPromptHandler({
      name: 'search_query',
      description: 'Generate search query',
      template: 'Search for: {{query}} in {{category}}',
      variables: {
        query: { type: 'string', required: true },
        category: { type: 'string', default: 'all' }
      }
    })
  }

  async initialize(): Promise<void> {
    await super.initialize()

    // Register tool wrapper
    this.addTool({
      name: 'search_documents',
      description: this.searchTool.getStats().name,
      inputSchema: z.object({ query: z.string(), limit: z.number().optional() }),
      handler: async args => {
        const result = await this.searchTool.execute(args)
        if (!result.success) {
          throw new Error(result.error?.message)
        }
        return result.data
      }
    })

    // Register resource wrapper
    this.addResource({
      uri: 'docs://api',
      name: 'API Documentation',
      description: 'API reference documentation',
      handler: async () => {
        const result = await this.docsResource.get()
        if (!result.success) {
          throw new Error(result.error?.message)
        }
        return result.content!
      }
    })

    // Register prompt wrapper
    this.addPrompt({
      name: 'search_query',
      description: 'Generate search query',
      handler: async args => {
        const result = await this.queryPrompt.execute(args)
        if (!result.success) {
          throw new Error(result.error?.message)
        }
        return result.prompt!
      }
    })
  }

  async shutdown(): Promise<void> {
    this.searchTool.clearCache()
    this.docsResource.clearCache()
    this.queryPrompt.clearCache()
    await super.shutdown()
  }
}

// Usage
const server = new DocumentSearchMCP()
await server.initialize()

// Invoke tool
const searchResults = await server.invokeTool('search_documents', {
  query: 'authentication',
  limit: 5
})

// Access resource
const docs = await server.getResource('docs://api')

// Execute prompt
const query = await server.executePrompt('search_query', {
  query: 'authentication',
  category: 'security'
})

// Get health status
console.log(server.getHealth())

// Cleanup
await server.shutdown()
```

## Best Practices

1. **Always extend BaseMCPServer** - Don't build from scratch
2. **Use handlers for complex logic** - Tool/Resource/Prompt handlers provide advanced features
3. **Enable caching** - Reduce latency and API calls
4. **Set rate limits** - Protect your resources
5. **Validate inputs** - Use Zod schemas for type safety
6. **Handle errors gracefully** - Provide clear error messages
7. **Log appropriately** - Override `log()` method for custom logging
8. **Test thoroughly** - Test all tools, resources, and prompts
9. **Version your resources** - Enable versioning for backward compatibility
10. **Monitor performance** - Use built-in stats methods

## Supported Skills

These components support all 49 MCPs in the ai-dev-standards repository:

- accessibility-checker-mcp
- agent-orchestrator-mcp
- api-validator-mcp
- archon-mcp
- database-migration-mcp
- embedding-generator-mcp
- vector-database-mcp
- And 29 more...

## Related Components

- `COMPONENTS/rag-pipelines/` - RAG implementation components
- `COMPONENTS/workflows/` - Workflow orchestration
- `TOOLS/mcp-tools/` - MCP client tools

## Contributing

When creating new MCP servers:

1. Extend `BaseMCPServer`
2. Use the handler components for consistency
3. Add comprehensive tests
4. Document all tools, resources, and prompts
5. Update the MCP registry

## License

MIT - See LICENSE file for details
