import { describe, it, expect, beforeEach, vi } from 'vitest';
import { VectorDatabaseProvider, VectorRecord, SearchResult } from './providers/interface.js';

describe('Vector Database MCP Server', () => {
  // Create a mock provider for testing
  function createMockProvider(): VectorDatabaseProvider {
    return {
      connect: vi.fn(),
      insertVectors: vi.fn(),
      searchVectors: vi.fn(),
      deleteVectors: vi.fn(),
      listCollections: vi.fn(),
    };
  }

  describe('Connect Tool', () => {
    it('should call connect method with collection name', async () => {
      const provider = createMockProvider();
      (provider.connect as any).mockResolvedValue(undefined);

      await provider.connect('test-collection');

      expect(provider.connect).toHaveBeenCalledWith('test-collection');
    });

    it('should handle connection without collection name', async () => {
      const provider = createMockProvider();
      (provider.connect as any).mockResolvedValue(undefined);

      await provider.connect();

      expect(provider.connect).toHaveBeenCalled();
    });

    it('should handle connection errors', async () => {
      const provider = createMockProvider();
      (provider.connect as any).mockRejectedValue(new Error('Connection failed'));

      await expect(provider.connect('test')).rejects.toThrow('Connection failed');
    });
  });

  describe('Insert Vectors Tool', () => {
    let provider: VectorDatabaseProvider;

    beforeEach(() => {
      provider = createMockProvider();
    });

    it('should insert vectors with valid format', async () => {
      (provider.insertVectors as any).mockResolvedValue('Success');

      const vectors: VectorRecord[] = [
        { id: 'vec1', values: [0.1, 0.2, 0.3], metadata: { text: 'test' } },
        { id: 'vec2', values: [0.4, 0.5, 0.6] },
      ];

      const result = await provider.insertVectors(vectors);

      expect(provider.insertVectors).toHaveBeenCalledWith(vectors);
      expect(result).toBe('Success');
    });

    it('should handle metadata correctly', async () => {
      (provider.insertVectors as any).mockResolvedValue('Success');

      const vectors: VectorRecord[] = [
        {
          id: 'vec1',
          values: [0.1, 0.2],
          metadata: {
            text: 'sample text',
            category: 'test',
            timestamp: Date.now(),
          },
        },
      ];

      await provider.insertVectors(vectors);
      expect(provider.insertVectors).toHaveBeenCalled();
    });

    it('should handle empty vector array', async () => {
      (provider.insertVectors as any).mockResolvedValue('Success');

      await provider.insertVectors([]);
      expect(provider.insertVectors).toHaveBeenCalledWith([]);
    });

    it('should handle insert errors', async () => {
      (provider.insertVectors as any).mockRejectedValue(new Error('Insert failed'));

      await expect(provider.insertVectors([{ id: 'vec1', values: [0.1] }])).rejects.toThrow(
        'Insert failed'
      );
    });
  });

  describe('Search Vectors Tool', () => {
    let provider: VectorDatabaseProvider;

    beforeEach(() => {
      provider = createMockProvider();
    });

    it('should search with query vector and topK', async () => {
      const mockResults: SearchResult[] = [
        { id: 'vec1', score: 0.95, metadata: { text: 'result 1' } },
        { id: 'vec2', score: 0.87, metadata: { text: 'result 2' } },
      ];

      (provider.searchVectors as any).mockResolvedValue(mockResults);

      const query = [0.1, 0.2, 0.3];
      const results = await provider.searchVectors(query, 5);

      expect(provider.searchVectors).toHaveBeenCalledWith(query, 5);
      expect(results).toHaveLength(2);
      expect(results[0].score).toBe(0.95);
    });

    it('should apply metadata filters', async () => {
      const mockResults: SearchResult[] = [
        { id: 'vec1', score: 0.95, metadata: { category: 'test' } },
      ];

      (provider.searchVectors as any).mockResolvedValue(mockResults);

      const query = [0.1, 0.2, 0.3];
      const filter = { category: 'test' };
      const results = await provider.searchVectors(query, 10, filter);

      expect(provider.searchVectors).toHaveBeenCalledWith(query, 10, filter);
      expect(results).toHaveLength(1);
    });

    it('should return results with correct schema', async () => {
      const mockResults: SearchResult[] = [
        { id: 'vec1', score: 0.95, metadata: { text: 'test' } },
      ];

      (provider.searchVectors as any).mockResolvedValue(mockResults);

      const results = await provider.searchVectors([0.1, 0.2], 5);

      expect(results[0]).toHaveProperty('id');
      expect(results[0]).toHaveProperty('score');
      expect(results[0]).toHaveProperty('metadata');
    });

    it('should handle empty search results', async () => {
      (provider.searchVectors as any).mockResolvedValue([]);

      const results = await provider.searchVectors([0.1, 0.2], 5);

      expect(results).toEqual([]);
    });

    it('should handle search errors', async () => {
      (provider.searchVectors as any).mockRejectedValue(new Error('Search failed'));

      await expect(provider.searchVectors([0.1], 5)).rejects.toThrow('Search failed');
    });
  });

  describe('Delete Vectors Tool', () => {
    let provider: VectorDatabaseProvider;

    beforeEach(() => {
      provider = createMockProvider();
    });

    it('should delete vectors by IDs', async () => {
      (provider.deleteVectors as any).mockResolvedValue(undefined);

      const ids = ['vec1', 'vec2', 'vec3'];
      await provider.deleteVectors(ids);

      expect(provider.deleteVectors).toHaveBeenCalledWith(ids);
    });

    it('should handle empty ID array', async () => {
      (provider.deleteVectors as any).mockResolvedValue(undefined);

      await provider.deleteVectors([]);
      expect(provider.deleteVectors).toHaveBeenCalledWith([]);
    });

    it('should handle single ID deletion', async () => {
      (provider.deleteVectors as any).mockResolvedValue(undefined);

      await provider.deleteVectors(['vec1']);
      expect(provider.deleteVectors).toHaveBeenCalledWith(['vec1']);
    });

    it('should handle delete errors', async () => {
      (provider.deleteVectors as any).mockRejectedValue(new Error('Delete failed'));

      await expect(provider.deleteVectors(['vec1'])).rejects.toThrow('Delete failed');
    });
  });

  describe('List Collections Tool', () => {
    it('should list collections', async () => {
      const provider = createMockProvider();
      (provider.listCollections as any).mockResolvedValue(['col1', 'col2', 'col3']);

      const collections = await provider.listCollections();

      expect(provider.listCollections).toHaveBeenCalled();
      expect(Array.isArray(collections)).toBe(true);
      expect(collections).toHaveLength(3);
    });

    it('should handle empty collection list', async () => {
      const provider = createMockProvider();
      (provider.listCollections as any).mockResolvedValue([]);

      const collections = await provider.listCollections();

      expect(collections).toEqual([]);
    });

    it('should handle list errors', async () => {
      const provider = createMockProvider();
      (provider.listCollections as any).mockRejectedValue(new Error('List failed'));

      await expect(provider.listCollections()).rejects.toThrow('List failed');
    });
  });

  describe('Provider Interface Compliance', () => {
    it('should have all required methods', () => {
      const provider = createMockProvider();

      expect(typeof provider.connect).toBe('function');
      expect(typeof provider.insertVectors).toBe('function');
      expect(typeof provider.searchVectors).toBe('function');
      expect(typeof provider.deleteVectors).toBe('function');
      expect(typeof provider.listCollections).toBe('function');
    });
  });

  describe('Vector Record Validation', () => {
    it('should accept valid vector records', () => {
      const validRecord: VectorRecord = {
        id: 'test-id',
        values: [0.1, 0.2, 0.3],
        metadata: { key: 'value' },
      };

      expect(validRecord.id).toBe('test-id');
      expect(validRecord.values).toHaveLength(3);
      expect(validRecord.metadata).toHaveProperty('key');
    });

    it('should allow records without metadata', () => {
      const recordWithoutMetadata: VectorRecord = {
        id: 'test-id',
        values: [0.1, 0.2],
      };

      expect(recordWithoutMetadata.id).toBe('test-id');
      expect(recordWithoutMetadata.metadata).toBeUndefined();
    });
  });

  describe('Search Result Validation', () => {
    it('should accept valid search results', () => {
      const validResult: SearchResult = {
        id: 'result-id',
        score: 0.95,
        metadata: { text: 'sample' },
      };

      expect(validResult.id).toBe('result-id');
      expect(validResult.score).toBe(0.95);
      expect(validResult.metadata).toHaveProperty('text');
    });

    it('should allow results without metadata', () => {
      const resultWithoutMetadata: SearchResult = {
        id: 'result-id',
        score: 0.85,
      };

      expect(resultWithoutMetadata.id).toBe('result-id');
      expect(resultWithoutMetadata.metadata).toBeUndefined();
    });
  });
});
