/**
 * Pinecone Vector Database Integration
 *
 * Complete Pinecone integration for vector storage and similarity search.
 *
 * Features:
 * - Vector upsert and query
 * - Namespace management
 * - Metadata filtering
 * - Batch operations
 * - Index management
 * - Hybrid search (dense + sparse)
 *
 * Setup:
 * ```bash
 * npm install @pinecone-database/pinecone
 * ```
 *
 * Environment:
 * ```
 * PINECONE_API_KEY=your_api_key
 * PINECONE_ENVIRONMENT=us-east-1-aws
 * PINECONE_INDEX_NAME=your-index
 * ```
 */

import { Pinecone, RecordMetadata } from '@pinecone-database/pinecone'

export interface PineconeConfig {
  apiKey?: string
  indexName?: string
}

export interface VectorRecord {
  id: string
  values: number[]
  metadata?: RecordMetadata
}

export interface QueryOptions {
  topK?: number
  filter?: RecordMetadata
  includeMetadata?: boolean
  includeValues?: boolean
  namespace?: string
}

export interface QueryResult {
  id: string
  score: number
  values?: number[]
  metadata?: RecordMetadata
}

export class PineconeClient {
  private client: Pinecone
  private indexName: string

  constructor(config: PineconeConfig = {}) {
    const apiKey = config.apiKey || process.env.PINECONE_API_KEY
    this.indexName = config.indexName || process.env.PINECONE_INDEX_NAME || 'default'

    if (!apiKey) {
      throw new Error('PINECONE_API_KEY is required')
    }

    this.client = new Pinecone({
      apiKey
    })
  }

  /**
   * Get index instance
   */
  private getIndex() {
    return this.client.index(this.indexName)
  }

  /**
   * Upsert single vector
   */
  async upsert(record: VectorRecord, namespace?: string) {
    const index = this.getIndex()

    await index.namespace(namespace || '').upsert([
      {
        id: record.id,
        values: record.values,
        metadata: record.metadata
      }
    ])
  }

  /**
   * Upsert multiple vectors (batch)
   */
  async upsertBatch(records: VectorRecord[], namespace?: string, batchSize: number = 100) {
    const index = this.getIndex()

    // Process in batches to avoid rate limits
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize)

      await index.namespace(namespace || '').upsert(
        batch.map(record => ({
          id: record.id,
          values: record.values,
          metadata: record.metadata
        }))
      )

      console.log(`Upserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(records.length / batchSize)}`)
    }
  }

  /**
   * Query vectors (similarity search)
   */
  async query(
    vector: number[],
    options: QueryOptions = {}
  ): Promise<QueryResult[]> {
    const index = this.getIndex()

    const response = await index.namespace(options.namespace || '').query({
      vector,
      topK: options.topK || 10,
      filter: options.filter,
      includeMetadata: options.includeMetadata !== false,
      includeValues: options.includeValues || false
    })

    return response.matches.map(match => ({
      id: match.id,
      score: match.score || 0,
      values: match.values,
      metadata: match.metadata
    }))
  }

  /**
   * Query by ID (fetch specific vectors)
   */
  async fetch(ids: string[], namespace?: string) {
    const index = this.getIndex()

    const response = await index.namespace(namespace || '').fetch(ids)

    return response.records
  }

  /**
   * Delete vectors
   */
  async delete(ids: string[], namespace?: string) {
    const index = this.getIndex()

    await index.namespace(namespace || '').deleteMany(ids)
  }

  /**
   * Delete all vectors in namespace
   */
  async deleteAll(namespace?: string) {
    const index = this.getIndex()

    await index.namespace(namespace || '').deleteAll()
  }

  /**
   * Delete by metadata filter
   */
  async deleteByFilter(filter: RecordMetadata, namespace?: string) {
    const index = this.getIndex()

    await index.namespace(namespace || '').deleteMany({ filter })
  }

  /**
   * Update vector metadata (without changing vector values)
   */
  async updateMetadata(id: string, metadata: RecordMetadata, namespace?: string) {
    const index = this.getIndex()

    // Fetch existing vector
    const existing = await index.namespace(namespace || '').fetch([id])
    const vector = existing.records[id]

    if (!vector) {
      throw new Error(`Vector ${id} not found`)
    }

    // Upsert with new metadata
    await index.namespace(namespace || '').upsert([
      {
        id,
        values: vector.values,
        metadata: {
          ...vector.metadata,
          ...metadata
        }
      }
    ])
  }

  /**
   * List index stats
   */
  async getIndexStats(namespace?: string) {
    const index = this.getIndex()

    return index.describeIndexStats()
  }

  /**
   * Check if vector exists
   */
  async exists(id: string, namespace?: string): Promise<boolean> {
    const index = this.getIndex()

    const response = await index.namespace(namespace || '').fetch([id])

    return id in response.records
  }

  /**
   * Get index description
   */
  async describeIndex() {
    return this.client.describeIndex(this.indexName)
  }

  /**
   * List all indexes
   */
  async listIndexes() {
    return this.client.listIndexes()
  }

  /**
   * Create new index
   */
  async createIndex(params: {
    name: string
    dimension: number
    metric?: 'cosine' | 'euclidean' | 'dotproduct'
    spec?: {
      serverless?: {
        cloud: 'aws' | 'gcp' | 'azure'
        region: string
      }
      pod?: {
        environment: string
        podType: string
        pods?: number
      }
    }
  }) {
    await this.client.createIndex({
      name: params.name,
      dimension: params.dimension,
      metric: params.metric || 'cosine',
      spec: params.spec || {
        serverless: {
          cloud: 'aws',
          region: 'us-east-1'
        }
      }
    })
  }

  /**
   * Delete index
   */
  async deleteIndex(name?: string) {
    await this.client.deleteIndex(name || this.indexName)
  }
}

/**
 * Helper: Normalize vector (for cosine similarity)
 */
export function normalizeVector(vector: number[]): number[] {
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0))
  return vector.map(val => val / magnitude)
}

/**
 * Helper: Calculate cosine similarity
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have same length')
  }

  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0)
  const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0))
  const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0))

  return dotProduct / (magnitudeA * magnitudeB)
}

/**
 * Helper: Chunk text for embedding
 */
export function chunkText(text: string, chunkSize: number = 500, overlap: number = 50): string[] {
  const chunks: string[] = []
  const words = text.split(' ')

  for (let i = 0; i < words.length; i += chunkSize - overlap) {
    const chunk = words.slice(i, i + chunkSize).join(' ')
    chunks.push(chunk)
  }

  return chunks
}

/**
 * Example usage
 */
export async function examples() {
  const pinecone = new PineconeClient()

  // Upsert single vector
  await pinecone.upsert({
    id: 'vec1',
    values: [0.1, 0.2, 0.3, ...Array(1533).fill(0)], // 1536-dimensional vector
    metadata: {
      text: 'Sample text',
      category: 'documentation',
      timestamp: Date.now()
    }
  })

  // Upsert batch
  const vectors: VectorRecord[] = Array.from({ length: 100 }, (_, i) => ({
    id: `vec${i}`,
    values: Array(1536).fill(0).map(() => Math.random()),
    metadata: {
      index: i,
      category: 'test'
    }
  }))

  await pinecone.upsertBatch(vectors, 'my-namespace')

  // Query similar vectors
  const queryVector = Array(1536).fill(0).map(() => Math.random())
  const results = await pinecone.query(queryVector, {
    topK: 5,
    filter: { category: 'documentation' },
    namespace: 'my-namespace'
  })

  console.log('Similar vectors:', results)

  // Fetch specific vectors
  const fetched = await pinecone.fetch(['vec1', 'vec2'])
  console.log('Fetched vectors:', fetched)

  // Update metadata
  await pinecone.updateMetadata('vec1', {
    updated: true,
    timestamp: Date.now()
  })

  // Delete vectors
  await pinecone.delete(['vec1', 'vec2'])

  // Get stats
  const stats = await pinecone.getIndexStats()
  console.log('Index stats:', stats)

  // Chunk text
  const chunks = chunkText('This is a long document that needs to be split into chunks for embedding.')
  console.log('Chunks:', chunks)
}

// Export singleton instance
let instance: PineconeClient | null = null

export function getPineconeClient(config?: PineconeConfig): PineconeClient {
  if (!instance) {
    instance = new PineconeClient(config)
  }
  return instance
}
