# Semantic Search MCP Server

Semantic search and retrieval operations for RAG implementations.

## What This MCP Does

- 🔍 **Semantic Search** - Vector similarity search with cosine distance
- 🔀 **Hybrid Search** - Combines semantic + keyword search
- 🎯 **Re-ranking** - Improves result relevance with query analysis
- 📚 **Citation Extraction** - Formats results with proper citations
- 📊 **Result Formatting** - Structured output for RAG pipelines

## Installation

```bash
cd MCP-SERVERS/semantic-search-mcp
npm install
npm run build
```

## Setup

Add to your Claude MCP settings:

```json
{
  "mcpServers": {
    "semantic-search": {
      "command": "node",
      "args": ["/path/to/semantic-search-mcp/dist/index.js"]
    }
  }
}
```

## Dependencies

This MCP works alongside:
- `vector-database-mcp` - For persistent vector storage
- `embedding-generator-mcp` - For query embedding

## Tools

### 1. `configure`
Configure search settings.

```typescript
{
  vectorDbUrl?: string;
  embeddingProvider?: 'openai' | 'cohere';
  reranker?: 'cohere' | 'none';
  topK?: number; // default: 10
}
```

### 2. `index_document`
Index a document with its embedding.

```typescript
{
  id: string;
  text: string;
  embedding: number[];
  metadata?: Record<string, any>;
}
```

### 3. `search`
Perform semantic search.

```typescript
{
  query?: string;
  queryEmbedding: number[];
  topK?: number;
  filter?: Record<string, any>;
}
```

### 4. `hybrid_search`
Combine semantic + keyword search.

```typescript
{
  query: string;
  queryEmbedding: number[];
  alpha?: number; // 0-1, default 0.7 (semantic weight)
  topK?: number;
}
```

### 5. `rerank_results`
Re-rank results for better relevance.

```typescript
{
  query: string;
  results: Array<{ id: string; text: string; score: number }>;
  topK?: number;
}
```

### 6. `extract_citations`
Format results as citations.

```typescript
{
  results: Array<{ id: string; text: string; metadata?: any }>;
}
```

### 7. `list_documents`
List all indexed documents.

## Usage Example

```javascript
// 1. Configure
await semanticSearch.configure({
  embeddingProvider: 'openai',
  topK: 5,
});

// 2. Index documents
await semanticSearch.index_document({
  id: 'doc1',
  text: 'Machine learning is a subset of AI...',
  embedding: [0.1, 0.2, ...], // from embedding-generator-mcp
  metadata: { source: 'textbook', chapter: 1 },
});

// 3. Search
const results = await semanticSearch.search({
  query: 'What is machine learning?',
  queryEmbedding: [0.15, 0.22, ...], // from embedding-generator-mcp
  topK: 3,
});

// 4. Re-rank for better relevance
const reranked = await semanticSearch.rerank_results({
  query: 'What is machine learning?',
  results: results.results,
  topK: 3,
});

// 5. Extract citations
const citations = await semanticSearch.extract_citations({
  results: reranked.results,
});
```

## Search Algorithms

### Semantic Search
- Uses cosine similarity between query and document embeddings
- Supports metadata filtering
- Returns top-K results by similarity score

### Hybrid Search
- Combines semantic (vector) and keyword (BM25-like) scoring
- `alpha` parameter controls the balance:
  - `alpha = 1.0`: Pure semantic search
  - `alpha = 0.5`: Equal weight
  - `alpha = 0.0`: Pure keyword search
- Recommended: `alpha = 0.7` for most cases

### Re-ranking
- Boosts results where query terms appear early in text
- Increases score for high query term coverage
- Simple implementation - use Cohere re-ranker for production

## Integration with RAG

This MCP is designed to work in a RAG pipeline:

```
1. embedding-generator-mcp → Generate query embedding
2. semantic-search-mcp → Find relevant documents
3. semantic-search-mcp → Re-rank results
4. semantic-search-mcp → Extract citations
5. LLM → Generate response with citations
```

## Performance

- In-memory storage (suitable for <10k documents)
- For larger datasets, use with `vector-database-mcp`
- Cosine similarity: O(n*d) where n=docs, d=dimensions
- Hybrid search adds keyword matching overhead

## Limitations

- No persistent storage (use `vector-database-mcp` for that)
- Simple re-ranking algorithm (consider Cohere for production)
- No BM25 implementation (basic keyword matching only)
- Single-threaded (no parallel search)

## Roadmap

- [ ] Integration with Cohere re-ranker
- [ ] BM25 keyword search algorithm
- [ ] Persistent storage connector
- [ ] Approximate nearest neighbor (ANN) search
- [ ] Query expansion and rewriting
- [ ] Result diversity and de-duplication

## Testing

```bash
npm test
```

## Related

- **Enables:** `rag-implementer` skill
- **Depends on:** `vector-database-mcp`, `embedding-generator-mcp`
- **Use case:** Document search, Q&A systems, knowledge bases
