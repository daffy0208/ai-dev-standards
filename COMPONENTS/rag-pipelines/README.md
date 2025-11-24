# RAG Pipeline Components

Reusable, production-ready components for building Retrieval-Augmented Generation (RAG) pipelines.

## Components Overview

### 1. Document Loader (270 lines)

**File**: `document-loader.ts`

Load documents from multiple sources with comprehensive format support.

**Features:**

- Multi-source loading (files, directories, URLs)
- Format support: TXT, MD, HTML, JSON, CSV, PDF, DOCX
- Parallel loading with concurrency control
- Automatic metadata extraction
- File size limits and validation
- Error handling and retry logic

### 2. Text Chunker (482 lines)

**File**: `text-chunker.ts`

Smart text chunking with multiple strategies for optimal semantic preservation.

**Features:**

- Multiple chunking strategies:
  - Fixed-size chunking (fast, predictable)
  - Recursive chunking (respects structure)
  - Semantic chunking (AI-powered boundaries)
  - Sentence-based chunking (natural boundaries)
  - Markdown-aware chunking (preserves headers)
- Configurable overlap between chunks
- Token counting (multiple tokenizers)
- Context preservation across chunks
- Chunk quality validation
- Automatic chunk size recommendation

**New in Phase 1.5:**

- `ChunkingUtils` class for advanced analysis
- `analyzeText()` - Recommends optimal chunking parameters
- `validateChunk()` - Quality scoring for chunks
- `mergeSmallChunks()` - Post-processing utility

### 3. Embedding Pipeline (516 lines)

**File**: `embedding-pipeline.ts`

Generate and manage embeddings with multi-provider support.

**Features:**

- Batch embedding generation
- Multi-provider support:
  - OpenAI (text-embedding-3-small, text-embedding-3-large)
  - Cohere (embed-english-v3.0)
  - HuggingFace (sentence-transformers)
- Intelligent caching layer with TTL
- Automatic retry with exponential backoff
- Progress tracking callbacks
- Dimension detection

**New in Phase 1.5:**

- Vector similarity functions (cosine, euclidean, dot product)
- `SimilarityCalculator` class with:
  - Similarity matrix computation
  - K-nearest neighbors search
  - K-means clustering
- `EmbeddingCacheManager` class with:
  - Persistent cache with expiration
  - LRU eviction policy
  - Import/export functionality
  - Cache statistics

### 4. Vector Store Client (527 lines)

**File**: `vector-store-client.ts`

Unified interface for multiple vector database providers.

**Features:**

- Provider-agnostic API
- Supported databases:
  - Pinecone
  - Weaviate
  - Chroma
  - Qdrant
  - PgVector
- Connection pooling
- Batch upsert operations
- Similarity search with metadata filtering
- Collection management
- Migration utilities between providers

### 5. Retrieval Pipeline (617 lines)

**File**: `retrieval-pipeline.ts`

Complete retrieval pipeline with advanced query processing.

**Features:**

- Multiple search types:
  - Vector similarity search
  - Keyword search
  - Hybrid search (fusion of both)
- Query expansion and rewriting
- Result reranking algorithms
- Fusion methods (RRF, weighted, max)
- Context window management
- Result formatting

**New in Phase 1.5:**

- `QueryRewriter` class with:
  - Synonym expansion
  - HyDE (Hypothetical Document Embeddings)
  - Query decomposition
  - Stop word removal
- `ResultReranker` class with:
  - Keyword-based reranking
  - Metadata boosting
  - Recency scoring
  - MMR (Maximal Marginal Relevance) for diversity
- `RetrievalMetrics` class with:
  - Precision@K
  - Recall@K
  - Mean Reciprocal Rank (MRR)
  - NDCG@K (Normalized Discounted Cumulative Gain)

### 6. RAG Orchestrator (578 lines)

**File**: `rag-orchestrator.ts`

End-to-end RAG pipeline orchestration with monitoring.

**Features:**

- Complete workflow automation:
  1. Document loading
  2. Text chunking
  3. Embedding generation
  4. Vector storage
  5. Query processing
  6. Retrieval and ranking
- Multi-document batch processing
- Progress tracking and callbacks
- Error handling and recovery
- Indexing statistics
- Query optimization

**New in Phase 1.5:**

- `RAGMonitor` class for performance tracking:
  - Query count and timing
  - Cache hit/miss rates
  - Error logging
  - Metrics export

## Quick Start

### Basic Usage

```typescript
import { RAGOrchestrator } from './rag-orchestrator'
import { MemoryVectorStore } from '@langchain/community/vectorstores/memory'
import { OpenAIEmbeddings } from '@langchain/openai'

// 1. Initialize vector store
const vectorStore = new MemoryVectorStore(new OpenAIEmbeddings())

// 2. Create RAG orchestrator
const rag = new RAGOrchestrator({
  vectorStore,
  embeddingProvider: 'openai',
  embeddingModel: 'text-embedding-3-small',
  chunkSize: 1000,
  chunkOverlap: 200,
  searchType: 'hybrid',
  rerank: true,
  onProgress: progress => {
    console.log(`${progress.stage}: ${progress.current}/${progress.total}`)
  }
})

// 3. Index documents
const result = await rag.indexDocuments([
  { path: './docs/guide.md', type: 'md' },
  { path: './docs/api.pdf', type: 'pdf' }
])

console.log(`Indexed ${result.chunksCreated} chunks in ${result.timeMs}ms`)

// 4. Query
const queryResult = await rag.query('What is RAG?', {
  topK: 5,
  rerank: true,
  scoreThreshold: 0.7
})

console.log(`Found ${queryResult.documents.length} relevant documents`)
queryResult.documents.forEach((doc, i) => {
  console.log(`${i + 1}. Score: ${queryResult.scores[i]}`)
  console.log(doc.pageContent.substring(0, 200))
})
```

## Advanced Examples

### 1. Text Chunking with Analysis

```typescript
import { TextChunker, ChunkingUtils } from './text-chunker'

// Analyze text to get recommendations
const analysis = ChunkingUtils.analyzeText(myDocument)
console.log('Recommended strategy:', analysis.strategy)
console.log('Recommended chunk size:', analysis.recommendedChunkSize)
console.log('Document stats:', analysis.stats)

// Create chunker with recommended settings
const chunker = new TextChunker({
  chunkSize: analysis.recommendedChunkSize,
  chunkOverlap: analysis.recommendedOverlap,
  strategy: analysis.strategy
})

// Chunk the text
const chunks = await chunker.chunkText(myDocument)

// Validate chunk quality
chunks.forEach((chunk, i) => {
  const validation = ChunkingUtils.validateChunk(chunk)
  if (!validation.valid) {
    console.log(`Chunk ${i} has issues:`, validation.issues)
  }
})

// Merge small chunks
const mergedChunks = ChunkingUtils.mergeSmallChunks(chunks, 100)
```

### 2. Advanced Embedding Pipeline

```typescript
import {
  EmbeddingPipeline,
  SimilarityCalculator,
  EmbeddingCacheManager
} from './embedding-pipeline'

// Create pipeline with cache
const pipeline = new EmbeddingPipeline({
  provider: 'openai',
  model: 'text-embedding-3-small',
  batchSize: 100,
  cache: true,
  onProgress: ({ current, total }) => {
    console.log(`Embedding: ${current}/${total}`)
  }
})

// Embed documents
const embeddings = await pipeline.embedDocuments(documents)

// Extract embedding vectors
const vectors = embeddings.map(e => e.embedding)

// Compute similarity matrix
const similarityMatrix = SimilarityCalculator.computeSimilarityMatrix(vectors)

// Find most similar documents to a query
const queryEmbedding = await pipeline.embedText('search query')
const similar = SimilarityCalculator.findMostSimilar(queryEmbedding, vectors, 5)

console.log('Most similar documents:', similar)

// Cluster documents
const clusters = SimilarityCalculator.clusterVectors(vectors, 3)
console.log('Document clusters:', clusters)

// Advanced cache management
const cacheManager = new EmbeddingCacheManager(10000, 7 * 24 * 60 * 60 * 1000)
const cached = cacheManager.get('some text')
if (!cached) {
  const embedding = await pipeline.embedText('some text')
  cacheManager.set('some text', embedding)
}

// Export/import cache
const cacheJson = cacheManager.export()
// Later...
cacheManager.import(cacheJson)

// Clean expired entries
const cleaned = cacheManager.cleanExpired()
console.log(`Cleaned ${cleaned} expired entries`)
```

### 3. Advanced Retrieval with Query Rewriting

```typescript
import {
  RetrievalPipeline,
  QueryRewriter,
  ResultReranker,
  RetrievalMetrics
} from './retrieval-pipeline'

// Create retrieval pipeline
const retrieval = new RetrievalPipeline({
  vectorStore,
  searchType: 'hybrid',
  topK: 20,
  rerank: true,
  fusionMethod: 'rrf'
})

// Rewrite query for better retrieval
const originalQuery = 'How to implement authentication?'
const expandedQueries = QueryRewriter.expandWithSynonyms(originalQuery)
const decomposed = QueryRewriter.decomposeQuery(originalQuery)
const simplified = QueryRewriter.simplifyQuery(originalQuery)

console.log('Expanded queries:', expandedQueries)
console.log('Decomposed queries:', decomposed)
console.log('Simplified query:', simplified)

// Retrieve with original query
let results = await retrieval.retrieve(originalQuery)

// Apply custom reranking
results.documents = ResultReranker.rerankByKeywords(
  originalQuery,
  results.documents.map((doc, i) => [doc, results.scores[i]])
).map(([doc]) => doc)

// Rerank by metadata (prefer recent documents)
results.documents = ResultReranker.rerankByMetadata(
  results.documents.map((doc, i) => [doc, results.scores[i]]),
  { category: 'tutorial' }
).map(([doc]) => doc)

// Rerank by recency
results.documents = ResultReranker.rerankByRecency(
  results.documents.map((doc, i) => [doc, results.scores[i]]),
  0.3 // 30% weight on recency
).map(([doc]) => doc)

// Apply diversity (MMR)
const diverseResults = ResultReranker.rerankByDiversity(
  results.documents.map((doc, i) => [doc, results.scores[i]]),
  0.7 // Balance between relevance (0.7) and diversity (0.3)
)

// Evaluate retrieval quality
const relevantDocs = ['doc1', 'doc2', 'doc3'] // Ground truth
const retrievedIds = results.documents.map(d => d.metadata.id)

const precision = RetrievalMetrics.precisionAtK(retrievedIds, relevantDocs, 5)
const recall = RetrievalMetrics.recallAtK(retrievedIds, relevantDocs, 5)
const mrr = RetrievalMetrics.meanReciprocalRank(retrievedIds, relevantDocs)

console.log('Precision@5:', precision)
console.log('Recall@5:', recall)
console.log('MRR:', mrr)

// NDCG with relevance scores
const relevanceScores = new Map([
  ['doc1', 3],
  ['doc2', 2],
  ['doc3', 1]
])
const ndcg = RetrievalMetrics.ndcgAtK(retrievedIds, relevanceScores, 5)
console.log('NDCG@5:', ndcg)
```

### 4. Vector Store Operations

```typescript
import { VectorStoreClient, createVectorStoreClient } from './vector-store-client'

// Create client from environment variables
const client = createVectorStoreClient('pinecone', {
  apiKey: process.env.PINECONE_API_KEY,
  environment: 'us-west1-gcp'
})

// Create a collection
await client.createCollection('documents', {
  dimension: 1536,
  metric: 'cosine'
})

// Batch upsert with progress tracking
await client.batchUpsert('documents', vectors, {
  batchSize: 100,
  onProgress: (current, total) => {
    console.log(`Upserting: ${current}/${total}`)
  }
})

// Search with metadata filtering
const results = await client.search('documents', queryVector, {
  topK: 10,
  scoreThreshold: 0.7,
  filter: {
    category: 'tutorial',
    language: 'en'
  },
  includeMetadata: true
})

// Migrate to another provider
const targetClient = new VectorStoreClient({
  provider: 'qdrant',
  url: 'http://localhost:6333'
})

await client.migrate('documents', targetClient, {
  batchSize: 100,
  onProgress: (current, total) => {
    console.log(`Migrating: ${current}/${total}`)
  }
})
```

### 5. Performance Monitoring

```typescript
import { RAGMonitor } from './rag-orchestrator'

// Create monitor
const monitor = new RAGMonitor()

// Record queries
const startTime = Date.now()
const result = await rag.query('test query')
const executionTime = Date.now() - startTime

monitor.recordQuery(executionTime, false) // Not cached

// Record errors
try {
  await rag.query('bad query')
} catch (error) {
  monitor.recordError(error.message)
}

// Get metrics
const metrics = monitor.getMetrics()
console.log('Query metrics:', {
  queryCount: metrics.queryCount,
  avgQueryTime: metrics.avgQueryTime,
  cacheHitRate: metrics.cacheHitRate,
  errorCount: metrics.errors.length
})

// Export metrics for analysis
const metricsJson = monitor.exportMetrics()
// Send to monitoring service...

// Reset for new measurement period
monitor.reset()
```

## Supported Skills

- rag-implementer
- knowledge-base-manager
- semantic-search

## Supported MCPs

- vector-database-mcp
- embedding-generator-mcp
- semantic-search-mcp
- knowledge-base-mcp

## License

MIT
