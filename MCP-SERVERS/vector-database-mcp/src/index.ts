#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { PineconeClient } from './providers/pinecone.js';
import { WeaviateClient } from './providers/weaviate.js';
import { ChromaClient } from './providers/chroma.js';

/**
 * Vector Database MCP Server
 *
 * Provides tools for interacting with vector databases:
 * - Pinecone
 * - Weaviate
 * - Chroma
 *
 * Enables semantic search, vector storage, and RAG implementations.
 */

interface VectorDatabaseConfig {
  provider: 'pinecone' | 'weaviate' | 'chroma';
  apiKey?: string;
  environment?: string;
  host?: string;
  collection?: string;
}

class VectorDatabaseServer {
  private server: Server;
  private config: VectorDatabaseConfig | null = null;
  private client: PineconeClient | WeaviateClient | ChromaClient | null = null;

  constructor() {
    this.server = new Server(
      {
        name: 'vector-database-mcp',
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
          case 'connect':
            return await this.handleConnect(args as any);
          case 'insert_vectors':
            return await this.handleInsertVectors(args as any);
          case 'search_vectors':
            return await this.handleSearchVectors(args as any);
          case 'delete_vectors':
            return await this.handleDeleteVectors(args as any);
          case 'list_collections':
            return await this.handleListCollections();
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
        name: 'connect',
        description: 'Connect to a vector database (Pinecone, Weaviate, or Chroma)',
        inputSchema: {
          type: 'object',
          properties: {
            provider: {
              type: 'string',
              enum: ['pinecone', 'weaviate', 'chroma'],
              description: 'Vector database provider',
            },
            apiKey: {
              type: 'string',
              description: 'API key (Pinecone/Weaviate)',
            },
            environment: {
              type: 'string',
              description: 'Environment name (Pinecone) or URL (Weaviate/Chroma)',
            },
            collection: {
              type: 'string',
              description: 'Collection/index name',
            },
          },
          required: ['provider'],
        },
      },
      {
        name: 'insert_vectors',
        description: 'Insert vectors with metadata into the database',
        inputSchema: {
          type: 'object',
          properties: {
            vectors: {
              type: 'array',
              description: 'Array of vectors with IDs and metadata',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  values: { type: 'array', items: { type: 'number' } },
                  metadata: { type: 'object' },
                },
                required: ['id', 'values'],
              },
            },
          },
          required: ['vectors'],
        },
      },
      {
        name: 'search_vectors',
        description: 'Search for similar vectors (semantic search)',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'array',
              description: 'Query vector',
              items: { type: 'number' },
            },
            topK: {
              type: 'number',
              description: 'Number of results to return',
              default: 10,
            },
            filter: {
              type: 'object',
              description: 'Metadata filter (optional)',
            },
          },
          required: ['query'],
        },
      },
      {
        name: 'delete_vectors',
        description: 'Delete vectors by IDs',
        inputSchema: {
          type: 'object',
          properties: {
            ids: {
              type: 'array',
              description: 'Array of vector IDs to delete',
              items: { type: 'string' },
            },
          },
          required: ['ids'],
        },
      },
      {
        name: 'list_collections',
        description: 'List all available collections/indexes',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
    ];
  }

  private async handleConnect(args: VectorDatabaseConfig) {
    this.config = args;

    switch (args.provider) {
      case 'pinecone':
        this.client = new PineconeClient(args.apiKey!);
        break;
      case 'weaviate':
        this.client = new WeaviateClient(args.environment!, args.apiKey);
        break;
      case 'chroma':
        this.client = new ChromaClient(args.environment || 'http://localhost:8000');
        break;
    }

    await this.client.connect(args.collection);

    return {
      content: [
        {
          type: 'text',
          text: `✅ Connected to ${args.provider} (collection: ${args.collection || 'default'})`,
        },
      ],
    };
  }

  private async handleInsertVectors(args: {
    vectors: Array<{ id: string; values: number[]; metadata?: any }>;
  }) {
    if (!this.client) {
      throw new Error('Not connected. Call connect() first.');
    }

    const result = await this.client.insertVectors(args.vectors);

    return {
      content: [
        {
          type: 'text',
          text: `✅ Inserted ${args.vectors.length} vectors. ${result}`,
        },
      ],
    };
  }

  private async handleSearchVectors(args: {
    query: number[];
    topK?: number;
    filter?: any;
  }) {
    if (!this.client) {
      throw new Error('Not connected. Call connect() first.');
    }

    const results = await this.client.searchVectors(
      args.query,
      args.topK || 10,
      args.filter
    );

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(results, null, 2),
        },
      ],
    };
  }

  private async handleDeleteVectors(args: { ids: string[] }) {
    if (!this.client) {
      throw new Error('Not connected. Call connect() first.');
    }

    await this.client.deleteVectors(args.ids);

    return {
      content: [
        {
          type: 'text',
          text: `✅ Deleted ${args.ids.length} vectors`,
        },
      ],
    };
  }

  private async handleListCollections() {
    if (!this.client) {
      throw new Error('Not connected. Call connect() first.');
    }

    const collections = await this.client.listCollections();

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(collections, null, 2),
        },
      ],
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Vector Database MCP server running on stdio');
  }
}

const server = new VectorDatabaseServer();
server.run().catch(console.error);
