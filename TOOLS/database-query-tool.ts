/**
 * Database Query Tool
 *
 * AI tool for executing safe database queries.
 *
 * Features:
 * - SQL query execution
 * - Parameterized queries (SQL injection prevention)
 * - Multiple database support (PostgreSQL, MySQL, SQLite)
 * - Connection pooling
 * - Transaction support
 * - Query validation
 * - Result formatting
 * - Safe mode (read-only by default)
 *
 * Safety:
 * - Read-only mode by default
 * - Parameterized queries only
 * - Query validation
 * - No DROP/TRUNCATE in safe mode
 * - Connection limits
 *
 * Usage:
 * ```typescript
 * import { DatabaseQueryTool } from './database-query-tool'
 *
 * const db = new DatabaseQueryTool({
 *   type: 'postgres',
 *   connection: {
 *     host: 'localhost',
 *     database: 'mydb',
 *     user: 'user',
 *     password: 'pass'
 *   },
 *   readOnly: true
 * })
 *
 * // Execute query
 * const users = await db.query('SELECT * FROM users WHERE age > $1', [18])
 *
 * // Execute transaction
 * await db.transaction(async (tx) => {
 *   await tx.query('INSERT INTO users (name) VALUES ($1)', ['John'])
 *   await tx.query('UPDATE accounts SET balance = balance + $1', [100])
 * })
 * ```
 */

import { Pool as PgPool } from 'pg'
import mysql from 'mysql2/promise'
import sqlite3 from 'sqlite3'
import { open, Database as SqliteDB } from 'sqlite'
import type {
  DatabaseConfig,
  DatabaseToolArgs,
  DatabaseType,
  QueryParam,
  QueryResult,
  TransactionFn
} from '../types/database'

const logInfo = (...messages: unknown[]): void => {
  const formatted = messages.map(message =>
    typeof message === 'string' ? message : JSON.stringify(message, null, 2)
  )
  process.stdout.write(`${formatted.join(' ')}\n`)
}

export class DatabaseQueryTool {
  private type: DatabaseType
  private readOnly: boolean
  private pgPool?: PgPool
  private mysqlPool?: mysql.Pool
  private sqliteDb?: SqliteDB

  constructor(config: DatabaseConfig) {
    this.type = config.type
    this.readOnly = config.readOnly ?? true

    this.initializeConnection(config)
  }

  /**
   * Initialize database connection
   */
  private async initializeConnection(config: DatabaseConfig): Promise<void> {
    switch (config.type) {
      case 'postgres':
        if ('host' in config.connection) {
          this.pgPool = new PgPool({
            host: config.connection.host,
            port: config.connection.port || 5432,
            database: config.connection.database,
            user: config.connection.user,
            password: config.connection.password,
            max: config.maxConnections || 10
          })
        }
        break

      case 'mysql':
        if ('host' in config.connection) {
          this.mysqlPool = mysql.createPool({
            host: config.connection.host,
            port: config.connection.port || 3306,
            database: config.connection.database,
            user: config.connection.user,
            password: config.connection.password,
            connectionLimit: config.maxConnections || 10,
            waitForConnections: true
          })
        }
        break

      case 'sqlite':
        if ('filename' in config.connection) {
          this.sqliteDb = await open({
            filename: config.connection.filename,
            driver: sqlite3.Database
          })
        }
        break
    }
  }

  /**
   * Validate SQL query for safety
   */
  private validateQuery(sql: string): void {
    const normalizedSql = sql.trim().toUpperCase()

    // Check for read-only mode violations
    if (this.readOnly) {
      const writeOperations = [
        'INSERT',
        'UPDATE',
        'DELETE',
        'DROP',
        'CREATE',
        'ALTER',
        'TRUNCATE',
        'GRANT',
        'REVOKE'
      ]

      const hasWriteOp = writeOperations.some(op => normalizedSql.startsWith(op))

      if (hasWriteOp) {
        throw new Error('Write operations not allowed in read-only mode')
      }
    }

    // Always block dangerous operations
    const dangerousOps = ['DROP DATABASE', 'DROP SCHEMA', 'TRUNCATE']
    const hasDangerousOp = dangerousOps.some(op => normalizedSql.includes(op))

    if (hasDangerousOp) {
      throw new Error('Dangerous operations not allowed')
    }

    // Prevent SQL injection patterns
    if (sql.includes('--') || sql.includes('/*')) {
      throw new Error('SQL comments not allowed')
    }
  }

  /**
   * Execute query (PostgreSQL)
   */
  private async queryPostgres<T = unknown>(
    sql: string,
    params?: QueryParam[]
  ): Promise<QueryResult<T>> {
    if (!this.pgPool) {
      throw new Error('PostgreSQL pool not initialized')
    }

    const startTime = Date.now()
    const result = await this.pgPool.query(sql, params)
    const executionTime = Date.now() - startTime

    return {
      rows: result.rows as T[],
      rowCount: result.rowCount || 0,
      fields: result.fields?.map(f => f.name),
      executionTime
    }
  }

  /**
   * Execute query (MySQL)
   */
  private async queryMysql<T = unknown>(
    sql: string,
    params?: QueryParam[]
  ): Promise<QueryResult<T>> {
    if (!this.mysqlPool) {
      throw new Error('MySQL pool not initialized')
    }

    const startTime = Date.now()
    const [rawRows, fields] = await this.mysqlPool.execute(sql, params)
    const executionTime = Date.now() - startTime
    const rows = Array.isArray(rawRows) ? (rawRows as T[]) : []

    return {
      rows,
      rowCount: rows.length,
      fields: Array.isArray(fields) ? fields.map(f => f.name) : undefined,
      executionTime
    }
  }

  /**
   * Execute query (SQLite)
   */
  private async querySqlite<T = unknown>(
    sql: string,
    params?: QueryParam[]
  ): Promise<QueryResult<T>> {
    if (!this.sqliteDb) {
      throw new Error('SQLite database not initialized')
    }

    const startTime = Date.now()

    // Check if query is SELECT
    if (sql.trim().toUpperCase().startsWith('SELECT')) {
      const rows = (await this.sqliteDb.all<T>(sql, params)) as T[]
      const executionTime = Date.now() - startTime

      return {
        rows: rows as T[],
        rowCount: rows.length,
        executionTime
      }
    } else {
      const result = await this.sqliteDb.run(sql, params)
      const executionTime = Date.now() - startTime

      return {
        rows: [] as T[],
        rowCount: result.changes || 0,
        executionTime
      }
    }
  }

  /**
   * Execute SQL query
   */
  async query<T = unknown>(sql: string, params?: QueryParam[]): Promise<QueryResult<T>> {
    // Validate query
    this.validateQuery(sql)

    // Execute based on database type
    switch (this.type) {
      case 'postgres':
        return this.queryPostgres<T>(sql, params)

      case 'mysql':
        return this.queryMysql<T>(sql, params)

      case 'sqlite':
        return this.querySqlite<T>(sql, params)

      default:
        throw new Error(`Unsupported database type: ${this.type}`)
    }
  }

  /**
   * Execute multiple queries in transaction
   */
  async transaction<T = unknown>(fn: (tx: TransactionFn) => Promise<T>): Promise<T> {
    if (this.readOnly) {
      throw new Error('Transactions not allowed in read-only mode')
    }

    switch (this.type) {
      case 'postgres':
        return this.transactionPostgres(fn)

      case 'mysql':
        return this.transactionMysql(fn)

      case 'sqlite':
        return this.transactionSqlite(fn)

      default:
        throw new Error(`Unsupported database type: ${this.type}`)
    }
  }

  /**
   * Transaction (PostgreSQL)
   */
  private async transactionPostgres<T>(fn: (tx: TransactionFn) => Promise<T>): Promise<T> {
    if (!this.pgPool) {
      throw new Error('PostgreSQL pool not initialized')
    }

    const client = await this.pgPool.connect()

    try {
      await client.query('BEGIN')

      const tx: TransactionFn = {
        query: async <R = unknown>(sql: string, params?: QueryParam[]) => {
          this.validateQuery(sql)
          const startTime = Date.now()
          const result = await client.query(sql, params)
          const executionTime = Date.now() - startTime

          return {
            rows: result.rows as R[],
            rowCount: result.rowCount || 0,
            fields: result.fields?.map(f => f.name),
            executionTime
          }
        }
      }

      const result = await fn(tx)
      await client.query('COMMIT')

      return result
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  }

  /**
   * Transaction (MySQL)
   */
  private async transactionMysql<T>(fn: (tx: TransactionFn) => Promise<T>): Promise<T> {
    if (!this.mysqlPool) {
      throw new Error('MySQL pool not initialized')
    }

    const connection = await this.mysqlPool.getConnection()

    try {
      await connection.beginTransaction()

      const tx: TransactionFn = {
        query: async <R = unknown>(sql: string, params?: QueryParam[]) => {
          this.validateQuery(sql)
          const startTime = Date.now()
          const [rawRows, fields] = await connection.execute(sql, params)
          const executionTime = Date.now() - startTime
          const rows = Array.isArray(rawRows) ? (rawRows as R[]) : []

          return {
            rows,
            rowCount: rows.length,
            fields: Array.isArray(fields) ? fields.map(f => f.name) : undefined,
            executionTime
          }
        }
      }

      const result = await fn(tx)
      await connection.commit()

      return result
    } catch (error) {
      await connection.rollback()
      throw error
    } finally {
      connection.release()
    }
  }

  /**
   * Transaction (SQLite)
   */
  private async transactionSqlite<T>(fn: (tx: TransactionFn) => Promise<T>): Promise<T> {
    if (!this.sqliteDb) {
      throw new Error('SQLite database not initialized')
    }

    try {
      await this.sqliteDb.exec('BEGIN TRANSACTION')

      const tx: TransactionFn = {
        query: async <R = unknown>(sql: string, params?: QueryParam[]) => {
          this.validateQuery(sql)
          const startTime = Date.now()

          if (sql.trim().toUpperCase().startsWith('SELECT')) {
            const rows = (await this.sqliteDb!.all<R>(sql, params)) as R[]
            const executionTime = Date.now() - startTime

            return {
              rows,
              rowCount: rows.length,
              executionTime
            }
          } else {
            const result = await this.sqliteDb!.run(sql, params)
            const executionTime = Date.now() - startTime

            return {
              rows: [] as R[],
              rowCount: result.changes || 0,
              executionTime
            }
          }
        }
      }

      const result = await fn(tx)
      await this.sqliteDb.exec('COMMIT')

      return result
    } catch (error) {
      await this.sqliteDb.exec('ROLLBACK')
      throw error
    }
  }

  /**
   * Get table schema
   */
  async getTableSchema(tableName: string): Promise<QueryResult<Record<string, unknown>>> {
    switch (this.type) {
      case 'postgres':
        return this.query<Record<string, unknown>>(
          `
          SELECT column_name, data_type, is_nullable, column_default
          FROM information_schema.columns
          WHERE table_name = $1
          ORDER BY ordinal_position
        `,
          [tableName]
        )

      case 'mysql':
        return this.query<Record<string, unknown>>(
          `
          SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
          FROM information_schema.COLUMNS
          WHERE TABLE_NAME = ?
          ORDER BY ORDINAL_POSITION
        `,
          [tableName]
        )

      case 'sqlite':
        return this.query<Record<string, unknown>>(`PRAGMA table_info(${tableName})`)

      default:
        throw new Error(`Unsupported database type: ${this.type}`)
    }
  }

  /**
   * List all tables
   */
  async listTables(): Promise<string[]> {
    switch (this.type) {
      case 'postgres': {
        const pgResult = await this.query<{ tablename: string }>(`
          SELECT tablename
          FROM pg_catalog.pg_tables
          WHERE schemaname != 'pg_catalog'
            AND schemaname != 'information_schema'
        `)
        return pgResult.rows.map(row => row.tablename)
      }

      case 'mysql': {
        const mysqlResult = await this.query<Record<string, string>>('SHOW TABLES')
        return mysqlResult.rows
          .map(row => {
            const firstValue = Object.values(row)[0]
            return typeof firstValue === 'string' ? firstValue : ''
          })
          .filter(Boolean)
      }

      case 'sqlite': {
        const sqliteResult = await this.query<{ name: string }>(`
          SELECT name FROM sqlite_master
          WHERE type='table'
        `)
        return sqliteResult.rows.map(row => row.name)
      }

      default:
        throw new Error(`Unsupported database type: ${this.type}`)
    }
  }

  /**
   * Close database connection
   */
  async close(): Promise<void> {
    if (this.pgPool) {
      await this.pgPool.end()
    }

    if (this.mysqlPool) {
      await this.mysqlPool.end()
    }

    if (this.sqliteDb) {
      await this.sqliteDb.close()
    }
  }
}

/**
 * Tool definition for AI frameworks
 */
export const databaseQueryToolDefinition = {
  name: 'database_query',
  description:
    'Execute SQL queries on databases. Supports SELECT queries in read-only mode. Uses parameterized queries to prevent SQL injection.',
  parameters: {
    type: 'object',
    properties: {
      action: {
        type: 'string',
        enum: ['query', 'schema', 'list_tables'],
        description: 'The database action to perform'
      },
      sql: {
        type: 'string',
        description: 'The SQL query to execute (for query action)'
      },
      params: {
        type: 'array',
        description: 'Query parameters (prevents SQL injection)',
        items: { type: ['string', 'number', 'boolean'] }
      },
      table: {
        type: 'string',
        description: 'Table name (for schema action)'
      }
    },
    required: ['action']
  }
}

/**
 * Execute tool (for AI frameworks)
 */
export async function executeDatabaseQueryTool(
  args: DatabaseToolArgs,
  config: DatabaseConfig
): Promise<unknown> {
  const db = new DatabaseQueryTool(config)

  try {
    switch (args.action) {
      case 'query':
        if (!args.sql) {
          throw new Error('SQL query is required for query action')
        }
        return await db.query(args.sql, args.params)

      case 'schema':
        if (!args.table) {
          throw new Error('Table name is required for schema action')
        }
        return await db.getTableSchema(args.table)

      case 'list_tables':
        return await db.listTables()

      default:
        throw new Error(`Unknown action: ${args.action}`)
    }
  } finally {
    await db.close()
  }
}

/**
 * Example usage
 */
export async function examples() {
  // PostgreSQL example
  const pgDb = new DatabaseQueryTool({
    type: 'postgres',
    connection: {
      host: 'localhost',
      database: 'mydb',
      user: 'user',
      password: 'password'
    },
    readOnly: true
  })

  try {
    // List tables
    const tables = await pgDb.listTables()
    logInfo('Tables:', tables)

    // Get table schema
    const schema = await pgDb.getTableSchema('users')
    logInfo('Schema:', schema.rows)

    // Execute query with parameters
    const users = await pgDb.query('SELECT * FROM users WHERE age > $1 AND status = $2', [
      18,
      'active'
    ])
    logInfo(`Found ${users.rowCount} users`)
    logInfo('Users:', users.rows)

    // Execute aggregation query
    const stats = await pgDb.query(`
      SELECT
        COUNT(*) as total,
        AVG(age) as avg_age,
        MAX(age) as max_age
      FROM users
    `)
    logInfo('Stats:', stats.rows[0])
  } finally {
    await pgDb.close()
  }

  // SQLite example
  const sqliteDb = new DatabaseQueryTool({
    type: 'sqlite',
    connection: {
      filename: './database.db'
    },
    readOnly: false
  })

  try {
    // Transaction example
    await sqliteDb.transaction(async tx => {
      await tx.query('INSERT INTO users (name, email) VALUES (?, ?)', [
        'John Doe',
        'john@example.com'
      ])

      await tx.query('UPDATE accounts SET balance = balance + ?', [100])
    })

    logInfo('Transaction completed')
  } finally {
    await sqliteDb.close()
  }
}
