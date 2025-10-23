import { CohereClient } from 'cohere-ai';
import {
  EmbeddingProvider,
  EmbeddingRequest,
  EmbeddingResult,
} from './interface.js';

export class CohereProvider implements EmbeddingProvider {
  private client: CohereClient;
  private defaultModel = 'embed-english-v3.0';

  constructor(apiKey: string) {
    this.client = new CohereClient({ token: apiKey });
  }

  async generateEmbeddings(request: EmbeddingRequest): Promise<EmbeddingResult> {
    const model = request.model || this.defaultModel;
    const texts = Array.isArray(request.input) ? request.input : [request.input];

    const response = await this.client.embed({
      texts,
      model,
      inputType: 'search_document', // or 'search_query' for queries
    });

    // Cohere doesn't provide token usage in the same way
    // Estimate tokens (rough approximation: 1 token ≈ 4 chars)
    const totalChars = texts.reduce((sum, text) => sum + text.length, 0);
    const estimatedTokens = Math.ceil(totalChars / 4);

    // Handle different response types from Cohere SDK
    const embeddings = Array.isArray(response.embeddings)
      ? response.embeddings
      : (response.embeddings as any).float || [];

    return {
      embeddings,
      model,
      usage: {
        promptTokens: estimatedTokens,
        totalTokens: estimatedTokens,
      },
    };
  }

  listModels(): string[] {
    return [
      'embed-english-v3.0',       // 1024 dims, $0.10/1M tokens
      'embed-english-light-v3.0', // 384 dims, $0.10/1M tokens
      'embed-multilingual-v3.0',  // 1024 dims, $0.10/1M tokens
      'embed-english-v2.0',       // 4096 dims (legacy)
    ];
  }

  getDefaultModel(): string {
    return this.defaultModel;
  }
}
