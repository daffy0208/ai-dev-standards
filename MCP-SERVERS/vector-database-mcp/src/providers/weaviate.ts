import weaviate, { WeaviateClient as WeaviateSDK } from 'weaviate-ts-client';
import {
  VectorDatabaseProvider,
  VectorRecord,
  SearchResult,
} from './interface.js';

export class WeaviateClient implements VectorDatabaseProvider {
  private client: WeaviateSDK;
  private className: string | null = null;

  constructor(host: string, apiKey?: string) {
    const config: any = {
      scheme: host.startsWith('https') ? 'https' : 'http',
      host: host.replace(/^https?:\/\//, ''),
    };

    if (apiKey) {
      config.apiKey = new weaviate.ApiKey(apiKey);
    }

    this.client = weaviate.client(config);
  }

  async connect(className?: string): Promise<void> {
    if (!className) {
      throw new Error('Class name required for Weaviate');
    }

    this.className = className;

    // Check if class exists, create if not
    try {
      await this.client.schema.classGetter().withClassName(className).do();
    } catch (error) {
      // Class doesn't exist, create it
      await this.client.schema
        .classCreator()
        .withClass({
          class: className,
          vectorizer: 'none', // We'll provide vectors
        })
        .do();
    }
  }

  async insertVectors(vectors: VectorRecord[]): Promise<string> {
    if (!this.className) {
      throw new Error('Not connected. Call connect() first.');
    }

    let batch = this.client.batch.objectsBatcher();

    for (const vector of vectors) {
      batch = batch.withObject({
        class: this.className,
        id: vector.id,
        properties: vector.metadata || {},
        vector: vector.values,
      });
    }

    await batch.do();
    return `Inserted into class: ${this.className}`;
  }

  async searchVectors(
    query: number[],
    topK: number,
    filter?: Record<string, any>
  ): Promise<SearchResult[]> {
    if (!this.className) {
      throw new Error('Not connected. Call connect() first.');
    }

    let queryBuilder = this.client.graphql
      .get()
      .withClassName(this.className)
      .withNearVector({ vector: query })
      .withLimit(topK)
      .withFields('_additional { id distance }');

    if (filter) {
      queryBuilder = queryBuilder.withWhere(filter);
    }

    const result = await queryBuilder.do();
    const objects = result.data.Get[this.className];

    return objects.map((obj: any) => ({
      id: obj._additional.id,
      score: 1 - obj._additional.distance, // Convert distance to similarity
      metadata: obj,
    }));
  }

  async deleteVectors(ids: string[]): Promise<void> {
    if (!this.className) {
      throw new Error('Not connected. Call connect() first.');
    }

    for (const id of ids) {
      await this.client.data.deleter().withClassName(this.className).withId(id).do();
    }
  }

  async listCollections(): Promise<string[]> {
    const schema = await this.client.schema.getter().do();
    return schema.classes?.map((c: any) => c.class) || [];
  }
}
