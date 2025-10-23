import { Pinecone } from '@pinecone-database/pinecone';
import {
  VectorDatabaseProvider,
  VectorRecord,
  SearchResult,
} from './interface.js';

export class PineconeClient implements VectorDatabaseProvider {
  private client: Pinecone;
  private index: any;
  private indexName: string | null = null;

  constructor(apiKey: string) {
    this.client = new Pinecone({
      apiKey,
    });
  }

  async connect(indexName?: string): Promise<void> {
    if (!indexName) {
      throw new Error('Index name required for Pinecone');
    }

    this.indexName = indexName;
    this.index = this.client.index(indexName);
  }

  async insertVectors(vectors: VectorRecord[]): Promise<string> {
    if (!this.index) {
      throw new Error('Not connected. Call connect() first.');
    }

    await this.index.upsert(vectors);
    return `Upserted to index: ${this.indexName}`;
  }

  async searchVectors(
    query: number[],
    topK: number,
    filter?: Record<string, any>
  ): Promise<SearchResult[]> {
    if (!this.index) {
      throw new Error('Not connected. Call connect() first.');
    }

    const response = await this.index.query({
      vector: query,
      topK,
      filter,
      includeMetadata: true,
    });

    return response.matches.map((match: any) => ({
      id: match.id,
      score: match.score,
      metadata: match.metadata,
    }));
  }

  async deleteVectors(ids: string[]): Promise<void> {
    if (!this.index) {
      throw new Error('Not connected. Call connect() first.');
    }

    await this.index.deleteMany(ids);
  }

  async listCollections(): Promise<string[]> {
    const indexes = await this.client.listIndexes();
    return indexes.indexes?.map((idx: any) => idx.name) || [];
  }
}
