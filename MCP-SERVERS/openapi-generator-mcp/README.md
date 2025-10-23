# OpenAPI Generator MCP Server

Generate and manage OpenAPI/Swagger specifications for API documentation.

## What This MCP Does

- 📝 **Spec Generation** - Create OpenAPI 3.0 specifications
- 🔍 **Code Scanning** - Extract endpoints from Express.js/FastAPI code
- ✅ **Validation** - Validate OpenAPI specs against standard
- 📊 **Schema Management** - Define reusable data models
- 🔐 **Security Schemes** - Configure authentication methods
- 📤 **Export** - Save specs as JSON or YAML

## Installation

```bash
cd MCP-SERVERS/openapi-generator-mcp
npm install
npm run build
```

## Setup

Add to your Claude MCP settings:

```json
{
  "mcpServers": {
    "openapi-generator": {
      "command": "node",
      "args": ["/path/to/openapi-generator-mcp/dist/index.js"]
    }
  }
}
```

## Tools

### 1. initialize_spec
Create new OpenAPI specification.

```typescript
{
  title: string; // 'My API'
  version: string; // '1.0.0'
  description?: string;
  servers?: Array<{
    url: string;
    description?: string;
  }>;
}
```

### 2. add_endpoint
Add API endpoint.

```typescript
{
  method: 'get' | 'post' | 'put' | 'patch' | 'delete';
  path: string; // '/users/{id}'
  summary?: string;
  description?: string;
  parameters?: any[];
  requestBody?: any;
  responses?: Record<string, any>;
  tags?: string[];
  security?: any[];
}
```

### 3. add_schema
Add reusable schema/model.

```typescript
{
  name: string; // 'User'
  schema: {
    type: 'object';
    properties: {
      id: { type: 'string' };
      name: { type: 'string' };
      email: { type: 'string', format: 'email' };
    };
    required: ['id', 'name', 'email'];
  };
}
```

### 4. add_security
Add security scheme.

```typescript
{
  name: string; // 'bearerAuth'
  type: 'apiKey' | 'http' | 'oauth2' | 'openIdConnect';
  scheme?: 'bearer' | 'basic'; // for http
  bearerFormat?: 'JWT'; // for bearer
  in?: 'header' | 'query' | 'cookie'; // for apiKey
  paramName?: string; // for apiKey
}
```

### 5. scan_express_app
Extract endpoints from Express.js code.

```typescript
{
  filePath: string; // './src/app.js'
  baseUrl?: string;
}
```

### 6. scan_fastapi_app
Extract endpoints from FastAPI code.

```typescript
{
  filePath: string; // './app/main.py'
}
```

### 7. validate_spec
Validate current OpenAPI spec.

### 8. export_spec
Export specification to file.

```typescript
{
  outputPath: string; // './openapi.json'
  format?: 'json' | 'yaml'; // default: 'json'
}
```

### 9. generate_examples
Auto-generate example values for schemas.

## Usage Example

```javascript
// 1. Initialize spec
await generator.initialize_spec({
  title: 'Task Management API',
  version: '1.0.0',
  description: 'API for managing tasks',
  servers: [
    { url: 'https://api.example.com', description: 'Production' },
    { url: 'http://localhost:3000', description: 'Development' },
  ],
});

// 2. Add security
await generator.add_security({
  name: 'bearerAuth',
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT',
});

// 3. Add schemas
await generator.add_schema({
  name: 'Task',
  schema: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
      title: { type: 'string' },
      completed: { type: 'boolean' },
      createdAt: { type: 'string', format: 'date-time' },
    },
    required: ['id', 'title', 'completed'],
  },
});

// 4. Add endpoints
await generator.add_endpoint({
  method: 'get',
  path: '/tasks',
  summary: 'List all tasks',
  responses: {
    '200': {
      description: 'List of tasks',
      content: {
        'application/json': {
          schema: {
            type: 'array',
            items: { $ref: '#/components/schemas/Task' },
          },
        },
      },
    },
  },
  tags: ['Tasks'],
  security: [{ bearerAuth: [] }],
});

// 5. Generate examples
await generator.generate_examples();

// 6. Validate
await generator.validate_spec();

// 7. Export
await generator.export_spec({
  outputPath: './docs/openapi.json',
  format: 'json',
});
```

## Code Scanning

### Express.js
```javascript
// app.js
app.get('/users', (req, res) => {});
app.post('/users', (req, res) => {});
app.get('/users/:id', (req, res) => {});
```

```javascript
await generator.scan_express_app({
  filePath: './src/app.js',
});
// Extracts: GET /users, POST /users, GET /users/:id
```

### FastAPI
```python
# main.py
@app.get('/users')
def list_users():
    pass

@app.post('/users')
def create_user():
    pass
```

```javascript
await generator.scan_fastapi_app({
  filePath: './app/main.py',
});
// Extracts: GET /users, POST /users
```

**Note:** Scanning gives you basic structure. Add descriptions, schemas, and examples manually.

## OpenAPI 3.0 Features

### Parameter Types
- **Path:** `/users/{id}` - Required, in URL
- **Query:** `/users?limit=10` - Optional, for filtering
- **Header:** `Authorization: Bearer token`
- **Cookie:** Session cookies

### Request Body
```json
{
  "content": {
    "application/json": {
      "schema": { "$ref": "#/components/schemas/User" }
    }
  }
}
```

### Responses
```json
{
  "200": {
    "description": "Success",
    "content": {
      "application/json": {
        "schema": { "$ref": "#/components/schemas/User" }
      }
    }
  },
  "404": {
    "description": "Not found"
  }
}
```

### Security Schemes

**Bearer Token (JWT):**
```javascript
{
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT'
}
```

**API Key:**
```javascript
{
  type: 'apiKey',
  in: 'header',
  name: 'X-API-Key'
}
```

**OAuth2:**
```javascript
{
  type: 'oauth2',
  flows: {
    authorizationCode: {
      authorizationUrl: 'https://example.com/oauth/authorize',
      tokenUrl: 'https://example.com/oauth/token',
      scopes: {
        'read:users': 'Read users',
        'write:users': 'Write users'
      }
    }
  }
}
```

## Best Practices

### Spec Organization
- **Tags:** Group related endpoints
- **Schemas:** Reuse models with `$ref`
- **Examples:** Provide realistic data
- **Descriptions:** Explain non-obvious behavior

### Endpoint Design
- **Summary:** One-line description
- **Description:** Detailed explanation
- **Parameters:** Document all inputs
- **Responses:** Document all possible codes
- **Security:** Specify auth requirements

### Schema Design
- **Required fields:** Mark mandatory properties
- **Formats:** Use string formats (email, date-time, uuid)
- **Validation:** Add min/max, pattern constraints
- **Examples:** Provide realistic sample data

## Integration with Swagger UI

```bash
npm install -g swagger-ui-express

# In your Express app:
const swaggerUi = require('swagger-ui-express');
const openApiSpec = require('./openapi.json');

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiSpec));
```

Visit `http://localhost:3000/api-docs` to see interactive docs.

## Client SDK Generation

Use generated spec with tools like:

- **openapi-generator:** Generate clients for 40+ languages
- **swagger-codegen:** Generate SDKs and server stubs
- **openapi-typescript-codegen:** TypeScript client generation

```bash
openapi-generator-cli generate -i openapi.json -g typescript-axios -o ./client
```

## Limitations

- Code scanning is basic (regex-based)
- For production, use framework-native generators:
  - Express: `swagger-jsdoc`
  - FastAPI: Built-in `/openapi.json` endpoint
  - NestJS: `@nestjs/swagger`
- YAML export not yet implemented

## Roadmap

- [ ] Advanced code scanning with AST parsing
- [ ] YAML export support
- [ ] Import existing OpenAPI specs
- [ ] Merge multiple specs
- [ ] Generate API mocks from spec
- [ ] Diff specs for breaking changes
- [ ] Auto-generate from TypeScript types

## Testing

```bash
npm test
```

## Related

- **Enables:** api-designer skill
- **Works with:** api-validator-mcp (validate requests/responses)
- **Use case:** API documentation, client generation, API design
