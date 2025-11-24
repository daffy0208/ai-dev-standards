import { Pinecone } from '@pinecone-database/pinecone'

export interface StoredDocument {
  id: string
  text: string
  embedding: number[]
  metadata?: Record<string, unknown>
}

export interface QueryParams {
  embedding: number[]
  topK: number
  filter?: Record<string, unknown>
}

export interface QueryResult {
  id: string
  score: number
  metadata?: Record<string, unknown>
}

export interface VectorStore {
  upsert(documents: StoredDocument[]): Promise<void>
  query(params: QueryParams): Promise<QueryResult[]>
  list(): Promise<StoredDocument[] | null>
}

class InMemoryVectorStore implements VectorStore {
  private documents = new Map<string, StoredDocument>()

  async upsert(documents: StoredDocument[]): Promise<void> {
    for (const doc of documents) {
      this.documents.set(doc.id, doc)
    }
  }

  async query(params: QueryParams): Promise<QueryResult[]> {
    const results: QueryResult[] = []
    for (const doc of this.documents.values()) {
      const score = this.cosineSimilarity(params.embedding, doc.embedding)
      results.push({
        id: doc.id,
        score,
        metadata: {
          text: doc.text,
          ...doc.metadata
        }
      })
    }

    return results
      .filter(result => !Number.isNaN(result.score))
      .sort((a, b) => b.score - a.score)
      .slice(0, params.topK)
  }

  async list(): Promise<StoredDocument[] | null> {
    return Array.from(this.documents.values())
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0
    let dot = 0
    let normA = 0
    let normB = 0
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i]
      normA += a[i] * a[i]
      normB += b[i] * b[i]
    }
    const denominator = Math.sqrt(normA) * Math.sqrt(normB)
    return denominator === 0 ? 0 : dot / denominator
  }
}

class PineconeVectorStore implements VectorStore {
  private index

  constructor(client: Pinecone, indexName: string) {
    this.index = client.index(indexName)
  }

  async upsert(documents: StoredDocument[]): Promise<void> {
    await this.index.upsert(
      documents.map(doc => ({
        id: doc.id,
        values: doc.embedding,
        metadata: {
          text: doc.text,
          ...doc.metadata
        }
      }))
    )
  }

  async query(params: QueryParams): Promise<QueryResult[]> {
    const response = await this.index.query({
      vector: params.embedding,
      topK: params.topK,
      includeMetadata: true,
      filter: params.filter as Record<string, unknown> | undefined
    })

    return (response.matches || []).map(match => ({
      id: match.id || '',
      score: match.score || 0,
      metadata: match.metadata as Record<string, unknown> | undefined
    }))
  }

  async list(): Promise<StoredDocument[] | null> {
    return null
  }
}

export function createVectorStoreClient(): { store: VectorStore; provider: 'pinecone' | 'memory' } {
  const apiKey = process.env.PINECONE_API_KEY
  const indexName = process.env.PINECONE_INDEX

  if (apiKey && indexName) {
    const client = new Pinecone({ apiKey })
    return {
      store: new PineconeVectorStore(client, indexName),
      provider: 'pinecone'
    }
  }

  return {
    store: new InMemoryVectorStore(),
    provider: 'memory'
  }
}

export { InMemoryVectorStore }
