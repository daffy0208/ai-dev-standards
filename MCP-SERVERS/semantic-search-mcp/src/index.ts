#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';

/**
 * Semantic Search MCP Server
 *
 * Provides tools for semantic search operations:
 * - Query embedding and similarity search
 * - Re-ranking results for relevance
 * - Citation extraction
 * - Result formatting
 *
 * Requires: vector-database-mcp and embedding-generator-mcp
 * Enables: rag-implementer skill
 */

interface SearchResult {
  id: string;
  text: string;
  score: number;
  metadata?: Record<string, any>;
}

interface SearchConfig {
  vectorDbUrl?: string;
  embeddingProvider?: 'openai' | 'cohere';
  reranker?: 'cohere' | 'none';
  topK?: number;
}

class SemanticSearchServer {
  private server: Server;
  private config: SearchConfig = {
    topK: 10,
    reranker: 'none',
  };
  private documents: Map<string, { text: string; embedding: number[]; metadata: any }> = new Map();

  constructor() {
    this.server = new Server(
      {
        name: 'semantic-search-mcp',
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
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: this.getTools(),
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'configure':
            return await this.handleConfigure(args as any);
          case 'index_document':
            return await this.handleIndexDocument(args as any);
          case 'search':
            return await this.handleSearch(args as any);
          case 'hybrid_search':
            return await this.handleHybridSearch(args as any);
          case 'rerank_results':
            return await this.handleRerank(args as any);
          case 'extract_citations':
            return await this.handleExtractCitations(args as any);
          case 'list_documents':
            return await this.handleListDocuments();
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
        description: 'Configure semantic search settings',
        inputSchema: {
          type: 'object',
          properties: {
            vectorDbUrl: {
              type: 'string',
              description: 'Vector database connection URL',
            },
            embeddingProvider: {
              type: 'string',
              enum: ['openai', 'cohere'],
              description: 'Embedding provider to use',
            },
            reranker: {
              type: 'string',
              enum: ['cohere', 'none'],
              description: 'Re-ranker to use (default: none)',
            },
            topK: {
              type: 'number',
              description: 'Number of results to return (default: 10)',
            },
          },
        },
      },
      {
        name: 'index_document',
        description: 'Index a document for semantic search',
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Unique document ID',
            },
            text: {
              type: 'string',
              description: 'Document text content',
            },
            embedding: {
              type: 'array',
              description: 'Pre-computed embedding vector',
              items: { type: 'number' },
            },
            metadata: {
              type: 'object',
              description: 'Optional metadata',
            },
          },
          required: ['id', 'text', 'embedding'],
        },
      },
      {
        name: 'search',
        description: 'Perform semantic search with a query',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Search query',
            },
            queryEmbedding: {
              type: 'array',
              description: 'Pre-computed query embedding',
              items: { type: 'number' },
            },
            topK: {
              type: 'number',
              description: 'Number of results (overrides config)',
            },
            filter: {
              type: 'object',
              description: 'Metadata filter',
            },
          },
          required: ['queryEmbedding'],
        },
      },
      {
        name: 'hybrid_search',
        description: 'Perform hybrid search (semantic + keyword)',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Search query',
            },
            queryEmbedding: {
              type: 'array',
              description: 'Pre-computed query embedding',
              items: { type: 'number' },
            },
            alpha: {
              type: 'number',
              description: 'Weight for semantic vs keyword (0-1, default 0.7)',
            },
            topK: {
              type: 'number',
              description: 'Number of results',
            },
          },
          required: ['query', 'queryEmbedding'],
        },
      },
      {
        name: 'rerank_results',
        description: 'Re-rank search results for relevance',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Original query',
            },
            results: {
              type: 'array',
              description: 'Search results to re-rank',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  text: { type: 'string' },
                  score: { type: 'number' },
                },
              },
            },
            topK: {
              type: 'number',
              description: 'Number of results to return after re-ranking',
            },
          },
          required: ['query', 'results'],
        },
      },
      {
        name: 'extract_citations',
        description: 'Extract citation information from search results',
        inputSchema: {
          type: 'object',
          properties: {
            results: {
              type: 'array',
              description: 'Search results',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  text: { type: 'string' },
                  metadata: { type: 'object' },
                },
              },
            },
          },
          required: ['results'],
        },
      },
      {
        name: 'list_documents',
        description: 'List all indexed documents',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
    ];
  }

  private async handleConfigure(args: SearchConfig) {
    this.config = { ...this.config, ...args };

    return {
      content: [
        {
          type: 'text',
          text: `✅ Configured semantic search:\n${JSON.stringify(this.config, null, 2)}`,
        },
      ],
    };
  }

  private async handleIndexDocument(args: {
    id: string;
    text: string;
    embedding: number[];
    metadata?: any;
  }) {
    this.documents.set(args.id, {
      text: args.text,
      embedding: args.embedding,
      metadata: args.metadata || {},
    });

    return {
      content: [
        {
          type: 'text',
          text: `✅ Indexed document: ${args.id}\nTotal documents: ${this.documents.size}`,
        },
      ],
    };
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      throw new Error('Vectors must have same length');
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  private async handleSearch(args: {
    query?: string;
    queryEmbedding: number[];
    topK?: number;
    filter?: Record<string, any>;
  }) {
    const topK = args.topK || this.config.topK || 10;
    const results: SearchResult[] = [];

    // Calculate similarity for all documents
    for (const [id, doc] of this.documents.entries()) {
      // Apply metadata filter if provided
      if (args.filter) {
        let matches = true;
        for (const [key, value] of Object.entries(args.filter)) {
          if (doc.metadata[key] !== value) {
            matches = false;
            break;
          }
        }
        if (!matches) continue;
      }

      const score = this.cosineSimilarity(args.queryEmbedding, doc.embedding);
      results.push({
        id,
        text: doc.text,
        score,
        metadata: doc.metadata,
      });
    }

    // Sort by score and take top K
    results.sort((a, b) => b.score - a.score);
    const topResults = results.slice(0, topK);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              query: args.query,
              results: topResults,
              total: results.length,
            },
            null,
            2
          ),
        },
      ],
    };
  }

  private keywordScore(query: string, text: string): number {
    const queryWords = query.toLowerCase().split(/\s+/);
    const textLower = text.toLowerCase();
    let matches = 0;

    for (const word of queryWords) {
      if (textLower.includes(word)) {
        matches++;
      }
    }

    return queryWords.length > 0 ? matches / queryWords.length : 0;
  }

  private async handleHybridSearch(args: {
    query: string;
    queryEmbedding: number[];
    alpha?: number;
    topK?: number;
  }) {
    const alpha = args.alpha ?? 0.7;
    const topK = args.topK || this.config.topK || 10;
    const results: SearchResult[] = [];

    for (const [id, doc] of this.documents.entries()) {
      const semanticScore = this.cosineSimilarity(args.queryEmbedding, doc.embedding);
      const keywordScore = this.keywordScore(args.query, doc.text);
      const hybridScore = alpha * semanticScore + (1 - alpha) * keywordScore;

      results.push({
        id,
        text: doc.text,
        score: hybridScore,
        metadata: {
          ...doc.metadata,
          semanticScore,
          keywordScore,
        },
      });
    }

    results.sort((a, b) => b.score - a.score);
    const topResults = results.slice(0, topK);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              query: args.query,
              searchType: 'hybrid',
              alpha,
              results: topResults,
              total: results.length,
            },
            null,
            2
          ),
        },
      ],
    };
  }

  private async handleRerank(args: {
    query: string;
    results: Array<{ id: string; text: string; score: number }>;
    topK?: number;
  }) {
    // Simple re-ranking based on query term frequency and position
    const reranked = args.results.map((result) => {
      const queryTerms = args.query.toLowerCase().split(/\s+/);
      const textLower = result.text.toLowerCase();

      let rerankScore = result.score;

      // Boost if query terms appear early in text
      const firstMatchPosition = queryTerms.reduce((minPos, term) => {
        const pos = textLower.indexOf(term);
        return pos !== -1 && pos < minPos ? pos : minPos;
      }, Infinity);

      if (firstMatchPosition !== Infinity) {
        const positionBoost = 1 - firstMatchPosition / textLower.length;
        rerankScore += positionBoost * 0.2;
      }

      // Boost if multiple query terms appear
      const matchCount = queryTerms.filter((term) => textLower.includes(term)).length;
      const coverageBoost = matchCount / queryTerms.length;
      rerankScore += coverageBoost * 0.3;

      return { ...result, score: rerankScore };
    });

    reranked.sort((a, b) => b.score - a.score);
    const topK = args.topK || reranked.length;

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              query: args.query,
              results: reranked.slice(0, topK),
              reranked: true,
            },
            null,
            2
          ),
        },
      ],
    };
  }

  private async handleExtractCitations(args: {
    results: Array<{ id: string; text: string; metadata?: any }>;
  }) {
    const citations = args.results.map((result, index) => ({
      citationNumber: index + 1,
      documentId: result.id,
      title: result.metadata?.title || 'Untitled',
      source: result.metadata?.source || result.id,
      excerpt: result.text.substring(0, 200) + (result.text.length > 200 ? '...' : ''),
      url: result.metadata?.url,
      author: result.metadata?.author,
      date: result.metadata?.date,
    }));

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ citations }, null, 2),
        },
      ],
    };
  }

  private async handleListDocuments() {
    const documents = Array.from(this.documents.entries()).map(([id, doc]) => ({
      id,
      textPreview: doc.text.substring(0, 100) + '...',
      metadata: doc.metadata,
      embeddingDimensions: doc.embedding.length,
    }));

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              total: documents.length,
              documents,
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
    console.error('Semantic Search MCP server running on stdio');
  }
}

const server = new SemanticSearchServer();
server.run().catch(console.error);

