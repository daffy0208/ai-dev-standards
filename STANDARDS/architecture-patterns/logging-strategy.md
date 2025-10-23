# Logging Strategy

**Last Updated:** 2025-10-22
**Category:** Observability
**Difficulty:** Intermediate

---

## Overview

Comprehensive logging strategy for production applications.

**Goal:** Log the right information at the right level to debug issues quickly without drowning in noise.

---

## Log Levels

```
FATAL  → Application cannot continue (database down)
ERROR  → Operation failed but app continues (payment failed)
WARN   → Something unexpected but handled (retry successful)
INFO   → Important business events (user registered, order placed)
DEBUG  → Detailed diagnostic information (function entry/exit)
TRACE  → Very detailed (loop iterations, variable values)
```

### When to Use Each Level

**FATAL (use sparingly):**
- Database connection lost
- Critical dependency unavailable
- Application must shut down

**ERROR:**
- Unhandled exceptions
- Failed API calls (after retries)
- Data validation failures
- Payment processing errors

**WARN:**
- Deprecated API usage
- Rate limit approaching
- Retryable operation failed (will retry)
- Missing optional configuration

**INFO:**
- Application started/stopped
- User authentication (success/failure)
- Important business events (order created, user registered)
- Scheduled job execution

**DEBUG:**
- Function entry/exit
- Query execution
- Cache hits/misses
- HTTP request/response details

**TRACE:**
- Loop iterations
- Variable values
- Very detailed execution flow

---

## Structured Logging

### Why Structured Logging?

```typescript
// ❌ Bad: String concatenation (hard to parse/query)
console.log(`User ${userId} logged in from ${ip}`)

// ✅ Good: Structured (easy to parse/query/alert)
logger.info('User logged in', {
  userId,
  ip,
  userAgent,
  timestamp: new Date()
})
```

### JSON Format

```json
{
  "level": "info",
  "message": "User logged in",
  "timestamp": "2024-01-22T10:30:00.000Z",
  "userId": "user-123",
  "ip": "192.168.1.1",
  "userAgent": "Mozilla/5.0...",
  "requestId": "req-456",
  "service": "auth-service",
  "environment": "production"
}
```

---

## Implementation Examples

### Winston (Node.js)

```typescript
// lib/logger.ts
import winston from 'winston'

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: {
    service: 'api-service',
    environment: process.env.NODE_ENV
  },
  transports: [
    // Console output
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),

    // File output
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error'
    }),
    new winston.transports.File({
      filename: 'logs/combined.log'
    })
  ]
})

export { logger }

// Usage
import { logger } from '@/lib/logger'

logger.info('User logged in', {
  userId: user.id,
  email: user.email,
  ip: req.ip
})

logger.error('Payment failed', {
  userId: user.id,
  orderId: order.id,
  error: error.message,
  stack: error.stack
})
```

### Pino (Faster Alternative)

```typescript
// lib/logger.ts
import pino from 'pino'

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => {
      return { level: label }
    }
  },
  base: {
    service: 'api-service',
    environment: process.env.NODE_ENV
  },
  timestamp: pino.stdTimeFunctions.isoTime
})

export { logger }
```

### Python (structlog)

```python
import structlog

logger = structlog.get_logger()

logger.info(
    "user_logged_in",
    user_id=user.id,
    email=user.email,
    ip=request.remote_addr
)

logger.error(
    "payment_failed",
    user_id=user.id,
    order_id=order.id,
    error=str(e)
)
```

---

## What to Log

### ✅ Always Log

**Authentication Events:**
```typescript
logger.info('Login attempt', { email, ip, success: true })
logger.warn('Login failed', { email, ip, reason: 'Invalid password' })
logger.info('Logout', { userId })
logger.info('Password reset requested', { email })
```

**Authorization Failures:**
```typescript
logger.warn('Unauthorized access attempt', {
  userId,
  resource: 'admin_panel',
  ip
})
```

**API Requests/Responses:**
```typescript
logger.info('HTTP request', {
  method: 'POST',
  path: '/api/orders',
  userId,
  duration: 243, // ms
  statusCode: 201
})
```

**Database Operations:**
```typescript
logger.debug('Database query', {
  query: 'SELECT * FROM users WHERE id = ?',
  duration: 15, // ms
  rowCount: 1
})
```

**External API Calls:**
```typescript
logger.info('External API call', {
  service: 'stripe',
  method: 'POST',
  endpoint: '/v1/charges',
  duration: 521, // ms
  statusCode: 200
})
```

**Business Events:**
```typescript
logger.info('Order created', { userId, orderId, total: 99.99 })
logger.info('Payment processed', { userId, orderId, amount: 99.99 })
logger.info('Email sent', { userId, type: 'order_confirmation' })
```

**Errors & Exceptions:**
```typescript
try {
  await processOrder(order)
} catch (error) {
  logger.error('Order processing failed', {
    orderId: order.id,
    error: error.message,
    stack: error.stack
  })
}
```

### ❌ Never Log

**Sensitive Data:**
- Passwords (even hashed)
- Credit card numbers
- Social security numbers
- API keys/secrets
- Session tokens
- Personal health information

```typescript
// ❌ Bad
logger.info('User created', {
  email: user.email,
  password: user.password // NEVER!
})

// ✅ Good
logger.info('User created', {
  email: user.email,
  userId: user.id
})
```

---

## Context & Correlation

### Request ID

Track requests across services:

```typescript
// middleware.ts
import { v4 as uuid } from 'uuid'

export function requestIdMiddleware(req, res, next) {
  req.id = req.headers['x-request-id'] || uuid()
  res.setHeader('X-Request-Id', req.id)

  // Add to logger context
  logger.child({ requestId: req.id })

  next()
}

// Usage
logger.info('Processing order', {
  requestId: req.id,
  userId: req.user.id
})
```

### User Context

```typescript
// Add user context to all logs
const userLogger = logger.child({
  userId: req.user.id,
  email: req.user.email
})

userLogger.info('Order created', { orderId: order.id })
// Output includes userId and email automatically
```

### Service Context

```typescript
const logger = winston.createLogger({
  defaultMeta: {
    service: 'api-service',
    version: '1.2.3',
    environment: process.env.NODE_ENV,
    hostname: os.hostname()
  }
})
```

---

## Log Aggregation

### Centralized Logging

Send logs to central service:

**CloudWatch (AWS):**
```typescript
import winston from 'winston'
import WinstonCloudWatch from 'winston-cloudwatch'

logger.add(new WinstonCloudWatch({
  logGroupName: '/aws/lambda/my-function',
  logStreamName: () => {
    const date = new Date().toISOString().split('T')[0]
    return `${date}/instance-id`
  },
  awsRegion: 'us-east-1'
}))
```

**Datadog:**
```typescript
import { datadogLogs } from '@datadog/browser-logs'

datadogLogs.init({
  clientToken: process.env.DATADOG_CLIENT_TOKEN,
  site: 'datadoghq.com',
  forwardErrorsToLogs: true,
  sessionSampleRate: 100
})

datadogLogs.logger.info('User action', { userId, action: 'purchase' })
```

**Elasticsearch (ELK Stack):**
```typescript
import winston from 'winston'
import Elasticsearch from 'winston-elasticsearch'

logger.add(new Elasticsearch({
  level: 'info',
  clientOpts: {
    node: process.env.ELASTICSEARCH_URL
  },
  index: 'logs'
}))
```

---

## Log Rotation

### File-Based Rotation

```typescript
import winston from 'winston'
import DailyRotateFile from 'winston-daily-rotate-file'

logger.add(new DailyRotateFile({
  filename: 'logs/application-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d' // Keep 14 days
}))
```

---

## Performance Considerations

### Async Logging

```typescript
// ✅ Use async transports (don't block request)
import pino from 'pino'

const logger = pino(
  pino.destination({
    sync: false, // Async writing
    dest: './logs/app.log'
  })
)
```

### Conditional Logging

```typescript
// Only log debug in development
if (process.env.NODE_ENV === 'development') {
  logger.debug('Detailed debug info', { data })
}

// Or configure log level
logger.level = process.env.LOG_LEVEL || 'info'
```

### Sampling

```typescript
// Log only 10% of requests in production
if (Math.random() < 0.1 || req.path.startsWith('/api/critical')) {
  logger.info('HTTP request', {
    method: req.method,
    path: req.path
  })
}
```

---

## Querying Logs

### CloudWatch Insights

```
fields @timestamp, message, userId, orderId
| filter level = "ERROR"
| filter userId = "user-123"
| sort @timestamp desc
| limit 100
```

### Elasticsearch (Kibana)

```
level:ERROR AND userId:"user-123"
timestamp:[now-1h TO now]
```

### Datadog

```
service:api-service status:error @userId:user-123
```

---

## Alerts Based on Logs

### Example: Alert on High Error Rate

```
Condition: ERROR log count > 10 in last 5 minutes
Action: Send PagerDuty alert, post to Slack
```

### Example: Alert on Failed Payments

```
Condition: message:"payment_failed" count > 3 in last 1 minute
Action: Alert on-call engineer
```

---

## Best Practices

### ✅ DO

- Use structured logging (JSON)
- Include correlation IDs (requestId, userId)
- Log at appropriate levels
- Log errors with stack traces
- Include timestamps (ISO 8601)
- Use async logging in production
- Aggregate logs centrally
- Rotate log files
- Set up alerts for critical errors

### ❌ DON'T

- Log sensitive data (passwords, tokens, PII)
- Log in tight loops (use sampling)
- Use string concatenation
- Ignore log levels (everything at INFO)
- Let logs fill disk (rotate!)
- Log duplicate information
- Over-log (drowns out important logs)

---

## Logging Checklist

### Application Startup
- [ ] Log application version and environment
- [ ] Log configuration (sanitized)
- [ ] Log successful startup

### Authentication
- [ ] Log login attempts (success/failure)
- [ ] Log password resets
- [ ] Log logout events

### Authorization
- [ ] Log access denied events
- [ ] Log permission changes

### Business Events
- [ ] Log important user actions
- [ ] Log state changes (order status, payment status)
- [ ] Log external API calls

### Errors
- [ ] Log all unhandled exceptions with stack traces
- [ ] Log validation failures
- [ ] Log retry attempts

### Performance
- [ ] Log slow queries (> 1s)
- [ ] Log slow HTTP requests (> 2s)
- [ ] Log cache misses

---

## Example: Complete Request Logging

```typescript
import { logger } from '@/lib/logger'

export function loggingMiddleware(req, res, next) {
  const start = Date.now()

  // Log request
  logger.info('HTTP request started', {
    method: req.method,
    path: req.path,
    userId: req.user?.id,
    ip: req.ip,
    userAgent: req.headers['user-agent']
  })

  // Log response
  res.on('finish', () => {
    const duration = Date.now() - start

    logger.info('HTTP request completed', {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration,
      userId: req.user?.id
    })

    // Alert on slow requests
    if (duration > 2000) {
      logger.warn('Slow request detected', {
        method: req.method,
        path: req.path,
        duration
      })
    }
  })

  next()
}
```

---

## Related Resources

**Patterns:**
- `/STANDARDS/architecture-patterns/monitoring-and-alerting.md`
- `/STANDARDS/architecture-patterns/error-tracking.md`

**Skills:**
- `/SKILLS/security-engineer/` - Audit logging
- `/SKILLS/performance-optimizer/` - Performance logging

**External:**
- [Winston Documentation](https://github.com/winstonjs/winston)
- [Pino Documentation](https://getpino.io/)
- [12-Factor App: Logs](https://12factor.net/logs)

---

**Log what you need to debug, nothing more.** 📝
