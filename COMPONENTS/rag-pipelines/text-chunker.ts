/**
 * Text Chunker for RAG Pipelines
 *
 * Split documents into optimal chunks for embedding and retrieval.
 *
 * Strategies:
 * - Fixed size chunking (simple, fast)
 * - Recursive chunking (respects structure)
 * - Semantic chunking (AI-powered boundaries)
 * - Markdown-aware chunking (preserves headers)
 *
 * @example
 * ```typescript
 * const chunker = new TextChunker({
 *   chunkSize: 1000,
 *   chunkOverlap: 200,
 *   strategy: 'recursive'
 * })
 *
 * const chunks = await chunker.chunkText(document.pageContent, {
 *   metadata: document.metadata
 * })
 * ```
 */

import type { Document } from 'langchain/document'
import {
  RecursiveCharacterTextSplitter,
  CharacterTextSplitter,
  MarkdownTextSplitter,
  TokenTextSplitter,
} from 'langchain/text_splitter'

export type ChunkStrategy =
  | 'fixed'
  | 'recursive'
  | 'markdown'
  | 'token'
  | 'semantic'

export interface ChunkerOptions {
  /**
   * Target chunk size in characters (or tokens for 'token' strategy)
   */
  chunkSize?: number

  /**
   * Overlap between chunks to maintain context
   */
  chunkOverlap?: number

  /**
   * Chunking strategy
   */
  strategy?: ChunkStrategy

  /**
   * Separators for recursive chunking (in priority order)
   */
  separators?: string[]

  /**
   * Keep separator in chunks
   */
  keepSeparator?: boolean

  /**
   * Metadata to add to all chunks
   */
  metadata?: Record<string, any>
}

export interface ChunkResult {
  /**
   * Chunked text content
   */
  text: string

  /**
   * Chunk metadata
   */
  metadata: {
    chunk_index: number
    chunk_count: number
    char_count: number
    [key: string]: any
  }
}

export class TextChunker {
  private readonly DEFAULT_CHUNK_SIZE = 1000
  private readonly DEFAULT_CHUNK_OVERLAP = 200

  private options: Required<Omit<ChunkerOptions, 'metadata'>> & {
    metadata?: Record<string, any>
  }

  constructor(options: ChunkerOptions = {}) {
    this.options = {
      chunkSize: options.chunkSize || this.DEFAULT_CHUNK_SIZE,
      chunkOverlap: options.chunkOverlap || this.DEFAULT_CHUNK_OVERLAP,
      strategy: options.strategy || 'recursive',
      separators: options.separators || ['\n\n', '\n', '. ', ' ', ''],
      keepSeparator: options.keepSeparator ?? false,
      metadata: options.metadata,
    }
  }

  /**
   * Chunk a single text string
   */
  async chunkText(
    text: string,
    options: { metadata?: Record<string, any> } = {}
  ): Promise<ChunkResult[]> {
    const splitter = this.getSplitter()
    const chunks = await splitter.splitText(text)

    return chunks.map((chunk, index) => ({
      text: chunk,
      metadata: {
        ...this.options.metadata,
        ...options.metadata,
        chunk_index: index,
        chunk_count: chunks.length,
        char_count: chunk.length,
      },
    }))
  }

  /**
   * Chunk multiple documents
   */
  async chunkDocuments(documents: Document[]): Promise<Document[]> {
    const allChunks: Document[] = []

    for (const doc of documents) {
      const splitter = this.getSplitter()
      const chunks = await splitter.splitDocuments([doc])

      // Add chunk metadata
      chunks.forEach((chunk, index) => {
        chunk.metadata = {
          ...chunk.metadata,
          chunk_index: index,
          chunk_count: chunks.length,
          char_count: chunk.pageContent.length,
        }
      })

      allChunks.push(...chunks)
    }

    return allChunks
  }

  /**
   * Chunk with custom separator
   */
  async chunkBySeparator(
    text: string,
    separator: string,
    options: { metadata?: Record<string, any> } = {}
  ): Promise<ChunkResult[]> {
    const splitter = new CharacterTextSplitter({
      separator,
      chunkSize: this.options.chunkSize,
      chunkOverlap: this.options.chunkOverlap,
    })

    const chunks = await splitter.splitText(text)

    return chunks.map((chunk, index) => ({
      text: chunk,
      metadata: {
        ...this.options.metadata,
        ...options.metadata,
        chunk_index: index,
        chunk_count: chunks.length,
        char_count: chunk.length,
        separator,
      },
    }))
  }

  /**
   * Chunk markdown while preserving structure
   */
  async chunkMarkdown(
    markdownText: string,
    options: { metadata?: Record<string, any> } = {}
  ): Promise<ChunkResult[]> {
    const splitter = new MarkdownTextSplitter({
      chunkSize: this.options.chunkSize,
      chunkOverlap: this.options.chunkOverlap,
    })

    const chunks = await splitter.splitText(markdownText)

    return chunks.map((chunk, index) => ({
      text: chunk,
      metadata: {
        ...this.options.metadata,
        ...options.metadata,
        chunk_index: index,
        chunk_count: chunks.length,
        char_count: chunk.length,
        format: 'markdown',
      },
    }))
  }

  /**
   * Chunk by token count (useful for LLM context limits)
   */
  async chunkByTokens(
    text: string,
    options: {
      metadata?: Record<string, any>
      encodingName?: 'gpt2' | 'cl100k_base' | 'p50k_base' | 'r50k_base'
    } = {}
  ): Promise<ChunkResult[]> {
    const splitter = new TokenTextSplitter({
      chunkSize: this.options.chunkSize,
      chunkOverlap: this.options.chunkOverlap,
      encodingName: options.encodingName || 'cl100k_base',
    })

    const chunks = await splitter.splitText(text)

    return chunks.map((chunk, index) => ({
      text: chunk,
      metadata: {
        ...this.options.metadata,
        ...options.metadata,
        chunk_index: index,
        chunk_count: chunks.length,
        char_count: chunk.length,
        chunking_method: 'token',
      },
    }))
  }

  /**
   * Get the appropriate text splitter based on strategy
   */
  private getSplitter():
    | RecursiveCharacterTextSplitter
    | CharacterTextSplitter
    | MarkdownTextSplitter
    | TokenTextSplitter {
    switch (this.options.strategy) {
      case 'fixed':
        return new CharacterTextSplitter({
          separator: ' ',
          chunkSize: this.options.chunkSize,
          chunkOverlap: this.options.chunkOverlap,
        })

      case 'recursive':
        return new RecursiveCharacterTextSplitter({
          separators: this.options.separators,
          chunkSize: this.options.chunkSize,
          chunkOverlap: this.options.chunkOverlap,
          keepSeparator: this.options.keepSeparator,
        })

      case 'markdown':
        return new MarkdownTextSplitter({
          chunkSize: this.options.chunkSize,
          chunkOverlap: this.options.chunkOverlap,
        })

      case 'token':
        return new TokenTextSplitter({
          chunkSize: this.options.chunkSize,
          chunkOverlap: this.options.chunkOverlap,
        })

      case 'semantic':
        // For semantic chunking, use recursive as fallback
        // In production, you would use an AI model to determine boundaries
        return new RecursiveCharacterTextSplitter({
          separators: ['\n\n', '\n', '. ', ' ', ''],
          chunkSize: this.options.chunkSize,
          chunkOverlap: this.options.chunkOverlap,
        })

      default:
        throw new Error(`Unknown chunking strategy: ${this.options.strategy}`)
    }
  }

  /**
   * Estimate optimal chunk size based on content
   */
  static estimateOptimalChunkSize(text: string): number {
    const length = text.length

    // Heuristics for optimal chunk size
    if (length < 5000) {
      return 500 // Small documents: smaller chunks
    } else if (length < 20000) {
      return 1000 // Medium documents: standard chunks
    } else if (length < 100000) {
      return 1500 // Large documents: larger chunks
    } else {
      return 2000 // Very large documents: maximum chunks
    }
  }

  /**
   * Calculate recommended overlap based on chunk size
   */
  static calculateOverlap(chunkSize: number): number {
    // Typically 10-20% overlap is recommended
    return Math.floor(chunkSize * 0.15)
  }
}

/**
 * Quick utility to chunk text with default settings
 */
export async function chunkText(
  text: string,
  options: ChunkerOptions = {}
): Promise<ChunkResult[]> {
  const chunker = new TextChunker(options)
  return await chunker.chunkText(text)
}

/**
 * Quick utility to chunk documents with default settings
 */
export async function chunkDocuments(
  documents: Document[],
  options: ChunkerOptions = {}
): Promise<Document[]> {
  const chunker = new TextChunker(options)
  return await chunker.chunkDocuments(documents)
}

/**
 * Advanced chunking utilities
 */
export class ChunkingUtils {
  /**
   * Analyze text to recommend optimal chunk size
   */
  static analyzeText(text: string): {
    recommendedChunkSize: number
    recommendedOverlap: number
    strategy: ChunkStrategy
    stats: {
      totalChars: number
      totalWords: number
      avgSentenceLength: number
      paragraphCount: number
    }
  } {
    const totalChars = text.length
    const words = text.split(/\s+/).filter(w => w.length > 0)
    const totalWords = words.length
    const sentences = text.match(/[^.!?]+[.!?]+/g) || []
    const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 0)

    const avgSentenceLength = sentences.length > 0
      ? totalChars / sentences.length
      : totalChars

    let strategy: ChunkStrategy = 'recursive'
    let recommendedChunkSize = 1000

    // Determine strategy based on content structure
    if (text.includes('#') || text.includes('##')) {
      strategy = 'markdown'
      recommendedChunkSize = 1500
    } else if (avgSentenceLength > 200) {
      strategy = 'fixed'
      recommendedChunkSize = 800
    } else if (paragraphs.length > 10) {
      strategy = 'recursive'
      recommendedChunkSize = 1000
    }

    return {
      recommendedChunkSize,
      recommendedOverlap: Math.floor(recommendedChunkSize * 0.15),
      strategy,
      stats: {
        totalChars,
        totalWords,
        avgSentenceLength,
        paragraphCount: paragraphs.length
      }
    }
  }

  /**
   * Validate chunk quality
   */
  static validateChunk(chunk: ChunkResult): {
    valid: boolean
    issues: string[]
    score: number
  } {
    const issues: string[] = []
    let score = 100

    // Check if chunk is too short
    if (chunk.text.length < 50) {
      issues.push('Chunk is too short')
      score -= 30
    }

    // Check if chunk ends mid-sentence
    const lastChar = chunk.text.trim().slice(-1)
    if (!['.', '!', '?', '\n'].includes(lastChar)) {
      issues.push('Chunk ends mid-sentence')
      score -= 20
    }

    // Check if chunk starts mid-sentence
    const firstChar = chunk.text.trim()[0]
    if (firstChar && firstChar !== firstChar.toUpperCase() && firstChar.match(/[a-z]/)) {
      issues.push('Chunk starts mid-sentence')
      score -= 15
    }

    // Check for incomplete code blocks
    const codeBlockCount = (chunk.text.match(/```/g) || []).length
    if (codeBlockCount % 2 !== 0) {
      issues.push('Incomplete code block')
      score -= 25
    }

    return {
      valid: score >= 50,
      issues,
      score: Math.max(0, score)
    }
  }

  /**
   * Merge small chunks
   */
  static mergeSmallChunks(
    chunks: ChunkResult[],
    minSize: number = 100
  ): ChunkResult[] {
    const merged: ChunkResult[] = []
    let current: ChunkResult | null = null

    for (const chunk of chunks) {
      if (!current) {
        current = { ...chunk }
        continue
      }

      if (current.text.length < minSize) {
        // Merge with current
        current = {
          text: current.text + ' ' + chunk.text,
          metadata: {
            ...current.metadata,
            chunk_count: current.metadata.chunk_count + 1,
            char_count: current.text.length + chunk.text.length + 1
          }
        }
      } else {
        merged.push(current)
        current = { ...chunk }
      }
    }

    if (current) {
      merged.push(current)
    }

    return merged
  }
}
