# Database Migration Playbook

**Use when:** Adding/modifying database schema, data transformations

---

## Migration Principles

### The Golden Rules

1. **Migrations are immutable** - Never edit old migrations
2. **Migrations are reversible** - Always include rollback
3. **Test on staging first** - Never test on production
4. **Backup before migrate** - Always have escape hatch
5. **Deploy during low traffic** - Minimize user impact

---

## Types of Migrations

### 1. Additive (Low Risk)

**Adding columns, tables, indexes:**
```sql
-- ✅ Safe: Adding nullable column
ALTER TABLE users ADD COLUMN phone VARCHAR(20);

-- ✅ Safe: Adding table
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  theme VARCHAR(20)
);

-- ✅ Safe: Adding index
CREATE INDEX idx_users_email ON users(email);
```

**No downtime required** - Old code still works

### 2. Destructive (High Risk)

**Removing columns, tables:**
```sql
-- ❌ Risky: Dropping column
ALTER TABLE users DROP COLUMN legacy_field;

-- ❌ Risky: Dropping table
DROP TABLE old_analytics;
```

**Requires downtime or multi-step process**

### 3. Transformative (Medium Risk)

**Changing data types, renaming:**
```sql
-- ⚠️ Risky: Changing column type
ALTER TABLE products ALTER COLUMN price TYPE DECIMAL(10,2);

-- ⚠️ Risky: Renaming column
ALTER TABLE users RENAME COLUMN name TO full_name;
```

**May require application code changes**

---

## Migration Workflow

### Step 1: Create Migration

**Using Prisma:**
```bash
# Create migration file
npx prisma migrate dev --name add_user_phone

# Generates: prisma/migrations/20251022_add_user_phone/migration.sql
```

**Migration File:**
```sql
-- prisma/migrations/20251022_add_user_phone/migration.sql

-- Add phone column
ALTER TABLE users ADD COLUMN phone VARCHAR(20);

-- Add index for phone lookups
CREATE INDEX idx_users_phone ON users(phone) WHERE phone IS NOT NULL;
```

### Step 2: Test Locally

```bash
# Reset local database
npx prisma migrate reset

# Run migration
npx prisma migrate dev

# Verify
npx prisma studio
# Check: New column exists, indexes created

# Test application
npm run dev
# Verify: App works with new schema
```

### Step 3: Test on Staging

```bash
# Backup staging database first
pg_dump $STAGING_DATABASE_URL > staging_backup_$(date +%Y%m%d).sql

# Run migration on staging
DATABASE_URL=$STAGING_DATABASE_URL npx prisma migrate deploy

# Verify
psql $STAGING_DATABASE_URL -c "\d users"
# Check: New column exists

# Run automated tests against staging
npm run test:integration -- --env=staging

# Manual testing
# - Test existing features still work
# - Test new feature using new column
# - Check performance (EXPLAIN ANALYZE queries)
```

**Staging Soak Time:** Minimum 24 hours

### Step 4: Production Migration

**Pre-Migration Checklist:**
- [ ] Tested on staging successfully
- [ ] Backup plan ready
- [ ] Rollback script prepared
- [ ] Deployment window scheduled (low traffic)
- [ ] Team notified of deployment time
- [ ] Monitoring alerts configured

**Production Migration:**
```bash
# 1. BACKUP DATABASE (CRITICAL!)
pg_dump $DATABASE_URL > prod_backup_$(date +%Y%m%d_%H%M%S).sql
# Upload to S3 for safety
aws s3 cp prod_backup_*.sql s3://backups/

# 2. Announce maintenance (if downtime)
# Update status page

# 3. Run migration
DATABASE_URL=$DATABASE_URL npx prisma migrate deploy

# 4. Verify migration
psql $DATABASE_URL -c "\d users"
# Check: New column exists

# 5. Deploy application code
vercel --prod

# 6. Verify application
curl https://api.example.com/health
# Test critical endpoints

# 7. Monitor (30 minutes minimum)
# Watch error rates, response times
```

---

## Zero-Downtime Migrations

### Pattern: Expand-Contract

**Step 1: Expand (Add new column)**
```sql
-- Migration 1: Add new column (nullable)
ALTER TABLE users ADD COLUMN full_name VARCHAR(255);
```

**Deploy:** Old code ignores new column ✅

**Step 2: Dual Write (Write to both old and new)**
```typescript
// Application code (deployed after Migration 1)
await db.users.update({
  where: { id },
  data: {
    name: name, // Old column
    full_name: name // New column (dual write)
  }
})
```

**Deploy:** Both columns updated ✅

**Step 3: Backfill (Copy old data to new column)**
```sql
-- Migration 2: Backfill existing data
UPDATE users SET full_name = name WHERE full_name IS NULL;
```

**Deploy:** Old data migrated ✅

**Step 4: Read from New (Switch reads)**
```typescript
// Application code (deployed after Migration 2)
const user = await db.users.findUnique({ where: { id } })
const displayName = user.full_name || user.name // Fallback for safety
```

**Deploy:** Reading from new column ✅

**Step 5: Contract (Remove old column)**
```sql
-- Migration 3: Drop old column (after all code uses new)
ALTER TABLE users DROP COLUMN name;
```

**Deploy:** Old column removed ✅

**Total Time:** ~1 week for safe migration

---

## Rollback Strategies

### Option 1: Down Migration

**Create Reversible Migrations:**
```typescript
// migrations/20251022_add_user_phone.ts
export async function up(db) {
  await db.schema.table('users', (table) => {
    table.string('phone', 20).nullable()
  })
}

export async function down(db) {
  await db.schema.table('users', (table) => {
    table.dropColumn('phone')
  })
}
```

**Rollback:**
```bash
npx prisma migrate resolve --rolled-back 20251022_add_user_phone
```

### Option 2: Restore from Backup

**If Migration Failed Catastrophically:**
```bash
# Stop application
vercel --prod --rollback

# Restore database
psql $DATABASE_URL < prod_backup_20251022_143000.sql

# Verify restore
psql $DATABASE_URL -c "SELECT COUNT(*) FROM users"

# Resume application
vercel --prod
```

**Recovery Time:** 5-30 minutes depending on DB size

---

## Common Migration Patterns

### Adding a NOT NULL Column

**❌ Wrong (causes downtime):**
```sql
ALTER TABLE users ADD COLUMN email VARCHAR(255) NOT NULL;
-- Error: Existing rows violate NOT NULL constraint
```

**✅ Right (zero downtime):**
```sql
-- Step 1: Add nullable column
ALTER TABLE users ADD COLUMN email VARCHAR(255);

-- Step 2: Deploy code that populates email

-- Step 3: Backfill existing rows
UPDATE users SET email = legacy_email WHERE email IS NULL;

-- Step 4: Add NOT NULL constraint
ALTER TABLE users ALTER COLUMN email SET NOT NULL;
```

### Changing Column Type

**❌ Wrong (data loss risk):**
```sql
ALTER TABLE products ALTER COLUMN price TYPE INTEGER;
-- Truncates decimal values!
```

**✅ Right (safe):**
```sql
-- Step 1: Add new column
ALTER TABLE products ADD COLUMN price_cents INTEGER;

-- Step 2: Backfill
UPDATE products SET price_cents = (price * 100)::INTEGER;

-- Step 3: Deploy code using price_cents

-- Step 4: Drop old column
ALTER TABLE products DROP COLUMN price;

-- Step 5: Rename new column
ALTER TABLE products RENAME COLUMN price_cents TO price;
```

### Renaming a Column

**❌ Wrong (breaks old code):**
```sql
ALTER TABLE users RENAME COLUMN name TO full_name;
```

**✅ Right (zero downtime):**
```sql
-- Step 1: Add new column
ALTER TABLE users ADD COLUMN full_name VARCHAR(255);

-- Step 2: Backfill
UPDATE users SET full_name = name;

-- Step 3: Create view (compatibility layer)
CREATE VIEW users_compat AS
  SELECT
    id,
    full_name AS name, -- Old code sees "name"
    full_name,
    email,
    created_at
  FROM users;

-- Step 4: Deploy code using full_name

-- Step 5: Drop view and old column
DROP VIEW users_compat;
ALTER TABLE users DROP COLUMN name;
```

### Splitting a Table

**Before:**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255),
  password VARCHAR(255),
  -- 50 other columns...
);
```

**After:**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255),
  password VARCHAR(255),
  created_at TIMESTAMPTZ
);

CREATE TABLE user_profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id),
  bio TEXT,
  avatar_url VARCHAR(255),
  -- other profile fields...
);
```

**Migration:**
```sql
-- Step 1: Create new table
CREATE TABLE user_profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id),
  bio TEXT,
  avatar_url VARCHAR(255)
);

-- Step 2: Backfill
INSERT INTO user_profiles (user_id, bio, avatar_url)
SELECT id, bio, avatar_url FROM users;

-- Step 3: Deploy code using both tables

-- Step 4: Drop old columns
ALTER TABLE users DROP COLUMN bio;
ALTER TABLE users DROP COLUMN avatar_url;
```

---

## Performance Considerations

### Creating Indexes

**❌ Wrong (locks table):**
```sql
CREATE INDEX idx_users_email ON users(email);
-- Blocks writes during index build!
```

**✅ Right (no locking):**
```sql
CREATE INDEX CONCURRENTLY idx_users_email ON users(email);
-- Builds index without locking table
```

**Note:** CONCURRENTLY takes longer but doesn't block

### Large Data Migrations

**❌ Wrong (times out):**
```sql
UPDATE users SET verified = true WHERE verification_token IS NOT NULL;
-- 10 million rows = timeout/deadlock
```

**✅ Right (batched):**
```sql
-- Update in batches
DO $$
DECLARE
  batch_size INT := 1000;
  rows_updated INT;
BEGIN
  LOOP
    UPDATE users
    SET verified = true
    WHERE id IN (
      SELECT id FROM users
      WHERE verification_token IS NOT NULL
      AND verified = false
      LIMIT batch_size
    );

    GET DIAGNOSTICS rows_updated = ROW_COUNT;
    EXIT WHEN rows_updated = 0;

    PERFORM pg_sleep(0.1); -- 100ms pause between batches
  END LOOP;
END $$;
```

---

## Testing Migrations

### Test with Production-Like Data

```bash
# Download production-like data snapshot
pg_dump $PRODUCTION_DATABASE_URL > prod_snapshot.sql

# Restore to staging
psql $STAGING_DATABASE_URL < prod_snapshot.sql

# Run migration
DATABASE_URL=$STAGING_DATABASE_URL npx prisma migrate deploy

# Verify
# - Check data integrity
# - Run queries
# - Check performance
```

### Test Rollback

```bash
# Run migration
npx prisma migrate deploy

# Test application

# Rollback
npx prisma migrate resolve --rolled-back [migration]

# Verify rollback successful
# - Schema reverted
# - Data intact
# - Application still works
```

---

## Migration Best Practices

### 1. Small, Incremental Changes

- One logical change per migration
- Easy to understand
- Easy to rollback
- Reduces risk

### 2. Always Include Comments

```sql
-- Migration: Add user phone numbers
-- Purpose: Support SMS notifications
-- Safe to rollback: Yes
-- Expected duration: < 1 second

ALTER TABLE users ADD COLUMN phone VARCHAR(20);
```

### 3. Use Transactions (When Possible)

```sql
BEGIN;

ALTER TABLE users ADD COLUMN phone VARCHAR(20);
CREATE INDEX idx_users_phone ON users(phone);

-- Verify
SELECT COUNT(*) FROM users;

COMMIT;
-- If anything fails, entire migration rolls back
```

### 4. Monitor During Migration

```bash
# In one terminal: Run migration
npx prisma migrate deploy

# In another terminal: Monitor locks
psql $DATABASE_URL -c "
  SELECT pid, query, wait_event_type, wait_event
  FROM pg_stat_activity
  WHERE state != 'idle'
"
```

### 5. Document Breaking Changes

```markdown
# BREAKING CHANGE: User.name renamed to User.full_name

## Migration: 20251022_rename_user_name

## Impact:
- All queries using `name` column will fail
- API responses will use `full_name` instead

## Required Actions:
1. Update client code to use `full_name`
2. Update mobile app (version 2.3.0+)
3. Update integrations

## Timeline:
- 2025-10-22: Staging
- 2025-10-25: Production (after client updates)
```

---

## Emergency Procedures

### If Migration Hangs

```bash
# Check for blocking queries
psql $DATABASE_URL -c "
  SELECT pid, query, state
  FROM pg_stat_activity
  WHERE state != 'idle'
"

# Kill blocking query if safe
SELECT pg_terminate_backend(12345); -- Use pid from above
```

### If Migration Fails Halfway

```bash
# Check migration status
npx prisma migrate status

# Mark as failed
npx prisma migrate resolve --rolled-back [migration]

# Restore from backup
psql $DATABASE_URL < prod_backup.sql

# Investigate cause, fix, retry
```

---

## Migration Checklist

**Before Migration:**
- [ ] Migration tested on staging
- [ ] Backup taken
- [ ] Rollback plan prepared
- [ ] Team notified
- [ ] Low traffic window scheduled
- [ ] Monitoring configured

**During Migration:**
- [ ] Backup verified accessible
- [ ] Migration command ready
- [ ] Monitoring dashboard open
- [ ] Rollback command ready
- [ ] Communication channel open

**After Migration:**
- [ ] Schema verified correct
- [ ] Data integrity checked
- [ ] Application deployed successfully
- [ ] Monitoring normal (30 min)
- [ ] Backup retained (30 days)
- [ ] Documentation updated

---

**Remember: Migrations are permanent. Take your time. Test thoroughly.**
