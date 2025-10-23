#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import Ajv, { ValidateFunction } from 'ajv';
import addFormats from 'ajv-formats';

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

interface ValidationSchema {
  id: string;
  name: string;
  schema: any;
  type: 'request' | 'response' | 'both';
}

interface ValidationResult {
  valid: boolean;
  errors?: Array<{
    path: string;
    message: string;
    keyword?: string;
  }>;
  warnings?: string[];
}

class ApiValidatorServer {
  private server: Server;
  private ajv: Ajv;
  private schemas: Map<string, ValidationSchema> = new Map();
  private validators: Map<string, ValidateFunction> = new Map();

  constructor() {
    this.ajv = new Ajv({
      allErrors: true,
      verbose: true,
      strict: false,
    });
    addFormats(this.ajv);

    this.server = new Server(
      {
        name: 'api-validator-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
  }

  private setupHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: this.getTools(),
    }));

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'register_schema':
            return await this.handleRegisterSchema(args as any);
          case 'validate_request':
            return await this.handleValidateRequest(args as any);
          case 'validate_response':
            return await this.handleValidateResponse(args as any);
          case 'validate_data':
            return await this.handleValidateData(args as any);
          case 'generate_schema':
            return await this.handleGenerateSchema(args as any);
          case 'list_schemas':
            return await this.handleListSchemas();
          case 'remove_schema':
            return await this.handleRemoveSchema(args as any);
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
          content: [{ type: 'text', text: `Error: ${errorMessage}` }],
          isError: true,
        };
      }
    });
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
              description: 'Unique schema identifier',
            },
            name: {
              type: 'string',
              description: 'Human-readable schema name',
            },
            schema: {
              type: 'object',
              description: 'JSON Schema object',
            },
            type: {
              type: 'string',
              enum: ['request', 'response', 'both'],
              description: 'Schema type',
              default: 'both',
            },
          },
          required: ['id', 'name', 'schema'],
        },
      },
      {
        name: 'validate_request',
        description: 'Validate an API request against a registered schema',
        inputSchema: {
          type: 'object',
          properties: {
            schemaId: {
              type: 'string',
              description: 'Schema ID to validate against',
            },
            data: {
              type: 'object',
              description: 'Request data to validate',
            },
          },
          required: ['schemaId', 'data'],
        },
      },
      {
        name: 'validate_response',
        description: 'Validate an API response against a registered schema',
        inputSchema: {
          type: 'object',
          properties: {
            schemaId: {
              type: 'string',
              description: 'Schema ID to validate against',
            },
            data: {
              type: 'object',
              description: 'Response data to validate',
            },
            statusCode: {
              type: 'number',
              description: 'HTTP status code',
            },
          },
          required: ['schemaId', 'data'],
        },
      },
      {
        name: 'validate_data',
        description: 'Validate arbitrary data against a JSON Schema',
        inputSchema: {
          type: 'object',
          properties: {
            schema: {
              type: 'object',
              description: 'JSON Schema to validate against',
            },
            data: {
              type: 'object',
              description: 'Data to validate',
            },
          },
          required: ['schema', 'data'],
        },
      },
      {
        name: 'generate_schema',
        description: 'Generate a JSON Schema from example data',
        inputSchema: {
          type: 'object',
          properties: {
            data: {
              type: 'object',
              description: 'Example data to generate schema from',
            },
            name: {
              type: 'string',
              description: 'Schema name',
            },
          },
          required: ['data', 'name'],
        },
      },
      {
        name: 'list_schemas',
        description: 'List all registered schemas',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'remove_schema',
        description: 'Remove a registered schema',
        inputSchema: {
          type: 'object',
          properties: {
            schemaId: {
              type: 'string',
              description: 'Schema ID to remove',
            },
          },
          required: ['schemaId'],
        },
      },
    ];
  }

  private async handleRegisterSchema(args: ValidationSchema) {
    try {
      // Compile schema with AJV
      const validator = this.ajv.compile(args.schema);
      
      // Store schema and validator
      this.schemas.set(args.id, args);
      this.validators.set(args.id, validator);

      return {
        content: [
          {
            type: 'text',
            text: `✅ Registered schema: ${args.name} (ID: ${args.id}, Type: ${args.type || 'both'})`,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to register schema: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async handleValidateRequest(args: { schemaId: string; data: any }) {
    const schema = this.schemas.get(args.schemaId);
    
    if (!schema) {
      throw new Error(`Schema not found: ${args.schemaId}`);
    }

    if (schema.type === 'response') {
      throw new Error(`Schema ${args.schemaId} is response-only, cannot validate requests`);
    }

    const result = this.validate(args.schemaId, args.data);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              schemaId: args.schemaId,
              schemaName: schema.name,
              ...result,
            },
            null,
            2
          ),
        },
      ],
    };
  }

  private async handleValidateResponse(args: {
    schemaId: string;
    data: any;
    statusCode?: number;
  }) {
    const schema = this.schemas.get(args.schemaId);
    
    if (!schema) {
      throw new Error(`Schema not found: ${args.schemaId}`);
    }

    if (schema.type === 'request') {
      throw new Error(`Schema ${args.schemaId} is request-only, cannot validate responses`);
    }

    const result = this.validate(args.schemaId, args.data);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              schemaId: args.schemaId,
              schemaName: schema.name,
              statusCode: args.statusCode,
              ...result,
            },
            null,
            2
          ),
        },
      ],
    };
  }

  private async handleValidateData(args: { schema: any; data: any }) {
    try {
      const validator = this.ajv.compile(args.schema);
      const valid = validator(args.data);

      const result: ValidationResult = {
        valid,
      };

      if (!valid && validator.errors) {
        result.errors = validator.errors.map((err) => ({
          path: err.instancePath || '/',
          message: err.message || 'Validation failed',
          keyword: err.keyword,
        }));
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      throw new Error(`Validation failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async handleGenerateSchema(args: { data: any; name: string }) {
    const schema = this.inferSchema(args.data);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              name: args.name,
              schema,
              suggestion: 'Review and refine this generated schema before using in production',
            },
            null,
            2
          ),
        },
      ],
    };
  }

  private async handleListSchemas() {
    const schemasList = Array.from(this.schemas.values()).map((s) => ({
      id: s.id,
      name: s.name,
      type: s.type,
      properties: Object.keys((s.schema as any).properties || {}),
    }));

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              total: schemasList.length,
              schemas: schemasList,
            },
            null,
            2
          ),
        },
      ],
    };
  }

  private async handleRemoveSchema(args: { schemaId: string }) {
    const schema = this.schemas.get(args.schemaId);
    
    if (!schema) {
      throw new Error(`Schema not found: ${args.schemaId}`);
    }

    this.schemas.delete(args.schemaId);
    this.validators.delete(args.schemaId);

    return {
      content: [
        {
          type: 'text',
          text: `✅ Removed schema: ${schema.name} (${args.schemaId})`,
        },
      ],
    };
  }

  private validate(schemaId: string, data: any): ValidationResult {
    const validator = this.validators.get(schemaId);
    
    if (!validator) {
      throw new Error(`Validator not found for schema: ${schemaId}`);
    }

    const valid = validator(data);

    const result: ValidationResult = {
      valid,
    };

    if (!valid && validator.errors) {
      result.errors = validator.errors.map((err) => ({
        path: err.instancePath || '/',
        message: err.message || 'Validation failed',
        keyword: err.keyword,
      }));
    }

    return result;
  }

  private inferSchema(data: any): any {
    if (data === null) {
      return { type: 'null' };
    }

    if (Array.isArray(data)) {
      return {
        type: 'array',
        items: data.length > 0 ? this.inferSchema(data[0]) : { type: 'string' },
      };
    }

    const type = typeof data;

    if (type === 'object') {
      const properties: any = {};
      const required: string[] = [];

      for (const [key, value] of Object.entries(data)) {
        properties[key] = this.inferSchema(value);
        if (value !== null && value !== undefined) {
          required.push(key);
        }
      }

      return {
        type: 'object',
        properties,
        required: required.length > 0 ? required : undefined,
      };
    }

    if (type === 'number') {
      return {
        type: Number.isInteger(data) ? 'integer' : 'number',
      };
    }

    return { type };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('API Validator MCP server running on stdio');
  }
}

const server = new ApiValidatorServer();
server.run().catch(console.error);
