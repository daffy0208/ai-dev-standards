/**
 * Colorful Console Logger
 *
 * A simple, beautiful logger for CLI applications with ADHD-friendly formatting.
 *
 * Features:
 * - Color-coded log levels
 * - Emoji icons for quick scanning
 * - Timestamp support
 * - JSON pretty-printing
 * - Progress indicators
 * - Group/indent support
 *
 * Usage:
 * ```typescript
 * import { logger } from './logger'
 *
 * logger.info('Starting process...')
 * logger.success('Process complete!')
 * logger.error('Something went wrong', error)
 * logger.debug({ data: 'object' })
 * ```
 */

export type LogLevel = 'debug' | 'info' | 'success' | 'warn' | 'error'

export interface LoggerConfig {
  level?: LogLevel
  timestamp?: boolean
  colors?: boolean
  emoji?: boolean
}

const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',

  // Text colors
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  gray: '\x1b[90m',

  // Background colors
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m'
}

const LEVELS = {
  debug: 0,
  info: 1,
  success: 2,
  warn: 3,
  error: 4
}

const LEVEL_STYLES = {
  debug: { color: COLORS.gray, emoji: '🔍', label: 'DEBUG' },
  info: { color: COLORS.blue, emoji: 'ℹ️', label: 'INFO' },
  success: { color: COLORS.green, emoji: '✅', label: 'SUCCESS' },
  warn: { color: COLORS.yellow, emoji: '⚠️', label: 'WARN' },
  error: { color: COLORS.red, emoji: '❌', label: 'ERROR' }
}

export class Logger {
  private config: Required<LoggerConfig>
  private indentLevel: number = 0

  constructor(config: LoggerConfig = {}) {
    this.config = {
      level: config.level || 'info',
      timestamp: config.timestamp !== false,
      colors: config.colors !== false,
      emoji: config.emoji !== false
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return LEVELS[level] >= LEVELS[this.config.level]
  }

  private format(level: LogLevel, message: string, data?: any): string {
    const style = LEVEL_STYLES[level]
    const parts: string[] = []

    // Timestamp
    if (this.config.timestamp) {
      const time = new Date().toISOString().split('T')[1].slice(0, 8)
      parts.push(this.colorize(COLORS.gray, time))
    }

    // Level with emoji
    const levelStr = this.config.emoji
      ? `${style.emoji} ${style.label}`
      : style.label
    parts.push(this.colorize(style.color, levelStr))

    // Indentation
    const indent = '  '.repeat(this.indentLevel)

    // Message
    parts.push(indent + message)

    // Data (if provided)
    if (data !== undefined) {
      const dataStr = typeof data === 'object'
        ? '\n' + JSON.stringify(data, null, 2)
        : String(data)
      parts.push(this.colorize(COLORS.gray, dataStr))
    }

    return parts.join(' ')
  }

  private colorize(color: string, text: string): string {
    if (!this.config.colors) return text
    return `${color}${text}${COLORS.reset}`
  }

  private log(level: LogLevel, message: string, data?: any) {
    if (!this.shouldLog(level)) return
    console.log(this.format(level, message, data))
  }

  debug(message: string, data?: any) {
    this.log('debug', message, data)
  }

  info(message: string, data?: any) {
    this.log('info', message, data)
  }

  success(message: string, data?: any) {
    this.log('success', message, data)
  }

  warn(message: string, data?: any) {
    this.log('warn', message, data)
  }

  error(message: string, error?: Error | any) {
    this.log('error', message, error instanceof Error ? error.message : error)

    if (error instanceof Error && error.stack) {
      console.error(this.colorize(COLORS.dim, error.stack))
    }
  }

  // Utility methods

  group(title: string) {
    this.info(this.colorize(COLORS.bright, `▼ ${title}`))
    this.indentLevel++
  }

  groupEnd() {
    this.indentLevel = Math.max(0, this.indentLevel - 1)
  }

  line() {
    console.log(this.colorize(COLORS.gray, '─'.repeat(50)))
  }

  header(title: string) {
    this.line()
    console.log(this.colorize(COLORS.bright + COLORS.cyan, `  ${title}`))
    this.line()
  }

  spinner(message: string): () => void {
    const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']
    let i = 0
    const interval = setInterval(() => {
      process.stdout.write(`\r${frames[i]} ${message}`)
      i = (i + 1) % frames.length
    }, 80)

    return () => {
      clearInterval(interval)
      process.stdout.write('\r')
    }
  }

  progress(current: number, total: number, message?: string) {
    const percent = Math.round((current / total) * 100)
    const filled = Math.round(percent / 2)
    const bar = '█'.repeat(filled) + '░'.repeat(50 - filled)

    const msg = message ? ` ${message}` : ''
    process.stdout.write(`\r[${bar}] ${percent}%${msg}`)

    if (current >= total) {
      process.stdout.write('\n')
    }
  }

  table(data: Record<string, any>[]) {
    if (data.length === 0) return

    console.table(data)
  }

  json(data: any) {
    console.log(JSON.stringify(data, null, 2))
  }
}

// Singleton instance
export const logger = new Logger()

// Example usage
export function example() {
  logger.header('Logger Examples')

  logger.debug('Debug message', { userId: 123 })
  logger.info('Starting process...')
  logger.success('Process completed!')
  logger.warn('Low disk space')
  logger.error('Connection failed', new Error('Network timeout'))

  logger.line()

  logger.group('Nested operations')
  logger.info('Step 1')
  logger.info('Step 2')
  logger.success('Done!')
  logger.groupEnd()

  logger.line()

  // Spinner example
  const stop = logger.spinner('Loading data...')
  setTimeout(() => {
    stop()
    logger.success('Data loaded!')
  }, 2000)

  // Progress example
  for (let i = 0; i <= 100; i += 10) {
    logger.progress(i, 100, 'Processing...')
  }

  // Table example
  logger.table([
    { name: 'Alice', age: 30, role: 'Developer' },
    { name: 'Bob', age: 25, role: 'Designer' },
    { name: 'Charlie', age: 35, role: 'Manager' }
  ])
}
