/**
 * Structured Logger Tool
 *
 * A comprehensive logging solution with multiple severity levels, output targets,
 * and contextual logging capabilities. Designed for both development and production
 * environments with minimal performance overhead.
 *
 * @example
 * ```typescript
 * // Basic usage
 * const logger = createLogger({ level: 'info', service: 'api' });
 * logger.info('Server started', { port: 3000 });
 * logger.error('Connection failed', { error: err });
 *
 * // Contextual logging
 * const requestLogger = logger.child({ requestId: '123', userId: 'abc' });
 * requestLogger.info('Processing request');
 *
 * // Multiple outputs
 * logger.addOutput(new FileOutput('./logs/app.log'));
 * logger.addOutput(new RemoteOutput('https://logs.example.com/ingest'));
 * ```
 *
 * @example Express Integration
 * ```typescript
 * import express from 'express';
 * import { createLogger } from './logger-tool';
 *
 * const app = express();
 * const logger = createLogger({ level: 'info', service: 'api' });
 *
 * // Request logging middleware
 * app.use((req, res, next) => {
 *   const start = Date.now();
 *   const requestLogger = logger.child({
 *     requestId: req.id,
 *     method: req.method,
 *     path: req.path
 *   });
 *
 *   res.on('finish', () => {
 *     requestLogger.info('Request completed', {
 *       statusCode: res.statusCode,
 *       duration: Date.now() - start
 *     });
 *   });
 *
 *   req.logger = requestLogger;
 *   next();
 * });
 * ```
 *
 * @example React Integration
 * ```typescript
 * import { createLogger } from './logger-tool';
 *
 * const logger = createLogger({ level: 'warn', service: 'frontend' });
 *
 * class ErrorBoundary extends React.Component {
 *   componentDidCatch(error: Error, info: React.ErrorInfo) {
 *     logger.error('React error boundary caught error', {
 *       error: error.message,
 *       stack: error.stack,
 *       componentStack: info.componentStack
 *     });
 *   }
 * }
 * ```
 */

import { writeFile, appendFile, stat, rename } from 'fs/promises'
import { existsSync } from 'fs'
import { join, dirname } from 'path'
import { mkdir } from 'fs/promises'

/**
 * Log severity levels in order of importance
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4
}

/**
 * String representation of log levels
 */
export type LogLevelString = 'debug' | 'info' | 'warn' | 'error' | 'fatal'

/**
 * Structured log entry with metadata
 */
export interface LogEntry {
  /** Timestamp in ISO format */
  timestamp: string
  /** Log severity level */
  level: LogLevelString
  /** Primary log message */
  message: string
  /** Service or application name */
  service?: string
  /** Additional structured data */
  metadata?: Record<string, any>
  /** Contextual tags for filtering */
  tags?: string[]
  /** Error object if present */
  error?: {
    name: string
    message: string
    stack?: string
  }
}

/**
 * Logger configuration options
 */
export interface LoggerOptions {
  /** Minimum log level to output */
  level?: LogLevelString
  /** Service or application name */
  service?: string
  /** Enable/disable logging */
  enabled?: boolean
  /** Output format */
  format?: 'json' | 'pretty'
  /** Contextual metadata to include in all logs */
  context?: Record<string, any>
  /** Tags to apply to all logs */
  tags?: string[]
  /** Custom outputs */
  outputs?: LogOutput[]
}

/**
 * Output interface for log destinations
 */
export interface LogOutput {
  /** Write a log entry to the output */
  write(entry: LogEntry): Promise<void> | void
  /** Close/cleanup the output */
  close?(): Promise<void> | void
}

/**
 * Console output with colored formatting
 */
export class ConsoleOutput implements LogOutput {
  private colors = {
    debug: '\x1b[36m', // Cyan
    info: '\x1b[32m', // Green
    warn: '\x1b[33m', // Yellow
    error: '\x1b[31m', // Red
    fatal: '\x1b[35m', // Magenta
    reset: '\x1b[0m'
  }

  constructor(private format: 'json' | 'pretty' = 'pretty') {}

  write(entry: LogEntry): void {
    if (this.format === 'json') {
      console.log(JSON.stringify(entry))
    } else {
      this.prettyPrint(entry)
    }
  }

  private prettyPrint(entry: LogEntry): void {
    const color = this.colors[entry.level]
    const reset = this.colors.reset
    const timestamp = new Date(entry.timestamp).toLocaleTimeString()
    const level = entry.level.toUpperCase().padEnd(5)
    const service = entry.service ? `[${entry.service}]` : ''

    let output = `${color}${timestamp} ${level}${reset} ${service} ${entry.message}`

    if (entry.metadata && Object.keys(entry.metadata).length > 0) {
      output += `\n  ${JSON.stringify(entry.metadata, null, 2).split('\n').join('\n  ')}`
    }

    if (entry.error) {
      output += `\n  ${color}Error: ${entry.error.message}${reset}`
      if (entry.error.stack) {
        output += `\n  ${entry.error.stack.split('\n').slice(1).join('\n  ')}`
      }
    }

    if (entry.tags && entry.tags.length > 0) {
      output += `\n  Tags: ${entry.tags.join(', ')}`
    }

    console.log(output)
  }
}

/**
 * File output with log rotation
 */
export class FileOutput implements LogOutput {
  private maxSize: number
  private maxFiles: number
  private currentSize: number = 0

  constructor(
    private filePath: string,
    options: {
      maxSize?: number // Max file size in bytes (default: 10MB)
      maxFiles?: number // Max number of rotated files (default: 5)
    } = {}
  ) {
    this.maxSize = options.maxSize || 10 * 1024 * 1024 // 10MB
    this.maxFiles = options.maxFiles || 5
    this.initializeFile()
  }

  private async initializeFile(): Promise<void> {
    try {
      const dir = dirname(this.filePath)
      if (!existsSync(dir)) {
        await mkdir(dir, { recursive: true })
      }

      if (existsSync(this.filePath)) {
        const stats = await stat(this.filePath)
        this.currentSize = stats.size
      }
    } catch (error) {
      console.error('Failed to initialize log file:', error)
    }
  }

  async write(entry: LogEntry): Promise<void> {
    try {
      const line = JSON.stringify(entry) + '\n'
      const lineSize = Buffer.byteLength(line)

      // Check if rotation is needed
      if (this.currentSize + lineSize > this.maxSize) {
        await this.rotate()
        this.currentSize = 0
      }

      await appendFile(this.filePath, line)
      this.currentSize += lineSize
    } catch (error) {
      console.error('Failed to write to log file:', error)
    }
  }

  private async rotate(): Promise<void> {
    try {
      // Delete oldest file
      const oldestFile = `${this.filePath}.${this.maxFiles}`
      if (existsSync(oldestFile)) {
        await rename(oldestFile, oldestFile + '.tmp')
      }

      // Rotate existing files
      for (let i = this.maxFiles - 1; i > 0; i--) {
        const oldFile = `${this.filePath}.${i}`
        const newFile = `${this.filePath}.${i + 1}`
        if (existsSync(oldFile)) {
          await rename(oldFile, newFile)
        }
      }

      // Rotate current file
      await rename(this.filePath, `${this.filePath}.1`)
    } catch (error) {
      console.error('Failed to rotate log file:', error)
    }
  }
}

/**
 * Remote output for sending logs to external services
 */
export class RemoteOutput implements LogOutput {
  private buffer: LogEntry[] = []
  private flushInterval: NodeJS.Timeout | null = null
  private flushSize: number

  constructor(
    private endpoint: string,
    options: {
      batchSize?: number // Number of logs to batch before sending
      flushInterval?: number // Interval to flush in ms (default: 5000)
      headers?: Record<string, string> // Custom headers
    } = {}
  ) {
    this.flushSize = options.batchSize || 100

    const interval = options.flushInterval || 5000
    this.flushInterval = setInterval(() => this.flush(), interval)
  }

  write(entry: LogEntry): void {
    this.buffer.push(entry)

    if (this.buffer.length >= this.flushSize) {
      this.flush()
    }
  }

  private async flush(): Promise<void> {
    if (this.buffer.length === 0) return

    const batch = [...this.buffer]
    this.buffer = []

    try {
      await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(batch)
      })
    } catch (error) {
      console.error('Failed to send logs to remote endpoint:', error)
      // Re-add to buffer on failure
      this.buffer.unshift(...batch)
    }
  }

  async close(): Promise<void> {
    if (this.flushInterval) {
      clearInterval(this.flushInterval)
    }
    await this.flush()
  }
}

/**
 * Main Logger class
 */
export class Logger {
  private level: LogLevel
  private service?: string
  private enabled: boolean
  private format: 'json' | 'pretty'
  private context: Record<string, any>
  private tags: string[]
  private outputs: LogOutput[]

  constructor(options: LoggerOptions = {}) {
    this.level = this.parseLevel(options.level || 'info')
    this.service = options.service
    this.enabled = options.enabled !== false
    this.format = options.format || 'pretty'
    this.context = options.context || {}
    this.tags = options.tags || []
    this.outputs = options.outputs || [new ConsoleOutput(this.format)]
  }

  /**
   * Parse string level to enum
   */
  private parseLevel(level: LogLevelString): LogLevel {
    const levels: Record<LogLevelString, LogLevel> = {
      debug: LogLevel.DEBUG,
      info: LogLevel.INFO,
      warn: LogLevel.WARN,
      error: LogLevel.ERROR,
      fatal: LogLevel.FATAL
    }
    return levels[level]
  }

  /**
   * Convert enum level to string
   */
  private levelToString(level: LogLevel): LogLevelString {
    const levels: Record<LogLevel, LogLevelString> = {
      [LogLevel.DEBUG]: 'debug',
      [LogLevel.INFO]: 'info',
      [LogLevel.WARN]: 'warn',
      [LogLevel.ERROR]: 'error',
      [LogLevel.FATAL]: 'fatal'
    }
    return levels[level]
  }

  /**
   * Create log entry
   */
  private createEntry(
    level: LogLevel,
    message: string,
    metadata?: Record<string, any>,
    error?: Error
  ): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: this.levelToString(level),
      message,
      service: this.service,
      metadata: { ...this.context, ...metadata },
      tags: this.tags
    }

    if (error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: error.stack
      }
    }

    return entry
  }

  /**
   * Write log entry to all outputs
   */
  private async writeToOutputs(entry: LogEntry): Promise<void> {
    const promises = this.outputs.map(output => output.write(entry))
    await Promise.all(promises)
  }

  /**
   * Log at specific level
   */
  private log(
    level: LogLevel,
    message: string,
    metadata?: Record<string, any>,
    error?: Error
  ): void {
    if (!this.enabled || level < this.level) return

    const entry = this.createEntry(level, message, metadata, error)

    // Write asynchronously without blocking
    this.writeToOutputs(entry).catch(err => {
      console.error('Failed to write log:', err)
    })
  }

  /**
   * Debug level logging
   */
  debug(message: string, metadata?: Record<string, any>): void {
    this.log(LogLevel.DEBUG, message, metadata)
  }

  /**
   * Info level logging
   */
  info(message: string, metadata?: Record<string, any>): void {
    this.log(LogLevel.INFO, message, metadata)
  }

  /**
   * Warning level logging
   */
  warn(message: string, metadata?: Record<string, any>): void {
    this.log(LogLevel.WARN, message, metadata)
  }

  /**
   * Error level logging
   */
  error(message: string, metadata?: Record<string, any>, error?: Error): void {
    this.log(LogLevel.ERROR, message, metadata, error)
  }

  /**
   * Fatal level logging
   */
  fatal(message: string, metadata?: Record<string, any>, error?: Error): void {
    this.log(LogLevel.FATAL, message, metadata, error)
  }

  /**
   * Add output destination
   */
  addOutput(output: LogOutput): void {
    this.outputs.push(output)
  }

  /**
   * Set minimum log level
   */
  setLevel(level: LogLevelString): void {
    this.level = this.parseLevel(level)
  }

  /**
   * Create child logger with additional context
   */
  child(context: Record<string, any>, tags?: string[]): Logger {
    return new Logger({
      level: this.levelToString(this.level),
      service: this.service,
      enabled: this.enabled,
      format: this.format,
      context: { ...this.context, ...context },
      tags: tags ? [...this.tags, ...tags] : this.tags,
      outputs: this.outputs
    })
  }

  /**
   * Close all outputs
   */
  async close(): Promise<void> {
    const promises = this.outputs.filter(output => output.close).map(output => output.close!())
    await Promise.all(promises)
  }
}

/**
 * Factory function to create logger instance
 */
export function createLogger(options?: LoggerOptions): Logger {
  return new Logger(options)
}

/**
 * Default logger instance
 */
export const defaultLogger = createLogger({
  level: (process.env.LOG_LEVEL as LogLevelString) || 'info',
  service: process.env.SERVICE_NAME,
  format: process.env.NODE_ENV === 'production' ? 'json' : 'pretty'
})
