# Qdrant Integration

Qdrant vector database client for high-performance vector search with advanced filtering.

## Features

- **High-performance vector search** with HNSW indexing
- **Advanced filtering** with complex boolean conditions
- **Payload storage** with structured metadata
- **Multiple distance metrics** (Cosine, Euclidean, Dot Product, Manhattan)
- **Batch operations** with progress tracking
- **Snapshots** for backup and recovery
- **Payload indexing** for fast filtered searches
- **Scroll API** for iterating large datasets
- **Cluster support** for distributed deployments

## Installation

```bash
npm install @qdrant/js-client-rest
```

## Configuration

Set environment variables:

```bash
QDRANT_URL=http://localhost:6333
QDRANT_API_KEY=your-api-key  # Optional
```

## Usage

### Basic Setup

```typescript
import { QdrantClient } from './client';

const client = new QdrantClient({
  url: process.env.QDRANT_URL || 'http://localhost:6333',
  apiKey: process.env.QDRANT_API_KEY  // Optional for local
});
```

### Create Collection

```typescript
// Create with Cosine similarity
await client.createCollection('documents', {
  size: 1536,  // OpenAI ada-002 dimensions
  distance: 'Cosine'
});

// Create with advanced options
await client.createCollection('documents', 
  {
    size: 1536,
    distance: 'Cosine'
  },
  {
    hnsw_config: {
      m: 16,
      ef_construct: 100
    },
    replication_factor: 2
  }
);
```

### Upsert Vectors

```typescript
await client.upsert('documents', [
  {
    id: 'doc-1',
    vector: [0.1, 0.2, 0.3, ...],  // 1536 dimensions
    payload: {
      title: 'Introduction to Machine Learning',
      author: 'John Doe',
      category: 'tech',
      year: 2024,
      tags: ['ML', 'AI', 'tutorial']
    }
  },
  {
    id: 'doc-2',
    vector: [0.2, 0.3, 0.4, ...],
    payload: {
      title: 'Advanced Neural Networks',
      author: 'Jane Smith',
      category: 'tech',
      year: 2024,
      tags: ['neural-networks', 'deep-learning']
    }
  }
]);
```

### Vector Search

```typescript
// Basic search
const results = await client.search('documents', {
  vector: queryVector,
  limit: 10
});

// Search with metadata filters
const filtered = await client.search('documents', {
  vector: queryVector,
  filter: {
    must: [
      { key: 'category', match: { value: 'tech' } },
      { key: 'year', range: { gte: 2020 } }
    ]
  },
  limit: 10,
  score_threshold: 0.7  // Minimum similarity score
});

// Complex boolean filters
const complex = await client.search('documents', {
  vector: queryVector,
  filter: {
    must: [
      { key: 'category', match: { value: 'tech' } }
    ],
    should: [
      { key: 'tags', match: { value: 'ML' } },
      { key: 'tags', match: { value: 'AI' } }
    ],
    must_not: [
      { key: 'author', match: { value: 'spam-user' } }
    ]
  },
  limit: 5
});
```

### Batch Search

```typescript
// Search multiple queries in one request
const batchResults = await client.batchSearch('documents', [
  { vector: query1, limit: 5 },
  { vector: query2, limit: 5 },
  { vector: query3, limit: 5 }
]);

// batchResults[0] = results for query1
// batchResults[1] = results for query2
// batchResults[2] = results for query3
```

### Advanced Filtering

```typescript
// Range filters
const rangeFilter = {
  must: [
    { key: 'price', range: { gte: 10, lt: 100 } },
    { key: 'rating', range: { gte: 4.0 } }
  ]
};

// Geo filters
const geoFilter = {
  must: [
    {
      key: 'location',
      geo_radius: {
        center: { lat: 51.5074, lon: -0.1278 },
        radius: 5000  // meters
      }
    }
  ]
};
```

### Payload Operations

```typescript
// Update payload for specific points
await client.updatePayload(
  'documents',
  { views: 1000, featured: true },
  ['doc-1', 'doc-2']
);

// Delete payload fields
await client.deletePayload(
  'documents',
  ['temporary_field'],
  ['doc-1']
);
```

### Payload Indexing

```typescript
// Create index for faster filtered searches
await client.createPayloadIndex('documents', 'category', {
  type: 'keyword'
});

await client.createPayloadIndex('documents', 'year', {
  type: 'integer'
});

await client.createPayloadIndex('documents', 'title', {
  type: 'text'
});
```

### Scroll Through Collection

```typescript
// Iterate through all points
let offset = undefined;
let allPoints = [];

do {
  const { points, next_offset } = await client.scroll('documents', {
    limit: 100,
    offset,
    with_payload: true,
    with_vector: false
  });
  
  allPoints = allPoints.concat(points);
  offset = next_offset;
} while (offset);

console.log(`Total points: ${allPoints.length}`);
```

### Retrieve by IDs

```typescript
// Get specific points
const points = await client.retrieve(
  'documents',
  ['doc-1', 'doc-2', 'doc-3'],
  {
    with_payload: true,
    with_vector: false  // Set true if you need vectors
  }
);
```

### Delete Operations

```typescript
// Delete by IDs
await client.delete('documents', ['doc-1', 'doc-2']);

// Delete by filter
await client.deleteByFilter('documents', {
  must: [
    { key: 'category', match: { value: 'spam' } }
  ]
});

// Clear entire collection
await client.clearCollection('documents');
```

### Snapshots

```typescript
// Create snapshot
const snapshotName = await client.createSnapshot('documents');
console.log(`Created snapshot: ${snapshotName}`);

// List snapshots
const snapshots = await client.listSnapshots('documents');

// Delete snapshot
await client.deleteSnapshot('documents', snapshotName);
```

### Collection Management

```typescript
// Get collection info
const info = await client.getCollection('documents');
console.log(`Vectors: ${info.vectors_count}`);
console.log(`Points: ${info.points_count}`);

// List all collections
const collections = await client.listCollections();

// Count points
const count = await client.count('documents');
const filtered = await client.count('documents', {
  must: [{ key: 'category', match: { value: 'tech' } }]
});

// Delete collection
await client.deleteCollection('documents');
```

### Progress Tracking

```typescript
// Track progress during large upserts
await client.upsert(
  'documents',
  largeVectorArray,
  {
    onProgress: (progress) => {
      console.log(`Progress: ${progress.percentage}% (${progress.processed}/${progress.total})`);
    }
  }
);
```

## Distance Metrics

- **Cosine** - Best for normalized vectors, measures angle
- **Euclid** - Euclidean distance, standard L2 norm
- **Dot** - Dot product, fast but requires normalized vectors
- **Manhattan** - L1 distance, less sensitive to outliers

## Best Practices

1. **Use payload indexing** for frequently filtered fields
2. **Batch operations** when possible for better performance
3. **Set appropriate score thresholds** to filter low-quality results
4. **Use snapshots** for backup before major operations
5. **Monitor collection stats** for optimization opportunities
6. **Leverage filters** to reduce search space before vector comparison
7. **Choose appropriate distance metric** based on your embeddings
8. **Use batch search** for multiple queries to reduce latency

## Performance Tips

- Enable HNSW indexing for faster searches (default)
- Use `with_payload: false` or specific fields when you don't need all metadata
- Use `with_vector: false` unless you need the actual vectors
- Create indexes on frequently queried payload fields
- Use appropriate `ef_construct` and `m` parameters for HNSW
- Consider sharding for very large collections

## Supported Skills

- rag-implementer
- knowledge-base-manager
- semantic-search

## Supported MCPs

- vector-database-mcp
- semantic-search-mcp

## Resources

- [Qdrant Documentation](https://qdrant.tech/documentation/)
- [REST API Reference](https://qdrant.github.io/qdrant/redoc/index.html)
- [Filtering Guide](https://qdrant.tech/documentation/concepts/filtering/)
- [Performance Tuning](https://qdrant.tech/documentation/guides/configuration/)

## License

MIT
