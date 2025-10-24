/**
 * Qdrant Vector Database Client
 *
 * Complete Qdrant integration for vector similarity search.
 *
 * Features:
 * - Collection management
 * - Vector CRUD operations
 * - Similarity search with filters
 * - Batch operations
 * - Scroll API for large datasets
 * - Payload indexing
 * - Snapshots and backups
 *
 * @example
 * ```typescript
 * const client = new QdrantClient({
 *   url: 'http://localhost:6333',
 *   apiKey: process.env.QDRANT_API_KEY
 * })
 *
 * // Create collection
 * await client.createCollection('documents', {
 *   vectorSize: 1536,
 *   distance: 'Cosine'
 * })
 *
 * // Add vectors
 * await client.addVectors('documents', {
 *   points: [
 *     { id: '1', vector: [0.1, 0.2, ...], payload: { title: 'Doc 1' } },
 *     { id: '2', vector: [0.3, 0.4, ...], payload: { title: 'Doc 2' } }
 *   ]
 * })
 *
 * // Search
 * const results = await client.search('documents', queryVector, {
 *   limit: 10,
 *   filter: { must: [{ key: 'title', match: { value: 'Doc 1' } }] }
 * })
 * ```
 */

import { QdrantClient as QdrantSDK, Schemas } from '@qdrant/js-client-rest'

export type DistanceMetric = 'Cosine' | 'Euclid' | 'Dot'

export interface QdrantClientOptions {
  /**
   * Qdrant server URL
   */
  url?: string

  /**
   * API key for authentication
   */
  apiKey?: string

  /**
   * Request timeout in ms
   */
  timeout?: number
}

export interface CreateCollectionOptions {
  /**
   * Vector size
   */
  vectorSize: number

  /**
   * Distance metric
   */
  distance?: DistanceMetric

  /**
   * Shard number
   */
  shardNumber?: number

  /**
   * Replication factor
   */
  replicationFactor?: number

  /**
   * On-disk storage
   */
  onDisk?: boolean
}

export interface Point {
  id: string | number
  vector: number[]
  payload?: Record<string, any>
}

export interface SearchOptions {
  /**
   * Number of results
   */
  limit?: number

  /**
   * Minimum score threshold
   */
  scoreThreshold?: number

  /**
   * Filter conditions
   */
  filter?: Schemas['Filter']

  /**
   * Return payload
   */
  withPayload?: boolean | string[]

  /**
   * Return vector
   */
  withVector?: boolean

  /**
   * Search params
   */
  params?: {
    hnsw_ef?: number
    exact?: boolean
  }
}

export interface SearchResult {
  id: string | number
  score: number
  payload?: Record<string, any>
  vector?: number[]
}

export interface ScrollOptions {
  limit?: number
  filter?: Schemas['Filter']
  withPayload?: boolean | string[]
  withVector?: boolean
  offset?: string | number
}

export class QdrantClient {
  private client: QdrantSDK
  private options: Required<Omit<QdrantClientOptions, 'apiKey'>> & { apiKey?: string }

  constructor(options: QdrantClientOptions = {}) {
    this.options = {
      url: options.url || 'http://localhost:6333',
      apiKey: options.apiKey,
      timeout: options.timeout || 30000,
    }

    this.client = new QdrantSDK({
      url: this.options.url,
      apiKey: this.options.apiKey,
      timeout: this.options.timeout,
    })
  }

  /**
   * Create a collection
   */
  async createCollection(
    name: string,
    options: CreateCollectionOptions
  ): Promise<void> {
    await this.client.createCollection(name, {
      vectors: {
        size: options.vectorSize,
        distance: options.distance || 'Cosine',
      },
      shard_number: options.shardNumber,
      replication_factor: options.replicationFactor,
      on_disk_payload: options.onDisk,
    })
  }

  /**
   * Delete a collection
   */
  async deleteCollection(name: string): Promise<void> {
    await this.client.deleteCollection(name)
  }

  /**
   * Check if collection exists
   */
  async collectionExists(name: string): Promise<boolean> {
    try {
      await this.client.getCollection(name)
      return true
    } catch {
      return false
    }
  }

  /**
   * List all collections
   */
  async listCollections(): Promise<string[]> {
    const response = await this.client.getCollections()
    return response.collections.map((c) => c.name)
  }

  /**
   * Get collection info
   */
  async getCollectionInfo(name: string): Promise<{
    vectorCount: number
    pointsCount: number
    status: string
    config: any
  }> {
    const info = await this.client.getCollection(name)

    return {
      vectorCount: info.vectors_count || 0,
      pointsCount: info.points_count || 0,
      status: info.status,
      config: info.config,
    }
  }

  /**
   * Add vectors to collection
   */
  async addVectors(
    collectionName: string,
    data: { points: Point[] }
  ): Promise<void> {
    await this.client.upsert(collectionName, {
      points: data.points.map((point) => ({
        id: point.id,
        vector: point.vector,
        payload: point.payload,
      })),
    })
  }

  /**
   * Update vector payload
   */
  async updatePayload(
    collectionName: string,
    pointId: string | number,
    payload: Record<string, any>
  ): Promise<void> {
    await this.client.setPayload(collectionName, {
      payload,
      points: [pointId],
    })
  }

  /**
   * Delete vectors
   */
  async deleteVectors(
    collectionName: string,
    ids: Array<string | number>
  ): Promise<void> {
    await this.client.delete(collectionName, {
      points: ids,
    })
  }

  /**
   * Get vector by ID
   */
  async getVector(
    collectionName: string,
    id: string | number
  ): Promise<Point | null> {
    const points = await this.client.retrieve(collectionName, {
      ids: [id],
      with_payload: true,
      with_vector: true,
    })

    if (points.length === 0) return null

    const point = points[0]
    return {
      id: point.id,
      vector: Array.isArray(point.vector) ? point.vector : [],
      payload: point.payload,
    }
  }

  /**
   * Search for similar vectors
   */
  async search(
    collectionName: string,
    queryVector: number[],
    options: SearchOptions = {}
  ): Promise<SearchResult[]> {
    const results = await this.client.search(collectionName, {
      vector: queryVector,
      limit: options.limit || 10,
      score_threshold: options.scoreThreshold,
      filter: options.filter,
      with_payload: options.withPayload ?? true,
      with_vector: options.withVector ?? false,
      params: options.params,
    })

    return results.map((result) => ({
      id: result.id,
      score: result.score,
      payload: result.payload,
      vector: Array.isArray(result.vector) ? result.vector : undefined,
    }))
  }

  /**
   * Batch search (search with multiple query vectors)
   */
  async batchSearch(
    collectionName: string,
    queries: Array<{ vector: number[]; options?: SearchOptions }>
  ): Promise<SearchResult[][]> {
    const searchRequests = queries.map((query) => ({
      vector: query.vector,
      limit: query.options?.limit || 10,
      score_threshold: query.options?.scoreThreshold,
      filter: query.options?.filter,
      with_payload: query.options?.withPayload ?? true,
      with_vector: query.options?.withVector ?? false,
      params: query.options?.params,
    }))

    const results = await this.client.searchBatch(collectionName, {
      searches: searchRequests,
    })

    return results.map((batch) =>
      batch.map((result) => ({
        id: result.id,
        score: result.score,
        payload: result.payload,
        vector: Array.isArray(result.vector) ? result.vector : undefined,
      }))
    )
  }

  /**
   * Scroll through all points (for large datasets)
   */
  async scroll(
    collectionName: string,
    options: ScrollOptions = {}
  ): Promise<{ points: Point[]; nextOffset?: string | number }> {
    const result = await this.client.scroll(collectionName, {
      limit: options.limit || 100,
      filter: options.filter,
      with_payload: options.withPayload ?? true,
      with_vector: options.withVector ?? false,
      offset: options.offset,
    })

    return {
      points: result.points.map((point) => ({
        id: point.id,
        vector: Array.isArray(point.vector) ? point.vector : [],
        payload: point.payload,
      })),
      nextOffset: result.next_page_offset,
    }
  }

  /**
   * Count points in collection
   */
  async count(
    collectionName: string,
    filter?: Schemas['Filter']
  ): Promise<number> {
    const result = await this.client.count(collectionName, {
      filter,
      exact: true,
    })

    return result.count
  }

  /**
   * Create payload index for faster filtering
   */
  async createPayloadIndex(
    collectionName: string,
    fieldName: string,
    fieldType: 'keyword' | 'integer' | 'float' | 'geo' | 'text'
  ): Promise<void> {
    await this.client.createPayloadIndex(collectionName, {
      field_name: fieldName,
      field_schema: fieldType,
    })
  }

  /**
   * Delete payload index
   */
  async deletePayloadIndex(
    collectionName: string,
    fieldName: string
  ): Promise<void> {
    await this.client.deletePayloadIndex(collectionName, fieldName)
  }

  /**
   * Create snapshot
   */
  async createSnapshot(collectionName: string): Promise<string> {
    const result = await this.client.createSnapshot(collectionName)
    return result.name
  }

  /**
   * List snapshots
   */
  async listSnapshots(collectionName: string): Promise<string[]> {
    const result = await this.client.listSnapshots(collectionName)
    return result.map((s) => s.name)
  }

  /**
   * Delete snapshot
   */
  async deleteSnapshot(
    collectionName: string,
    snapshotName: string
  ): Promise<void> {
    await this.client.deleteSnapshot(collectionName, snapshotName)
  }

  /**
   * Clear all points from collection
   */
  async clearCollection(collectionName: string): Promise<void> {
    // Scroll through and delete all points
    let hasMore = true
    let offset: string | number | undefined

    while (hasMore) {
      const result = await this.scroll(collectionName, {
        limit: 100,
        offset,
        withPayload: false,
        withVector: false,
      })

      if (result.points.length > 0) {
        const ids = result.points.map((p) => p.id)
        await this.deleteVectors(collectionName, ids)
      }

      offset = result.nextOffset
      hasMore = offset !== undefined
    }
  }

  /**
   * Get cluster info
   */
  async getClusterInfo(): Promise<any> {
    return await this.client.getCluster()
  }

  /**
   * Close client connection
   */
  close(): void {
    // Qdrant client doesn't require explicit closing
  }
}

/**
 * Create Qdrant client from environment variables
 */
export function createQdrantClient(options: QdrantClientOptions = {}): QdrantClient {
  return new QdrantClient({
    url: options.url || process.env.QDRANT_URL,
    apiKey: options.apiKey || process.env.QDRANT_API_KEY,
    timeout: options.timeout,
  })
}
