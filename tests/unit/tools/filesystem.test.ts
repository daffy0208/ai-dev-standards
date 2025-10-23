/**
 * FileSystem Tool Tests
 *
 * Unit tests for safe file operations.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { FileSystemTool } from '../../../TOOLS/custom-tools/filesystem-tool'
import { mkdir, writeFile, readFile, rm } from 'fs/promises'
import { join } from 'path'
import { tmpdir } from 'os'
import { mkdtempSync } from 'fs'

describe('FileSystemTool', () => {
  let tempDir: string
  let fs: FileSystemTool

  beforeEach(() => {
    // Create unique temp directory for each test
    tempDir = mkdtempSync(join(tmpdir(), 'fs-test-'))
    fs = new FileSystemTool({
      allowedPaths: [tempDir],
      enableBackups: false // Disable for tests
    })
  })

  afterEach(async () => {
    // Cleanup temp directory
    try {
      await rm(tempDir, { recursive: true, force: true })
    } catch (error) {
      console.warn('Failed to cleanup:', error)
    }
  })

  describe('Path validation', () => {
    it('should allow file in allowed path', async () => {
      const filePath = join(tempDir, 'test.txt')
      await expect(
        fs.writeFile(filePath, 'test content')
      ).resolves.not.toThrow()
    })

    it('should reject file outside allowed paths', async () => {
      const filePath = '/tmp/outside.txt'
      await expect(
        fs.writeFile(filePath, 'test')
      ).rejects.toThrow('Access denied')
    })

    it('should reject path traversal attempts', async () => {
      const filePath = join(tempDir, '../../../etc/passwd')
      await expect(
        fs.readFile(filePath)
      ).rejects.toThrow('Access denied')
    })
  })

  describe('Read operations', () => {
    it('should read text file', async () => {
      const filePath = join(tempDir, 'test.txt')
      await writeFile(filePath, 'Hello, World!')

      const content = await fs.readFile(filePath)
      expect(content).toBe('Hello, World!')
    })

    it('should read JSON file', async () => {
      const filePath = join(tempDir, 'data.json')
      const data = { name: 'Test', value: 123 }
      await writeFile(filePath, JSON.stringify(data))

      const content = await fs.readFile(filePath, { json: true })
      expect(content).toEqual(data)
    })

    it('should throw on non-existent file', async () => {
      const filePath = join(tempDir, 'nonexistent.txt')
      await expect(
        fs.readFile(filePath)
      ).rejects.toThrow()
    })
  })

  describe('Write operations', () => {
    it('should write text file', async () => {
      const filePath = join(tempDir, 'output.txt')
      await fs.writeFile(filePath, 'Test content')

      const content = await readFile(filePath, 'utf-8')
      expect(content).toBe('Test content')
    })

    it('should write JSON file', async () => {
      const filePath = join(tempDir, 'data.json')
      const data = { key: 'value' }

      await fs.writeFile(filePath, data, { json: true })

      const content = await readFile(filePath, 'utf-8')
      expect(JSON.parse(content)).toEqual(data)
    })

    it('should create directories if needed', async () => {
      const filePath = join(tempDir, 'nested/dir/file.txt')
      await fs.writeFile(filePath, 'content')

      const content = await readFile(filePath, 'utf-8')
      expect(content).toBe('content')
    })

    it('should overwrite existing file', async () => {
      const filePath = join(tempDir, 'file.txt')
      await writeFile(filePath, 'original')
      await fs.writeFile(filePath, 'updated')

      const content = await readFile(filePath, 'utf-8')
      expect(content).toBe('updated')
    })
  })

  describe('Append operations', () => {
    it('should append to file', async () => {
      const filePath = join(tempDir, 'log.txt')
      await writeFile(filePath, 'Line 1\n')
      await fs.appendFile(filePath, 'Line 2\n')

      const content = await readFile(filePath, 'utf-8')
      expect(content).toBe('Line 1\nLine 2\n')
    })

    it('should create file if not exists', async () => {
      const filePath = join(tempDir, 'new.txt')
      await fs.appendFile(filePath, 'content')

      const content = await readFile(filePath, 'utf-8')
      expect(content).toBe('content')
    })
  })

  describe('Directory operations', () => {
    it('should list directory contents', async () => {
      // Create test files
      await writeFile(join(tempDir, 'file1.txt'), 'content1')
      await writeFile(join(tempDir, 'file2.txt'), 'content2')
      await mkdir(join(tempDir, 'subdir'))

      const files = await fs.listDirectory(tempDir)

      expect(files).toHaveLength(3)
      expect(files.map(f => f.name).sort()).toEqual(['file1.txt', 'file2.txt', 'subdir'].sort())
    })

    it('should list recursively', async () => {
      await mkdir(join(tempDir, 'dir1'))
      await writeFile(join(tempDir, 'dir1', 'file.txt'), 'content')
      await mkdir(join(tempDir, 'dir2'))
      await writeFile(join(tempDir, 'dir2', 'file.txt'), 'content')

      const files = await fs.listDirectory(tempDir, { recursive: true })

      expect(files.length).toBeGreaterThanOrEqual(4) // 2 dirs + 2 files
    })

    it('should exclude hidden files by default', async () => {
      await writeFile(join(tempDir, '.hidden'), 'content')
      await writeFile(join(tempDir, 'visible.txt'), 'content')

      const files = await fs.listDirectory(tempDir)

      expect(files).toHaveLength(1)
      expect(files[0].name).toBe('visible.txt')
    })

    it('should include hidden files when requested', async () => {
      await writeFile(join(tempDir, '.hidden'), 'content')
      await writeFile(join(tempDir, 'visible.txt'), 'content')

      const files = await fs.listDirectory(tempDir, { includeHidden: true })

      expect(files).toHaveLength(2)
    })

    it('should create directory', async () => {
      const dirPath = join(tempDir, 'new/nested/dir')
      await fs.createDirectory(dirPath)

      const files = await fs.listDirectory(dirPath)
      expect(files).toHaveLength(0)
    })
  })

  describe('Search operations', () => {
    beforeEach(async () => {
      // Create test structure
      await writeFile(join(tempDir, 'file1.ts'), 'typescript')
      await writeFile(join(tempDir, 'file2.js'), 'javascript')
      await writeFile(join(tempDir, 'file3.txt'), 'text')
      await mkdir(join(tempDir, 'subdir'))
      await writeFile(join(tempDir, 'subdir', 'file4.ts'), 'typescript')
    })

    it('should search by glob pattern', async () => {
      const results = await fs.searchFiles(tempDir, '*.ts')

      expect(results.length).toBeGreaterThanOrEqual(1)
      expect(results.every(f => f.name.endsWith('.ts'))).toBe(true)
    })

    it('should search recursively', async () => {
      const results = await fs.searchFiles(tempDir, '**/*.ts')

      expect(results).toHaveLength(2)
    })

    it('should limit results', async () => {
      const results = await fs.searchFiles(tempDir, '*.*', { maxResults: 2 })

      expect(results).toHaveLength(2)
    })
  })

  describe('File metadata', () => {
    it('should get file info', async () => {
      const filePath = join(tempDir, 'test.txt')
      await writeFile(filePath, 'content')

      const info = await fs.getFileInfo(filePath)

      expect(info.name).toBe('test.txt')
      expect(info.isFile).toBe(true)
      expect(info.isDirectory).toBe(false)
      expect(info.size).toBeGreaterThan(0)
      expect(info.extension).toBe('.txt')
      expect(info.created).toBeInstanceOf(Date)
      expect(info.modified).toBeInstanceOf(Date)
    })

    it('should check file existence', async () => {
      const filePath = join(tempDir, 'exists.txt')
      await writeFile(filePath, 'content')

      expect(await fs.exists(filePath)).toBe(true)
      expect(await fs.exists(join(tempDir, 'notexists.txt'))).toBe(false)
    })
  })

  describe('File operations', () => {
    it('should copy file', async () => {
      const source = join(tempDir, 'source.txt')
      const dest = join(tempDir, 'dest.txt')
      await writeFile(source, 'content')

      await fs.copyFile(source, dest)

      expect(await fs.exists(dest)).toBe(true)
      expect(await readFile(dest, 'utf-8')).toBe('content')
    })

    it('should move file', async () => {
      const source = join(tempDir, 'source.txt')
      const dest = join(tempDir, 'dest.txt')
      await writeFile(source, 'content')

      await fs.moveFile(source, dest)

      expect(await fs.exists(source)).toBe(false)
      expect(await fs.exists(dest)).toBe(true)
      expect(await readFile(dest, 'utf-8')).toBe('content')
    })

    it('should delete file', async () => {
      const filePath = join(tempDir, 'delete.txt')
      await writeFile(filePath, 'content')

      await fs.deleteFile(filePath, { backup: false })

      expect(await fs.exists(filePath)).toBe(false)
    })
  })

  describe('Compression', () => {
    it('should compress file', async () => {
      const source = join(tempDir, 'source.txt')
      await writeFile(source, 'content to compress')

      const compressed = await fs.compressFile(source)

      expect(compressed).toBe(source + '.gz')
      expect(await fs.exists(compressed)).toBe(true)
    })

    it('should decompress file', async () => {
      const source = join(tempDir, 'source.txt')
      await writeFile(source, 'content')

      const compressed = await fs.compressFile(source)
      const decompressed = await fs.decompressFile(compressed, join(tempDir, 'decompressed.txt'))

      expect(await fs.exists(decompressed)).toBe(true)
      const content = await readFile(decompressed, 'utf-8')
      expect(content).toBe('content')
    })
  })

  describe('Safety features', () => {
    it('should validate all operations', async () => {
      const outsidePath = '/tmp/outside.txt'

      await expect(fs.readFile(outsidePath)).rejects.toThrow('Access denied')
      await expect(fs.writeFile(outsidePath, 'test')).rejects.toThrow('Access denied')
      await expect(fs.appendFile(outsidePath, 'test')).rejects.toThrow('Access denied')
      await expect(fs.deleteFile(outsidePath)).rejects.toThrow('Access denied')
      await expect(fs.copyFile(join(tempDir, 'test.txt'), outsidePath)).rejects.toThrow('Access denied')
      await expect(fs.moveFile(join(tempDir, 'test.txt'), outsidePath)).rejects.toThrow('Access denied')
    })

    it('should prevent directory traversal', async () => {
      const evilPath = join(tempDir, '../../../etc/passwd')
      await expect(fs.readFile(evilPath)).rejects.toThrow('Access denied')
    })
  })
})
