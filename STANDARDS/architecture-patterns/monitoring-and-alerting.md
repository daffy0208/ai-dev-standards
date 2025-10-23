# Monitoring & Alerting

**Last Updated:** 2025-10-22
**Category:** Observability
**Difficulty:** Intermediate

---

## Overview

Comprehensive monitoring and alerting strategy for production systems.

**Goal:** Know about problems before your users do, and fix them quickly.

---

## The Four Golden Signals

Monitor these four metrics for every service:

### 1. Latency
**What:** Response time
**Why:** Slow = bad UX
**Target:** p95 < 500ms, p99 < 1s

### 2. Traffic
**What:** Requests per second
**Why:** Understand load patterns
**Target:** Baseline + anomaly detection

### 3. Errors
**What:** Failed requests (5xx, exceptions)
**Why:** Users experiencing issues
**Target:** < 0.1% error rate

### 4. Saturation
**What:** Resource utilization (CPU, memory, disk)
**Why:** Predict capacity issues
**Target:** < 80% utilization

---

## Metrics to Monitor

### Application Metrics

**HTTP Requests:**
```typescript
// Track request count, duration, status code
metrics.increment('http_requests_total', {
  method: 'POST',
  path: '/api/orders',
  status: 201
})

metrics.histogram('http_request_duration_ms', duration, {
  method: 'POST',
  path: '/api/orders'
})
```

**Database Queries:**
```typescript
metrics.histogram('db_query_duration_ms', duration, {
  operation: 'SELECT',
  table: 'users'
})

metrics.increment('db_connection_pool_exhausted')
```

**Cache Performance:**
```typescript
metrics.increment('cache_hits', { cache: 'redis' })
metrics.increment('cache_misses', { cache: 'redis' })

// Cache hit rate = hits / (hits + misses)
```

**Business Metrics:**
```typescript
metrics.increment('orders_created', { userId, total })
metrics.increment('payments_processed', { amount, status })
metrics.gauge('active_users', activeCount)
```

### Infrastructure Metrics

**CPU:**
- CPU utilization %
- CPU steal time (on cloud)

**Memory:**
- Memory used %
- Memory available

**Disk:**
- Disk used %
- Disk I/O operations
- Disk read/write throughput

**Network:**
- Network bandwidth
- Connection count
- Packet loss

---

## Implementation Examples

### Prometheus + Grafana

**Express.js with prom-client:**
```typescript
import express from 'express'
import client from 'prom-client'

const app = express()

// Create metrics
const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'path', 'status']
})

const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_ms',
  help: 'HTTP request duration in ms',
  labelNames: ['method', 'path'],
  buckets: [10, 50, 100, 500, 1000, 2000, 5000]
})

// Middleware
app.use((req, res, next) => {
  const start = Date.now()

  res.on('finish', () => {
    const duration = Date.now() - start

    httpRequestsTotal.inc({
      method: req.method,
      path: req.route?.path || req.path,
      status: res.statusCode
    })

    httpRequestDuration.observe({
      method: req.method,
      path: req.route?.path || req.path
    }, duration)
  })

  next()
})

// Metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType)
  res.end(await client.register.metrics())
})
```

### Datadog

```typescript
import { StatsD } from 'hot-shots'

const statsd = new StatsD({
  host: 'localhost',
  port: 8125,
  prefix: 'myapp.',
  globalTags: {
    env: process.env.NODE_ENV,
    service: 'api'
  }
})

// Track metrics
statsd.increment('orders.created', 1, {
  userId: user.id,
  total: order.total
})

statsd.histogram('http.request.duration', duration, {
  method: 'POST',
  path: '/api/orders'
})

statsd.gauge('users.active', activeUserCount)
```

### CloudWatch (AWS)

```typescript
import { CloudWatch } from 'aws-sdk'

const cloudwatch = new CloudWatch()

await cloudwatch.putMetricData({
  Namespace: 'MyApp',
  MetricData: [{
    MetricName: 'OrdersCreated',
    Value: 1,
    Unit: 'Count',
    Timestamp: new Date(),
    Dimensions: [
      { Name: 'Environment', Value: 'production' }
    ]
  }]
}).promise()
```

---

## Dashboards

### Application Dashboard

**Widgets:**
1. **Traffic:** Requests per second (RPS)
2. **Latency:** p50, p95, p99 response times
3. **Error Rate:** 5xx errors per minute
4. **Success Rate:** % of successful requests

**Example (Grafana):**
```
Query: rate(http_requests_total[5m])
Label: Requests/sec

Query: histogram_quantile(0.95, http_request_duration_ms)
Label: p95 Latency

Query: rate(http_requests_total{status=~"5.."}[5m])
Label: Error Rate
```

### Infrastructure Dashboard

**Widgets:**
1. **CPU:** % utilization
2. **Memory:** % used
3. **Disk:** % used, I/O
4. **Network:** bandwidth, connections

### Business Dashboard

**Widgets:**
1. **Orders:** Orders/hour, revenue/hour
2. **Users:** Active users, signups/hour
3. **Conversions:** Funnel completion rate

---

## Alerting Strategy

### Alert Severity Levels

**P0 (Critical) - Page on-call immediately:**
- Service down (health check failing)
- Database unreachable
- Error rate > 5%
- Payment processing failing

**P1 (High) - Notify during business hours:**
- Elevated error rate (1-5%)
- High latency (p95 > 2s)
- Disk space > 80%
- Memory > 85%

**P2 (Medium) - Create ticket:**
- Slow queries detected
- Cache hit rate low (< 70%)
- Background job failures

**P3 (Low) - Log for review:**
- API rate limit warnings
- Deprecation warnings

### Alert Configuration

**Datadog Example:**
```yaml
name: High Error Rate
query: sum(last_5m):sum:trace.http.request.errors{env:prod}.as_count() > 10
message: |
  {{#is_alert}}
  Error rate is high! Check logs immediately.
  {{/is_alert}}

  {{#is_recovery}}
  Error rate has returned to normal.
  {{/is_recovery}}

priority: P0
notify:
  - @pagerduty-api
  - @slack-incidents
```

**Prometheus Alertmanager:**
```yaml
groups:
  - name: api_alerts
    rules:
      - alert: HighErrorRate
        expr: |
          rate(http_requests_total{status=~"5.."}[5m]) > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value }} (threshold: 0.05)"
```

---

## Alerting Best Practices

### ✅ DO

**1. Alert on symptoms, not causes:**
```
✅ Good: "API response time > 2s"
❌ Bad: "CPU > 80%"

Why: Users care about slow responses, not CPU usage
```

**2. Include context in alerts:**
```typescript
alert({
  title: 'High error rate on checkout',
  message: 'Error rate: 5.2% (threshold: 1%)',
  severity: 'critical',
  metadata: {
    service: 'api',
    endpoint: '/api/checkout',
    errorRate: 0.052,
    timeWindow: '5m',
    affectedUsers: 23
  }
})
```

**3. Make alerts actionable:**
```
✅ Good: "Payment processing failing. Check Stripe status: https://status.stripe.com. Runbook: https://..."
❌ Bad: "Error detected"
```

**4. Aggregate related alerts:**
```
✅ Good: Single alert "3 services down"
❌ Bad: 50 alerts (one per instance)
```

**5. Use escalation:**
```
1. Alert → Slack (5 min)
2. Still firing → Email on-call (10 min)
3. Still firing → Page on-call (15 min)
```

### ❌ DON'T

**1. Don't alert on everything:**
```
❌ Bad: Alert on every error
✅ Good: Alert when error rate > threshold
```

**2. Don't use static thresholds blindly:**
```
❌ Bad: CPU > 80% (normal during deploy)
✅ Good: CPU > 80% AND NOT deploying
```

**3. Don't wake people up for non-urgent issues:**
```
❌ Bad: Page at 3am for slow query
✅ Good: Create ticket for next business day
```

---

## Health Checks

### Liveness Probe

Checks if app is running:

```typescript
app.get('/health/live', (req, res) => {
  res.status(200).json({ status: 'ok' })
})
```

### Readiness Probe

Checks if app can serve traffic:

```typescript
app.get('/health/ready', async (req, res) => {
  try {
    // Check database
    await db.$queryRaw`SELECT 1`

    // Check Redis
    await redis.ping()

    // Check critical dependencies
    await fetch('https://api.stripe.com/v1/health')

    res.status(200).json({
      status: 'ready',
      checks: {
        database: 'ok',
        redis: 'ok',
        stripe: 'ok'
      }
    })
  } catch (error) {
    res.status(503).json({
      status: 'not ready',
      error: error.message
    })
  }
})
```

---

## SLOs & SLAs

### Service Level Objectives (SLOs)

Internal targets:

```
Availability: 99.9% (43 minutes downtime/month)
Latency: p95 < 500ms
Error Rate: < 0.1%
```

### Service Level Agreements (SLAs)

Customer-facing promises:

```
Uptime SLA: 99.5%
Response Time SLA: p99 < 2s

If breached → refund/credits
```

### Error Budget

```
SLO: 99.9% uptime = 0.1% error budget
Error budget = 43 minutes downtime per month

Track: How much budget used?
Action: If budget exhausted, freeze deploys
```

---

## Synthetic Monitoring

### Uptime Monitoring

```typescript
// Check every 5 minutes from multiple locations
setInterval(async () => {
  const start = Date.now()

  try {
    const response = await fetch('https://api.example.com/health')

    if (!response.ok) {
      alert({
        title: 'Health check failed',
        statusCode: response.status
      })
    }

    const duration = Date.now() - start
    metrics.histogram('synthetic_check_duration', duration)

  } catch (error) {
    alert({
      title: 'Service unreachable',
      error: error.message
    })
  }
}, 5 * 60 * 1000)
```

### E2E Transaction Monitoring

```typescript
// Simulate critical user flow every 10 minutes
async function syntheticCheckout() {
  const start = Date.now()

  try {
    // 1. Login
    const loginRes = await api.post('/auth/login', credentials)

    // 2. Add to cart
    const cartRes = await api.post('/cart/add', { productId: 'test-product' })

    // 3. Checkout
    const checkoutRes = await api.post('/checkout', { cartId: cartRes.id })

    const duration = Date.now() - start

    if (duration > 5000) {
      alert({ title: 'Checkout flow slow', duration })
    }

  } catch (error) {
    alert({
      title: 'Checkout flow broken',
      error: error.message
    })
  }
}
```

---

## Monitoring Checklist

### Application
- [ ] HTTP request metrics (count, duration, status)
- [ ] Database query metrics
- [ ] Cache hit/miss rate
- [ ] Background job success/failure
- [ ] API errors with stack traces

### Infrastructure
- [ ] CPU utilization
- [ ] Memory usage
- [ ] Disk space
- [ ] Network bandwidth
- [ ] Connection pool usage

### Business
- [ ] Key user actions (signups, purchases)
- [ ] Revenue metrics
- [ ] Conversion funnel

### Alerts
- [ ] Service down (P0)
- [ ] High error rate (P0)
- [ ] High latency (P1)
- [ ] Resource saturation (P1)
- [ ] Failed payments (P0)

---

## Tools Comparison

| Tool | Best For | Pricing | Learning Curve |
|------|----------|---------|----------------|
| **Datadog** | All-in-one | $$$ | Medium |
| **Prometheus + Grafana** | Self-hosted | Free | High |
| **New Relic** | APM | $$$ | Low |
| **CloudWatch** | AWS | $ | Medium |
| **Honeycomb** | Observability | $$ | Medium |

---

## Related Resources

**Patterns:**
- `/STANDARDS/architecture-patterns/logging-strategy.md`
- `/STANDARDS/architecture-patterns/error-tracking.md`

**Skills:**
- `/SKILLS/performance-optimizer/` - Performance monitoring
- `/SKILLS/deployment-advisor/` - Infrastructure monitoring

**External:**
- [Google SRE Book: Monitoring](https://sre.google/sre-book/monitoring-distributed-systems/)
- [Prometheus Best Practices](https://prometheus.io/docs/practices/)
- [Datadog Documentation](https://docs.datadoghq.com/)

---

**Monitor everything, alert on what matters.** 📊
