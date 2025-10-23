# Database Design Patterns

**Last Updated:** 2025-10-22
**Category:** Backend Architecture
**Difficulty:** Intermediate

---

## Overview

Comprehensive patterns for database schema design, migrations, optimization, and data modeling.

**Goal:** Design scalable, performant database schemas that support your application's growth.

---

## Decision Tree: SQL vs NoSQL

```
Start here
│
├─ Need complex relationships and transactions?
│  └─ Use: PostgreSQL (Relational)
│
├─ Need flexible schema and rapid iteration?
│  └─ Use: MongoDB (Document)
│
├─ Need full-text search?
│  └─ Use: Elasticsearch
│
├─ Need key-value caching?
│  └─ Use: Redis
│
├─ Need time-series data?
│  └─ Use: TimescaleDB or InfluxDB
│
└─ Need graph relationships?
   └─ Use: Neo4j
```

---

## Pattern 1: Relational Schema Design (SQL)

### Normalization Forms

**1NF (First Normal Form):**
- Atomic values (no arrays in columns)
- Each row is unique (has primary key)

**2NF (Second Normal Form):**
- Meets 1NF
- No partial dependencies (all non-key columns depend on entire primary key)

**3NF (Third Normal Form):**
- Meets 2NF
- No transitive dependencies (non-key columns don't depend on other non-key columns)

### Example: E-Commerce Schema

```sql
-- ✅ Good: Normalized design (3NF)

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Products table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  total DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),

  INDEX idx_user_orders (user_id),
  INDEX idx_status (status)
);

-- Order items (junction table)
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL, -- Snapshot price at order time

  INDEX idx_order_items (order_id)
);
```

### When to Denormalize

Sometimes breaking normalization improves performance:

```sql
-- ❌ Normalized (requires JOIN for every query)
SELECT orders.*, users.name
FROM orders
JOIN users ON orders.user_id = users.id;

-- ✅ Denormalized (faster reads, but duplicate data)
CREATE TABLE orders (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  user_name VARCHAR(255), -- Denormalized!
  user_email VARCHAR(255), -- Denormalized!
  total DECIMAL(10, 2),
  created_at TIMESTAMP
);
```

**When to denormalize:**
- ✅ Read-heavy data (orders rarely change user info)
- ✅ Reduce JOIN overhead (performance bottleneck)
- ✅ Historical snapshots (order should keep user name at time of order)

**When NOT to denormalize:**
- ❌ Frequently updated data (creates update anomalies)
- ❌ Write-heavy tables (more data to update)

---

## Pattern 2: Indexing Strategies

### B-Tree Indexes (Default)

```sql
-- Single column index
CREATE INDEX idx_users_email ON users(email);

-- Composite index (order matters!)
CREATE INDEX idx_orders_user_status ON orders(user_id, status);

-- ✅ This query uses the index
SELECT * FROM orders WHERE user_id = '123' AND status = 'pending';

-- ⚠️ This query uses the index (leftmost prefix)
SELECT * FROM orders WHERE user_id = '123';

-- ❌ This query does NOT use the index (missing leftmost column)
SELECT * FROM orders WHERE status = 'pending';
```

### Partial Indexes

Index only rows that match a condition:

```sql
-- Only index active users (smaller, faster)
CREATE INDEX idx_active_users ON users(email) WHERE deleted_at IS NULL;

-- Only index pending orders
CREATE INDEX idx_pending_orders ON orders(created_at) WHERE status = 'pending';
```

### Covering Indexes

Include extra columns so query doesn't need to access table:

```sql
-- Covering index (includes columns in SELECT)
CREATE INDEX idx_orders_covering ON orders(user_id)
  INCLUDE (status, total, created_at);

-- This query only touches the index (index-only scan)
SELECT status, total, created_at
FROM orders
WHERE user_id = '123';
```

### Full-Text Search Indexes

```sql
-- PostgreSQL full-text search
CREATE INDEX idx_products_search ON products
  USING GIN(to_tsvector('english', name || ' ' || description));

-- Search query
SELECT * FROM products
WHERE to_tsvector('english', name || ' ' || description)
  @@ to_tsquery('english', 'laptop');
```

### Index Best Practices

✅ **DO:**
- Index foreign keys (used in JOINs)
- Index columns in WHERE clauses
- Index columns in ORDER BY
- Use composite indexes for multi-column queries
- Monitor slow queries (identify missing indexes)

❌ **DON'T:**
- Over-index (slows writes, uses storage)
- Index low-cardinality columns (boolean, enum with few values)
- Duplicate indexes

---

## Pattern 3: Query Optimization

### Analyze Query Plans

```sql
-- PostgreSQL
EXPLAIN ANALYZE SELECT * FROM orders WHERE user_id = '123';

-- Look for:
-- - Seq Scan (bad) vs Index Scan (good)
-- - Nested Loop (bad for large tables) vs Hash Join (good)
-- - Actual time vs estimated time
```

### N+1 Query Problem

```typescript
// ❌ Bad: N+1 queries (1 query for orders + N queries for users)
const orders = await db.order.findMany()
for (const order of orders) {
  const user = await db.user.findUnique({ where: { id: order.userId } })
  // Uses user data
}
// Total: 1 + 100 = 101 queries!

// ✅ Good: Single query with JOIN
const orders = await db.order.findMany({
  include: { user: true }
})
// Total: 1 query!
```

### Batch Operations

```typescript
// ❌ Bad: Individual inserts (slow)
for (const item of items) {
  await db.product.create({ data: item })
}

// ✅ Good: Batch insert
await db.product.createMany({ data: items })
```

### Select Only Needed Columns

```sql
-- ❌ Bad: Select all columns
SELECT * FROM products WHERE category = 'laptops';

-- ✅ Good: Select only needed columns
SELECT id, name, price FROM products WHERE category = 'laptops';
```

### Use Pagination

```sql
-- ❌ Bad: Load all rows
SELECT * FROM products ORDER BY created_at DESC;

-- ✅ Good: Paginate (LIMIT + OFFSET)
SELECT * FROM products
ORDER BY created_at DESC
LIMIT 20 OFFSET 0;

-- ✅ Better: Cursor-based pagination (more efficient)
SELECT * FROM products
WHERE created_at < '2024-01-01'
ORDER BY created_at DESC
LIMIT 20;
```

---

## Pattern 4: Data Consistency & Transactions

### ACID Transactions

```typescript
// Prisma transaction
await db.$transaction(async (tx) => {
  // Deduct from source account
  await tx.account.update({
    where: { id: sourceId },
    data: { balance: { decrement: amount } }
  })

  // Add to destination account
  await tx.account.update({
    where: { id: destinationId },
    data: { balance: { increment: amount } }
  })

  // Create transfer record
  await tx.transfer.create({
    data: { sourceId, destinationId, amount }
  })
})
// All or nothing - if any fails, all rollback
```

### Optimistic Locking

Prevent lost updates when multiple users edit same record:

```sql
-- Add version column
CREATE TABLE products (
  id UUID PRIMARY KEY,
  name VARCHAR(255),
  price DECIMAL(10, 2),
  version INTEGER DEFAULT 0
);

-- Update with version check
UPDATE products
SET name = 'New Name',
    price = 99.99,
    version = version + 1
WHERE id = '123'
  AND version = 5; -- Only update if version matches

-- If 0 rows updated, someone else modified it (conflict)
```

### Pessimistic Locking

Lock rows during transaction:

```sql
-- Row-level lock (prevents other transactions from modifying)
BEGIN;
SELECT * FROM products WHERE id = '123' FOR UPDATE;
-- Do work...
UPDATE products SET stock = stock - 1 WHERE id = '123';
COMMIT;
```

---

## Pattern 5: Soft Deletes

Keep deleted records for audit trail:

```sql
-- Add deleted_at column
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255),
  deleted_at TIMESTAMP NULL
);

-- Soft delete (UPDATE instead of DELETE)
UPDATE users SET deleted_at = NOW() WHERE id = '123';

-- Query active users only
SELECT * FROM users WHERE deleted_at IS NULL;

-- Index for performance
CREATE INDEX idx_users_active ON users(id) WHERE deleted_at IS NULL;
```

---

## Pattern 6: Timestamps & Audit Trail

```sql
-- Standard timestamps
CREATE TABLE products (
  id UUID PRIMARY KEY,
  name VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Full audit trail
CREATE TABLE audit_log (
  id UUID PRIMARY KEY,
  table_name VARCHAR(255),
  record_id UUID,
  action VARCHAR(50), -- INSERT, UPDATE, DELETE
  old_data JSONB,
  new_data JSONB,
  user_id UUID,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Pattern 7: UUID vs Auto-Increment IDs

### Auto-Increment (Serial)

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY, -- 1, 2, 3, 4...
  email VARCHAR(255)
);
```

**Pros:**
- ✅ Smaller (4 bytes vs 16 bytes)
- ✅ Sequential (better for indexes)
- ✅ Human-readable

**Cons:**
- ❌ Predictable (security risk: users/1, users/2)
- ❌ Not globally unique (conflicts when merging databases)
- ❌ Reveals business info (10,000th user)

### UUID

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255)
);
```

**Pros:**
- ✅ Globally unique (can generate client-side)
- ✅ Unpredictable (security)
- ✅ Easy to merge databases

**Cons:**
- ❌ Larger (16 bytes)
- ❌ Random (worse for index performance)
- ❌ Not human-readable

**Recommendation:** Use UUIDs for modern apps (security + flexibility outweigh performance cost)

---

## Pattern 8: Polymorphic Associations

Multiple tables reference same parent:

```sql
-- ❌ Bad: Polymorphic with type column (no foreign key constraint!)
CREATE TABLE comments (
  id UUID PRIMARY KEY,
  commentable_id UUID, -- Could be post_id or video_id
  commentable_type VARCHAR(50), -- 'Post' or 'Video'
  content TEXT
);

-- ✅ Good: Separate foreign keys (enforces referential integrity)
CREATE TABLE comments (
  id UUID PRIMARY KEY,
  post_id UUID REFERENCES posts(id),
  video_id UUID REFERENCES videos(id),
  content TEXT,

  CHECK (
    (post_id IS NOT NULL AND video_id IS NULL) OR
    (post_id IS NULL AND video_id IS NOT NULL)
  )
);
```

---

## Pattern 9: Caching Strategies

### Database-Level Caching

```sql
-- Materialized views (pre-computed results)
CREATE MATERIALIZED VIEW popular_products AS
SELECT p.id, p.name, COUNT(oi.id) as order_count
FROM products p
JOIN order_items oi ON p.id = oi.product_id
GROUP BY p.id, p.name
ORDER BY order_count DESC;

-- Refresh periodically
REFRESH MATERIALIZED VIEW popular_products;
```

### Application-Level Caching

```typescript
// Redis cache
import { redis } from '@/lib/redis'

async function getUser(id: string) {
  // Try cache first
  const cached = await redis.get(`user:${id}`)
  if (cached) {
    return JSON.parse(cached)
  }

  // Cache miss - fetch from database
  const user = await db.user.findUnique({ where: { id } })

  // Store in cache (10 minutes TTL)
  await redis.set(`user:${id}`, JSON.stringify(user), 'EX', 600)

  return user
}
```

---

## Pattern 10: Connection Pooling

```typescript
// Prisma connection pooling
const db = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  // Connection pool size
  pool: {
    min: 2,
    max: 10,
  },
})

// Always use a single PrismaClient instance
// Don't create new client per request!
```

---

## NoSQL Schema Design

### MongoDB Document Design

```typescript
// Embedded documents (for 1-to-few relationships)
{
  _id: ObjectId("..."),
  name: "John Doe",
  email: "john@example.com",
  addresses: [
    { street: "123 Main St", city: "SF", zip: "94103" },
    { street: "456 Oak Ave", city: "LA", zip: "90001" }
  ]
}

// Referenced documents (for 1-to-many or many-to-many)
// Users collection
{ _id: ObjectId("user1"), name: "John Doe" }

// Posts collection
{
  _id: ObjectId("post1"),
  title: "My Post",
  authorId: ObjectId("user1") // Reference
}
```

### When to Embed vs Reference

**Embed when:**
- ✅ 1-to-few relationship (user has 2-3 addresses)
- ✅ Data accessed together (always load addresses with user)
- ✅ Child data rarely changes

**Reference when:**
- ✅ 1-to-many or many-to-many (user has 100s of posts)
- ✅ Data accessed independently
- ✅ Child data frequently changes
- ✅ Document would exceed 16MB limit

---

## Migration Strategies

### Zero-Downtime Migrations

**Step 1: Additive changes (safe)**
```sql
-- Add new column (nullable)
ALTER TABLE users ADD COLUMN phone VARCHAR(20);

-- Add new table
CREATE TABLE notifications (...);

-- Add new index
CREATE INDEX CONCURRENTLY idx_users_phone ON users(phone);
```

**Step 2: Dual-write period**
```typescript
// Write to both old and new schema
await db.user.update({
  where: { id },
  data: {
    email: newEmail,
    phone: newPhone // New column
  }
})
```

**Step 3: Backfill data**
```sql
-- Backfill old rows (in batches)
UPDATE users
SET phone = legacy_phone
WHERE phone IS NULL
  AND id IN (SELECT id FROM users LIMIT 1000);
```

**Step 4: Make non-nullable**
```sql
-- After backfill complete
ALTER TABLE users ALTER COLUMN phone SET NOT NULL;
```

**Step 5: Remove old column**
```sql
-- After verification
ALTER TABLE users DROP COLUMN legacy_phone;
```

---

## Schema Versioning

```sql
-- Track schema version
CREATE TABLE schema_migrations (
  version VARCHAR(50) PRIMARY KEY,
  applied_at TIMESTAMP DEFAULT NOW()
);

-- Migration tools handle this
-- - Prisma Migrate
-- - Flyway
-- - Alembic (Python)
```

---

## Best Practices Checklist

### Schema Design
- [ ] Use UUIDs for primary keys (security + distribution)
- [ ] Add created_at/updated_at to all tables
- [ ] Use soft deletes (deleted_at) for audit trail
- [ ] Normalize to 3NF, denormalize where needed
- [ ] Use meaningful column names (user_id not uid)

### Indexing
- [ ] Index all foreign keys
- [ ] Index columns in WHERE/ORDER BY
- [ ] Use composite indexes for multi-column queries
- [ ] Monitor slow queries, add indexes as needed
- [ ] Don't over-index (slows writes)

### Performance
- [ ] Use connection pooling
- [ ] Batch operations when possible
- [ ] Select only needed columns
- [ ] Paginate large result sets
- [ ] Use EXPLAIN to analyze queries

### Data Integrity
- [ ] Use foreign key constraints
- [ ] Use CHECK constraints for validation
- [ ] Use NOT NULL where appropriate
- [ ] Use transactions for multi-step operations
- [ ] Implement optimistic locking for concurrent updates

### Migrations
- [ ] Version control all migrations
- [ ] Test migrations on staging first
- [ ] Use zero-downtime migration strategy
- [ ] Back up database before risky migrations
- [ ] Never modify existing migrations (create new ones)

---

## Related Resources

**Skills:**
- `/SKILLS/api-designer/` - API database interactions
- `/SKILLS/performance-optimizer/` - Database optimization
- `/SKILLS/security-engineer/` - SQL injection prevention

**Patterns:**
- `/STANDARDS/best-practices/database-best-practices.md`

**External:**
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Prisma Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization)
- [Use The Index, Luke](https://use-the-index-luke.com/)

---

**Good schema design prevents problems before they start.** 🗄️
