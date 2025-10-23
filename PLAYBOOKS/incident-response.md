# Incident Response Playbook

**Use when:** Production is down, critical bug affecting users, security incident

---

## Severity Levels

### P0 - Critical (Immediate Response)
**Impact:** Service down, data loss risk, security breach
**Response:** Drop everything, all hands on deck
**Examples:**
- Database server down
- Payment processing broken
- Security breach detected
- Data corruption

### P1 - High (< 1 hour response)
**Impact:** Major feature broken, significant user impact
**Response:** Senior engineer assigned immediately
**Examples:**
- Login failing for some users
- API endpoint returning 500s
- Performance degradation

### P2 - Medium (< 4 hours response)
**Impact:** Minor feature broken, workaround exists
**Response:** Fixed in normal workflow
**Examples:**
- UI bug affecting non-critical feature
- Minor performance issue
- Cosmetic bugs

### P3 - Low (< 1 week response)
**Impact:** Annoyance, no business impact
**Response:** Backlog, fixed when convenient
**Examples:**
- Typos
- Minor UI glitches
- Feature requests

---

## P0 Incident Response Protocol

### Phase 1: Detection (0-5 minutes)

**Incident Detected By:**
- [ ] Monitoring alert (Sentry, Datadog)
- [ ] Customer report
- [ ] Internal discovery
- [ ] Health check failure

**Immediate Actions:**
1. **Acknowledge** - Confirm you're responding
   ```
   #incidents channel: "@here P0 incident - [brief description] - I'm on it"
   ```

2. **Create Incident Channel**
   ```
   Slack: /incident create p0 [title]
   ```

3. **Gather Initial Info** (2 minutes max)
   - What's broken?
   - Since when?
   - How many users affected?
   - Error logs/stack traces?

### Phase 2: Triage (5-15 minutes)

**Determine Severity:**
```markdown
Is service completely down? → P0
Are users blocked from critical actions? → P0
Is data at risk? → P0
Everything else? → P1 or lower
```

**Assign Roles:**
- **Incident Commander (IC):** Coordinates response
- **Communications Lead:** Updates stakeholders
- **Technical Lead:** Fixes the issue
- **Scribe:** Documents timeline

**Communicate Status:**
```markdown
#incidents:
📍 Status: Investigating
🔥 Severity: P0
⏱️ Started: 14:32 UTC
👤 IC: @alice
🔍 Symptoms: API returning 500s, ~5K users affected
📊 Monitoring: https://...
```

### Phase 3: Mitigation (15-60 minutes)

**Priority: STOP THE BLEEDING**

**Quick Wins (Try These First):**
1. **Rollback Recent Deploy**
   ```bash
   # If deploy was in last hour
   git revert HEAD
   git push origin main
   # Or: Vercel rollback, etc.
   ```

2. **Restart Services**
   ```bash
   # Sometimes it's that simple
   kubectl rollout restart deployment/api
   # Or: Restart Heroku dyno, etc.
   ```

3. **Enable Circuit Breaker**
   ```typescript
   // Temporarily disable failing feature
   if (featureFlags.disablePayments) {
     return { error: 'Temporarily unavailable' }
   }
   ```

4. **Scale Up Resources**
   ```bash
   # If performance issue
   kubectl scale deployment/api --replicas=10
   ```

**Investigation:**
```markdown
Check (in order):
1. Recent deploys (last 24h)
2. Error logs (Sentry, CloudWatch)
3. Database status (connections, locks)
4. External dependencies (Stripe, Auth0)
5. Infrastructure (CPU, memory, disk)
```

**Communication Updates (Every 15 min):**
```markdown
#incidents:
⏱️ 14:47 UPDATE
- Identified: Database connection pool exhausted
- Action: Scaling up DB connections
- ETA: 10 minutes
- Users affected: Still ~5K
```

### Phase 4: Resolution (60+ minutes)

**Fix Applied:**
```markdown
#incidents:
✅ 15:15 RESOLVED
- Fix: Increased DB connection pool from 10 to 50
- Status: API responding normally
- Verification: Error rate dropped to 0%
- Monitoring: Watching for 30 min
```

**Verification Checklist:**
- [ ] Error rate back to normal
- [ ] Response times normal
- [ ] Monitoring dashboards green
- [ ] Test critical user flows manually
- [ ] Customer reports stopped

### Phase 5: Post-Incident (Same Day)

**Immediate Actions:**
1. **Update Status Page**
   ```
   "The issue with API errors has been resolved."
   ```

2. **Notify Affected Users** (if appropriate)
   ```
   Email: "We experienced a brief service interruption..."
   ```

3. **Schedule Post-Mortem** (within 48 hours)

---

## Post-Mortem Template

**Date:** 2025-10-22
**Duration:** 43 minutes (14:32 - 15:15 UTC)
**Severity:** P0
**Impact:** 5,000 users affected, API unavailable

### Timeline

| Time | Event |
|------|-------|
| 14:30 | Deploy v2.4.3 to production |
| 14:32 | First error reports in Sentry |
| 14:35 | Monitoring alerts triggered |
| 14:37 | Incident declared, IC assigned |
| 14:45 | Root cause identified (DB connections) |
| 15:00 | Fix deployed (increased connection pool) |
| 15:15 | Incident resolved, monitoring |

### Root Cause

**What Happened:**
Database connection pool size was set to 10. New deployment increased concurrent requests, exhausting connection pool. API couldn't connect to DB, returned 500 errors.

**Why It Happened:**
- Connection pool size not scaled with traffic growth
- Load testing didn't catch this (tested with < 10 concurrent)
- No alerting on DB connection pool exhaustion

### Impact

**Users:**
- 5,000 users unable to access dashboard
- ~$2,500 revenue impact (estimated)
- 147 support tickets

**Engineering:**
- 43 minutes downtime
- 3 engineers involved
- 2 hours total engineering time

### What Went Well ✅

- Fast detection (< 5 min)
- Clear communication
- Root cause identified quickly
- Fix was simple and effective

### What Went Wrong ❌

- Should have been caught in load testing
- No monitoring for DB connection pool
- Unclear on-call rotation (confusion on who responds)

### Action Items

| Action | Owner | Due Date | Status |
|--------|-------|----------|--------|
| Add DB connection pool monitoring | @alice | 2025-10-25 | ✅ Done |
| Update load tests to match production traffic | @bob | 2025-10-29 | 🔄 In Progress |
| Document on-call rotation clearly | @carol | 2025-10-24 | ✅ Done |
| Review connection pool sizing for all services | @alice | 2025-10-31 | ⏳ Pending |

---

## On-Call Best Practices

### Before Your Shift

- [ ] Test pager/alerts (make sure you'll receive them)
- [ ] Access to all systems verified
- [ ] Runbooks reviewed
- [ ] Contact info for escalation saved
- [ ] Laptop charged, internet stable

### During Your Shift

**Response Times:**
- P0: Acknowledge within 5 minutes
- P1: Acknowledge within 30 minutes
- P2: Acknowledge within 4 hours

**If You Can't Fix It:**
```
1. Escalate (don't be a hero)
2. Call in backup
3. Document what you've tried
4. Hand off clearly
```

**Keep Stakeholders Updated:**
- Every 15 minutes for P0
- Every hour for P1
- Daily for P2

### After Incident

- [ ] Write post-mortem (within 48 hours)
- [ ] Create action items
- [ ] Update runbooks
- [ ] Schedule post-mortem review meeting

---

## Runbook Template

### Service: API Server

**How to Check Health:**
```bash
curl https://api.example.com/health
# Expected: {"status": "healthy"}
```

**Common Issues:**

**Issue 1: High Error Rate**
```
Symptoms: Sentry alerts, users reporting errors
Check: kubectl logs -f deployment/api
Fix: Check recent deploys, consider rollback
```

**Issue 2: Slow Response Times**
```
Symptoms: Timeout errors, users reporting slow load
Check: Database query times, CPU/memory usage
Fix: Scale up pods, check for expensive queries
```

**Issue 3: Database Connection Errors**
```
Symptoms: "connection pool exhausted" errors
Check: DB connection count, active queries
Fix: Increase connection pool, kill long-running queries
```

**Escalation:**
- Primary: @tech-lead (Slack, phone: +1-555-0123)
- Secondary: @cto (Slack, phone: +1-555-0456)

---

## Security Incident Response

**If Security Breach Suspected:**

1. **DO NOT PANIC** - But act fast
2. **Isolate** - Disable compromised services
3. **Assess** - What data was accessed?
4. **Notify** - Security team, legal, management
5. **Preserve Evidence** - Don't delete logs
6. **Communicate** - Affected users, regulators (if required)

**Legal Requirements:**
- GDPR: Report within 72 hours
- CCPA: Notify without unreasonable delay
- Check your jurisdiction

---

## Communication Templates

### Status Page Update (Investigating)
```
We are currently investigating reports of issues with [feature].
We will provide an update within 30 minutes.
```

### Status Page Update (Resolved)
```
The issue with [feature] has been resolved.
Service is operating normally. We apologize for any inconvenience.
```

### Customer Email (After P0)
```
Subject: Service Interruption Resolved

Dear Valued Customer,

On October 22, 2025, between 14:32 and 15:15 UTC, some users
experienced difficulty accessing our dashboard.

The issue has been fully resolved. Your data was not affected.

We sincerely apologize for the inconvenience.

If you have questions, please contact support@example.com.

Best regards,
[Your Company]
```

---

## Incident Response Checklist

### P0 Incident

**Immediate (0-15 min):**
- [ ] Acknowledge incident
- [ ] Create incident channel
- [ ] Assign IC, Tech Lead, Communications
- [ ] Update status page ("Investigating")
- [ ] Gather initial information

**Mitigation (15-60 min):**
- [ ] Attempt quick fixes (rollback, restart, scale)
- [ ] Identify root cause
- [ ] Apply fix
- [ ] Verify resolution
- [ ] Update stakeholders every 15 min

**Resolution (60+ min):**
- [ ] Confirm fix stable
- [ ] Update status page ("Resolved")
- [ ] Notify affected customers
- [ ] Schedule post-mortem
- [ ] Thank responders

**Follow-up (48 hours):**
- [ ] Write post-mortem
- [ ] Create action items
- [ ] Review in team meeting
- [ ] Update runbooks
- [ ] Implement preventions

---

## Key Metrics to Track

**During Incident:**
- Time to detect (alert to acknowledgment)
- Time to mitigate (acknowledgment to fix deployed)
- Time to resolve (fix deployed to verified)
- Users affected
- Revenue impact

**Long-term:**
- Incidents per month
- Mean time to resolution (MTTR)
- Repeat incidents (same root cause)
- Action item completion rate

**Goal:** Reduce MTTR over time, fewer repeat incidents

---

## Remember

**Do:**
- ✅ Communicate clearly and often
- ✅ Focus on mitigation first, root cause later
- ✅ Document everything
- ✅ Ask for help early
- ✅ Stay calm

**Don't:**
- ❌ Panic or rush
- ❌ Try to be a hero
- ❌ Make changes without documenting
- ❌ Blame people (blame process)
- ❌ Skip the post-mortem

**"The best incident response is the one you practiced."**

Practice with game days, chaos engineering, and regular drills.
