# Weaviate Integration

Weaviate vector database client for hybrid search (vector + keyword).

## Features

- Vector similarity search
- Hybrid search (combines vector and keyword)
- Batch operations
- Schema management
- Filtering and aggregations
- Alpha parameter for search balance

## Installation

```bash
npm install weaviate-ts-client
```

## Configuration

Set environment variables:

```bash
WEAVIATE_URL=https://your-instance.weaviate.network
WEAVIATE_API_KEY=your-api-key
```

## Usage

```typescript
import { WeaviateClient } from './client';

// Initialize client
const client = new WeaviateClient({
  url: process.env.WEAVIATE_URL!,
  apiKey: process.env.WEAVIATE_API_KEY
});

// Create collection
await client.createClass('Documents');

// Upsert vectors
await client.upsert('Documents', [
  {
    id: 'doc-1',
    vector: [0.1, 0.2, 0.3, ...],
    properties: {
      title: 'Machine Learning Basics',
      content: 'Introduction to ML...',
      author: 'John Doe'
    }
  }
]);

// Hybrid search
const results = await client.hybridSearch('Documents', {
  query: 'machine learning tutorial',
  alpha: 0.5, // Balanced between keyword and vector
  limit: 10
});

console.log(results);
```

## Supported Skills

- rag-implementer
- knowledge-base-manager
- semantic-search

## Supported MCPs

- vector-database-mcp
- semantic-search-mcp

## License

MIT
