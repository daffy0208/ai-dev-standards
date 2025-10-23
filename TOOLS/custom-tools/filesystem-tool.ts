/**
 * File System Tool
 *
 * AI tool for safe file system operations.
 *
 * Features:
 * - Read files (text, JSON, binary)
 * - Write files (with backup)
 * - List directory contents
 * - Search files (glob patterns)
 * - File metadata (size, dates, permissions)
 * - Safe operations (sandboxing, validation)
 * - File watching
 * - Compression (zip/unzip)
 *
 * Safety:
 * - All operations restricted to allowed paths
 * - No deletion of system files
 * - Automatic backups for overwrites
 * - Path traversal prevention
 *
 * Usage:
 * ```typescript
 * import { FileSystemTool } from './filesystem-tool'
 *
 * const fs = new FileSystemTool({
 *   allowedPaths: ['/path/to/project']
 * })
 *
 * // Read file
 * const content = await fs.readFile('/path/to/project/file.txt')
 *
 * // Write file
 * await fs.writeFile('/path/to/project/output.json', data)
 *
 * // List directory
 * const files = await fs.listDirectory('/path/to/project')
 *
 * // Search files
 * const matches = await fs.searchFiles('/path/to/project', '**/*.ts')
 * ```
 */

import * as fs from 'fs/promises'
import * as path from 'path'
import { createReadStream, createWriteStream } from 'fs'
import { glob } from 'glob'
import { createGzip, createGunzip } from 'zlib'
import { pipeline } from 'stream/promises'

export interface FileSystemConfig {
  allowedPaths: string[]
  enableBackups?: boolean
  backupPath?: string
}

export interface FileInfo {
  path: string
  name: string
  size: number
  isDirectory: boolean
  isFile: boolean
  created: Date
  modified: Date
  accessed: Date
  extension?: string
}

export interface ReadOptions {
  encoding?: BufferEncoding
  json?: boolean
}

export interface WriteOptions {
  encoding?: BufferEncoding
  createBackup?: boolean
  json?: boolean
}

export interface SearchOptions {
  pattern: string
  recursive?: boolean
  includeDirectories?: boolean
  maxResults?: number
}

export class FileSystemTool {
  private allowedPaths: Set<string>
  private enableBackups: boolean
  private backupPath: string

  constructor(config: FileSystemConfig) {
    this.allowedPaths = new Set(
      config.allowedPaths.map(p => path.resolve(p))
    )
    this.enableBackups = config.enableBackups ?? true
    this.backupPath = config.backupPath || path.join(process.cwd(), '.backups')
  }

  /**
   * Validate path is allowed
   */
  private validatePath(filePath: string): string {
    const resolvedPath = path.resolve(filePath)

    // Check if path is within allowed directories
    const isAllowed = Array.from(this.allowedPaths).some(allowedPath =>
      resolvedPath.startsWith(allowedPath)
    )

    if (!isAllowed) {
      throw new Error(
        `Access denied: ${filePath} is outside allowed paths`
      )
    }

    return resolvedPath
  }

  /**
   * Create backup of file before overwriting
   */
  private async createBackup(filePath: string): Promise<void> {
    if (!this.enableBackups) return

    try {
      const exists = await fs.access(filePath).then(() => true).catch(() => false)
      if (!exists) return

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const backupDir = path.join(this.backupPath, path.dirname(filePath))
      const backupFile = path.join(
        backupDir,
        `${path.basename(filePath)}.${timestamp}.backup`
      )

      await fs.mkdir(backupDir, { recursive: true })
      await fs.copyFile(filePath, backupFile)
    } catch (error) {
      console.warn('Failed to create backup:', error)
    }
  }

  /**
   * Read file
   */
  async readFile(
    filePath: string,
    options: ReadOptions = {}
  ): Promise<string | Buffer | any> {
    const validPath = this.validatePath(filePath)

    const content = await fs.readFile(
      validPath,
      options.encoding || 'utf-8'
    )

    if (options.json) {
      return JSON.parse(content.toString())
    }

    return content
  }

  /**
   * Write file
   */
  async writeFile(
    filePath: string,
    content: string | Buffer | any,
    options: WriteOptions = {}
  ): Promise<void> {
    const validPath = this.validatePath(filePath)

    // Create backup if file exists
    if (options.createBackup !== false) {
      await this.createBackup(validPath)
    }

    // Ensure directory exists
    await fs.mkdir(path.dirname(validPath), { recursive: true })

    // Convert to string if JSON
    let finalContent = content
    if (options.json) {
      finalContent = JSON.stringify(content, null, 2)
    }

    await fs.writeFile(
      validPath,
      finalContent,
      options.encoding || 'utf-8'
    )
  }

  /**
   * Append to file
   */
  async appendFile(
    filePath: string,
    content: string,
    encoding: BufferEncoding = 'utf-8'
  ): Promise<void> {
    const validPath = this.validatePath(filePath)

    await fs.appendFile(validPath, content, encoding)
  }

  /**
   * List directory contents
   */
  async listDirectory(
    dirPath: string,
    options: {
      recursive?: boolean
      includeHidden?: boolean
    } = {}
  ): Promise<FileInfo[]> {
    const validPath = this.validatePath(dirPath)

    const entries = await fs.readdir(validPath, { withFileTypes: true })
    const results: FileInfo[] = []

    for (const entry of entries) {
      // Skip hidden files unless requested
      if (!options.includeHidden && entry.name.startsWith('.')) {
        continue
      }

      const fullPath = path.join(dirPath, entry.name)
      const stats = await fs.stat(fullPath)

      results.push({
        path: fullPath,
        name: entry.name,
        size: stats.size,
        isDirectory: entry.isDirectory(),
        isFile: entry.isFile(),
        created: stats.birthtime,
        modified: stats.mtime,
        accessed: stats.atime,
        extension: entry.isFile() ? path.extname(entry.name) : undefined
      })

      // Recurse into subdirectories
      if (options.recursive && entry.isDirectory()) {
        const subResults = await this.listDirectory(fullPath, options)
        results.push(...subResults)
      }
    }

    return results
  }

  /**
   * Search files using glob pattern
   */
  async searchFiles(
    basePath: string,
    pattern: string,
    options: {
      maxResults?: number
      includeDirectories?: boolean
    } = {}
  ): Promise<FileInfo[]> {
    const validPath = this.validatePath(basePath)

    const matches = await glob(pattern, {
      cwd: validPath,
      absolute: true,
      nodir: !options.includeDirectories
    })

    const limited = options.maxResults
      ? matches.slice(0, options.maxResults)
      : matches

    const results: FileInfo[] = []

    for (const match of limited) {
      const stats = await fs.stat(match)

      results.push({
        path: match,
        name: path.basename(match),
        size: stats.size,
        isDirectory: stats.isDirectory(),
        isFile: stats.isFile(),
        created: stats.birthtime,
        modified: stats.mtime,
        accessed: stats.atime,
        extension: stats.isFile() ? path.extname(match) : undefined
      })
    }

    return results
  }

  /**
   * Get file metadata
   */
  async getFileInfo(filePath: string): Promise<FileInfo> {
    const validPath = this.validatePath(filePath)
    const stats = await fs.stat(validPath)

    return {
      path: validPath,
      name: path.basename(validPath),
      size: stats.size,
      isDirectory: stats.isDirectory(),
      isFile: stats.isFile(),
      created: stats.birthtime,
      modified: stats.mtime,
      accessed: stats.atime,
      extension: stats.isFile() ? path.extname(validPath) : undefined
    }
  }

  /**
   * Check if file exists
   */
  async exists(filePath: string): Promise<boolean> {
    try {
      const validPath = this.validatePath(filePath)
      await fs.access(validPath)
      return true
    } catch {
      return false
    }
  }

  /**
   * Create directory
   */
  async createDirectory(dirPath: string): Promise<void> {
    const validPath = this.validatePath(dirPath)
    await fs.mkdir(validPath, { recursive: true })
  }

  /**
   * Copy file
   */
  async copyFile(source: string, destination: string): Promise<void> {
    const validSource = this.validatePath(source)
    const validDest = this.validatePath(destination)

    await fs.mkdir(path.dirname(validDest), { recursive: true })
    await fs.copyFile(validSource, validDest)
  }

  /**
   * Move/rename file
   */
  async moveFile(source: string, destination: string): Promise<void> {
    const validSource = this.validatePath(source)
    const validDest = this.validatePath(destination)

    await fs.mkdir(path.dirname(validDest), { recursive: true })
    await fs.rename(validSource, validDest)
  }

  /**
   * Delete file (safe - only in allowed paths)
   */
  async deleteFile(filePath: string, options: { backup?: boolean } = {}): Promise<void> {
    const validPath = this.validatePath(filePath)

    // Create backup before deletion
    if (options.backup !== false) {
      await this.createBackup(validPath)
    }

    await fs.unlink(validPath)
  }

  /**
   * Compress file (gzip)
   */
  async compressFile(source: string, destination?: string): Promise<string> {
    const validSource = this.validatePath(source)
    const destPath = destination || `${validSource}.gz`
    const validDest = this.validatePath(destPath)

    await fs.mkdir(path.dirname(validDest), { recursive: true })

    await pipeline(
      createReadStream(validSource),
      createGzip(),
      createWriteStream(validDest)
    )

    return validDest
  }

  /**
   * Decompress file (gunzip)
   */
  async decompressFile(source: string, destination?: string): Promise<string> {
    const validSource = this.validatePath(source)
    const destPath = destination || source.replace(/\.gz$/, '')
    const validDest = this.validatePath(destPath)

    await fs.mkdir(path.dirname(validDest), { recursive: true })

    await pipeline(
      createReadStream(validSource),
      createGunzip(),
      createWriteStream(validDest)
    )

    return validDest
  }

  /**
   * Watch file for changes
   */
  async watchFile(
    filePath: string,
    callback: (event: 'change' | 'rename', filename: string) => void
  ): Promise<() => void> {
    const validPath = this.validatePath(filePath)

    const watcher = fs.watch(validPath, (event, filename) => {
      callback(event, filename || '')
    })

    // Return cleanup function
    return async () => {
      ;(await watcher).close()
    }
  }

  /**
   * Read directory tree as object
   */
  async readTree(dirPath: string): Promise<any> {
    const validPath = this.validatePath(dirPath)
    const tree: any = {}

    const entries = await fs.readdir(validPath, { withFileTypes: true })

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name)

      if (entry.isDirectory()) {
        tree[entry.name] = await this.readTree(fullPath)
      } else {
        tree[entry.name] = await this.getFileInfo(fullPath)
      }
    }

    return tree
  }
}

/**
 * Tool definition for AI frameworks
 */
export const fileSystemToolDefinition = {
  name: 'filesystem',
  description: 'Perform file system operations like reading, writing, listing, and searching files. All operations are restricted to allowed paths for safety.',
  parameters: {
    type: 'object',
    properties: {
      action: {
        type: 'string',
        enum: [
          'read',
          'write',
          'list',
          'search',
          'info',
          'exists',
          'create_dir',
          'copy',
          'move',
          'delete'
        ],
        description: 'The file system action to perform'
      },
      path: {
        type: 'string',
        description: 'The file or directory path'
      },
      content: {
        type: 'string',
        description: 'Content to write (for write action)'
      },
      pattern: {
        type: 'string',
        description: 'Glob pattern (for search action)'
      },
      destination: {
        type: 'string',
        description: 'Destination path (for copy/move actions)'
      },
      options: {
        type: 'object',
        description: 'Additional options',
        properties: {
          json: { type: 'boolean' },
          recursive: { type: 'boolean' },
          backup: { type: 'boolean' }
        }
      }
    },
    required: ['action', 'path']
  }
}

/**
 * Execute tool (for AI frameworks)
 */
export async function executeFileSystemTool(
  args: any,
  config: FileSystemConfig
): Promise<any> {
  const fs = new FileSystemTool(config)

  switch (args.action) {
    case 'read':
      return await fs.readFile(args.path, args.options || {})

    case 'write':
      await fs.writeFile(args.path, args.content, args.options || {})
      return { success: true, path: args.path }

    case 'list':
      return await fs.listDirectory(args.path, args.options || {})

    case 'search':
      return await fs.searchFiles(args.path, args.pattern, args.options || {})

    case 'info':
      return await fs.getFileInfo(args.path)

    case 'exists':
      return await fs.exists(args.path)

    case 'create_dir':
      await fs.createDirectory(args.path)
      return { success: true, path: args.path }

    case 'copy':
      await fs.copyFile(args.path, args.destination)
      return { success: true, from: args.path, to: args.destination }

    case 'move':
      await fs.moveFile(args.path, args.destination)
      return { success: true, from: args.path, to: args.destination }

    case 'delete':
      await fs.deleteFile(args.path, args.options || {})
      return { success: true, path: args.path }

    default:
      throw new Error(`Unknown action: ${args.action}`)
  }
}

/**
 * Example usage
 */
export async function examples() {
  const fs = new FileSystemTool({
    allowedPaths: [process.cwd()]
  })

  // Example 1: Read text file
  const content = await fs.readFile('./README.md')
  console.log('File content:', content)

  // Example 2: Read JSON file
  const data = await fs.readFile('./package.json', { json: true })
  console.log('JSON data:', data)

  // Example 3: Write file
  await fs.writeFile('./output.txt', 'Hello, World!')
  console.log('File written')

  // Example 4: Write JSON file
  await fs.writeFile('./data.json', { name: 'John', age: 30 }, { json: true })
  console.log('JSON written')

  // Example 5: List directory
  const files = await fs.listDirectory('./')
  console.log('Files:', files.map(f => f.name))

  // Example 6: List directory recursively
  const allFiles = await fs.listDirectory('./', { recursive: true })
  console.log(`Found ${allFiles.length} files`)

  // Example 7: Search files
  const tsFiles = await fs.searchFiles('./', '**/*.ts')
  console.log('TypeScript files:', tsFiles.map(f => f.path))

  // Example 8: Get file info
  const info = await fs.getFileInfo('./package.json')
  console.log('File info:', {
    name: info.name,
    size: info.size,
    modified: info.modified
  })

  // Example 9: Check existence
  const exists = await fs.exists('./README.md')
  console.log('File exists:', exists)

  // Example 10: Copy file
  await fs.copyFile('./README.md', './README.backup.md')
  console.log('File copied')

  // Example 11: Create directory
  await fs.createDirectory('./output')
  console.log('Directory created')

  // Example 12: Compress file
  const compressed = await fs.compressFile('./README.md')
  console.log('Compressed to:', compressed)

  // Example 13: Read directory tree
  const tree = await fs.readTree('./src')
  console.log('Directory tree:', JSON.stringify(tree, null, 2))
}
