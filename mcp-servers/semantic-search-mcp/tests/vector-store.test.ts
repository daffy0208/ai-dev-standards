import { describe, it, expect } from 'vitest'
import { InMemoryVectorStore } from '../src/vector-store.js'

const sampleEmbedding = (val: number) => Array(4).fill(val)

describe('InMemoryVectorStore', () => {
  it('stores and queries documents', async () => {
    const store = new InMemoryVectorStore()
    await store.upsert([
      {
        id: 'doc-1',
        text: 'Hello world',
        embedding: sampleEmbedding(1),
        metadata: { topic: 'greeting' }
      }
    ])

    const results = await store.query({ embedding: sampleEmbedding(1), topK: 1 })
    expect(results).toHaveLength(1)
    expect(results[0].id).toBe('doc-1')
    expect(results[0].metadata?.topic).toBe('greeting')
  })
})
