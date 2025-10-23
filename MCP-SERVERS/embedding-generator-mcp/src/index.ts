#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { OpenAIProvider } from './providers/openai.js';
import { CohereProvider } from './providers/cohere.js';

/**
 * Embedding Generator MCP Server
 *
 * Provides tools for generating embeddings with:
 * - OpenAI (text-embedding-3-small, text-embedding-3-large)
 * - Cohere (embed-english-v3.0, embed-multilingual-v3.0)
 *
 * Enables RAG implementations and semantic search.
 */

interface EmbeddingConfig {
  provider: 'openai' | 'cohere';
  apiKey: string;
  model?: string;
  dimensions?: number;
}

class EmbeddingGeneratorServer {
  private server: Server;
  private config: EmbeddingConfig | null = null;
  private provider: OpenAIProvider | CohereProvider | null = null;

  constructor() {
    this.server = new Server(
      {
        name: 'embedding-generator-mcp',
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
          case 'configure':
            return await this.handleConfigure(args as any);
          case 'generate_embeddings':
            return await this.handleGenerateEmbeddings(args as any);
          case 'generate_batch_embeddings':
            return await this.handleGenerateBatchEmbeddings(args as any);
          case 'list_models':
            return await this.handleListModels();
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
        name: 'configure',
        description: 'Configure embedding provider (OpenAI or Cohere)',
        inputSchema: {
          type: 'object',
          properties: {
            provider: {
              type: 'string',
              enum: ['openai', 'cohere'],
              description: 'Embedding provider',
            },
            apiKey: {
              type: 'string',
              description: 'API key for the provider',
            },
            model: {
              type: 'string',
              description: 'Model to use (optional, uses provider default)',
            },
            dimensions: {
              type: 'number',
              description: 'Embedding dimensions (OpenAI text-embedding-3 only)',
            },
          },
          required: ['provider', 'apiKey'],
        },
      },
      {
        name: 'generate_embeddings',
        description: 'Generate embeddings for a single text',
        inputSchema: {
          type: 'object',
          properties: {
            text: {
              type: 'string',
              description: 'Text to embed',
            },
          },
          required: ['text'],
        },
      },
      {
        name: 'generate_batch_embeddings',
        description: 'Generate embeddings for multiple texts (batch)',
        inputSchema: {
          type: 'object',
          properties: {
            texts: {
              type: 'array',
              description: 'Array of texts to embed',
              items: { type: 'string' },
            },
          },
          required: ['texts'],
        },
      },
      {
        name: 'list_models',
        description: 'List available models for current provider',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
    ];
  }

  private async handleConfigure(args: EmbeddingConfig) {
    this.config = args;

    switch (args.provider) {
      case 'openai':
        this.provider = new OpenAIProvider(args.apiKey);
        break;
      case 'cohere':
        this.provider = new CohereProvider(args.apiKey);
        break;
    }

    const models = this.provider.listModels();
    const defaultModel = this.provider.getDefaultModel();

    return {
      content: [
        {
          type: 'text',
          text: `✅ Configured ${args.provider} (default model: ${args.model || defaultModel})\nAvailable models: ${models.join(', ')}`,
        },
      ],
    };
  }

  private async handleGenerateEmbeddings(args: { text: string }) {
    if (!this.provider) {
      throw new Error('Not configured. Call configure() first.');
    }

    const result = await this.provider.generateEmbeddings({
      input: args.text,
      model: this.config?.model,
      dimensions: this.config?.dimensions,
    });

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              embedding: result.embeddings[0],
              dimensions: result.embeddings[0].length,
              model: result.model,
              usage: result.usage,
            },
            null,
            2
          ),
        },
      ],
    };
  }

  private async handleGenerateBatchEmbeddings(args: { texts: string[] }) {
    if (!this.provider) {
      throw new Error('Not configured. Call configure() first.');
    }

    const result = await this.provider.generateEmbeddings({
      input: args.texts,
      model: this.config?.model,
      dimensions: this.config?.dimensions,
    });

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              embeddings: result.embeddings,
              count: result.embeddings.length,
              dimensions: result.embeddings[0].length,
              model: result.model,
              usage: result.usage,
            },
            null,
            2
          ),
        },
      ],
    };
  }

  private async handleListModels() {
    if (!this.provider) {
      throw new Error('Not configured. Call configure() first.');
    }

    const models = this.provider.listModels();

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              provider: this.config?.provider,
              models,
              default: this.provider.getDefaultModel(),
            },
            null,
            2
          ),
        },
      ],
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Embedding Generator MCP server running on stdio');
  }
}

const server = new EmbeddingGeneratorServer();
server.run().catch(console.error);
