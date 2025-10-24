/**
 * Chroma Vector Database Client
 *
 * Integration with Chroma for embedded vector storage and retrieval.
 *
 * Features:
 * - Embedded database (no separate server needed)
 * - Vector similarity search
 * - Metadata filtering
 * - Collections management
 * - Distance metrics (L2, cosine, IP)
 *
 * @example
 * ```typescript
 * import { ChromaClient } from './client'
 *
 * const client = new ChromaClient({
 *   path: './chroma_db'
 * })
 *
 * // Create collection
 * await client.createCollection('documents', {
 *   metadata: { description: 'Document embeddings' }
 * })
 *
 * // Add vectors
 * await client.addVectors('documents', {
 *   ids: ['doc1', 'doc2'],
 *   embeddings: [[0.1, 0.2, ...], [0.3, 0.4, ...]],
 *   metadatas: [{ title: 'Doc 1' }, { title: 'Doc 2' }],
 *   documents: ['Content 1', 'Content 2']
 * })
 *
 * // Search
 * const results = await client.search('documents', queryVector, {
 *   nResults: 10,
 *   where: { title: 'Doc 1' }
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

export interface SearchOptions {
  nResults?: number
  where?: Record<string, any>
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
   * Upsert vectors (add or update)
   */
  async upsertVectors(
    collectionName: string,
    params: AddVectorsParams
  ): Promise<void> {
    const collection = await this.getOrCreateCollection(collectionName)

    await collection.upsert({
      ids: params.ids,
      embeddings: params.embeddings,
      metadatas: params.metadatas,
      documents: params.documents,
    })
  }

  /**
   * Vector similarity search
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

    const results = await collection.query({
      queryEmbeddings: embeddings,
      nResults: options.nResults || 10,
      where: options.where,
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
 * Create Chroma client with environment variables
 */
export function createChromaClient(): ChromaClient {
  return new ChromaClient({
    path: process.env.CHROMA_PATH || './chroma_db',
    url: process.env.CHROMA_URL,
    auth: process.env.CHROMA_AUTH_TOKEN,
  })
}
