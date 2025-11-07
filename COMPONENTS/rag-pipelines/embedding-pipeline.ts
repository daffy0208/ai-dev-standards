/**
 * Embedding Pipeline for RAG Systems
 *
 * Generate embeddings for documents using various providers (OpenAI, Cohere, HuggingFace).
 *
 * Features:
 * - Multiple embedding providers
 * - Batch processing
 * - Caching
 * - Rate limiting
 * - Progress tracking
 *
 * @example
 * ```typescript
 * const pipeline = new EmbeddingPipeline({
 *   provider: 'openai',
 *   model: 'text-embedding-3-small',
 *   batchSize: 100
 * })
 *
 * const embeddings = await pipeline.embedDocuments(documents)
 * ```
 */

import { OpenAIEmbeddings } from 'langchain/embeddings/openai'
import { CohereEmbeddings } from 'langchain/embeddings/cohere'
import { HuggingFaceInferenceEmbeddings } from 'langchain/embeddings/hf'
import type { Document } from 'langchain/document'

export type EmbeddingProvider = 'openai' | 'cohere' | 'huggingface'

export interface EmbeddingPipelineOptions {
  provider: EmbeddingProvider
  model?: string
  batchSize?: number
  maxRetries?: number
  cache?: boolean
  onProgress?: (progress: { current: number; total: number }) => void
}

export interface EmbeddedDocument extends Document {
  embedding: number[]
}

export class EmbeddingPipeline {
  private embeddings: OpenAIEmbeddings | CohereEmbeddings | HuggingFaceInferenceEmbeddings
  private options: Required<Omit<EmbeddingPipelineOptions, 'onProgress' | 'model'>> & {
    onProgress?: (progress: { current: number; total: number }) => void
    model?: string
  }
  private cache: Map<string, number[]> = new Map()

  constructor(options: EmbeddingPipelineOptions) {
    this.options = {
      provider: options.provider,
      model: options.model,
      batchSize: options.batchSize || 100,
      maxRetries: options.maxRetries || 3,
      cache: options.cache ?? true,
      onProgress: options.onProgress,
    }

    this.embeddings = this.createEmbeddingsClient()
  }

  /**
   * Create embeddings client based on provider
   */
  private createEmbeddingsClient() {
    switch (this.options.provider) {
      case 'openai':
        return new OpenAIEmbeddings({
          modelName: this.options.model || 'text-embedding-3-small',
          openAIApiKey: process.env.OPENAI_API_KEY,
        })

      case 'cohere':
        return new CohereEmbeddings({
          model: this.options.model || 'embed-english-v3.0',
          apiKey: process.env.COHERE_API_KEY,
        })

      case 'huggingface':
        return new HuggingFaceInferenceEmbeddings({
          model: this.options.model || 'sentence-transformers/all-MiniLM-L6-v2',
          apiKey: process.env.HUGGINGFACE_API_KEY,
        })

      default:
        throw new Error(`Unknown provider: ${this.options.provider}`)
    }
  }

  /**
   * Generate embeddings for multiple documents
   */
  async embedDocuments(documents: Document[]): Promise<EmbeddedDocument[]> {
    const embeddedDocs: EmbeddedDocument[] = []
    const batches = this.createBatches(documents, this.options.batchSize)

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i]
      const batchEmbeddings = await this.embedBatch(batch)

      // Combine documents with their embeddings
      batch.forEach((doc, idx) => {
        embeddedDocs.push({
          ...doc,
          embedding: batchEmbeddings[idx],
        })
      })

      // Report progress
      if (this.options.onProgress) {
        this.options.onProgress({
          current: embeddedDocs.length,
          total: documents.length,
        })
      }
    }

    return embeddedDocs
  }

  /**
   * Generate embedding for a single text
   */
  async embedText(text: string): Promise<number[]> {
    // Check cache
    if (this.options.cache && this.cache.has(text)) {
      return this.cache.get(text)!
    }

    const embedding = await this.embedWithRetry([text])
    const result = embedding[0]

    // Cache result
    if (this.options.cache) {
      this.cache.set(text, result)
    }

    return result
  }

  /**
   * Generate embeddings for a batch of documents
   */
  private async embedBatch(documents: Document[]): Promise<number[][]> {
    const texts = documents.map(doc => doc.pageContent)
    return await this.embedWithRetry(texts)
  }

  /**
   * Embed texts with retry logic
   */
  private async embedWithRetry(
    texts: string[],
    attempt: number = 1
  ): Promise<number[][]> {
    try {
      return await this.embeddings.embedDocuments(texts)
    } catch (error) {
      if (attempt < this.options.maxRetries) {
        // Exponential backoff
        const delay = Math.pow(2, attempt) * 1000
        await this.sleep(delay)
        return this.embedWithRetry(texts, attempt + 1)
      }
      throw error
    }
  }

  /**
   * Create batches from documents
   */
  private createBatches<T>(items: T[], batchSize: number): T[][] {
    const batches: T[][] = []
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize))
    }
    return batches
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear()
  }

  /**
   * Get cache size
   */
  getCacheSize(): number {
    return this.cache.size
  }

  /**
   * Get embedding dimension based on model
   */
  getEmbeddingDimension(): number {
    switch (this.options.provider) {
      case 'openai':
        if (this.options.model === 'text-embedding-3-large') return 3072
        if (this.options.model === 'text-embedding-3-small') return 1536
        return 1536 // default

      case 'cohere':
        return 1024

      case 'huggingface':
        return 384 // default for MiniLM

      default:
        return 1536
    }
  }
}

/**
 * Quick utility to embed documents with default settings
 */
export async function embedDocuments(
  documents: Document[],
  options: EmbeddingPipelineOptions
): Promise<EmbeddedDocument[]> {
  const pipeline = new EmbeddingPipeline(options)
  return await pipeline.embedDocuments(documents)
}

/**
 * Quick utility to embed a single text
 */
export async function embedText(
  text: string,
  options: EmbeddingPipelineOptions
): Promise<number[]> {
  const pipeline = new EmbeddingPipeline(options)
  return await pipeline.embedText(text)
}

/**
 * Cosine similarity between two vectors
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) {
    throw new Error('Vectors must have same length')
  }

  let dotProduct = 0
  let normA = 0
  let normB = 0

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i]
    normA += vecA[i] * vecA[i]
    normB += vecB[i] * vecB[i]
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
}

/**
 * Euclidean distance between two vectors
 */
export function euclideanDistance(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) {
    throw new Error('Vectors must have same length')
  }

  let sumSquares = 0
  for (let i = 0; i < vecA.length; i++) {
    const diff = vecA[i] - vecB[i]
    sumSquares += diff * diff
  }

  return Math.sqrt(sumSquares)
}

/**
 * Dot product between two vectors
 */
export function dotProduct(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) {
    throw new Error('Vectors must have same length')
  }

  let product = 0
  for (let i = 0; i < vecA.length; i++) {
    product += vecA[i] * vecB[i]
  }

  return product
}

/**
 * Normalize a vector to unit length
 */
export function normalizeVector(vec: number[]): number[] {
  const norm = Math.sqrt(vec.reduce((sum, val) => sum + val * val, 0))
  return vec.map(val => val / norm)
}

/**
 * Batch similarity computation
 */
export class SimilarityCalculator {
  /**
   * Compute cosine similarity matrix for a set of vectors
   */
  static computeSimilarityMatrix(vectors: number[][]): number[][] {
    const n = vectors.length
    const matrix: number[][] = Array(n).fill(0).map(() => Array(n).fill(0))

    for (let i = 0; i < n; i++) {
      for (let j = i; j < n; j++) {
        const similarity = cosineSimilarity(vectors[i], vectors[j])
        matrix[i][j] = similarity
        matrix[j][i] = similarity
      }
    }

    return matrix
  }

  /**
   * Find k most similar vectors to a query vector
   */
  static findMostSimilar(
    queryVector: number[],
    vectors: number[][],
    k: number = 5
  ): Array<{ index: number; similarity: number }> {
    const similarities = vectors.map((vec, index) => ({
      index,
      similarity: cosineSimilarity(queryVector, vec)
    }))

    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, k)
  }

  /**
   * Cluster vectors using k-means
   */
  static clusterVectors(
    vectors: number[][],
    k: number,
    maxIterations: number = 100
  ): number[] {
    const n = vectors.length
    const dim = vectors[0].length

    // Initialize centroids randomly
    const centroids: number[][] = []
    const shuffled = [...vectors].sort(() => Math.random() - 0.5)
    for (let i = 0; i < k; i++) {
      centroids.push([...shuffled[i]])
    }

    const labels = new Array(n).fill(0)
    let changed = true
    let iterations = 0

    while (changed && iterations < maxIterations) {
      changed = false
      iterations++

      // Assign vectors to nearest centroid
      for (let i = 0; i < n; i++) {
        let minDist = Infinity
        let bestCluster = 0

        for (let j = 0; j < k; j++) {
          const dist = euclideanDistance(vectors[i], centroids[j])
          if (dist < minDist) {
            minDist = dist
            bestCluster = j
          }
        }

        if (labels[i] !== bestCluster) {
          labels[i] = bestCluster
          changed = true
        }
      }

      // Update centroids
      for (let j = 0; j < k; j++) {
        const clusterVectors = vectors.filter((_, i) => labels[i] === j)
        if (clusterVectors.length > 0) {
          for (let d = 0; d < dim; d++) {
            centroids[j][d] = clusterVectors.reduce((sum, vec) => sum + vec[d], 0) / clusterVectors.length
          }
        }
      }
    }

    return labels
  }
}

/**
 * Embedding cache manager with persistence
 */
export class EmbeddingCacheManager {
  private cache: Map<string, { embedding: number[]; timestamp: number }>
  private maxSize: number
  private ttl: number // Time to live in milliseconds

  constructor(maxSize: number = 10000, ttl: number = 7 * 24 * 60 * 60 * 1000) {
    this.cache = new Map()
    this.maxSize = maxSize
    this.ttl = ttl
  }

  /**
   * Get embedding from cache
   */
  get(text: string): number[] | null {
    const entry = this.cache.get(text)
    if (!entry) return null

    // Check if expired
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(text)
      return null
    }

    return entry.embedding
  }

  /**
   * Set embedding in cache
   */
  set(text: string, embedding: number[]): void {
    // Evict oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      const oldest = Array.from(this.cache.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp)[0]
      this.cache.delete(oldest[0])
    }

    this.cache.set(text, {
      embedding,
      timestamp: Date.now()
    })
  }

  /**
   * Clear cache
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number
    maxSize: number
    hitRate: number
  } {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: 0 // Could track hits/misses for accurate rate
    }
  }

  /**
   * Export cache to JSON
   */
  export(): string {
    const entries = Array.from(this.cache.entries())
    return JSON.stringify(entries)
  }

  /**
   * Import cache from JSON
   */
  import(json: string): void {
    try {
      const entries = JSON.parse(json)
      this.cache = new Map(entries)
    } catch (error) {
      console.error('Failed to import cache:', error)
    }
  }

  /**
   * Clean expired entries
   */
  cleanExpired(): number {
    const now = Date.now()
    let cleaned = 0

    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.ttl) {
        this.cache.delete(key)
        cleaned++
      }
    }

    return cleaned
  }
}
