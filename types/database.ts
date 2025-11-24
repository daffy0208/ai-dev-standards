export type DatabaseType = 'postgres' | 'mysql' | 'sqlite'

export interface PostgresMysqlConfig {
  host: string
  port?: number
  database: string
  user: string
  password: string
}

export interface SqliteConfig {
  filename: string
}

export interface DatabaseConfig {
  type: DatabaseType
  connection: PostgresMysqlConfig | SqliteConfig
  readOnly?: boolean
  maxConnections?: number
}

export type QueryParam =
  | string
  | number
  | boolean
  | null
  | Date
  | Buffer
  | Record<string, unknown>
  | unknown[]

export interface QueryOptions {
  params?: QueryParam[]
  timeout?: number
}

export interface QueryResult<T = unknown> {
  rows: T[]
  rowCount: number
  fields?: string[]
  executionTime: number
}

export interface TransactionFn {
  query<T = unknown>(sql: string, params?: QueryParam[]): Promise<QueryResult<T>>
}

export interface DatabaseToolArgs {
  action: 'query' | 'schema' | 'list_tables'
  sql?: string
  params?: QueryParam[]
  table?: string
  timeoutMs?: number
}
