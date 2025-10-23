# Embedding Generator MCP Server

MCP server for generating embeddings with OpenAI and Cohere providers.

## Installation

```bash
npm install
npm run build
```

## Usage

### OpenAI

```typescript
// Configure
{
  "provider": "openai",
  "apiKey": "your-api-key",
  "model": "text-embedding-3-small",  // optional
  "dimensions": 512  // optional, text-embedding-3 only
}

// Single text
{
  "text": "Generate embedding for this text"
}

// Batch
{
  "texts": ["text 1", "text 2", "text 3"]
}
```

### Cohere

```typescript
// Configure
{
  "provider": "cohere",
  "apiKey": "your-api-key",
  "model": "embed-english-v3.0"  // optional
}

// Same generate format as OpenAI
```

## Tools

| Tool | Description |
|------|-------------|
| `configure` | Set up embedding provider (OpenAI/Cohere) |
| `generate_embeddings` | Generate embedding for single text |
| `generate_batch_embeddings` | Generate embeddings for multiple texts |
| `list_models` | List available models for provider |

## Models

**OpenAI:**
- `text-embedding-3-small` - 1536 dims, $0.02/1M tokens (default)
- `text-embedding-3-large` - 3072 dims, $0.13/1M tokens
- `text-embedding-ada-002` - 1536 dims, $0.10/1M tokens (legacy)

**Cohere:**
- `embed-english-v3.0` - 1024 dims, $0.10/1M tokens (default)
- `embed-english-light-v3.0` - 384 dims, $0.10/1M tokens
- `embed-multilingual-v3.0` - 1024 dims, $0.10/1M tokens

## Running

```bash
npm start
```

## Testing

```bash
npm test
```
