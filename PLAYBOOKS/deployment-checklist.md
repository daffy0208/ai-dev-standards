# Deployment Checklist

**Use before:** Every production deployment

---

## Pre-Deployment Checklist

### Code Quality

- [ ] All tests passing (unit, integration, E2E)
- [ ] Code review approved by 2+ engineers
- [ ] No console.logs or debug code
- [ ] TypeScript types correct (no `any`)
- [ ] Linting passes (`npm run lint`)
- [ ] Security scan passed (npm audit, Snyk)
- [ ] Performance tested (no regressions)
- [ ] Accessibility tested (WCAG AA compliant)

### Environment & Configuration

- [ ] Environment variables documented
- [ ] Secrets rotated if needed
- [ ] Database migrations tested on staging
- [ ] Feature flags configured correctly
- [ ] API rate limits configured
- [ ] CORS settings verified
- [ ] SSL certificates valid (not expiring soon)

### Database

- [ ] Migrations are reversible (have down migration)
- [ ] Migrations tested on staging first
- [ ] Database backup taken before migration
- [ ] No data loss risks identified
- [ ] Indexes added for new queries
- [ ] Query performance tested

### Monitoring & Alerts

- [ ] Health check endpoint working
- [ ] Error tracking configured (Sentry)
- [ ] Monitoring dashboards updated
- [ ] Alerts configured for new features
- [ ] Log levels appropriate (no debug in prod)

### Documentation

- [ ] CHANGELOG.md updated
- [ ] API documentation updated (if API changes)
- [ ] Deployment notes written
- [ ] Rollback plan documented
- [ ] Breaking changes communicated to team

### Stakeholder Communication

- [ ] Product team notified of deployment time
- [ ] Customer support briefed on changes
- [ ] Marketing aware of new features
- [ ] Users notified if downtime expected

---

## Deployment Process

### Step 1: Staging Deployment (Required)

```bash
# Deploy to staging first
git checkout main
git pull origin main
vercel deploy --target staging

# Verify on staging
curl https://staging.example.com/api/health
# Expected: {"status": "healthy"}

# Test critical user flows manually
# - Login
# - Core features
# - Payment (if applicable)

# Automated smoke tests
npm run test:smoke -- --env=staging
```

**Staging Verification:**
- [ ] All tests pass on staging
- [ ] Manual testing complete
- [ ] No errors in logs
- [ ] Performance acceptable

**Wait Time:** Minimum 30 minutes on staging before prod

### Step 2: Production Deployment

**Deployment Window:**
- **Preferred:** Tuesday-Thursday, 10am-2pm (low traffic)
- **Avoid:** Friday (weekend risk), Monday (post-weekend issues), after 4pm (no support)

**Deployment Command:**
```bash
# Production deployment
git checkout main
git pull origin main

# Tag release
git tag -a v2.4.3 -m "Release v2.4.3 - User dashboard improvements"
git push origin v2.4.3

# Deploy
vercel deploy --prod

# Or for Next.js on Vercel
vercel --prod
```

**Immediate Verification (5 minutes):**
```bash
# Health check
curl https://example.com/api/health

# Check error rate (Sentry)
# Check monitoring dashboards

# Test critical flows
# - Homepage loads
# - Login works
# - Core features function
```

### Step 3: Post-Deployment Monitoring (30 minutes)

**Watch For:**
- [ ] Error rate spike (should stay < 1%)
- [ ] Response time increase (should be < +20%)
- [ ] Memory/CPU usage spike
- [ ] Database connection issues
- [ ] Customer support tickets spike

**Monitoring Checklist:**
```markdown
⏱️ 5 min: Error rate normal? ✅
⏱️ 10 min: Response times good? ✅
⏱️ 15 min: No customer complaints? ✅
⏱️ 20 min: CPU/memory stable? ✅
⏱️ 30 min: All clear! ✅
```

### Step 4: Rollback (If Issues Detected)

**Triggers for Rollback:**
- Error rate > 5%
- Critical feature broken
- Database corruption
- Security vulnerability
- Performance degradation > 50%

**Rollback Process:**
```bash
# Option 1: Vercel rollback
vercel rollback

# Option 2: Git revert
git revert HEAD
git push origin main
vercel --prod

# Option 3: Promote previous deployment
vercel promote [previous-deployment-url] --prod
```

**After Rollback:**
- [ ] Verify rollback successful
- [ ] Investigate root cause
- [ ] Fix issue
- [ ] Re-test on staging
- [ ] Re-deploy when ready

---

## Deployment Types

### Feature Deployment (New Feature)

**Additional Checks:**
- [ ] Feature flag enabled for 5% of users first
- [ ] Analytics tracking added
- [ ] Documentation updated
- [ ] Support team trained

**Gradual Rollout:**
```typescript
// Day 1: 5% of users
if (Math.random() < 0.05 || user.betaTester) {
  return <NewFeature />
}

// Day 3: 25% of users (if no issues)
if (Math.random() < 0.25 || user.betaTester) {
  return <NewFeature />
}

// Day 7: 100% of users
return <NewFeature />
```

### Hotfix Deployment (Emergency Fix)

**Fast-Track Process:**
- [ ] Fix verified on staging (minimum 10 min)
- [ ] Code review by 1+ engineer (not author)
- [ ] Tests pass
- [ ] Deploy immediately to production
- [ ] Monitor closely for 60 minutes

**Hotfix Branch:**
```bash
git checkout main
git pull origin main
git checkout -b hotfix/critical-bug-fix

# Make fix
git add .
git commit -m "hotfix: Fix critical payment bug"
git push origin hotfix/critical-bug-fix

# Merge to main (after review)
git checkout main
git merge hotfix/critical-bug-fix
git push origin main

# Deploy
vercel --prod
```

### Database Migration Deployment

**Additional Steps:**
- [ ] Backup database before migration
- [ ] Migration tested on staging with production-like data
- [ ] Migration is reversible
- [ ] Downtime communicated (if required)
- [ ] Migration runs in transaction (if possible)

**Migration Process:**
```bash
# Backup database
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# Run migration
npx prisma migrate deploy

# Verify migration
npx prisma studio
# Check: New columns exist, data looks correct

# If issues: Rollback
psql $DATABASE_URL < backup_20251022_143000.sql
```

---

## Deployment Environments

### Development
- **URL:** localhost:3000
- **Database:** Local PostgreSQL
- **Purpose:** Active development
- **Auto-deploy:** No

### Staging
- **URL:** staging.example.com
- **Database:** Staging DB (production-like data)
- **Purpose:** Pre-production testing
- **Auto-deploy:** Yes (on push to `staging` branch)

### Production
- **URL:** example.com
- **Database:** Production DB
- **Purpose:** Live users
- **Auto-deploy:** Yes (on push to `main` branch) OR Manual

---

## Common Issues & Solutions

### Issue: Deployment Fails with Build Error

**Solution:**
```bash
# Check build locally first
npm run build

# If builds locally but fails in CI
# - Check environment variables
# - Check Node.js version matches
# - Check for missing dependencies
```

### Issue: Database Connection Fails After Deploy

**Solution:**
```bash
# Check connection string
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL -c "SELECT 1"

# Check connection pool size
# Increase if needed in .env
DATABASE_CONNECTION_LIMIT=10
```

### Issue: Environment Variables Not Loading

**Solution:**
```bash
# Vercel: Check environment variables in dashboard
vercel env ls

# Add missing variables
vercel env add API_KEY production

# Pull to local for testing
vercel env pull
```

### Issue: Deployment Slow (> 5 minutes)

**Solution:**
```bash
# Check build logs for bottlenecks
# Common causes:
# - Large dependencies (use dynamic imports)
# - Slow tests (parallelize or skip E2E in build)
# - Large assets (optimize images, use CDN)
```

---

## Deployment Best Practices

### 1. Deploy Small, Deploy Often

- Deploy daily (or more)
- Small changes = easier to debug
- Small changes = easier to rollback
- Large deploys = high risk

### 2. Use Feature Flags

```typescript
// Don't merge incomplete features to main
// Use feature flags instead

if (featureFlags.newDashboard) {
  return <NewDashboard />
} else {
  return <OldDashboard />
}
```

### 3. Monitor After Every Deploy

- Watch dashboards for 30 minutes
- Check error rates
- Test critical flows manually
- Read support tickets

### 4. Have a Rollback Plan

- Every deploy should be reversible
- Document rollback steps
- Test rollback on staging
- Keep previous version accessible

### 5. Automate Everything

- Automated tests (run before deploy)
- Automated deployments (CI/CD)
- Automated monitoring (alerts)
- Automated rollbacks (if possible)

---

## CI/CD Pipeline Example

### GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm run lint
      - run: npm run test
      - run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'

  notify:
    needs: deploy
    runs-on: ubuntu-latest
    steps:
      - name: Notify Slack
        uses: slackapi/slack-github-action@v1
        with:
          webhook-url: ${{ secrets.SLACK_WEBHOOK }}
          payload: |
            {
              "text": "✅ Deployed to production: ${{ github.sha }}"
            }
```

---

## Deployment Metrics

**Track These:**
- Deployment frequency (goal: daily)
- Deployment success rate (goal: > 95%)
- Time to deploy (goal: < 10 minutes)
- Rollback rate (goal: < 5%)
- Mean time to recovery (goal: < 30 minutes)

**Review Monthly:**
- What caused failed deployments?
- What caused rollbacks?
- How can we improve process?
- Are we deploying often enough?

---

## Emergency Contacts

**If Deployment Goes Wrong:**

- **Tech Lead:** @alice (Slack, +1-555-0123)
- **DevOps:** @bob (Slack, +1-555-0456)
- **CTO:** @carol (Slack, +1-555-0789)

**External Services:**
- **Vercel Support:** support@vercel.com
- **Database Provider:** [contact info]
- **CDN Provider:** [contact info]

---

## Post-Deployment

**After Successful Deploy:**
- [ ] Update CHANGELOG.md
- [ ] Tag release in Git
- [ ] Post in #engineering Slack channel
- [ ] Update project management tool (Jira, Linear)
- [ ] Schedule next deployment

**After Failed Deploy:**
- [ ] Document what went wrong
- [ ] Update deployment checklist
- [ ] Create tickets for improvements
- [ ] Schedule post-mortem if severe

---

**Remember: A good deployment is boring. No surprises.**
