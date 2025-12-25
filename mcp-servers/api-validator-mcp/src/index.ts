#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool
} from '@modelcontextprotocol/sdk/types.js'
import Ajv, { type ErrorObject, type ValidateFunction } from 'ajv'
import addFormats from 'ajv-formats'

type AjvCoreInstance = Parameters<typeof addFormats>[0]
type ExtendedErrorObject = ErrorObject & { instancePath?: string; dataPath?: string }

/**
 * API Validator MCP Server
 *
 * Provides tools for validating API requests and responses:
 * - JSON Schema validation
 * - OpenAPI schema validation
 * - Custom validation rules
 * - Request/response validation
 * - Schema generation from examples
 *
 * Enables: api-designer, testing-strategist skills
 */

type SchemaType = 'request' | 'response' | 'both'

interface ValidationSchema {
  id: string
  name: string
  schema: Record<string, unknown>
  type: SchemaType
}

interface RegisterSchemaArgs {
  id: string
  name: string
  schema: Record<string, unknown>
  type?: SchemaType
}

interface ValidateSchemaArgs {
  schemaId: string
  data: unknown
}

interface ValidateResponseArgs extends ValidateSchemaArgs {
  statusCode?: number
}

interface ValidateDataArgs {
  schema: Record<string, unknown>
  data: unknown
}

interface GenerateSchemaArgs {
  data: unknown
  name: string
}

interface RemoveSchemaArgs {
  schemaId: string
}

interface ValidationResult {
  valid: boolean
  errors?: Array<{
    path: string
    message: string
    keyword?: string
  }>
  warnings?: string[]
}

class ApiValidatorServer {
  private server: Server
  private ajv: InstanceType<typeof Ajv>
  private schemas: Map<string, ValidationSchema> = new Map()
  private validators: Map<string, ValidateFunction> = new Map()

  constructor() {
    this.ajv = new Ajv({
      allErrors: true,
      verbose: true
    })
    addFormats(this.ajv as unknown as AjvCoreInstance)

    this.server = new Server(
      {
        name: 'api-validator-mcp',
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
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: this.getTools()
    }))

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async request => {
      const { name, arguments: args } = request.params
      const rawArgs = (args ?? {}) as unknown

      try {
        switch (name) {
          case 'register_schema':
            return await this.handleRegisterSchema(this.parseArgs<RegisterSchemaArgs>(rawArgs))
          case 'validate_request':
            return await this.handleValidateRequest(this.parseArgs<ValidateSchemaArgs>(rawArgs))
          case 'validate_response':
            return await this.handleValidateResponse(this.parseArgs<ValidateResponseArgs>(rawArgs))
          case 'validate_data':
            return await this.handleValidateData(this.parseArgs<ValidateDataArgs>(rawArgs))
          case 'generate_schema':
            return await this.handleGenerateSchema(this.parseArgs<GenerateSchemaArgs>(rawArgs))
          case 'list_schemas':
            return await this.handleListSchemas()
          case 'remove_schema':
            return await this.handleRemoveSchema(this.parseArgs<RemoveSchemaArgs>(rawArgs))
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
        name: 'register_schema',
        description: 'Register a JSON Schema for validation',
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Unique schema identifier'
            },
            name: {
              type: 'string',
              description: 'Human-readable schema name'
            },
            schema: {
              type: 'object',
              description: 'JSON Schema object'
            },
            type: {
              type: 'string',
              enum: ['request', 'response', 'both'],
              description: 'Schema type',
              default: 'both'
            }
          },
          required: ['id', 'name', 'schema']
        }
      },
      {
        name: 'validate_request',
        description: 'Validate an API request against a registered schema',
        inputSchema: {
          type: 'object',
          properties: {
            schemaId: {
              type: 'string',
              description: 'Schema ID to validate against'
            },
            data: {
              type: 'object',
              description: 'Request data to validate'
            }
          },
          required: ['schemaId', 'data']
        }
      },
      {
        name: 'validate_response',
        description: 'Validate an API response against a registered schema',
        inputSchema: {
          type: 'object',
          properties: {
            schemaId: {
              type: 'string',
              description: 'Schema ID to validate against'
            },
            data: {
              type: 'object',
              description: 'Response data to validate'
            },
            statusCode: {
              type: 'number',
              description: 'HTTP status code'
            }
          },
          required: ['schemaId', 'data']
        }
      },
      {
        name: 'validate_data',
        description: 'Validate arbitrary data against a JSON Schema',
        inputSchema: {
          type: 'object',
          properties: {
            schema: {
              type: 'object',
              description: 'JSON Schema to validate against'
            },
            data: {
              type: 'object',
              description: 'Data to validate'
            }
          },
          required: ['schema', 'data']
        }
      },
      {
        name: 'generate_schema',
        description: 'Generate a JSON Schema from example data',
        inputSchema: {
          type: 'object',
          properties: {
            data: {
              type: 'object',
              description: 'Example data to generate schema from'
            },
            name: {
              type: 'string',
              description: 'Schema name'
            }
          },
          required: ['data', 'name']
        }
      },
      {
        name: 'list_schemas',
        description: 'List all registered schemas',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      },
      {
        name: 'remove_schema',
        description: 'Remove a registered schema',
        inputSchema: {
          type: 'object',
          properties: {
            schemaId: {
              type: 'string',
              description: 'Schema ID to remove'
            }
          },
          required: ['schemaId']
        }
      }
    ]
  }

  private async handleRegisterSchema(args: RegisterSchemaArgs) {
    try {
      // Compile schema with AJV
      const validator = this.ajv.compile(args.schema)

      // Store schema and validator
      const schemaEntry: ValidationSchema = {
        id: args.id,
        name: args.name,
        schema: args.schema,
        type: args.type ?? 'both'
      }

      this.schemas.set(args.id, schemaEntry)
      this.validators.set(args.id, validator)

      return {
        content: [
          {
            type: 'text',
            text: `✅ Registered schema: ${args.name} (ID: ${args.id}, Type: ${schemaEntry.type})`
          }
        ]
      }
    } catch (error) {
      throw new Error(
        `Failed to register schema: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }

  private async handleValidateRequest(args: ValidateSchemaArgs) {
    const schema = this.schemas.get(args.schemaId)

    if (!schema) {
      throw new Error(`Schema not found: ${args.schemaId}`)
    }

    if (schema.type === 'response') {
      throw new Error(`Schema ${args.schemaId} is response-only, cannot validate requests`)
    }

    const result = await this.validate(args.schemaId, args.data)

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              schemaId: args.schemaId,
              schemaName: schema.name,
              ...result
            },
            null,
            2
          )
        }
      ]
    }
  }

  private async handleValidateResponse(args: ValidateResponseArgs) {
    const schema = this.schemas.get(args.schemaId)

    if (!schema) {
      throw new Error(`Schema not found: ${args.schemaId}`)
    }

    if (schema.type === 'request') {
      throw new Error(`Schema ${args.schemaId} is request-only, cannot validate responses`)
    }

    const result = await this.validate(args.schemaId, args.data)

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              schemaId: args.schemaId,
              schemaName: schema.name,
              statusCode: args.statusCode,
              ...result
            },
            null,
            2
          )
        }
      ]
    }
  }

  private async handleValidateData(args: ValidateDataArgs) {
    try {
      const validator = this.ajv.compile(args.schema)
      const valid = await this.executeValidation(validator, args.data)

      const result: ValidationResult = {
        valid
      }

      if (!valid && validator.errors) {
        const errors = validator.errors as ExtendedErrorObject[]
        result.errors = errors.map(err => ({
          path: err.instancePath || err.dataPath || '/',
          message: err.message || 'Validation failed',
          keyword: err.keyword
        }))
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2)
          }
        ]
      }
    } catch (error) {
      throw new Error(
        `Validation failed: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }

  private async handleGenerateSchema(args: GenerateSchemaArgs) {
    const schema = this.inferSchema(args.data)

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              name: args.name,
              schema,
              suggestion: 'Review and refine this generated schema before using in production'
            },
            null,
            2
          )
        }
      ]
    }
  }

  private async handleListSchemas() {
    const schemasList = Array.from(this.schemas.values()).map(schema => ({
      id: schema.id,
      name: schema.name,
      type: schema.type,
      properties: this.getSchemaPropertyKeys(schema.schema)
    }))

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              total: schemasList.length,
              schemas: schemasList
            },
            null,
            2
          )
        }
      ]
    }
  }

  private async handleRemoveSchema(args: RemoveSchemaArgs) {
    const schema = this.schemas.get(args.schemaId)

    if (!schema) {
      throw new Error(`Schema not found: ${args.schemaId}`)
    }

    this.schemas.delete(args.schemaId)
    this.validators.delete(args.schemaId)

    return {
      content: [
        {
          type: 'text',
          text: `✅ Removed schema: ${schema.name} (${args.schemaId})`
        }
      ]
    }
  }

  private async validate(schemaId: string, data: unknown): Promise<ValidationResult> {
    const validator = this.validators.get(schemaId)

    if (!validator) {
      throw new Error(`Validator not found for schema: ${schemaId}`)
    }

    const valid = await this.executeValidation(validator, data)

    const result: ValidationResult = {
      valid
    }

    if (!valid && validator.errors) {
      const errors = validator.errors as ExtendedErrorObject[]
      result.errors = errors.map(err => ({
        path: err.instancePath || err.dataPath || '/',
        message: err.message || 'Validation failed',
        keyword: err.keyword
      }))
    }

    return result
  }

  private async executeValidation(validator: ValidateFunction, value: unknown): Promise<boolean> {
    const result = validator(value)
    return typeof result === 'boolean' ? result : await result
  }

  private inferSchema(data: unknown): Record<string, unknown> {
    if (data === null) {
      return { type: 'null' }
    }

    if (Array.isArray(data)) {
      return {
        type: 'array',
        items: data.length > 0 ? this.inferSchema(data[0]) : { type: 'string' }
      }
    }

    const type = typeof data

    if (type === 'object') {
      const properties: Record<string, unknown> = {}
      const required: string[] = []

      for (const [key, value] of Object.entries(data)) {
        properties[key] = this.inferSchema(value)
        if (value !== null && value !== undefined) {
          required.push(key)
        }
      }

      return {
        type: 'object',
        properties,
        required: required.length > 0 ? required : undefined
      }
    }

    if (type === 'number') {
      return {
        type: Number.isInteger(data) ? 'integer' : 'number'
      }
    }

    return { type }
  }

  private getSchemaPropertyKeys(schema: Record<string, unknown>): string[] {
    const props = (schema as { properties?: unknown }).properties
    if (props && typeof props === 'object' && !Array.isArray(props)) {
      return Object.keys(props as Record<string, unknown>)
    }
    return []
  }

  async run() {
    const transport = new StdioServerTransport()
    await this.server.connect(transport)
    console.error('API Validator MCP server running on stdio')
  }

  private parseArgs<T>(args: unknown): T {
    return args as T
  }
}

const server = new ApiValidatorServer()
server.run().catch(console.error)
