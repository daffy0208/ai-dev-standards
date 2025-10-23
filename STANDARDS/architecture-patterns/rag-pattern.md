# RAG Architecture Pattern

**Category:** AI-Native Systems | **Complexity:** Intermediate to Advanced | **Version:** 1.0.0

## Pattern Overview

Retrieval-Augmented Generation (RAG) architecture enhances LLM responses by retrieving relevant information from external knowledge bases before generation. This pattern grounds AI responses in factual, domain-specific data while avoiding the cost and complexity of fine-tuning.

### When to Use This Pattern

**Use RAG When:**
- ✅ Need to ground LLM responses in up-to-date or proprietary data
- ✅ Knowledge changes frequently (documentation, regulations, news)
- ✅ Require source attribution and traceability
- ✅ Domain-specific knowledge not in base model training data
- ✅ Need to reduce hallucinations with factual grounding

**Don't Use RAG When:**
- ❌ Base model already has sufficient knowledge
- ❌ Task requires reasoning over information, not retrieval
- ❌ Latency requirements incompatible with retrieval overhead
- ❌ Knowledge base too small (<50 documents) - use context directly
- ❌ Fine-tuning better suited for deep domain specialization

---

## Architecture Styles

### Style 1: Naive RAG (Basic)

**Use**: Prototype, small knowledge bases (<10k documents), low query volume

```
User Query → Embedding → Vector Search → Top-K Retrieval → Context + Query → LLM → Response
```

**Architecture**:
```python
# Simple RAG pipeline
class NaiveRAG:
    def __init__(self, vector_store, llm):
        self.vector_store = vector_store
        self.llm = llm

    def query(self, user_query: str) -> str:
        # 1. Embed query
        query_embedding = self.embed(user_query)

        # 2. Retrieve top-K documents
        documents = self.vector_store.similarity_search(
            query_embedding, k=5
        )

        # 3. Assemble context
        context = "\n\n".join([doc.content for doc in documents])

        # 4. Generate response
        prompt = f"""Context: {context}

Question: {user_query}

Answer based only on the context above:"""

        return self.llm.generate(prompt)
```

**Components**:
- Embedding model (OpenAI, Cohere, or local)
- Vector database (Chroma, Pinecone, Weaviate)
- LLM (GPT-4, Claude, or local)

**Pros**: Simple, fast to implement, low complexity
**Cons**: No query enhancement, basic retrieval, no re-ranking, limited context optimization

---

### Style 2: Advanced RAG

**Use**: Production systems, medium scale (10k-1M documents), quality-critical applications

```
User Query → Query Enhancement → Hybrid Retrieval → Re-ranking → Context Assembly → LLM → Response with Sources
                                    ↓
                            (Semantic + Keyword)
```

**Architecture**:
```python
class AdvancedRAG:
    def __init__(self, vector_store, keyword_index, reranker, llm):
        self.vector_store = vector_store
        self.keyword_index = keyword_index
        self.reranker = reranker
        self.llm = llm

    def query(self, user_query: str) -> dict:
        # 1. Query enhancement
        enhanced_queries = self.enhance_query(user_query)

        # 2. Hybrid retrieval
        semantic_results = self.vector_store.similarity_search(
            enhanced_queries['semantic'], k=20
        )
        keyword_results = self.keyword_index.search(
            enhanced_queries['keywords'], k=10
        )

        # 3. Merge and re-rank
        combined = self.merge_results(semantic_results, keyword_results)
        reranked = self.reranker.rerank(combined, user_query, top_k=5)

        # 4. Context assembly with optimization
        context = self.assemble_context(reranked, max_tokens=4000)

        # 5. Generate with citations
        return self.generate_with_sources(user_query, context, reranked)

    def enhance_query(self, query: str) -> dict:
        """Multi-query enhancement strategies"""
        return {
            'semantic': query,  # Original query
            'keywords': self.extract_keywords(query),
            'expanded': self.expand_query(query),  # Add synonyms
            'hypothetical': self.generate_hypothetical_doc(query)
        }

    def assemble_context(self, documents: List[Document], max_tokens: int) -> str:
        """Optimized context assembly"""
        # Remove redundancy
        deduped = self.deduplicate(documents)

        # Compress if needed
        if self.count_tokens(deduped) > max_tokens:
            return self.compress_context(deduped, max_tokens)

        return self.format_context(deduped)
```

**Enhanced Components**:
- **Query Enhancement**: Multi-query, HyDE (Hypothetical Document Embeddings), query expansion
- **Hybrid Retrieval**: Semantic (vector) + keyword (BM25) + metadata filtering
- **Re-ranking**: Cross-encoder models for relevance scoring
- **Context Optimization**: Compression (LLMLingua), redundancy removal, strategic positioning

**Pros**: Higher accuracy, better retrieval quality, production-ready
**Cons**: More complex, higher latency, additional infrastructure

---

### Style 3: Modular RAG

**Use**: Enterprise scale (1M+ documents), multi-domain, complex workflows, agent systems

```
User Query → Router → [Search Module] → [Memory Module] → [Predict Module]
                         ↓                  ↓                  ↓
                    Specialized KBs     Conversation      Anticipatory
                                         History          Pre-loading
                         ↓                  ↓                  ↓
                    Orchestrator → Context Assembly → LLM → Response
```

**Architecture**:
```python
class ModularRAG:
    def __init__(self, modules: dict, orchestrator, llm):
        self.search_module = modules['search']
        self.memory_module = modules['memory']
        self.predict_module = modules['predict']
        self.orchestrator = orchestrator
        self.llm = llm

    def query(self, user_query: str, session_id: str) -> dict:
        # 1. Route query to appropriate modules
        routing_decision = self.orchestrator.route(user_query)

        results = {}

        # 2. Search module (parallel execution)
        if routing_decision.needs_search:
            search_kb = routing_decision.target_kb  # Route to specialized KB
            results['search'] = self.search_module.search(
                user_query, knowledge_base=search_kb
            )

        # 3. Memory module (conversation history)
        if routing_decision.needs_memory:
            results['memory'] = self.memory_module.retrieve(
                session_id, user_query, k=3
            )

        # 4. Predict module (anticipatory retrieval)
        if routing_decision.anticipate:
            results['predict'] = self.predict_module.preload(
                user_query, results['search']
            )

        # 5. Orchestrate context assembly
        context = self.orchestrator.assemble_context(
            results, strategy=routing_decision.assembly_strategy
        )

        # 6. Generate response
        return self.generate_modular(user_query, context, routing_decision)

class SearchModule:
    """Specialized search across multiple knowledge bases"""
    def __init__(self, knowledge_bases: dict):
        self.kbs = knowledge_bases  # e.g., {'docs': kb1, 'code': kb2, 'slack': kb3}

    def search(self, query: str, knowledge_base: str = 'all') -> List[Document]:
        if knowledge_base == 'all':
            # Search across all KBs in parallel
            results = []
            for kb_name, kb in self.kbs.items():
                results.extend(kb.search(query, k=5))
            return self.deduplicate_and_rank(results)
        else:
            return self.kbs[knowledge_base].search(query, k=10)

class MemoryModule:
    """Long-term conversation and preference persistence"""
    def __init__(self, memory_store):
        self.memory_store = memory_store

    def retrieve(self, session_id: str, current_query: str, k: int = 3):
        # Retrieve relevant past conversations
        conversation_history = self.memory_store.get_session(session_id)

        # Extract relevant context from history
        relevant_history = self.extract_relevant(
            conversation_history, current_query, k=k
        )

        return relevant_history

    def store(self, session_id: str, query: str, response: str, metadata: dict):
        self.memory_store.add_to_session(session_id, {
            'query': query,
            'response': response,
            'timestamp': datetime.now(),
            'metadata': metadata
        })

class PredictModule:
    """Anticipatory information pre-loading"""
    def preload(self, current_query: str, search_results: List[Document]):
        # Predict likely follow-up queries
        predicted_queries = self.predict_followups(current_query, search_results)

        # Pre-load documents for predicted queries
        preloaded = {}
        for pred_query in predicted_queries[:3]:
            preloaded[pred_query] = self.search_module.search(pred_query, k=3)

        return preloaded
```

**Modular Components**:
- **Router**: Intelligent query routing to specialized knowledge bases
- **Search Module**: Multi-KB search with domain-specific retrieval strategies
- **Memory Module**: Conversation history and user preference tracking
- **Predict Module**: Anticipatory retrieval for likely follow-up queries
- **Orchestrator**: Coordinates modules and assembles optimal context

**Pros**: Highly scalable, flexible, enterprise-grade, multi-domain support
**Cons**: Complex architecture, significant engineering overhead, higher operational costs

---

## Component Selection Matrix

### Embedding Models

| Model | Dimensions | Use Case | Cost | Performance |
|-------|-----------|----------|------|-------------|
| **OpenAI text-embedding-3-large** | 3072 (customizable) | General-purpose, high quality | $$ | Excellent |
| **OpenAI text-embedding-3-small** | 1536 | Cost-sensitive, good quality | $ | Good |
| **Cohere Embed v3** | 1024 | Multilingual, semantic search | $$ | Excellent |
| **Sentence Transformers (all-MiniLM-L6-v2)** | 384 | Self-hosted, fast inference | Free | Good |
| **BGE-large-en** | 1024 | Self-hosted, high quality | Free | Excellent |

**Recommendation**: Start with `text-embedding-3-small` for prototypes, upgrade to `text-embedding-3-large` or fine-tuned models for production.

---

### Vector Databases

| Database | Scale | Deployment | Best For |
|----------|-------|-----------|----------|
| **Chroma** | <1M docs | Local/Self-hosted | Development, prototyping |
| **Pinecone** | 1M-100M+ | Cloud-managed | Production, scalability |
| **Weaviate** | 1M-10M+ | Self-hosted/Cloud | Hybrid search, GraphQL |
| **Qdrant** | 1M-100M+ | Self-hosted/Cloud | High performance, Rust-based |
| **Milvus** | 10M-1B+ | Self-hosted | Enterprise, massive scale |
| **PostgreSQL + pgvector** | <10M | Self-hosted | Existing Postgres infrastructure |

**Selection Guide**:
- **MVP/Prototype**: Chroma (local, free, fast setup)
- **Production (cloud-first)**: Pinecone (managed, scalable)
- **Production (self-hosted)**: Weaviate or Qdrant (open-source, flexible)
- **Enterprise**: Milvus (massive scale, distributed)

---

### Re-ranking Models

| Model | Latency | Accuracy | Use Case |
|-------|---------|----------|----------|
| **Cohere Rerank** | Low | Excellent | Production, managed service |
| **Cross-Encoder (ms-marco)** | Medium | Excellent | Self-hosted, high accuracy |
| **BGE Reranker** | Low | Good | Self-hosted, cost-sensitive |
| **ColBERT** | High | Excellent | Accuracy-critical, research |

**Recommendation**: Use re-ranking for top-20 → top-5 refinement. Adds 50-200ms latency but significantly improves relevance.

---

## Data Flow Architecture

### Basic RAG Data Flow

```
┌─────────────┐
│ User Query  │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│ Embed Query     │ (OpenAI API or local)
└──────┬──────────┘
       │
       ▼
┌─────────────────────┐
│ Vector Similarity   │ (Pinecone, Weaviate)
│ Search (top-K=5)    │
└──────┬──────────────┘
       │
       ▼
┌──────────────────────┐
│ Assemble Context     │ (Concatenate docs)
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ LLM Generation       │ (GPT-4, Claude)
│ (Context + Query)    │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ Response with Sources│
└──────────────────────┘
```

### Advanced RAG Data Flow

```
┌─────────────┐
│ User Query  │
└──────┬──────┘
       │
   ┌───┴───┐
   │       │
   ▼       ▼
┌────┐  ┌────────┐
│HyDE│  │Multi-Q │ (Query Enhancement)
└─┬──┘  └───┬────┘
  │         │
  └────┬────┘
       ▼
   ┌───────────────┐
   │ Parallel      │
   │ Retrieval     │
   └───┬───────────┘
       │
  ┌────┴─────┐
  ▼          ▼
┌──────┐  ┌─────────┐
│Vector│  │Keyword  │ (Hybrid Retrieval)
│Search│  │BM25     │
└──┬───┘  └────┬────┘
   │           │
   └─────┬─────┘
         ▼
   ┌──────────────┐
   │ Re-ranking    │ (Cross-encoder, top-20 → top-5)
   └──────┬────────┘
          │
          ▼
   ┌───────────────┐
   │ Context       │
   │ Optimization  │ (Compression, dedup)
   └──────┬────────┘
          │
          ▼
   ┌───────────────┐
   │ LLM + Citation│
   │ Generation    │
   └──────┬────────┘
          │
          ▼
   ┌───────────────┐
   │ Response with │
   │ Source Refs   │
   └───────────────┘
```

---

## Implementation Patterns

### Pattern 1: Hybrid Retrieval (Semantic + Keyword)

```python
from typing import List
from dataclasses import dataclass

@dataclass
class RetrievalResult:
    content: str
    score: float
    source: str
    method: str  # 'semantic' or 'keyword'

class HybridRetriever:
    def __init__(self, vector_store, keyword_index, alpha=0.7):
        self.vector_store = vector_store
        self.keyword_index = keyword_index
        self.alpha = alpha  # Weight for semantic vs keyword (0.7 = 70% semantic)

    def retrieve(self, query: str, k: int = 5) -> List[RetrievalResult]:
        # Semantic retrieval
        semantic_results = self.vector_store.similarity_search(
            query, k=k*2, score_threshold=0.5
        )

        # Keyword retrieval (BM25)
        keyword_results = self.keyword_index.search(
            query, k=k*2
        )

        # Reciprocal Rank Fusion (RRF) for merging
        return self.reciprocal_rank_fusion(
            semantic_results, keyword_results, k=k
        )

    def reciprocal_rank_fusion(self, semantic, keyword, k=5, constant=60):
        """Merge results using RRF algorithm"""
        scores = {}

        # Score semantic results
        for rank, doc in enumerate(semantic, 1):
            doc_id = doc.metadata['id']
            scores[doc_id] = scores.get(doc_id, 0) + self.alpha / (rank + constant)

        # Score keyword results
        for rank, doc in enumerate(keyword, 1):
            doc_id = doc.metadata['id']
            scores[doc_id] = scores.get(doc_id, 0) + (1-self.alpha) / (rank + constant)

        # Sort by combined score and return top-k
        sorted_docs = sorted(scores.items(), key=lambda x: x[1], reverse=True)
        return [self.get_doc(doc_id) for doc_id, _ in sorted_docs[:k]]
```

---

### Pattern 2: Context Compression

```python
class ContextCompressor:
    def __init__(self, max_tokens: int = 4000):
        self.max_tokens = max_tokens

    def compress(self, documents: List[Document], query: str) -> str:
        """Compress context to fit within token limit"""
        # 1. Remove redundancy
        deduped = self.remove_redundancy(documents)

        # 2. Extract query-relevant sentences
        relevant = self.extract_relevant_sentences(deduped, query)

        # 3. If still too long, use LLMLingua compression
        if self.count_tokens(relevant) > self.max_tokens:
            return self.llm_lingua_compress(relevant, self.max_tokens)

        return relevant

    def remove_redundancy(self, documents: List[Document]) -> List[Document]:
        """Remove duplicate or highly similar content"""
        unique_docs = []
        seen_embeddings = []

        for doc in documents:
            embedding = self.embed(doc.content)

            # Check similarity with existing docs
            if not self.is_similar_to_any(embedding, seen_embeddings, threshold=0.9):
                unique_docs.append(doc)
                seen_embeddings.append(embedding)

        return unique_docs

    def extract_relevant_sentences(self, documents: List[Document], query: str) -> str:
        """Extract most relevant sentences from each document"""
        query_embedding = self.embed(query)
        relevant_sentences = []

        for doc in documents:
            sentences = self.split_sentences(doc.content)

            # Score each sentence against query
            scored = [(sent, self.similarity(query_embedding, self.embed(sent)))
                      for sent in sentences]

            # Take top 2 most relevant sentences from each doc
            top_sentences = sorted(scored, key=lambda x: x[1], reverse=True)[:2]
            relevant_sentences.extend([sent for sent, _ in top_sentences])

        return "\n\n".join(relevant_sentences)
```

---

### Pattern 3: Citation Generation

```python
class CitationGenerator:
    def generate_with_citations(self, query: str, documents: List[Document]) -> dict:
        # Prepare context with citation markers
        context_with_markers = self.add_citation_markers(documents)

        # Generate response
        prompt = f"""Answer the question using the provided context.
        Cite sources using [1], [2], etc. when using information from the context.

Context:
{context_with_markers}

Question: {query}

Answer with citations:"""

        response = self.llm.generate(prompt)

        # Extract citations and verify they're used
        citations = self.extract_citations(response, documents)

        return {
            'answer': response,
            'sources': citations,
            'confidence': self.calculate_confidence(response, documents)
        }

    def add_citation_markers(self, documents: List[Document]) -> str:
        """Add [1], [2], ... markers to each document"""
        marked_contexts = []
        for i, doc in enumerate(documents, 1):
            marked_contexts.append(f"[{i}] {doc.content}\nSource: {doc.metadata['source']}")
        return "\n\n".join(marked_contexts)

    def extract_citations(self, response: str, documents: List[Document]) -> List[dict]:
        """Extract which sources were cited in response"""
        import re
        cited_indices = set(int(m.group(1)) for m in re.finditer(r'\[(\d+)\]', response))

        return [
            {
                'index': i,
                'content': documents[i-1].content[:200] + '...',
                'source': documents[i-1].metadata['source'],
                'url': documents[i-1].metadata.get('url', '')
            }
            for i in sorted(cited_indices)
            if i <= len(documents)
        ]
```

---

## Anti-Patterns and Pitfalls

### ❌ Anti-Pattern 1: Too Many Retrieved Documents

**Problem**: Retrieving 20+ documents creates excessive context, leading to "lost in the middle" phenomenon.

**Solution**: Retrieve 10-20, re-rank to top 5, optimize context assembly.

```python
# ❌ Bad: Too many documents
documents = vector_store.similarity_search(query, k=50)  # Overwhelming

# ✅ Good: Retrieve more, re-rank to fewer
candidates = vector_store.similarity_search(query, k=20)
top_docs = reranker.rerank(candidates, query, top_k=5)
```

---

### ❌ Anti-Pattern 2: No Query Enhancement

**Problem**: User queries are often vague or poorly phrased for retrieval.

**Solution**: Enhance queries with expansion, hypothetical documents (HyDE), or multi-query.

```python
# ❌ Bad: Direct query
results = vector_store.search("authentication issues")

# ✅ Good: Enhanced query
enhanced = [
    "authentication issues",  # Original
    "login problems authentication errors troubleshooting",  # Expanded
    "Users cannot authenticate and receive error messages..."  # HyDE
]
results = [vector_store.search(q, k=3) for q in enhanced]
combined = merge_and_deduplicate(results)
```

---

### ❌ Anti-Pattern 3: Ignoring Metadata Filtering

**Problem**: Retrieving outdated or irrelevant documents because metadata not used.

**Solution**: Filter by date, category, permissions, etc. before semantic search.

```python
# ❌ Bad: No filtering
results = vector_store.search(query, k=5)

# ✅ Good: Metadata filtering
results = vector_store.search(
    query,
    k=5,
    filter={
        'last_updated': {'$gte': '2024-01-01'},  # Recent docs
        'category': {'$in': ['technical', 'api']},  # Relevant categories
        'access_level': {'$lte': user.access_level}  # Permission filtering
    }
)
```

---

### ❌ Anti-Pattern 4: No Source Attribution

**Problem**: Generated responses lack citations, making verification impossible.

**Solution**: Always include source references and confidence scores.

```python
# ❌ Bad: No attribution
return {"answer": response}

# ✅ Good: Full attribution
return {
    "answer": response,
    "sources": [{"content": doc.content, "url": doc.url} for doc in sources],
    "confidence": confidence_score,
    "retrieval_metadata": {
        "query_enhanced": enhanced_query,
        "documents_retrieved": len(documents),
        "retrieval_time_ms": retrieval_time
    }
}
```

---

## Integration Patterns

### Pattern 1: RAG with LangChain

```python
from langchain.chains import RetrievalQA
from langchain.vectorstores import Pinecone
from langchain.embeddings import OpenAIEmbeddings
from langchain.llms import OpenAI

# Initialize components
embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
vector_store = Pinecone.from_existing_index("my-index", embeddings)
llm = OpenAI(model="gpt-4", temperature=0)

# Create RAG chain
rag_chain = RetrievalQA.from_chain_type(
    llm=llm,
    chain_type="stuff",  # or "map_reduce", "refine"
    retriever=vector_store.as_retriever(search_kwargs={"k": 5}),
    return_source_documents=True
)

# Query
result = rag_chain({"query": "How do I configure authentication?"})
print(result['result'])
print(result['source_documents'])
```

---

### Pattern 2: RAG with LlamaIndex

```python
from llama_index import VectorStoreIndex, ServiceContext
from llama_index.vector_stores import PineconeVectorStore
from llama_index.embeddings import OpenAIEmbedding

# Initialize
embed_model = OpenAIEmbedding(model="text-embedding-3-small")
vector_store = PineconeVectorStore(pinecone_index=pinecone_index)

# Create index
service_context = ServiceContext.from_defaults(embed_model=embed_model)
index = VectorStoreIndex.from_vector_store(
    vector_store, service_context=service_context
)

# Query with response synthesis
query_engine = index.as_query_engine(
    similarity_top_k=5,
    response_mode="compact"  # or "tree_summarize", "refine"
)

response = query_engine.query("How do I configure authentication?")
print(response)
print(response.source_nodes)  # Citations
```

---

## Related Resources

**Related Skills**:
- `rag-implementer` - Methodology for implementing RAG systems
- `knowledge-graph-builder` - Graph-based knowledge representation
- `multi-agent-architect` - Multi-agent systems with RAG components

**Related Standards**:
- `STANDARDS/architecture-patterns/embedding-strategy.md` - Embedding model selection (when created)
- `STANDARDS/architecture-patterns/vector-db-pattern.md` - Vector database patterns (when created)

**Related Playbooks**:
- `PLAYBOOKS/deploy-rag-system.md` - RAG deployment guide (when created)
- `PLAYBOOKS/evaluate-rag-quality.md` - RAG evaluation procedures (when created)

---

## Decision Framework

```
Do I need RAG?
│
├─ Knowledge in base model? → No RAG needed
│
├─ Knowledge changes frequently? → Use RAG (always current)
│
├─ Proprietary/sensitive data? → Use RAG (data stays private)
│
├─ Need source attribution? → Use RAG (citations)
│
└─ Which RAG architecture?
   │
   ├─ Prototype/MVP (<10k docs) → Naive RAG
   ├─ Production (10k-1M docs) → Advanced RAG
   └─ Enterprise (1M+ docs, multi-domain) → Modular RAG
```

**Next Steps After Choosing RAG**:
1. Define knowledge base scope and data sources
2. Select embedding model and vector database
3. Implement retrieval pipeline (start simple, iterate)
4. Add evaluation metrics and monitoring
5. Optimize based on user feedback and metrics
