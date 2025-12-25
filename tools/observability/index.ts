import { createLogger } from './logger-tool'
import { MetricsCollector } from './metrics-tool'
import { Tracer } from './tracer-tool'
import { ErrorTracker } from './error-tracker-tool'

/**
 * Observability Tools - Main Entry Point
 *
 * Comprehensive observability suite for TypeScript applications.
 * Provides logging, metrics, tracing, and error tracking.
 *
 * @example
 * ```typescript
 * import { createLogger, MetricsCollector, Tracer, ErrorTracker } from './observability';
 *
 * const logger = createLogger({ service: 'my-app' });
 * const metrics = new MetricsCollector({ service: 'my-app' });
 * const tracer = new Tracer({ service: 'my-app' });
 * const errorTracker = new ErrorTracker({ service: 'my-app' });
 * ```
 */

// ============================================================================
// LOGGER EXPORTS
// ============================================================================

export {
  // Main classes and functions
  Logger,
  createLogger,
  defaultLogger,

  // Output classes
  ConsoleOutput,
  FileOutput,
  RemoteOutput,

  // Types and interfaces
  LogLevel,
  LogLevelString,
  LogEntry,
  LoggerOptions,
  LogOutput
} from './logger-tool'

// ============================================================================
// METRICS EXPORTS
// ============================================================================

export {
  // Main class
  MetricsCollector,
  defaultMetrics,

  // Types and interfaces
  Labels,
  MetricOptions,
  HistogramOptions,
  Counter,
  Gauge,
  Histogram,
  Timer,
  HistogramSnapshot,
  MetricSnapshot,
  MetricsCollectorOptions
} from './metrics-tool'

// ============================================================================
// TRACER EXPORTS
// ============================================================================

export {
  // Main class
  Tracer,
  defaultTracer,

  // Enums
  SpanStatusCode,
  SpanKind,

  // Types and interfaces
  SpanEvent,
  SpanLink,
  SpanStatus,
  SpanOptions,
  Span,
  TraceContext,
  Trace,
  TracerOptions
} from './tracer-tool'

// ============================================================================
// ERROR TRACKER EXPORTS
// ============================================================================

export {
  // Main class
  ErrorTracker,
  defaultErrorTracker,

  // Enums
  ErrorSeverity,
  BreadcrumbType,

  // Types and interfaces
  Breadcrumb,
  ErrorContext,
  ErrorOptions,
  ErrorOccurrence,
  ErrorGroup,
  ErrorReport,
  ErrorTrackerOptions
} from './error-tracker-tool'

// ============================================================================
// CONVENIENCE FACTORY
// ============================================================================

/**
 * Create a complete observability suite with consistent configuration
 *
 * @example
 * ```typescript
 * const obs = createObservabilitySuite({
 *   service: 'my-app',
 *   environment: 'production',
 *   logLevel: 'info',
 *   traceSampleRate: 0.1,
 * });
 *
 * obs.logger.info('Server started');
 * obs.metrics.counter('requests_total').inc();
 * const span = obs.tracer.startSpan('operation');
 * obs.errorTracker.captureException(error);
 * ```
 */
export function createObservabilitySuite(config: {
  service: string
  environment?: string
  logLevel?: 'debug' | 'info' | 'warn' | 'error' | 'fatal'
  logFormat?: 'json' | 'pretty'
  traceSampleRate?: number
  metricsEnabled?: boolean
  tracingEnabled?: boolean
  errorTrackingEnabled?: boolean
}) {
  const {
    service,
    environment = process.env.NODE_ENV || 'development',
    logLevel = 'info',
    logFormat = environment === 'production' ? 'json' : 'pretty',
    traceSampleRate = 1.0,
    metricsEnabled = true,
    tracingEnabled = true,
    errorTrackingEnabled = true
  } = config

  return {
    logger: createLogger({
      level: logLevel,
      service,
      format: logFormat
    }),

    metrics: new MetricsCollector({
      service,
      enabled: metricsEnabled,
      defaultLabels: { environment }
    }),

    tracer: new Tracer({
      service,
      enabled: tracingEnabled,
      sampleRate: traceSampleRate,
      defaultAttributes: { environment }
    }),

    errorTracker: new ErrorTracker({
      service,
      environment,
      enabled: errorTrackingEnabled
    })
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Create Express middleware for automatic observability
 */
export function createExpressMiddleware(observability: {
  logger: any
  metrics: any
  tracer: any
  errorTracker: any
}) {
  const { logger, metrics, tracer, errorTracker } = observability

  const requestCounter = metrics.counter('http_requests_total')
  const requestDuration = metrics.histogram('http_request_duration_ms')

  return {
    // Main observability middleware
    middleware: (req: any, res: any, next: any) => {
      const requestId = Math.random().toString(36).substring(7)
      const startTime = Date.now()

      // Add logger
      req.logger = logger.child({
        requestId,
        method: req.method,
        path: req.path
      })

      // Start span
      const span = tracer.startSpan('http_request', {
        attributes: {
          'http.method': req.method,
          'http.url': req.url,
          'http.target': req.path
        }
      })
      tracer.setActiveSpan(span)
      req.span = span

      // Start timer
      const endTimer = requestDuration.startTimer({
        method: req.method,
        path: req.path
      })

      // Add breadcrumb
      errorTracker.addBreadcrumb({
        type: 'http',
        message: `${req.method} ${req.path}`,
        data: { url: req.url, method: req.method }
      })

      // On response finish
      res.on('finish', () => {
        const duration = Date.now() - startTime

        req.logger.info('Request completed', {
          statusCode: res.statusCode,
          duration
        })

        requestCounter.inc({
          method: req.method,
          path: req.path,
          status: res.statusCode.toString()
        })

        span.setAttribute('http.status_code', res.statusCode)
        span.end()

        endTimer()
      })

      next()
    },

    // Error handler middleware
    errorHandler: (err: any, req: any, res: any, next: any) => {
      req.logger.error('Request error', {}, err)
      req.span.recordException(err)

      errorTracker.captureException(err, {
        severity: 'error',
        context: {
          requestId: req.requestId,
          path: req.path,
          method: req.method
        }
      })

      res.status(500).json({ error: 'Internal server error' })
    },

    // Metrics endpoint
    metricsEndpoint: (req: any, res: any) => {
      res.set('Content-Type', 'text/plain')
      res.send(metrics.exportPrometheus())
    }
  }
}

/**
 * Create React error boundary props
 */
export function createErrorBoundaryProps(observability: { logger: any; errorTracker: any }) {
  const { logger, errorTracker } = observability

  return {
    onError: (error: Error, info: any) => {
      logger.error('React error boundary caught error', {
        error: error.message,
        componentStack: info.componentStack
      })

      errorTracker.captureException(error, {
        severity: 'error',
        context: {
          componentStack: info.componentStack
        },
        tags: { boundary: 'react' }
      })
    }
  }
}
