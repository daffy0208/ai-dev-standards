/**
 * Distributed Tracing Tool
 *
 * A comprehensive distributed tracing solution for tracking request flows across
 * services. Supports span creation, context propagation, and OpenTelemetry export.
 *
 * @example Basic Usage
 * ```typescript
 * const tracer = new Tracer({ service: 'api' });
 *
 * // Create a trace
 * const span = tracer.startSpan('handle_request', {
 *   attributes: { method: 'GET', path: '/users' }
 * });
 *
 * try {
 *   // Do work
 *   span.addEvent('fetching_from_database');
 *   const users = await db.query('SELECT * FROM users');
 *   span.setAttribute('user_count', users.length);
 * } finally {
 *   span.end();
 * }
 * ```
 *
 * @example Nested Spans
 * ```typescript
 * const tracer = new Tracer({ service: 'api' });
 *
 * const rootSpan = tracer.startSpan('process_order');
 * tracer.setActiveSpan(rootSpan);
 *
 * try {
 *   // Child span inherits parent context
 *   const validateSpan = tracer.startSpan('validate_order');
 *   await validateOrder(order);
 *   validateSpan.end();
 *
 *   const paymentSpan = tracer.startSpan('process_payment');
 *   await processPayment(order);
 *   paymentSpan.end();
 *
 *   const shipSpan = tracer.startSpan('ship_order');
 *   await shipOrder(order);
 *   shipSpan.end();
 * } finally {
 *   rootSpan.end();
 * }
 * ```
 *
 * @example Express Integration
 * ```typescript
 * import express from 'express';
 * import { Tracer } from './tracer-tool';
 *
 * const app = express();
 * const tracer = new Tracer({ service: 'api' });
 *
 * // Tracing middleware
 * app.use((req, res, next) => {
 *   const span = tracer.startSpan('http_request', {
 *     attributes: {
 *       'http.method': req.method,
 *       'http.url': req.url,
 *       'http.target': req.path,
 *     }
 *   });
 *
 *   tracer.setActiveSpan(span);
 *   req.span = span;
 *
 *   res.on('finish', () => {
 *     span.setAttribute('http.status_code', res.statusCode);
 *     span.end();
 *   });
 *
 *   next();
 * });
 *
 * // Use in handlers
 * app.get('/users/:id', async (req, res) => {
 *   const dbSpan = tracer.startSpan('db.query');
 *   dbSpan.setAttribute('db.statement', 'SELECT * FROM users WHERE id = ?');
 *   const user = await db.query('...', req.params.id);
 *   dbSpan.end();
 *
 *   res.json(user);
 * });
 * ```
 *
 * @example React Integration
 * ```typescript
 * import { Tracer } from './tracer-tool';
 *
 * const tracer = new Tracer({ service: 'frontend' });
 *
 * class TracedComponent extends React.Component {
 *   componentDidMount() {
 *     const span = tracer.startSpan('component.mount', {
 *       attributes: { component: this.constructor.name }
 *     });
 *     // ... initialization
 *     span.end();
 *   }
 *
 *   async fetchData() {
 *     const span = tracer.startSpan('fetch.data');
 *     try {
 *       const response = await fetch('/api/data');
 *       span.setAttribute('http.status_code', response.status);
 *       return await response.json();
 *     } catch (error) {
 *       span.recordException(error);
 *       throw error;
 *     } finally {
 *       span.end();
 *     }
 *   }
 * }
 * ```
 */

import { randomUUID } from 'crypto'

/**
 * Span status codes
 */
export enum SpanStatusCode {
  UNSET = 0,
  OK = 1,
  ERROR = 2
}

/**
 * Span kind
 */
export enum SpanKind {
  INTERNAL = 0,
  SERVER = 1,
  CLIENT = 2,
  PRODUCER = 3,
  CONSUMER = 4
}

/**
 * Span event
 */
export interface SpanEvent {
  /** Event name */
  name: string
  /** Timestamp in milliseconds */
  timestamp: number
  /** Event attributes */
  attributes?: Record<string, any>
}

/**
 * Span link to another span
 */
export interface SpanLink {
  /** Trace ID of linked span */
  traceId: string
  /** Span ID of linked span */
  spanId: string
  /** Link attributes */
  attributes?: Record<string, any>
}

/**
 * Span status
 */
export interface SpanStatus {
  /** Status code */
  code: SpanStatusCode
  /** Status message */
  message?: string
}

/**
 * Span options
 */
export interface SpanOptions {
  /** Span kind */
  kind?: SpanKind
  /** Initial attributes */
  attributes?: Record<string, any>
  /** Parent span or span ID */
  parent?: Span | string
  /** Links to other spans */
  links?: SpanLink[]
  /** Start timestamp (defaults to now) */
  startTime?: number
}

/**
 * Span interface
 */
export interface Span {
  /** Span ID */
  readonly spanId: string
  /** Trace ID */
  readonly traceId: string
  /** Parent span ID */
  readonly parentSpanId?: string
  /** Span name */
  readonly name: string
  /** Span kind */
  readonly kind: SpanKind
  /** Start timestamp */
  readonly startTime: number
  /** End timestamp */
  endTime?: number
  /** Span attributes */
  attributes: Record<string, any>
  /** Span events */
  events: SpanEvent[]
  /** Span links */
  links: SpanLink[]
  /** Span status */
  status: SpanStatus

  /** Set a single attribute */
  setAttribute(key: string, value: any): Span
  /** Set multiple attributes */
  setAttributes(attributes: Record<string, any>): Span
  /** Add an event */
  addEvent(name: string, attributes?: Record<string, any>): Span
  /** Set span status */
  setStatus(status: SpanStatus): Span
  /** Record an exception */
  recordException(error: Error): Span
  /** End the span */
  end(endTime?: number): void
  /** Check if span is recording */
  isRecording(): boolean
}

/**
 * Trace context for propagation
 */
export interface TraceContext {
  /** Trace ID */
  traceId: string
  /** Span ID */
  spanId: string
  /** Trace flags */
  traceFlags?: number
  /** Trace state */
  traceState?: string
}

/**
 * Trace data
 */
export interface Trace {
  /** Trace ID */
  traceId: string
  /** Root span */
  rootSpan: Span
  /** All spans in trace */
  spans: Span[]
  /** Trace start time */
  startTime: number
  /** Trace end time */
  endTime?: number
  /** Service name */
  service: string
}

/**
 * Tracer options
 */
export interface TracerOptions {
  /** Service name */
  service?: string
  /** Enable/disable tracing */
  enabled?: boolean
  /** Default attributes for all spans */
  defaultAttributes?: Record<string, any>
  /** Sample rate (0-1, default: 1) */
  sampleRate?: number
}

/**
 * Internal span implementation
 */
class SpanImpl implements Span {
  public readonly spanId: string
  public readonly traceId: string
  public readonly parentSpanId?: string
  public readonly name: string
  public readonly kind: SpanKind
  public readonly startTime: number
  public endTime?: number
  public attributes: Record<string, any>
  public events: SpanEvent[]
  public links: SpanLink[]
  public status: SpanStatus
  private recording: boolean

  constructor(name: string, traceId: string, options: SpanOptions = {}) {
    this.spanId = randomUUID().replace(/-/g, '').substring(0, 16)
    this.traceId = traceId
    this.name = name
    this.kind = options.kind || SpanKind.INTERNAL
    this.startTime = options.startTime || Date.now()
    this.attributes = options.attributes || {}
    this.events = []
    this.links = options.links || []
    this.status = { code: SpanStatusCode.UNSET }
    this.recording = true

    if (options.parent) {
      if (typeof options.parent === 'string') {
        this.parentSpanId = options.parent
      } else {
        this.parentSpanId = options.parent.spanId
      }
    }
  }

  setAttribute(key: string, value: any): Span {
    if (this.recording) {
      this.attributes[key] = value
    }
    return this
  }

  setAttributes(attributes: Record<string, any>): Span {
    if (this.recording) {
      Object.assign(this.attributes, attributes)
    }
    return this
  }

  addEvent(name: string, attributes?: Record<string, any>): Span {
    if (this.recording) {
      this.events.push({
        name,
        timestamp: Date.now(),
        attributes
      })
    }
    return this
  }

  setStatus(status: SpanStatus): Span {
    if (this.recording) {
      this.status = status
    }
    return this
  }

  recordException(error: Error): Span {
    if (this.recording) {
      this.addEvent('exception', {
        'exception.type': error.name,
        'exception.message': error.message,
        'exception.stacktrace': error.stack
      })
      this.setStatus({
        code: SpanStatusCode.ERROR,
        message: error.message
      })
    }
    return this
  }

  end(endTime?: number): void {
    if (this.recording) {
      this.endTime = endTime || Date.now()
      this.recording = false

      if (this.status.code === SpanStatusCode.UNSET) {
        this.status.code = SpanStatusCode.OK
      }
    }
  }

  isRecording(): boolean {
    return this.recording
  }
}

/**
 * Main tracer class
 */
export class Tracer {
  private service: string
  private enabled: boolean
  private defaultAttributes: Record<string, any>
  private sampleRate: number
  private traces = new Map<string, Trace>()
  private activeSpans = new Map<string, Span>()
  private activeContext: Span | null = null

  constructor(options: TracerOptions = {}) {
    this.service = options.service || 'unknown'
    this.enabled = options.enabled !== false
    this.defaultAttributes = options.defaultAttributes || {}
    this.sampleRate = options.sampleRate !== undefined ? options.sampleRate : 1.0
  }

  /**
   * Start a new span
   */
  startSpan(name: string, options: SpanOptions = {}): Span {
    if (!this.enabled || !this.shouldSample()) {
      return this.createNoopSpan()
    }

    // Get parent from options or active context
    const parent = options.parent || this.activeContext

    // Create trace ID
    let traceId: string
    if (parent) {
      traceId = typeof parent === 'string' ? parent : parent.traceId
    } else {
      traceId = randomUUID().replace(/-/g, '')
    }

    // Create span
    const span = new SpanImpl(name, traceId, {
      ...options,
      parent,
      attributes: {
        ...this.defaultAttributes,
        'service.name': this.service,
        ...options.attributes
      }
    })

    // Store span
    this.activeSpans.set(span.spanId, span)

    // Create or update trace
    if (!this.traces.has(traceId)) {
      this.traces.set(traceId, {
        traceId,
        rootSpan: span,
        spans: [span],
        startTime: span.startTime,
        service: this.service
      })
    } else {
      const trace = this.traces.get(traceId)!
      trace.spans.push(span)
    }

    return span
  }

  /**
   * End a span
   */
  endSpan(span: Span, endTime?: number): void {
    span.end(endTime)
    this.activeSpans.delete(span.spanId)

    // Update trace end time
    const trace = this.traces.get(span.traceId)
    if (trace) {
      const allEnded = trace.spans.every(s => s.endTime !== undefined)
      if (allEnded) {
        trace.endTime = Math.max(...trace.spans.map(s => s.endTime || 0))
      }
    }

    // Clear active context if this was the active span
    if (this.activeContext?.spanId === span.spanId) {
      this.activeContext = null
    }
  }

  /**
   * Get active span
   */
  getActiveSpan(): Span | null {
    return this.activeContext
  }

  /**
   * Set active span for context
   */
  setActiveSpan(span: Span | null): void {
    this.activeContext = span
  }

  /**
   * Create trace context for propagation
   */
  createContext(span: Span): TraceContext {
    return {
      traceId: span.traceId,
      spanId: span.spanId,
      traceFlags: 1 // Sampled
    }
  }

  /**
   * Extract context from headers (W3C Trace Context format)
   */
  extractContext(headers: Record<string, string>): TraceContext | null {
    const traceparent = headers.traceparent || headers['traceparent']
    if (!traceparent) return null

    const parts = traceparent.split('-')
    if (parts.length !== 4) return null

    const [version, traceId, spanId, traceFlags] = parts
    if (version !== '00') return null

    return {
      traceId,
      spanId,
      traceFlags: parseInt(traceFlags, 16),
      traceState: headers.tracestate || headers['tracestate']
    }
  }

  /**
   * Inject context into headers (W3C Trace Context format)
   */
  injectContext(
    context: TraceContext,
    headers: Record<string, string> = {}
  ): Record<string, string> {
    const traceFlags = (context.traceFlags || 1).toString(16).padStart(2, '0')
    headers.traceparent = `00-${context.traceId}-${context.spanId}-${traceFlags}`

    if (context.traceState) {
      headers.tracestate = context.traceState
    }

    return headers
  }

  /**
   * Get a specific trace
   */
  getTrace(traceId: string): Trace | undefined {
    return this.traces.get(traceId)
  }

  /**
   * Get all traces
   */
  getAllTraces(): Trace[] {
    return Array.from(this.traces.values())
  }

  /**
   * Export trace as JSON
   */
  exportTraceJSON(traceId: string): string {
    const trace = this.traces.get(traceId)
    if (!trace) return '{}'

    return JSON.stringify(trace, null, 2)
  }

  /**
   * Export all traces as JSON
   */
  exportJSON(): string {
    return JSON.stringify(this.getAllTraces(), null, 2)
  }

  /**
   * Export trace in OpenTelemetry format
   */
  exportOpenTelemetry(traceId: string): any {
    const trace = this.traces.get(traceId)
    if (!trace) return null

    return {
      resourceSpans: [
        {
          resource: {
            attributes: [{ key: 'service.name', value: { stringValue: this.service } }]
          },
          scopeSpans: [
            {
              scope: {
                name: 'tracer',
                version: '1.0.0'
              },
              spans: trace.spans.map(span => ({
                traceId: span.traceId,
                spanId: span.spanId,
                parentSpanId: span.parentSpanId,
                name: span.name,
                kind: span.kind,
                startTimeUnixNano: span.startTime * 1000000,
                endTimeUnixNano: span.endTime ? span.endTime * 1000000 : undefined,
                attributes: Object.entries(span.attributes).map(([key, value]) => ({
                  key,
                  value: this.convertValue(value)
                })),
                events: span.events.map(event => ({
                  name: event.name,
                  timeUnixNano: event.timestamp * 1000000,
                  attributes: event.attributes
                    ? Object.entries(event.attributes).map(([key, value]) => ({
                        key,
                        value: this.convertValue(value)
                      }))
                    : []
                })),
                links: span.links.map(link => ({
                  traceId: link.traceId,
                  spanId: link.spanId,
                  attributes: link.attributes
                    ? Object.entries(link.attributes).map(([key, value]) => ({
                        key,
                        value: this.convertValue(value)
                      }))
                    : []
                })),
                status: {
                  code: span.status.code,
                  message: span.status.message
                }
              }))
            }
          ]
        }
      ]
    }
  }

  /**
   * Convert value to OpenTelemetry format
   */
  private convertValue(value: any): any {
    if (typeof value === 'string') return { stringValue: value }
    if (typeof value === 'number') return { intValue: value }
    if (typeof value === 'boolean') return { boolValue: value }
    return { stringValue: String(value) }
  }

  /**
   * Clear old traces
   */
  clearOldTraces(maxAge: number = 3600000): void {
    const now = Date.now()
    for (const [traceId, trace] of this.traces) {
      if (trace.endTime && now - trace.endTime > maxAge) {
        this.traces.delete(traceId)
      }
    }
  }

  /**
   * Clear all traces
   */
  clear(): void {
    this.traces.clear()
    this.activeSpans.clear()
    this.activeContext = null
  }

  /**
   * Check if should sample this trace
   */
  private shouldSample(): boolean {
    return Math.random() < this.sampleRate
  }

  /**
   * Create a no-op span when tracing is disabled
   */
  private createNoopSpan(): Span {
    return {
      spanId: '',
      traceId: '',
      name: '',
      kind: SpanKind.INTERNAL,
      startTime: 0,
      attributes: {},
      events: [],
      links: [],
      status: { code: SpanStatusCode.UNSET },
      setAttribute: () => this.createNoopSpan(),
      setAttributes: () => this.createNoopSpan(),
      addEvent: () => this.createNoopSpan(),
      setStatus: () => this.createNoopSpan(),
      recordException: () => this.createNoopSpan(),
      end: () => {},
      isRecording: () => false
    }
  }
}

/**
 * Default tracer instance
 */
export const defaultTracer = new Tracer({
  service: process.env.SERVICE_NAME || 'unknown',
  enabled: process.env.TRACING_ENABLED !== 'false',
  sampleRate: parseFloat(process.env.TRACE_SAMPLE_RATE || '1.0')
})
