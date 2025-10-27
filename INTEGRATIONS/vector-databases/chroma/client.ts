/**
 * Chroma Vector Database Client
 *
 * Integration with ChromaDB for embedded vector storage and retrieval.
 * ChromaDB is the open-source embedding database that makes it easy to build
 * LLM applications by making knowledge, facts, and skills pluggable for LLMs.
 *
 * Features:
 * - Embedded database (no separate server needed)
 * - Client-server mode support
 * - Vector similarity search with multiple distance metrics
 * - Advanced metadata filtering
 * - Batch operations with configurable size
 * - Collections management
 * - Distance metrics (L2, cosine, IP)
 * - Persistent storage support
 *
 * @example
 * ```typescript
 * import { ChromaClient } from './client'
 *
 * // Embedded mode (no external service required)
 * const client = new ChromaClient({
 *   path: './chroma_db'
 * })
 *
 * // Client-server mode
 * const remoteClient = new ChromaClient({
 *   url: 'http://localhost:8000',
 *   auth: 'your-token'
 * })
 *
 * // Create collection
 * await client.createCollection('documents', {
 *   metadata: { description: 'Document embeddings', hnsw:space: 'cosine' }
 * })
 *
 * // Add vectors (batch operation)
 * await client.upsert('documents', {
 *   ids: ['doc1', 'doc2'],
 *   embeddings: [[0.1, 0.2, ...], [0.3, 0.4, ...]],
 *   metadatas: [{ title: 'Doc 1', category: 'tech' }, { title: 'Doc 2', category: 'science' }],
 *   documents: ['Content 1', 'Content 2']
 * })
 *
 * // Search with metadata filtering
 * const results = await client.search('documents', queryVector, {
 *   limit: 10,
 *   filter: { category: 'tech' }
 * })
 * ```
 */

import { ChromaClient as Chroma, Collection } from 'chromadb'

export interface ChromaConfig {
  /**
   * Path to Chroma database (for persistent storage)
   */
  path?: string

  /**
   * Chroma server URL (if using client-server mode)
   */
  url?: string

  /**
   * Authentication token (if required)
   */
  auth?: string
}

export interface CollectionConfig {
  metadata?: Record<string, any>
  embeddingFunction?: any
}

export interface AddVectorsParams {
  ids: string[]
  embeddings: number[][]
  metadatas?: Record<string, any>[]
  documents?: string[]
}

export interface UpsertOptions {
  batchSize?: number
  onProgress?: (current: number, total: number) => void
}

export interface SearchOptions {
  nResults?: number
  limit?: number // Alias for nResults
  where?: Record<string, any>
  filter?: Record<string, any> // Alias for where
  whereDocument?: Record<string, any>
  include?: Array<'embeddings' | 'metadatas' | 'documents' | 'distances'>
}

export interface QueryResult {
  ids: string[][]
  embeddings?: number[][][]
  documents?: string[][]
  metadatas?: Record<string, any>[][]
  distances?: number[][]
}

export class ChromaClient {
  private client: Chroma
  private collections: Map<string, Collection> = new Map()

  constructor(config: ChromaConfig = {}) {
    if (config.url) {
      // Client-server mode
      this.client = new Chroma({
        path: config.url,
        auth: config.auth ? { provider: 'token', credentials: config.auth } : undefined,
      })
    } else {
      // Embedded mode
      this.client = new Chroma({
        path: config.path || './chroma_db',
      })
    }
  }

  /**
   * Create a new collection
   */
  async createCollection(
    name: string,
    config: CollectionConfig = {}
  ): Promise<void> {
    const collection = await this.client.createCollection({
      name,
      metadata: config.metadata,
      embeddingFunction: config.embeddingFunction,
    })

    this.collections.set(name, collection)
  }

  /**
   * Get or create collection
   */
  async getOrCreateCollection(
    name: string,
    config: CollectionConfig = {}
  ): Promise<Collection> {
    if (this.collections.has(name)) {
      return this.collections.get(name)!
    }

    const collection = await this.client.getOrCreateCollection({
      name,
      metadata: config.metadata,
      embeddingFunction: config.embeddingFunction,
    })

    this.collections.set(name, collection)
    return collection
  }

  /**
   * Delete a collection
   */
  async deleteCollection(name: string): Promise<void> {
    await this.client.deleteCollection({ name })
    this.collections.delete(name)
  }

  /**
   * List all collections
   */
  async listCollections(): Promise<string[]> {
    const collections = await this.client.listCollections()
    return collections.map(c => c.name)
  }

  /**
   * Add vectors to collection
   */
  async addVectors(
    collectionName: string,
    params: AddVectorsParams
  ): Promise<void> {
    const collection = await this.getOrCreateCollection(collectionName)

    await collection.add({
      ids: params.ids,
      embeddings: params.embeddings,
      metadatas: params.metadatas,
      documents: params.documents,
    })
  }

  /**
   * Update vectors in collection
   */
  async updateVectors(
    collectionName: string,
    params: AddVectorsParams
  ): Promise<void> {
    const collection = await this.getOrCreateCollection(collectionName)

    await collection.update({
      ids: params.ids,
      embeddings: params.embeddings,
      metadatas: params.metadatas,
      documents: params.documents,
    })
  }

  /**
   * Upsert vectors (add or update) with batch support
   * Efficiently handles large datasets by processing in batches
   */
  async upsert(
    collectionName: string,
    params: AddVectorsParams,
    options: UpsertOptions = {}
  ): Promise<void> {
    const collection = await this.getOrCreateCollection(collectionName)
    const batchSize = options.batchSize || 100
    const total = params.ids.length

    // Process in batches to avoid memory issues
    for (let i = 0; i < total; i += batchSize) {
      const endIdx = Math.min(i + batchSize, total)

      await collection.upsert({
        ids: params.ids.slice(i, endIdx),
        embeddings: params.embeddings.slice(i, endIdx),
        metadatas: params.metadatas?.slice(i, endIdx),
        documents: params.documents?.slice(i, endIdx),
      })

      if (options.onProgress) {
        options.onProgress(endIdx, total)
      }
    }
  }

  /**
   * Legacy alias for upsert (backward compatibility)
   */
  async upsertVectors(
    collectionName: string,
    params: AddVectorsParams
  ): Promise<void> {
    return this.upsert(collectionName, params)
  }

  /**
   * Vector similarity search
   * Supports both single vector and batch queries
   */
  async search(
    collectionName: string,
    queryEmbeddings: number[] | number[][],
    options: SearchOptions = {}
  ): Promise<QueryResult> {
    const collection = await this.getOrCreateCollection(collectionName)

    // Ensure queryEmbeddings is 2D array
    const embeddings = Array.isArray(queryEmbeddings[0])
      ? (queryEmbeddings as number[][])
      : [queryEmbeddings as number[]]

    // Support both nResults and limit, and where/filter aliases
    const nResults = options.nResults || options.limit || 10
    const where = options.where || options.filter

    const results = await collection.query({
      queryEmbeddings: embeddings,
      nResults,
      where,
      whereDocument: options.whereDocument,
      include: options.include || ['metadatas', 'documents', 'distances'],
    })

    return results as QueryResult
  }

  /**
   * Get vectors by IDs
   */
  async getByIds(
    collectionName: string,
    ids: string[],
    options: { include?: Array<'embeddings' | 'metadatas' | 'documents'> } = {}
  ): Promise<{
    ids: string[]
    embeddings?: number[][]
    metadatas?: Record<string, any>[]
    documents?: string[]
  }> {
    const collection = await this.getOrCreateCollection(collectionName)

    return await collection.get({
      ids,
      include: options.include || ['metadatas', 'documents'],
    })
  }

  /**
   * Get all vectors from collection
   */
  async getAll(
    collectionName: string,
    options: {
      where?: Record<string, any>
      limit?: number
      offset?: number
      include?: Array<'embeddings' | 'metadatas' | 'documents'>
    } = {}
  ): Promise<{
    ids: string[]
    embeddings?: number[][]
    metadatas?: Record<string, any>[]
    documents?: string[]
  }> {
    const collection = await this.getOrCreateCollection(collectionName)

    return await collection.get({
      where: options.where,
      limit: options.limit,
      offset: options.offset,
      include: options.include || ['metadatas', 'documents'],
    })
  }

  /**
   * Delete vectors by IDs
   */
  async deleteByIds(collectionName: string, ids: string[]): Promise<void> {
    const collection = await this.getOrCreateCollection(collectionName)
    await collection.delete({ ids })
  }

  /**
   * Delete vectors by filter
   */
  async deleteByFilter(
    collectionName: string,
    where: Record<string, any>
  ): Promise<void> {
    const collection = await this.getOrCreateCollection(collectionName)
    await collection.delete({ where })
  }

  /**
   * Get collection count
   */
  async count(collectionName: string): Promise<number> {
    const collection = await this.getOrCreateCollection(collectionName)
    return await collection.count()
  }

  /**
   * Peek at first N items in collection
   */
  async peek(
    collectionName: string,
    limit: number = 10
  ): Promise<{
    ids: string[]
    embeddings?: number[][]
    metadatas?: Record<string, any>[]
    documents?: string[]
  }> {
    const collection = await this.getOrCreateCollection(collectionName)
    return await collection.peek({ limit })
  }

  /**
   * Reset entire database (delete all collections)
   */
  async reset(): Promise<void> {
    await this.client.reset()
    this.collections.clear()
  }

  /**
   * Get client version
   */
  async version(): Promise<string> {
    return await this.client.version()
  }

  /**
   * Get heartbeat (health check)
   */
  async heartbeat(): Promise<number> {
    return await this.client.heartbeat()
  }
}

/**
 * Utility Functions
 */

/**
 * Normalize vector to unit length (for cosine similarity)
 */
export function normalizeVector(vector: number[]): number[] {
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0))
  if (magnitude === 0) return vector
  return vector.map(val => val / magnitude)
}

/**
 * Calculate cosine similarity between two vectors
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have same length')
  }

  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0)
  const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0))
  const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0))

  if (magnitudeA === 0 || magnitudeB === 0) return 0
  return dotProduct / (magnitudeA * magnitudeB)
}

/**
 * Calculate Euclidean distance between two vectors
 */
export function euclideanDistance(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have same length')
  }

  return Math.sqrt(a.reduce((sum, val, i) => sum + Math.pow(val - b[i], 2), 0))
}

/**
 * Calculate L2 (squared Euclidean) distance
 */
export function l2Distance(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have same length')
  }

  return a.reduce((sum, val, i) => sum + Math.pow(val - b[i], 2), 0)
}

/**
 * Chunk text into overlapping segments
 * Useful for processing long documents before embedding
 */
export function chunkText(
  text: string,
  chunkSize: number = 500,
  overlap: number = 50
): string[] {
  const chunks: string[] = []
  const words = text.split(/\s+/)

  for (let i = 0; i < words.length; i += chunkSize - overlap) {
    const chunk = words.slice(i, i + chunkSize).join(' ')
    if (chunk.trim()) {
      chunks.push(chunk.trim())
    }
  }

  return chunks.length > 0 ? chunks : [text]
}

/**
 * Generate unique ID from text content
 */
export function generateId(text: string, prefix: string = 'doc'): string {
  // Simple hash function for generating IDs
  let hash = 0
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return `${prefix}_${Math.abs(hash)}_${Date.now()}`
}

/**
 * Batch array into smaller chunks
 */
export function batchArray<T>(array: T[], batchSize: number): T[][] {
  const batches: T[][] = []
  for (let i = 0; i < array.length; i += batchSize) {
    batches.push(array.slice(i, i + batchSize))
  }
  return batches
}

/**
 * Create Chroma client with environment variables
 */
export function createChromaClient(): ChromaClient {
  return new ChromaClient({
    path: process.env.CHROMA_PATH || './chroma_db',
    url: process.env.CHROMA_URL,
    auth: process.env.CHROMA_AUTH_TOKEN,
  })
}

/**
 * Example usage and patterns
 */
export async function examples() {
  const client = new ChromaClient({ path: './my_chroma_db' })

  // Example 1: Create collection with metadata
  await client.createCollection('documents', {
    metadata: {
      description: 'Document embeddings',
      'hnsw:space': 'cosine', // Distance metric
    },
  })

  // Example 2: Batch upsert with progress tracking
  const documents = Array.from({ length: 1000 }, (_, i) => ({
    id: `doc_${i}`,
    embedding: Array(384).fill(0).map(() => Math.random()),
    metadata: { index: i, category: 'test' },
    document: `Document ${i} content`,
  }))

  await client.upsert(
    'documents',
    {
      ids: documents.map(d => d.id),
      embeddings: documents.map(d => d.embedding),
      metadatas: documents.map(d => d.metadata),
      documents: documents.map(d => d.document),
    },
    {
      batchSize: 100,
      onProgress: (current, total) => {
        console.log(`Progress: ${current}/${total} (${Math.round(current / total * 100)}%)`)
      },
    }
  )

  // Example 3: Search with filtering
  const queryVector = Array(384).fill(0).map(() => Math.random())
  const results = await client.search('documents', queryVector, {
    limit: 5,
    filter: { category: 'test' },
    include: ['metadatas', 'documents', 'distances'],
  })

  console.log('Search results:', results)

  // Example 4: Text chunking before embedding
  const longText = 'This is a very long document...'.repeat(100)
  const chunks = chunkText(longText, 500, 50)

  const chunkIds = chunks.map((_, i) => generateId(chunks[i], 'chunk'))
  // Then embed each chunk and upsert

  // Example 5: Get collection statistics
  const count = await client.count('documents')
  console.log(`Collection has ${count} vectors`)

  // Example 6: Delete by filter
  await client.deleteByFilter('documents', { category: 'test' })

  // Example 7: Peek at first items
  const sample = await client.peek('documents', 5)
  console.log('First 5 items:', sample)
}

/**
 * Singleton instance (optional pattern)
 */
let instance: ChromaClient | null = null

export function getChromaClient(config?: ChromaConfig): ChromaClient {
  if (!instance) {
    instance = config ? new ChromaClient(config) : createChromaClient()
  }
  return instance
}
