# Knowledge Graph Builder - Quick Start

**Version:** 1.0.0
**Category:** AI-Native Development
**Difficulty:** Advanced

## What This Skill Does

Guides design and implementation of knowledge graphs for modeling complex entity relationships, semantic search, and AI hallucination prevention through structured knowledge.

## When to Use

Use this skill when you need to:
- Model complex relationships between entities
- Build semantic search with relationship traversal
- Verify AI-generated facts against structured knowledge
- Create recommendation systems based on connections
- Detect fraud or patterns in connected data
- Ground LLM responses in verifiable knowledge

## Quick Start

**Fastest path to a working knowledge graph:**

1. **Design ontology** (Phase 1)
   - Define entity types (Person, Organization, Location, etc.)
   - Define relationship types (WORKS_FOR, LOCATED_IN, etc.)
   - Add properties (id, name, confidence, timestamp)
   - Validate with domain experts

2. **Choose graph database** (Phase 2)
   - MVP: Neo4j Community (free, mature, excellent)
   - Production: Neo4j Enterprise or ArangoDB
   - AWS: Amazon Neptune (managed)
   - Performance: TigerGraph (billions of edges)

3. **Extract entities and relationships** (Phase 3)
   - Use NER models (spaCy, Hugging Face) for entities
   - Use dependency parsing or LLM for relationships
   - Implement entity resolution (deduplication)
   - Assign confidence scores

4. **Build hybrid architecture** (Phase 4)
   - Graph DB (Neo4j) for structured relationships
   - Vector DB (Pinecone) for semantic search
   - Combine for best of both worlds

5. **Create query API** (Phase 5)
   - Find entity, find relationships, shortest path
   - Multi-hop traversal, recommendations
   - Natural language query interface

6. **Integrate with AI** (Phase 6)
   - Knowledge Graph RAG (ground LLM responses)
   - Hallucination detection (verify claims)
   - Self-correction loops

**Time to working graph:** 1-2 weeks for MVP, 4-8 weeks for production

## File Structure

```
knowledge-graph-builder/
├── SKILL.md           # Main skill instructions (start here)
└── README.md          # This file
```

## Prerequisites

**Knowledge:**
- Graph theory basics (nodes, edges, paths)
- Understanding of ontologies and semantic relationships
- Database query fundamentals

**Tools:**
- Graph database (Neo4j recommended)
- NER model (spaCy or Hugging Face)
- Vector database (Pinecone, Weaviate) for hybrid
- LLM API (Anthropic Claude or OpenAI) for extraction

**Related Skills:**
- `rag-implementer` for hybrid KG+RAG systems
- `multi-agent-architect` for knowledge-powered agents

## Success Criteria

You've successfully used this skill when:
- ✅ Ontology designed and validated with domain experts
- ✅ Graph database set up with schema constraints
- ✅ Entity extraction pipeline working (>85% accuracy)
- ✅ Relationship extraction validated against ontology
- ✅ Hybrid search (graph + vector) implemented
- ✅ Query API created with common patterns
- ✅ AI integration tested (KG-RAG or hallucination detection)
- ✅ Query performance meets targets (<100ms for common queries)
- ✅ Data quality monitoring in place
- ✅ Backup and recovery procedures tested

## Common Workflows

### Workflow 1: Build Knowledge Graph from Documents
1. Use knowledge-graph-builder ontology design (Phase 1)
2. Extract entities and relationships with LLM (Phase 3)
3. Store in Neo4j with confidence scores
4. Build query API for access
5. Integrate with `rag-implementer` for KG-RAG

### Workflow 2: Semantic Search with Relationships
1. Design ontology for domain
2. Set up hybrid architecture (Neo4j + Pinecone)
3. Extract and store entities with embeddings
4. Implement hybrid search (vector similarity + graph traversal)
5. Return results with relationship context

### Workflow 3: AI Hallucination Prevention
1. Build knowledge graph from verified sources
2. Implement KG-RAG system
3. Add hallucination detection layer
4. Verify LLM claims against graph
5. Return only verified or flag uncertain claims

## Key Concepts

**Ontology Design:**
- **Entities**: Nodes representing real-world concepts
- **Relationships**: Edges connecting entities
- **Properties**: Attributes on nodes and edges
- **Confidence**: Score (0.0-1.0) on relationships

**Graph Database Options:**
- **Neo4j**: Most popular, Cypher query language, graph algorithms
- **Amazon Neptune**: Managed AWS service, Gremlin/SPARQL
- **ArangoDB**: Multi-model (graph + document + KV)
- **TigerGraph**: High-performance, massive scale

**Hybrid Architecture:**
- **Graph DB**: Structured relationships, traversal, reasoning
- **Vector DB**: Semantic similarity, flexible search
- **Combined**: Structured + semantic = best results

**Query Patterns:**
- **Find entity**: Simple lookup by ID or name
- **Find relationships**: 1-hop connections from entity
- **Shortest path**: Connect two entities via relationships
- **Multi-hop**: Traverse N hops for context expansion
- **Recommendations**: Find similar via shared relationships

**AI Integration:**
- **KG-RAG**: Retrieve from graph, generate with LLM
- **Hallucination detection**: Verify claims against graph
- **Self-correction**: Iteratively fix inaccurate responses

## Troubleshooting

**Skill not activating?**
- Try explicitly requesting: "Use the knowledge-graph-builder skill to..."
- Mention keywords: "knowledge graph", "ontology", "relationships", "Neo4j"

**Should I use a knowledge graph or just RAG?**
- RAG: Document search, semantic similarity, no complex relationships
- Knowledge Graph: Entity relationships central, need traversal, verification
- Hybrid KG+RAG: Best of both (recommended for complex domains)

**Choosing between Neo4j, Neptune, ArangoDB?**
- Neo4j: Most mature, best for learning, excellent community
- Neptune: AWS infrastructure, managed service, compliance
- ArangoDB: Need document DB + graph in one system
- Start with Neo4j Community (free) for MVP

**Entity extraction accuracy too low?**
- Use larger NER models (Hugging Face transformers)
- Fine-tune on domain-specific data
- Use LLM (Claude, GPT-4) for complex extraction
- Implement human-in-the-loop validation
- Track confidence scores, review low-confidence entities

**Too many duplicate entities?**
- Implement robust entity resolution
- Use fuzzy matching (Levenshtein distance)
- Normalize entity names (lowercase, strip whitespace)
- Create canonical entity IDs
- Merge duplicates with highest-confidence properties

**Graph queries too slow?**
- Add indexes on frequently queried properties
- Limit traversal depth (max_hops parameter)
- Use pagination for large result sets
- Cache common queries
- Optimize Cypher queries (use EXPLAIN and PROFILE)
- Consider read replicas for high traffic

**How to handle conflicting information?**
- Assign confidence scores to all relationships
- Track data sources for provenance
- Implement conflict resolution rules
- Keep multiple versions with timestamps
- Flag conflicts for human review

**Hybrid search not working well?**
- Tune vector search top_k (try 50-200)
- Adjust graph traversal depth (1-3 hops typically)
- Weight vector vs graph results differently
- Filter by entity types before graph traversal
- Experiment with different embedding models

## Version History

- **1.0.0** (2025-10-21): Initial release, adapted from Knowledge Graph Engineering Framework

## License

Part of ai-dev-standards repository.
