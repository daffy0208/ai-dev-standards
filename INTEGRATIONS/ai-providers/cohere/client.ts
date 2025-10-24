/**
 * Cohere API Client
 *
 * Complete Cohere integration for embeddings, reranking, and classification.
 *
 * Features:
 * - Text embeddings (multiple models)
 * - Reranking for retrieval
 * - Text classification
 * - Semantic search
 * - Batch processing
 * - Clustering
 *
 * @example
 * ```typescript
 * const client = new CohereClient({
 *   apiKey: process.env.COHERE_API_KEY
 * })
 *
 * // Generate embeddings
 * const embeddings = await client.embed({
 *   texts: ['Hello world', 'Another document'],
 *   model: 'embed-english-v3.0',
 *   inputType: 'search_document'
 * })
 *
 * // Rerank search results
 * const reranked = await client.rerank({
 *   query: 'What is machine learning?',
 *   documents: searchResults,
 *   topN: 5
 * })
 * ```
 */

import { CohereClient as CohereSdk } from 'cohere-ai'

export type EmbeddingModel =
  | 'embed-english-v3.0'
  | 'embed-multilingual-v3.0'
  | 'embed-english-light-v3.0'
  | 'embed-multilingual-light-v3.0'
  | 'embed-english-v2.0'
  | 'embed-english-light-v2.0'

export type InputType =
  | 'search_document'
  | 'search_query'
  | 'classification'
  | 'clustering'

export interface CohereClientOptions {
  /**
   * Cohere API key
   */
  apiKey?: string

  /**
   * Request timeout in ms
   */
  timeout?: number
}

export interface EmbedOptions {
  /**
   * Text inputs to embed
   */
  texts: string[]

  /**
   * Embedding model
   */
  model?: EmbeddingModel

  /**
   * Input type for optimization
   */
  inputType?: InputType

  /**
   * Truncate long texts
   */
  truncate?: 'NONE' | 'START' | 'END'
}

export interface EmbedResponse {
  embeddings: number[][]
  texts: string[]
  model: string
}

export interface RerankOptions {
  /**
   * Search query
   */
  query: string

  /**
   * Documents to rerank
   */
  documents: Array<string | { text: string; [key: string]: any }>

  /**
   * Number of top results to return
   */
  topN?: number

  /**
   * Rerank model
   */
  model?: 'rerank-english-v2.0' | 'rerank-multilingual-v2.0'

  /**
   * Maximum chunks per document
   */
  maxChunksPerDoc?: number

  /**
   * Return documents in response
   */
  returnDocuments?: boolean
}

export interface RerankResult {
  index: number
  relevanceScore: number
  document?: string | object
}

export interface RerankResponse {
  results: RerankResult[]
  meta: {
    apiVersion: { version: string }
  }
}

export interface ClassifyOptions {
  /**
   * Texts to classify
   */
  inputs: string[]

  /**
   * Example classifications
   */
  examples: Array<{
    text: string
    label: string
  }>

  /**
   * Model to use
   */
  model?: 'embed-english-v2.0' | 'embed-multilingual-v2.0'

  /**
   * Truncate strategy
   */
  truncate?: 'NONE' | 'START' | 'END'
}

export interface ClassifyResult {
  input: string
  prediction: string
  confidence: number
  labels: Record<string, { confidence: number }>
}

export interface ClassifyResponse {
  classifications: ClassifyResult[]
}

export class CohereClient {
  private client: CohereSdk
  private options: Required<CohereClientOptions>

  constructor(options: CohereClientOptions = {}) {
    this.options = {
      apiKey: options.apiKey || process.env.COHERE_API_KEY || '',
      timeout: options.timeout || 30000,
    }

    if (!this.options.apiKey) {
      throw new Error('Cohere API key is required')
    }

    this.client = new CohereSdk({
      token: this.options.apiKey,
    })
  }

  /**
   * Generate embeddings for texts
   */
  async embed(options: EmbedOptions): Promise<EmbedResponse> {
    const response = await this.client.embed({
      texts: options.texts,
      model: options.model || 'embed-english-v3.0',
      inputType: options.inputType || 'search_document',
      truncate: options.truncate || 'END',
    })

    return {
      embeddings: response.embeddings,
      texts: options.texts,
      model: options.model || 'embed-english-v3.0',
    }
  }

  /**
   * Rerank documents by relevance to query
   */
  async rerank(options: RerankOptions): Promise<RerankResponse> {
    const response = await this.client.rerank({
      query: options.query,
      documents: options.documents,
      topN: options.topN,
      model: options.model || 'rerank-english-v2.0',
      maxChunksPerDoc: options.maxChunksPerDoc,
      returnDocuments: options.returnDocuments ?? true,
    })

    return {
      results: response.results.map((result) => ({
        index: result.index,
        relevanceScore: result.relevanceScore,
        document: result.document,
      })),
      meta: response.meta,
    }
  }

  /**
   * Classify texts using examples
   */
  async classify(options: ClassifyOptions): Promise<ClassifyResponse> {
    const response = await this.client.classify({
      inputs: options.inputs,
      examples: options.examples,
      model: options.model,
      truncate: options.truncate || 'END',
    })

    return {
      classifications: response.classifications.map((classification) => ({
        input: classification.input,
        prediction: classification.prediction,
        confidence: classification.confidence,
        labels: classification.labels || {},
      })),
    }
  }

  /**
   * Calculate semantic similarity between texts
   */
  async semanticSimilarity(
    text1: string,
    text2: string,
    options?: { model?: EmbeddingModel }
  ): Promise<number> {
    const embedResponse = await this.embed({
      texts: [text1, text2],
      model: options?.model || 'embed-english-v3.0',
      inputType: 'clustering',
    })

    const [embedding1, embedding2] = embedResponse.embeddings

    // Calculate cosine similarity
    return this.cosineSimilarity(embedding1, embedding2)
  }

  /**
   * Batch embed with automatic chunking
   */
  async embedBatch(
    texts: string[],
    options?: {
      model?: EmbeddingModel
      inputType?: InputType
      batchSize?: number
      onProgress?: (current: number, total: number) => void
    }
  ): Promise<number[][]> {
    const batchSize = options?.batchSize || 96 // Cohere limit
    const allEmbeddings: number[][] = []

    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize)

      const response = await this.embed({
        texts: batch,
        model: options?.model,
        inputType: options?.inputType,
      })

      allEmbeddings.push(...response.embeddings)

      options?.onProgress?.(Math.min(i + batchSize, texts.length), texts.length)
    }

    return allEmbeddings
  }

  /**
   * Cluster texts by semantic similarity
   */
  async cluster(
    texts: string[],
    options?: {
      numClusters?: number
      model?: EmbeddingModel
    }
  ): Promise<number[]> {
    // Generate embeddings
    const embeddings = await this.embedBatch(texts, {
      model: options?.model,
      inputType: 'clustering',
    })

    // Simple k-means clustering
    const numClusters = options?.numClusters || Math.ceil(Math.sqrt(texts.length / 2))
    return this.kMeans(embeddings, numClusters)
  }

  /**
   * Find most similar texts
   */
  async findSimilar(
    query: string,
    texts: string[],
    options?: {
      topK?: number
      model?: EmbeddingModel
    }
  ): Promise<Array<{ text: string; score: number; index: number }>> {
    // Generate embeddings
    const allTexts = [query, ...texts]
    const embeddings = await this.embedBatch(allTexts, {
      model: options?.model,
      inputType: 'search_query',
    })

    const queryEmbedding = embeddings[0]
    const textEmbeddings = embeddings.slice(1)

    // Calculate similarities
    const similarities = textEmbeddings.map((embedding, index) => ({
      text: texts[index],
      score: this.cosineSimilarity(queryEmbedding, embedding),
      index,
    }))

    // Sort by score descending
    similarities.sort((a, b) => b.score - a.score)

    // Return top K
    const topK = options?.topK || 10
    return similarities.slice(0, topK)
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  private cosineSimilarity(a: number[], b: number[]): number {
    let dotProduct = 0
    let normA = 0
    let normB = 0

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i]
      normA += a[i] * a[i]
      normB += b[i] * b[i]
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
  }

  /**
   * Simple k-means clustering
   */
  private kMeans(embeddings: number[][], k: number): number[] {
    // Initialize centroids randomly
    const centroids: number[][] = []
    const used = new Set<number>()

    for (let i = 0; i < k; i++) {
      let idx: number
      do {
        idx = Math.floor(Math.random() * embeddings.length)
      } while (used.has(idx))
      used.add(idx)
      centroids.push([...embeddings[idx]])
    }

    // Assign points to clusters
    const assignments: number[] = new Array(embeddings.length)
    let changed = true
    let iterations = 0
    const maxIterations = 100

    while (changed && iterations < maxIterations) {
      changed = false
      iterations++

      // Assign each point to nearest centroid
      for (let i = 0; i < embeddings.length; i++) {
        let minDist = Infinity
        let minIdx = 0

        for (let j = 0; j < k; j++) {
          const dist = 1 - this.cosineSimilarity(embeddings[i], centroids[j])
          if (dist < minDist) {
            minDist = dist
            minIdx = j
          }
        }

        if (assignments[i] !== minIdx) {
          changed = true
          assignments[i] = minIdx
        }
      }

      // Update centroids
      if (changed) {
        for (let j = 0; j < k; j++) {
          const clusterPoints = embeddings.filter((_, i) => assignments[i] === j)

          if (clusterPoints.length > 0) {
            // Calculate mean
            const dims = clusterPoints[0].length
            const newCentroid = new Array(dims).fill(0)

            for (const point of clusterPoints) {
              for (let d = 0; d < dims; d++) {
                newCentroid[d] += point[d]
              }
            }

            for (let d = 0; d < dims; d++) {
              newCentroid[d] /= clusterPoints.length
            }

            centroids[j] = newCentroid
          }
        }
      }
    }

    return assignments
  }
}

/**
 * Create Cohere client from environment variables
 */
export function createCohereClient(options: CohereClientOptions = {}): CohereClient {
  return new CohereClient(options)
}
