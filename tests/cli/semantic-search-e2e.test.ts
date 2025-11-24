import { describe, it, expect } from 'vitest'
import { SemanticSearchServer } from '../../MCP-SERVERS/semantic-search-mcp/src/index.js'

const embedding = (value: number) => Array(8).fill(value)

describe('semantic-search MCP e2e', () => {
  it('indexes and searches documents using the in-memory vector store', async () => {
    const server = new SemanticSearchServer()

    await server.executeTool('index_document', {
      id: 'doc-1',
      text: 'Embeddings let us represent documents numerically',
      embedding: embedding(0.5),
      metadata: { topic: 'embeddings', text: 'Embeddings let us represent documents numerically' }
    })

    const response = await server.executeTool('search', {
      query: 'What are embeddings?',
      queryEmbedding: embedding(0.5),
      topK: 1
    })

    const content = response.content?.[0]
    expect(content?.type).toBe('text')
    const payload = JSON.parse(content?.text || '{}')
    expect(payload.results).toHaveLength(1)
    expect(payload.results[0].id).toBe('doc-1')
    expect(payload.provider).toBe('memory')
  })
})
