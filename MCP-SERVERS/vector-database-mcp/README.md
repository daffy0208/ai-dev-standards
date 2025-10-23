# Vector Database MCP Server

MCP server for vector database operations supporting Pinecone, Weaviate, and Chroma.

## Installation

```bash
npm install
npm run build
```

## Usage

### Pinecone

```typescript
// Connect
{
  "provider": "pinecone",
  "apiKey": "your-api-key",
  "collection": "your-index-name"
}

// Insert vectors
{
  "vectors": [
    { "id": "vec1", "values": [0.1, 0.2, 0.3], "metadata": { "text": "sample" } }
  ]
}

// Search
{
  "query": [0.1, 0.2, 0.3],
  "topK": 5,
  "filter": { "category": "test" }  // optional
}
```

### Weaviate

```typescript
// Connect
{
  "provider": "weaviate",
  "environment": "http://localhost:8080",
  "apiKey": "your-api-key",  // optional
  "collection": "YourClass"
}

// Same insert/search format as above
```

### Chroma

```typescript
// Connect
{
  "provider": "chroma",
  "environment": "http://localhost:8000",
  "collection": "your-collection"
}

// Same insert/search format as above
```

## Tools

| Tool | Description |
|------|-------------|
| `connect` | Connect to vector database |
| `insert_vectors` | Insert vectors with metadata |
| `search_vectors` | Semantic search by vector similarity |
| `delete_vectors` | Delete vectors by IDs |
| `list_collections` | List available collections/indexes |

## Running

```bash
npm start
```

## Testing

```bash
npm test
```
