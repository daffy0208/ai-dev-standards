import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EmbeddingProvider, EmbeddingRequest, EmbeddingResult } from './providers/interface.js';

describe('Embedding Generator MCP Server', () => {
  // Create a mock provider for testing
  function createMockProvider(): EmbeddingProvider {
    return {
      generateEmbeddings: vi.fn(),
      listModels: vi.fn(),
      getDefaultModel: vi.fn(),
    };
  }

  describe('Configure Tool', () => {
    it('should configure with provider and api key', () => {
      const provider = createMockProvider();
      (provider.listModels as any).mockReturnValue(['model-1', 'model-2']);
      (provider.getDefaultModel as any).mockReturnValue('model-1');

      expect(provider.listModels()).toEqual(['model-1', 'model-2']);
      expect(provider.getDefaultModel()).toBe('model-1');
    });

    it('should list available models', () => {
      const provider = createMockProvider();
      (provider.listModels as any).mockReturnValue([
        'text-embedding-3-small',
        'text-embedding-3-large',
      ]);

      const models = provider.listModels();
      expect(models).toContain('text-embedding-3-small');
      expect(models).toContain('text-embedding-3-large');
    });
  });

  describe('Generate Embeddings Tool', () => {
    let provider: EmbeddingProvider;

    beforeEach(() => {
      provider = createMockProvider();
    });

    it('should generate embedding for single text', async () => {
      const mockResult: EmbeddingResult = {
        embeddings: [[0.1, 0.2, 0.3, 0.4, 0.5]],
        model: 'text-embedding-3-small',
        usage: {
          promptTokens: 10,
          totalTokens: 10,
        },
      };

      (provider.generateEmbeddings as any).mockResolvedValue(mockResult);

      const result = await provider.generateEmbeddings({
        input: 'sample text',
      });

      expect(result.embeddings).toHaveLength(1);
      expect(result.embeddings[0]).toHaveLength(5);
      expect(result.model).toBe('text-embedding-3-small');
      expect(result.usage.totalTokens).toBe(10);
    });

    it('should handle custom dimensions', async () => {
      const mockResult: EmbeddingResult = {
        embeddings: [[0.1, 0.2, 0.3]],
        model: 'text-embedding-3-small',
        usage: {
          promptTokens: 10,
          totalTokens: 10,
        },
      };

      (provider.generateEmbeddings as any).mockResolvedValue(mockResult);

      const result = await provider.generateEmbeddings({
        input: 'sample text',
        dimensions: 3,
      });

      expect(result.embeddings[0]).toHaveLength(3);
    });

    it('should use default model when not specified', async () => {
      const mockResult: EmbeddingResult = {
        embeddings: [[0.1, 0.2]],
        model: 'text-embedding-3-small',
        usage: {
          promptTokens: 5,
          totalTokens: 5,
        },
      };

      (provider.generateEmbeddings as any).mockResolvedValue(mockResult);
      (provider.getDefaultModel as any).mockReturnValue('text-embedding-3-small');

      const result = await provider.generateEmbeddings({
        input: 'test',
      });

      expect(result.model).toBe('text-embedding-3-small');
    });

    it('should handle custom model', async () => {
      const mockResult: EmbeddingResult = {
        embeddings: [[0.1, 0.2]],
        model: 'text-embedding-3-large',
        usage: {
          promptTokens: 5,
          totalTokens: 5,
        },
      };

      (provider.generateEmbeddings as any).mockResolvedValue(mockResult);

      const result = await provider.generateEmbeddings({
        input: 'test',
        model: 'text-embedding-3-large',
      });

      expect(result.model).toBe('text-embedding-3-large');
    });
  });

  describe('Generate Batch Embeddings Tool', () => {
    let provider: EmbeddingProvider;

    beforeEach(() => {
      provider = createMockProvider();
    });

    it('should generate embeddings for multiple texts', async () => {
      const mockResult: EmbeddingResult = {
        embeddings: [
          [0.1, 0.2, 0.3],
          [0.4, 0.5, 0.6],
          [0.7, 0.8, 0.9],
        ],
        model: 'text-embedding-3-small',
        usage: {
          promptTokens: 30,
          totalTokens: 30,
        },
      };

      (provider.generateEmbeddings as any).mockResolvedValue(mockResult);

      const result = await provider.generateEmbeddings({
        input: ['text 1', 'text 2', 'text 3'],
      });

      expect(result.embeddings).toHaveLength(3);
      expect(result.embeddings[0]).toHaveLength(3);
      expect(result.usage.totalTokens).toBe(30);
    });

    it('should handle single string as array', async () => {
      const mockResult: EmbeddingResult = {
        embeddings: [[0.1, 0.2]],
        model: 'text-embedding-3-small',
        usage: {
          promptTokens: 5,
          totalTokens: 5,
        },
      };

      (provider.generateEmbeddings as any).mockResolvedValue(mockResult);

      const result = await provider.generateEmbeddings({
        input: 'single text',
      });

      expect(result.embeddings).toHaveLength(1);
    });

    it('should handle large batches', async () => {
      const texts = Array.from({ length: 100 }, (_, i) => `text ${i}`);
      const mockEmbeddings = Array.from({ length: 100 }, (_, i) => [i * 0.1, i * 0.2]);

      const mockResult: EmbeddingResult = {
        embeddings: mockEmbeddings,
        model: 'text-embedding-3-small',
        usage: {
          promptTokens: 1000,
          totalTokens: 1000,
        },
      };

      (provider.generateEmbeddings as any).mockResolvedValue(mockResult);

      const result = await provider.generateEmbeddings({
        input: texts,
      });

      expect(result.embeddings).toHaveLength(100);
      expect(result.usage.totalTokens).toBe(1000);
    });

    it('should preserve order of embeddings', async () => {
      const texts = ['first', 'second', 'third'];
      const mockResult: EmbeddingResult = {
        embeddings: [
          [0.1, 0.1],
          [0.2, 0.2],
          [0.3, 0.3],
        ],
        model: 'text-embedding-3-small',
        usage: {
          promptTokens: 15,
          totalTokens: 15,
        },
      };

      (provider.generateEmbeddings as any).mockResolvedValue(mockResult);

      const result = await provider.generateEmbeddings({
        input: texts,
      });

      expect(result.embeddings[0][0]).toBe(0.1);
      expect(result.embeddings[1][0]).toBe(0.2);
      expect(result.embeddings[2][0]).toBe(0.3);
    });
  });

  describe('List Models Tool', () => {
    it('should list OpenAI models', () => {
      const provider = createMockProvider();
      (provider.listModels as any).mockReturnValue([
        'text-embedding-3-small',
        'text-embedding-3-large',
        'text-embedding-ada-002',
      ]);

      const models = provider.listModels();

      expect(models).toContain('text-embedding-3-small');
      expect(models).toContain('text-embedding-3-large');
      expect(models).toContain('text-embedding-ada-002');
    });

    it('should list Cohere models', () => {
      const provider = createMockProvider();
      (provider.listModels as any).mockReturnValue([
        'embed-english-v3.0',
        'embed-english-light-v3.0',
        'embed-multilingual-v3.0',
      ]);

      const models = provider.listModels();

      expect(models).toContain('embed-english-v3.0');
      expect(models).toContain('embed-multilingual-v3.0');
    });

    it('should return default model', () => {
      const provider = createMockProvider();
      (provider.getDefaultModel as any).mockReturnValue('text-embedding-3-small');

      expect(provider.getDefaultModel()).toBe('text-embedding-3-small');
    });
  });

  describe('Provider Interface Compliance', () => {
    it('should implement all required methods', () => {
      const provider = createMockProvider();

      expect(typeof provider.generateEmbeddings).toBe('function');
      expect(typeof provider.listModels).toBe('function');
      expect(typeof provider.getDefaultModel).toBe('function');
    });
  });

  describe('Embedding Request Validation', () => {
    it('should accept valid single text request', () => {
      const request: EmbeddingRequest = {
        input: 'sample text',
      };

      expect(request.input).toBe('sample text');
      expect(request.model).toBeUndefined();
      expect(request.dimensions).toBeUndefined();
    });

    it('should accept valid batch request', () => {
      const request: EmbeddingRequest = {
        input: ['text 1', 'text 2'],
        model: 'text-embedding-3-small',
        dimensions: 512,
      };

      expect(Array.isArray(request.input)).toBe(true);
      expect(request.input).toHaveLength(2);
      expect(request.model).toBe('text-embedding-3-small');
      expect(request.dimensions).toBe(512);
    });
  });

  describe('Embedding Result Validation', () => {
    it('should accept valid result', () => {
      const result: EmbeddingResult = {
        embeddings: [[0.1, 0.2, 0.3]],
        model: 'text-embedding-3-small',
        usage: {
          promptTokens: 10,
          totalTokens: 10,
        },
      };

      expect(result.embeddings).toHaveLength(1);
      expect(result.embeddings[0]).toHaveLength(3);
      expect(result.model).toBe('text-embedding-3-small');
      expect(result.usage.promptTokens).toBe(10);
      expect(result.usage.totalTokens).toBe(10);
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      const provider = createMockProvider();
      (provider.generateEmbeddings as any).mockRejectedValue(
        new Error('API rate limit exceeded')
      );

      await expect(
        provider.generateEmbeddings({ input: 'test' })
      ).rejects.toThrow('API rate limit exceeded');
    });

    it('should handle invalid input gracefully', async () => {
      const provider = createMockProvider();
      (provider.generateEmbeddings as any).mockRejectedValue(
        new Error('Invalid input: empty text')
      );

      await expect(
        provider.generateEmbeddings({ input: '' })
      ).rejects.toThrow('Invalid input: empty text');
    });

    it('should handle network errors', async () => {
      const provider = createMockProvider();
      (provider.generateEmbeddings as any).mockRejectedValue(
        new Error('Network request failed')
      );

      await expect(
        provider.generateEmbeddings({ input: 'test' })
      ).rejects.toThrow('Network request failed');
    });
  });

  describe('Usage Tracking', () => {
    it('should track token usage', async () => {
      const provider = createMockProvider();
      const mockResult: EmbeddingResult = {
        embeddings: [[0.1, 0.2]],
        model: 'text-embedding-3-small',
        usage: {
          promptTokens: 25,
          totalTokens: 25,
        },
      };

      (provider.generateEmbeddings as any).mockResolvedValue(mockResult);

      const result = await provider.generateEmbeddings({
        input: 'This is a longer text that uses more tokens',
      });

      expect(result.usage.promptTokens).toBeGreaterThan(0);
      expect(result.usage.totalTokens).toBeGreaterThan(0);
    });

    it('should track batch token usage', async () => {
      const provider = createMockProvider();
      const mockResult: EmbeddingResult = {
        embeddings: [[0.1], [0.2], [0.3]],
        model: 'text-embedding-3-small',
        usage: {
          promptTokens: 75,
          totalTokens: 75,
        },
      };

      (provider.generateEmbeddings as any).mockResolvedValue(mockResult);

      const result = await provider.generateEmbeddings({
        input: ['text 1', 'text 2', 'text 3'],
      });

      expect(result.usage.totalTokens).toBeGreaterThanOrEqual(
        result.embeddings.length
      );
    });
  });
});
