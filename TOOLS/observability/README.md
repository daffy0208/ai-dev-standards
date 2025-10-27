# Observability Tools

A comprehensive suite of TypeScript tools for monitoring and debugging applications. These tools provide structured logging, metrics collection, distributed tracing, and error tracking with minimal performance overhead.

## Tools Overview

### 1. Logger Tool (`logger-tool.ts`)
**~430 lines** - Structured logging with multiple severity levels and output targets.

**Features:**
- Multiple log levels (debug, info, warn, error, fatal)
- Multiple outputs (console, file, remote endpoint)
- Log formatting (JSON, pretty)
- Contextual logging with child loggers
- Async logging for non-blocking operation
- Log rotation for file outputs

**Quick Start:**
```typescript
import { createLogger, FileOutput } from './logger-tool';

const logger = createLogger({
  level: 'info',
  service: 'api'
});

logger.info('Server started', { port: 3000 });
logger.error('Connection failed', { error: err });

// Add file output
logger.addOutput(new FileOutput('./logs/app.log', {
  maxSize: 10 * 1024 * 1024, // 10MB
  maxFiles: 5
}));
```

### 2. Metrics Tool (`metrics-tool.ts`)
**~470 lines** - Performance metrics collection and aggregation.

**Features:**
- Counter metrics (monotonically increasing)
- Gauge metrics (can increase/decrease)
- Histogram metrics (track distributions)
- Timer metrics (convenience wrapper)
- Metric labels/tags for dimensionality
- Export to JSON and Prometheus formats

**Quick Start:**
```typescript
import { MetricsCollector } from './metrics-tool';

const metrics = new MetricsCollector({ service: 'api' });

// Counter
const requests = metrics.counter('http_requests_total');
requests.inc({ method: 'GET', status: '200' });

// Gauge
const memory = metrics.gauge('memory_usage_bytes');
memory.set(process.memoryUsage().heapUsed);

// Histogram
const latency = metrics.histogram('http_request_duration_ms', {
  buckets: [10, 50, 100, 500, 1000]
});
latency.observe(245, { endpoint: '/api/users' });

// Export
console.log(metrics.exportPrometheus());
```

### 3. Tracer Tool (`tracer-tool.ts`)
**~425 lines** - Distributed tracing for tracking request flows.

**Features:**
- Span creation with parent/child relationships
- Span attributes and events
- Trace context propagation (W3C Trace Context)
- Active span management
- OpenTelemetry-compatible export
- Configurable sampling

**Quick Start:**
```typescript
import { Tracer } from './tracer-tool';

const tracer = new Tracer({ service: 'api' });

const span = tracer.startSpan('handle_request', {
  attributes: { method: 'GET', path: '/users' }
});

try {
  span.addEvent('fetching_from_database');
  const users = await db.query('SELECT * FROM users');
  span.setAttribute('user_count', users.length);
} finally {
  span.end();
}

// Export trace
console.log(tracer.exportJSON());
```

### 4. Error Tracker Tool (`error-tracker-tool.ts`)
**~420 lines** - Error aggregation, grouping, and reporting.

**Features:**
- Error capture with stack traces
- Error grouping by similarity
- Breadcrumb tracking for context
- Error occurrence counting
- User/environment context
- Sentry-compatible export

**Quick Start:**
```typescript
import { ErrorTracker } from './error-tracker-tool';

const errorTracker = new ErrorTracker({
  service: 'api',
  environment: 'production'
});

// Add breadcrumbs
errorTracker.addBreadcrumb({
  type: 'http',
  message: 'API request started',
  data: { url: '/api/users' }
});

// Capture error
try {
  await riskyOperation();
} catch (error) {
  errorTracker.captureException(error as Error, {
    severity: 'error',
    tags: { operation: 'riskyOperation' }
  });
}

// Generate report
const report = errorTracker.generateReport();
console.log(report.topErrors);
```

## Integration Examples

### Express.js Integration

```typescript
import express from 'express';
import { createLogger } from './logger-tool';
import { MetricsCollector } from './metrics-tool';
import { Tracer } from './tracer-tool';
import { ErrorTracker } from './error-tracker-tool';

const app = express();

// Initialize observability tools
const logger = createLogger({ level: 'info', service: 'api' });
const metrics = new MetricsCollector({ service: 'api' });
const tracer = new Tracer({ service: 'api' });
const errorTracker = new ErrorTracker({ service: 'api' });

// Metrics
const requestCounter = metrics.counter('http_requests_total');
const requestDuration = metrics.histogram('http_request_duration_ms');

// Observability middleware
app.use((req, res, next) => {
  const requestId = Math.random().toString(36).substring(7);

  // Logging
  const reqLogger = logger.child({ requestId, method: req.method, path: req.path });
  req.logger = reqLogger;

  // Tracing
  const span = tracer.startSpan('http_request', {
    attributes: {
      'http.method': req.method,
      'http.url': req.url,
      'http.target': req.path,
    }
  });
  tracer.setActiveSpan(span);
  req.span = span;

  // Metrics
  const endTimer = requestDuration.startTimer({
    method: req.method,
    path: req.path
  });

  // Error tracking
  errorTracker.addBreadcrumb({
    type: 'http',
    message: `${req.method} ${req.path}`,
    data: { url: req.url, method: req.method }
  });

  res.on('finish', () => {
    reqLogger.info('Request completed', {
      statusCode: res.statusCode,
      duration: Date.now() - req._startTime
    });

    requestCounter.inc({
      method: req.method,
      path: req.path,
      status: res.statusCode.toString()
    });

    span.setAttribute('http.status_code', res.statusCode);
    span.end();

    endTimer();
  });

  next();
});

// Error handler
app.use((err, req, res, next) => {
  req.logger.error('Request error', {}, err);
  req.span.recordException(err);

  errorTracker.captureException(err, {
    severity: 'error',
    context: {
      requestId: req.requestId,
      path: req.path,
      method: req.method,
    }
  });

  res.status(500).json({ error: 'Internal server error' });
});

// Metrics endpoint
app.get('/metrics', (req, res) => {
  res.set('Content-Type', 'text/plain');
  res.send(metrics.exportPrometheus());
});

// Health endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'api',
    timestamp: new Date().toISOString()
  });
});

app.listen(3000, () => {
  logger.info('Server started', { port: 3000 });
});
```

### React Integration

```typescript
import React, { useEffect } from 'react';
import { createLogger } from './logger-tool';
import { MetricsCollector } from './metrics-tool';
import { ErrorTracker } from './error-tracker-tool';

// Initialize
const logger = createLogger({ level: 'warn', service: 'frontend' });
const metrics = new MetricsCollector({ service: 'frontend' });
const errorTracker = new ErrorTracker({
  service: 'frontend',
  environment: process.env.NODE_ENV
});

// Error Boundary
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    logger.error('React error boundary caught error', {
      error: error.message,
      componentStack: info.componentStack
    });

    errorTracker.captureException(error, {
      severity: 'error',
      context: {
        componentStack: info.componentStack,
      },
      tags: { boundary: 'react' }
    });

    this.setState({ hasError: true });
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }
    return this.props.children;
  }
}

// Performance tracking component
function PerformanceTracker({ name, children }: {
  name: string;
  children: React.ReactNode;
}) {
  useEffect(() => {
    const renderMetric = metrics.histogram('component_render_time_ms');
    const end = renderMetric.startTimer({ component: name });

    return () => {
      end();
    };
  }, [name]);

  return <>{children}</>;
}

// Example component with observability
function UserProfile({ userId }: { userId: string }) {
  useEffect(() => {
    // Set user context for error tracking
    errorTracker.setUser({ id: userId });

    // Add breadcrumb
    errorTracker.addBreadcrumb({
      type: 'navigation',
      message: 'Viewed user profile',
      data: { userId }
    });

    logger.info('User profile loaded', { userId });
  }, [userId]);

  const handleAction = async () => {
    const timer = metrics.timer('user_action_duration_ms');
    const end = timer.start({ action: 'update_profile' });

    try {
      await updateUserProfile(userId);
      logger.info('Profile updated', { userId });
    } catch (error) {
      errorTracker.captureException(error as Error, {
        severity: 'error',
        context: { userId, action: 'update_profile' }
      });
    } finally {
      end();
    }
  };

  return (
    <PerformanceTracker name="UserProfile">
      <div>
        {/* Component content */}
        <button onClick={handleAction}>Update Profile</button>
      </div>
    </PerformanceTracker>
  );
}

// Root App
function App() {
  return (
    <ErrorBoundary>
      <UserProfile userId="123" />
    </ErrorBoundary>
  );
}
```

### Node.js Microservice Integration

```typescript
import { createLogger, FileOutput, RemoteOutput } from './logger-tool';
import { MetricsCollector } from './metrics-tool';
import { Tracer } from './tracer-tool';
import { ErrorTracker } from './error-tracker-tool';

// Production-ready configuration
const logger = createLogger({
  level: process.env.LOG_LEVEL as any || 'info',
  service: 'order-service',
  format: process.env.NODE_ENV === 'production' ? 'json' : 'pretty',
});

// Add file output for production
if (process.env.NODE_ENV === 'production') {
  logger.addOutput(new FileOutput('/var/log/app.log', {
    maxSize: 50 * 1024 * 1024, // 50MB
    maxFiles: 10
  }));

  // Add remote logging
  logger.addOutput(new RemoteOutput(process.env.LOG_ENDPOINT!, {
    batchSize: 100,
    flushInterval: 5000
  }));
}

const metrics = new MetricsCollector({
  service: 'order-service',
  defaultLabels: {
    environment: process.env.NODE_ENV || 'development',
    region: process.env.AWS_REGION || 'us-east-1'
  }
});

const tracer = new Tracer({
  service: 'order-service',
  sampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0
});

const errorTracker = new ErrorTracker({
  service: 'order-service',
  environment: process.env.NODE_ENV || 'development',
  maxBreadcrumbs: 50
});

// Business logic with observability
async function processOrder(orderId: string) {
  const span = tracer.startSpan('process_order');
  tracer.setActiveSpan(span);

  const orderLogger = logger.child({ orderId });
  orderLogger.info('Processing order started');

  const orderTimer = metrics.timer('order_processing_duration_ms');
  const endTimer = orderTimer.start({ orderId });

  try {
    // Validate order
    const validateSpan = tracer.startSpan('validate_order');
    errorTracker.addBreadcrumb({
      type: 'default',
      message: 'Validating order',
      data: { orderId }
    });

    await validateOrder(orderId);
    validateSpan.end();
    orderLogger.debug('Order validated');

    // Process payment
    const paymentSpan = tracer.startSpan('process_payment');
    errorTracker.addBreadcrumb({
      type: 'default',
      message: 'Processing payment',
      data: { orderId }
    });

    await processPayment(orderId);
    paymentSpan.end();
    orderLogger.info('Payment processed');

    // Ship order
    const shipSpan = tracer.startSpan('ship_order');
    await shipOrder(orderId);
    shipSpan.end();
    orderLogger.info('Order shipped');

    metrics.counter('orders_processed_total').inc({ status: 'success' });
    span.setStatus({ code: 1, message: 'OK' });

  } catch (error) {
    orderLogger.error('Order processing failed', {}, error as Error);
    span.recordException(error as Error);

    errorTracker.captureException(error as Error, {
      severity: 'error',
      context: { orderId },
      tags: { operation: 'process_order' }
    });

    metrics.counter('orders_processed_total').inc({ status: 'failed' });

    throw error;
  } finally {
    span.end();
    endTimer();
  }
}

// Export observability data
setInterval(() => {
  // Log metrics summary
  logger.info('Metrics summary', {
    metrics: metrics.collect()
  });

  // Log error summary
  const errorReport = errorTracker.generateReport({
    startTime: Date.now() - 60000 // Last minute
  });

  if (errorReport.totalErrors > 0) {
    logger.warn('Errors detected', {
      totalErrors: errorReport.totalErrors,
      topErrors: errorReport.topErrors.slice(0, 5)
    });
  }
}, 60000); // Every minute
```

## Environment Variables

All tools respect common environment variables:

```bash
# Logging
LOG_LEVEL=info                    # debug, info, warn, error, fatal
SERVICE_NAME=my-service           # Service identifier

# Metrics
METRICS_ENABLED=true              # Enable/disable metrics

# Tracing
TRACING_ENABLED=true              # Enable/disable tracing
TRACE_SAMPLE_RATE=1.0             # Sample rate (0-1)

# Error Tracking
ERROR_TRACKING_ENABLED=true       # Enable/disable error tracking
NODE_ENV=production               # Environment identifier
```

## Performance Considerations

All tools are designed with minimal performance overhead:

- **Logger**: Async I/O, non-blocking writes
- **Metrics**: In-memory aggregation, no external dependencies
- **Tracer**: Configurable sampling, lazy evaluation
- **Error Tracker**: Automatic cleanup, bounded memory usage

Typical overhead: < 1ms per operation

## Export Formats

### Prometheus Metrics
```bash
curl http://localhost:3000/metrics
```

### JSON Exports
```typescript
// Logs
logger.exportJSON();

// Metrics
metrics.exportJSON();

// Traces
tracer.exportJSON();

// Errors
errorTracker.exportJSON();
```

### OpenTelemetry
```typescript
// Traces
const otlpTrace = tracer.exportOpenTelemetry(traceId);
```

### Sentry
```typescript
// Errors
const sentryEvent = errorTracker.exportSentry(occurrence);
```

## License

MIT
