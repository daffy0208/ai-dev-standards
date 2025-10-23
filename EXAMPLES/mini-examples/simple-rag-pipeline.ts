/**
 * Simple RAG Pipeline Example
 *
 * A minimal, working example of a Retrieval Augmented Generation pipeline.
 *
 * This example shows:
 * - Document chunking
 * - Embedding generation
 * - Vector search
 * - LLM response generation
 *
 * Requirements:
 * ```bash
 * npm install openai tiktoken
 * ```
 *
 * Setup:
 * ```
 * OPENAI_API_KEY=your_api_key
 * ```
 */

import OpenAI from 'openai'
import { encoding_for_model } from 'tiktoken'

// Types
interface Document {
  id: string
  content: string
  metadata: Record<string, any>
}

interface Chunk {
  id: string
  content: string
  embedding?: number[]
  metadata: Record<string, any>
}

interface SearchResult {
  chunk: Chunk
  score: number
}

/**
 * Simple RAG Pipeline
 */
export class SimpleRAGPipeline {
  private openai: OpenAI
  private chunks: Chunk[] = []
  private encoder: any

  constructor(apiKey?: string) {
    this.openai = new OpenAI({
      apiKey: apiKey || process.env.OPENAI_API_KEY
    })

    this.encoder = encoding_for_model('gpt-4')
  }

  /**
   * Step 1: Chunk documents into smaller pieces
   */
  async chunkDocuments(
    documents: Document[],
    chunkSize: number = 500,
    overlap: number = 50
  ): Promise<Chunk[]> {
    const chunks: Chunk[] = []

    for (const doc of documents) {
      const tokens = this.encoder.encode(doc.content)

      for (let i = 0; i < tokens.length; i += chunkSize - overlap) {
        const chunkTokens = tokens.slice(i, i + chunkSize)
        const chunkText = this.encoder.decode(chunkTokens)

        chunks.push({
          id: `${doc.id}-${chunks.length}`,
          content: chunkText,
          metadata: {
            ...doc.metadata,
            docId: doc.id,
            chunkIndex: chunks.length,
            tokenCount: chunkTokens.length
          }
        })
      }
    }

    return chunks
  }

  /**
   * Step 2: Generate embeddings for chunks
   */
  async generateEmbeddings(chunks: Chunk[]): Promise<void> {
    console.log(`Generating embeddings for ${chunks.length} chunks...`)

    // Process in batches to avoid rate limits
    const batchSize = 100
    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize)

      const response = await this.openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: batch.map(c => c.content)
      })

      batch.forEach((chunk, idx) => {
        chunk.embedding = response.data[idx].embedding
      })

      console.log(`  Processed ${Math.min(i + batchSize, chunks.length)}/${chunks.length}`)
    }

    this.chunks = chunks
  }

  /**
   * Step 3: Search for relevant chunks
   */
  async search(query: string, topK: number = 3): Promise<SearchResult[]> {
    // Generate query embedding
    const queryEmbedding = await this.openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: query
    })

    const queryVector = queryEmbedding.data[0].embedding

    // Calculate cosine similarity for all chunks
    const results: SearchResult[] = this.chunks
      .map(chunk => ({
        chunk,
        score: this.cosineSimilarity(queryVector, chunk.embedding!)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, topK)

    return results
  }

  /**
   * Step 4: Generate response with context
   */
  async query(question: string, topK: number = 3): Promise<string> {
    // Search for relevant context
    const results = await this.search(question, topK)

    // Build context from search results
    const context = results
      .map((r, i) => `[${i + 1}] ${r.chunk.content}`)
      .join('\n\n')

    // Generate response with LLM
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are a helpful assistant that answers questions based on the provided context.
If the context doesn't contain relevant information, say so.`
        },
        {
          role: 'user',
          content: `Context:\n${context}\n\nQuestion: ${question}`
        }
      ],
      temperature: 0.7
    })

    return response.choices[0].message.content || ''
  }

  /**
   * Utility: Cosine similarity between two vectors
   */
  private cosineSimilarity(a: number[], b: number[]): number {
    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0)
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0))
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0))
    return dotProduct / (magnitudeA * magnitudeB)
  }
}

/**
 * Example Usage
 */
export async function example() {
  const rag = new SimpleRAGPipeline()

  // Sample documents
  const documents: Document[] = [
    {
      id: 'doc1',
      content: `
        The Eiffel Tower is an iron lattice tower in Paris, France.
        It was constructed in 1889 and stands at 330 meters tall.
        It was the tallest man-made structure in the world until 1930.
      `,
      metadata: { source: 'Encyclopedia', topic: 'Architecture' }
    },
    {
      id: 'doc2',
      content: `
        Paris is the capital of France and is known for its art, fashion, and culture.
        The city has a population of over 2 million people.
        Famous landmarks include the Louvre Museum and Notre-Dame Cathedral.
      `,
      metadata: { source: 'Travel Guide', topic: 'Geography' }
    },
    {
      id: 'doc3',
      content: `
        French cuisine is renowned worldwide for its quality and diversity.
        Famous dishes include croissants, baguettes, coq au vin, and crème brûlée.
        France is also famous for its wine and cheese production.
      `,
      metadata: { source: 'Food Guide', topic: 'Cuisine' }
    }
  ]

  console.log('Step 1: Chunking documents...')
  const chunks = await rag.chunkDocuments(documents, 200, 50)
  console.log(`Created ${chunks.length} chunks\n`)

  console.log('Step 2: Generating embeddings...')
  await rag.generateEmbeddings(chunks)
  console.log('Embeddings generated!\n')

  console.log('Step 3: Querying...')
  const questions = [
    'How tall is the Eiffel Tower?',
    'What is Paris known for?',
    'What are some famous French dishes?'
  ]

  for (const question of questions) {
    console.log(`\nQ: ${question}`)
    const answer = await rag.query(question)
    console.log(`A: ${answer}`)
  }
}

// Run example if executed directly
if (require.main === module) {
  example().catch(console.error)
}
