/**
 * pgvector PostgreSQL Extension Client
 *
 * Integration for pgvector - vector similarity search in PostgreSQL.
 *
 * Features:
 * - Vector similarity search (<-> operator)
 * - HNSW and IVFFlat indexes
 * - Native SQL integration
 * - Transaction support
 * - Connection pooling
 * - Batch operations
 * - Metadata filtering
 *
 * @example
 * ```typescript
 * const client = new PgVectorClient({
 *   connectionString: process.env.DATABASE_URL
 * })
 *
 * // Create table with vector column
 * await client.createTable('documents', {
 *   dimension: 1536,
 *   indexType: 'hnsw'
 * })
 *
 * // Insert vectors
 * await client.insert('documents', [
 *   { id: '1', embedding: [0.1, 0.2, ...], metadata: { title: 'Doc 1' } },
 *   { id: '2', embedding: [0.3, 0.4, ...], metadata: { title: 'Doc 2' } }
 * ])
 *
 * // Search
 * const results = await client.search('documents', queryVector, {
 *   limit: 10,
 *   where: { title: 'Doc 1' }
 * })
 * ```
 */

import { Pool, PoolClient, QueryResult } from 'pg'

export type IndexType = 'hnsw' | 'ivfflat'
export type DistanceOperator = '<->' | '<#>' | '<=>'

export interface PgVectorClientOptions {
  /**
   * PostgreSQL connection string
   */
  connectionString?: string

  /**
   * Connection pool config
   */
  poolConfig?: {
    min?: number
    max?: number
    idleTimeoutMillis?: number
    connectionTimeoutMillis?: number
  }

  /**
   * Schema name
   */
  schema?: string
}

export interface CreateTableOptions {
  /**
   * Vector dimension
   */
  dimension: number

  /**
   * Index type
   */
  indexType?: IndexType

  /**
   * HNSW parameters
   */
  hnswParams?: {
    m?: number // max connections per layer
    efConstruction?: number // ef for construction
  }

  /**
   * IVFFlat parameters
   */
  ivfflatParams?: {
    lists?: number // number of lists
  }

  /**
   * Additional columns
   */
  columns?: Array<{
    name: string
    type: string
    nullable?: boolean
  }>
}

export interface VectorRecord {
  id: string
  embedding: number[]
  metadata?: Record<string, any>
  content?: string
}

export interface SearchOptions {
  /**
   * Number of results
   */
  limit?: number

  /**
   * Distance operator
   */
  operator?: DistanceOperator

  /**
   * WHERE clause conditions
   */
  where?: Record<string, any>

  /**
   * Minimum similarity score
   */
  scoreThreshold?: number

  /**
   * HNSW ef_search parameter
   */
  efSearch?: number
}

export interface SearchResult {
  id: string
  distance: number
  metadata?: Record<string, any>
  content?: string
  embedding?: number[]
}

export class PgVectorClient {
  private pool: Pool
  private schema: string

  constructor(options: PgVectorClientOptions = {}) {
    this.schema = options.schema || 'public'

    this.pool = new Pool({
      connectionString: options.connectionString || process.env.DATABASE_URL,
      min: options.poolConfig?.min || 2,
      max: options.poolConfig?.max || 10,
      idleTimeoutMillis: options.poolConfig?.idleTimeoutMillis || 30000,
      connectionTimeoutMillis: options.poolConfig?.connectionTimeoutMillis || 2000,
    })
  }

  /**
   * Initialize pgvector extension
   */
  async initialize(): Promise<void> {
    await this.query('CREATE EXTENSION IF NOT EXISTS vector')
  }

  /**
   * Create table with vector column
   */
  async createTable(tableName: string, options: CreateTableOptions): Promise<void> {
    const { dimension, indexType = 'hnsw', columns = [] } = options

    // Create table
    const columnDefs = [
      'id TEXT PRIMARY KEY',
      `embedding vector(${dimension})`,
      'metadata JSONB',
      'content TEXT',
      ...columns.map((col) => {
        const nullable = col.nullable ?? true
        return `${col.name} ${col.type}${nullable ? '' : ' NOT NULL'}`
      }),
      'created_at TIMESTAMP DEFAULT NOW()',
    ]

    await this.query(`
      CREATE TABLE IF NOT EXISTS ${this.schema}.${tableName} (
        ${columnDefs.join(',\n        ')}
      )
    `)

    // Create vector index
    if (indexType === 'hnsw') {
      const m = options.hnswParams?.m || 16
      const efConstruction = options.hnswParams?.efConstruction || 64

      await this.query(`
        CREATE INDEX IF NOT EXISTS ${tableName}_embedding_idx
        ON ${this.schema}.${tableName}
        USING hnsw (embedding vector_cosine_ops)
        WITH (m = ${m}, ef_construction = ${efConstruction})
      `)
    } else if (indexType === 'ivfflat') {
      const lists = options.ivfflatParams?.lists || 100

      await this.query(`
        CREATE INDEX IF NOT EXISTS ${tableName}_embedding_idx
        ON ${this.schema}.${tableName}
        USING ivfflat (embedding vector_cosine_ops)
        WITH (lists = ${lists})
      `)
    }

    // Create metadata GIN index for filtering
    await this.query(`
      CREATE INDEX IF NOT EXISTS ${tableName}_metadata_idx
      ON ${this.schema}.${tableName}
      USING gin (metadata)
    `)
  }

  /**
   * Drop table
   */
  async dropTable(tableName: string): Promise<void> {
    await this.query(`DROP TABLE IF EXISTS ${this.schema}.${tableName}`)
  }

  /**
   * List all tables
   */
  async listTables(): Promise<string[]> {
    const result = await this.query(`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = $1
    `, [this.schema])

    return result.rows.map((row) => row.tablename)
  }

  /**
   * Get table info
   */
  async getTableInfo(tableName: string): Promise<{
    rowCount: number
    dimension: number
    indexes: string[]
  }> {
    // Get row count
    const countResult = await this.query(
      `SELECT COUNT(*) FROM ${this.schema}.${tableName}`
    )
    const rowCount = parseInt(countResult.rows[0].count)

    // Get vector dimension
    const dimResult = await this.query(`
      SELECT vector_dims(embedding) as dimension
      FROM ${this.schema}.${tableName}
      LIMIT 1
    `)
    const dimension = dimResult.rows[0]?.dimension || 0

    // Get indexes
    const indexResult = await this.query(`
      SELECT indexname
      FROM pg_indexes
      WHERE schemaname = $1 AND tablename = $2
    `, [this.schema, tableName])
    const indexes = indexResult.rows.map((row) => row.indexname)

    return { rowCount, dimension, indexes }
  }

  /**
   * Insert vectors
   */
  async insert(tableName: string, records: VectorRecord[]): Promise<void> {
    if (records.length === 0) return

    const client = await this.pool.connect()

    try {
      await client.query('BEGIN')

      for (const record of records) {
        await client.query(
          `INSERT INTO ${this.schema}.${tableName} (id, embedding, metadata, content)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (id) DO UPDATE
           SET embedding = $2, metadata = $3, content = $4`,
          [
            record.id,
            `[${record.embedding.join(',')}]`,
            JSON.stringify(record.metadata || {}),
            record.content || null,
          ]
        )
      }

      await client.query('COMMIT')
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  }

  /**
   * Delete vectors
   */
  async delete(tableName: string, ids: string[]): Promise<void> {
    if (ids.length === 0) return

    await this.query(
      `DELETE FROM ${this.schema}.${tableName} WHERE id = ANY($1)`,
      [ids]
    )
  }

  /**
   * Search for similar vectors
   */
  async search(
    tableName: string,
    queryVector: number[],
    options: SearchOptions = {}
  ): Promise<SearchResult[]> {
    const {
      limit = 10,
      operator = '<->',
      where = {},
      scoreThreshold,
      efSearch,
    } = options

    // Set ef_search if provided (HNSW only)
    if (efSearch) {
      await this.query(`SET hnsw.ef_search = ${efSearch}`)
    }

    // Build WHERE clause
    const whereConditions: string[] = []
    const params: any[] = [`[${queryVector.join(',')}]`]
    let paramIndex = 2

    for (const [key, value] of Object.entries(where)) {
      whereConditions.push(`metadata->>'${key}' = $${paramIndex}`)
      params.push(value)
      paramIndex++
    }

    // Build query
    let query = `
      SELECT
        id,
        embedding ${operator} $1 as distance,
        metadata,
        content
      FROM ${this.schema}.${tableName}
    `

    if (whereConditions.length > 0) {
      query += ` WHERE ${whereConditions.join(' AND ')}`
    }

    if (scoreThreshold !== undefined) {
      const thresholdClause = `embedding ${operator} $1 < $${paramIndex}`
      query += whereConditions.length > 0 ? ` AND ${thresholdClause}` : ` WHERE ${thresholdClause}`
      params.push(scoreThreshold)
    }

    query += ` ORDER BY distance LIMIT ${limit}`

    const result = await this.query(query, params)

    return result.rows.map((row) => ({
      id: row.id,
      distance: parseFloat(row.distance),
      metadata: row.metadata,
      content: row.content,
    }))
  }

  /**
   * Get vector by ID
   */
  async getById(tableName: string, id: string): Promise<SearchResult | null> {
    const result = await this.query(
      `SELECT id, metadata, content FROM ${this.schema}.${tableName} WHERE id = $1`,
      [id]
    )

    if (result.rows.length === 0) return null

    return {
      id: result.rows[0].id,
      distance: 0,
      metadata: result.rows[0].metadata,
      content: result.rows[0].content,
    }
  }

  /**
   * Update metadata
   */
  async updateMetadata(
    tableName: string,
    id: string,
    metadata: Record<string, any>
  ): Promise<void> {
    await this.query(
      `UPDATE ${this.schema}.${tableName} SET metadata = $1 WHERE id = $2`,
      [JSON.stringify(metadata), id]
    )
  }

  /**
   * Clear all vectors from table
   */
  async clear(tableName: string): Promise<void> {
    await this.query(`TRUNCATE TABLE ${this.schema}.${tableName}`)
  }

  /**
   * Execute raw SQL query
   */
  async query(text: string, params?: any[]): Promise<QueryResult> {
    return this.pool.query(text, params)
  }

  /**
   * Get a client from the pool for transactions
   */
  async getClient(): Promise<PoolClient> {
    return this.pool.connect()
  }

  /**
   * Close all connections
   */
  async close(): Promise<void> {
    await this.pool.end()
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.query('SELECT 1')
      return true
    } catch {
      return false
    }
  }
}

/**
 * Create pgvector client from environment variables
 */
export function createPgVectorClient(
  options: PgVectorClientOptions = {}
): PgVectorClient {
  return new PgVectorClient(options)
}
