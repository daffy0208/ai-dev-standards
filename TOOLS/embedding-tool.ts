/**
 * LangChain Embedding Tool
 *
 * Tool for generating embeddings for text inputs using various providers.
 * Compatible with LangChain agents.
 *
 * @example
 * ```typescript
 * import { EmbeddingTool } from './embedding-tool'
 *
 * const tool = new EmbeddingTool({
 *   provider: 'openai',
 *   model: 'text-embedding-3-small'
 * })
 *
 * // Use in LangChain agent
 * const agent = createReactAgent({
 *   tools: [tool],
 *   llm: model
 * })
 * ```
 */

import { Tool } from 'langchain/tools'
import { OpenAIEmbeddings } from 'langchain/embeddings/openai'
import { CohereEmbeddings } from 'langchain/embeddings/cohere'
import { HuggingFaceInferenceEmbeddings } from 'langchain/embeddings/hf'
import type { Embeddings } from 'langchain/embeddings/base'

export type EmbeddingProvider = 'openai' | 'cohere' | 'huggingface'

export interface EmbeddingToolOptions {
  /**
   * Embedding provider
   */
  provider?: EmbeddingProvider

  /**
   * Model name
   */
  model?: string

  /**
   * API key (if not using environment variables)
   */
  apiKey?: string

  /**
   * Batch size for multiple texts
   */
  batchSize?: number

  /**
   * Return as string (JSON) or object
   */
  returnString?: boolean
}

export class EmbeddingTool extends Tool {
  name = 'embedding_generator'
  description = `Generate embeddings for text inputs using AI models.
Input should be a text string or JSON array of strings.
Returns embeddings as array(s) of numbers.
Use this when you need to convert text to numerical vectors for similarity search or ML tasks.`

  private embeddings: Embeddings
  private options: Required<Omit<EmbeddingToolOptions, 'apiKey'>> & { apiKey?: string }

  constructor(options: EmbeddingToolOptions = {}) {
    super()

    this.options = {
      provider: options.provider || 'openai',
      model: options.model || this.getDefaultModel(options.provider || 'openai'),
      apiKey: options.apiKey,
      batchSize: options.batchSize || 100,
      returnString: options.returnString ?? true,
    }

    this.embeddings = this.initializeEmbeddings()
  }

  /**
   * Initialize embeddings based on provider
   */
  private initializeEmbeddings(): Embeddings {
    switch (this.options.provider) {
      case 'openai':
        return new OpenAIEmbeddings({
          modelName: this.options.model,
          openAIApiKey: this.options.apiKey || process.env.OPENAI_API_KEY,
        })

      case 'cohere':
        return new CohereEmbeddings({
          model: this.options.model,
          apiKey: this.options.apiKey || process.env.COHERE_API_KEY,
        })

      case 'huggingface':
        return new HuggingFaceInferenceEmbeddings({
          model: this.options.model,
          apiKey: this.options.apiKey || process.env.HUGGINGFACE_API_KEY,
        })

      default:
        throw new Error(`Unsupported provider: ${this.options.provider}`)
    }
  }

  /**
   * Get default model for provider
   */
  private getDefaultModel(provider: EmbeddingProvider): string {
    switch (provider) {
      case 'openai':
        return 'text-embedding-3-small'
      case 'cohere':
        return 'embed-english-v3.0'
      case 'huggingface':
        return 'sentence-transformers/all-MiniLM-L6-v2'
      default:
        return 'text-embedding-3-small'
    }
  }

  /**
   * Execute tool
   */
  async _call(input: string): Promise<string> {
    try {
      // Parse input
      let texts: string[]

      try {
        // Try parsing as JSON array
        const parsed = JSON.parse(input)
        texts = Array.isArray(parsed) ? parsed : [input]
      } catch {
        // Single text input
        texts = [input]
      }

      // Generate embeddings
      if (texts.length === 1) {
        // Single embedding
        const embedding = await this.embeddings.embedQuery(texts[0])

        return this.options.returnString
          ? JSON.stringify({ embedding, dimensions: embedding.length })
          : JSON.stringify(embedding)
      } else {
        // Batch embeddings
        const embeddings = await this.embedDocuments(texts)

        return this.options.returnString
          ? JSON.stringify({
              embeddings,
              count: embeddings.length,
              dimensions: embeddings[0]?.length || 0,
            })
          : JSON.stringify(embeddings)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      return `Error generating embeddings: ${errorMessage}`
    }
  }

  /**
   * Embed multiple documents with batching
   */
  private async embedDocuments(texts: string[]): Promise<number[][]> {
    const allEmbeddings: number[][] = []

    // Process in batches
    for (let i = 0; i < texts.length; i += this.options.batchSize) {
      const batch = texts.slice(i, i + this.options.batchSize)
      const batchEmbeddings = await this.embeddings.embedDocuments(batch)
      allEmbeddings.push(...batchEmbeddings)
    }

    return allEmbeddings
  }

  /**
   * Get embedding dimensions
   */
  async getEmbeddingDimensions(): Promise<number> {
    const testEmbedding = await this.embeddings.embedQuery('test')
    return testEmbedding.length
  }
}

/**
 * Create embedding tool with default options
 */
export function createEmbeddingTool(options: EmbeddingToolOptions = {}): EmbeddingTool {
  return new EmbeddingTool(options)
}

/**
 * OpenAI Embedding Tool (convenience)
 */
export class OpenAIEmbeddingTool extends EmbeddingTool {
  constructor(options: Omit<EmbeddingToolOptions, 'provider'> = {}) {
    super({ ...options, provider: 'openai' })
  }
}

/**
 * Cohere Embedding Tool (convenience)
 */
export class CohereEmbeddingTool extends EmbeddingTool {
  constructor(options: Omit<EmbeddingToolOptions, 'provider'> = {}) {
    super({ ...options, provider: 'cohere' })
  }
}

/**
 * HuggingFace Embedding Tool (convenience)
 */
export class HuggingFaceEmbeddingTool extends EmbeddingTool {
  constructor(options: Omit<EmbeddingToolOptions, 'provider'> = {}) {
    super({ ...options, provider: 'huggingface' })
  }
}
