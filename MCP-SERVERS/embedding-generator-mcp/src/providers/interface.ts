/**
 * Common interface for embedding providers
 */

export interface EmbeddingRequest {
  input: string | string[];
  model?: string;
  dimensions?: number;
}

export interface EmbeddingResult {
  embeddings: number[][];
  model: string;
  usage: {
    promptTokens: number;
    totalTokens: number;
  };
}

export interface EmbeddingProvider {
  /**
   * Generate embeddings for text input(s)
   */
  generateEmbeddings(request: EmbeddingRequest): Promise<EmbeddingResult>;

  /**
   * Get available models for this provider
   */
  listModels(): string[];

  /**
   * Get default model for this provider
   */
  getDefaultModel(): string;
}
