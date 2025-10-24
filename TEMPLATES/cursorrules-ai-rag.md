# AI/RAG Project .cursorrules Template

For projects using RAG (Retrieval-Augmented Generation) or other AI features.

```markdown
# Project: [Your AI Product Name]

## AI Development Standards
Repository: ~/ai-dev-standards/
Status: Active

### Instructions for Claude Code

**Always load on session start:**
1. ~/ai-dev-standards/META/PROJECT-CONTEXT.md
2. ~/ai-dev-standards/META/HOW-TO-USE.md
3. ~/ai-dev-standards/META/DECISION-FRAMEWORK.md
4. ~/ai-dev-standards/STANDARDS/architecture-patterns/rag-pattern.md

**Primary Skills:**
- **rag-implementer** - Core RAG methodology
- **api-designer** - Search/query API
- **performance-optimizer** - Query latency optimization
- **multi-agent-architect** - If using multiple agents

### Available Resources
This project has access to:
- **37 Skills** - Including rag-implementer, knowledge-graph-builder, data-engineer
- **34 MCPs** - Including vector-database-mcp, embedding-generator-mcp, semantic-search-mcp
- **9 Tools + 4 Scripts** - vector-search-tool, embedding-tool, web-scraper-tool
- **13 Components** - Including simple-task-agent for agent implementations
- **6 Integrations** - OpenAI, Anthropic, Pinecone (vector DB)

See `META/relationship-mapping.json` for RAG-specific resource dependencies.

---

## Project Context

### What We're Building
[e.g., "AI-powered search for internal company documentation"]

### Use Case
- **Query Type:** [e.g., Factual Q&A, Summarization, Analysis]
- **Users:** [e.g., "Internal employees, customer support team"]
- **Query Volume:** [e.g., "~1000 queries/day expected"]

### Current Phase
- [x] Architecture Design
- [ ] Data Pipeline Development
- [ ] Retrieval Pipeline Implementation
- [ ] API Development
- [ ] Frontend Integration
- [ ] Production Deployment

---

## RAG Architecture

### Architecture Style
**Selected:** [Naive RAG / Advanced RAG / Modular RAG]

**Reasoning:**
- Data size: [e.g., "10k documents → Advanced RAG"]
- Query complexity: [e.g., "Need high accuracy → Re-ranking required"]
- Latency requirement: [e.g., "<3s → Optimized pipeline needed"]

### Components

#### Embedding Model
- **Model:** [e.g., "OpenAI text-embedding-3-large"]
- **Dimensions:** [e.g., "3072 → 1536 (compressed)"]
- **Cost:** [e.g., "$0.00013 per 1k tokens"]
- **Why:** [e.g., "Best performance for English docs, managed service"]

#### Vector Database
- **Database:** [e.g., "Pinecone"]
- **Index Type:** [e.g., "s1.x1 (starter pod)"]
- **Scaling Plan:** [e.g., "Upgrade to p1.x1 at 100k+ docs"]
- **Why:** [e.g., "Managed service, hybrid search support, low latency"]

#### LLM for Generation
- **Model:** [e.g., "GPT-4 Turbo"]
- **Context Window:** [e.g., "128k tokens (using ~8k average)"]
- **Temperature:** [e.g., "0.0 for factual, 0.3 for creative"]
- **Why:** [e.g., "Best accuracy for our domain, citation support"]

#### Re-ranking (if Advanced/Modular RAG)
- **Model:** [e.g., "Cohere Rerank"]
- **Strategy:** [e.g., "Top 20 chunks → Top 5"]
- **Cost:** [e.g., "$1 per 1000 searches"]
- **Why:** [e.g., "Improves relevance by ~15%, worth latency cost"]

---

## Data Pipeline

### Data Sources
1. **[Source 1]:** [e.g., "Confluence - 5k pages"]
   - Update frequency: [e.g., "Daily sync"]
   - Priority: High/Medium/Low
   - Access: [e.g., "API key required"]

2. **[Source 2]:** [e.g., "Google Docs - 2k docs"]
   - Update frequency: [e.g., "Weekly batch"]
   - Priority: High/Medium/Low
   - Access: [e.g., "OAuth required"]

3. **[Source 3]:** [e.g., "Internal Wiki - 1k articles"]
   - Update frequency: [e.g., "Manual trigger"]
   - Priority: High/Medium/Low
   - Access: [e.g., "Direct DB access"]

### Data Processing

#### Chunking Strategy
- **Method:** [e.g., "Semantic chunking by sections"]
- **Chunk Size:** [e.g., "500 tokens with 50 token overlap"]
- **Why:** [e.g., "Preserves context while staying under token limits"]

#### Metadata Schema
```json
{
  "chunk_id": "unique_identifier",
  "source": "confluence|gdocs|wiki",
  "source_url": "https://...",
  "title": "Document title",
  "section": "Section heading",
  "last_updated": "2025-01-15",
  "author": "email@company.com",
  "tags": ["product", "engineering"],
  "access_level": "public|internal|confidential"
}
```

#### Quality Checks
- [ ] Duplicate detection and removal
- [ ] Low-quality content filtering
- [ ] Broken link validation
- [ ] PII detection and redaction
- [ ] Encoding verification

---

## Retrieval Pipeline

### Query Enhancement
- **Multi-query:** [Yes/No - e.g., "Generate 3 variations"]
- **HyDE:** [Yes/No - e.g., "Generate hypothetical document"]
- **Query expansion:** [Yes/No - e.g., "Add synonyms"]
- **Keyword extraction:** [Yes/No - e.g., "Extract for hybrid search"]

### Retrieval Strategy
- **Semantic search:** [e.g., "Top 20 chunks from Pinecone"]
- **Keyword search:** [e.g., "Top 10 from BM25 index" or "None"]
- **Metadata filtering:** [e.g., "By access_level, date range"]
- **Hybrid merging:** [e.g., "RRF (Reciprocal Rank Fusion)"]

### Re-ranking (if applicable)
- **Model:** [e.g., "Cohere Rerank v3"]
- **Input:** [e.g., "Top 30 candidates"]
- **Output:** [e.g., "Top 5 for context"]

### Context Assembly
- **Max tokens:** [e.g., "4000 tokens"]
- **Compression:** [e.g., "LLMLingua if >4k"]
- **Deduplication:** [e.g., "Remove 90%+ similar chunks"]
- **Citation format:** [e.g., "[1], [2] markers"]

---

## API Design

### Endpoints

#### POST /api/search
**Request:**
```json
{
  "query": "How do I configure authentication?",
  "filters": {
    "sources": ["confluence", "wiki"],
    "date_from": "2024-01-01",
    "access_level": "internal"
  },
  "options": {
    "max_results": 5,
    "include_sources": true
  }
}
```

**Response:**
```json
{
  "answer": "To configure authentication...",
  "sources": [
    {
      "content": "Relevant chunk text...",
      "source": "confluence",
      "url": "https://...",
      "title": "Auth Setup Guide",
      "relevance_score": 0.92
    }
  ],
  "metadata": {
    "query_processed": "Enhanced query text",
    "chunks_retrieved": 20,
    "chunks_used": 5,
    "retrieval_time_ms": 180,
    "generation_time_ms": 1200,
    "total_time_ms": 1380
  },
  "confidence": 0.87
}
```

---

## Performance Requirements

### Latency Targets
- **Retrieval:** <300ms (p95)
- **Generation:** <2000ms (p95)
- **Total:** <3000ms (p95)

### Accuracy Targets
- **Retrieval Precision@5:** >0.85
- **Answer Faithfulness:** >0.90
- **Citation Accuracy:** >0.95

### Cost Targets
- **Per query:** <$0.05 average
- **Monthly (1000 queries/day):** <$1500

---

## Tech Stack

### Backend
- **Language:** [e.g., "Python 3.11"]
- **Framework:** [e.g., "FastAPI"]
- **Vector DB Client:** [e.g., "pinecone-client"]
- **LLM SDK:** [e.g., "openai"]

### Infrastructure
- **Hosting:** [e.g., "Railway"]
- **Queue:** [e.g., "Redis for job queue"]
- **Caching:** [e.g., "Redis for query results (15min TTL)"]
- **Monitoring:** [e.g., "Datadog"]

### Frontend
- **Framework:** [e.g., "Next.js 14"]
- **UI Library:** [e.g., "shadcn/ui"]
- **State:** [e.g., "React Query"]

---

## Security & Privacy

### Data Security
- [ ] Encryption at rest (vector DB)
- [ ] Encryption in transit (HTTPS)
- [ ] API authentication (JWT)
- [ ] Rate limiting (100 req/min per user)

### Privacy
- [ ] PII detection and masking
- [ ] Access control by user role
- [ ] Audit logging for all queries
- [ ] Data retention policy (30 days)

### Compliance
- [ ] GDPR compliance (if EU users)
- [ ] SOC 2 (if enterprise)
- [ ] Data residency requirements

---

## Monitoring & Evaluation

### Metrics to Track
- **Usage:** Queries/day, unique users
- **Performance:** Latency (p50, p95, p99)
- **Quality:** User thumbs up/down, explicit feedback
- **Cost:** Embedding cost, LLM cost, DB cost per query

### Evaluation Dataset
- **Size:** [e.g., "100 query-answer pairs"]
- **Coverage:** [e.g., "Product (40%), Engineering (30%), Other (30%)"]
- **Update frequency:** [e.g., "Monthly with new examples"]

### A/B Testing
- [ ] Test embedding models (3-small vs 3-large)
- [ ] Test LLMs (GPT-4 vs Claude)
- [ ] Test retrieval strategies (semantic only vs hybrid)
- [ ] Test re-ranking (with vs without)

---

## Development Workflow

### Data Pipeline Updates
```bash
# Weekly data sync
python scripts/sync_sources.py

# Generate embeddings
python scripts/generate_embeddings.py --source confluence

# Upload to vector DB
python scripts/upload_to_pinecone.py
```

### Testing
- **Unit tests:** Chunking, embedding, query processing
- **Integration tests:** Full retrieval pipeline
- **End-to-end tests:** API with test queries
- **Evaluation:** Run against eval dataset

---

## Instructions for Claude

### When Discussing RAG Architecture
1. Reference **rag-pattern.md** for architecture styles
2. Use **rag-implementer skill** for methodology
3. Explain trade-offs clearly (cost vs accuracy vs latency)

### When Writing Code
1. Follow FastAPI best practices
2. Include error handling for API failures
3. Log all queries for analysis
4. Add retry logic for external services

### When Optimizing Performance
1. Use **performance-optimizer skill**
2. Profile before optimizing
3. Focus on biggest bottlenecks first
4. Test impact of changes

### When Adding Features
1. Validate against requirements (latency, accuracy, cost)
2. Consider impact on existing pipeline
3. A/B test before full rollout

---

## Project-Specific Notes

### Known Issues
- [e.g., "Confluence API rate limits - need retry logic"]
- [e.g., "Some PDFs fail to parse - need fallback"]

### Future Enhancements
- [ ] Multi-modal support (images in docs)
- [ ] Conversational memory (multi-turn)
- [ ] Feedback loop (RLHF on user ratings)
- [ ] Auto-updating index (real-time sync)

---

## Resources

- RAG Pattern: ~/ai-dev-standards/STANDARDS/architecture-patterns/rag-pattern.md
- RAG Skill: ~/ai-dev-standards/SKILLS/rag-implementer/SKILL.md
- Pinecone Docs: https://docs.pinecone.io
- OpenAI Embeddings: https://platform.openai.com/docs/guides/embeddings
```

## How to Use

1. Copy this template
2. Save as `.cursorrules` in your AI project root
3. Fill in all architecture decisions (embedding model, vector DB, etc.)
4. Update data sources and pipeline details
5. Claude will follow RAG best practices from ai-dev-standards automatically
