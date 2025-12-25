/**
 * Error Tracking Tool
 *
 * A comprehensive error aggregation, grouping, and reporting system. Captures
 * errors with full context, groups similar errors, and provides reporting in
 * formats compatible with error tracking services like Sentry.
 *
 * @example Basic Usage
 * ```typescript
 * const errorTracker = new ErrorTracker({
 *   service: 'api',
 *   environment: 'production'
 * });
 *
 * try {
 *   await riskyOperation();
 * } catch (error) {
 *   errorTracker.captureException(error as Error, {
 *     severity: 'error',
 *     tags: { operation: 'riskyOperation' }
 *   });
 * }
 *
 * // Capture custom errors
 * errorTracker.captureError('Payment processing failed', {
 *   severity: 'fatal',
 *   context: { orderId: '12345', amount: 99.99 },
 *   tags: { payment: 'stripe' }
 * });
 * ```
 *
 * @example Breadcrumbs
 * ```typescript
 * const errorTracker = new ErrorTracker({ service: 'api' });
 *
 * // Add breadcrumbs to track user actions
 * errorTracker.addBreadcrumb({
 *   type: 'navigation',
 *   message: 'User navigated to checkout',
 *   data: { page: '/checkout' }
 * });
 *
 * errorTracker.addBreadcrumb({
 *   type: 'http',
 *   message: 'API request to payment service',
 *   data: { url: '/api/payment', method: 'POST' }
 * });
 *
 * try {
 *   await processPayment();
 * } catch (error) {
 *   // Error will include all breadcrumbs for context
 *   errorTracker.captureException(error);
 * }
 * ```
 *
 * @example Express Integration
 * ```typescript
 * import express from 'express';
 * import { ErrorTracker } from './error-tracker-tool';
 *
 * const app = express();
 * const errorTracker = new ErrorTracker({
 *   service: 'api',
 *   environment: process.env.NODE_ENV
 * });
 *
 * // Breadcrumb middleware
 * app.use((req, res, next) => {
 *   errorTracker.addBreadcrumb({
 *     type: 'http',
 *     category: 'request',
 *     message: `${req.method} ${req.path}`,
 *     data: {
 *       url: req.url,
 *       method: req.method,
 *       headers: req.headers,
 *     }
 *   });
 *   next();
 * });
 *
 * // User context middleware
 * app.use((req, res, next) => {
 *   if (req.user) {
 *     errorTracker.setContext('user', {
 *       id: req.user.id,
 *       email: req.user.email,
 *     });
 *   }
 *   next();
 * });
 *
 * // Error handler
 * app.use((err, req, res, next) => {
 *   errorTracker.captureException(err, {
 *     severity: 'error',
 *     context: {
 *       requestId: req.id,
 *       path: req.path,
 *       method: req.method,
 *     }
 *   });
 *
 *   res.status(500).json({ error: 'Internal server error' });
 * });
 *
 * // Report endpoint
 * app.get('/errors/report', (req, res) => {
 *   const report = errorTracker.generateReport({
 *     startTime: Date.now() - 86400000, // Last 24 hours
 *     groupBy: 'message'
 *   });
 *   res.json(report);
 * });
 * ```
 *
 * @example React Integration
 * ```typescript
 * import React from 'react';
 * import { ErrorTracker } from './error-tracker-tool';
 *
 * const errorTracker = new ErrorTracker({
 *   service: 'frontend',
 *   environment: process.env.NODE_ENV
 * });
 *
 * class ErrorBoundary extends React.Component {
 *   componentDidCatch(error: Error, info: React.ErrorInfo) {
 *     errorTracker.captureException(error, {
 *       severity: 'error',
 *       context: {
 *         componentStack: info.componentStack,
 *         component: this.props.name,
 *       },
 *       tags: { boundary: 'react' }
 *     });
 *   }
 *
 *   render() {
 *     return this.props.children;
 *   }
 * }
 *
 * // Track user interactions
 * function UserProfile({ userId }) {
 *   useEffect(() => {
 *     errorTracker.setContext('user', { id: userId });
 *     errorTracker.addBreadcrumb({
 *       type: 'navigation',
 *       message: 'Viewed user profile',
 *       data: { userId }
 *     });
 *   }, [userId]);
 *
 *   return <div>...</div>;
 * }
 * ```
 */

import { createHash } from 'crypto'

/**
 * Error severity levels
 */
export enum ErrorSeverity {
  DEBUG = 'debug',
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  FATAL = 'fatal'
}

/**
 * Breadcrumb types
 */
export enum BreadcrumbType {
  DEFAULT = 'default',
  NAVIGATION = 'navigation',
  HTTP = 'http',
  USER = 'user',
  ERROR = 'error',
  QUERY = 'query'
}

/**
 * Breadcrumb for tracking user actions
 */
export interface Breadcrumb {
  /** Breadcrumb type */
  type?: BreadcrumbType
  /** Category for grouping */
  category?: string
  /** Breadcrumb message */
  message: string
  /** Additional data */
  data?: Record<string, any>
  /** Timestamp */
  timestamp: number
  /** Severity level */
  level?: ErrorSeverity
}

/**
 * Error context information
 */
export interface ErrorContext {
  /** User information */
  user?: {
    id?: string
    email?: string
    username?: string
    [key: string]: any
  }
  /** Request information */
  request?: {
    url?: string
    method?: string
    headers?: Record<string, string>
    data?: any
  }
  /** Environment information */
  environment?: {
    platform?: string
    os?: string
    browser?: string
    version?: string
  }
  /** Custom context */
  [key: string]: any
}

/**
 * Error capture options
 */
export interface ErrorOptions {
  /** Error severity */
  severity?: ErrorSeverity
  /** Error tags for filtering */
  tags?: Record<string, string>
  /** Additional context */
  context?: Record<string, any>
  /** Fingerprint for grouping */
  fingerprint?: string[]
  /** Timestamp override */
  timestamp?: number
}

/**
 * Error occurrence record
 */
export interface ErrorOccurrence {
  /** Unique occurrence ID */
  id: string
  /** Error message */
  message: string
  /** Error type/name */
  type?: string
  /** Stack trace */
  stack?: string
  /** Severity level */
  severity: ErrorSeverity
  /** Timestamp */
  timestamp: number
  /** Tags */
  tags: Record<string, string>
  /** Context */
  context: ErrorContext
  /** Breadcrumbs */
  breadcrumbs: Breadcrumb[]
  /** Fingerprint for grouping */
  fingerprint: string
  /** Service name */
  service: string
  /** Environment */
  environment?: string
}

/**
 * Error group with multiple occurrences
 */
export interface ErrorGroup {
  /** Group fingerprint */
  fingerprint: string
  /** First occurrence */
  firstSeen: number
  /** Last occurrence */
  lastSeen: number
  /** Total occurrence count */
  count: number
  /** Sample error */
  sample: ErrorOccurrence
  /** All occurrences */
  occurrences: ErrorOccurrence[]
  /** Status */
  status: 'unresolved' | 'resolved' | 'ignored'
}

/**
 * Error report
 */
export interface ErrorReport {
  /** Report period start */
  startTime: number
  /** Report period end */
  endTime: number
  /** Total error count */
  totalErrors: number
  /** Error groups */
  groups: ErrorGroup[]
  /** Top errors by count */
  topErrors: Array<{
    fingerprint: string
    count: number
    message: string
    severity: ErrorSeverity
  }>
  /** Errors by severity */
  bySeverity: Record<ErrorSeverity, number>
  /** Errors by tag */
  byTag: Record<string, number>
}

/**
 * Error tracker options
 */
export interface ErrorTrackerOptions {
  /** Service name */
  service: string
  /** Environment (production, staging, etc) */
  environment?: string
  /** Enable/disable error tracking */
  enabled?: boolean
  /** Maximum breadcrumbs to keep */
  maxBreadcrumbs?: number
  /** Maximum occurrences per group */
  maxOccurrencesPerGroup?: number
  /** Auto-clear old errors (in ms) */
  autoClearAge?: number
  /** Default context */
  defaultContext?: ErrorContext
  /** Default tags */
  defaultTags?: Record<string, string>
}

/**
 * Main error tracker class
 */
export class ErrorTracker {
  private service: string
  private environment: string
  private enabled: boolean
  private maxBreadcrumbs: number
  private maxOccurrencesPerGroup: number
  private autoClearAge: number
  private breadcrumbs: Breadcrumb[] = []
  private context: ErrorContext = {}
  private defaultTags: Record<string, string>
  private groups = new Map<string, ErrorGroup>()
  private autoClearInterval?: NodeJS.Timeout

  constructor(options: ErrorTrackerOptions) {
    this.service = options.service
    this.environment = options.environment || 'development'
    this.enabled = options.enabled !== false
    this.maxBreadcrumbs = options.maxBreadcrumbs || 100
    this.maxOccurrencesPerGroup = options.maxOccurrencesPerGroup || 50
    this.autoClearAge = options.autoClearAge || 7 * 24 * 60 * 60 * 1000 // 7 days
    this.defaultTags = options.defaultTags || {}

    if (options.defaultContext) {
      this.context = { ...options.defaultContext }
    }

    // Start auto-clear interval
    if (this.autoClearAge > 0) {
      this.autoClearInterval = setInterval(
        () => this.clearOldErrors(),
        24 * 60 * 60 * 1000 // Daily
      )
    }
  }

  /**
   * Capture an exception
   */
  captureException(error: Error, options: ErrorOptions = {}): string {
    if (!this.enabled) return ''

    const occurrence = this.createOccurrence(
      error.message,
      {
        ...options,
        context: {
          ...options.context,
          error: {
            type: error.name,
            stack: error.stack
          }
        }
      },
      error
    )

    this.storeOccurrence(occurrence)
    return occurrence.id
  }

  /**
   * Capture a custom error message
   */
  captureError(message: string, options: ErrorOptions = {}): string {
    if (!this.enabled) return ''

    const occurrence = this.createOccurrence(message, options)
    this.storeOccurrence(occurrence)
    return occurrence.id
  }

  /**
   * Add a breadcrumb
   */
  addBreadcrumb(breadcrumb: Omit<Breadcrumb, 'timestamp'>): void {
    if (!this.enabled) return

    this.breadcrumbs.push({
      ...breadcrumb,
      timestamp: Date.now(),
      type: breadcrumb.type || BreadcrumbType.DEFAULT,
      level: breadcrumb.level || ErrorSeverity.INFO
    })

    // Trim to max breadcrumbs
    if (this.breadcrumbs.length > this.maxBreadcrumbs) {
      this.breadcrumbs = this.breadcrumbs.slice(-this.maxBreadcrumbs)
    }
  }

  /**
   * Set context information
   */
  setContext(key: string, value: any): void {
    this.context[key] = value
  }

  /**
   * Clear context
   */
  clearContext(): void {
    this.context = {}
  }

  /**
   * Set user context
   */
  setUser(user: ErrorContext['user']): void {
    this.context.user = user
  }

  /**
   * Clear user context
   */
  clearUser(): void {
    delete this.context.user
  }

  /**
   * Get error groups
   */
  getGroups(): ErrorGroup[] {
    return Array.from(this.groups.values())
  }

  /**
   * Get specific error group
   */
  getGroup(fingerprint: string): ErrorGroup | undefined {
    return this.groups.get(fingerprint)
  }

  /**
   * Update group status
   */
  updateGroupStatus(fingerprint: string, status: 'unresolved' | 'resolved' | 'ignored'): void {
    const group = this.groups.get(fingerprint)
    if (group) {
      group.status = status
    }
  }

  /**
   * Generate error report
   */
  generateReport(
    options: {
      startTime?: number
      endTime?: number
      groupBy?: 'message' | 'type' | 'fingerprint'
    } = {}
  ): ErrorReport {
    const startTime = options.startTime || 0
    const endTime = options.endTime || Date.now()

    // Filter groups by time range
    const filteredGroups = Array.from(this.groups.values()).filter(
      group => group.lastSeen >= startTime && group.firstSeen <= endTime
    )

    // Calculate statistics
    const totalErrors = filteredGroups.reduce((sum, group) => sum + group.count, 0)

    const bySeverity = filteredGroups.reduce(
      (acc, group) => {
        const severity = group.sample.severity
        acc[severity] = (acc[severity] || 0) + group.count
        return acc
      },
      {} as Record<ErrorSeverity, number>
    )

    const byTag = filteredGroups.reduce(
      (acc, group) => {
        Object.keys(group.sample.tags).forEach(tag => {
          acc[tag] = (acc[tag] || 0) + group.count
        })
        return acc
      },
      {} as Record<string, number>
    )

    const topErrors = filteredGroups
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
      .map(group => ({
        fingerprint: group.fingerprint,
        count: group.count,
        message: group.sample.message,
        severity: group.sample.severity
      }))

    return {
      startTime,
      endTime,
      totalErrors,
      groups: filteredGroups,
      topErrors,
      bySeverity,
      byTag
    }
  }

  /**
   * Export errors as JSON
   */
  exportJSON(): string {
    return JSON.stringify(Array.from(this.groups.values()), null, 2)
  }

  /**
   * Export in Sentry format
   */
  exportSentry(occurrence: ErrorOccurrence): any {
    return {
      event_id: occurrence.id,
      timestamp: Math.floor(occurrence.timestamp / 1000),
      level: occurrence.severity,
      message: occurrence.message,
      exception: occurrence.type
        ? {
            values: [
              {
                type: occurrence.type,
                value: occurrence.message,
                stacktrace: occurrence.stack
                  ? {
                      frames: this.parseStackTrace(occurrence.stack)
                    }
                  : undefined
              }
            ]
          }
        : undefined,
      tags: occurrence.tags,
      contexts: occurrence.context,
      breadcrumbs: {
        values: occurrence.breadcrumbs.map(b => ({
          type: b.type,
          category: b.category,
          message: b.message,
          data: b.data,
          timestamp: Math.floor(b.timestamp / 1000),
          level: b.level
        }))
      },
      environment: occurrence.environment,
      server_name: occurrence.service,
      fingerprint: [occurrence.fingerprint]
    }
  }

  /**
   * Clear old errors
   */
  clearOldErrors(): void {
    const cutoff = Date.now() - this.autoClearAge

    for (const [fingerprint, group] of this.groups) {
      if (group.lastSeen < cutoff) {
        this.groups.delete(fingerprint)
      }
    }
  }

  /**
   * Clear all errors
   */
  clear(): void {
    this.groups.clear()
    this.breadcrumbs = []
  }

  /**
   * Close and cleanup
   */
  close(): void {
    if (this.autoClearInterval) {
      clearInterval(this.autoClearInterval)
    }
  }

  /**
   * Create error occurrence
   */
  private createOccurrence(message: string, options: ErrorOptions, error?: Error): ErrorOccurrence {
    const id = this.generateId()
    const timestamp = options.timestamp || Date.now()
    const severity = options.severity || ErrorSeverity.ERROR
    const tags = { ...this.defaultTags, ...options.tags }
    const context = { ...this.context, ...options.context }
    const fingerprint = this.generateFingerprint(message, error?.stack, options.fingerprint)

    return {
      id,
      message,
      type: error?.name,
      stack: error?.stack,
      severity,
      timestamp,
      tags,
      context,
      breadcrumbs: [...this.breadcrumbs],
      fingerprint,
      service: this.service,
      environment: this.environment
    }
  }

  /**
   * Store error occurrence
   */
  private storeOccurrence(occurrence: ErrorOccurrence): void {
    const { fingerprint } = occurrence

    if (this.groups.has(fingerprint)) {
      const group = this.groups.get(fingerprint)!
      group.count++
      group.lastSeen = occurrence.timestamp

      // Add to occurrences (with limit)
      if (group.occurrences.length < this.maxOccurrencesPerGroup) {
        group.occurrences.push(occurrence)
      }
    } else {
      this.groups.set(fingerprint, {
        fingerprint,
        firstSeen: occurrence.timestamp,
        lastSeen: occurrence.timestamp,
        count: 1,
        sample: occurrence,
        occurrences: [occurrence],
        status: 'unresolved'
      })
    }
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
  }

  /**
   * Generate fingerprint for error grouping
   */
  private generateFingerprint(
    message: string,
    stack?: string,
    customFingerprint?: string[]
  ): string {
    if (customFingerprint && customFingerprint.length > 0) {
      return createHash('md5').update(customFingerprint.join('|')).digest('hex')
    }

    // Use stack trace for grouping if available
    const fingerprintSource = stack
      ? this.normalizeStackTrace(stack)
      : this.normalizeMessage(message)

    return createHash('md5').update(fingerprintSource).digest('hex')
  }

  /**
   * Normalize message for fingerprinting
   */
  private normalizeMessage(message: string): string {
    // Remove dynamic content like IDs, timestamps, etc.
    return message
      .replace(/\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi, '<UUID>')
      .replace(/\b\d+\b/g, '<NUMBER>')
      .replace(/\b0x[0-9a-f]+\b/gi, '<HEX>')
      .replace(/["']([^"']+)["']/g, '<STRING>')
  }

  /**
   * Normalize stack trace for fingerprinting
   */
  private normalizeStackTrace(stack: string): string {
    // Take first few lines of stack, normalize line numbers
    return stack
      .split('\n')
      .slice(0, 5)
      .map(line => line.replace(/:\d+:\d+/g, ':0:0'))
      .join('\n')
  }

  /**
   * Parse stack trace into frames
   */
  private parseStackTrace(stack: string): any[] {
    return stack
      .split('\n')
      .slice(1) // Skip error message line
      .map(line => {
        const match = line.match(/^\s*at\s+(.+?)\s+\((.+?):(\d+):(\d+)\)$/)
        if (match) {
          return {
            function: match[1],
            filename: match[2],
            lineno: parseInt(match[3], 10),
            colno: parseInt(match[4], 10),
            in_app: !match[2].includes('node_modules')
          }
        }
        return null
      })
      .filter(Boolean)
  }
}

/**
 * Default error tracker instance
 */
export const defaultErrorTracker = new ErrorTracker({
  service: process.env.SERVICE_NAME || 'unknown',
  environment: process.env.NODE_ENV || 'development',
  enabled: process.env.ERROR_TRACKING_ENABLED !== 'false'
})
