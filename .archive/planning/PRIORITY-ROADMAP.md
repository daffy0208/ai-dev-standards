# Priority Roadmap: What to Build Next

**Based on:** GAP-ANALYSIS.md using mvp-builder + product-strategist methodology
**Last Updated:** 2025-10-21

---

## TL;DR - Build These First

**Top 3 Priorities (Next 30 Days):**
1. 🔐 **security-engineer** skill - Every project needs security
2. 🧪 **testing-strategist** skill - Quality depends on testing
3. 🗄️ **database-design-patterns.md** - Every backend needs this

**Why These 3:**
- Cover 80% of common pain points
- Non-negotiable for production apps
- High usage expected across all project types

---

## Phase 1: Security Foundation (Week 1-2)

### Deliverable 1: security-engineer Skill

**Files to Create:**
```
/SKILLS/security-engineer/
  ├── SKILL.md           # Main skill content
  └── README.md          # Quick reference
```

**Content Outline:**

```markdown
# security-engineer Skill

## Core Principle
Security is not optional - build it in from day one.

## 5 Security Phases

### Phase 1: Authentication & Authorization
- Auth strategies (JWT, session, OAuth)
- Password hashing (bcrypt, argon2)
- Multi-factor authentication
- Role-based access control (RBAC)

### Phase 2: Input Validation & Sanitization
- Validate all user input
- SQL injection prevention (parameterized queries)
- XSS prevention (output encoding)
- CSRF protection

### Phase 3: Secure Configuration
- Environment variables for secrets
- Security headers (CSP, HSTS, X-Frame-Options)
- CORS configuration
- HTTPS enforcement

### Phase 4: Data Protection
- Encryption at rest (sensitive data)
- Encryption in transit (TLS)
- PII handling (GDPR compliance)
- Secret management (Vault, AWS Secrets Manager)

### Phase 5: Monitoring & Response
- Audit logging
- Rate limiting
- Anomaly detection
- Incident response procedures
```

**Success Criteria:**
- [ ] Covers OWASP Top 10
- [ ] Provides code examples for each framework
- [ ] Includes security checklist
- [ ] Has troubleshooting section

**Estimated Effort:** 2 weeks
**Estimated Value:** 10/10

---

### Deliverable 2: Authentication Patterns

**File:**
```
/STANDARDS/architecture-patterns/authentication-patterns.md
```

**Content:**
- JWT vs Session vs OAuth - decision tree
- Implementation examples (Next.js, Express, FastAPI)
- Social login patterns (Google, GitHub)
- Refresh token strategies
- Magic link authentication

**Estimated Effort:** 1 week

---

### Deliverable 3: Security Best Practices

**File:**
```
/STANDARDS/best-practices/security-best-practices.md
```

**Content:**
- Security checklist (pre-deployment)
- OWASP Top 10 quick reference
- Common vulnerabilities and fixes
- Security tools (ESLint security plugins, etc.)

**Estimated Effort:** 3 days

---

## Phase 2: Testing Foundation (Week 3-4)

### Deliverable 4: testing-strategist Skill

**Files to Create:**
```
/SKILLS/testing-strategist/
  ├── SKILL.md
  └── README.md
```

**Content Outline:**

```markdown
# testing-strategist Skill

## Core Principle
Test the right things at the right level - unit, integration, E2E.

## Testing Pyramid

### Level 1: Unit Tests (70%)
- Test individual functions/components
- Fast, isolated, deterministic
- Frameworks: Jest, Vitest, pytest
- What to test: Business logic, utilities, helpers

### Level 2: Integration Tests (20%)
- Test components working together
- Database, API routes, services
- Frameworks: Jest + Supertest, pytest + requests
- What to test: API endpoints, database operations

### Level 3: E2E Tests (10%)
- Test complete user flows
- Browser automation
- Frameworks: Playwright, Cypress
- What to test: Critical user journeys

## Test-Driven Development (TDD)
- Red → Green → Refactor cycle
- When to use TDD (vs test after)
- TDD for bug fixes

## Testing Strategies
- Mocking (when and how)
- Test doubles (stubs, spies, fakes)
- Snapshot testing
- Visual regression testing
- Performance testing
```

**Success Criteria:**
- [ ] Covers unit, integration, E2E
- [ ] Framework-specific examples
- [ ] TDD methodology explained
- [ ] Testing anti-patterns documented

**Estimated Effort:** 2 weeks
**Estimated Value:** 10/10

---

### Deliverable 5: Testing Best Practices

**File:**
```
/STANDARDS/best-practices/testing-best-practices.md
```

**Content:**
- Test naming conventions
- Code coverage targets (70% unit, 90% critical paths)
- CI/CD integration
- Test maintenance strategies

**Estimated Effort:** 3 days

---

### Deliverable 6: Test Templates

**Files:**
```
/TEMPLATES/testing/
  ├── jest-nextjs-setup.md
  ├── playwright-e2e-setup.md
  ├── vitest-setup.md
  └── pytest-setup.md
```

**Estimated Effort:** 1 week

---

## Phase 3: Database Foundation (Week 5-6)

### Deliverable 7: Database Design Patterns

**File:**
```
/STANDARDS/architecture-patterns/database-design-patterns.md
```

**Content:**

```markdown
# Database Design Patterns

## Pattern 1: Relational Schema Design
- Normalization (1NF, 2NF, 3NF)
- When to denormalize
- Foreign key relationships
- Indexing strategies

## Pattern 2: NoSQL Schema Design
- Document modeling (MongoDB)
- Key-value patterns (Redis)
- Wide-column (Cassandra)
- When to use NoSQL vs SQL

## Pattern 3: Migrations
- Zero-downtime migrations
- Rolling migrations
- Migration tools (Prisma, Alembic, Flyway)

## Pattern 4: Query Optimization
- Index selection
- Query analysis (EXPLAIN)
- N+1 query prevention
- Connection pooling

## Pattern 5: Data Consistency
- ACID transactions
- Eventual consistency
- Optimistic vs pessimistic locking
```

**Estimated Effort:** 1 week
**Estimated Value:** 9/10

---

### Deliverable 8: Database Best Practices

**File:**
```
/STANDARDS/best-practices/database-best-practices.md
```

**Content:**
- Backup strategies
- Soft deletes vs hard deletes
- Timestamp best practices
- UUID vs auto-increment

**Estimated Effort:** 3 days

---

## Phase 4: Observability (Week 7-8)

### Deliverable 9: Logging & Monitoring Patterns

**Files:**
```
/STANDARDS/architecture-patterns/logging-strategy.md
/STANDARDS/architecture-patterns/monitoring-and-alerting.md
/STANDARDS/architecture-patterns/error-tracking.md
```

**Content:**
- Structured logging (JSON)
- Log levels (DEBUG, INFO, WARN, ERROR)
- Centralized logging (CloudWatch, Datadog)
- Metrics and dashboards
- Error tracking (Sentry)
- Alerting strategies

**Estimated Effort:** 1 week

---

### Deliverable 10: Observability Playbook

**File:**
```
/PLAYBOOKS/incident-response.md
```

**Content:**
- Incident classification (P0, P1, P2)
- On-call procedures
- Post-mortem template
- Runbook format

**Estimated Effort:** 3 days

---

## Phase 5: Advanced Architecture Patterns (Week 9-12)

### Deliverable 11: Event-Driven Architecture

**File:**
```
/STANDARDS/architecture-patterns/event-driven-architecture.md
```

**Content:**
- Event sourcing
- CQRS
- Message queues (RabbitMQ, Kafka, SQS)
- Pub/sub patterns

**Estimated Effort:** 1 week

---

### Deliverable 12: Real-Time Systems

**File:**
```
/STANDARDS/architecture-patterns/real-time-systems.md
```

**Content:**
- WebSockets vs SSE vs polling
- Real-time databases (Supabase, Firebase)
- Presence and collaboration
- Conflict resolution

**Estimated Effort:** 1 week

---

### Deliverable 13: Microservices Pattern

**File:**
```
/STANDARDS/architecture-patterns/microservices-pattern.md
```

**Content:**
- Service boundaries
- API gateway
- Service mesh
- Inter-service communication
- Data consistency across services

**Estimated Effort:** 1 week

---

## Phase 6: Additional Skills (Month 4+)

### Deliverable 14: data-engineer Skill

**Files:**
```
/SKILLS/data-engineer/
  ├── SKILL.md
  └── README.md
```

**Content:**
- ETL/ELT pipelines
- Data validation
- Batch vs streaming
- Tools: Airflow, Dagster, dbt

**Estimated Effort:** 2 weeks

---

### Deliverable 15: mobile-developer Skill

**Files:**
```
/SKILLS/mobile-developer/
  ├── SKILL.md
  └── README.md
```

**Content:**
- React Native vs Flutter vs native
- Mobile-specific patterns
- Offline-first architecture
- Push notifications

**Estimated Effort:** 2 weeks

---

## Success Metrics

### After Phase 1 (Security - Week 2)
- [ ] 80% of new projects use security-engineer skill
- [ ] Security vulnerabilities reduced by 60%
- [ ] Auth implementation time reduced 50%

### After Phase 2 (Testing - Week 4)
- [ ] Average code coverage increases to 70%+
- [ ] Bug rate decreases 40%
- [ ] Test setup time reduced from days to hours

### After Phase 3 (Database - Week 6)
- [ ] Database query performance improves 50%
- [ ] Migration incidents reduced 80%
- [ ] Schema design time reduced 40%

### After Phase 4 (Observability - Week 8)
- [ ] Mean time to resolution (MTTR) reduced 60%
- [ ] Production incidents detected 90% faster
- [ ] On-call burden reduced 50%

---

## Resource Requirements

### Time Commitment
- **Weeks 1-4 (Security + Testing):** 4 weeks @ 40 hours/week = 160 hours
- **Weeks 5-8 (Database + Observability):** 4 weeks @ 40 hours/week = 160 hours
- **Weeks 9-12 (Advanced Patterns):** 4 weeks @ 20 hours/week = 80 hours

**Total Phase 1-5:** 400 hours (~10 weeks full-time)

### Validation Approach
- After each phase, test with 3-5 real projects
- Collect feedback via survey
- Iterate based on usage patterns

---

## Risk Mitigation

### Risk 1: Skills Too Generic
**Mitigation:** Include framework-specific examples (Next.js, Django, etc.)

### Risk 2: Too Much Content
**Mitigation:** Keep skills focused (150-300 lines), detailed patterns separate

### Risk 3: Outdated Quickly
**Mitigation:** Version all content, plan quarterly reviews

---

## Decision Points

### After Phase 1 (Week 2)
**Question:** Is security-engineer skill being used?
- **If yes:** Continue to Phase 2
- **If no:** Iterate on content, add more examples

### After Phase 2 (Week 4)
**Question:** Are testing patterns improving code quality?
- **If yes:** Continue to Phase 3
- **If no:** Add more framework-specific guidance

### After Phase 4 (Week 8)
**Question:** Should we prioritize data-engineer or mobile-developer next?
- **Decision criteria:** User demand, project types using ai-dev-standards

---

## Quick Wins (Can Do in Parallel)

While building main phases, also create:

**Week 1-2:**
- code-review-checklist.md (1 day)
- deployment-checklist.md (1 day)
- error-handling-patterns.md (2 days)

**Week 3-4:**
- api-design-principles.md (2 days)
- git-workflow-playbook.md (1 day)

These are low effort but provide immediate value.

---

## What NOT to Build (Yet)

**Defer to Phase 7+ (Month 6+):**
- blockchain-builder skill (niche, low demand)
- game-developer skill (very specialized)
- ML training skill (separate from RAG/inference)

**Why Defer:**
- Limited use cases
- High effort
- Can revisit if user demand emerges

---

## Validation Checklist

Before building each deliverable:

- [ ] Is this a common pain point? (Ask 5+ users)
- [ ] Will this be used weekly? (Not just once)
- [ ] Does it complement existing skills? (Not duplicate)
- [ ] Can we provide concrete examples? (Not just theory)
- [ ] Is timing right? (P0 before P1 before P2)

---

## Next Steps

1. **This Week:** Start security-engineer skill
2. **Get Feedback:** Share draft with 3-5 developers
3. **Iterate:** Based on feedback, finalize
4. **Launch:** Add to skill-registry.json as "active"
5. **Measure:** Track usage over 2 weeks
6. **Repeat:** Move to testing-strategist

---

## Appendix: Community Feedback

Will add here after surveying users:

**Questions to Ask:**
1. "Which gap affects your work most?"
2. "What would you use every week?"
3. "What's still missing from this roadmap?"

**Survey After Phase 1:** [Results TBD]
**Survey After Phase 2:** [Results TBD]
