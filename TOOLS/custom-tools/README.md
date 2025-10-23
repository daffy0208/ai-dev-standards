# AI Framework Tools

Production-ready tools for AI agents and frameworks.

## Overview

This collection provides 4 essential tools that enable AI agents to interact with the real world:

1. **Web Scraper Tool** - Extract content from web pages
2. **API Caller Tool** - Make HTTP requests to APIs
3. **File System Tool** - Safe file operations
4. **Database Query Tool** - Execute SQL queries

All tools are designed with:
- **Safety** - Validation, sandboxing, read-only modes
- **Error Handling** - Comprehensive error messages
- **Type Safety** - Full TypeScript types
- **AI Integration** - Tool definitions for function calling
- **Production Ready** - Retry logic, timeouts, rate limiting

## Tools

### 1. Web Scraper Tool

Extract content from web pages using Playwright.

**Features:**
- HTML, text, or markdown extraction
- Element extraction by CSS selector
- Screenshot capture
- PDF generation
- JavaScript execution
- Rate limiting
- Cookie/auth support

**Usage:**
```typescript
import { WebScraperTool } from './web-scraper-tool'

const scraper = new WebScraperTool()

// Scrape as markdown
const result = await scraper.scrape({
  url: 'https://example.com',
  format: 'markdown'
})

// Extract specific elements
const data = await scraper.extract({
  url: 'https://example.com/products',
  selectors: {
    title: 'h1',
    price: '.price',
    description: '.description'
  }
})
```

**Setup:**
```bash
npm install playwright
npx playwright install chromium
```

### 2. API Caller Tool

Make HTTP requests with authentication and retry logic.

**Features:**
- All HTTP methods (GET, POST, PUT, PATCH, DELETE)
- Authentication (Bearer, API Key, Basic)
- Request/response handling
- Retry with exponential backoff
- Timeout handling
- Batch requests

**Usage:**
```typescript
import { ApiCallerTool } from './api-caller-tool'

const api = new ApiCallerTool()

// GET request
const users = await api.get('https://api.example.com/users')

// POST with auth
const result = await api.post('https://api.example.com/users', {
  body: { name: 'John', email: 'john@example.com' },
  auth: { type: 'bearer', token: 'your-token' }
})

// Complex request with retry
const data = await api.request({
  url: 'https://api.example.com/data',
  method: 'POST',
  headers: { 'X-Custom': 'value' },
  body: { key: 'value' },
  retry: { attempts: 3, delayMs: 1000, exponentialBackoff: true }
})
```

**Setup:**
```bash
# No additional dependencies needed
```

### 3. File System Tool

Safe file operations with sandboxing and backups.

**Features:**
- Read/write files (text, JSON, binary)
- List directory contents
- Search files (glob patterns)
- File metadata
- Compression (gzip)
- Automatic backups
- Path validation

**Usage:**
```typescript
import { FileSystemTool } from './filesystem-tool'

const fs = new FileSystemTool({
  allowedPaths: ['/path/to/project']
})

// Read file
const content = await fs.readFile('/path/to/project/file.txt')

// Write JSON
await fs.writeFile('/path/to/project/data.json', { key: 'value' }, { json: true })

// Search files
const tsFiles = await fs.searchFiles('/path/to/project', '**/*.ts')

// List directory
const files = await fs.listDirectory('/path/to/project', { recursive: true })
```

**Setup:**
```bash
npm install glob
```

**Safety:**
- All operations restricted to `allowedPaths`
- Automatic backups before overwrites
- Path traversal prevention
- No system file deletion

### 4. Database Query Tool

Execute safe SQL queries with parameterization.

**Features:**
- PostgreSQL, MySQL, SQLite support
- Parameterized queries (prevents SQL injection)
- Read-only mode
- Transaction support
- Connection pooling
- Table introspection

**Usage:**
```typescript
import { DatabaseQueryTool } from './database-query-tool'

const db = new DatabaseQueryTool({
  type: 'postgres',
  connection: {
    host: 'localhost',
    database: 'mydb',
    user: 'user',
    password: 'pass'
  },
  readOnly: true
})

// Execute query with parameters
const users = await db.query(
  'SELECT * FROM users WHERE age > $1 AND status = $2',
  [18, 'active']
)

// Get table schema
const schema = await db.getTableSchema('users')

// List tables
const tables = await db.listTables()

// Transaction (requires readOnly: false)
await db.transaction(async (tx) => {
  await tx.query('INSERT INTO users (name) VALUES ($1)', ['John'])
  await tx.query('UPDATE accounts SET balance = balance + $1', [100])
})
```

**Setup:**
```bash
npm install pg mysql2 sqlite3 sqlite
```

**Safety:**
- Read-only mode by default
- Parameterized queries only
- Query validation
- No DROP/TRUNCATE in safe mode

## AI Framework Integration

All tools provide function definitions for AI frameworks:

```typescript
import {
  webScraperToolDefinition,
  executeWebScraperTool
} from './web-scraper-tool'

import {
  apiCallerToolDefinition,
  executeApiCallerTool
} from './api-caller-tool'

import {
  fileSystemToolDefinition,
  executeFileSystemTool
} from './filesystem-tool'

import {
  databaseQueryToolDefinition,
  executeDatabaseQueryTool
} from './database-query-tool'

// Use with OpenAI function calling
const tools = [
  webScraperToolDefinition,
  apiCallerToolDefinition,
  fileSystemToolDefinition,
  databaseQueryToolDefinition
]

// Execute tool based on AI decision
async function executeTool(toolName: string, args: any) {
  switch (toolName) {
    case 'web_scraper':
      return executeWebScraperTool(args)
    case 'api_caller':
      return executeApiCallerTool(args)
    case 'filesystem':
      return executeFileSystemTool(args, {
        allowedPaths: [process.cwd()]
      })
    case 'database_query':
      return executeDatabaseQueryTool(args, {
        type: 'postgres',
        connection: { /* ... */ },
        readOnly: true
      })
  }
}
```

## Complete Agent Example

```typescript
import { OpenAIClient } from '../../INTEGRATIONS/llm-providers/openai-client'
import { WebScraperTool, webScraperToolDefinition } from './web-scraper-tool'
import { ApiCallerTool, apiCallerToolDefinition } from './api-caller-tool'

async function runAgent() {
  const openai = new OpenAIClient()
  const scraper = new WebScraperTool()
  const api = new ApiCallerTool()

  const tools = [
    webScraperToolDefinition,
    apiCallerToolDefinition
  ]

  try {
    // Agent decides which tools to use
    const response = await openai.chat({
      messages: [
        {
          role: 'user',
          content: 'Get the latest news from example.com and post a summary to my API'
        }
      ],
      functions: tools,
      functionCall: 'auto'
    })

    // Execute tool calls
    if (response.functionCall) {
      const { name, arguments: args } = response.functionCall

      if (name === 'web_scraper') {
        const result = await scraper.scrape({
          url: args.url,
          format: 'markdown'
        })
        console.log('Scraped:', result.content)
      }

      if (name === 'api_caller') {
        const result = await api.post(args.url, {
          body: args.body
        })
        console.log('Posted:', result.data)
      }
    }
  } finally {
    await scraper.close()
  }
}
```

## Tool Comparison

| Tool | Use Case | Safety | Dependencies |
|------|----------|--------|--------------|
| **Web Scraper** | Extract web content | Rate limiting, user agent | playwright |
| **API Caller** | HTTP requests | Retry logic, timeout | none |
| **File System** | File operations | Path validation, backups | glob |
| **Database** | SQL queries | Parameterized, read-only | pg, mysql2, sqlite |

## Best Practices

### 1. Always Use Parameterized Queries
```typescript
// ✅ GOOD - Parameterized
await db.query('SELECT * FROM users WHERE id = $1', [userId])

// ❌ BAD - String interpolation (SQL injection risk)
await db.query(`SELECT * FROM users WHERE id = ${userId}`)
```

### 2. Enable Safety Features
```typescript
// File system - restrict paths
const fs = new FileSystemTool({
  allowedPaths: ['/safe/directory'],
  enableBackups: true
})

// Database - use read-only mode
const db = new DatabaseQueryTool({
  type: 'postgres',
  connection: { /* ... */ },
  readOnly: true // ✅ Safe by default
})
```

### 3. Handle Errors Gracefully
```typescript
try {
  const result = await api.get('https://api.example.com/data', {
    retry: { attempts: 3, delayMs: 1000 }
  })
  return result.data
} catch (error) {
  console.error('API call failed:', error)
  return null
}
```

### 4. Rate Limit Web Scraping
```typescript
// Scrape multiple pages with delays
const results = await scraper.scrapeMultiple(urls, {
  concurrency: 2,
  delayMs: 1000 // 1 second between batches
})
```

### 5. Close Connections
```typescript
const scraper = new WebScraperTool()
const db = new DatabaseQueryTool(config)

try {
  // Use tools
} finally {
  await scraper.close()
  await db.close()
}
```

## Environment Variables

```env
# Database connections
DATABASE_URL=postgresql://user:pass@localhost:5432/dbname
MYSQL_URL=mysql://user:pass@localhost:3306/dbname
SQLITE_FILE=/path/to/database.db

# API authentication
API_KEY=your-api-key
API_TOKEN=your-bearer-token

# Web scraping
USER_AGENT=MyBot/1.0
```

## Error Handling

All tools throw descriptive errors:

```typescript
try {
  await fs.readFile('/path/outside/allowed')
} catch (error) {
  // Error: Access denied: /path/outside/allowed is outside allowed paths
}

try {
  await db.query('DROP TABLE users')
} catch (error) {
  // Error: Dangerous operations not allowed
}

try {
  await api.get('https://invalid-url', { timeout: 5000 })
} catch (error) {
  // Error: Request timeout after 5000ms
}
```

## Performance

### Connection Pooling
Database tool uses connection pooling by default:
```typescript
const db = new DatabaseQueryTool({
  type: 'postgres',
  connection: { /* ... */ },
  maxConnections: 10 // Pool size
})
```

### Parallel Operations
```typescript
// Scrape multiple pages in parallel
const results = await scraper.scrapeMultiple(urls, {
  concurrency: 3 // 3 pages at a time
})

// Make multiple API calls
const responses = await api.batchRequest([
  { url: 'https://api.example.com/users', method: 'GET' },
  { url: 'https://api.example.com/posts', method: 'GET' }
])
```

## Security Considerations

1. **Web Scraper**
   - Respects robots.txt (implement if needed)
   - Rate limiting to avoid overwhelming servers
   - User agent identification

2. **API Caller**
   - Never log sensitive tokens/keys
   - Use environment variables for credentials
   - Validate SSL certificates

3. **File System**
   - Restricted to allowed paths
   - No path traversal (../)
   - Automatic backups prevent data loss

4. **Database**
   - Parameterized queries prevent SQL injection
   - Read-only mode by default
   - No dangerous operations (DROP, TRUNCATE)

## Testing

```typescript
import { describe, it, expect } from 'vitest'
import { ApiCallerTool } from './api-caller-tool'

describe('ApiCallerTool', () => {
  it('should make GET request', async () => {
    const api = new ApiCallerTool()
    const result = await api.get('https://jsonplaceholder.typicode.com/users/1')

    expect(result.status).toBe(200)
    expect(result.data).toHaveProperty('id')
  })

  it('should handle auth', async () => {
    const api = new ApiCallerTool()
    const result = await api.get('https://api.example.com/protected', {
      auth: { type: 'bearer', token: 'test-token' }
    })

    expect(result.status).toBe(200)
  })
})
```

## Contributing

When adding new tools:

1. Follow the existing tool structure
2. Include comprehensive examples
3. Add type definitions for AI integration
4. Document safety features
5. Add error handling
6. Include usage examples

## License

MIT

---

**Built for ai-dev-standards** - Production-ready AI development tools.
