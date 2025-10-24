/**
 * Weaviate Vector Database Client
 *
 * Integration with Weaviate for vector storage and hybrid search.
 *
 * Features:
 * - Vector similarity search
 * - Hybrid search (semantic + keyword)
 * - Metadata filtering
 * - Multi-tenancy support
 * - CRUD operations
 *
 * @example
 * ```typescript
 * import { WeaviateClient } from './client'
 *
 * const client = new WeaviateClient({
 *   scheme: 'https',
 *   host: 'your-cluster.weaviate.network',
 *   apiKey: process.env.WEAVIATE_API_KEY,
 * })
 *
 * // Create collection
 * await client.createCollection('documents', {
 *   vectorizer: 'text2vec-openai',
 *   properties: [
 *     { name: 'content', dataType: ['text'] },
 *     { name: 'title', dataType: ['text'] },
 *   ]
 * })
 *
 * // Insert documents
 * await client.insertVectors('documents', [
 *   {
 *     content: 'Document text',
 *     title: 'Title',
 *     vector: [0.1, 0.2, ...]
 *   }
 * ])
 *
 * // Search
 * const results = await client.search('documents', queryVector, {
 *   limit: 10,
 *   filter: { path: ['title'], operator: 'Equal', valueText: 'Title' }
 * })
 * ```
 */

import weaviate, { WeaviateClient as WClient, ApiKey } from 'weaviate-ts-client'

export interface WeaviateConfig {
  scheme: 'http' | 'https'
  host: string
  apiKey?: string
  headers?: Record<string, string>
}

export interface CollectionConfig {
  vectorizer?: string
  vectorIndexType?: 'hnsw' | 'flat'
  properties: Array<{
    name: string
    dataType: string[]
    description?: string
  }>
  moduleConfig?: Record<string, any>
}

export interface SearchOptions {
  limit?: number
  offset?: number
  filter?: {
    path: string[]
    operator: 'Equal' | 'NotEqual' | 'GreaterThan' | 'LessThan' | 'Like'
    valueText?: string
    valueNumber?: number
    valueBoolean?: boolean
  }
  certainty?: number
  distance?: number
}

export interface HybridSearchOptions extends SearchOptions {
  alpha?: number // 0 = keyword, 1 = vector
  query?: string
}

export class WeaviateClient {
  private client: WClient

  constructor(config: WeaviateConfig) {
    const clientConfig: any = {
      scheme: config.scheme,
      host: config.host,
    }

    if (config.apiKey) {
      clientConfig.apiKey = new ApiKey(config.apiKey)
    }

    if (config.headers) {
      clientConfig.headers = config.headers
    }

    this.client = weaviate.client(clientConfig)
  }

  /**
   * Create a new collection (class in Weaviate terminology)
   */
  async createCollection(
    name: string,
    config: CollectionConfig
  ): Promise<void> {
    const classObj = {
      class: name,
      vectorizer: config.vectorizer || 'none',
      vectorIndexType: config.vectorIndexType || 'hnsw',
      properties: config.properties,
      moduleConfig: config.moduleConfig || {},
    }

    await this.client.schema.classCreator().withClass(classObj).do()
  }

  /**
   * Delete a collection
   */
  async deleteCollection(name: string): Promise<void> {
    await this.client.schema.classDeleter().withClassName(name).do()
  }

  /**
   * Check if collection exists
   */
  async collectionExists(name: string): Promise<boolean> {
    const schema = await this.client.schema.getter().do()
    return schema.classes?.some((c: any) => c.class === name) || false
  }

  /**
   * Insert vectors into collection
   */
  async insertVectors(
    collectionName: string,
    documents: Array<Record<string, any>>
  ): Promise<string[]> {
    const ids: string[] = []

    for (const doc of documents) {
      const { vector, ...properties } = doc

      const result = await this.client.data
        .creator()
        .withClassName(collectionName)
        .withProperties(properties)
        .withVector(vector)
        .do()

      ids.push(result.id)
    }

    return ids
  }

  /**
   * Batch insert vectors (more efficient for large datasets)
   */
  async batchInsertVectors(
    collectionName: string,
    documents: Array<Record<string, any>>,
    batchSize: number = 100
  ): Promise<void> {
    let batcher = this.client.batch.objectsBatcher()
    let counter = 0

    for (const doc of documents) {
      const { vector, ...properties } = doc

      batcher = batcher.withObject({
        class: collectionName,
        properties,
        vector,
      })

      counter++

      if (counter === batchSize) {
        await batcher.do()
        batcher = this.client.batch.objectsBatcher()
        counter = 0
      }
    }

    // Insert remaining
    if (counter > 0) {
      await batcher.do()
    }
  }

  /**
   * Vector similarity search
   */
  async search(
    collectionName: string,
    queryVector: number[],
    options: SearchOptions = {}
  ): Promise<any[]> {
    let query = this.client.graphql
      .get()
      .withClassName(collectionName)
      .withNearVector({
        vector: queryVector,
        certainty: options.certainty,
        distance: options.distance,
      })
      .withLimit(options.limit || 10)

    if (options.offset) {
      query = query.withOffset(options.offset)
    }

    if (options.filter) {
      query = query.withWhere({
        path: options.filter.path,
        operator: options.filter.operator,
        valueText: options.filter.valueText,
        valueNumber: options.filter.valueNumber,
        valueBoolean: options.filter.valueBoolean,
      })
    }

    const result = await query.do()
    return result.data.Get[collectionName] || []
  }

  /**
   * Hybrid search (semantic + keyword)
   */
  async hybridSearch(
    collectionName: string,
    queryVector: number[],
    options: HybridSearchOptions = {}
  ): Promise<any[]> {
    let query = this.client.graphql
      .get()
      .withClassName(collectionName)
      .withHybrid({
        query: options.query || '',
        vector: queryVector,
        alpha: options.alpha || 0.5, // Balance between keyword and semantic
      })
      .withLimit(options.limit || 10)

    if (options.offset) {
      query = query.withOffset(options.offset)
    }

    if (options.filter) {
      query = query.withWhere({
        path: options.filter.path,
        operator: options.filter.operator,
        valueText: options.filter.valueText,
        valueNumber: options.filter.valueNumber,
        valueBoolean: options.filter.valueBoolean,
      })
    }

    const result = await query.do()
    return result.data.Get[collectionName] || []
  }

  /**
   * Get object by ID
   */
  async getById(collectionName: string, id: string): Promise<any> {
    const result = await this.client.data
      .getterById()
      .withClassName(collectionName)
      .withId(id)
      .do()

    return result
  }

  /**
   * Update object
   */
  async update(
    collectionName: string,
    id: string,
    properties: Record<string, any>,
    vector?: number[]
  ): Promise<void> {
    let updater = this.client.data
      .updater()
      .withClassName(collectionName)
      .withId(id)
      .withProperties(properties)

    if (vector) {
      updater = updater.withVector(vector)
    }

    await updater.do()
  }

  /**
   * Delete object by ID
   */
  async deleteById(collectionName: string, id: string): Promise<void> {
    await this.client.data
      .deleter()
      .withClassName(collectionName)
      .withId(id)
      .do()
  }

  /**
   * Delete objects matching filter
   */
  async deleteByFilter(
    collectionName: string,
    filter: SearchOptions['filter']
  ): Promise<void> {
    if (!filter) {
      throw new Error('Filter is required for batch delete')
    }

    await this.client.batch
      .objectsBatchDeleter()
      .withClassName(collectionName)
      .withWhere({
        path: filter.path,
        operator: filter.operator,
        valueText: filter.valueText,
        valueNumber: filter.valueNumber,
        valueBoolean: filter.valueBoolean,
      })
      .do()
  }

  /**
   * Get collection schema
   */
  async getCollectionSchema(name: string): Promise<any> {
    const schema = await this.client.schema.getter().do()
    return schema.classes?.find((c: any) => c.class === name)
  }

  /**
   * Health check
   */
  async isHealthy(): Promise<boolean> {
    try {
      const result = await this.client.misc.liveChecker().do()
      return result === true
    } catch {
      return false
    }
  }
}

/**
 * Create Weaviate client with environment variables
 */
export function createWeaviateClient(): WeaviateClient {
  const scheme = (process.env.WEAVIATE_SCHEME as 'http' | 'https') || 'https'
  const host = process.env.WEAVIATE_HOST

  if (!host) {
    throw new Error('WEAVIATE_HOST environment variable is required')
  }

  return new WeaviateClient({
    scheme,
    host,
    apiKey: process.env.WEAVIATE_API_KEY,
  })
}
