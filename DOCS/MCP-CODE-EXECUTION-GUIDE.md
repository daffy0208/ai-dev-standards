# MCP Code Execution Implementation Guide

**Version:** 1.0.0
**Date:** 2025-11-07
**Audience:** MCP Developers, AI Engineers

---

## Overview

This guide helps you implement Model Context Protocol (MCP) servers with code execution capabilities, following best practices from Anthropic's engineering team and production experience.

---

## When to Use Code Execution

### ✅ Good Use Cases

1. **Multi-Step Operations:**
   - Complex workflows requiring multiple tool calls
   - Data transformation pipelines
   - Batch processing operations

2. **Dynamic Tool Composition:**
   - Workflow depends on runtime conditions
   - Need to combine tools in various ways
   - Iterative refinement required

3. **Context Efficiency:**
   - Reducing token usage for repetitive operations
   - Working with large datasets
   - Long-running analysis tasks

### ❌ Avoid Code Execution For

1. **Simple Operations:**
   - Single API calls
   - Basic CRUD operations
   - Direct tool invocations

2. **High-Risk Operations:**
   - Sensitive data processing without proper sandboxing
   - System-level modifications
   - Operations requiring strict guarantees

---

## Implementation Steps

### Step 1: Define Your MCP Server

```typescript
// server.ts
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

const server = new Server(
  {
    name: 'code-executor-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
      resources: {},
    },
  }
);
```

### Step 2: Implement Secure Code Execution

```typescript
import { VM } from 'vm2';

interface ExecutionContext {
  memory_limit: string;
  timeout: number;
  allowed_modules: string[];
}

class SecureExecutor {
  private vm: VM;
  
  constructor(config: ExecutionContext) {
    this.vm = new VM({
      timeout: config.timeout * 1000,
      sandbox: {},
      eval: false,
      wasm: false,
    });
  }
  
  async execute(code: string, context: Record<string, any>) {
    try {
      // Inject safe context
      const safeContext = this.sanitizeContext(context);
      
      // Execute code
      const result = this.vm.run(code, { context: safeContext });
      
      return {
        success: true,
        output: result,
        error: null,
      };
    } catch (error) {
      return {
        success: false,
        output: null,
        error: error.message,
      };
    }
  }
  
  private sanitizeContext(context: Record<string, any>) {
    // Remove sensitive or dangerous objects
    const { process, require, module, __dirname, __filename, ...safe } = context;
    return safe;
  }
}
```

### Step 3: Register Code Execution Tools

```typescript
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'execute_javascript',
        description: 'Execute JavaScript code in a secure sandbox',
        inputSchema: {
          type: 'object',
          properties: {
            code: {
              type: 'string',
              description: 'JavaScript code to execute',
            },
            context: {
              type: 'object',
              description: 'Variables to make available in the execution context',
              default: {},
            },
            timeout: {
              type: 'number',
              description: 'Execution timeout in seconds (max 900)',
              default: 60,
              maximum: 900,
            },
          },
          required: ['code'],
        },
      },
      {
        name: 'execute_python',
        description: 'Execute Python code in a secure sandbox',
        inputSchema: {
          type: 'object',
          properties: {
            code: {
              type: 'string',
              description: 'Python code to execute',
            },
            context: {
              type: 'object',
              description: 'Variables to inject into execution context',
              default: {},
            },
            timeout: {
              type: 'number',
              description: 'Execution timeout in seconds (max 900)',
              default: 60,
              maximum: 900,
            },
          },
          required: ['code'],
        },
      },
    ],
  };
});
```

### Step 4: Handle Tool Calls

```typescript
import { CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  switch (name) {
    case 'execute_javascript': {
      const executor = new SecureExecutor({
        memory_limit: '4GB',
        timeout: args.timeout || 60,
        allowed_modules: ['fs', 'path'],
      });
      
      const result = await executor.execute(args.code, args.context || {});
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }
    
    case 'execute_python': {
      // Implementation for Python execution
      // Use child_process.spawn with Python in isolated environment
      const result = await executePython(args.code, args.context, args.timeout);
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }
    
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});
```

### Step 5: Add Safety Checks

```typescript
function validateCode(code: string, language: 'javascript' | 'python'): boolean {
  // Check for dangerous patterns
  const dangerousPatterns = [
    /require\s*\(\s*['"]child_process['"]\s*\)/,
    /eval\s*\(/,
    /__import__\s*\(\s*['"]os['"]\s*\)/,
    /exec\s*\(/,
    /system\s*\(/,
  ];
  
  for (const pattern of dangerousPatterns) {
    if (pattern.test(code)) {
      return false;
    }
  }
  
  return true;
}

// Use in execution handler
if (!validateCode(args.code, 'javascript')) {
  throw new Error('Code contains dangerous patterns');
}
```

---

## Security Checklist

### Pre-Execution

- [ ] Code validated for dangerous patterns
- [ ] Resource limits configured (memory, timeout)
- [ ] Sandbox environment initialized
- [ ] Input sanitized and validated
- [ ] Context contains only safe data

### During Execution

- [ ] Execution isolated from host system
- [ ] Network access restricted as needed
- [ ] File system access limited to workspace
- [ ] Resource usage monitored
- [ ] Timeout enforced

### Post-Execution

- [ ] Output sanitized before returning
- [ ] Execution logs recorded
- [ ] Resources cleaned up
- [ ] Errors handled gracefully
- [ ] Metrics collected

---

## Testing Your MCP Server

### Unit Test Example

```typescript
import { describe, it, expect } from 'vitest';

describe('SecureExecutor', () => {
  it('executes simple JavaScript', async () => {
    const executor = new SecureExecutor({
      memory_limit: '4GB',
      timeout: 10,
      allowed_modules: [],
    });
    
    const result = await executor.execute('return 2 + 2;', {});
    
    expect(result.success).toBe(true);
    expect(result.output).toBe(4);
  });
  
  it('blocks dangerous code', async () => {
    const executor = new SecureExecutor({
      memory_limit: '4GB',
      timeout: 10,
      allowed_modules: [],
    });
    
    const code = 'require("child_process").exec("rm -rf /");';
    
    expect(() => executor.execute(code, {})).toThrow();
  });
  
  it('enforces timeout', async () => {
    const executor = new SecureExecutor({
      memory_limit: '4GB',
      timeout: 1,
      allowed_modules: [],
    });
    
    const code = 'while(true) {}';
    
    await expect(executor.execute(code, {})).rejects.toThrow('timeout');
  });
});
```

### Integration Test Example

```typescript
import { Client } from '@modelcontextprotocol/sdk/client/index.js';

describe('Code Executor MCP', () => {
  let client: Client;
  
  beforeAll(async () => {
    client = await setupMCPClient('code-executor-mcp');
  });
  
  it('executes code via MCP tool', async () => {
    const result = await client.callTool({
      name: 'execute_javascript',
      arguments: {
        code: 'return Math.sqrt(16);',
      },
    });
    
    const output = JSON.parse(result.content[0].text);
    expect(output.success).toBe(true);
    expect(output.output).toBe(4);
  });
});
```

---

## Performance Optimization

### 1. Environment Reuse

```typescript
class ExecutorPool {
  private pool: SecureExecutor[] = [];
  private maxSize = 10;
  
  async acquire(): Promise<SecureExecutor> {
    if (this.pool.length > 0) {
      return this.pool.pop()!;
    }
    return new SecureExecutor(config);
  }
  
  release(executor: SecureExecutor) {
    if (this.pool.length < this.maxSize) {
      this.pool.push(executor);
    }
  }
}
```

### 2. Code Caching

```typescript
class CodeCache {
  private cache = new Map<string, CompiledCode>();
  
  compile(code: string): CompiledCode {
    const hash = this.hash(code);
    
    if (this.cache.has(hash)) {
      return this.cache.get(hash)!;
    }
    
    const compiled = this.compileCode(code);
    this.cache.set(hash, compiled);
    return compiled;
  }
}
```

### 3. Parallel Execution

```typescript
async function executeBatch(codes: string[]) {
  const results = await Promise.all(
    codes.map(code => executor.execute(code, {}))
  );
  return results;
}
```

---

## Monitoring and Debugging

### Logging

```typescript
import { logger } from './logger';

async execute(code: string, context: any) {
  logger.info('Starting execution', {
    codeLength: code.length,
    contextKeys: Object.keys(context),
  });
  
  const startTime = Date.now();
  
  try {
    const result = await this.vm.run(code, { context });
    
    logger.info('Execution completed', {
      duration: Date.now() - startTime,
      success: true,
    });
    
    return result;
  } catch (error) {
    logger.error('Execution failed', {
      duration: Date.now() - startTime,
      error: error.message,
    });
    throw error;
  }
}
```

### Metrics

```typescript
class ExecutionMetrics {
  private metrics = {
    totalExecutions: 0,
    successfulExecutions: 0,
    failedExecutions: 0,
    averageExecutionTime: 0,
    totalExecutionTime: 0,
  };
  
  recordExecution(success: boolean, duration: number) {
    this.metrics.totalExecutions++;
    if (success) {
      this.metrics.successfulExecutions++;
    } else {
      this.metrics.failedExecutions++;
    }
    this.metrics.totalExecutionTime += duration;
    this.metrics.averageExecutionTime = 
      this.metrics.totalExecutionTime / this.metrics.totalExecutions;
  }
  
  getMetrics() {
    return { ...this.metrics };
  }
}
```

---

## Example: Complete MCP Server

A complete reference implementation is planned for future addition to the EXAMPLES directory. In the meantime, this guide provides all the code snippets and patterns needed to build a working MCP server with code execution capabilities.

Key components covered in this guide:
- Server setup and configuration
- Secure code execution implementation
- Tool registration and handling
- Security validation and sandboxing
- Testing strategies
- Performance optimization
- Monitoring and debugging

---

## Common Patterns

### Pattern 1: File Operations

```typescript
// Tool for safe file operations
{
  name: 'execute_file_operation',
  description: 'Perform file operations in the workspace',
  inputSchema: {
    type: 'object',
    properties: {
      operation: {
        type: 'string',
        enum: ['read', 'write', 'list', 'search'],
      },
      path: {
        type: 'string',
        description: 'File path relative to workspace',
      },
      content: {
        type: 'string',
        description: 'Content for write operations',
      },
    },
    required: ['operation', 'path'],
  },
}
```

### Pattern 2: Data Transformation

```typescript
// Tool for data transformation pipelines
{
  name: 'execute_transformation',
  description: 'Execute data transformation pipeline',
  inputSchema: {
    type: 'object',
    properties: {
      data: {
        type: 'array',
        description: 'Input data to transform',
      },
      transformations: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            operation: { type: 'string' },
            params: { type: 'object' },
          },
        },
      },
    },
    required: ['data', 'transformations'],
  },
}
```

### Pattern 3: Batch Processing

```typescript
// Tool for batch operations
{
  name: 'execute_batch',
  description: 'Execute operations on multiple items',
  inputSchema: {
    type: 'object',
    properties: {
      items: {
        type: 'array',
        description: 'Items to process',
      },
      operation: {
        type: 'string',
        description: 'Operation to perform on each item',
      },
      parallel: {
        type: 'boolean',
        description: 'Execute in parallel',
        default: false,
      },
    },
    required: ['items', 'operation'],
  },
}
```

---

## Troubleshooting

### Issue: Code Execution Timeout

**Symptoms:**
- Operations fail with timeout errors
- Long-running operations incomplete

**Solutions:**
1. Increase timeout for legitimate long operations
2. Break down operations into smaller chunks
3. Implement progress reporting
4. Use async execution with polling

### Issue: Memory Limit Exceeded

**Symptoms:**
- Out of memory errors
- Process crashes during execution

**Solutions:**
1. Increase memory limit if justified
2. Process data in streams
3. Implement pagination
4. Clear unused variables

### Issue: Security Violations

**Symptoms:**
- Blocked operations
- Permission errors

**Solutions:**
1. Review security policies
2. Adjust allowed operations
3. Use proper sandboxing
4. Validate input thoroughly

---

## Next Steps

1. **Review:** [MCP Code Execution Best Practices](../STANDARDS/best-practices/mcp-code-execution-best-practices.md)
2. **Practice:** Build a simple MCP server with code execution using the patterns in this guide
3. **Test:** Write comprehensive tests for security and functionality
4. **Deploy:** Follow deployment guidelines in [MCP Development Roadmap](./MCP-DEVELOPMENT-ROADMAP.md)
5. **Reference:** Check existing MCPs in the repository for additional implementation examples

---

## References

- [MCP Code Execution Best Practices](../../STANDARDS/best-practices/mcp-code-execution-best-practices.md)
- [Security Best Practices](../../STANDARDS/best-practices/security-best-practices.md)
- [MCP Development Roadmap](./MCP-DEVELOPMENT-ROADMAP.md)
- [Anthropic Engineering: Code Execution with MCP](https://www.anthropic.com/engineering/code-execution-with-mcp)

---

## Version History

- **1.0.0** (2025-11-07): Initial guide based on Anthropic best practices
