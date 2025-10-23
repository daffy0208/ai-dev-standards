/**
 * Common interface for vector database providers
 */

export interface VectorRecord {
  id: string;
  values: number[];
  metadata?: Record<string, any>;
}

export interface SearchResult {
  id: string;
  score: number;
  metadata?: Record<string, any>;
}

export interface VectorDatabaseProvider {
  /**
   * Connect to the database and optionally select a collection
   */
  connect(collection?: string): Promise<void>;

  /**
   * Insert vectors into the database
   */
  insertVectors(vectors: VectorRecord[]): Promise<string>;

  /**
   * Search for similar vectors
   */
  searchVectors(
    query: number[],
    topK: number,
    filter?: Record<string, any>
  ): Promise<SearchResult[]>;

  /**
   * Delete vectors by IDs
   */
  deleteVectors(ids: string[]): Promise<void>;

  /**
   * List all collections/indexes
   */
  listCollections(): Promise<string[]>;
}
