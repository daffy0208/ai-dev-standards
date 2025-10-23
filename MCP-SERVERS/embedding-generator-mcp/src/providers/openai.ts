import OpenAI from 'openai';
import {
  EmbeddingProvider,
  EmbeddingRequest,
  EmbeddingResult,
} from './interface.js';

export class OpenAIProvider implements EmbeddingProvider {
  private client: OpenAI;
  private defaultModel = 'text-embedding-3-small';

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }

  async generateEmbeddings(request: EmbeddingRequest): Promise<EmbeddingResult> {
    const model = request.model || this.defaultModel;
    const input = Array.isArray(request.input) ? request.input : [request.input];

    const params: any = {
      model,
      input,
    };

    // text-embedding-3-small and text-embedding-3-large support dimensions parameter
    if (request.dimensions && (model.includes('text-embedding-3'))) {
      params.dimensions = request.dimensions;
    }

    const response = await this.client.embeddings.create(params);

    return {
      embeddings: response.data.map((item) => item.embedding),
      model: response.model,
      usage: {
        promptTokens: response.usage.prompt_tokens,
        totalTokens: response.usage.total_tokens,
      },
    };
  }

  listModels(): string[] {
    return [
      'text-embedding-3-small',  // 1536 dims, $0.02/1M tokens
      'text-embedding-3-large',  // 3072 dims, $0.13/1M tokens
      'text-embedding-ada-002',  // 1536 dims, $0.10/1M tokens (legacy)
    ];
  }

  getDefaultModel(): string {
    return this.defaultModel;
  }
}
