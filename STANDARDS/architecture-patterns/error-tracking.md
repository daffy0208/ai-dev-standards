# Error Tracking

**Last Updated:** 2025-10-22
**Category:** Observability
**Difficulty:** Beginner

---

## Overview

Comprehensive error tracking and debugging strategy for production applications.

**Goal:** Catch, track, and fix errors before they impact users.

---

## Error Types

### 1. Handled Errors
Expected errors with graceful handling:

```typescript
try {
  const user = await db.user.findUnique({ where: { id } })

  if (!user) {
    throw new NotFoundError('User not found')
  }
} catch (error) {
  if (error instanceof NotFoundError) {
    return res.status(404).json({ error: error.message })
  }
  throw error
}
```

### 2. Unhandled Errors
Unexpected errors that crash the app:

```typescript
// No try-catch → crashes process
const data = JSON.parse(invalidJSON)
```

### 3. Promise Rejections
Unhandled promise rejections:

```typescript
// Missing .catch() or try-catch
fetch('/api/users').then(res => res.json())
// If fetch fails, unhandled rejection!
```

---

## Error Tracking Tools

### Sentry (Recommended)

**Installation:**
```bash
npm install @sentry/nextjs
```

**Configuration:**
```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Environment
  environment: process.env.NODE_ENV,

  // Release version
  release: process.env.VERCEL_GIT_COMMIT_SHA,

  // Sample rate
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Ignore known errors
  ignoreErrors: [
    'ResizeObserver loop limit exceeded',
    'Non-Error promise rejection captured'
  ],

  // Before send hook (sanitize data)
  beforeSend(event, hint) {
    // Remove sensitive data
    if (event.request) {
      delete event.request.cookies
      delete event.request.headers?.Authorization
    }

    return event
  }
})
```

**Usage:**
```typescript
try {
  await processPayment(order)
} catch (error) {
  Sentry.captureException(error, {
    level: 'error',
    tags: {
      orderId: order.id,
      userId: user.id
    },
    extra: {
      orderTotal: order.total,
      paymentMethod: order.paymentMethod
    }
  })

  throw error
}
```

### Datadog Error Tracking

```typescript
import { datadogLogs } from '@datadog/browser-logs'

datadogLogs.logger.error('Payment failed', {
  error: error.message,
  stack: error.stack,
  orderId: order.id
}, error)
```

### CloudWatch (AWS)

```typescript
import { CloudWatchLogs } from 'aws-sdk'

const logs = new CloudWatchLogs()

await logs.putLogEvents({
  logGroupName: '/aws/lambda/my-function',
  logStreamName: streamName,
  logEvents: [{
    message: JSON.stringify({
      level: 'ERROR',
      message: error.message,
      stack: error.stack,
      context: { userId, orderId }
    }),
    timestamp: Date.now()
  }]
}).promise()
```

---

## What to Track

### ✅ Always Track

**Unhandled Exceptions:**
```typescript
process.on('uncaughtException', (error) => {
  Sentry.captureException(error)
  process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
  Sentry.captureException(reason)
})
```

**API Errors:**
```typescript
app.use((error, req, res, next) => {
  Sentry.captureException(error, {
    tags: {
      path: req.path,
      method: req.method
    },
    user: {
      id: req.user?.id
    }
  })

  res.status(500).json({
    error: 'Internal server error',
    requestId: req.id
  })
})
```

**Database Errors:**
```typescript
try {
  await db.user.create({ data: userData })
} catch (error) {
  if (error.code === 'P2002') {
    // Unique constraint violation
    Sentry.captureMessage('Duplicate user signup attempt', {
      level: 'warning',
      extra: { email: userData.email }
    })
  } else {
    Sentry.captureException(error)
  }
  throw error
}
```

**External API Failures:**
```typescript
try {
  const response = await stripe.charges.create(chargeData)
} catch (error) {
  Sentry.captureException(error, {
    tags: {
      service: 'stripe',
      operation: 'create_charge'
    },
    extra: {
      amount: chargeData.amount,
      currency: chargeData.currency
    }
  })
  throw error
}
```

**Frontend Errors:**
```typescript
// React Error Boundary
class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack
        }
      }
    })
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback />
    }

    return this.props.children
  }
}
```

---

## Context & Enrichment

### User Context

```typescript
Sentry.setUser({
  id: user.id,
  email: user.email,
  username: user.name,
  ip_address: req.ip
})

// Now all errors include user context
```

### Request Context

```typescript
Sentry.setContext('request', {
  method: req.method,
  url: req.url,
  headers: req.headers,
  body: req.body // Be careful with sensitive data!
})
```

### Custom Context

```typescript
Sentry.setContext('order', {
  orderId: order.id,
  total: order.total,
  items: order.items.length,
  status: order.status
})
```

### Tags (for filtering)

```typescript
Sentry.setTag('feature', 'checkout')
Sentry.setTag('payment_method', 'credit_card')
Sentry.setTag('user_tier', 'premium')
```

---

## Error Grouping

### Fingerprinting

Group similar errors together:

```typescript
Sentry.captureException(error, {
  fingerprint: [
    '{{ default }}',
    error.code,
    error.statusCode?.toString()
  ]
})

// Errors with same code/status grouped together
```

### Custom Grouping

```typescript
beforeSend(event) {
  // Group all timeout errors together
  if (event.exception?.values?.[0]?.value?.includes('timeout')) {
    event.fingerprint = ['timeout-error']
  }

  return event
}
```

---

## Alert Configuration

### Sentry Alerts

**Example: Alert on new errors**
```
Condition: A new issue is created
Frequency: Immediately
Action: Send to Slack #incidents
```

**Example: Alert on error spike**
```
Condition: Number of events > 100 in 1 hour
Frequency: Once per issue
Action: Email on-call engineer
```

### Alert Levels

**Critical (P0):**
- Payment processing errors
- Database connection failures
- Authentication system down

**High (P1):**
- New error never seen before
- Error rate spike (3x normal)

**Medium (P2):**
- Known intermittent errors
- Non-critical API failures

**Low (P3):**
- Warnings
- Deprecation notices

---

## Error Response Best Practices

### Production Error Responses

```typescript
// ❌ Bad: Exposes internal details
catch (error) {
  res.status(500).json({
    error: error.message, // "Cannot connect to database at 10.0.1.5"
    stack: error.stack // Full stack trace!
  })
}

// ✅ Good: Generic message, log details
catch (error) {
  const requestId = uuid()

  logger.error('Request failed', {
    requestId,
    error: error.message,
    stack: error.stack,
    userId: req.user?.id
  })

  Sentry.captureException(error, {
    tags: { requestId }
  })

  res.status(500).json({
    error: 'Internal server error',
    requestId // User can provide this to support
  })
}
```

### User-Friendly Error Messages

```typescript
function getUserFriendlyMessage(error: Error): string {
  if (error instanceof NotFoundError) {
    return 'The requested resource was not found'
  }

  if (error instanceof ValidationError) {
    return `Invalid input: ${error.field}`
  }

  if (error instanceof PaymentError) {
    return 'Payment processing failed. Please try again or use a different payment method.'
  }

  return 'Something went wrong. Our team has been notified.'
}
```

---

## Source Maps

### Enable Source Maps in Production

```typescript
// next.config.js
module.exports = {
  productionBrowserSourceMaps: true,

  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.devtool = 'source-map'
    }
    return config
  }
}

// Upload to Sentry
// package.json
{
  "scripts": {
    "build": "next build && sentry-cli sourcemaps upload --org=my-org --project=my-project .next/static"
  }
}
```

---

## Performance Monitoring

### Track Slow Operations

```typescript
const transaction = Sentry.startTransaction({
  op: 'checkout',
  name: 'Process Order'
})

const span = transaction.startChild({
  op: 'db',
  description: 'Query user data'
})

const user = await db.user.findUnique({ where: { id } })

span.finish()

// If transaction takes > 2s, Sentry flags it
transaction.finish()
```

---

## Error Budget

Track error budget to balance velocity with reliability:

```
SLO: 99.9% success rate
Error Budget: 0.1% = 43 minutes downtime/month

If error budget exhausted:
→ Freeze deployments
→ Focus on stability
→ Review incidents
```

---

## Debugging Workflow

### 1. Error Notification

Receive alert: "Payment processing error spike"

### 2. Triage

- **Severity:** Critical (payments failing)
- **Affected users:** 23 users in last 10 minutes
- **Environment:** Production

### 3. Investigate

- View error in Sentry
- Check stack trace
- Review breadcrumbs (user actions before error)
- Check logs for context

### 4. Reproduce

- Try to reproduce locally or in staging
- Check if error is specific to:
  - Certain users
  - Certain payment methods
  - Certain regions

### 5. Fix

- Deploy fix
- Monitor error rate
- Verify fix resolves issue

### 6. Post-Mortem

- Document root cause
- Add tests to prevent regression
- Update runbook

---

## Best Practices

### ✅ DO

- Track all unhandled exceptions
- Include context (user, request, tags)
- Use source maps for readable stack traces
- Set up alerts for critical errors
- Group similar errors with fingerprinting
- Test error tracking in staging
- Document common errors in runbook
- Monitor error rates and trends

### ❌ DON'T

- Log sensitive data (passwords, tokens, PII)
- Expose internal errors to users
- Ignore handled errors (still track them)
- Alert on every single error (use thresholds)
- Leave stale errors unresolved
- Over-sample in production (impacts performance)

---

## Error Tracking Checklist

### Setup
- [ ] Error tracking tool configured (Sentry, Datadog)
- [ ] Source maps uploaded
- [ ] User context tracked
- [ ] Tags configured for filtering
- [ ] Ignored errors configured (false positives)

### Monitoring
- [ ] Alerts configured for critical errors
- [ ] Dashboard shows error trends
- [ ] On-call rotation defined
- [ ] Runbooks for common errors

### Process
- [ ] New errors triaged within 24 hours
- [ ] Critical errors resolved immediately
- [ ] Post-mortems for major incidents
- [ ] Error budget tracked

---

## Common Errors to Track

### Authentication Errors
```typescript
Sentry.captureMessage('Login failed', {
  level: 'warning',
  tags: {
    reason: 'invalid_password',
    email: email
  }
})
```

### Payment Errors
```typescript
Sentry.captureException(error, {
  level: 'error',
  tags: {
    payment_method: 'stripe',
    amount: amount,
    currency: 'usd'
  }
})
```

### API Errors
```typescript
Sentry.captureException(error, {
  tags: {
    api: 'external',
    service: 'stripe',
    endpoint: '/v1/charges'
  }
})
```

---

## Related Resources

**Patterns:**
- `/STANDARDS/architecture-patterns/logging-strategy.md`
- `/STANDARDS/architecture-patterns/monitoring-and-alerting.md`

**Skills:**
- `/SKILLS/security-engineer/` - Security error handling
- `/SKILLS/testing-strategist/` - Error reproduction

**External:**
- [Sentry Documentation](https://docs.sentry.io/)
- [Error Handling Best Practices](https://www.joyent.com/node-js/production/design/errors)

---

**Track errors, fix them fast, prevent them from recurring.** 🐛
