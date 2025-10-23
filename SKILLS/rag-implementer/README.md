# RAG Implementer - Quick Start

**Version:** 1.0.0
**Category:** AI-Native Development
**Difficulty:** Intermediate

## What This Skill Does

Guides implementation of production-ready Retrieval-Augmented Generation (RAG) systems from data preparation through deployment and monitoring.

## When to Use

Use this skill when you need to:
- Build knowledge-intensive applications
- Create document search and Q&A systems
- Ground LLM responses in external/proprietary data
- Access fresh information not in LLM training data
- Reduce hallucinations with source attribution

## Quick Start

**Fastest path to RAG:**

1. **Define knowledge scope** (Phase 1)
   - Identify data sources
   - Choose chunking strategy (500-1000 tokens)
   - Add metadata for filtering

2. **Choose embedding model** (Phase 2)
   - General: `text-embedding-3-large` (OpenAI)
   - Code: `code-search-babbage-code-001`
   - Test on sample queries

3. **Set up vector store** (Phase 3)
   - Managed: Pinecone
   - Self-hosted: Weaviate or Qdrant
   - Lightweight: Chroma or pgvector

4. **Build retrieval pipeline** (Phase 4)
   - Hybrid search: semantic + keyword (BM25)
   - Re-rank top results with cross-encoder
   - Return top-5 chunks

5. **Assemble context** (Phase 5)
   - Rank by relevance + recency
   - Remove redundancy
   - Stay under token limits

6. **Evaluate** (Phase 6)
   - Measure: Precision@5, Recall@10, MRR
   - Test faithfulness and hallucination rate
   - Monitor latency (<3 seconds)

**Time to production:** 1-2 weeks for MVP

## File Structure

```
rag-implementer/
├── SKILL.md           # Main skill instructions (start here)
└── README.md          # This file
```

## Prerequisites

**Knowledge:**
- Understanding of embeddings and vector similarity
- Basic LLM concepts
- API integration experience

**Tools:**
- Vector database account (Pinecone, Weaviate, etc.)
- LLM API access (Anthropic Claude, OpenAI)
- Embedding API access (OpenAI, Cohere, etc.)

**Related Skills:**
- None required, but `multi-agent-architect` helps for complex systems

## Success Criteria

You've successfully used this skill when:
- ✅ All 8 RAG phases completed with validation gates checked
- ✅ Retrieval quality: Precision@5 >70%, MRR >0.6
- ✅ Generation quality: Faithfulness >85%, hallucination <10%
- ✅ System performance: End-to-end latency <3 seconds
- ✅ Source citations included in all responses
- ✅ Monitoring and evaluation pipelines deployed

## Common Workflows

### Workflow 1: Document Q&A System
1. Use rag-implementer Phases 1-3 for data prep and vector store
2. Implement hybrid retrieval (Phase 4)
3. Deploy with monitoring (Phase 7)
4. Use `deployment-advisor` for hosting decisions

### Workflow 2: Code Search Assistant
1. Use rag-implementer with code-specific embeddings
2. Add syntax-aware chunking (Phase 1)
3. Implement multi-modal retrieval for code + docs
4. Use `api-designer` for building search API

### Workflow 3: Real-Time Knowledge Base
1. Use rag-implementer with streaming data sources
2. Implement automated updates (Phase 8)
3. Add temporal awareness for freshness weighting
4. Use `performance-optimizer` for latency reduction

## Key Concepts

**RAG vs. Fine-tuning vs. Prompting:**
- **RAG**: Dynamic knowledge, frequently updated data, source attribution needed
- **Fine-tuning**: Static knowledge, reasoning patterns, domain-specific behavior
- **Prompting**: General knowledge already in LLM, task-specific instructions

**3 RAG Architectures:**
1. **Naive RAG**: Simple retrieval → context → generation
2. **Advanced RAG**: Query enhancement, re-ranking, hybrid search
3. **Modular RAG**: Specialized modules (search, memory, routing, prediction)

**8 RAG Phases:**
1. Knowledge base design
2. Embedding strategy
3. Vector store setup
4. Retrieval pipeline
5. Context assembly
6. Evaluation & metrics
7. Production deployment
8. Continuous improvement

## Troubleshooting

**Skill not activating?**
- Try explicitly requesting: "Use the rag-implementer skill to..."
- Mention keywords: "RAG", "vector database", "retrieval", "embeddings"

**Low retrieval accuracy?**
- Check embedding model performance on domain data
- Implement hybrid search (semantic + keyword)
- Add re-ranking with cross-encoder
- Review chunking strategy

**High latency?**
- Reduce top-k retrieval count (try 3-5 instead of 10)
- Implement caching for frequent queries
- Use faster vector DB (Qdrant for performance)
- Optimize context assembly

**High hallucination rate?**
- Validate faithfulness against sources
- Add explicit source citation requirements
- Implement confidence scoring
- Use temperature=0 for factual queries

**Context too large?**
- Use context compression (LLMLingua)
- Remove redundant chunks
- Prioritize by relevance score
- Increase chunk overlap to reduce count

## Version History

- **1.0.0** (2025-10-21): Initial release, adapted from RAG Framework

## License

Part of ai-dev-standards repository.
