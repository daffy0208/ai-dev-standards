# Backup and Restore Playbook

**Use when:** Setting up backups, recovering from data loss, disaster recovery planning

---

## Backup Strategy (3-2-1 Rule)

**The Golden Rule:**
- **3** copies of your data
- **2** different storage types
- **1** copy off-site

**Example:**
```
Copy 1: Production database (AWS RDS)
Copy 2: Daily snapshot (AWS S3)
Copy 3: Off-site backup (different region S3 bucket)
```

---

## What to Backup

### Critical (Daily Backups)

**1. Database**
- User data
- Transactions
- Application state
- Session data

**2. User-Generated Content**
- Uploaded files
- Profile images
- Documents
- Media files

**3. Configuration**
- Environment variables
- Feature flags
- API keys (encrypted)

### Important (Weekly Backups)

**4. Code Repositories**
- Application code (Git)
- Infrastructure as Code
- Scripts

**5. Logs**
- Application logs
- Access logs
- Error logs (Sentry)

### Optional (Monthly Backups)

**6. Analytics Data**
- Metrics history
- Usage statistics
- Reports

---

## Database Backup Patterns

### Pattern 1: PostgreSQL Backup

**Daily Automated Backup:**

```bash
#!/bin/bash
# backup-postgres.sh

# Configuration
DB_NAME="myapp"
BACKUP_DIR="/backups/postgres"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
S3_BUCKET="s3://myapp-backups"
RETENTION_DAYS=30

# Create backup directory
mkdir -p $BACKUP_DIR

# Dump database
pg_dump $DATABASE_URL > $BACKUP_DIR/backup_${TIMESTAMP}.sql

# Compress
gzip $BACKUP_DIR/backup_${TIMESTAMP}.sql

# Upload to S3
aws s3 cp $BACKUP_DIR/backup_${TIMESTAMP}.sql.gz $S3_BUCKET/daily/

# Delete local backup (keep S3 copy)
rm $BACKUP_DIR/backup_${TIMESTAMP}.sql.gz

# Delete old backups (> 30 days)
aws s3 ls $S3_BUCKET/daily/ | while read -r line; do
  createDate=$(echo $line | awk {'print $1" "$2'})
  createDate=$(date -d "$createDate" +%s)
  olderThan=$(date -d "-${RETENTION_DAYS} days" +%s)
  if [[ $createDate -lt $olderThan ]]; then
    fileName=$(echo $line | awk {'print $4'})
    aws s3 rm $S3_BUCKET/daily/$fileName
  fi
done

echo "Backup completed: backup_${TIMESTAMP}.sql.gz"
```

**Schedule with Cron:**

```bash
# Run daily at 2 AM
0 2 * * * /scripts/backup-postgres.sh >> /var/log/backup.log 2>&1
```

**Or Use Vercel Cron:**

```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/backup-database",
      "schedule": "0 2 * * *"
    }
  ]
}
```

```typescript
// app/api/cron/backup-database/route.ts
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export async function GET(req: Request) {
  // Verify cron secret
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const filename = `backup_${timestamp}.sql`

  try {
    // Create backup
    await execAsync(`pg_dump ${process.env.DATABASE_URL} > /tmp/${filename}`)

    // Compress
    await execAsync(`gzip /tmp/${filename}`)

    // Upload to S3
    await execAsync(`aws s3 cp /tmp/${filename}.gz s3://myapp-backups/daily/`)

    // Cleanup
    await execAsync(`rm /tmp/${filename}.gz`)

    return Response.json({
      success: true,
      filename: `${filename}.gz`,
      timestamp
    })
  } catch (error) {
    console.error('Backup failed:', error)
    return Response.json({ error: 'Backup failed' }, { status: 500 })
  }
}
```

---

### Pattern 2: Managed Database Backups (AWS RDS)

**Enable Automated Backups:**

```hcl
# terraform/rds.tf
resource "aws_db_instance" "production" {
  identifier = "myapp-production"

  # Backup configuration
  backup_retention_period = 30        # Keep 30 days
  backup_window          = "03:00-04:00"  # 3-4 AM UTC
  maintenance_window     = "Mon:04:00-Mon:05:00"

  # Point-in-time recovery
  enabled_cloudwatch_logs_exports = ["postgresql"]

  # Snapshot
  copy_tags_to_snapshot = true
  skip_final_snapshot   = false
  final_snapshot_identifier = "myapp-final-snapshot"
}
```

**Manual Snapshot:**

```bash
# Create snapshot
aws rds create-db-snapshot \
  --db-instance-identifier myapp-production \
  --db-snapshot-identifier myapp-manual-$(date +%Y%m%d)

# List snapshots
aws rds describe-db-snapshots \
  --db-instance-identifier myapp-production

# Delete old snapshot
aws rds delete-db-snapshot \
  --db-snapshot-identifier myapp-manual-20251001
```

---

### Pattern 3: MongoDB Backup

```bash
#!/bin/bash
# backup-mongodb.sh

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/mongodb"

# Dump MongoDB
mongodump --uri="$MONGODB_URI" --out=$BACKUP_DIR/dump_${TIMESTAMP}

# Compress
tar -czf $BACKUP_DIR/dump_${TIMESTAMP}.tar.gz $BACKUP_DIR/dump_${TIMESTAMP}

# Upload to S3
aws s3 cp $BACKUP_DIR/dump_${TIMESTAMP}.tar.gz s3://myapp-backups/mongodb/

# Cleanup
rm -rf $BACKUP_DIR/dump_${TIMESTAMP}
rm $BACKUP_DIR/dump_${TIMESTAMP}.tar.gz
```

---

## File Storage Backup

### Pattern 1: S3 Bucket Replication

**Cross-Region Replication:**

```hcl
# terraform/s3.tf

# Primary bucket
resource "aws_s3_bucket" "uploads" {
  bucket = "myapp-uploads"

  versioning {
    enabled = true
  }
}

# Backup bucket (different region)
resource "aws_s3_bucket" "uploads_backup" {
  bucket = "myapp-uploads-backup"
  region = "us-west-2"  # Different region

  versioning {
    enabled = true
  }
}

# Replication rule
resource "aws_s3_bucket_replication_configuration" "uploads" {
  bucket = aws_s3_bucket.uploads.id
  role   = aws_iam_role.replication.arn

  rule {
    id     = "replicate-all"
    status = "Enabled"

    destination {
      bucket        = aws_s3_bucket.uploads_backup.arn
      storage_class = "GLACIER"  # Cheaper storage for backups
    }
  }
}
```

**Benefits:**
- Automatic replication
- Cross-region protection
- Versioning enabled (recover deleted files)

---

### Pattern 2: Local File Backup

```bash
#!/bin/bash
# backup-files.sh

UPLOAD_DIR="/var/www/uploads"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Sync to S3
aws s3 sync $UPLOAD_DIR s3://myapp-backups/uploads/ \
  --delete \
  --storage-class STANDARD_IA

echo "File backup completed: $TIMESTAMP"
```

---

## Restore Procedures

### Restore PostgreSQL Database

**Full Restore:**

```bash
# Download backup from S3
aws s3 cp s3://myapp-backups/daily/backup_20251022_020000.sql.gz .

# Decompress
gunzip backup_20251022_020000.sql.gz

# Restore to database
psql $DATABASE_URL < backup_20251022_020000.sql

# Verify
psql $DATABASE_URL -c "SELECT COUNT(*) FROM users"
```

**Restore to Staging (Test Restore):**

```bash
# Restore to staging first (test recovery)
psql $STAGING_DATABASE_URL < backup_20251022_020000.sql

# Test application on staging
curl https://staging.example.com/api/health

# If successful, then restore to production
```

---

### Restore from RDS Snapshot

```bash
# List available snapshots
aws rds describe-db-snapshots \
  --db-instance-identifier myapp-production

# Restore snapshot to new instance
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier myapp-restored \
  --db-snapshot-identifier myapp-manual-20251022

# Wait for instance to be available
aws rds wait db-instance-available \
  --db-instance-identifier myapp-restored

# Get endpoint
aws rds describe-db-instances \
  --db-instance-identifier myapp-restored \
  --query 'DBInstances[0].Endpoint.Address'

# Update application to use restored instance
# Or restore to original instance (requires downtime)
```

**Point-in-Time Recovery:**

```bash
# Restore to specific time
aws rds restore-db-instance-to-point-in-time \
  --source-db-instance-identifier myapp-production \
  --target-db-instance-identifier myapp-restored \
  --restore-time 2025-10-22T14:30:00Z
```

---

### Restore MongoDB

```bash
# Download backup from S3
aws s3 cp s3://myapp-backups/mongodb/dump_20251022_020000.tar.gz .

# Decompress
tar -xzf dump_20251022_020000.tar.gz

# Restore
mongorestore --uri="$MONGODB_URI" --dir=dump_20251022_020000

# Verify
mongosh "$MONGODB_URI" --eval "db.users.countDocuments()"
```

---

### Restore Files from S3

```bash
# Restore all files
aws s3 sync s3://myapp-backups/uploads/ /var/www/uploads/

# Restore specific file
aws s3 cp s3://myapp-backups/uploads/user_123/avatar.jpg /var/www/uploads/user_123/

# Restore deleted file (with versioning)
aws s3api list-object-versions \
  --bucket myapp-uploads \
  --prefix user_123/avatar.jpg

aws s3api get-object \
  --bucket myapp-uploads \
  --key user_123/avatar.jpg \
  --version-id ABC123 \
  avatar.jpg
```

---

## Disaster Recovery Plan

### Scenario 1: Database Corruption

**Detection:**
- Application errors
- Data inconsistencies
- Integrity check failures

**Recovery Steps:**

```bash
# 1. Identify corruption time
# Check logs, error reports

# 2. Find latest good backup
aws s3 ls s3://myapp-backups/daily/

# 3. Stop application (prevent further corruption)
vercel --prod --env MAINTENANCE_MODE=true

# 4. Restore from backup
aws s3 cp s3://myapp-backups/daily/backup_20251021_020000.sql.gz .
gunzip backup_20251021_020000.sql.gz
psql $DATABASE_URL < backup_20251021_020000.sql

# 5. Verify restore
psql $DATABASE_URL -c "SELECT COUNT(*) FROM users"

# 6. Resume application
vercel --prod --env MAINTENANCE_MODE=false

# 7. Investigate cause
```

**Recovery Time Objective (RTO):** 30 minutes
**Recovery Point Objective (RPO):** Last daily backup (max 24 hours data loss)

---

### Scenario 2: Accidental Data Deletion

**Example:** User accidentally deleted, need to restore

**Recovery Steps:**

```bash
# 1. Identify when deleted
# Check audit logs

# 2. Extract from backup
aws s3 cp s3://myapp-backups/daily/backup_20251022_020000.sql.gz .
gunzip backup_20251022_020000.sql.gz

# 3. Restore single table to temporary database
createdb temp_restore
psql temp_restore < backup_20251022_020000.sql

# 4. Export specific user
psql temp_restore -c "COPY (SELECT * FROM users WHERE id = 'user_123') TO '/tmp/user_123.csv' CSV HEADER"

# 5. Import to production
psql $DATABASE_URL -c "\COPY users FROM '/tmp/user_123.csv' CSV HEADER"

# 6. Verify
psql $DATABASE_URL -c "SELECT * FROM users WHERE id = 'user_123'"

# 7. Cleanup
dropdb temp_restore
```

**Recovery Time:** 10-15 minutes
**Data Loss:** None (restored from backup)

---

### Scenario 3: Complete Infrastructure Loss

**Example:** AWS region outage, all services down

**Recovery Steps:**

```bash
# 1. Switch DNS to backup region
# Update DNS A record to backup load balancer

# 2. Restore database in backup region
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier myapp-production-backup \
  --db-snapshot-identifier myapp-latest \
  --region us-west-2

# 3. Deploy application to backup region
vercel deploy --prod --region sfo1

# 4. Restore file uploads
aws s3 sync s3://myapp-uploads-backup/ s3://myapp-uploads-failover/

# 5. Update environment variables
vercel env add DATABASE_URL [new-db-endpoint] production

# 6. Verify application
curl https://api.example.com/health

# 7. Monitor and communicate
# Update status page
# Notify users
```

**Recovery Time Objective (RTO):** 2 hours
**Recovery Point Objective (RPO):** 15 minutes (RDS automated backups)

---

## Backup Testing

### Monthly Backup Test

**Why:** Verify backups are actually restorable

**Process:**

```bash
# 1. Download latest backup
aws s3 cp s3://myapp-backups/daily/backup_latest.sql.gz .

# 2. Create test database
createdb backup_test

# 3. Restore backup
gunzip backup_latest.sql.gz
psql backup_test < backup_latest.sql

# 4. Verify data
psql backup_test -c "SELECT COUNT(*) FROM users"
psql backup_test -c "SELECT COUNT(*) FROM orders"
psql backup_test -c "SELECT COUNT(*) FROM products"

# 5. Test application against restored DB
DATABASE_URL=postgresql://localhost/backup_test npm run test:integration

# 6. Document results
echo "Backup test passed: $(date)" >> backup_test_log.txt

# 7. Cleanup
dropdb backup_test
rm backup_latest.sql
```

**Schedule:** First Monday of every month

**Success Criteria:**
- ✅ Backup downloads successfully
- ✅ Database restores without errors
- ✅ Data counts match production (approximately)
- ✅ Application can connect and query

---

## Backup Monitoring

### Automated Backup Verification

```typescript
// app/api/cron/verify-backup/route.ts

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Check if backup exists for today
    const today = new Date().toISOString().split('T')[0].replace(/-/g, '')
    const { stdout } = await execAsync(`aws s3 ls s3://myapp-backups/daily/ | grep ${today}`)

    if (!stdout) {
      // No backup today - ALERT!
      await sendAlert({
        channel: '#alerts',
        message: '🚨 No database backup found for today!',
        severity: 'high'
      })
      return Response.json({ error: 'No backup found' }, { status: 500 })
    }

    // Check backup size (should be > 100MB)
    const sizeMatch = stdout.match(/(\d+)\s+backup_/)
    const sizeMB = parseInt(sizeMatch[1]) / 1024 / 1024

    if (sizeMB < 100) {
      await sendAlert({
        channel: '#alerts',
        message: `⚠️ Backup suspiciously small: ${sizeMB}MB`,
        severity: 'medium'
      })
    }

    return Response.json({
      success: true,
      backup: stdout.trim(),
      sizeMB: Math.round(sizeMB)
    })
  } catch (error) {
    console.error('Backup verification failed:', error)
    return Response.json({ error: 'Verification failed' }, { status: 500 })
  }
}
```

**Schedule:** Daily at 3 AM (after backup runs at 2 AM)

---

## Backup Checklist

### Daily
- [ ] Database backup completed
- [ ] Backup uploaded to S3
- [ ] Backup verification passed
- [ ] Old backups pruned (> 30 days)

### Weekly
- [ ] Code repository backed up (Git)
- [ ] Configuration backed up
- [ ] Log archives created

### Monthly
- [ ] Restore test performed
- [ ] Restore test documented
- [ ] Backup storage costs reviewed
- [ ] Retention policy reviewed

### Quarterly
- [ ] Disaster recovery plan tested
- [ ] Team trained on restore procedures
- [ ] Backup coverage reviewed (any missing data?)
- [ ] RTO/RPO metrics reviewed

---

## Backup Best Practices

### 1. Automate Everything

```bash
# ❌ Don't: Manual backups
# "Remember to run backup script"

# ✅ Do: Automated backups
# Cron job runs automatically
0 2 * * * /scripts/backup-postgres.sh
```

### 2. Test Restores Regularly

```bash
# Backups are useless if you can't restore

# Schedule monthly restore tests
# Document results
# Fix any issues immediately
```

### 3. Encrypt Sensitive Backups

```bash
# Encrypt before uploading
pg_dump $DATABASE_URL | gzip | gpg --encrypt --recipient backup@example.com > backup.sql.gz.gpg

# Upload encrypted backup
aws s3 cp backup.sql.gz.gpg s3://myapp-backups/encrypted/

# Decrypt when restoring
aws s3 cp s3://myapp-backups/encrypted/backup.sql.gz.gpg .
gpg --decrypt backup.sql.gz.gpg | gunzip | psql $DATABASE_URL
```

### 4. Monitor Backup Health

```typescript
// Alert if backup fails
if (!backupExists) {
  sendAlert({
    channel: '#critical',
    message: '🚨 DATABASE BACKUP FAILED',
    severity: 'critical'
  })
}
```

### 5. Document Recovery Procedures

```markdown
# In RUNBOOK.md

## How to Restore from Backup

1. Download backup: `aws s3 cp s3://backups/latest.sql.gz .`
2. Decompress: `gunzip latest.sql.gz`
3. Restore: `psql $DATABASE_URL < latest.sql`
4. Verify: `psql $DATABASE_URL -c "SELECT COUNT(*) FROM users"`

Estimated time: 15 minutes
```

---

## Backup Storage Costs

### Optimization Strategies

**1. Use Glacier for Old Backups**

```hcl
# terraform/s3.tf
resource "aws_s3_bucket_lifecycle_configuration" "backups" {
  bucket = aws_s3_bucket.backups.id

  rule {
    id     = "archive-old-backups"
    status = "Enabled"

    transition {
      days          = 30
      storage_class = "GLACIER"  # Cheaper, slower retrieval
    }

    transition {
      days          = 90
      storage_class = "DEEP_ARCHIVE"  # Very cheap, very slow
    }

    expiration {
      days = 365  # Delete after 1 year
    }
  }
}
```

**2. Incremental Backups**

```bash
# Full backup weekly
# Incremental daily (only changes)

if [ $(date +%u) -eq 1 ]; then
  # Monday: Full backup
  pg_dump $DATABASE_URL > backup_full.sql
else
  # Other days: Incremental
  # (Requires WAL archiving)
fi
```

**3. Compression**

```bash
# Always compress backups
pg_dump $DATABASE_URL | gzip > backup.sql.gz

# Size comparison:
# backup.sql: 500MB
# backup.sql.gz: 50MB (10x smaller)
```

---

## Retention Policy

**Recommended:**

```
Daily backups: Keep 30 days
Weekly backups: Keep 12 weeks (3 months)
Monthly backups: Keep 12 months (1 year)
Yearly backups: Keep 7 years (compliance)
```

**Implementation:**

```bash
#!/bin/bash
# retention-policy.sh

# Daily backups (30 days)
aws s3 ls s3://myapp-backups/daily/ | \
  awk '{print $4}' | \
  head -n -30 | \
  xargs -I {} aws s3 rm s3://myapp-backups/daily/{}

# Weekly backups (12 weeks)
aws s3 ls s3://myapp-backups/weekly/ | \
  awk '{print $4}' | \
  head -n -12 | \
  xargs -I {} aws s3 rm s3://myapp-backups/weekly/{}

# Monthly backups (12 months)
aws s3 ls s3://myapp-backups/monthly/ | \
  awk '{print $4}' | \
  head -n -12 | \
  xargs -I {} aws s3 rm s3://myapp-backups/monthly/{}
```

---

## Backup Security

### 1. Access Control

```json
// IAM policy: Only backup service can write
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::123456789:role/backup-service"
      },
      "Action": "s3:PutObject",
      "Resource": "arn:aws:s3:::myapp-backups/*"
    }
  ]
}
```

### 2. Encryption at Rest

```hcl
resource "aws_s3_bucket_server_side_encryption_configuration" "backups" {
  bucket = aws_s3_bucket.backups.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}
```

### 3. Audit Logging

```hcl
resource "aws_s3_bucket_logging" "backups" {
  bucket = aws_s3_bucket.backups.id

  target_bucket = aws_s3_bucket.logs.id
  target_prefix = "backup-access-logs/"
}
```

---

**Remember:** Backups are insurance. Test them regularly. When disaster strikes, you'll be glad you did.
