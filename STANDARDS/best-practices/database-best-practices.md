# Database Best Practices

**Last Updated:** 2025-10-22
**Category:** Backend
**Audience:** Backend developers

---

## Overview

Practical best practices for working with databases in production applications.

**Goal:** Build reliable, performant, and maintainable database systems.

---

## General Principles

### 1. Always Use Transactions for Multi-Step Operations

```typescript
// ❌ Bad: No transaction (money can disappear if second update fails!)
await db.account.update({
  where: { id: sourceId },
  data: { balance: { decrement: amount } }
})

await db.account.update({
  where: { id: destId },
  data: { balance: { increment: amount } }
})

// ✅ Good: Wrapped in transaction
await db.$transaction(async (tx) => {
  await tx.account.update({
    where: { id: sourceId },
    data: { balance: { decrement: amount } }
  })

  await tx.account.update({
    where: { id: destId },
    data: { balance: { increment: amount } }
  })
})
```

### 2. Never Store Sensitive Data in Plain Text

```typescript
// ❌ Bad
await db.user.create({
  data: {
    email,
    password, // Plain text!
    ssn // Plain text!
  }
})

// ✅ Good
import bcrypt from 'bcrypt'

const hashedPassword = await bcrypt.hash(password, 12)
const encryptedSSN = encrypt(ssn)

await db.user.create({
  data: {
    email,
    password: hashedPassword,
    ssnEncrypted: encryptedSSN
  }
})
```

### 3. Use Soft Deletes for Important Data

```typescript
// ❌ Bad: Hard delete (data lost forever)
await db.user.delete({ where: { id } })

// ✅ Good: Soft delete (can recover)
await db.user.update({
  where: { id },
  data: { deletedAt: new Date() }
})

// Filter out soft-deleted records
const users = await db.user.findMany({
  where: { deletedAt: null }
})
```

---

## Schema Design Best Practices

### Use Timestamps on All Tables

```sql
CREATE TABLE products (
  id UUID PRIMARY KEY,
  name VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);
```

### Use Meaningful Names

```typescript
// ❌ Bad: Unclear names
user.uid
order.sts
product.qty

// ✅ Good: Clear names
user.id
order.status
product.quantity
```

### Use Enums for Fixed Sets of Values

```sql
-- PostgreSQL enum
CREATE TYPE order_status AS ENUM ('pending', 'processing', 'shipped', 'delivered', 'cancelled');

CREATE TABLE orders (
  id UUID PRIMARY KEY,
  status order_status NOT NULL DEFAULT 'pending'
);
```

```typescript
// Prisma enum
enum OrderStatus {
  PENDING
  PROCESSING
  SHIPPED
  DELIVERED
  CANCELLED
}

model Order {
  id     String      @id @default(uuid())
  status OrderStatus @default(PENDING)
}
```

### Add CHECK Constraints

```sql
CREATE TABLE products (
  id UUID PRIMARY KEY,
  price DECIMAL(10, 2) CHECK (price >= 0),
  stock INTEGER CHECK (stock >= 0),
  discount_percent INTEGER CHECK (discount_percent BETWEEN 0 AND 100)
);
```

---

## Indexing Best Practices

### Index Foreign Keys

```sql
-- ❌ Bad: No index on foreign key
CREATE TABLE orders (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id)
);

-- ✅ Good: Index foreign key
CREATE TABLE orders (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  INDEX idx_user_id (user_id)
);
```

### Index Frequently Queried Columns

```sql
-- If you often query by email
CREATE INDEX idx_users_email ON users(email);

-- If you often filter by status
CREATE INDEX idx_orders_status ON orders(status);

-- If you often sort by created_at
CREATE INDEX idx_posts_created ON posts(created_at DESC);
```

### Use Composite Indexes Wisely

```sql
-- ✅ Good: Composite index (order matters!)
CREATE INDEX idx_orders_user_status ON orders(user_id, status);

-- This query uses the index
SELECT * FROM orders WHERE user_id = '123' AND status = 'pending';

-- This query uses the index (leftmost prefix)
SELECT * FROM orders WHERE user_id = '123';

-- ❌ This query does NOT use the index
SELECT * FROM orders WHERE status = 'pending';
```

### Don't Over-Index

```typescript
// ❌ Bad: Too many indexes (slow writes)
CREATE INDEX idx1 ON users(email);
CREATE INDEX idx2 ON users(name);
CREATE INDEX idx3 ON users(created_at);
CREATE INDEX idx4 ON users(updated_at);
CREATE INDEX idx5 ON users(phone);
// ... etc

// ✅ Good: Only index what you actually query
CREATE INDEX idx_users_email ON users(email); // Used for login
CREATE INDEX idx_users_created ON users(created_at); // Used for sorting
```

---

## Query Optimization Best Practices

### Avoid SELECT *

```typescript
// ❌ Bad: Fetches all columns (wasteful)
const users = await db.user.findMany()

// ✅ Good: Select only needed columns
const users = await db.user.findMany({
  select: {
    id: true,
    name: true,
    email: true
  }
})
```

### Use Pagination

```typescript
// ❌ Bad: Load all rows (OOM if millions of rows)
const products = await db.product.findMany()

// ✅ Good: Paginate
const products = await db.product.findMany({
  take: 20,
  skip: (page - 1) * 20
})

// ✅ Better: Cursor-based pagination (more efficient)
const products = await db.product.findMany({
  take: 20,
  cursor: cursor ? { id: cursor } : undefined,
  skip: cursor ? 1 : 0
})
```

### Solve N+1 Queries

```typescript
// ❌ Bad: N+1 queries (1 + N database calls)
const orders = await db.order.findMany()

for (const order of orders) {
  const user = await db.user.findUnique({
    where: { id: order.userId }
  })
  // Use user data...
}

// ✅ Good: Single query with JOIN
const orders = await db.order.findMany({
  include: { user: true }
})
```

### Use DataLoader for GraphQL

```typescript
import DataLoader from 'dataloader'

const userLoader = new DataLoader(async (ids) => {
  const users = await db.user.findMany({
    where: { id: { in: ids } }
  })

  // Return users in same order as ids
  const userMap = new Map(users.map(u => [u.id, u]))
  return ids.map(id => userMap.get(id))
})

// Batches and deduplicates queries
const user1 = await userLoader.load('id1')
const user2 = await userLoader.load('id2')
const user3 = await userLoader.load('id1') // Cached!
```

---

## Migration Best Practices

### Version Control Migrations

```bash
# Use migration tools
npx prisma migrate dev --name add_user_phone

# Never edit existing migrations
# Always create new migrations
```

### Test Migrations on Staging First

```bash
# Apply to staging
npx prisma migrate deploy

# Verify everything works
# Then apply to production
```

### Backup Before Risky Migrations

```bash
# PostgreSQL backup
pg_dump database_name > backup_$(date +%Y%m%d_%H%M%S).sql

# Apply migration
npx prisma migrate deploy

# If something goes wrong, restore
psql database_name < backup_20240122_153000.sql
```

### Make Migrations Reversible

```sql
-- migrations/001_add_user_phone.up.sql
ALTER TABLE users ADD COLUMN phone VARCHAR(20);

-- migrations/001_add_user_phone.down.sql
ALTER TABLE users DROP COLUMN phone;
```

### Use Zero-Downtime Migrations

```typescript
// Step 1: Add nullable column
await db.$executeRaw`ALTER TABLE users ADD COLUMN phone VARCHAR(20)`

// Step 2: Deploy code that writes to both old and new
// (deploy application code)

// Step 3: Backfill data
await db.$executeRaw`
  UPDATE users
  SET phone = legacy_phone
  WHERE phone IS NULL
  LIMIT 1000
`

// Step 4: Make NOT NULL
await db.$executeRaw`ALTER TABLE users ALTER COLUMN phone SET NOT NULL`

// Step 5: Remove old column
await db.$executeRaw`ALTER TABLE users DROP COLUMN legacy_phone`
```

---

## Connection Management Best Practices

### Use Connection Pooling

```typescript
// ✅ Create single client instance (reuse connections)
// lib/db.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const db = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db
}

// ❌ Don't create new client per request
export async function GET() {
  const db = new PrismaClient() // DON'T DO THIS!
}
```

### Configure Pool Size

```typescript
// DATABASE_URL with pool size
DATABASE_URL="postgresql://user:pass@host:5432/db?connection_limit=10"

// Prisma datasource
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### Close Connections Gracefully

```typescript
// On app shutdown
process.on('SIGTERM', async () => {
  await db.$disconnect()
  process.exit(0)
})
```

---

## Data Integrity Best Practices

### Use Foreign Key Constraints

```sql
-- ✅ Good: Foreign key ensures referential integrity
CREATE TABLE orders (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id)
);

-- Can't create order with non-existent user_id
-- Can't delete user if they have orders (unless CASCADE)
```

### Use NOT NULL Where Appropriate

```sql
-- ✅ Required fields should be NOT NULL
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NULL -- Optional
);
```

### Use UNIQUE Constraints

```sql
-- Prevent duplicate emails
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL
);

-- Composite unique constraint
CREATE TABLE follows (
  follower_id UUID REFERENCES users(id),
  following_id UUID REFERENCES users(id),
  UNIQUE(follower_id, following_id) -- Can't follow twice
);
```

---

## Backup & Recovery Best Practices

### Automate Backups

```bash
# Daily backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump production_db > /backups/db_$DATE.sql

# Compress
gzip /backups/db_$DATE.sql

# Upload to S3
aws s3 cp /backups/db_$DATE.sql.gz s3://my-backups/

# Delete local backup
rm /backups/db_$DATE.sql.gz
```

### Test Restores Regularly

```bash
# Quarterly restore test
# 1. Restore backup to test database
pg_restore -d test_db backup.sql

# 2. Verify data integrity
psql test_db -c "SELECT COUNT(*) FROM users"

# 3. Test application against restored DB
```

### Keep Multiple Backup Versions

- Daily backups: Keep 7 days
- Weekly backups: Keep 4 weeks
- Monthly backups: Keep 12 months

---

## Monitoring Best Practices

### Monitor Slow Queries

```sql
-- PostgreSQL: Enable slow query log
ALTER SYSTEM SET log_min_duration_statement = 1000; -- Log queries > 1s
SELECT pg_reload_conf();

-- View slow queries
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

### Monitor Connection Pool

```typescript
// Log pool stats
setInterval(() => {
  const pool = db.$pool
  console.log({
    active: pool.activeConnections,
    idle: pool.idleConnections,
    waiting: pool.waitingCount
  })
}, 60000) // Every minute
```

### Set Up Alerts

- Database CPU > 80% for 5 minutes
- Connection pool exhausted
- Slow query detected (> 5s)
- Replication lag > 10s
- Disk space < 20%

---

## Security Best Practices

### Use Least Privilege

```sql
-- ❌ Bad: App user has admin privileges
GRANT ALL PRIVILEGES ON DATABASE mydb TO app_user;

-- ✅ Good: App user has only needed permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
REVOKE CREATE ON SCHEMA public FROM app_user;
```

### Never Expose Database Credentials

```typescript
// ❌ Bad
const db = new Database({
  host: 'prod-db.example.com',
  user: 'admin',
  password: 'hardcoded_password' // DON'T!
})

// ✅ Good
const db = new Database({
  connectionString: process.env.DATABASE_URL
})
```

### Enable SSL for Remote Connections

```bash
# DATABASE_URL with SSL
DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"
```

### Audit Database Access

```sql
-- Track who accesses what
CREATE TABLE audit_log (
  id UUID PRIMARY KEY,
  user_id UUID,
  action VARCHAR(50),
  table_name VARCHAR(255),
  record_id UUID,
  timestamp TIMESTAMP DEFAULT NOW()
);
```

---

## Performance Monitoring Checklist

- [ ] Monitor slow queries (> 1s)
- [ ] Monitor connection pool usage
- [ ] Monitor disk I/O and space
- [ ] Monitor cache hit ratio
- [ ] Monitor replication lag (if applicable)
- [ ] Set up alerts for anomalies
- [ ] Review query plans monthly
- [ ] Optimize top 10 slowest queries

---

## Database Maintenance Checklist

### Daily
- [ ] Verify backups completed successfully
- [ ] Check for connection pool exhaustion
- [ ] Review error logs

### Weekly
- [ ] Analyze slow queries
- [ ] Check disk space
- [ ] Review index usage

### Monthly
- [ ] VACUUM and ANALYZE tables (PostgreSQL)
- [ ] Review and optimize top slow queries
- [ ] Test backup restore process
- [ ] Review and remove unused indexes

### Quarterly
- [ ] Review schema for optimization opportunities
- [ ] Update database statistics
- [ ] Review security permissions
- [ ] Capacity planning

---

## Common Anti-Patterns

### Anti-Pattern 1: Using ORM as Query Builder Only

```typescript
// ❌ Bad: Raw SQL everywhere (defeats ORM purpose)
await db.$executeRaw`SELECT * FROM users WHERE email = ${email}`

// ✅ Good: Use ORM methods
await db.user.findUnique({ where: { email } })
```

### Anti-Pattern 2: Storing JSON Blobs

```typescript
// ❌ Bad: JSON blob (can't query or index efficiently)
{
  id: '123',
  data: '{"name":"John","email":"john@example.com","age":30}'
}

// ✅ Good: Proper columns
{
  id: '123',
  name: 'John',
  email: 'john@example.com',
  age: 30
}
```

### Anti-Pattern 3: Not Using Indexes

```sql
-- Slow query with no index
SELECT * FROM orders WHERE status = 'pending' ORDER BY created_at DESC;

-- Add index
CREATE INDEX idx_orders_status_created ON orders(status, created_at DESC);
```

---

## Tool Recommendations

### ORMs
- **Prisma** - TypeScript, great DX, type-safe
- **Drizzle** - Lightweight, SQL-like, type-safe
- **TypeORM** - Mature, decorators
- **Sequelize** - Popular, battle-tested

### Migration Tools
- **Prisma Migrate** - Integrated with Prisma
- **Knex** - Flexible, SQL migrations
- **Flyway** - Java-based, version control
- **Alembic** - Python, SQLAlchemy

### Monitoring
- **Datadog** - Full observability
- **New Relic** - APM with DB monitoring
- **PgHero** - PostgreSQL insights
- **pg_stat_statements** - Built-in PostgreSQL stats

---

## Related Resources

**Skills:**
- `/SKILLS/api-designer/` - API database integration
- `/SKILLS/performance-optimizer/` - Query optimization
- `/SKILLS/security-engineer/` - SQL injection prevention

**Patterns:**
- `/STANDARDS/architecture-patterns/database-design-patterns.md`

**External:**
- [Prisma Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization)
- [PostgreSQL Performance](https://wiki.postgresql.org/wiki/Performance_Optimization)
- [MySQL Best Practices](https://dev.mysql.com/doc/refman/8.0/en/optimization.html)

---

**Measure twice, query once.** 🗄️
