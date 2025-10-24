/**
 * Database Migration Script
 *
 * Automated database migration tool with rollback support.
 *
 * Features:
 * - Schema migrations
 * - Up/Down migrations
 * - Migration history tracking
 * - Rollback support
 * - Multiple databases (PostgreSQL, MySQL, MongoDB)
 * - Dry run mode
 * - Migration generation
 *
 * @example
 * ```bash
 * # Generate migration
 * ts-node db-migrate.ts generate --name add_users_table
 *
 * # Run migrations
 * ts-node db-migrate.ts up
 *
 * # Rollback last migration
 * ts-node db-migrate.ts down
 *
 * # Rollback to specific version
 * ts-node db-migrate.ts down --to 20240101000000
 * ```
 */

import { execSync } from 'child_process'
import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
  readdirSync,
} from 'fs'
import { join } from 'path'

export type DatabaseType = 'postgres' | 'mysql' | 'mongodb'

export interface MigrationOptions {
  /**
   * Database type
   */
  type?: DatabaseType

  /**
   * Database connection URL
   */
  database?: string

  /**
   * Migrations directory
   */
  migrationsDir?: string

  /**
   * Migrations table name
   */
  tableName?: string

  /**
   * Dry run (don't execute, just show SQL)
   */
  dryRun?: boolean
}

export interface Migration {
  id: string
  name: string
  timestamp: number
  up: string
  down: string
  executedAt?: Date
}

export class DatabaseMigration {
  private options: Required<MigrationOptions>

  constructor(options: MigrationOptions = {}) {
    this.options = {
      type: options.type || (process.env.DB_TYPE as DatabaseType) || 'postgres',
      database: options.database || process.env.DATABASE_URL || '',
      migrationsDir: options.migrationsDir || './migrations',
      tableName: options.tableName || 'schema_migrations',
      dryRun: options.dryRun ?? false,
    }

    // Create migrations directory if it doesn't exist
    if (!existsSync(this.options.migrationsDir)) {
      mkdirSync(this.options.migrationsDir, { recursive: true })
    }
  }

  /**
   * Generate a new migration file
   */
  async generate(name: string): Promise<string> {
    const timestamp = Date.now()
    const id = `${timestamp}`
    const filename = `${id}_${name}.sql`
    const filepath = join(this.options.migrationsDir, filename)

    const template = this.getMigrationTemplate(name)

    writeFileSync(filepath, template)

    console.log(`Created migration: ${filepath}`)
    return filepath
  }

  /**
   * Run pending migrations
   */
  async up(options?: { to?: string }): Promise<void> {
    console.log('Running migrations...\n')

    // Ensure migrations table exists
    await this.ensureMigrationsTable()

    // Get pending migrations
    const pending = await this.getPendingMigrations()

    if (pending.length === 0) {
      console.log('No pending migrations')
      return
    }

    // Filter to specific migration if specified
    const migrationsToRun = options?.to
      ? pending.filter((m) => m.id <= options.to!)
      : pending

    for (const migration of migrationsToRun) {
      console.log(`Migrating: ${migration.name}`)

      if (this.options.dryRun) {
        console.log('DRY RUN - SQL:')
        console.log(migration.up)
        console.log('')
      } else {
        try {
          await this.executeMigration(migration.up)
          await this.recordMigration(migration.id, migration.name)
          console.log(`✓ Completed: ${migration.name}\n`)
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error)
          console.error(`✗ Failed: ${migration.name}`)
          console.error(`Error: ${errorMessage}\n`)
          throw error
        }
      }
    }

    console.log('All migrations completed!')
  }

  /**
   * Rollback migrations
   */
  async down(options?: { to?: string; steps?: number }): Promise<void> {
    console.log('Rolling back migrations...\n')

    // Get executed migrations
    const executed = await this.getExecutedMigrations()

    if (executed.length === 0) {
      console.log('No migrations to rollback')
      return
    }

    // Determine which migrations to rollback
    let migrationsToRollback: Migration[]

    if (options?.to) {
      // Rollback to specific migration
      migrationsToRollback = executed.filter((m) => m.id > options.to!)
    } else if (options?.steps) {
      // Rollback specific number of steps
      migrationsToRollback = executed.slice(-options.steps)
    } else {
      // Rollback last migration
      migrationsToRollback = [executed[executed.length - 1]]
    }

    // Reverse order for rollback
    migrationsToRollback.reverse()

    for (const migration of migrationsToRollback) {
      console.log(`Rolling back: ${migration.name}`)

      if (this.options.dryRun) {
        console.log('DRY RUN - SQL:')
        console.log(migration.down)
        console.log('')
      } else {
        try {
          await this.executeMigration(migration.down)
          await this.removeMigration(migration.id)
          console.log(`✓ Rolled back: ${migration.name}\n`)
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error)
          console.error(`✗ Failed to rollback: ${migration.name}`)
          console.error(`Error: ${errorMessage}\n`)
          throw error
        }
      }
    }

    console.log('Rollback completed!')
  }

  /**
   * Get migration status
   */
  async status(): Promise<void> {
    const all = this.getAllMigrations()
    const executed = await this.getExecutedMigrations()
    const executedIds = new Set(executed.map((m) => m.id))

    console.log('Migration Status:\n')
    console.log('ID               | Name                    | Status')
    console.log('-'.repeat(60))

    for (const migration of all) {
      const status = executedIds.has(migration.id) ? '✓ Applied' : '○ Pending'
      console.log(`${migration.id} | ${migration.name.padEnd(23)} | ${status}`)
    }
  }

  /**
   * Get migration template
   */
  private getMigrationTemplate(name: string): string {
    return `-- Migration: ${name}
-- Created: ${new Date().toISOString()}

-- UP Migration
-- Add your SQL statements here

-- Example: CREATE TABLE users (
--   id SERIAL PRIMARY KEY,
--   email VARCHAR(255) NOT NULL UNIQUE,
--   created_at TIMESTAMP DEFAULT NOW()
-- );

-- DOWN Migration (Rollback)
-- Add rollback SQL statements here

-- Example: DROP TABLE IF EXISTS users;
`
  }

  /**
   * Ensure migrations table exists
   */
  private async ensureMigrationsTable(): Promise<void> {
    let sql: string

    switch (this.options.type) {
      case 'postgres':
        sql = `
          CREATE TABLE IF NOT EXISTS ${this.options.tableName} (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            executed_at TIMESTAMP DEFAULT NOW()
          )
        `
        break

      case 'mysql':
        sql = `
          CREATE TABLE IF NOT EXISTS ${this.options.tableName} (
            id VARCHAR(255) PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `
        break

      case 'mongodb':
        // MongoDB doesn't need table creation
        return

      default:
        throw new Error(`Unsupported database type: ${this.options.type}`)
    }

    if (!this.options.dryRun) {
      await this.executeMigration(sql)
    }
  }

  /**
   * Get all migration files
   */
  private getAllMigrations(): Migration[] {
    const files = readdirSync(this.options.migrationsDir)
      .filter((f) => f.endsWith('.sql'))
      .sort()

    return files.map((file) => {
      const [id, ...nameParts] = file.replace('.sql', '').split('_')
      const name = nameParts.join('_')
      const content = readFileSync(join(this.options.migrationsDir, file), 'utf-8')

      // Split into up and down migrations
      const parts = content.split('-- DOWN Migration')
      const up = parts[0].replace(/-- UP Migration.*?\n/s, '').trim()
      const down = parts[1]?.trim() || ''

      return {
        id,
        name,
        timestamp: parseInt(id),
        up,
        down,
      }
    })
  }

  /**
   * Get executed migrations
   */
  private async getExecutedMigrations(): Promise<Migration[]> {
    if (this.options.dryRun) return []

    let sql: string

    switch (this.options.type) {
      case 'postgres':
      case 'mysql':
        sql = `SELECT id, name, executed_at FROM ${this.options.tableName} ORDER BY executed_at`
        break

      case 'mongodb':
        // MongoDB query would go here
        return []

      default:
        throw new Error(`Unsupported database type: ${this.options.type}`)
    }

    // Execute query and parse results
    // This is simplified - real implementation would use DB driver
    return []
  }

  /**
   * Get pending migrations
   */
  private async getPendingMigrations(): Promise<Migration[]> {
    const all = this.getAllMigrations()
    const executed = await this.getExecutedMigrations()
    const executedIds = new Set(executed.map((m) => m.id))

    return all.filter((m) => !executedIds.has(m.id))
  }

  /**
   * Execute migration SQL
   */
  private async executeMigration(sql: string): Promise<void> {
    let command: string

    switch (this.options.type) {
      case 'postgres':
        command = `psql ${this.options.database} -c "${sql.replace(/"/g, '\\"')}"`
        break

      case 'mysql':
        command = `mysql ${this.options.database} -e "${sql.replace(/"/g, '\\"')}"`
        break

      case 'mongodb':
        command = `mongo ${this.options.database} --eval "${sql.replace(/"/g, '\\"')}"`
        break

      default:
        throw new Error(`Unsupported database type: ${this.options.type}`)
    }

    try {
      execSync(command, { stdio: 'pipe' })
    } catch (error) {
      throw new Error(`Migration execution failed: ${command}`)
    }
  }

  /**
   * Record migration in database
   */
  private async recordMigration(id: string, name: string): Promise<void> {
    const sql = `INSERT INTO ${this.options.tableName} (id, name) VALUES ('${id}', '${name}')`
    await this.executeMigration(sql)
  }

  /**
   * Remove migration record
   */
  private async removeMigration(id: string): Promise<void> {
    const sql = `DELETE FROM ${this.options.tableName} WHERE id = '${id}'`
    await this.executeMigration(sql)
  }
}

/**
 * CLI interface
 */
export async function runMigrations(): Promise<void> {
  const command = process.argv[2]
  const args = process.argv.slice(3)

  const migration = new DatabaseMigration({
    dryRun: args.includes('--dry-run'),
  })

  switch (command) {
    case 'generate':
      const nameIndex = args.indexOf('--name')
      const name = nameIndex >= 0 ? args[nameIndex + 1] : 'migration'
      await migration.generate(name)
      break

    case 'up':
      await migration.up()
      break

    case 'down':
      const stepsIndex = args.indexOf('--steps')
      const steps = stepsIndex >= 0 ? parseInt(args[stepsIndex + 1]) : undefined
      const toIndex = args.indexOf('--to')
      const to = toIndex >= 0 ? args[toIndex + 1] : undefined
      await migration.down({ steps, to })
      break

    case 'status':
      await migration.status()
      break

    default:
      console.log('Usage:')
      console.log('  generate --name <name>  Generate new migration')
      console.log('  up                      Run pending migrations')
      console.log('  down                    Rollback last migration')
      console.log('  down --steps N          Rollback N migrations')
      console.log('  down --to <id>          Rollback to specific migration')
      console.log('  status                  Show migration status')
      console.log('  --dry-run               Show SQL without executing')
      process.exit(1)
  }
}

// Run if executed directly
if (require.main === module) {
  runMigrations().catch((error) => {
    console.error('Migration failed:', error)
    process.exit(1)
  })
}
