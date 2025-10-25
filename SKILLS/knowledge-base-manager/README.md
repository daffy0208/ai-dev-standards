# Knowledge Base Manager Skill

**Version:** 1.0.0
**Category:** AI & Data
**Difficulty:** Intermediate
**Est. Time:** 2-4 weeks for full implementation

## What This Skill Does

Provides comprehensive guidance for designing, building, and maintaining knowledge bases that power AI systems and human information needs. Bridges the gap between document-based knowledge (RAG) and entity-based knowledge (graphs), offering a unified approach to knowledge management.

## When to Use This Skill

Use this skill when you need to:
- Build knowledge-intensive AI applications
- Manage organizational knowledge systematically
- Integrate multiple knowledge sources
- Ensure knowledge quality and freshness
- Choose between RAG, knowledge graphs, or hybrid approaches
- Implement knowledge versioning and governance

## What You'll Learn

- **Knowledge Architecture**: Document-based, entity-based, and hybrid approaches
- **Curation Best Practices**: How to maintain high-quality knowledge
- **Storage & Retrieval**: Technical patterns for different KB types
- **Quality Control**: Testing, validation, and monitoring strategies
- **Versioning**: Track knowledge evolution over time
- **Governance**: Long-term maintenance and team processes

## Key Concepts

### Three KB Types

1. **Document-Based (RAG)**
   - Best for: Documentation, articles, policies
   - Tools: Vector databases, embeddings
   - Skills: `rag-implementer`

2. **Entity-Based (Knowledge Graphs)**
   - Best for: Entities + relationships, org charts, catalogs
   - Tools: Graph databases (Neo4j)
   - Skills: `knowledge-graph-builder`

3. **Hybrid (RAG + Graphs)**
   - Best for: Complex systems needing both
   - Tools: Vector DB + Graph DB + linking layer
   - Skills: Both `rag-implementer` + `knowledge-graph-builder`

### 6-Phase Implementation

1. **Knowledge Audit & Architecture** - Understand and structure
2. **Curation & Ingestion** - Transform raw info to quality knowledge
3. **Storage & Retrieval** - Implement technical infrastructure
4. **Quality Control** - Validate accuracy and coverage
5. **Versioning & Evolution** - Track changes over time
6. **Maintenance & Governance** - Keep healthy long-term

## Quick Decision Framework

```
What kind of knowledge?

Unstructured text?     → Document-Based KB (RAG)
Structured entities?   → Entity-Based KB (Graph)
Both?                  → Hybrid KB
```

## Prerequisites

**Required Knowledge:**
- Basic understanding of databases
- Familiarity with search concepts
- Understanding of data quality principles

**Recommended Skills to Review First:**
- `rag-implementer` - If using document-based KB
- `knowledge-graph-builder` - If using entity-based KB
- `data-engineer` - For ETL and data pipelines

## Quick Start

1. **Read the full SKILL.md** to understand all phases
2. **Inventory your knowledge sources** (databases, docs, APIs)
3. **Choose KB type** using decision framework
4. **Start with Phase 1** (Architecture) from SKILL.md
5. **Iterate** based on user feedback

## Common Use Cases

### Use Case 1: Company Documentation Search
- **Type**: Document-Based KB (RAG)
- **Time**: 2-3 weeks
- **Skills**: `rag-implementer`, `knowledge-base-manager`
- **Tools**: Pinecone + OpenAI embeddings

### Use Case 2: Product Catalog with Relationships
- **Type**: Entity-Based KB (Graph)
- **Time**: 3-4 weeks
- **Skills**: `knowledge-graph-builder`, `knowledge-base-manager`
- **Tools**: Neo4j + custom ontology

### Use Case 3: Enterprise Knowledge Hub
- **Type**: Hybrid KB
- **Time**: 6-8 weeks
- **Skills**: `rag-implementer`, `knowledge-graph-builder`, `knowledge-base-manager`
- **Tools**: Pinecone + Neo4j + linking layer

## Anti-Patterns to Avoid

❌ **Data dump without curation** - Quality > Quantity
❌ **No version control** - Can't audit or rollback
❌ **Stale knowledge** - Monitor freshness
❌ **Duplicate information** - Single source of truth
❌ **No provenance** - Always track sources

## Success Metrics

- **Accuracy**: >90% on test questions
- **Coverage**: >80% of user questions answered
- **Freshness**: <30 days average age
- **User Satisfaction**: >85% relevance rating

## Integration with Other Skills

- **rag-implementer** - Document-based portion
- **knowledge-graph-builder** - Entity-based portion
- **data-engineer** - ETL pipelines and optimization
- **quality-auditor** - Testing and validation
- **technical-writer** - Documentation and guides

## Tools & MCPs

### Required MCPs
- `knowledge-base-mcp` - CRUD operations for knowledge entries (coming soon)
- `vector-database-mcp` - For document-based KB
- `graph-database-mcp` - For entity-based KB
- `semantic-search-mcp` - For hybrid search

### Recommended Integrations
- **Pinecone** - Vector database (`INTEGRATIONS/pinecone/`)
- **Neo4j** - Graph database (`INTEGRATIONS/graph-databases/neo4j/`)
- **OpenAI** - Embeddings (`INTEGRATIONS/openai/`)

## Resources

### In This Repository
- **Skill**: `SKILLS/knowledge-base-manager/SKILL.md` (this file's full version)
- **Pattern**: `STANDARDS/architecture-patterns/knowledge-base-pattern.md` (coming soon)
- **Related Skills**: `rag-implementer`, `knowledge-graph-builder`, `data-engineer`

### External Resources
- [The Knowledge Graph Cookbook](https://neo4j.com/knowledge-graph-book/)
- [Building Knowledge Bases with LLMs](https://www.anthropic.com/knowledge-bases)
- [RAG: Retrieval-Augmented Generation](https://arxiv.org/abs/2005.11401)

## Troubleshooting

### Problem: Don't know which KB type to choose
**Solution**: Follow decision tree in SKILL.md. Start simple (document-based), add complexity only when needed.

### Problem: Knowledge quality is poor
**Solution**: Implement Phase 4 (Quality Control). Create test question sets, run validation, fix issues.

### Problem: Knowledge becomes stale
**Solution**: Implement Phase 6 (Maintenance). Set up automated freshness monitoring and scheduled updates.

### Problem: Users can't find information
**Solution**: Check coverage metrics. Add missing knowledge, improve metadata, optimize search/query.

## Next Steps

1. Read the complete `SKILL.md` file
2. Complete Phase 1: Knowledge Audit & Architecture
3. Choose your KB type based on requirements
4. Follow the 6-phase implementation framework
5. Establish maintenance processes from day 1

## Support

For questions or issues:
- Review the comprehensive `SKILL.md` guide
- Check related skills: `rag-implementer`, `knowledge-graph-builder`
- Refer to architecture patterns (when available)
- Use `knowledge-base-mcp` for CRUD operations (coming soon)

---

**Remember**: A great knowledge base is curated, versioned, and maintained. Invest in quality from the start, and your knowledge will compound in value over time.
