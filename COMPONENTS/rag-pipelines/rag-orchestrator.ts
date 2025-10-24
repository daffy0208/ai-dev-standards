/**
 * RAG Orchestrator
 *
 * Complete RAG pipeline orchestrator that coordinates document loading,
 * chunking, embedding, vector storage, and retrieval.
 *
 * Features:
 * - End-to-end RAG workflow
 * - Multi-document processing
 * - Batch operations
 * - Progress tracking
 * - Error handling and retry
 * - Caching
 * - Metadata management
 *
 * @example
 * ```typescript
 * const orchestrator = new RAGOrchestrator({
 *   vectorStore,
 *   embeddingProvider: 'openai',
 *   chunkSize: 1000,
 *   chunkOverlap: 200
 * })
 *
 * // Index documents
 * await orchestrator.indexDocuments([
 *   { path: './docs/guide.md', type: 'markdown' },
 *   { path: './docs/api.pdf', type: 'pdf' }
 * ])
 *
 * // Query
 * const results = await orchestrator.query('What is RAG?', {
 *   topK: 5,
 *   rerank: true
 * })
 * ```
 */

import type { VectorStore } from 'langchain/vectorstores/base'
import type { Document } from 'langchain/document'
import { DocumentLoader } from './document-loader'
import { TextChunker } from './text-chunker'
import { EmbeddingPipeline } from './embedding-pipeline'
import { RetrievalPipeline } from './retrieval-pipeline'

export type EmbeddingProvider = 'openai' | 'cohere' | 'huggingface'
export type ChunkingStrategy = 'fixed' | 'recursive' | 'markdown' | 'token' | 'semantic'

export interface RAGOrchestratorOptions {
  /**
   * Vector store for embeddings
   */
  vectorStore: VectorStore

  /**
   * Embedding provider
   */
  embeddingProvider?: EmbeddingProvider

  /**
   * Embedding model name
   */
  embeddingModel?: string

  /**
   * Chunk size for text splitting
   */
  chunkSize?: number

  /**
   * Chunk overlap
   */
  chunkOverlap?: number

  /**
   * Chunking strategy
   */
  chunkingStrategy?: ChunkingStrategy

  /**
   * Search type for retrieval
   */
  searchType?: 'vector' | 'keyword' | 'hybrid'

  /**
   * Enable reranking
   */
  rerank?: boolean

  /**
   * Cache embeddings
   */
  cacheEmbeddings?: boolean

  /**
   * Batch size for processing
   */
  batchSize?: number

  /**
   * Progress callback
   */
  onProgress?: (progress: ProgressUpdate) => void
}

export interface DocumentInput {
  /**
   * File path or URL
   */
  path: string

  /**
   * Document type
   */
  type?: 'pdf' | 'docx' | 'txt' | 'md' | 'json' | 'csv' | 'html'

  /**
   * Optional metadata
   */
  metadata?: Record<string, any>
}

export interface QueryOptions {
  /**
   * Number of results to return
   */
  topK?: number

  /**
   * Enable reranking
   */
  rerank?: boolean

  /**
   * Expand query
   */
  expandQuery?: boolean

  /**
   * Metadata filter
   */
  filter?: Record<string, any>

  /**
   * Minimum similarity score
   */
  scoreThreshold?: number
}

export interface QueryResult {
  documents: Document[]
  scores: number[]
  query: string
  expandedQueries?: string[]
  metadata: {
    retrievalTimeMs: number
    totalResults: number
    reranked: boolean
  }
}

export interface ProgressUpdate {
  stage: 'loading' | 'chunking' | 'embedding' | 'indexing' | 'complete'
  current: number
  total: number
  message: string
}

export interface IndexingResult {
  success: boolean
  documentsProcessed: number
  chunksCreated: number
  embeddingsGenerated: number
  timeMs: number
  errors: Array<{ document: string; error: string }>
}

export class RAGOrchestrator {
  private options: Required<Omit<RAGOrchestratorOptions, 'onProgress' | 'embeddingModel'>> & {
    onProgress?: (progress: ProgressUpdate) => void
    embeddingModel?: string
  }

  private loader: DocumentLoader
  private chunker: TextChunker
  private embeddingPipeline: EmbeddingPipeline
  private retrievalPipeline: RetrievalPipeline

  private indexedDocuments: Set<string> = new Set()

  constructor(options: RAGOrchestratorOptions) {
    this.options = {
      vectorStore: options.vectorStore,
      embeddingProvider: options.embeddingProvider || 'openai',
      embeddingModel: options.embeddingModel,
      chunkSize: options.chunkSize || 1000,
      chunkOverlap: options.chunkOverlap || 200,
      chunkingStrategy: options.chunkingStrategy || 'recursive',
      searchType: options.searchType || 'hybrid',
      rerank: options.rerank ?? true,
      cacheEmbeddings: options.cacheEmbeddings ?? true,
      batchSize: options.batchSize || 100,
      onProgress: options.onProgress,
    }

    // Initialize components
    this.loader = new DocumentLoader()

    this.chunker = new TextChunker({
      chunkSize: this.options.chunkSize,
      chunkOverlap: this.options.chunkOverlap,
      strategy: this.options.chunkingStrategy,
    })

    this.embeddingPipeline = new EmbeddingPipeline({
      provider: this.options.embeddingProvider,
      model: this.options.embeddingModel,
      batchSize: this.options.batchSize,
      cache: this.options.cacheEmbeddings,
      onProgress: (progress) => {
        this.options.onProgress?.({
          stage: 'embedding',
          current: progress.current,
          total: progress.total,
          message: `Generating embeddings: ${progress.current}/${progress.total}`,
        })
      },
    })

    this.retrievalPipeline = new RetrievalPipeline({
      vectorStore: this.options.vectorStore,
      searchType: this.options.searchType,
      rerank: this.options.rerank,
    })
  }

  /**
   * Index documents into vector store
   */
  async indexDocuments(inputs: DocumentInput[]): Promise<IndexingResult> {
    const startTime = Date.now()
    const errors: Array<{ document: string; error: string }> = []

    let totalDocuments = 0
    let totalChunks = 0
    let totalEmbeddings = 0

    try {
      // Stage 1: Load documents
      this.reportProgress('loading', 0, inputs.length, 'Loading documents...')

      const allDocuments: Document[] = []

      for (let i = 0; i < inputs.length; i++) {
        const input = inputs[i]

        try {
          const docs = await this.loader.load(input.path, input.type)

          // Add metadata
          docs.forEach((doc) => {
            doc.metadata = {
              ...doc.metadata,
              ...input.metadata,
              source: input.path,
              indexed_at: new Date().toISOString(),
            }
          })

          allDocuments.push(...docs)
          totalDocuments += docs.length

          this.reportProgress('loading', i + 1, inputs.length, `Loaded ${input.path}`)
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error)
          errors.push({ document: input.path, error: errorMessage })
        }
      }

      // Stage 2: Chunk documents
      this.reportProgress('chunking', 0, allDocuments.length, 'Chunking documents...')

      const allChunks: Document[] = []

      for (let i = 0; i < allDocuments.length; i++) {
        const doc = allDocuments[i]
        const chunks = await this.chunker.chunk(doc.pageContent, doc.metadata)
        allChunks.push(...chunks)

        this.reportProgress(
          'chunking',
          i + 1,
          allDocuments.length,
          `Chunked ${i + 1}/${allDocuments.length} documents`
        )
      }

      totalChunks = allChunks.length

      // Stage 3: Generate embeddings
      this.reportProgress('embedding', 0, allChunks.length, 'Generating embeddings...')

      const embeddings = await this.embeddingPipeline.embedDocuments(allChunks)
      totalEmbeddings = embeddings.length

      // Stage 4: Index into vector store
      this.reportProgress('indexing', 0, allChunks.length, 'Indexing into vector store...')

      await this.options.vectorStore.addDocuments(allChunks)

      // Track indexed documents
      inputs.forEach((input) => this.indexedDocuments.add(input.path))

      this.reportProgress('complete', allChunks.length, allChunks.length, 'Indexing complete')

      const timeMs = Date.now() - startTime

      return {
        success: true,
        documentsProcessed: totalDocuments,
        chunksCreated: totalChunks,
        embeddingsGenerated: totalEmbeddings,
        timeMs,
        errors,
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      throw new Error(`Indexing failed: ${errorMessage}`)
    }
  }

  /**
   * Index a single document
   */
  async indexDocument(input: DocumentInput): Promise<IndexingResult> {
    return this.indexDocuments([input])
  }

  /**
   * Index documents from a directory
   */
  async indexDirectory(
    directoryPath: string,
    options?: {
      recursive?: boolean
      fileTypes?: string[]
      metadata?: Record<string, any>
    }
  ): Promise<IndexingResult> {
    // Load all files from directory
    const documents = await this.loader.loadDirectory(directoryPath, {
      recursive: options?.recursive,
      fileTypes: options?.fileTypes,
    })

    // Convert to DocumentInput format
    const inputs: DocumentInput[] = documents.map((doc) => ({
      path: doc.metadata.source as string,
      metadata: {
        ...doc.metadata,
        ...options?.metadata,
      },
    }))

    return this.indexDocuments(inputs)
  }

  /**
   * Query the indexed documents
   */
  async query(query: string, options: QueryOptions = {}): Promise<QueryResult> {
    const result = await this.retrievalPipeline.retrieve(query)

    // Apply score threshold if specified
    let documents = result.documents
    let scores = result.scores

    if (options.scoreThreshold !== undefined) {
      const filtered = documents
        .map((doc, i) => ({ doc, score: scores[i] }))
        .filter((item) => item.score >= options.scoreThreshold!)

      documents = filtered.map((item) => item.doc)
      scores = filtered.map((item) => item.score)
    }

    // Apply topK if specified
    const topK = options.topK || result.documents.length
    documents = documents.slice(0, topK)
    scores = scores.slice(0, topK)

    return {
      documents,
      scores,
      query: result.query,
      expandedQueries: result.expandedQueries,
      metadata: result.metadata,
    }
  }

  /**
   * Get context for a query (formatted for LLM)
   */
  async getContext(
    query: string,
    options: QueryOptions & { maxTokens?: number } = {}
  ): Promise<string> {
    const result = await this.query(query, options)

    // Get documents that fit within token limit
    const contextDocs = options.maxTokens
      ? RetrievalPipeline.getContextWindow(result.documents, options.maxTokens)
      : result.documents

    return RetrievalPipeline.formatContext(contextDocs)
  }

  /**
   * Clear all indexed documents
   */
  async clear(): Promise<void> {
    // Note: This depends on vector store implementation
    // Some vector stores may not support clearing
    this.indexedDocuments.clear()
  }

  /**
   * Get list of indexed documents
   */
  getIndexedDocuments(): string[] {
    return Array.from(this.indexedDocuments)
  }

  /**
   * Check if document is indexed
   */
  isIndexed(documentPath: string): boolean {
    return this.indexedDocuments.has(documentPath)
  }

  /**
   * Get orchestrator statistics
   */
  getStats(): {
    indexedDocuments: number
    embeddingProvider: string
    embeddingModel?: string
    chunkSize: number
    chunkOverlap: number
  } {
    return {
      indexedDocuments: this.indexedDocuments.size,
      embeddingProvider: this.options.embeddingProvider,
      embeddingModel: this.options.embeddingModel,
      chunkSize: this.options.chunkSize,
      chunkOverlap: this.options.chunkOverlap,
    }
  }

  /**
   * Report progress
   */
  private reportProgress(
    stage: ProgressUpdate['stage'],
    current: number,
    total: number,
    message: string
  ): void {
    this.options.onProgress?.({
      stage,
      current,
      total,
      message,
    })
  }
}

/**
 * Quick utility for creating RAG orchestrator
 */
export function createRAGOrchestrator(
  vectorStore: VectorStore,
  options: Omit<RAGOrchestratorOptions, 'vectorStore'> = {}
): RAGOrchestrator {
  return new RAGOrchestrator({
    vectorStore,
    ...options,
  })
}
