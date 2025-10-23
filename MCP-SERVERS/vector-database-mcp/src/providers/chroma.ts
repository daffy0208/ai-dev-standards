import { ChromaClient as ChromaSDK } from 'chromadb';
import {
  VectorDatabaseProvider,
  VectorRecord,
  SearchResult,
} from './interface.js';

export class ChromaClient implements VectorDatabaseProvider {
  private client: ChromaSDK;
  private collection: any;
  private collectionName: string | null = null;

  constructor(host: string) {
    this.client = new ChromaSDK({
      path: host,
    });
  }

  async connect(collectionName?: string): Promise<void> {
    if (!collectionName) {
      throw new Error('Collection name required for Chroma');
    }

    this.collectionName = collectionName;

    // Get or create collection
    try {
      this.collection = await this.client.getOrCreateCollection({
        name: collectionName,
      });
    } catch (error) {
      throw new Error(`Failed to connect to collection: ${error}`);
    }
  }

  async insertVectors(vectors: VectorRecord[]): Promise<string> {
    if (!this.collection) {
      throw new Error('Not connected. Call connect() first.');
    }

    await this.collection.add({
      ids: vectors.map((v) => v.id),
      embeddings: vectors.map((v) => v.values),
      metadatas: vectors.map((v) => v.metadata || {}),
    });

    return `Inserted into collection: ${this.collectionName}`;
  }

  async searchVectors(
    query: number[],
    topK: number,
    filter?: Record<string, any>
  ): Promise<SearchResult[]> {
    if (!this.collection) {
      throw new Error('Not connected. Call connect() first.');
    }

    const queryParams: any = {
      queryEmbeddings: [query],
      nResults: topK,
    };

    if (filter) {
      queryParams.where = filter;
    }

    const results = await this.collection.query(queryParams);

    const matches: SearchResult[] = [];
    if (results.ids && results.ids[0]) {
      for (let i = 0; i < results.ids[0].length; i++) {
        matches.push({
          id: results.ids[0][i],
          score: results.distances?.[0]?.[i] || 0,
          metadata: results.metadatas?.[0]?.[i] || {},
        });
      }
    }

    return matches;
  }

  async deleteVectors(ids: string[]): Promise<void> {
    if (!this.collection) {
      throw new Error('Not connected. Call connect() first.');
    }

    await this.collection.delete({
      ids,
    });
  }

  async listCollections(): Promise<string[]> {
    const collections = await this.client.listCollections();
    return collections.map((c: any) => c.name);
  }
}
