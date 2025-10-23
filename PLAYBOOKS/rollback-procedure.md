# Rollback Procedure Playbook

**Use when:** Deployment causes issues, need to revert to previous working state

---

## When to Rollback

### Triggers

**Immediate Rollback (No Discussion):**
- ❌ Error rate > 10%
- ❌ Data corruption detected
- ❌ Security vulnerability exposed
- ❌ Critical feature completely broken
- ❌ Database connection failures
- ❌ Payment processing down

**Consider Rollback (Evaluate First):**
- ⚠️ Error rate 5-10%
- ⚠️ Performance degradation > 50%
- ⚠️ Non-critical feature broken
- ⚠️ User complaints spike
- ⚠️ Unexpected behavior in production

**Don't Rollback (Fix Forward):**
- ✅ Minor UI bug
- ✅ Typo in text
- ✅ Non-functional cosmetic issue
- ✅ Error rate < 1%
- ✅ Easy hot-fix available (< 10 min)

---

## Rollback Decision Matrix

| Issue | Severity | Users Affected | Rollback? | Timeline |
|-------|----------|----------------|-----------|----------|
| API down | P0 | All | Yes | Immediate |
| Payment failing | P0 | All checkout | Yes | Immediate |
| Data corruption | P0 | Any | Yes | Immediate |
| Major feature broken | P1 | Many | Yes | < 15 min |
| Performance -50% | P1 | All (slow) | Yes | < 30 min |
| Minor feature broken | P2 | Few | Maybe | Evaluate |
| UI glitch | P3 | Few | No | Fix forward |

---

## Rollback Types

### Type 1: Application Rollback (No DB Changes)

**Scenario:** Code-only deployment, no database migrations

**Speed:** 2-5 minutes

**Process:**
```bash
# Option A: Vercel/Netlify automatic
vercel rollback

# Option B: Git revert
git revert HEAD
git push origin main
# Triggers auto-deploy

# Option C: Promote previous deployment
vercel promote [previous-deployment-url] --prod
```

**Verification:**
```bash
# Check deployment
curl https://api.example.com/health
# Expected: 200 OK

# Check error rate (Sentry dashboard)
# Expected: < 1%

# Test critical flows manually
# - Login
# - Core features
```

---

### Type 2: Application + Database Rollback

**Scenario:** Deployment includes database migration

**Speed:** 10-30 minutes (depends on DB size)

**⚠️ WARNING: More complex, test procedure before using**

#### Step 1: Stop New Traffic (Optional)

```bash
# If possible, enable maintenance mode
# This prevents new writes during rollback

# Vercel
vercel env add MAINTENANCE_MODE true

# Or update DNS to maintenance page
```

#### Step 2: Rollback Application

```bash
# Revert to previous version
git revert HEAD
git push origin main
```

#### Step 3: Rollback Database Migration

**Option A: Down Migration (Preferred)**

```bash
# Mark migration as rolled back
npx prisma migrate resolve --rolled-back 20251022_add_user_phone

# If migration has reversible script
npm run migrate:rollback
```

**Migration File Structure (Reversible):**
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

**Run Down Migration:**
```bash
npx knex migrate:rollback --all
# Or specific migration
npx knex migrate:down 20251022_add_user_phone.ts
```

**Option B: Restore from Backup (If Down Migration Unavailable)**

```bash
# 1. Stop application (prevent writes)
vercel --prod --rollback

# 2. Restore database
psql $DATABASE_URL < backup_20251022_143000.sql

# 3. Verify restore
psql $DATABASE_URL -c "SELECT COUNT(*) FROM users"
psql $DATABASE_URL -c "\d users" # Check schema

# 4. Resume application
vercel --prod
```

#### Step 4: Verify

```bash
# Check database schema
npx prisma studio
# Verify: Rolled-back changes reverted

# Check application
curl https://api.example.com/health

# Monitor errors (30 min)
```

---

### Type 3: Hotfix Rollback (Emergency)

**Scenario:** Need to roll back a critical hotfix

**Speed:** 1-2 minutes

```bash
# Hotfix was deployed via hotfix branch
git log --oneline
# abc123 hotfix: Fix payment bug
# def456 Previous working state

# Revert hotfix commit
git revert abc123
git push origin main

# Or reset to before hotfix
git reset --hard def456
git push origin main --force

# ⚠️ Only use --force if:
# - You understand the risks
# - No one else pushed since hotfix
# - Team is aware
```

---

## Platform-Specific Rollback

### Vercel

```bash
# List recent deployments
vercel ls

# Rollback to previous
vercel rollback

# Rollback to specific deployment
vercel promote https://my-app-abc123.vercel.app --prod

# Check current deployment
vercel inspect

# View deployment logs
vercel logs https://my-app-abc123.vercel.app
```

### Netlify

```bash
# List deployments
netlify deploy:list

# Rollback to previous
netlify deploy --restore-deploy [deploy-id]

# Lock deploy (prevent auto-deploys)
netlify deploy:lock
```

### AWS Lambda

```bash
# List versions
aws lambda list-versions-by-function --function-name my-function

# Rollback to previous version
aws lambda update-alias \
  --function-name my-function \
  --name production \
  --function-version 3

# Or update function code
aws lambda update-function-code \
  --function-name my-function \
  --s3-bucket my-bucket \
  --s3-key lambda-previous.zip
```

### Kubernetes

```bash
# Check rollout history
kubectl rollout history deployment/api-service

# Rollback to previous revision
kubectl rollout undo deployment/api-service

# Rollback to specific revision
kubectl rollout undo deployment/api-service --to-revision=2

# Check status
kubectl rollout status deployment/api-service

# Verify pods
kubectl get pods -l app=api-service
```

### Heroku

```bash
# List releases
heroku releases --app my-app

# Rollback to previous release
heroku rollback --app my-app

# Rollback to specific release
heroku rollback v42 --app my-app

# Check status
heroku ps --app my-app
```

---

## Communication Protocol

### Announce Rollback

```markdown
#incidents channel:

🔄 ROLLING BACK DEPLOYMENT

Deployment: v2.4.3 → v2.4.2
Reason: API error rate 12% (threshold 5%)
Started: 15:23 UTC
ETA: 5 minutes
IC: @alice
```

### During Rollback

```markdown
⏱️ 15:25 UPDATE
- Application rolled back: ✅
- Database rolling back: 🔄
- ETA: 3 minutes
```

### After Rollback

```markdown
✅ 15:28 ROLLBACK COMPLETE

Status: v2.4.2 (previous working version)
Error rate: 0.8% (normal)
Database: Rolled back successfully
Next steps: Investigate v2.4.3 issue, fix, re-deploy
Monitoring: 30 min
```

---

## Rollback Checklist

### Pre-Rollback

- [ ] Incident severity confirmed (P0/P1)
- [ ] IC assigned
- [ ] Team notified (#incidents channel)
- [ ] Backup verified available (if DB rollback needed)
- [ ] Previous deployment identified
- [ ] Rollback command prepared

### During Rollback

- [ ] Announce rollback start
- [ ] Execute rollback command
- [ ] Monitor deployment progress
- [ ] Update team every 5 minutes
- [ ] Document steps taken

### Post-Rollback

- [ ] Verify application working
- [ ] Verify database schema correct
- [ ] Check error rates (< 1%)
- [ ] Test critical user flows
- [ ] Monitor for 30 minutes
- [ ] Update status page
- [ ] Schedule post-mortem

### Investigation

- [ ] Identify root cause
- [ ] Create fix
- [ ] Test fix on staging
- [ ] Review with team
- [ ] Re-deploy when ready

---

## Common Rollback Scenarios

### Scenario 1: Broken API Endpoint

**Symptoms:**
- 500 errors on specific endpoint
- Error rate 15%
- Sentry alerts

**Rollback:**
```bash
# Quick rollback (code only)
vercel rollback

# Verify
curl https://api.example.com/api/users
# Expected: 200 OK

# Monitor
# Sentry dashboard: Error rate drops to < 1%
```

**Timeline:** 2-3 minutes

---

### Scenario 2: Database Migration Failure

**Symptoms:**
- Application crashes on startup
- Database connection errors
- Migration script failed halfway

**Rollback:**
```bash
# 1. Check migration status
npx prisma migrate status
# Shows: Migration 20251022_add_user_phone failed

# 2. Mark as rolled back
npx prisma migrate resolve --rolled-back 20251022_add_user_phone

# 3. Restore from backup (if needed)
psql $DATABASE_URL < backup_20251022_140000.sql

# 4. Rollback application
git revert HEAD
git push origin main

# 5. Verify
npx prisma studio
# Check: Schema matches expected state
```

**Timeline:** 10-15 minutes

---

### Scenario 3: Performance Degradation

**Symptoms:**
- Response times 3x normal
- Timeout errors
- Database slow query log full

**Rollback:**
```bash
# 1. Quick rollback
vercel rollback

# 2. Check if improves
curl -w "\nTime: %{time_total}s\n" https://api.example.com/api/products
# Before: Time: 4.2s
# After: Time: 0.8s ✅

# 3. Investigate rolled-back code
# - N+1 queries?
# - Missing indexes?
# - Expensive computations?
```

**Timeline:** 3-5 minutes

---

### Scenario 4: Feature Flag Gone Wrong

**Symptoms:**
- New feature causing issues
- Error rate spike
- User complaints

**Rollback:**
```bash
# Don't rollback entire deployment!
# Just disable feature flag

# Option A: Environment variable
vercel env add FEATURE_NEW_DASHBOARD false

# Option B: Feature flag service
curl -X PATCH https://api.featureflag.com/flags/new-dashboard \
  -d '{"enabled": false}'

# Option C: Database config
psql $DATABASE_URL -c "UPDATE feature_flags SET enabled = false WHERE name = 'new_dashboard'"

# Verify
curl https://api.example.com/api/feature-flags
# new_dashboard: false ✅
```

**Timeline:** 1-2 minutes

**Advantage:** No deployment needed, instant rollback

---

## Rollback Testing

### Test Your Rollback Procedure (Quarterly)

**Why:** Ensure rollback works when you need it

**Process:**

```bash
# 1. Deploy to staging
git checkout main
vercel deploy --target staging

# 2. Deploy intentionally broken code
git checkout -b test-rollback
# Make breaking change
git commit -m "test: Intentional break for rollback test"
vercel deploy --target staging

# 3. Verify broken
curl https://staging.example.com/api/health
# Expected: 500 error ✅

# 4. Practice rollback
vercel rollback --target staging

# 5. Verify fixed
curl https://staging.example.com/api/health
# Expected: 200 OK ✅

# 6. Time the rollback
# Goal: < 5 minutes for code-only
# Goal: < 15 minutes for DB rollback

# 7. Document any issues
```

---

## Rollback Best Practices

### 1. Keep Rollback Simple

```bash
# ✅ Good: One-command rollback
vercel rollback

# ❌ Bad: Complex multi-step manual process
# ssh into server
# stop service
# restore files
# restart service
# check logs
```

**Automate rollback as much as possible**

### 2. Test Rollback on Staging

```bash
# Before production deploy
# Test rollback on staging

# 1. Deploy to staging
# 2. Rollback staging
# 3. Verify rollback works
# 4. THEN deploy to production

# If rollback fails on staging, fix it first!
```

### 3. Never Rollback Data

```bash
# ❌ Don't delete user data during rollback

# Example: Migration added user_preferences table
# Rollback should:
# ✅ Keep table and data (safe)
# ❌ Drop table (deletes user data!)

# If you must drop table
# 1. Export data first
# 2. Store backup
# 3. Then drop
```

### 4. Document Rollback Steps

```markdown
# In deployment notes

## Rollback Procedure for v2.4.3

If issues occur:
1. Run: `vercel rollback`
2. Database migration is reversible (has down script)
3. If needed: `npx knex migrate:rollback`
4. Backup available: s3://backups/prod_20251022_140000.sql
5. Expected rollback time: 5-10 minutes
```

### 5. Monitor After Rollback

```bash
# Don't assume rollback fixed everything
# Monitor for 30 minutes after rollback

# Check:
# - Error rate (Sentry)
# - Response times (monitoring)
# - User reports (support tickets)
# - Database integrity (spot checks)
```

---

## Partial Rollback Strategies

### Strategy 1: Feature Flag Disable (Fastest)

```typescript
// Instead of full rollback, disable feature
if (!featureFlags.newCheckout) {
  return <OldCheckout />
}
```

**Advantage:** Instant, no deployment
**Use when:** Issue isolated to one feature

### Strategy 2: Traffic Splitting

```nginx
# Route 100% traffic to old version
# While new version stays deployed

upstream backend {
  server old-api.internal:3000 weight=100;
  server new-api.internal:3000 weight=0;
}
```

**Advantage:** Can debug new version in production
**Use when:** Need to investigate while serving users

### Strategy 3: Gradual Rollback

```typescript
// Reduce new version traffic over time
// 100% → 50% → 10% → 0%

if (Math.random() < 0.1) {
  return <NewFeature />
}
```

**Advantage:** Gradual impact reduction
**Use when:** Issue affects some users, not all

---

## Preventing Rollbacks

### Before Deployment

```markdown
✅ All tests pass (unit, integration, E2E)
✅ Code review approved
✅ Tested on staging (minimum 30 min)
✅ Database migration tested
✅ Rollback plan documented
✅ Backup taken (if DB changes)
✅ Feature flags configured
✅ Monitoring configured
```

### After Deployment

```markdown
✅ Monitor for 30 minutes
✅ Check error rates
✅ Test critical flows
✅ Review support tickets
✅ Gradual rollout (5% → 25% → 100%)
```

**Goal:** Catch issues before they require rollback

---

## Rollback Metrics

**Track:**
- Rollback frequency (goal: < 5% of deployments)
- Time to rollback (goal: < 5 minutes)
- Rollback success rate (goal: 100%)
- Repeat rollbacks (same issue twice = process problem)

**Review Monthly:**
- Why did we rollback?
- How can we prevent it?
- Was rollback procedure smooth?
- What can we improve?

---

## Emergency Contacts

**If Rollback Fails:**

- **Tech Lead:** @alice (Slack: /msg @alice, Phone: +1-555-0123)
- **DevOps:** @bob (Slack: /msg @bob, Phone: +1-555-0456)
- **CTO:** @carol (Slack: /msg @carol, Phone: +1-555-0789)

**Platform Support:**
- **Vercel:** support@vercel.com, Slack: vercel.com/support
- **AWS:** Open support ticket, Phone: 1-800-AWS-HELP
- **Database Provider:** [contact info]

---

## Post-Rollback Actions

### Immediate (Same Day)

- [ ] Verify rollback successful
- [ ] Update status page ("Issue resolved")
- [ ] Notify affected users (if appropriate)
- [ ] Document what happened (incident log)
- [ ] Create tickets for investigation
- [ ] Schedule post-mortem (within 48 hours)

### Investigation (Next Day)

- [ ] Reproduce issue locally
- [ ] Identify root cause
- [ ] Create fix
- [ ] Write tests to prevent regression
- [ ] Review with team
- [ ] Test on staging thoroughly

### Prevention (Within Week)

- [ ] Update deployment checklist
- [ ] Add monitoring/alerts
- [ ] Update documentation
- [ ] Share learnings with team
- [ ] Implement preventive measures

---

## Rollback Decision Tree

```
Issue detected in production
↓
Is it critical? (P0/P1)
├── No → Fix forward
└── Yes ↓
    Can we disable via feature flag?
    ├── Yes → Disable feature (fastest)
    └── No ↓
        Is it code-only change?
        ├── Yes → Application rollback (5 min)
        └── No (DB changes) ↓
            Is down migration available?
            ├── Yes → Run down migration + app rollback (15 min)
            └── No → Restore from backup + app rollback (30 min)

After rollback:
↓
Verify + Monitor 30 min
↓
Schedule post-mortem
```

---

**Remember:** A good rollback is boring and fast. Practice regularly, automate everything, document clearly.
