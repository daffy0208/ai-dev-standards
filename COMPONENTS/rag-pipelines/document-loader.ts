/**
 * Document Loader for RAG Pipelines
 *
 * Load and process documents from various sources for RAG (Retrieval-Augmented Generation) systems.
 *
 * Supported formats:
 * - PDF (.pdf)
 * - Text (.txt, .md)
 * - JSON (.json)
 * - CSV (.csv)
 * - DOCX (.docx)
 * - Web pages (URLs)
 *
 * @example
 * ```typescript
 * const loader = new DocumentLoader()
 *
 * // Load from file
 * const docs = await loader.loadFile('./data/document.pdf')
 *
 * // Load from directory
 * const allDocs = await loader.loadDirectory('./data')
 *
 * // Load from URL
 * const webDocs = await loader.loadUrl('https://example.com/article')
 * ```
 */

import { readFile, readdir } from 'fs/promises'
import { join, extname } from 'path'
import { PDFLoader } from 'langchain/document_loaders/fs/pdf'
import { TextLoader } from 'langchain/document_loaders/fs/text'
import { JSONLoader } from 'langchain/document_loaders/fs/json'
import { CSVLoader } from 'langchain/document_loaders/fs/csv'
import { DocxLoader } from 'langchain/document_loaders/fs/docx'
import { CheerioWebBaseLoader } from 'langchain/document_loaders/web/cheerio'
import type { Document } from 'langchain/document'

export interface LoaderOptions {
  /**
   * Maximum file size in bytes (default: 10MB)
   */
  maxFileSize?: number

  /**
   * File extensions to include (default: all supported)
   */
  includeExtensions?: string[]

  /**
   * File extensions to exclude
   */
  excludeExtensions?: string[]

  /**
   * Metadata to add to all documents
   */
  metadata?: Record<string, any>

  /**
   * Whether to recursively load directories
   */
  recursive?: boolean
}

export class DocumentLoader {
  private readonly DEFAULT_MAX_SIZE = 10 * 1024 * 1024 // 10MB
  private readonly SUPPORTED_EXTENSIONS = [
    '.pdf',
    '.txt',
    '.md',
    '.json',
    '.csv',
    '.docx',
  ]

  /**
   * Load a single file
   */
  async loadFile(
    filePath: string,
    options: LoaderOptions = {}
  ): Promise<Document[]> {
    const ext = extname(filePath).toLowerCase()

    if (!this.isSupported Ext(ext, options)) {
      throw new Error(`Unsupported file type: ${ext}`)
    }

    // Check file size
    const stats = await this.getFileStats(filePath)
    const maxSize = options.maxFileSize || this.DEFAULT_MAX_SIZE
    if (stats.size > maxSize) {
      throw new Error(
        `File too large: ${stats.size} bytes (max: ${maxSize} bytes)`
      )
    }

    // Load document based on type
    const docs = await this.loadByExtension(filePath, ext)

    // Add metadata
    if (options.metadata) {
      docs.forEach(doc => {
        doc.metadata = { ...doc.metadata, ...options.metadata }
      })
    }

    return docs
  }

  /**
   * Load all files from a directory
   */
  async loadDirectory(
    dirPath: string,
    options: LoaderOptions = {}
  ): Promise<Document[]> {
    const files = await this.getFiles(dirPath, options.recursive)
    const allDocs: Document[] = []

    for (const file of files) {
      try {
        const docs = await this.loadFile(file, options)
        allDocs.push(...docs)
      } catch (error) {
        console.error(`Failed to load ${file}:`, error)
        // Continue with other files
      }
    }

    return allDocs
  }

  /**
   * Load document from URL
   */
  async loadUrl(
    url: string,
    options: LoaderOptions = {}
  ): Promise<Document[]> {
    const loader = new CheerioWebBaseLoader(url)
    const docs = await loader.load()

    // Add metadata
    if (options.metadata) {
      docs.forEach(doc => {
        doc.metadata = { ...doc.metadata, ...options.metadata, source_url: url }
      })
    }

    return docs
  }

  /**
   * Load multiple URLs
   */
  async loadUrls(
    urls: string[],
    options: LoaderOptions = {}
  ): Promise<Document[]> {
    const allDocs: Document[] = []

    for (const url of urls) {
      try {
        const docs = await this.loadUrl(url, options)
        allDocs.push(...docs)
      } catch (error) {
        console.error(`Failed to load ${url}:`, error)
        // Continue with other URLs
      }
    }

    return allDocs
  }

  /**
   * Load document based on file extension
   */
  private async loadByExtension(
    filePath: string,
    ext: string
  ): Promise<Document[]> {
    switch (ext) {
      case '.pdf':
        return await new PDFLoader(filePath).load()

      case '.txt':
      case '.md':
        return await new TextLoader(filePath).load()

      case '.json':
        return await new JSONLoader(filePath).load()

      case '.csv':
        return await new CSVLoader(filePath).load()

      case '.docx':
        return await new DocxLoader(filePath).load()

      default:
        throw new Error(`Unsupported extension: ${ext}`)
    }
  }

  /**
   * Get all files in directory (optionally recursive)
   */
  private async getFiles(
    dirPath: string,
    recursive: boolean = false
  ): Promise<string[]> {
    const entries = await readdir(dirPath, { withFileTypes: true })
    const files: string[] = []

    for (const entry of entries) {
      const fullPath = join(dirPath, entry.name)

      if (entry.isDirectory() && recursive) {
        const subFiles = await this.getFiles(fullPath, recursive)
        files.push(...subFiles)
      } else if (entry.isFile()) {
        files.push(fullPath)
      }
    }

    return files
  }

  /**
   * Check if extension is supported
   */
  private isSupportedExt(ext: string, options: LoaderOptions): boolean {
    // Check exclude list
    if (options.excludeExtensions?.includes(ext)) {
      return false
    }

    // Check include list or default supported
    const allowedExts = options.includeExtensions || this.SUPPORTED_EXTENSIONS
    return allowedExts.includes(ext)
  }

  /**
   * Get file statistics
   */
  private async getFileStats(filePath: string) {
    const { stat } = await import('fs/promises')
    return await stat(filePath)
  }
}

/**
 * Utility function to quickly load documents
 */
export async function loadDocuments(
  source: string | string[],
  options: LoaderOptions = {}
): Promise<Document[]> {
  const loader = new DocumentLoader()

  if (Array.isArray(source)) {
    // Multiple URLs
    if (source.every(s => s.startsWith('http'))) {
      return await loader.loadUrls(source, options)
    }
    // Multiple files
    const allDocs: Document[] = []
    for (const path of source) {
      const docs = await loader.loadFile(path, options)
      allDocs.push(...docs)
    }
    return allDocs
  }

  // Single source
  if (source.startsWith('http')) {
    return await loader.loadUrl(source, options)
  }

  // Check if directory or file
  const { stat } = await import('fs/promises')
  const stats = await stat(source)

  if (stats.isDirectory()) {
    return await loader.loadDirectory(source, options)
  }

  return await loader.loadFile(source, options)
}
