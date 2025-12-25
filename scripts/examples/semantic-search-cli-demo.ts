import { SemanticSearchServer } from '../../mcp-servers/semantic-search-mcp/src/index.js'

type ToolResponse = Awaited<ReturnType<SemanticSearchServer['executeTool']>>

function createDeterministicEmbedding(text: string, dimensions = 384): number[] {
  const vector = new Array(dimensions).fill(0)
  let seed = 0

  for (const char of text) {
    seed += char.charCodeAt(0)
  }

  for (let i = 0; i < dimensions; i++) {
    seed = (seed * 9301 + 49297) % 233280
    const value = (seed / 233280) * 2 - 1
    vector[i] = value
  }

  const norm = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0)) || 1
  return vector.map(value => value / norm)
}

function logResponse(label: string, response: ToolResponse) {
  const text = response.content?.[0]?.text ?? ''
  console.log(`\n${label}`)
  console.log(text)
}

async function main() {
  const server = new SemanticSearchServer()

  logResponse(
    'Configure semantic search',
    await server.executeTool('configure', { topK: 2, reranker: 'none' })
  )

  const documents = [
    {
      id: 'doc_rag_pattern',
      text: 'Comprehensive guide for building production-grade RAG systems with Claude Code.',
      metadata: { title: 'RAG Playbook', category: 'documentation', source: 'docs/rag' }
    },
    {
      id: 'doc_vector_db',
      text: 'Best practices for selecting vector databases, sharding strategies, and hybrid search.',
      metadata: { title: 'Vector DB Guide', category: 'architecture', source: 'docs/vector-db' }
    },
    {
      id: 'doc_prompt_router',
      text: 'Prompt routing infrastructure used by the brain orchestrator to select MCP patterns.',
      metadata: { title: 'Prompt Router', category: 'architecture', source: 'brain/router' }
    }
  ]

  for (const doc of documents) {
    logResponse(
      `Index ${doc.id}`,
      await server.executeTool('index_document', {
        id: doc.id,
        text: doc.text,
        embedding: createDeterministicEmbedding(doc.text),
        metadata: doc.metadata
      })
    )
  }

  const query = 'How do I choose a vector database for semantic search?'
  const searchResponse = await server.executeTool('search', {
    query,
    queryEmbedding: createDeterministicEmbedding(query),
    topK: 2
  })

  const parsed = JSON.parse(searchResponse.content?.[0]?.text ?? '{}')
  console.log('\nSemantic search results:')
  console.table(
    parsed.results?.map((result: any) => ({
      id: result.id,
      score: result.score,
      title: result.metadata?.title,
      source: result.metadata?.source
    })) ?? []
  )
}

main().catch(error => {
  console.error(error)
  process.exit(1)
})
