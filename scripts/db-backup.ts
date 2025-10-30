/**
 * Database Backup Script
 *
 * Automated database backup with compression and cloud storage support.
 *
 * Features:
 * - PostgreSQL, MySQL, MongoDB support
 * - Compression (gzip)
 * - Local and cloud storage (S3, GCS)
 * - Retention policy
 * - Logging and notifications
 *
 * @example
 * ```bash
 * # Backup to local
 * ts-node db-backup.ts --type postgres --output ./backups
 *
 * # Backup to S3
 * ts-node db-backup.ts --type postgres --storage s3 --bucket my-backups
 * ```
 */

import { execSync } from 'child_process'
import { existsSync, mkdirSync, unlinkSync, readdirSync, statSync } from 'fs'
import { join } from 'path'
import { createGzip } from 'zlib'
import { createReadStream, createWriteStream } from 'fs'
import { pipeline } from 'stream/promises'

export type DatabaseType = 'postgres' | 'mysql' | 'mongodb'
export type StorageType = 'local' | 's3' | 'gcs'

export interface BackupOptions {
  /**
   * Database type
   */
  type: DatabaseType

  /**
   * Database connection URL or config
   */
  database: string

  /**
   * Output directory for local storage
   */
  outputDir?: string

  /**
   * Storage type
   */
  storage?: StorageType

  /**
   * S3 bucket name (if storage = 's3')
   */
  s3Bucket?: string

  /**
   * GCS bucket name (if storage = 'gcs')
   */
  gcsBucket?: string

  /**
   * Enable compression
   */
  compress?: boolean

  /**
   * Retention days (delete backups older than this)
   */
  retentionDays?: number

  /**
   * Include timestamp in filename
   */
  includeTimestamp?: boolean
}

export class DatabaseBackup {
  private options: Required<Omit<BackupOptions, 's3Bucket' | 'gcsBucket'>> & {
    s3Bucket?: string
    gcsBucket?: string
  }

  constructor(options: BackupOptions) {
    this.options = {
      type: options.type,
      database: options.database,
      outputDir: options.outputDir || './backups',
      storage: options.storage || 'local',
      s3Bucket: options.s3Bucket,
      gcsBucket: options.gcsBucket,
      compress: options.compress ?? true,
      retentionDays: options.retentionDays || 7,
      includeTimestamp: options.includeTimestamp ?? true,
    }

    // Create output directory if it doesn't exist
    if (!existsSync(this.options.outputDir)) {
      mkdirSync(this.options.outputDir, { recursive: true })
    }
  }

  /**
   * Execute backup
   */
  async backup(): Promise<{ success: boolean; path: string; message: string }> {
    console.log(`Starting ${this.options.type} backup...`)

    try {
      // Generate filename
      const filename = this.generateFilename()
      const backupPath = join(this.options.outputDir, filename)

      // Execute database-specific backup
      await this.executeBackup(backupPath)

      // Compress if enabled
      let finalPath = backupPath
      if (this.options.compress) {
        finalPath = await this.compressBackup(backupPath)
        // Remove uncompressed file
        unlinkSync(backupPath)
      }

      // Upload to cloud storage if configured
      if (this.options.storage !== 'local') {
        await this.uploadToCloud(finalPath)
      }

      // Clean old backups
      await this.cleanOldBackups()

      console.log(`Backup completed: ${finalPath}`)

      return {
        success: true,
        path: finalPath,
        message: 'Backup completed successfully',
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      console.error(`Backup failed: ${errorMessage}`)

      return {
        success: false,
        path: '',
        message: `Backup failed: ${errorMessage}`,
      }
    }
  }

  /**
   * Generate backup filename
   */
  private generateFilename(): string {
    const timestamp = this.options.includeTimestamp
      ? `-${new Date().toISOString().replace(/[:.]/g, '-')}`
      : ''

    const extension = this.getExtension()
    return `backup-${this.options.type}${timestamp}.${extension}`
  }

  /**
   * Get file extension based on database type
   */
  private getExtension(): string {
    switch (this.options.type) {
      case 'postgres':
        return 'sql'
      case 'mysql':
        return 'sql'
      case 'mongodb':
        return 'archive'
      default:
        return 'backup'
    }
  }

  /**
   * Execute database-specific backup command
   */
  private async executeBackup(outputPath: string): Promise<void> {
    let command: string

    switch (this.options.type) {
      case 'postgres':
        command = `pg_dump ${this.options.database} > ${outputPath}`
        break

      case 'mysql':
        command = `mysqldump ${this.options.database} > ${outputPath}`
        break

      case 'mongodb':
        command = `mongodump --uri="${this.options.database}" --archive=${outputPath}`
        break

      default:
        throw new Error(`Unsupported database type: ${this.options.type}`)
    }

    try {
      execSync(command, { stdio: 'inherit' })
    } catch (error) {
      throw new Error(`Backup command failed: ${command}`)
    }
  }

  /**
   * Compress backup file with gzip
   */
  private async compressBackup(inputPath: string): Promise<string> {
    const outputPath = `${inputPath}.gz`

    console.log('Compressing backup...')

    await pipeline(
      createReadStream(inputPath),
      createGzip(),
      createWriteStream(outputPath)
    )

    console.log('Compression complete')
    return outputPath
  }

  /**
   * Upload backup to cloud storage
   */
  private async uploadToCloud(filePath: string): Promise<void> {
    console.log(`Uploading to ${this.options.storage}...`)

    switch (this.options.storage) {
      case 's3':
        await this.uploadToS3(filePath)
        break

      case 'gcs':
        await this.uploadToGCS(filePath)
        break

      default:
        throw new Error(`Unsupported storage type: ${this.options.storage}`)
    }

    console.log('Upload complete')
  }

  /**
   * Upload to AWS S3
   */
  private async uploadToS3(filePath: string): Promise<void> {
    if (!this.options.s3Bucket) {
      throw new Error('S3 bucket not configured')
    }

    const filename = filePath.split('/').pop()
    const command = `aws s3 cp ${filePath} s3://${this.options.s3Bucket}/${filename}`

    try {
      execSync(command, { stdio: 'inherit' })
    } catch (error) {
      throw new Error('S3 upload failed')
    }
  }

  /**
   * Upload to Google Cloud Storage
   */
  private async uploadToGCS(filePath: string): Promise<void> {
    if (!this.options.gcsBucket) {
      throw new Error('GCS bucket not configured')
    }

    const filename = filePath.split('/').pop()
    const command = `gsutil cp ${filePath} gs://${this.options.gcsBucket}/${filename}`

    try {
      execSync(command, { stdio: 'inherit' })
    } catch (error) {
      throw new Error('GCS upload failed')
    }
  }

  /**
   * Clean backups older than retention period
   */
  private async cleanOldBackups(): Promise<void> {
    if (this.options.retentionDays <= 0) return

    console.log('Cleaning old backups...')

    const files = readdirSync(this.options.outputDir)
    const now = Date.now()
    const retentionMs = this.options.retentionDays * 24 * 60 * 60 * 1000

    for (const file of files) {
      const filePath = join(this.options.outputDir, file)
      const stats = statSync(filePath)
      const age = now - stats.mtime.getTime()

      if (age > retentionMs) {
        console.log(`Removing old backup: ${file}`)
        unlinkSync(filePath)
      }
    }

    console.log('Cleanup complete')
  }
}

/**
 * Run backup from environment variables
 */
export async function runBackup(): Promise<void> {
  const type = (process.env.DB_TYPE || 'postgres') as DatabaseType
  const database = process.env.DATABASE_URL || ''

  if (!database) {
    throw new Error('DATABASE_URL environment variable required')
  }

  const backup = new DatabaseBackup({
    type,
    database,
    outputDir: process.env.BACKUP_DIR || './backups',
    storage: (process.env.BACKUP_STORAGE as StorageType) || 'local',
    s3Bucket: process.env.S3_BACKUP_BUCKET,
    gcsBucket: process.env.GCS_BACKUP_BUCKET,
    compress: process.env.BACKUP_COMPRESS !== 'false',
    retentionDays: parseInt(process.env.BACKUP_RETENTION_DAYS || '7'),
  })

  const result = await backup.backup()

  if (!result.success) {
    process.exit(1)
  }
}

// Run if executed directly
if (require.main === module) {
  runBackup().catch(error => {
    console.error('Backup failed:', error)
    process.exit(1)
  })
}
