#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool
} from '@modelcontextprotocol/sdk/types.js'
import SwaggerParser from '@apidevtools/swagger-parser'
import type { OpenAPI } from 'openapi-types'
import * as fs from 'fs'
import * as path from 'path'

/**
 * OpenAPI Generator MCP Server
 *
 * Provides tools for OpenAPI/Swagger specification generation:
 * - Scan code for API endpoints
 * - Generate OpenAPI 3.0 specifications
 * - Validate OpenAPI specs
 * - Add examples and descriptions
 * - Generate client SDKs
 *
 * Enables: api-designer skill
 */

type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete'

interface SchemaObject {
  type?: 'string' | 'number' | 'integer' | 'boolean' | 'array' | 'object'
  format?: string
  example?: unknown
  default?: unknown
  items?: SchemaObject
  properties?: Record<string, SchemaObject>
  content?: Record<string, ResponseContent>
  [key: string]: unknown
}

interface ResponseContent {
  schema?: SchemaObject
  example?: unknown
  [key: string]: unknown
}

interface ResponseObject {
  description: string
  content?: Record<string, ResponseContent>
  [key: string]: unknown
}

interface RequestBodyObject {
  description?: string
  required?: boolean
  content: Record<string, ResponseContent>
}

interface ParameterObject {
  name: string
  in: 'query' | 'header' | 'path' | 'cookie'
  required?: boolean
  description?: string
  schema?: SchemaObject
}

type SecurityRequirement = Record<string, string[]>

type SecurityScheme =
  | {
      type: 'http'
      scheme?: string
      bearerFormat?: string
    }
  | {
      type: 'apiKey'
      in?: 'query' | 'header' | 'cookie'
      name: string
    }
  | {
      type: 'oauth2'
      flows?: Record<string, unknown>
    }
  | {
      type: 'openIdConnect'
      openIdConnectUrl: string
    }

interface OpenAPIOperation {
  summary?: string
  description?: string
  parameters?: ParameterObject[]
  requestBody?: RequestBodyObject
  responses?: Record<string, ResponseObject>
  tags?: string[]
  security?: SecurityRequirement[]
}

interface OpenAPISpec {
  openapi: string
  info: {
    title: string
    version: string
    description?: string
  }
  servers?: Array<{
    url: string
    description?: string
  }>
  paths: Record<string, Record<string, OpenAPIOperation>>
  components?: {
    schemas?: Record<string, SchemaObject>
    securitySchemes?: Record<string, SecurityScheme>
  }
}

interface EndpointInfo {
  method: HttpMethod | string
  path: string
  summary?: string
  description?: string
  parameters?: ParameterObject[]
  requestBody?: RequestBodyObject
  responses?: Record<string, ResponseObject>
  tags?: string[]
  security?: SecurityRequirement[]
}

interface InitializeSpecArgs {
  title: string
  version: string
  description?: string
  servers?: Array<{ url: string; description?: string }>
}

interface AddSchemaArgs {
  name: string
  schema: SchemaObject
}

interface AddSecurityArgs {
  name: string
  type: 'http' | 'apiKey'
  scheme?: string
  bearerFormat?: string
  in?: 'query' | 'header' | 'cookie'
  paramName?: string
}

interface ExportSpecArgs {
  outputPath: string
  format?: 'json' | 'yaml'
}

class OpenAPIGeneratorServer {
  private server: Server
  private spec: OpenAPISpec = {
    openapi: '3.0.0',
    info: {
      title: 'API',
      version: '1.0.0'
    },
    paths: {} as Record<string, Record<string, OpenAPIOperation>>
  }

  constructor() {
    this.server = new Server(
      {
        name: 'openapi-generator-mcp',
        version: '1.0.0'
      },
      {
        capabilities: {
          tools: {}
        }
      }
    )

    this.setupHandlers()
  }

  private setupHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: this.getTools()
    }))

    this.server.setRequestHandler(CallToolRequestSchema, async request => {
      const { name, arguments: args } = request.params
      const rawArgs = (args ?? {}) as unknown

      try {
        switch (name) {
          case 'initialize_spec':
            return await this.handleInitializeSpec(this.parseArgs<InitializeSpecArgs>(rawArgs))
          case 'add_endpoint':
            return await this.handleAddEndpoint(this.parseArgs<EndpointInfo>(rawArgs))
          case 'add_schema':
            return await this.handleAddSchema(this.parseArgs<AddSchemaArgs>(rawArgs))
          case 'add_security':
            return await this.handleAddSecurity(this.parseArgs<AddSecurityArgs>(rawArgs))
          case 'scan_express_app':
            return await this.handleScanExpressApp(
              this.parseArgs<{ filePath: string; baseUrl?: string }>(rawArgs)
            )
          case 'scan_fastapi_app':
            return await this.handleScanFastAPIApp(this.parseArgs<{ filePath: string }>(rawArgs))
          case 'validate_spec':
            return await this.handleValidateSpec()
          case 'export_spec':
            return await this.handleExportSpec(this.parseArgs<ExportSpecArgs>(rawArgs))
          case 'generate_examples':
            return await this.handleGenerateExamples()
          default:
            throw new Error(`Unknown tool: ${name}`)
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        return {
          content: [{ type: 'text', text: `Error: ${errorMessage}` }],
          isError: true
        }
      }
    })
  }

  private getTools(): Tool[] {
    return [
      {
        name: 'initialize_spec',
        description: 'Initialize new OpenAPI specification',
        inputSchema: {
          type: 'object',
          properties: {
            title: {
              type: 'string',
              description: 'API title'
            },
            version: {
              type: 'string',
              description: 'API version (e.g., "1.0.0")'
            },
            description: {
              type: 'string',
              description: 'API description'
            },
            servers: {
              type: 'array',
              description: 'Server URLs',
              items: {
                type: 'object',
                properties: {
                  url: { type: 'string' },
                  description: { type: 'string' }
                }
              }
            }
          },
          required: ['title', 'version']
        }
      },
      {
        name: 'add_endpoint',
        description: 'Add an API endpoint to the specification',
        inputSchema: {
          type: 'object',
          properties: {
            method: {
              type: 'string',
              enum: ['get', 'post', 'put', 'patch', 'delete'],
              description: 'HTTP method'
            },
            path: {
              type: 'string',
              description: 'Endpoint path (e.g., "/users/{id}")'
            },
            summary: {
              type: 'string',
              description: 'Brief summary'
            },
            description: {
              type: 'string',
              description: 'Detailed description'
            },
            parameters: {
              type: 'array',
              description: 'Path/query/header parameters',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  in: {
                    type: 'string',
                    enum: ['query', 'header', 'path', 'cookie']
                  },
                  required: { type: 'boolean' },
                  description: { type: 'string' }
                },
                required: ['name', 'in']
              }
            },
            requestBody: {
              type: 'object',
              description: 'Request body schema'
            },
            responses: {
              type: 'object',
              description: 'Response schemas'
            },
            tags: {
              type: 'array',
              description: 'Tags for grouping',
              items: { type: 'string' }
            },
            security: {
              type: 'array',
              description: 'Security requirements'
            }
          },
          required: ['method', 'path']
        }
      },
      {
        name: 'add_schema',
        description: 'Add a reusable schema/model definition',
        inputSchema: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Schema name'
            },
            schema: {
              type: 'object',
              description: 'JSON Schema definition'
            }
          },
          required: ['name', 'schema']
        }
      },
      {
        name: 'add_security',
        description: 'Add security scheme (API key, OAuth2, etc.)',
        inputSchema: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Security scheme name'
            },
            type: {
              type: 'string',
              enum: ['apiKey', 'http', 'oauth2', 'openIdConnect'],
              description: 'Security type'
            },
            scheme: {
              type: 'string',
              description: 'For http type: "bearer", "basic"'
            },
            bearerFormat: {
              type: 'string',
              description: 'For bearer: "JWT"'
            },
            in: {
              type: 'string',
              enum: ['header', 'query', 'cookie'],
              description: 'For apiKey: where to send'
            },
            parameterName: {
              type: 'string',
              description: 'For apiKey: parameter name'
            }
          },
          required: ['name', 'type']
        }
      },
      {
        name: 'scan_express_app',
        description: 'Scan Express.js app code to generate spec',
        inputSchema: {
          type: 'object',
          properties: {
            filePath: {
              type: 'string',
              description: 'Path to Express app file'
            },
            baseUrl: {
              type: 'string',
              description: 'Base URL for API'
            }
          },
          required: ['filePath']
        }
      },
      {
        name: 'scan_fastapi_app',
        description: 'Scan FastAPI app code to generate spec',
        inputSchema: {
          type: 'object',
          properties: {
            filePath: {
              type: 'string',
              description: 'Path to FastAPI app file'
            }
          },
          required: ['filePath']
        }
      },
      {
        name: 'validate_spec',
        description: 'Validate current OpenAPI specification',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      },
      {
        name: 'export_spec',
        description: 'Export specification to file',
        inputSchema: {
          type: 'object',
          properties: {
            outputPath: {
              type: 'string',
              description: 'Output file path'
            },
            format: {
              type: 'string',
              enum: ['json', 'yaml'],
              description: 'Output format (default: json)'
            }
          },
          required: ['outputPath']
        }
      },
      {
        name: 'generate_examples',
        description: 'Generate example values for all schemas',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      }
    ]
  }

  private async handleInitializeSpec(args: InitializeSpecArgs) {
    this.spec = {
      openapi: '3.0.0',
      info: {
        title: args.title,
        version: args.version,
        description: args.description
      },
      paths: {} as Record<string, Record<string, OpenAPIOperation>>
    }

    if (args.servers) {
      this.spec.servers = args.servers
    }

    return {
      content: [
        {
          type: 'text',
          text: `✅ Initialized OpenAPI spec: ${args.title} v${args.version}`
        }
      ]
    }
  }

  private async handleAddEndpoint(args: EndpointInfo) {
    const method = args.method.toLowerCase() as HttpMethod
    if (!this.spec.paths[args.path]) {
      this.spec.paths[args.path] = {} as Record<string, OpenAPIOperation>
    }

    const operation: OpenAPIOperation = {
      summary: args.summary,
      description: args.description,
      parameters: args.parameters,
      requestBody: args.requestBody,
      responses: args.responses || {
        '200': {
          description: 'Successful response'
        }
      },
      tags: args.tags,
      security: args.security
    }

    this.spec.paths[args.path][method] = operation

    // Remove undefined fields
    ;(Object.keys(operation) as Array<keyof OpenAPIOperation>).forEach(key => {
      if (operation[key] === undefined) {
        delete operation[key]
      }
    })

    return {
      content: [
        {
          type: 'text',
          text: `✅ Added endpoint: ${method.toUpperCase()} ${args.path}`
        }
      ]
    }
  }

  private async handleAddSchema(args: AddSchemaArgs) {
    if (!this.spec.components) {
      this.spec.components = {}
    }
    if (!this.spec.components.schemas) {
      this.spec.components.schemas = {}
    }

    this.spec.components.schemas[args.name] = args.schema

    return {
      content: [
        {
          type: 'text',
          text: `✅ Added schema: ${args.name}`
        }
      ]
    }
  }

  private async handleAddSecurity(args: AddSecurityArgs) {
    if (!this.spec.components) {
      this.spec.components = {}
    }
    if (!this.spec.components.securitySchemes) {
      this.spec.components.securitySchemes = {}
    }

    let securityScheme: SecurityScheme
    if (args.type === 'http') {
      securityScheme = {
        type: 'http',
        scheme: args.scheme,
        bearerFormat: args.bearerFormat
      }
    } else {
      const location: 'query' | 'header' | 'cookie' = args.in ?? 'header'
      securityScheme = {
        type: 'apiKey',
        in: location,
        name: args.paramName || 'api_key'
      }
    }

    this.spec.components.securitySchemes[args.name] = securityScheme

    return {
      content: [
        {
          type: 'text',
          text: `✅ Added security scheme: ${args.name}`
        }
      ]
    }
  }

  private async handleScanExpressApp(args: { filePath: string; baseUrl?: string }) {
    if (!fs.existsSync(args.filePath)) {
      throw new Error(`File not found: ${args.filePath}`)
    }

    const code = fs.readFileSync(args.filePath, 'utf-8')

    // Simple regex-based scanning (in production, use AST parser)
    const routePattern = /\.(get|post|put|patch|delete)\s*\(\s*['"`]([^'"`]+)['"`]/g
    const matches = Array.from(code.matchAll(routePattern))

    let count = 0
    for (const match of matches) {
      const [, method, path] = match
      await this.handleAddEndpoint({
        method: method.toLowerCase() as HttpMethod,
        path,
        summary: `${method.toUpperCase()} ${path}`,
        responses: {
          '200': {
            description: 'Successful response'
          }
        }
      })
      count++
    }

    return {
      content: [
        {
          type: 'text',
          text: `✅ Scanned Express app: Found ${count} endpoints\nNote: Add descriptions and schemas manually for complete spec.`
        }
      ]
    }
  }

  private async handleScanFastAPIApp(args: { filePath: string }) {
    if (!fs.existsSync(args.filePath)) {
      throw new Error(`File not found: ${args.filePath}`)
    }

    const code = fs.readFileSync(args.filePath, 'utf-8')

    // Simple regex-based scanning for FastAPI decorators
    const routePattern = /@app\.(get|post|put|patch|delete)\s*\(\s*['"`]([^'"`]+)['"`]/g
    const matches = Array.from(code.matchAll(routePattern))

    let count = 0
    for (const match of matches) {
      const [, method, path] = match
      await this.handleAddEndpoint({
        method: method.toLowerCase() as HttpMethod,
        path,
        summary: `${method.toUpperCase()} ${path}`,
        responses: {
          '200': {
            description: 'Successful response'
          }
        }
      })
      count++
    }

    return {
      content: [
        {
          type: 'text',
          text: `✅ Scanned FastAPI app: Found ${count} endpoints\nNote: FastAPI auto-generates OpenAPI. Consider using /docs endpoint instead.`
        }
      ]
    }
  }

  private async handleValidateSpec() {
    try {
      await SwaggerParser.validate(this.spec as unknown as OpenAPI.Document)

      return {
        content: [
          {
            type: 'text',
            text: '✅ OpenAPI specification is valid'
          }
        ]
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      return {
        content: [
          {
            type: 'text',
            text: `❌ Validation failed:\n${errorMessage}`
          }
        ],
        isError: true
      }
    }
  }

  private async handleExportSpec(args: ExportSpecArgs) {
    const format = args.format || 'json'
    const dir = path.dirname(args.outputPath)

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }

    if (format === 'json') {
      fs.writeFileSync(args.outputPath, JSON.stringify(this.spec, null, 2))
    } else {
      // For YAML, we'd need a YAML library
      throw new Error('YAML export not yet implemented. Use JSON format.')
    }

    const endpoints = Object.keys(this.spec.paths).length
    const schemas = Object.keys(this.spec.components?.schemas || {}).length

    return {
      content: [
        {
          type: 'text',
          text: `✅ Exported OpenAPI spec to: ${args.outputPath}\nEndpoints: ${endpoints}\nSchemas: ${schemas}`
        }
      ]
    }
  }

  private generateExampleValue(schema: SchemaObject): unknown {
    if (schema.example !== undefined) return schema.example
    if (schema.default !== undefined) return schema.default

    switch (schema.type) {
      case 'string':
        return schema.format === 'email'
          ? 'user@example.com'
          : schema.format === 'date-time'
            ? '2024-01-01T00:00:00Z'
            : 'string'
      case 'number':
      case 'integer':
        return 0
      case 'boolean':
        return true
      case 'array':
        return schema.items ? [this.generateExampleValue(schema.items)] : []
      case 'object': {
        const obj: Record<string, unknown> = {}
        if (schema.properties) {
          for (const [key, prop] of Object.entries(schema.properties)) {
            obj[key] = this.generateExampleValue(prop as SchemaObject)
          }
        }
        return obj
      }
      default:
        return null
    }
  }

  private async handleGenerateExamples() {
    let count = 0

    // Add examples to schemas
    if (this.spec.components?.schemas) {
      for (const [, schema] of Object.entries(this.spec.components.schemas)) {
        if (!schema.example) {
          schema.example = this.generateExampleValue(schema)
          count++
        }
      }
    }

    // Add examples to responses
    const pathEntries = Object.values(this.spec.paths ?? {}) as Array<
      Record<string, OpenAPIOperation>
    >
    for (const methods of pathEntries) {
      for (const operation of Object.values(methods) as OpenAPIOperation[]) {
        const responses = operation.responses ?? {}
        for (const response of Object.values(responses)) {
          const jsonContent = response.content?.['application/json']
          if (jsonContent?.schema && !jsonContent.example) {
            jsonContent.example = this.generateExampleValue(jsonContent.schema)
            count++
          }
        }
      }
    }

    return {
      content: [
        {
          type: 'text',
          text: `✅ Generated ${count} examples`
        }
      ]
    }
  }

  private parseArgs<T>(args: unknown): T {
    return args as T
  }

  async run() {
    const transport = new StdioServerTransport()
    await this.server.connect(transport)
    console.error('OpenAPI Generator MCP server running on stdio')
  }
}

const server = new OpenAPIGeneratorServer()
server.run().catch(console.error)
