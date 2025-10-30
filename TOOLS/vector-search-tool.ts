/**
 * LangChain Vector Search Tool
 *
 * Tool for performing vector similarity search in RAG systems.
 * Compatible with LangChain agents and chains.
 *
 * @example
 * ```typescript
 * import { VectorSearchTool } from './vector-search-tool'
 *
 * const tool = new VectorSearchTool({
 *   vectorStore: vectorStore,
 *   topK: 5
 * })
 *
 * // Use in agent
 * const agent = createReactAgent({
 *   tools: [tool],
 *   llm: model
 * })
 * ```
 */

import { Tool } from 'langchain/tools'
import { VectorStore } from 'langchain/vectorstores/base'
import type { Document } from 'langchain/document'

export interface VectorSearchToolParams {
  vectorStore: VectorStore
  topK?: number
  scoreThreshold?: number
  filter?: Record<string, any>
  description?: string
}

export class VectorSearchTool extends Tool {
  name = 'vector_search'
  description = `Search through documents using semantic similarity.
Input should be a search query string.
Returns the most relevant document excerpts.`

  private vectorStore: VectorStore
  private topK: number
  private scoreThreshold?: number
  private filter?: Record<string, any>

  constructor(params: VectorSearchToolParams) {
    super()
    this.vectorStore = params.vectorStore
    this.topK = params.topK || 5
    this.scoreThreshold = params.scoreThreshold
    this.filter = params.filter

    if (params.description) {
      this.description = params.description
    }
  }

  async _call(query: string): Promise<string> {
    try {
      // Perform similarity search
      const results = await this.vectorStore.similaritySearchWithScore(
        query,
        this.topK,
        this.filter
      )

      // Filter by score threshold if provided
      const filteredResults = this.scoreThreshold
        ? results.filter(([_, score]) => score >= this.scoreThreshold!)
        : results

      if (filteredResults.length === 0) {
        return 'No relevant documents found for the query.'
      }

      // Format results
      const formattedResults = filteredResults.map(
        ([doc, score], index) => {
          const metadata = doc.metadata
          const source = metadata.source || 'Unknown'
          return [
            `Result ${index + 1} (Similarity: ${score.toFixed(3)}):`,
            `Source: ${source}`,
            `Content: ${doc.pageContent}`,
            metadata.title ? `Title: ${metadata.title}` : null,
            '---',
          ]
            .filter(Boolean)
            .join('\n')
        }
      )

      return formattedResults.join('\n\n')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      return `Error performing vector search: ${errorMessage}`
    }
  }
}

/**
 * Create vector search tool with simplified interface
 */
export function createVectorSearchTool(
  vectorStore: VectorStore,
  options: Omit<VectorSearchToolParams, 'vectorStore'> = {}
): VectorSearchTool {
  return new VectorSearchTool({
    vectorStore,
    ...options,
  })
}
