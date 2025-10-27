# ChromaDB Integration

Complete ChromaDB integration for embedded vector storage and retrieval in RAG (Retrieval-Augmented Generation) applications.

## Overview

ChromaDB is an open-source embedding database that makes it easy to build LLM applications. It provides:

- **Embedded Mode**: No separate server required - perfect for prototyping
- **Client-Server Mode**: Production-ready with persistent storage
- **Vector Similarity Search**: Fast nearest-neighbor search with multiple distance metrics
- **Metadata Filtering**: Advanced filtering capabilities for precise retrieval
- **Batch Operations**: Efficient handling of large datasets

## Installation

```bash
npm install chromadb
```

Or with yarn:

```bash
yarn add chromadb
```

## Quick Start

### Embedded Mode (No External Service Required)

Perfect for development and prototyping:

```typescript
import { ChromaClient } from './client'

// Initialize client with embedded mode
const client = new ChromaClient({
  path: './chroma_db' // Data persisted to local directory
})

// Create a collection
await client.createCollection('documents', {
  metadata: {
    description: 'Document embeddings',
    'hnsw:space': 'cosine' // Distance metric: cosine, l2, or ip
  }
})

// Upsert vectors
await client.upsert('documents', {
  ids: ['doc1', 'doc2', 'doc3'],
  embeddings: [
    [0.1, 0.2, 0.3, ...], // 384-dimensional vector
    [0.4, 0.5, 0.6, ...],
    [0.7, 0.8, 0.9, ...]
  ],
  metadatas: [
    { title: 'Getting Started', category: 'docs' },
    { title: 'Advanced Topics', category: 'docs' },
    { title: 'API Reference', category: 'api' }
  ],
  documents: [
    'Getting started with ChromaDB...',
    'Advanced ChromaDB features...',
    'Complete API documentation...'
  ]
})

// Search with metadata filtering
const queryVector = [0.15, 0.25, 0.35, ...] // Your query embedding
const results = await client.search('documents', queryVector, {
  limit: 5,
  filter: { category: 'docs' }
})

console.log(results)
```

### Client-Server Mode

For production deployments:

```typescript
const client = new ChromaClient({
  url: 'http://localhost:8000',
  auth: 'your-auth-token' // Optional
})
```

## Configuration

### Environment Variables

Create a `.env` file:

```bash
# Embedded mode (default)
CHROMA_PATH=./chroma_db

# Client-server mode
CHROMA_URL=http://localhost:8000
CHROMA_AUTH_TOKEN=your-token-here
```

Then use:

```typescript
import { createChromaClient } from './client'

const client = createChromaClient()
```

### Running ChromaDB Server (Optional)

For client-server mode:

```bash
# Using Docker
docker pull chromadb/chroma
docker run -p 8000:8000 chromadb/chroma

# Or using pip
pip install chromadb
chroma run --path ./chroma_data
```

## API Reference

### Client Initialization

```typescript
const client = new ChromaClient({
  path?: string      // Local path for embedded mode (default: './chroma_db')
  url?: string       // Server URL for client-server mode
  auth?: string      // Authentication token (optional)
})
```

### Collection Management

#### Create Collection

```typescript
await client.createCollection(name: string, config?: {
  metadata?: Record<string, any>
  embeddingFunction?: any
})
```

**Distance Metrics:**
- `cosine`: Cosine similarity (recommended for normalized vectors)
- `l2`: Euclidean distance (L2 norm)
- `ip`: Inner product

```typescript
await client.createCollection('embeddings', {
  metadata: {
    'hnsw:space': 'cosine',
    description: 'My embeddings'
  }
})
```

#### Get or Create Collection

```typescript
const collection = await client.getOrCreateCollection(name, config?)
```

#### Delete Collection

```typescript
await client.deleteCollection(name: string)
```

#### List Collections

```typescript
const collections = await client.listCollections()
console.log(collections) // ['docs', 'embeddings', 'products']
```

### Vector Operations

#### Upsert (Add or Update)

Supports batch operations with progress tracking:

```typescript
await client.upsert(collectionName: string, params: {
  ids: string[]
  embeddings: number[][]
  metadatas?: Record<string, any>[]
  documents?: string[]
}, options?: {
  batchSize?: number                              // Default: 100
  onProgress?: (current: number, total: number) => void
})
```

**Example:**

```typescript
await client.upsert('documents', {
  ids: ['doc1', 'doc2'],
  embeddings: [[0.1, 0.2, ...], [0.3, 0.4, ...]],
  metadatas: [
    { title: 'Doc 1', author: 'Alice', tags: ['ai', 'ml'] },
    { title: 'Doc 2', author: 'Bob', tags: ['data'] }
  ],
  documents: ['Document 1 text...', 'Document 2 text...']
}, {
  batchSize: 100,
  onProgress: (current, total) => {
    console.log(`Progress: ${current}/${total}`)
  }
})
```

#### Add Vectors

```typescript
await client.addVectors(collectionName: string, params: AddVectorsParams)
```

#### Update Vectors

```typescript
await client.updateVectors(collectionName: string, params: AddVectorsParams)
```

### Search Operations

#### Vector Similarity Search

```typescript
const results = await client.search(
  collectionName: string,
  queryEmbeddings: number[] | number[][],
  options?: {
    nResults?: number          // Number of results (default: 10)
    limit?: number             // Alias for nResults
    where?: Record<string, any> // Metadata filter
    filter?: Record<string, any> // Alias for where
    whereDocument?: Record<string, any> // Document content filter
    include?: Array<'embeddings' | 'metadatas' | 'documents' | 'distances'>
  }
)
```

**Metadata Filtering Examples:**

```typescript
// Exact match
const results1 = await client.search('docs', queryVector, {
  filter: { category: 'tutorial' }
})

// Multiple conditions
const results2 = await client.search('docs', queryVector, {
  filter: {
    category: 'tutorial',
    author: 'Alice'
  }
})

// Numeric comparison
const results3 = await client.search('docs', queryVector, {
  filter: {
    rating: { $gte: 4.5 }  // Greater than or equal
  }
})

// Array contains
const results4 = await client.search('docs', queryVector, {
  filter: {
    tags: { $contains: 'ai' }
  }
})
```

#### Get by IDs

```typescript
const vectors = await client.getByIds(
  collectionName: string,
  ids: string[],
  options?: {
    include?: Array<'embeddings' | 'metadatas' | 'documents'>
  }
)
```

#### Get All

```typescript
const all = await client.getAll(
  collectionName: string,
  options?: {
    where?: Record<string, any>
    limit?: number
    offset?: number
    include?: Array<'embeddings' | 'metadatas' | 'documents'>
  }
)
```

### Delete Operations

#### Delete by IDs

```typescript
await client.deleteByIds(collectionName: string, ids: string[])
```

#### Delete by Filter

```typescript
await client.deleteByFilter(collectionName: string, where: Record<string, any>)
```

**Example:**

```typescript
// Delete all documents with category 'draft'
await client.deleteByFilter('documents', { category: 'draft' })
```

### Collection Statistics

#### Count

```typescript
const count = await client.count(collectionName: string)
console.log(`Collection has ${count} vectors`)
```

#### Peek

View first N items:

```typescript
const sample = await client.peek(collectionName: string, limit?: number)
```

### Health & Maintenance

#### Version

```typescript
const version = await client.version()
console.log(`ChromaDB version: ${version}`)
```

#### Heartbeat

Health check:

```typescript
const latency = await client.heartbeat()
console.log(`Server latency: ${latency}ms`)
```

#### Reset

**Warning:** Deletes all collections and data!

```typescript
await client.reset()
```

## Utility Functions

### Vector Operations

```typescript
import {
  normalizeVector,
  cosineSimilarity,
  euclideanDistance,
  l2Distance
} from './client'

// Normalize vector for cosine similarity
const normalized = normalizeVector([1, 2, 3])

// Calculate similarity
const similarity = cosineSimilarity(vectorA, vectorB)
const distance = euclideanDistance(vectorA, vectorB)
```

### Text Processing

```typescript
import { chunkText, generateId } from './client'

// Chunk long documents
const text = 'Very long document text...'
const chunks = chunkText(text, 500, 50) // chunkSize: 500, overlap: 50

// Generate unique IDs
const id = generateId(text, 'doc') // doc_123456789_1234567890
```

### Batch Processing

```typescript
import { batchArray } from './client'

const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
const batches = batchArray(items, 3)
// [[1, 2, 3], [4, 5, 6], [7, 8, 9], [10]]
```

## Advanced Patterns

### Complete RAG Pipeline

```typescript
import { ChromaClient, chunkText, generateId } from './client'
import { embed } from 'your-embedding-provider'

async function ingestDocument(client: ChromaClient, text: string) {
  // 1. Chunk the document
  const chunks = chunkText(text, 500, 50)

  // 2. Generate embeddings
  const embeddings = await Promise.all(
    chunks.map(chunk => embed(chunk))
  )

  // 3. Generate IDs
  const ids = chunks.map((chunk, i) => generateId(chunk, 'chunk'))

  // 4. Upsert to ChromaDB
  await client.upsert('documents', {
    ids,
    embeddings,
    documents: chunks,
    metadatas: chunks.map((chunk, i) => ({
      chunk_index: i,
      total_chunks: chunks.length,
      timestamp: Date.now()
    }))
  }, {
    batchSize: 100,
    onProgress: (current, total) => {
      console.log(`Ingesting: ${current}/${total}`)
    }
  })
}

async function queryDocuments(client: ChromaClient, query: string) {
  // 1. Embed the query
  const queryEmbedding = await embed(query)

  // 2. Search ChromaDB
  const results = await client.search('documents', queryEmbedding, {
    limit: 5,
    include: ['documents', 'metadatas', 'distances']
  })

  // 3. Return formatted results
  return results.ids[0].map((id, i) => ({
    id,
    document: results.documents?.[0][i],
    metadata: results.metadatas?.[0][i],
    score: 1 - (results.distances?.[0][i] || 0) // Convert distance to similarity
  }))
}
```

### Multi-Collection Search

```typescript
async function searchAcrossCollections(
  client: ChromaClient,
  collections: string[],
  queryVector: number[],
  limit: number = 5
) {
  const results = await Promise.all(
    collections.map(collection =>
      client.search(collection, queryVector, { limit })
    )
  )

  // Combine and sort by distance
  const combined = results.flatMap((result, collectionIdx) =>
    result.ids[0].map((id, i) => ({
      collection: collections[collectionIdx],
      id,
      document: result.documents?.[0][i],
      distance: result.distances?.[0][i] || Infinity
    }))
  )

  return combined
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit)
}
```

### Incremental Updates

```typescript
async function updateDocument(
  client: ChromaClient,
  docId: string,
  newText: string,
  newEmbedding: number[]
) {
  // Fetch existing metadata
  const existing = await client.getByIds('documents', [docId])

  // Update with new data while preserving metadata
  await client.upsert('documents', {
    ids: [docId],
    embeddings: [newEmbedding],
    documents: [newText],
    metadatas: [{
      ...existing.metadatas?.[0],
      updated_at: Date.now()
    }]
  })
}
```

## Performance Tips

### 1. Batch Size Optimization

```typescript
// For large datasets, tune batch size based on vector dimensions
const batchSize = Math.floor(10000 / (dimensions / 100))

await client.upsert(collection, data, { batchSize })
```

### 2. Distance Metric Selection

- **Cosine**: Best for normalized embeddings (most LLM providers)
- **L2**: Good for unnormalized vectors, more sensitive to magnitude
- **IP (Inner Product)**: Fast but requires careful normalization

```typescript
await client.createCollection('docs', {
  metadata: { 'hnsw:space': 'cosine' }
})
```

### 3. Metadata Filtering

Use metadata filters to reduce search space:

```typescript
// Instead of searching everything
const results1 = await client.search(collection, query, { limit: 100 })

// Filter first, then search (faster)
const results2 = await client.search(collection, query, {
  limit: 10,
  filter: { category: 'relevant' }
})
```

### 4. Connection Pooling

Reuse client instances:

```typescript
import { getChromaClient } from './client'

// Singleton pattern
const client = getChromaClient()
```

## Troubleshooting

### Common Issues

#### 1. "Collection already exists"

```typescript
// Use getOrCreateCollection instead
const collection = await client.getOrCreateCollection('docs')
```

#### 2. Dimension Mismatch

Ensure all vectors in a collection have the same dimensions:

```typescript
// Bad: Mixed dimensions
embeddings: [[0.1, 0.2], [0.3, 0.4, 0.5]] // Error!

// Good: Consistent dimensions
embeddings: [[0.1, 0.2, 0.3], [0.4, 0.5, 0.6]]
```

#### 3. Memory Issues with Large Batches

Reduce batch size:

```typescript
await client.upsert(collection, data, {
  batchSize: 50 // Reduce from default 100
})
```

#### 4. Slow Searches

- Ensure proper distance metric configuration
- Use metadata filtering to reduce search space
- Consider using client-server mode for large datasets

## Migration Guide

### From Pinecone

```typescript
// Pinecone
await pinecone.upsert({
  vectors: [{ id: 'id1', values: [...], metadata: {...} }]
})

// ChromaDB
await client.upsert('collection', {
  ids: ['id1'],
  embeddings: [[...]],
  metadatas: [{...}]
})
```

### From Weaviate

```typescript
// Weaviate
await weaviate.data.creator()
  .withClassName('Documents')
  .withVector([...])
  .withProperties({...})
  .do()

// ChromaDB
await client.upsert('Documents', {
  ids: ['id1'],
  embeddings: [[...]],
  metadatas: [{...}]
})
```

## Resources

- [ChromaDB Documentation](https://docs.trychroma.com/)
- [ChromaDB GitHub](https://github.com/chroma-core/chroma)
- [Embedding Models Guide](https://docs.trychroma.com/embeddings)
- [Production Deployment](https://docs.trychroma.com/deployment)

## License

This integration follows ChromaDB's Apache 2.0 License.
