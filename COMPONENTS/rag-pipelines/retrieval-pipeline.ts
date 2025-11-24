/**
 * Retrieval Pipeline for RAG Systems
 *
 * Complete retrieval pipeline with query processing, search, and reranking.
 *
 * Features:
 * - Query expansion
 * - Hybrid search (vector + keyword)
 * - Reranking
 * - Fusion algorithms
 * - Context window management
 *
 * @example
 * ```typescript
 * const pipeline = new RetrievalPipeline({
 *   vectorStore,
 *   searchType: 'hybrid',
 *   topK: 10,
 *   rerank: true
 * })
 *
 * const results = await pipeline.retrieve('What is RAG?')
 * ```
 */

import type { VectorStore } from 'langchain/vectorstores/base'
import type { Document } from 'langchain/document'

export type SearchType = 'vector' | 'keyword' | 'hybrid'
export type FusionMethod = 'rrf' | 'weighted' | 'max'

export interface RetrievalPipelineOptions {
  vectorStore: VectorStore
  searchType?: SearchType
  topK?: number
  rerank?: boolean
  rerankModel?: string
  fusionMethod?: FusionMethod
  expandQuery?: boolean
  filter?: Record<string, any>
}

export interface RetrievalResult {
  documents: Document[]
  scores: number[]
  query: string
  expandedQueries?: string[]
  metadata: {
    searchType: SearchType
    reranked: boolean
    totalResults: number
    retrievalTimeMs: number
  }
}

export class RetrievalPipeline {
  private options: Required<Omit<RetrievalPipelineOptions, 'rerankModel' | 'filter'>> & {
    rerankModel?: string
    filter?: Record<string, any>
  }

  constructor(options: RetrievalPipelineOptions) {
    this.options = {
      vectorStore: options.vectorStore,
      searchType: options.searchType || 'hybrid',
      topK: options.topK || 10,
      rerank: options.rerank ?? true,
      rerankModel: options.rerankModel,
      fusionMethod: options.fusionMethod || 'rrf',
      expandQuery: options.expandQuery ?? false,
      filter: options.filter
    }
  }

  /**
   * Retrieve documents for a query
   */
  async retrieve(query: string): Promise<RetrievalResult> {
    const startTime = Date.now()

    // Expand query if enabled
    const queries = this.options.expandQuery ? await this.expandQuery(query) : [query]

    // Perform search based on type
    let results: Array<[Document, number]>

    switch (this.options.searchType) {
      case 'vector':
        results = await this.vectorSearch(queries[0])
        break

      case 'keyword':
        results = await this.keywordSearch(queries[0])
        break

      case 'hybrid':
        results = await this.hybridSearch(queries)
        break

      default:
        throw new Error(`Unknown search type: ${this.options.searchType}`)
    }

    // Rerank if enabled
    if (this.options.rerank && results.length > 0) {
      results = await this.rerank(query, results)
    }

    // Take top K
    results = results.slice(0, this.options.topK)

    const retrievalTimeMs = Date.now() - startTime

    return {
      documents: results.map(([doc]) => doc),
      scores: results.map(([_, score]) => score),
      query,
      expandedQueries: queries,
      metadata: {
        searchType: this.options.searchType,
        reranked: this.options.rerank,
        totalResults: results.length,
        retrievalTimeMs
      }
    }
  }

  /**
   * Vector similarity search
   */
  private async vectorSearch(query: string): Promise<Array<[Document, number]>> {
    return await this.options.vectorStore.similaritySearchWithScore(
      query,
      this.options.topK * 2, // Get more for reranking
      this.options.filter
    )
  }

  /**
   * Keyword-based search (if supported by vector store)
   */
  private async keywordSearch(query: string): Promise<Array<[Document, number]>> {
    // Note: This is a placeholder - actual implementation depends on vector store
    // Many vector stores support metadata filtering for keyword search
    const results = await this.options.vectorStore.similaritySearchWithScore(
      query,
      this.options.topK * 2,
      this.options.filter
    )

    // Simple keyword matching score
    const keywords = query.toLowerCase().split(' ')
    return results.map(([doc, score]): [Document, number] => {
      const content = doc.pageContent.toLowerCase()
      const keywordScore = keywords.filter(kw => content.includes(kw)).length / keywords.length
      return [doc, keywordScore]
    })
  }

  /**
   * Hybrid search combining vector and keyword
   */
  private async hybridSearch(queries: string[]): Promise<Array<[Document, number]>> {
    const allResults: Map<string, { doc: Document; scores: number[] }> = new Map()

    // Perform vector search for each query
    for (const query of queries) {
      const vectorResults = await this.vectorSearch(query)
      const keywordResults = await this.keywordSearch(query)

      // Combine results
      for (const [doc, vectorScore] of vectorResults) {
        const key = doc.pageContent
        if (!allResults.has(key)) {
          allResults.set(key, { doc, scores: [] })
        }
        allResults.get(key)!.scores.push(vectorScore)
      }

      for (const [doc, keywordScore] of keywordResults) {
        const key = doc.pageContent
        if (!allResults.has(key)) {
          allResults.set(key, { doc, scores: [] })
        }
        allResults.get(key)!.scores.push(keywordScore)
      }
    }

    // Apply fusion method
    const fusedResults: Array<[Document, number]> = []

    for (const [_, { doc, scores }] of allResults) {
      const fusedScore = this.fuseScores(scores)
      fusedResults.push([doc, fusedScore])
    }

    // Sort by fused score
    fusedResults.sort((a, b) => b[1] - a[1])

    return fusedResults
  }

  /**
   * Fuse multiple scores using selected method
   */
  private fuseScores(scores: number[]): number {
    switch (this.options.fusionMethod) {
      case 'rrf':
        // Reciprocal Rank Fusion
        return scores.reduce((sum, score) => sum + 1 / (60 + score), 0)

      case 'weighted':
        // Weighted average
        return scores.reduce((sum, score) => sum + score, 0) / scores.length

      case 'max':
        // Maximum score
        return Math.max(...scores)

      default:
        return scores[0] || 0
    }
  }

  /**
   * Expand query with synonyms and related terms
   */
  private async expandQuery(query: string): Promise<string[]> {
    // This is a simple implementation
    // In production, use LLM or synonym dictionary
    const queries = [query]

    // Add variations (simple example)
    const words = query.split(' ')
    if (words.length > 1) {
      // Add query without last word
      queries.push(words.slice(0, -1).join(' '))
      // Add query without first word
      queries.push(words.slice(1).join(' '))
    }

    return queries
  }

  /**
   * Rerank results using a reranking model
   */
  private async rerank(
    query: string,
    results: Array<[Document, number]>
  ): Promise<Array<[Document, number]>> {
    // This is a placeholder - implement with actual reranking model
    // Popular options: Cohere Rerank API, Cross-encoder models

    // For now, just return sorted by original score
    return results.sort((a, b) => b[1] - a[1])
  }

  /**
   * Get context window for documents
   */
  static getContextWindow(documents: Document[], maxTokens: number = 4000): Document[] {
    const contextDocs: Document[] = []
    let totalTokens = 0

    for (const doc of documents) {
      // Rough token estimation (4 chars ≈ 1 token)
      const docTokens = Math.ceil(doc.pageContent.length / 4)

      if (totalTokens + docTokens > maxTokens) {
        break
      }

      contextDocs.push(doc)
      totalTokens += docTokens
    }

    return contextDocs
  }

  /**
   * Format documents as context string
   */
  static formatContext(documents: Document[]): string {
    return documents
      .map((doc, index) => {
        const source = doc.metadata.source || 'Unknown'
        return [`Document ${index + 1}:`, `Source: ${source}`, doc.pageContent, '---'].join('\n')
      })
      .join('\n\n')
  }
}

/**
 * Quick utility for retrieval
 */
export async function retrieve(
  query: string,
  vectorStore: VectorStore,
  options: Omit<RetrievalPipelineOptions, 'vectorStore'> = {}
): Promise<RetrievalResult> {
  const pipeline = new RetrievalPipeline({
    vectorStore,
    ...options
  })

  return await pipeline.retrieve(query)
}

/**
 * Query rewriter for better retrieval
 */
export class QueryRewriter {
  /**
   * Expand query with synonyms
   */
  static expandWithSynonyms(query: string): string[] {
    // This is a placeholder - in production use a proper synonym dictionary or LLM
    const queries = [query]

    const synonymMap: Record<string, string[]> = {
      implement: ['build', 'create', 'develop'],
      fix: ['repair', 'resolve', 'correct'],
      optimize: ['improve', 'enhance', 'speedup'],
      documentation: ['docs', 'guide', 'manual']
    }

    for (const [word, synonyms] of Object.entries(synonymMap)) {
      if (query.toLowerCase().includes(word)) {
        synonyms.forEach(synonym => {
          queries.push(query.replace(new RegExp(word, 'gi'), synonym))
        })
      }
    }

    return queries
  }

  /**
   * Generate hypothetical document for HyDE (Hypothetical Document Embeddings)
   */
  static async generateHypotheticalDocument(query: string): Promise<string> {
    // This would use an LLM to generate a hypothetical answer
    // For now, return a template
    return `This document explains ${query}. It provides detailed information and examples.`
  }

  /**
   * Break down complex query into sub-queries
   */
  static decomposeQuery(query: string): string[] {
    const subQueries: string[] = [query]

    // Split on "and", "or" conjunctions
    const parts = query.split(/\s+(and|or)\s+/i)
    if (parts.length > 1) {
      parts.forEach(part => {
        if (part.toLowerCase() !== 'and' && part.toLowerCase() !== 'or') {
          subQueries.push(part.trim())
        }
      })
    }

    // Extract questions
    const questionPatterns = [/what is [^?]+/gi, /how to [^?]+/gi, /why [^?]+/gi]
    questionPatterns.forEach(pattern => {
      const matches = query.match(pattern)
      if (matches) {
        matches.forEach(match => subQueries.push(match))
      }
    })

    return [...new Set(subQueries)]
  }

  /**
   * Simplify query by removing stop words
   */
  static simplifyQuery(query: string): string {
    const stopWords = new Set([
      'a',
      'an',
      'the',
      'in',
      'on',
      'at',
      'for',
      'to',
      'of',
      'is',
      'are',
      'was',
      'were',
      'be',
      'been',
      'being',
      'have',
      'has',
      'had',
      'do',
      'does',
      'did',
      'will',
      'would',
      'should',
      'could',
      'may',
      'might',
      'can'
    ])

    return query
      .split(' ')
      .filter(word => !stopWords.has(word.toLowerCase()))
      .join(' ')
  }
}

/**
 * Result reranker
 */
export class ResultReranker {
  /**
   * Rerank by keyword matching
   */
  static rerankByKeywords(
    query: string,
    results: Array<[Document, number]>
  ): Array<[Document, number]> {
    const keywords = query.toLowerCase().split(' ')

    return results
      .map(([doc, score]) => {
        const content = doc.pageContent.toLowerCase()
        let keywordScore = 0

        keywords.forEach(keyword => {
          const count = (content.match(new RegExp(keyword, 'g')) || []).length
          keywordScore += count
        })

        // Combine original score with keyword score (weighted)
        const combinedScore = score * 0.7 + (keywordScore / keywords.length) * 0.3

        return [doc, combinedScore] as [Document, number]
      })
      .sort((a, b) => b[1] - a[1])
  }

  /**
   * Rerank by metadata relevance
   */
  static rerankByMetadata(
    results: Array<[Document, number]>,
    preferredMetadata: Record<string, any>
  ): Array<[Document, number]> {
    return results
      .map(([doc, score]) => {
        let metadataBoost = 0

        for (const [key, value] of Object.entries(preferredMetadata)) {
          if (doc.metadata[key] === value) {
            metadataBoost += 0.1
          }
        }

        return [doc, score + metadataBoost] as [Document, number]
      })
      .sort((a, b) => b[1] - a[1])
  }

  /**
   * Rerank by document recency
   */
  static rerankByRecency(
    results: Array<[Document, number]>,
    recencyWeight: number = 0.2
  ): Array<[Document, number]> {
    const now = Date.now()

    return results
      .map(([doc, score]) => {
        const timestamp = doc.metadata.timestamp || doc.metadata.indexed_at
        if (!timestamp) return [doc, score] as [Document, number]

        const age = now - new Date(timestamp).getTime()
        const recencyScore = Math.exp(-age / (30 * 24 * 60 * 60 * 1000)) // Decay over 30 days

        const combinedScore = score * (1 - recencyWeight) + recencyScore * recencyWeight

        return [doc, combinedScore] as [Document, number]
      })
      .sort((a, b) => b[1] - a[1])
  }

  /**
   * Diversity-aware reranking (MMR - Maximal Marginal Relevance)
   */
  static rerankByDiversity(
    results: Array<[Document, number]>,
    lambda: number = 0.5
  ): Array<[Document, number]> {
    if (results.length === 0) return results

    const reranked: Array<[Document, number]> = [results[0]]
    const remaining = results.slice(1)

    while (remaining.length > 0 && reranked.length < results.length) {
      let maxScore = -Infinity
      let maxIndex = 0

      for (let i = 0; i < remaining.length; i++) {
        const [doc, relevance] = remaining[i]

        // Calculate minimum similarity to already selected documents
        let minSim = Infinity
        for (const [selectedDoc] of reranked) {
          const sim = this.calculateTextSimilarity(doc.pageContent, selectedDoc.pageContent)
          minSim = Math.min(minSim, sim)
        }

        // MMR score
        const mmrScore = lambda * relevance - (1 - lambda) * (1 - minSim)

        if (mmrScore > maxScore) {
          maxScore = mmrScore
          maxIndex = i
        }
      }

      reranked.push(remaining[maxIndex])
      remaining.splice(maxIndex, 1)
    }

    return reranked
  }

  /**
   * Simple text similarity (Jaccard)
   */
  private static calculateTextSimilarity(text1: string, text2: string): number {
    const words1 = new Set(text1.toLowerCase().split(/\s+/))
    const words2 = new Set(text2.toLowerCase().split(/\s+/))

    const intersection = new Set([...words1].filter(w => words2.has(w)))
    const union = new Set([...words1, ...words2])

    return intersection.size / union.size
  }
}

/**
 * Retrieval metrics and evaluation
 */
export class RetrievalMetrics {
  /**
   * Calculate precision at K
   */
  static precisionAtK(retrieved: string[], relevant: string[], k: number): number {
    const topK = retrieved.slice(0, k)
    const relevantSet = new Set(relevant)
    const relevantRetrieved = topK.filter(id => relevantSet.has(id)).length

    return relevantRetrieved / k
  }

  /**
   * Calculate recall at K
   */
  static recallAtK(retrieved: string[], relevant: string[], k: number): number {
    const topK = retrieved.slice(0, k)
    const relevantSet = new Set(relevant)
    const relevantRetrieved = topK.filter(id => relevantSet.has(id)).length

    return relevantRetrieved / relevant.length
  }

  /**
   * Calculate Mean Reciprocal Rank (MRR)
   */
  static meanReciprocalRank(retrieved: string[], relevant: string[]): number {
    const relevantSet = new Set(relevant)

    for (let i = 0; i < retrieved.length; i++) {
      if (relevantSet.has(retrieved[i])) {
        return 1 / (i + 1)
      }
    }

    return 0
  }

  /**
   * Calculate Normalized Discounted Cumulative Gain (NDCG)
   */
  static ndcgAtK(retrieved: string[], relevanceScores: Map<string, number>, k: number): number {
    const topK = retrieved.slice(0, k)

    // Calculate DCG
    let dcg = 0
    for (let i = 0; i < topK.length; i++) {
      const relevance = relevanceScores.get(topK[i]) || 0
      dcg += relevance / Math.log2(i + 2)
    }

    // Calculate IDCG (ideal DCG)
    const idealScores = Array.from(relevanceScores.values())
      .sort((a, b) => b - a)
      .slice(0, k)

    let idcg = 0
    for (let i = 0; i < idealScores.length; i++) {
      idcg += idealScores[i] / Math.log2(i + 2)
    }

    return idcg === 0 ? 0 : dcg / idcg
  }
}
