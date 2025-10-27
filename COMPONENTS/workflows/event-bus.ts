/**
 * Event Bus for Multi-Agent Systems
 *
 * Pub/sub event system for inter-agent communication with advanced features.
 *
 * Features:
 * - Event publish/subscribe
 * - Wildcard subscriptions (e.g., 'user.*', 'agent.**')
 * - Event priority handling
 * - Event replay and history
 * - Typed events with TypeScript
 * - Async event handlers
 * - Error handling and isolation
 * - Event filtering
 * - Performance monitoring
 *
 * @example
 * ```typescript
 * const eventBus = createEventBus({
 *   maxHistory: 100,
 *   enableReplay: true
 * })
 *
 * // Subscribe to events
 * eventBus.on('user.created', (event) => {
 *   console.log('User created:', event.data)
 * })
 *
 * // Wildcard subscription
 * eventBus.on('user.*', (event) => {
 *   console.log('User event:', event.type, event.data)
 * })
 *
 * // Emit event
 * await eventBus.emit({
 *   type: 'user.created',
 *   data: { id: 1, name: 'John' },
 *   priority: 'high'
 * })
 *
 * // Replay events
 * eventBus.replay('user.*')
 * ```
 */

export type EventPriority = 'low' | 'normal' | 'high' | 'critical'
export type EventHandler<T = any> = (event: Event<T>) => void | Promise<void>

/**
 * Custom error class for event bus errors
 */
export class EventBusError extends Error {
  constructor(
    message: string,
    public eventType?: string,
    public originalError?: Error
  ) {
    super(message)
    this.name = 'EventBusError'
  }
}

/**
 * Event interface
 */
export interface Event<T = any> {
  type: string
  data: T
  timestamp?: number
  priority?: EventPriority
  source?: string
  id?: string
  metadata?: Record<string, any>
}

/**
 * Event bus options
 */
export interface EventBusOptions {
  maxHistory?: number
  enableReplay?: boolean
  enableMetrics?: boolean
  defaultPriority?: EventPriority
  errorHandler?: (error: Error, event: Event) => void
  onEmit?: (event: Event) => void
  onSubscribe?: (type: string) => void
  onUnsubscribe?: (type: string) => void
}

/**
 * Event subscription
 */
interface Subscription<T = any> {
  id: string
  type: string
  pattern: RegExp
  handler: EventHandler<T>
  priority: EventPriority
  once: boolean
}

/**
 * Event metrics
 */
interface EventMetrics {
  emitCount: number
  handlerCount: number
  errorCount: number
  lastEmitTime?: number
  avgHandlerTime?: number
}

/**
 * Event Bus
 */
export class EventBus {
  private options: Required<Omit<EventBusOptions,
    'errorHandler' | 'onEmit' | 'onSubscribe' | 'onUnsubscribe'
  >> & {
    errorHandler?: (error: Error, event: Event) => void
    onEmit?: (event: Event) => void
    onSubscribe?: (type: string) => void
    onUnsubscribe?: (type: string) => void
  }

  private subscriptions: Map<string, Subscription> = new Map()
  private subscriptionCounter = 0
  private eventHistory: Event[] = []
  private metrics: Map<string, EventMetrics> = new Map()

  constructor(options: EventBusOptions = {}) {
    this.options = {
      maxHistory: options.maxHistory || 100,
      enableReplay: options.enableReplay || true,
      enableMetrics: options.enableMetrics || true,
      defaultPriority: options.defaultPriority || 'normal',
      errorHandler: options.errorHandler,
      onEmit: options.onEmit,
      onSubscribe: options.onSubscribe,
      onUnsubscribe: options.onUnsubscribe,
    }
  }

  /**
   * Subscribe to events
   */
  on<T = any>(type: string, handler: EventHandler<T>, priority: EventPriority = 'normal'): string {
    const id = `sub-${++this.subscriptionCounter}`
    const pattern = this.typeToRegex(type)

    this.subscriptions.set(id, {
      id,
      type,
      pattern,
      handler: handler as EventHandler,
      priority,
      once: false,
    })

    this.options.onSubscribe?.(type)

    return id
  }

  /**
   * Subscribe to events once
   */
  once<T = any>(type: string, handler: EventHandler<T>, priority: EventPriority = 'normal'): string {
    const id = `sub-${++this.subscriptionCounter}`
    const pattern = this.typeToRegex(type)

    this.subscriptions.set(id, {
      id,
      type,
      pattern,
      handler: handler as EventHandler,
      priority,
      once: true,
    })

    this.options.onSubscribe?.(type)

    return id
  }

  /**
   * Unsubscribe from events
   */
  off(id: string): void {
    const sub = this.subscriptions.get(id)
    if (sub) {
      this.subscriptions.delete(id)
      this.options.onUnsubscribe?.(sub.type)
    }
  }

  /**
   * Unsubscribe all handlers for a type
   */
  offType(type: string): void {
    const toRemove: string[] = []

    for (const [id, sub] of this.subscriptions) {
      if (sub.type === type) {
        toRemove.push(id)
      }
    }

    toRemove.forEach(id => this.off(id))
  }

  /**
   * Emit an event
   */
  async emit<T = any>(event: Event<T> | string, data?: T): Promise<void> {
    // Normalize event
    const normalizedEvent: Event<T> = typeof event === 'string'
      ? {
          type: event,
          data: data!,
          timestamp: Date.now(),
          priority: this.options.defaultPriority,
          id: this.generateEventId(),
        }
      : {
          ...event,
          timestamp: event.timestamp || Date.now(),
          priority: event.priority || this.options.defaultPriority,
          id: event.id || this.generateEventId(),
        }

    // Store in history
    if (this.options.enableReplay) {
      this.addToHistory(normalizedEvent)
    }

    // Update metrics
    if (this.options.enableMetrics) {
      this.updateMetrics(normalizedEvent.type, 'emit')
    }

    // Callback
    this.options.onEmit?.(normalizedEvent)

    // Get matching subscriptions
    const matchingSubs = this.getMatchingSubscriptions(normalizedEvent.type)

    // Sort by priority
    matchingSubs.sort((a, b) => {
      const priorityOrder: Record<EventPriority, number> = {
        critical: 4,
        high: 3,
        normal: 2,
        low: 1,
      }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })

    // Execute handlers
    const startTime = Date.now()
    const handlerPromises: Promise<void>[] = []

    for (const sub of matchingSubs) {
      const handlerPromise = this.executeHandler(sub, normalizedEvent)
      handlerPromises.push(handlerPromise)

      // Remove if once
      if (sub.once) {
        this.off(sub.id)
      }
    }

    // Wait for all handlers
    await Promise.allSettled(handlerPromises)

    // Update handler time metrics
    if (this.options.enableMetrics) {
      const duration = Date.now() - startTime
      this.updateHandlerTime(normalizedEvent.type, duration)
    }
  }

  /**
   * Emit event without waiting for handlers
   */
  emitAsync<T = any>(event: Event<T> | string, data?: T): void {
    this.emit(event, data).catch(error => {
      this.options.errorHandler?.(error, typeof event === 'string'
        ? { type: event, data: data! }
        : event)
    })
  }

  /**
   * Execute handler with error isolation
   */
  private async executeHandler(sub: Subscription, event: Event): Promise<void> {
    try {
      await sub.handler(event)

      if (this.options.enableMetrics) {
        this.updateMetrics(event.type, 'handler')
      }
    } catch (error) {
      if (this.options.enableMetrics) {
        this.updateMetrics(event.type, 'error')
      }

      const eventError = new EventBusError(
        `Handler error for event ${event.type}`,
        event.type,
        error as Error
      )

      if (this.options.errorHandler) {
        this.options.errorHandler(eventError, event)
      } else {
        console.error('Event handler error:', eventError)
      }
    }
  }

  /**
   * Get matching subscriptions for event type
   */
  private getMatchingSubscriptions(type: string): Subscription[] {
    const matching: Subscription[] = []

    for (const sub of this.subscriptions.values()) {
      if (sub.pattern.test(type)) {
        matching.push(sub)
      }
    }

    return matching
  }

  /**
   * Replay events matching pattern
   */
  replay(typePattern?: string): void {
    if (!this.options.enableReplay) {
      throw new EventBusError('Replay is disabled')
    }

    const pattern = typePattern ? this.typeToRegex(typePattern) : null

    for (const event of this.eventHistory) {
      if (!pattern || pattern.test(event.type)) {
        this.emitAsync(event)
      }
    }
  }

  /**
   * Replay events to specific handler
   */
  replayTo(typePattern: string, handler: EventHandler): void {
    if (!this.options.enableReplay) {
      throw new EventBusError('Replay is disabled')
    }

    const pattern = this.typeToRegex(typePattern)

    for (const event of this.eventHistory) {
      if (pattern.test(event.type)) {
        this.executeHandler(
          {
            id: 'replay',
            type: typePattern,
            pattern,
            handler,
            priority: 'normal',
            once: false,
          },
          event
        )
      }
    }
  }

  /**
   * Get event history
   */
  getHistory(typePattern?: string): Event[] {
    if (!this.options.enableReplay) {
      return []
    }

    if (!typePattern) {
      return [...this.eventHistory]
    }

    const pattern = this.typeToRegex(typePattern)
    return this.eventHistory.filter(event => pattern.test(event.type))
  }

  /**
   * Clear event history
   */
  clearHistory(typePattern?: string): void {
    if (!typePattern) {
      this.eventHistory = []
      return
    }

    const pattern = this.typeToRegex(typePattern)
    this.eventHistory = this.eventHistory.filter(
      event => !pattern.test(event.type)
    )
  }

  /**
   * Get subscribers for a type pattern
   */
  getSubscribers(typePattern?: string): Subscription[] {
    if (!typePattern) {
      return Array.from(this.subscriptions.values())
    }

    const pattern = this.typeToRegex(typePattern)
    return Array.from(this.subscriptions.values()).filter(sub =>
      pattern.test(sub.type)
    )
  }

  /**
   * Get number of subscribers for a type
   */
  getSubscriberCount(type: string): number {
    return this.getMatchingSubscriptions(type).length
  }

  /**
   * Clear all subscriptions
   */
  clear(): void {
    this.subscriptions.clear()
  }

  /**
   * Clear subscriptions for a type pattern
   */
  clearType(typePattern: string): void {
    const pattern = this.typeToRegex(typePattern)
    const toRemove: string[] = []

    for (const [id, sub] of this.subscriptions) {
      if (pattern.test(sub.type)) {
        toRemove.push(id)
      }
    }

    toRemove.forEach(id => this.off(id))
  }

  /**
   * Get metrics for event type
   */
  getMetrics(type?: string): EventMetrics | Map<string, EventMetrics> {
    if (!this.options.enableMetrics) {
      return type ? this.getEmptyMetrics() : new Map()
    }

    if (type) {
      return this.metrics.get(type) || this.getEmptyMetrics()
    }

    return new Map(this.metrics)
  }

  /**
   * Clear metrics
   */
  clearMetrics(): void {
    this.metrics.clear()
  }

  /**
   * Wait for event
   */
  waitFor<T = any>(type: string, timeout?: number): Promise<Event<T>> {
    return new Promise((resolve, reject) => {
      let timeoutId: NodeJS.Timeout | undefined

      const id = this.once<T>(type, (event) => {
        if (timeoutId) clearTimeout(timeoutId)
        resolve(event)
      })

      if (timeout) {
        timeoutId = setTimeout(() => {
          this.off(id)
          reject(new EventBusError(`Timeout waiting for event ${type}`, type))
        }, timeout)
      }
    })
  }

  /**
   * Filter events by predicate
   */
  filter<T = any>(
    type: string,
    predicate: (event: Event<T>) => boolean,
    handler: EventHandler<T>
  ): string {
    return this.on<T>(type, async (event) => {
      if (predicate(event)) {
        await handler(event)
      }
    })
  }

  /**
   * Map events
   */
  map<T = any, R = any>(
    sourceType: string,
    targetType: string,
    mapper: (event: Event<T>) => R
  ): string {
    return this.on<T>(sourceType, async (event) => {
      const mapped = mapper(event)
      await this.emit<R>({
        type: targetType,
        data: mapped,
        source: event.type,
        metadata: event.metadata,
      })
    })
  }

  /**
   * Add event to history
   */
  private addToHistory(event: Event): void {
    this.eventHistory.push(event)

    // Trim if exceeds max
    if (this.eventHistory.length > this.options.maxHistory) {
      this.eventHistory.shift()
    }
  }

  /**
   * Update metrics
   */
  private updateMetrics(type: string, metric: 'emit' | 'handler' | 'error'): void {
    const current = this.metrics.get(type) || this.getEmptyMetrics()

    if (metric === 'emit') {
      current.emitCount++
      current.lastEmitTime = Date.now()
    } else if (metric === 'handler') {
      current.handlerCount++
    } else if (metric === 'error') {
      current.errorCount++
    }

    this.metrics.set(type, current)
  }

  /**
   * Update handler time metrics
   */
  private updateHandlerTime(type: string, duration: number): void {
    const current = this.metrics.get(type)
    if (!current) return

    if (current.avgHandlerTime === undefined) {
      current.avgHandlerTime = duration
    } else {
      // Moving average
      current.avgHandlerTime = (current.avgHandlerTime * 0.9) + (duration * 0.1)
    }

    this.metrics.set(type, current)
  }

  /**
   * Get empty metrics
   */
  private getEmptyMetrics(): EventMetrics {
    return {
      emitCount: 0,
      handlerCount: 0,
      errorCount: 0,
    }
  }

  /**
   * Convert type pattern to regex
   */
  private typeToRegex(pattern: string): RegExp {
    // Support wildcards:
    // 'user.*' matches 'user.created', 'user.updated', etc.
    // 'user.**' matches 'user.profile.updated', etc. (multi-level)
    // '*' matches any single segment
    // '**' matches any number of segments

    const escaped = pattern
      .replace(/\./g, '\\.')
      .replace(/\*\*/g, '___DOUBLESTAR___')
      .replace(/\*/g, '[^.]+')
      .replace(/___DOUBLESTAR___/g, '.*')

    return new RegExp(`^${escaped}$`)
  }

  /**
   * Generate unique event ID
   */
  private generateEventId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Dispose and cleanup
   */
  dispose(): void {
    this.clear()
    this.clearHistory()
    this.clearMetrics()
  }
}

/**
 * Create event bus with default options
 */
export function createEventBus(options: EventBusOptions = {}): EventBus {
  return new EventBus(options)
}

/**
 * Typed event bus wrapper for better type safety
 */
export class TypedEventBus<EventMap extends Record<string, any>> {
  private eventBus: EventBus

  constructor(options: EventBusOptions = {}) {
    this.eventBus = new EventBus(options)
  }

  on<K extends keyof EventMap>(
    type: K,
    handler: (event: Event<EventMap[K]>) => void | Promise<void>,
    priority?: EventPriority
  ): string {
    return this.eventBus.on(type as string, handler, priority)
  }

  once<K extends keyof EventMap>(
    type: K,
    handler: (event: Event<EventMap[K]>) => void | Promise<void>,
    priority?: EventPriority
  ): string {
    return this.eventBus.once(type as string, handler, priority)
  }

  emit<K extends keyof EventMap>(type: K, data: EventMap[K]): Promise<void> {
    return this.eventBus.emit(type as string, data)
  }

  emitAsync<K extends keyof EventMap>(type: K, data: EventMap[K]): void {
    this.eventBus.emitAsync(type as string, data)
  }

  off(id: string): void {
    this.eventBus.off(id)
  }

  waitFor<K extends keyof EventMap>(type: K, timeout?: number): Promise<Event<EventMap[K]>> {
    return this.eventBus.waitFor(type as string, timeout)
  }

  // Proxy other methods
  clear(): void {
    this.eventBus.clear()
  }

  dispose(): void {
    this.eventBus.dispose()
  }
}

/**
 * Create typed event bus
 */
export function createTypedEventBus<EventMap extends Record<string, any>>(
  options: EventBusOptions = {}
): TypedEventBus<EventMap> {
  return new TypedEventBus<EventMap>(options)
}
