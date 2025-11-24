#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool
} from '@modelcontextprotocol/sdk/types.js'
import { createVectorStoreClient, type VectorStore, type QueryResult } from './vector-store.js'
import { fileURLToPath } from 'url'

interface SearchConfig {
  vectorDbUrl?: string
  embeddingProvider?: 'openai' | 'cohere'
  reranker?: 'cohere' | 'none'
  topK?: number
}

export class SemanticSearchServer {
  private server: Server
  private config: SearchConfig = {
    topK: 10,
    reranker: 'none'
  }
  private vectorStore: VectorStore
  private vectorProvider: 'pinecone' | 'memory'

  constructor() {
    this.server = new Server(
      {
        name: 'semantic-search-mcp',
        version: '1.0.0'
      },
      {
        capabilities: {
          tools: {}
        }
      }
    )

    const { store, provider } = createVectorStoreClient()
    this.vectorStore = store
    this.vectorProvider = provider

    this.setupHandlers()
  }

  private setupHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: this.getTools()
    }))

    this.server.setRequestHandler(CallToolRequestSchema, async request => {
      const { name, arguments: args } = request.params
      return this.executeTool(name, args)
    })
  }

  async executeTool(name: string, args: unknown) {
    try {
      switch (name) {
        case 'configure':
          return await this.handleConfigure(args as SearchConfig)
        case 'index_document':
          return await this.handleIndexDocument(
            args as {
              id: string
              text: string
              embedding: number[]
              metadata?: Record<string, unknown>
            }
          )
        case 'search':
          return await this.handleSearch(
            args as {
              query: string
              queryEmbedding: number[]
              topK?: number
              filter?: Record<string, unknown>
            }
          )
        case 'hybrid_search':
          return await this.handleHybridSearch(
            args as {
              query: string
              queryEmbedding: number[]
              alpha?: number
              filter?: Record<string, unknown>
            }
          )
        case 'rerank_results':
          return await this.handleRerank(
            args as {
              query: string
              results: QueryResult[]
              strategy?: 'linear' | 'exponential'
              temperature?: number
            }
          )
        case 'extract_citations':
          return await this.handleExtractCitations(args as { results: QueryResult[] })
        case 'list_documents':
          return await this.handleListDocuments()
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
  }

  private getTools(): Tool[] {
    return [
      {
        name: 'configure',
        description: 'Configure semantic search settings',
        inputSchema: {
          type: 'object',
          properties: {
            vectorDbUrl: { type: 'string', description: 'Vector database connection URL' },
            embeddingProvider: { type: 'string', enum: ['openai', 'cohere'] },
            reranker: { type: 'string', enum: ['cohere', 'none'] },
            topK: { type: 'number', description: 'Number of results to return (default: 10)' }
          }
        }
      },
      {
        name: 'index_document',
        description: 'Index a document for semantic search',
        inputSchema: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            text: { type: 'string' },
            embedding: { type: 'array', items: { type: 'number' } },
            metadata: { type: 'object' }
          },
          required: ['id', 'text', 'embedding']
        }
      },
      {
        name: 'search',
        description: 'Perform semantic search with a query',
        inputSchema: {
          type: 'object',
          properties: {
            query: { type: 'string' },
            queryEmbedding: { type: 'array', items: { type: 'number' } },
            topK: { type: 'number' },
            filter: { type: 'object' }
          },
          required: ['query', 'queryEmbedding']
        }
      },
      {
        name: 'hybrid_search',
        description: 'Perform hybrid search (semantic + keyword)',
        inputSchema: {
          type: 'object',
          properties: {
            query: { type: 'string' },
            queryEmbedding: { type: 'array', items: { type: 'number' } },
            alpha: {
              type: 'number',
              description: 'Weight for semantic vs keyword (0-1, default 0.7)'
            },
            filter: { type: 'object' }
          },
          required: ['query', 'queryEmbedding']
        }
      },
      {
        name: 'rerank_results',
        description: 'Re-rank search results using reranker model',
        inputSchema: {
          type: 'object',
          properties: {
            query: { type: 'string' },
            results: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  score: { type: 'number' },
                  metadata: { type: 'object' }
                }
              }
            },
            strategy: { type: 'string', enum: ['linear', 'exponential'] },
            temperature: { type: 'number' }
          },
          required: ['query', 'results']
        }
      },
      {
        name: 'extract_citations',
        description: 'Extract citation information from search results',
        inputSchema: {
          type: 'object',
          properties: {
            results: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  metadata: { type: 'object' }
                }
              }
            }
          },
          required: ['results']
        }
      },
      {
        name: 'list_documents',
        description: 'List all indexed documents',
        inputSchema: { type: 'object', properties: {} }
      }
    ]
  }

  private async handleConfigure(args: SearchConfig) {
    this.config = { ...this.config, ...args }
    return {
      content: [
        {
          type: 'text',
          text: `✅ Configured semantic search:\n${JSON.stringify(this.config, null, 2)}`
        }
      ]
    }
  }

  private async handleIndexDocument(args: {
    id: string
    text: string
    embedding: number[]
    metadata?: Record<string, unknown>
  }) {
    await this.vectorStore.upsert([
      {
        id: args.id,
        text: args.text,
        embedding: args.embedding,
        metadata: args.metadata || {}
      }
    ])

    return {
      content: [{ type: 'text', text: `✅ Indexed document: ${args.id}` }]
    }
  }

  private async handleSearch(args: {
    query: string
    queryEmbedding: number[]
    topK?: number
    filter?: Record<string, unknown>
  }) {
    const topK = args.topK || this.config.topK || 10
    const results = await this.vectorStore.query({
      embedding: args.queryEmbedding,
      topK,
      filter: args.filter
    })

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              query: args.query,
              provider: this.vectorProvider,
              results: this.formatResults(results)
            },
            null,
            2
          )
        }
      ]
    }
  }

  private async handleHybridSearch(args: {
    query: string
    queryEmbedding: number[]
    alpha?: number
    filter?: Record<string, unknown>
  }) {
    const alpha = typeof args.alpha === 'number' ? args.alpha : 0.7
    const baseResults = await this.vectorStore.query({
      embedding: args.queryEmbedding,
      topK: this.config.topK || 10,
      filter: args.filter
    })

    const reranked = baseResults.map(result => {
      const text = (result.metadata?.text as string) || ''
      const keywordMatch = text.toLowerCase().includes(args.query.toLowerCase()) ? 1 : 0
      const score = alpha * result.score + (1 - alpha) * keywordMatch
      return { ...result, score }
    })

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              query: args.query,
              provider: this.vectorProvider,
              results: this.formatResults(reranked)
            },
            null,
            2
          )
        }
      ]
    }
  }

  private async handleRerank(args: {
    query: string
    results: QueryResult[]
    strategy?: 'linear' | 'exponential'
    temperature?: number
  }) {
    const reranked = args.results.map((result, index) => {
      const positionBoost =
        args.strategy === 'linear' ? 1 : Math.exp(-index / (args.temperature || 1))
      const freshnessBoost = result.metadata?.timestamp
        ? 1 /
          (1 + Math.exp(-(Date.now() - new Date(result.metadata.timestamp as string).getTime())))
        : 1

      return {
        ...result,
        score: result.score * positionBoost * freshnessBoost
      }
    })

    return {
      content: [{ type: 'text', text: JSON.stringify(this.formatResults(reranked), null, 2) }]
    }
  }

  private async handleExtractCitations(args: { results: QueryResult[] }) {
    const citations = args.results.map(result => ({
      id: result.id,
      source: result.metadata?.source || result.metadata?.url || result.metadata?.doc_id,
      snippet: (result.metadata?.text as string)?.slice(0, 160)
    }))

    return {
      content: [{ type: 'text', text: JSON.stringify(citations, null, 2) }]
    }
  }

  private async handleListDocuments() {
    const docs = await this.vectorStore.list()
    if (!docs) {
      return {
        content: [
          {
            type: 'text',
            text: 'Listing documents is not supported for the configured vector store.'
          }
        ]
      }
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            docs.map(doc => ({ id: doc.id, metadata: doc.metadata })),
            null,
            2
          )
        }
      ]
    }
  }

  private formatResults(results: QueryResult[]) {
    return results.map(result => ({
      id: result.id,
      score: Number(result.score.toFixed(4)),
      metadata: result.metadata
    }))
  }

  async start() {
    const transport = new StdioServerTransport()
    await this.server.connect(transport)
    console.error('Semantic search MCP server running on stdio')
  }
}

const isMainModule = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]

if (isMainModule) {
  const server = new SemanticSearchServer()
  server.start().catch(error => {
    console.error('Semantic search MCP server failed to start:', error)
    process.exit(1)
  })
}
