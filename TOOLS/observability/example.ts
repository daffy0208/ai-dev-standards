/**
 * Observability Tools - Quick Start Example
 *
 * This file demonstrates how to use all 4 observability tools together
 * in a typical application scenario.
 */

import { createLogger, FileOutput } from './logger-tool'
import { MetricsCollector } from './metrics-tool'
import { Tracer } from './tracer-tool'
import { ErrorTracker } from './error-tracker-tool'

// ============================================================================
// INITIALIZATION
// ============================================================================

const logger = createLogger({
  level: 'info',
  service: 'example-service',
  format: process.env.NODE_ENV === 'production' ? 'json' : 'pretty'
})

const metrics = new MetricsCollector({
  service: 'example-service',
  defaultLabels: {
    environment: process.env.NODE_ENV || 'development'
  }
})

const tracer = new Tracer({
  service: 'example-service',
  sampleRate: 0.5 // 50% sampling
})

const errorTracker = new ErrorTracker({
  service: 'example-service',
  environment: process.env.NODE_ENV || 'development'
})

// ============================================================================
// SETUP METRICS
// ============================================================================

const operationCounter = metrics.counter('operations_total', {
  description: 'Total operations performed'
})

const operationDuration = metrics.histogram('operation_duration_ms', {
  description: 'Operation duration in milliseconds',
  buckets: [10, 50, 100, 500, 1000, 5000]
})

const activeOperations = metrics.gauge('operations_active', {
  description: 'Currently active operations'
})

// ============================================================================
// EXAMPLE: SIMULATED DATABASE OPERATION
// ============================================================================

async function fetchUser(userId: string): Promise<any> {
  // Start tracing
  const span = tracer.startSpan('fetch_user', {
    attributes: { userId }
  })
  tracer.setActiveSpan(span)

  // Context logging
  const opLogger = logger.child({ userId, operation: 'fetch_user' })
  opLogger.info('Fetching user')

  // Track metrics
  activeOperations.inc()
  const endTimer = operationDuration.startTimer({ operation: 'fetch_user' })

  // Breadcrumb
  errorTracker.addBreadcrumb({
    type: 'query',
    message: 'Fetching user from database',
    data: { userId }
  })

  try {
    // Simulate database query
    span.addEvent('executing_query')
    await new Promise(resolve => setTimeout(resolve, Math.random() * 200))

    const user = { id: userId, name: 'John Doe' }

    // Success metrics
    operationCounter.inc({ operation: 'fetch_user', status: 'success' })
    span.setAttribute('user.name', user.name)
    opLogger.info('User fetched successfully', { userName: user.name })

    return user
  } catch (error) {
    // Error handling
    opLogger.error('Failed to fetch user', {}, error as Error)
    span.recordException(error as Error)

    errorTracker.captureException(error as Error, {
      severity: 'error',
      context: { userId, operation: 'fetch_user' },
      tags: { database: 'users' }
    })

    operationCounter.inc({ operation: 'fetch_user', status: 'error' })

    throw error
  } finally {
    span.end()
    endTimer()
    activeOperations.dec()
  }
}

// ============================================================================
// EXAMPLE: COMPLEX BUSINESS OPERATION
// ============================================================================

async function processOrder(orderId: string): Promise<void> {
  // Root span
  const rootSpan = tracer.startSpan('process_order', {
    attributes: { orderId }
  })
  tracer.setActiveSpan(rootSpan)

  const orderLogger = logger.child({ orderId, operation: 'process_order' })
  orderLogger.info('Processing order started')

  const orderTimer = metrics.timer('order_processing_duration_ms')
  const endTimer = orderTimer.start({ orderId })

  try {
    // Step 1: Validate order
    errorTracker.addBreadcrumb({
      type: 'default',
      message: 'Validating order',
      data: { orderId }
    })

    const validateSpan = tracer.startSpan('validate_order')
    await new Promise(resolve => setTimeout(resolve, 50))
    validateSpan.end()
    orderLogger.debug('Order validated')

    // Step 2: Check inventory
    errorTracker.addBreadcrumb({
      type: 'default',
      message: 'Checking inventory',
      data: { orderId }
    })

    const inventorySpan = tracer.startSpan('check_inventory')
    await new Promise(resolve => setTimeout(resolve, 100))
    inventorySpan.setAttribute('items_available', true)
    inventorySpan.end()
    orderLogger.debug('Inventory checked')

    // Step 3: Process payment
    errorTracker.addBreadcrumb({
      type: 'http',
      message: 'Processing payment',
      data: { orderId, processor: 'stripe' }
    })

    const paymentSpan = tracer.startSpan('process_payment', {
      attributes: { processor: 'stripe' }
    })

    await new Promise(resolve => setTimeout(resolve, 200))
    paymentSpan.setAttribute('payment.status', 'success')
    paymentSpan.end()
    orderLogger.info('Payment processed')

    // Step 4: Create shipment
    errorTracker.addBreadcrumb({
      type: 'default',
      message: 'Creating shipment',
      data: { orderId }
    })

    const shipmentSpan = tracer.startSpan('create_shipment')
    await new Promise(resolve => setTimeout(resolve, 150))
    shipmentSpan.setAttribute('tracking_number', 'TRACK123')
    shipmentSpan.end()
    orderLogger.info('Shipment created', { trackingNumber: 'TRACK123' })

    // Success
    metrics.counter('orders_processed_total').inc({ status: 'success' })
    rootSpan.setStatus({ code: 1, message: 'OK' })
    orderLogger.info('Order processed successfully')
  } catch (error) {
    orderLogger.error('Order processing failed', {}, error as Error)
    rootSpan.recordException(error as Error)

    errorTracker.captureException(error as Error, {
      severity: 'error',
      context: { orderId },
      tags: { operation: 'process_order' }
    })

    metrics.counter('orders_processed_total').inc({ status: 'failed' })

    throw error
  } finally {
    rootSpan.end()
    endTimer()
  }
}

// ============================================================================
// EXAMPLE: ERROR SCENARIOS
// ============================================================================

async function simulateErrors(): Promise<void> {
  logger.warn('Simulating various error scenarios')

  // Scenario 1: Validation error
  try {
    throw new Error('Invalid input: email format incorrect')
  } catch (error) {
    errorTracker.captureException(error as Error, {
      severity: 'warning',
      context: { input: 'invalid@email' },
      tags: { type: 'validation' }
    })
  }

  // Scenario 2: Network error
  try {
    throw new Error('Network timeout after 5000ms')
  } catch (error) {
    errorTracker.captureException(error as Error, {
      severity: 'error',
      context: { url: 'https://api.example.com', timeout: 5000 },
      tags: { type: 'network' }
    })
  }

  // Scenario 3: Fatal error
  try {
    throw new Error('Database connection pool exhausted')
  } catch (error) {
    errorTracker.captureException(error as Error, {
      severity: 'fatal',
      context: { poolSize: 10, activeConnections: 10 },
      tags: { type: 'database' }
    })
  }
}

// ============================================================================
// EXAMPLE: REPORTING
// ============================================================================

function generateReports(): void {
  logger.info('Generating observability reports')

  // Metrics report
  console.log('\n=== METRICS REPORT ===')
  console.log(metrics.exportJSON())

  // Traces report
  console.log('\n=== TRACES REPORT ===')
  const traces = tracer.getAllTraces()
  console.log(`Total traces: ${traces.length}`)
  traces.forEach(trace => {
    console.log(`Trace ${trace.traceId}: ${trace.spans.length} spans`)
  })

  // Errors report
  console.log('\n=== ERRORS REPORT ===')
  const errorReport = errorTracker.generateReport()
  console.log(`Total errors: ${errorReport.totalErrors}`)
  console.log('Top errors:')
  errorReport.topErrors.forEach((error, i) => {
    console.log(`  ${i + 1}. ${error.message} (${error.count} occurrences)`)
  })

  console.log('\nBy severity:')
  Object.entries(errorReport.bySeverity).forEach(([severity, count]) => {
    console.log(`  ${severity}: ${count}`)
  })
}

// ============================================================================
// EXAMPLE: PROMETHEUS METRICS ENDPOINT
// ============================================================================

function exportPrometheus(): string {
  return metrics.exportPrometheus()
}

// ============================================================================
// RUN EXAMPLES
// ============================================================================

async function main() {
  logger.info('Starting observability example')

  try {
    // Example 1: Simple operation
    await fetchUser('user-123')
    await fetchUser('user-456')

    // Example 2: Complex operation
    await processOrder('order-789')

    // Example 3: Error scenarios
    await simulateErrors()

    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Generate reports
    generateReports()

    // Show Prometheus format
    console.log('\n=== PROMETHEUS FORMAT ===')
    console.log(exportPrometheus())
  } catch (error) {
    logger.fatal('Unhandled error in main', {}, error as Error)
    process.exit(1)
  }
}

// Run if executed directly
if (require.main === module) {
  main()
    .then(() => {
      logger.info('Example completed successfully')
      process.exit(0)
    })
    .catch(error => {
      logger.fatal('Example failed', {}, error)
      process.exit(1)
    })
}

// Export for use in other files
export { logger, metrics, tracer, errorTracker, fetchUser, processOrder, exportPrometheus }
