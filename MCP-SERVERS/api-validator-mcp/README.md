# API Validator MCP Server

JSON Schema validation for API requests and responses with automatic schema generation.

## What This MCP Does

- ✅ Validates JSON data against schemas
- 🔍 Validates API requests/responses
- 🎯 Generates schemas from example data
- 📋 Manages multiple validation schemas
- 🛠️ Supports OpenAPI/JSON Schema formats
- ⚡ Fast AJV-based validation

## Installation

```bash
cd MCP-SERVERS/api-validator-mcp
npm install
npm run build
```

## Setup

Add to your MCP settings:

```json
{
  "mcpServers": {
    "api-validator": {
      "command": "node",
      "args": ["/path/to/api-validator-mcp/dist/index.js"]
    }
  }
}
```

## Features

### 1. Register Schemas

```javascript
// Register a validation schema
await apiValidator.register_schema({
  id: 'user-create-request',
  name: 'User Creation Request',
  type: 'request',
  schema: {
    type: 'object',
    properties: {
      email: { type: 'string', format: 'email' },
      name: { type: 'string', minLength: 1 },
      age: { type: 'integer', minimum: 18 }
    },
    required: ['email', 'name']
  }
})
```

### 2. Validate Requests

```javascript
// Validate API request
const result = await apiValidator.validate_request({
  schemaId: 'user-create-request',
  data: {
    email: 'user@example.com',
    name: 'John Doe',
    age: 25
  }
})

// Returns:
{
  valid: true,
  schemaId: 'user-create-request',
  schemaName: 'User Creation Request'
}
```

### 3. Validate Responses

```javascript
// Validate API response
const result = await apiValidator.validate_response({
  schemaId: 'user-response',
  statusCode: 200,
  data: {
    id: '123',
    email: 'user@example.com',
    name: 'John Doe',
    createdAt: '2024-01-01T00:00:00Z'
  }
})
```

### 4. Generate Schemas

```javascript
// Automatically generate schema from example data
const result = await apiValidator.generate_schema({
  name: 'Product Schema',
  data: {
    id: 1,
    name: 'Widget',
    price: 29.99,
    inStock: true,
    tags: ['electronics', 'gadgets']
  }
})

// Returns:
{
  name: 'Product Schema',
  schema: {
    type: 'object',
    properties: {
      id: { type: 'integer' },
      name: { type: 'string' },
      price: { type: 'number' },
      inStock: { type: 'boolean' },
      tags: {
        type: 'array',
        items: { type: 'string' }
      }
    },
    required: ['id', 'name', 'price', 'inStock', 'tags']
  }
}
```

### 5. Validation Errors

```javascript
// Invalid data returns detailed errors
const result = await apiValidator.validate_request({
  schemaId: 'user-create-request',
  data: {
    email: 'invalid-email',
    age: 15
  }
})

// Returns:
{
  valid: false,
  errors: [
    {
      path: '/email',
      message: 'must match format "email"',
      keyword: 'format'
    },
    {
      path: '/',
      message: "must have required property 'name'",
      keyword: 'required'
    },
    {
      path: '/age',
      message: 'must be >= 18',
      keyword: 'minimum'
    }
  ]
}
```

## Usage in Claude Code

```
User: "Validate this API request against our user creation schema"

Claude: *Uses api-validator MCP to validate*

Result:
❌ Validation Failed:
- /email: must match format "email"
- /: must have required property 'name'
- /age: must be >= 18

Let me fix these issues...
```

## Advanced Features

### Complex Schema Validation

```javascript
// Register complex nested schema
await apiValidator.register_schema({
  id: 'order-request',
  name: 'Order Request',
  type: 'request',
  schema: {
    type: 'object',
    properties: {
      userId: { type: 'string', format: 'uuid' },
      items: {
        type: 'array',
        minItems: 1,
        items: {
          type: 'object',
          properties: {
            productId: { type: 'string' },
            quantity: { type: 'integer', minimum: 1 },
            price: { type: 'number', minimum: 0 }
          },
          required: ['productId', 'quantity', 'price']
        }
      },
      shippingAddress: {
        type: 'object',
        properties: {
          street: { type: 'string' },
          city: { type: 'string' },
          zipCode: { type: 'string', pattern: '^[0-9]{5}$' }
        },
        required: ['street', 'city', 'zipCode']
      }
    },
    required: ['userId', 'items', 'shippingAddress']
  }
})
```

### Format Validation

Supports standard JSON Schema formats:
- `email` - Email addresses
- `uuid` - UUIDs
- `date` - Dates (YYYY-MM-DD)
- `date-time` - ISO 8601 timestamps
- `uri` - URIs
- `hostname` - Hostnames
- `ipv4` / `ipv6` - IP addresses

## Integration with Testing

```typescript
// Use in tests
import { test, expect } from 'vitest'

test('API returns valid response', async () => {
  const response = await fetch('/api/users/123')
  const data = await response.json()
  
  const validation = await apiValidator.validate_response({
    schemaId: 'user-response',
    statusCode: response.status,
    data
  })
  
  expect(validation.valid).toBe(true)
})
```

## Tools Available

- `register_schema` - Register a JSON Schema
- `validate_request` - Validate API request
- `validate_response` - Validate API response
- `validate_data` - Validate arbitrary data
- `generate_schema` - Generate schema from example
- `list_schemas` - List all registered schemas
- `remove_schema` - Remove a schema

## Best Practices

1. **Schema Organization**
   - Register schemas at startup
   - Use descriptive IDs and names
   - Version your schemas (e.g., `user-v1`, `user-v2`)

2. **Validation Strategy**
   - Validate at API boundaries (requests/responses)
   - Generate schemas from real data examples
   - Review and refine generated schemas

3. **Error Handling**
   - Log validation errors for debugging
   - Return user-friendly error messages
   - Track validation failure rates

4. **Performance**
   - Schemas are compiled once and cached
   - Validation is fast (microseconds)
   - No runtime schema compilation overhead

## Related Skills

- **api-designer** - Design APIs with validation
- **testing-strategist** - Integration testing with validation
- **backend-builder** - Build validated APIs

Let's build robust APIs with automatic validation!

