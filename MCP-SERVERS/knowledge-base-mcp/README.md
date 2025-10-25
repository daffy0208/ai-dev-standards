# Knowledge Base MCP Server

Comprehensive knowledge base management server providing CRUD operations, versioning, validation, and curation tools.

## What This MCP Does

- 📝 **CRUD Operations** - Create, read, update, delete knowledge entries
- 🔍 **Query & Search** - Filter by type, category, tags, text search
- ✅ **Validation** - Detect duplicates, conflicts, staleness, completeness issues
- 📚 **Versioning** - Track all changes with full history
- 📥 **Import/Export** - Bulk operations for migration and backup
- 🔗 **Relationships** - Support for entity relationships (knowledge graphs)

## Installation

```bash
cd MCP-SERVERS/knowledge-base-mcp
npm install
npm run build
```

## Setup

Add to your Claude MCP settings:

```json
{
  "mcpServers": {
    "knowledge-base": {
      "command": "node",
      "args": ["/path/to/knowledge-base-mcp/dist/index.js"]
    }
  }
}
```

## Knowledge Types

### 1. Document-Based Knowledge (RAG)
```typescript
{
  type: "document",
  content: "Full text content...",
  metadata: {
    source: "https://docs.example.com/page",
    category: "documentation",
    tags: ["api", "authentication"]
  }
}
```

### 2. Entity-Based Knowledge (Graph)
```typescript
{
  type: "entity",
  content: "Description of the entity",
  relationships: [
    {
      type: "WORKS_FOR",
      target_id: "kb_org_123",
      properties: { role: "Engineer", since: "2020" }
    }
  ]
}
```

### 3. Relationships
```typescript
{
  type: "relationship",
  content: "Description of the relationship",
  relationships: [
    {
      type: "CONNECTS",
      target_id: "kb_entity_456"
    }
  ]
}
```

## Tools

### 1. `create_knowledge_entry`

Create a new knowledge entry.

**Parameters:**
- `type` (required): "document" | "entity" | "relationship"
- `content` (required): The knowledge content
- `source` (required): Source reference (URL, document name, etc.)
- `author` (optional): Author name
- `category` (optional): Category for organization
- `tags` (optional): Array of tags
- `confidence` (optional): Confidence score 0-1
- `relationships` (optional): Array of relationships (for entities)

**Example:**
```typescript
{
  type: "document",
  content: "Authentication uses JWT tokens with 24h expiration...",
  source: "https://docs.example.com/auth",
  category: "security",
  tags: ["jwt", "authentication"],
  confidence: 0.95
}
```

**Returns:**
```json
{
  "success": true,
  "id": "kb_1698765432_abc123",
  "message": "Knowledge entry created successfully",
  "entry": { ... }
}
```

---

### 2. `update_knowledge_entry`

Update an existing entry. Creates new version while preserving history.

**Parameters:**
- `id` (required): Entry ID
- `content` (optional): Updated content
- `metadata` (optional): Updated metadata fields
- `changelog` (required): Description of changes

**Example:**
```typescript
{
  id: "kb_1698765432_abc123",
  content: "Authentication uses JWT tokens with 48h expiration...",
  changelog: "Updated token expiration time"
}
```

**Returns:**
```json
{
  "success": true,
  "message": "Knowledge entry updated successfully",
  "changelog": "Updated token expiration time",
  "entry": { ... }
}
```

---

### 3. `delete_knowledge_entry`

Delete a knowledge entry.

**Parameters:**
- `id` (required): Entry ID
- `hard_delete` (optional): Boolean - permanent delete vs soft delete

**Example:**
```typescript
{
  id: "kb_1698765432_abc123",
  hard_delete: false  // Soft delete (preserves history)
}
```

**Returns:**
```json
{
  "success": true,
  "message": "Knowledge entry soft deleted",
  "hard_delete": false
}
```

---

### 4. `query_knowledge`

Query the knowledge base with filters.

**Parameters:**
- `query` (optional): Text search
- `type` (optional): Filter by type
- `category` (optional): Filter by category
- `tags` (optional): Filter by tags (array)
- `limit` (optional): Max results (default: 10)

**Example:**
```typescript
{
  query: "authentication",
  type: "document",
  category: "security",
  limit: 5
}
```

**Returns:**
```json
{
  "success": true,
  "count": 3,
  "results": [
    { "id": "kb_...", "content": "...", "metadata": {...} },
    ...
  ]
}
```

---

### 5. `validate_knowledge`

Validate knowledge for quality issues.

**Parameters:**
- `id` (optional): Validate specific entry (or all if omitted)
- `checks` (optional): Array of checks to run
  - "duplicates" - Find similar entries
  - "conflicts" - Detect contradictory information
  - "staleness" - Flag old entries
  - "completeness" - Check for missing metadata
- `duplicate_threshold` (optional): Similarity threshold 0-1 (default: 0.9)

**Example:**
```typescript
{
  checks: ["duplicates", "conflicts", "staleness"],
  duplicate_threshold: 0.85
}
```

**Returns:**
```json
{
  "timestamp": "2025-10-24T...",
  "checks_run": ["duplicates", "conflicts", "staleness"],
  "issues": [
    {
      "type": "duplicate",
      "entry_id": "kb_...",
      "duplicates": ["kb_...", "kb_..."],
      "severity": "warning"
    },
    {
      "type": "staleness",
      "entry_id": "kb_...",
      "days_old": 120,
      "severity": "warning"
    }
  ],
  "summary": {
    "total_checked": 50,
    "issues_found": 8,
    "by_severity": {
      "error": 1,
      "warning": 5,
      "info": 2
    }
  }
}
```

---

### 6. `version_knowledge`

Manage version history.

**Parameters:**
- `id` (required): Entry ID
- `action` (required): "list" | "get" | "revert"
- `version` (required for get/revert): Version number

**Example (list):**
```typescript
{
  id: "kb_1698765432_abc123",
  action: "list"
}
```

**Returns:**
```json
{
  "success": true,
  "id": "kb_...",
  "versions": [
    { "version": 1, "updated_at": "2025-10-01T...", "author": "user1" },
    { "version": 2, "updated_at": "2025-10-15T...", "author": "user2" },
    { "version": 3, "updated_at": "2025-10-24T...", "author": "user1" }
  ]
}
```

**Example (revert):**
```typescript
{
  id: "kb_1698765432_abc123",
  action: "revert",
  version: 1
}
```

---

### 7. `import_knowledge`

Bulk import knowledge entries.

**Parameters:**
- `entries` (required): Array of knowledge entries
- `options` (optional):
  - `skip_duplicates`: Boolean
  - `validate_before_import`: Boolean

**Example:**
```typescript
{
  entries: [
    {
      type: "document",
      content: "...",
      source: "migration.json",
      metadata: {...}
    },
    ...
  ],
  options: {
    skip_duplicates: true,
    validate_before_import: true
  }
}
```

**Returns:**
```json
{
  "success": true,
  "imported": 45,
  "skipped": 3,
  "errors": [],
  "message": "Imported 45 entries, skipped 3"
}
```

---

### 8. `export_knowledge`

Export knowledge base or subset.

**Parameters:**
- `filters` (optional):
  - `type`: Filter by type
  - `category`: Filter by category
  - `tags`: Filter by tags (array)
  - `since_date`: Only entries updated after this date
- `include_versions` (optional): Include version history (default: false)
- `format` (optional): "json" | "csv" (default: "json")

**Example:**
```typescript
{
  filters: {
    category: "security",
    since_date: "2025-10-01"
  },
  include_versions: false,
  format: "json"
}
```

**Returns:**
```json
{
  "success": true,
  "format": "json",
  "count": 12,
  "data": [
    { "id": "kb_...", "type": "document", ... },
    ...
  ]
}
```

---

## Use Cases

### Use Case 1: Build RAG Knowledge Base
```typescript
// 1. Import documents
import_knowledge({
  entries: documents.map(doc => ({
    type: "document",
    content: doc.text,
    source: doc.url,
    category: "documentation",
    tags: doc.tags
  }))
});

// 2. Validate for duplicates
validate_knowledge({ checks: ["duplicates"] });

// 3. Query for relevant docs
query_knowledge({ query: "authentication", category: "documentation" });
```

### Use Case 2: Build Knowledge Graph
```typescript
// 1. Create entities
create_knowledge_entry({
  type: "entity",
  content: "John Doe - Senior Engineer",
  source: "HR System",
  relationships: [
    { type: "WORKS_FOR", target_id: "company_123" },
    { type: "MANAGES", target_id: "project_456" }
  ]
});

// 2. Query related entities
query_knowledge({ type: "entity", tags: ["employee"] });
```

### Use Case 3: Knowledge Curation Workflow
```typescript
// 1. Validate all knowledge
const report = validate_knowledge({
  checks: ["duplicates", "conflicts", "staleness"]
});

// 2. Review issues
report.issues.forEach(issue => {
  if (issue.type === "duplicate") {
    // Merge duplicates
  } else if (issue.type === "staleness") {
    // Update or archive
  }
});

// 3. Export curated knowledge
export_knowledge({
  filters: { since_date: "2025-10-01" },
  format: "json"
});
```

---

## Integration with Skills

This MCP enables the following skills:

- **knowledge-base-manager** - Uses all 8 tools for comprehensive KB management
- **rag-implementer** - Uses create, query, validate tools for document KB
- **knowledge-graph-builder** - Uses create, query tools for entity KB
- **data-engineer** - Uses import/export tools for ETL pipelines
- **quality-auditor** - Uses validate tool for quality checks

---

## Storage

**Current Implementation:** In-memory storage (for development/testing)

**Production:** Replace with actual databases:
- Document KB: Pinecone, Weaviate, pgvector
- Entity KB: Neo4j, ArangoDB
- Metadata: PostgreSQL

See `knowledge-base-manager` skill for implementation guidance.

---

## Limitations

- In-memory storage (data not persisted)
- Simple similarity algorithm (replace with embedding-based)
- No concurrent access control
- No authentication/authorization

**For production use:** Integrate with actual databases and add proper security.

---

## Related Resources

- **Skill**: `SKILLS/knowledge-base-manager/SKILL.md`
- **Pattern**: `STANDARDS/architecture-patterns/knowledge-base-pattern.md` (coming soon)
- **Related MCPs**: `vector-database-mcp`, `graph-database-mcp`, `semantic-search-mcp`

---

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Watch mode (auto-rebuild)
npm run watch

# Run tests (coming soon)
npm test
```

---

## License

MIT

---

**Built for ai-dev-standards** - Making knowledge management executable, not just advisory.
