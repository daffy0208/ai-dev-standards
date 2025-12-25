# Neo4j Graph Database Integration

Complete Neo4j integration for knowledge graphs, relationship mapping, and graph-based retrieval.

## Features

- Node and relationship CRUD operations
- Cypher query execution with parameterization
- Transaction support for atomic operations
- Connection pooling for performance
- Shortest path algorithms
- Database statistics and monitoring
- Type-safe TypeScript API
- Comprehensive error handling

---

## Setup

### 1. Install Dependencies

```bash
npm install neo4j-driver
```

### 2. Start Neo4j Database

Choose one of these options:

**Docker (Recommended for Development):**

```bash
docker run \
  --name neo4j \
  -p 7474:7474 -p 7687:7687 \
  -e NEO4J_AUTH=neo4j/password \
  neo4j:latest
```

**Neo4j Aura (Cloud):**

1. Go to [neo4j.com/cloud/aura](https://neo4j.com/cloud/aura)
2. Create free instance
3. Copy connection URI and credentials

**Local Installation:**

Download from [neo4j.com/download](https://neo4j.com/download)

### 3. Environment Variables

Create `.env.local`:

```bash
NEO4J_URI=neo4j://localhost:7687
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=your-password
NEO4J_DATABASE=neo4j
```

For Neo4j Aura, use `neo4j+s://` protocol:

```bash
NEO4J_URI=neo4j+s://xxxxx.databases.neo4j.io
```

---

## Usage

### Basic Setup

```typescript
import { Neo4jClient } from './client'

const client = new Neo4jClient({
  uri: process.env.NEO4J_URI!,
  username: process.env.NEO4J_USERNAME!,
  password: process.env.NEO4J_PASSWORD!,
  database: 'neo4j'
})

// Verify connection
const connected = await client.verifyConnectivity()
console.log('Connected:', connected)

// Always close when done
await client.close()
```

Or use the environment variable helper:

```typescript
import { createNeo4jClient } from './client'

const client = createNeo4jClient()
```

---

## Node Operations

### Create Node

```typescript
// Create a person
const person = await client.createNode('Person', {
  name: 'Alice',
  age: 30,
  email: 'alice@example.com'
})

// Create a document
const doc = await client.createNode('Document', {
  title: 'Machine Learning Basics',
  content: 'Introduction to ML...',
  category: 'AI',
  created_at: new Date().toISOString()
})
```

### Find Nodes

```typescript
// Find all people
const allPeople = await client.findNodes('Person')

// Find by properties
const alice = await client.findNodes('Person', {
  name: 'Alice'
})

// Find with limit
const recentDocs = await client.findNodes(
  'Document',
  {
    category: 'AI'
  },
  10
)
```

### Update Node

```typescript
await client.updateNode(
  'Person',
  { name: 'Alice' }, // Match criteria
  { age: 31 } // Update values
)
```

### Delete Node

```typescript
// Deletes node and all its relationships (DETACH DELETE)
await client.deleteNode('Person', {
  name: 'Alice'
})
```

---

## Relationship Operations

### Create Relationship

```typescript
// Create KNOWS relationship
await client.createRelationship(
  'Person',
  { name: 'Alice' }, // From node
  'Person',
  { name: 'Bob' }, // To node
  'KNOWS', // Relationship type
  { since: 2020, strength: 0.8 } // Relationship properties
)

// Create authorship relationship
await client.createRelationship(
  'Person',
  { email: 'alice@example.com' },
  'Document',
  { title: 'Machine Learning Basics' },
  'AUTHORED',
  { role: 'primary', date: '2025-01-15' }
)
```

### Find Relationships

```typescript
// Find all KNOWS relationships
const friendships = await client.findRelationships('KNOWS')

// Find with properties
const recent = await client.findRelationships('KNOWS', {
  since: 2020
})
```

---

## Cypher Queries

### Execute Custom Queries

```typescript
// Simple query
const result = await client.query(
  `
  MATCH (p:Person)
  WHERE p.age > $minAge
  RETURN p
`,
  { minAge: 25 }
)

// Process results
result.records.forEach(record => {
  const person = record.get('p')
  console.log(person.properties)
})
```

### Complex Query Example

```typescript
// Find documents related to a person through any relationship
const query = `
  MATCH (p:Person {name: $name})-[r]->(d:Document)
  RETURN d.title as title, type(r) as relationship
  ORDER BY d.created_at DESC
  LIMIT 10
`

const result = await client.query(query, { name: 'Alice' })

result.records.forEach(record => {
  console.log(`${record.get('title')} (${record.get('relationship')})`)
})
```

### Pattern Matching

```typescript
// Find friends of friends
const fofQuery = `
  MATCH (p:Person {name: $name})-[:KNOWS]->(friend)-[:KNOWS]->(fof)
  WHERE fof <> p
  RETURN DISTINCT fof.name as name
`

const friendsOfFriends = await client.query(fofQuery, { name: 'Alice' })
```

---

## Transactions

### Atomic Operations

```typescript
await client.transaction(async session => {
  // All operations in this function are atomic
  await session.run(
    `
    CREATE (p:Person {name: $name})
  `,
    { name: 'Charlie' }
  )

  await session.run(
    `
    MATCH (p:Person {name: $name})
    CREATE (p)-[:WORKS_AT]->(:Company {name: $company})
  `,
    { name: 'Charlie', company: 'Acme Corp' }
  )
})
```

---

## Graph Algorithms

### Shortest Path

```typescript
// Find shortest path between two people
const path = await client.shortestPath(
  'Person',
  { name: 'Alice' },
  'Person',
  { name: 'Charlie' },
  'KNOWS' // Optional: relationship type to follow
)

if (path) {
  console.log('Path found:', path.get('path'))
}
```

---

## Database Management

### Get Statistics

```typescript
const stats = await client.getStatistics()

console.log(`Nodes: ${stats.nodeCount}`)
console.log(`Relationships: ${stats.relationshipCount}`)
console.log(`Labels: ${stats.labels.join(', ')}`)
console.log(`Relationship Types: ${stats.relationshipTypes.join(', ')}`)
```

### Clear Database

```typescript
// WARNING: Deletes all data
await client.clearDatabase()
```

---

## Common Patterns

### Knowledge Graph

```typescript
// Create entities and relationships for a knowledge graph
async function buildKnowledgeGraph(client: Neo4jClient) {
  // Create concepts
  await client.createNode('Concept', {
    name: 'Machine Learning',
    definition: 'A subset of AI that learns from data'
  })

  await client.createNode('Concept', {
    name: 'Neural Networks',
    definition: 'Computing systems inspired by biological neural networks'
  })

  // Link concepts
  await client.createRelationship(
    'Concept',
    { name: 'Neural Networks' },
    'Concept',
    { name: 'Machine Learning' },
    'IS_A',
    { confidence: 0.95 }
  )

  // Add resources
  await client.createNode('Resource', {
    title: 'Deep Learning Book',
    url: 'https://deeplearningbook.org',
    type: 'book'
  })

  await client.createRelationship(
    'Resource',
    { title: 'Deep Learning Book' },
    'Concept',
    { name: 'Neural Networks' },
    'TEACHES'
  )
}
```

### Document Relationships

```typescript
// Build document citation network
async function buildCitationNetwork(client: Neo4jClient) {
  // Create papers
  const papers = [
    { id: 'paper1', title: 'Attention Is All You Need', year: 2017 },
    { id: 'paper2', title: 'BERT', year: 2018 },
    { id: 'paper3', title: 'GPT-3', year: 2020 }
  ]

  for (const paper of papers) {
    await client.createNode('Paper', paper)
  }

  // Add citations
  await client.createRelationship('Paper', { id: 'paper2' }, 'Paper', { id: 'paper1' }, 'CITES')

  await client.createRelationship('Paper', { id: 'paper3' }, 'Paper', { id: 'paper1' }, 'CITES')

  // Find most cited papers
  const mostCited = await client.query(`
    MATCH (p:Paper)<-[:CITES]-(citing)
    RETURN p.title as title, count(citing) as citations
    ORDER BY citations DESC
    LIMIT 10
  `)

  return mostCited.records
}
```

### Hierarchical Data

```typescript
// Organization hierarchy
async function buildOrgChart(client: Neo4jClient) {
  // Create employees
  const ceo = await client.createNode('Employee', {
    name: 'CEO',
    level: 'executive'
  })

  const vp = await client.createNode('Employee', {
    name: 'VP Engineering',
    level: 'executive'
  })

  const engineer = await client.createNode('Employee', {
    name: 'Senior Engineer',
    level: 'senior'
  })

  // Build hierarchy
  await client.createRelationship(
    'Employee',
    { name: 'VP Engineering' },
    'Employee',
    { name: 'CEO' },
    'REPORTS_TO'
  )

  await client.createRelationship(
    'Employee',
    { name: 'Senior Engineer' },
    'Employee',
    { name: 'VP Engineering' },
    'REPORTS_TO'
  )

  // Query hierarchy
  const orgChart = await client.query(`
    MATCH path = (e:Employee)-[:REPORTS_TO*]->(top:Employee)
    WHERE NOT (top)-[:REPORTS_TO]->()
    RETURN e.name as employee, top.name as reportsTo
  `)

  return orgChart.records
}
```

---

## Best Practices

### 1. Use Parameters

Always use parameterized queries to prevent Cypher injection:

```typescript
// Good
await client.query('MATCH (n {name: $name})', { name: userInput })

// Bad - vulnerable to injection
await client.query(`MATCH (n {name: '${userInput}'})`)
```

### 2. Index Important Properties

```typescript
// Create indexes for frequently queried properties
await client.query('CREATE INDEX person_name IF NOT EXISTS FOR (p:Person) ON (p.name)')
await client.query('CREATE INDEX doc_category IF NOT EXISTS FOR (d:Document) ON (d.category)')
```

### 3. Use Constraints

```typescript
// Ensure uniqueness
await client.query(`
  CREATE CONSTRAINT person_email IF NOT EXISTS
  FOR (p:Person) REQUIRE p.email IS UNIQUE
`)
```

### 4. Batch Operations

For bulk inserts, use transactions:

```typescript
await client.transaction(async session => {
  for (const item of largeDataset) {
    await session.run('CREATE (n:Node $props)', { props: item })
  }
})
```

### 5. Connection Management

Always close connections:

```typescript
const client = new Neo4jClient(config)
try {
  // Use client
  await client.query('MATCH (n) RETURN n')
} finally {
  await client.close()
}
```

---

## Integration Examples

### With RAG System

```typescript
import { Neo4jClient } from './client'
import { OpenAI } from 'openai'

async function ragWithGraphContext(query: string) {
  const client = createNeo4jClient()
  const openai = new OpenAI()

  try {
    // Find relevant context from graph
    const context = await client.query(
      `
      MATCH (d:Document)-[:RELATED_TO]->(concept:Concept)
      WHERE concept.name CONTAINS $query
      RETURN d.content as content
      LIMIT 3
    `,
      { query }
    )

    const contextText = context.records.map(r => r.get('content')).join('\n\n')

    // Generate response with context
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: `Context: ${contextText}` },
        { role: 'user', content: query }
      ]
    })

    return response.choices[0].message.content
  } finally {
    await client.close()
  }
}
```

### With Vector Embeddings

```typescript
// Store document with both vector and graph relationships
async function storeDocumentWithEmbedding(
  client: Neo4jClient,
  doc: { title: string; content: string; embedding: number[] }
) {
  await client.query(
    `
    CREATE (d:Document {
      title: $title,
      content: $content,
      embedding: $embedding
    })
  `,
    doc
  )

  // Create relationships to concepts
  const concepts = extractConcepts(doc.content)
  for (const concept of concepts) {
    await client.createRelationship(
      'Document',
      { title: doc.title },
      'Concept',
      { name: concept },
      'MENTIONS'
    )
  }
}

// Hybrid search: vector + graph
async function hybridSearch(client: Neo4jClient, query: string, embedding: number[]) {
  return client.query(
    `
    MATCH (d:Document)
    WITH d, gds.similarity.cosine(d.embedding, $embedding) AS similarity
    WHERE similarity > 0.7
    OPTIONAL MATCH (d)-[:MENTIONS]->(c:Concept)
    RETURN d, similarity, collect(c.name) as concepts
    ORDER BY similarity DESC
    LIMIT 10
  `,
    { embedding }
  )
}
```

---

## Supported Skills

- knowledge-graph-builder
- knowledge-base-manager
- rag-implementer
- data-engineer
- semantic-search

---

## Supported MCPs

- graph-database-mcp
- knowledge-graph-mcp
- semantic-search-mcp

---

## Troubleshooting

### Connection Issues

```typescript
// Test connection
const connected = await client.verifyConnectivity()
if (!connected) {
  console.error('Cannot connect to Neo4j')
  // Check URI, username, password
}
```

### "Database does not exist" error

Create database in Neo4j:

```cypher
CREATE DATABASE mydb
```

Or use default database: `NEO4J_DATABASE=neo4j`

### Authentication failed

Check credentials and reset password if needed:

```bash
docker exec -it neo4j bin/cypher-shell -u neo4j -p old-password
```

Then run:

```cypher
ALTER CURRENT USER SET PASSWORD FROM 'old-password' TO 'new-password'
```

### Performance Issues

1. Create indexes on frequently queried properties
2. Use `EXPLAIN` and `PROFILE` to analyze queries
3. Increase connection pool size
4. Consider using APOC procedures for complex operations

```typescript
const client = new Neo4jClient({
  uri: process.env.NEO4J_URI!,
  username: process.env.NEO4J_USERNAME!,
  password: process.env.NEO4J_PASSWORD!,
  maxConnectionPoolSize: 200 // Increase pool size
})
```

---

## Resources

- [Neo4j Documentation](https://neo4j.com/docs/)
- [Cypher Query Language](https://neo4j.com/docs/cypher-manual/current/)
- [Neo4j Driver API](https://neo4j.com/docs/javascript-manual/current/)
- [Graph Data Science](https://neo4j.com/docs/graph-data-science/current/)
- [Neo4j Aura](https://neo4j.com/cloud/aura/)
- [APOC Procedures](https://neo4j.com/labs/apoc/)

---

**Built for production-ready knowledge graphs and relationship mapping**
