/**
 * Neo4j Graph Database Client
 *
 * Integration with Neo4j for knowledge graphs and graph-based retrieval.
 *
 * Features:
 * - Node and relationship management
 * - Cypher query execution
 * - Transaction support
 * - Connection pooling
 * - Type-safe queries
 *
 * @example
 * ```typescript
 * import { Neo4jClient } from './client'
 *
 * const client = new Neo4jClient({
 *   uri: 'neo4j://localhost:7687',
 *   username: 'neo4j',
 *   password: 'password'
 * })
 *
 * // Create nodes
 * await client.createNode('Person', {
 *   name: 'John',
 *   age: 30
 * })
 *
 * // Create relationship
 * await client.createRelationship(
 *   'Person', { name: 'John' },
 *   'Person', { name: 'Jane' },
 *   'KNOWS', { since: 2020 }
 * )
 *
 * // Query
 * const results = await client.query(`
 *   MATCH (p:Person)-[r:KNOWS]->(friend:Person)
 *   WHERE p.name = $name
 *   RETURN friend
 * `, { name: 'John' })
 * ```
 */

import neo4j, { Driver, Session, Result, Record } from 'neo4j-driver'

export interface Neo4jConfig {
  uri: string
  username: string
  password: string
  database?: string
  maxConnectionPoolSize?: number
  connectionTimeout?: number
}

export interface NodeProperties {
  [key: string]: any
}

export interface RelationshipProperties {
  [key: string]: any
}

export interface QueryResult {
  records: Record[]
  summary: any
}

export class Neo4jClient {
  private driver: Driver
  private database?: string

  constructor(config: Neo4jConfig) {
    this.driver = neo4j.driver(
      config.uri,
      neo4j.auth.basic(config.username, config.password),
      {
        maxConnectionPoolSize: config.maxConnectionPoolSize || 100,
        connectionTimeout: config.connectionTimeout || 30000,
      }
    )
    this.database = config.database
  }

  /**
   * Execute a Cypher query
   */
  async query(
    cypher: string,
    parameters: Record<string, any> = {}
  ): Promise<QueryResult> {
    const session = this.getSession()

    try {
      const result = await session.run(cypher, parameters)
      return {
        records: result.records,
        summary: result.summary,
      }
    } finally {
      await session.close()
    }
  }

  /**
   * Create a node
   */
  async createNode(
    label: string,
    properties: NodeProperties
  ): Promise<Record> {
    const session = this.getSession()

    try {
      const propsString = Object.keys(properties)
        .map(key => `${key}: $${key}`)
        .join(', ')

      const cypher = `
        CREATE (n:${label} {${propsString}})
        RETURN n
      `

      const result = await session.run(cypher, properties)
      return result.records[0]
    } finally {
      await session.close()
    }
  }

  /**
   * Find nodes by label and properties
   */
  async findNodes(
    label: string,
    properties: Partial<NodeProperties> = {},
    limit?: number
  ): Promise<Record[]> {
    const session = this.getSession()

    try {
      const whereClause =
        Object.keys(properties).length > 0
          ? 'WHERE ' +
            Object.keys(properties)
              .map(key => `n.${key} = $${key}`)
              .join(' AND ')
          : ''

      const limitClause = limit ? `LIMIT ${limit}` : ''

      const cypher = `
        MATCH (n:${label})
        ${whereClause}
        RETURN n
        ${limitClause}
      `

      const result = await session.run(cypher, properties)
      return result.records
    } finally {
      await session.close()
    }
  }

  /**
   * Update node properties
   */
  async updateNode(
    label: string,
    matchProperties: Partial<NodeProperties>,
    updateProperties: Partial<NodeProperties>
  ): Promise<Record> {
    const session = this.getSession()

    try {
      const whereClause = Object.keys(matchProperties)
        .map(key => `n.${key} = $match_${key}`)
        .join(' AND ')

      const setClause = Object.keys(updateProperties)
        .map(key => `n.${key} = $update_${key}`)
        .join(', ')

      const cypher = `
        MATCH (n:${label})
        WHERE ${whereClause}
        SET ${setClause}
        RETURN n
      `

      const parameters = {
        ...Object.fromEntries(
          Object.entries(matchProperties).map(([k, v]) => [`match_${k}`, v])
        ),
        ...Object.fromEntries(
          Object.entries(updateProperties).map(([k, v]) => [`update_${k}`, v])
        ),
      }

      const result = await session.run(cypher, parameters)
      return result.records[0]
    } finally {
      await session.close()
    }
  }

  /**
   * Delete node
   */
  async deleteNode(
    label: string,
    properties: Partial<NodeProperties>
  ): Promise<void> {
    const session = this.getSession()

    try {
      const whereClause = Object.keys(properties)
        .map(key => `n.${key} = $${key}`)
        .join(' AND ')

      const cypher = `
        MATCH (n:${label})
        WHERE ${whereClause}
        DETACH DELETE n
      `

      await session.run(cypher, properties)
    } finally {
      await session.close()
    }
  }

  /**
   * Create relationship between nodes
   */
  async createRelationship(
    fromLabel: string,
    fromProperties: Partial<NodeProperties>,
    toLabel: string,
    toProperties: Partial<NodeProperties>,
    relationshipType: string,
    relationshipProperties: RelationshipProperties = {}
  ): Promise<Record> {
    const session = this.getSession()

    try {
      const fromWhere = Object.keys(fromProperties)
        .map(key => `from.${key} = $from_${key}`)
        .join(' AND ')

      const toWhere = Object.keys(toProperties)
        .map(key => `to.${key} = $to_${key}`)
        .join(' AND ')

      const relProps =
        Object.keys(relationshipProperties).length > 0
          ? `{${Object.keys(relationshipProperties)
              .map(key => `${key}: $rel_${key}`)
              .join(', ')}}`
          : ''

      const cypher = `
        MATCH (from:${fromLabel}), (to:${toLabel})
        WHERE ${fromWhere} AND ${toWhere}
        CREATE (from)-[r:${relationshipType} ${relProps}]->(to)
        RETURN r
      `

      const parameters = {
        ...Object.fromEntries(
          Object.entries(fromProperties).map(([k, v]) => [`from_${k}`, v])
        ),
        ...Object.fromEntries(
          Object.entries(toProperties).map(([k, v]) => [`to_${k}`, v])
        ),
        ...Object.fromEntries(
          Object.entries(relationshipProperties).map(([k, v]) => [`rel_${k}`, v])
        ),
      }

      const result = await session.run(cypher, parameters)
      return result.records[0]
    } finally {
      await session.close()
    }
  }

  /**
   * Find relationships
   */
  async findRelationships(
    relationshipType: string,
    properties: Partial<RelationshipProperties> = {}
  ): Promise<Record[]> {
    const session = this.getSession()

    try {
      const whereClause =
        Object.keys(properties).length > 0
          ? 'WHERE ' +
            Object.keys(properties)
              .map(key => `r.${key} = $${key}`)
              .join(' AND ')
          : ''

      const cypher = `
        MATCH ()-[r:${relationshipType}]->()
        ${whereClause}
        RETURN r
      `

      const result = await session.run(cypher, properties)
      return result.records
    } finally {
      await session.close()
    }
  }

  /**
   * Execute within a transaction
   */
  async transaction<T>(
    work: (session: Session) => Promise<T>
  ): Promise<T> {
    const session = this.getSession()

    try {
      return await session.executeWrite(async tx => {
        return await work(session)
      })
    } finally {
      await session.close()
    }
  }

  /**
   * Get shortest path between nodes
   */
  async shortestPath(
    fromLabel: string,
    fromProperties: Partial<NodeProperties>,
    toLabel: string,
    toProperties: Partial<NodeProperties>,
    relationshipType?: string
  ): Promise<Record | null> {
    const session = this.getSession()

    try {
      const fromWhere = Object.keys(fromProperties)
        .map(key => `from.${key} = $from_${key}`)
        .join(' AND ')

      const toWhere = Object.keys(toProperties)
        .map(key => `to.${key} = $to_${key}`)
        .join(' AND ')

      const relPattern = relationshipType
        ? `[r:${relationshipType}]`
        : '[r]'

      const cypher = `
        MATCH (from:${fromLabel}), (to:${toLabel}),
        path = shortestPath((from)-${relPattern}*-(to))
        WHERE ${fromWhere} AND ${toWhere}
        RETURN path
      `

      const parameters = {
        ...Object.fromEntries(
          Object.entries(fromProperties).map(([k, v]) => [`from_${k}`, v])
        ),
        ...Object.fromEntries(
          Object.entries(toProperties).map(([k, v]) => [`to_${k}`, v])
        ),
      }

      const result = await session.run(cypher, parameters)
      return result.records[0] || null
    } finally {
      await session.close()
    }
  }

  /**
   * Get database statistics
   */
  async getStatistics(): Promise<{
    nodeCount: number
    relationshipCount: number
    labels: string[]
    relationshipTypes: string[]
  }> {
    const session = this.getSession()

    try {
      // Get node count
      const nodeResult = await session.run('MATCH (n) RETURN count(n) as count')
      const nodeCount = nodeResult.records[0].get('count').toNumber()

      // Get relationship count
      const relResult = await session.run(
        'MATCH ()-[r]->() RETURN count(r) as count'
      )
      const relationshipCount = relResult.records[0].get('count').toNumber()

      // Get labels
      const labelsResult = await session.run('CALL db.labels()')
      const labels = labelsResult.records.map(r => r.get(0))

      // Get relationship types
      const typesResult = await session.run('CALL db.relationshipTypes()')
      const relationshipTypes = typesResult.records.map(r => r.get(0))

      return {
        nodeCount,
        relationshipCount,
        labels,
        relationshipTypes,
      }
    } finally {
      await session.close()
    }
  }

  /**
   * Clear entire database
   */
  async clearDatabase(): Promise<void> {
    const session = this.getSession()

    try {
      await session.run('MATCH (n) DETACH DELETE n')
    } finally {
      await session.close()
    }
  }

  /**
   * Close driver connection
   */
  async close(): Promise<void> {
    await this.driver.close()
  }

  /**
   * Verify connectivity
   */
  async verifyConnectivity(): Promise<boolean> {
    try {
      await this.driver.verifyConnectivity()
      return true
    } catch {
      return false
    }
  }

  /**
   * Get session
   */
  private getSession(): Session {
    return this.driver.session({
      database: this.database,
      defaultAccessMode: neo4j.session.WRITE,
    })
  }
}

/**
 * Create Neo4j client with environment variables
 */
export function createNeo4jClient(): Neo4jClient {
  const uri = process.env.NEO4J_URI
  const username = process.env.NEO4J_USERNAME
  const password = process.env.NEO4J_PASSWORD

  if (!uri || !username || !password) {
    throw new Error('Neo4j connection variables (NEO4J_URI, NEO4J_USERNAME, NEO4J_PASSWORD) are required')
  }

  return new Neo4jClient({
    uri,
    username,
    password,
    database: process.env.NEO4J_DATABASE,
  })
}
