/**
 * MCP Tool Handler Component
 *
 * Standardized tool handling pattern for MCP servers.
 * Provides validation, error handling, rate limiting, and caching.
 *
 * @example
 * ```typescript
 * import { MCPToolHandler } from './mcp-tool-handler';
 *
 * const toolHandler = new MCPToolHandler({
 *   name: 'search',
 *   description: 'Search documents',
 *   inputSchema: z.object({ query: z.string() }),
 *   handler: async (args) => {
 *     // Tool implementation
 *     return results;
 *   },
 *   rateLimits: { maxCalls: 100, windowMs: 60000 },
 *   cache: { ttl: 300000 }
 * });
 *
 * const result = await toolHandler.execute({ query: 'test' });
 * ```
 */

import { z } from 'zod';

export interface ToolHandlerConfig {
  name: string;
  description: string;
  inputSchema: z.ZodSchema;
  handler: (args: any, context?: ToolExecutionContext) => Promise<any>;
  rateLimits?: RateLimitConfig;
  cache?: CacheConfig;
  timeout?: number; // milliseconds
  retries?: RetryConfig;
  validation?: ValidationConfig;
  metadata?: Record<string, any>;
}

export interface RateLimitConfig {
  maxCalls: number;
  windowMs: number;
  strategy?: 'sliding' | 'fixed';
}

export interface CacheConfig {
  ttl: number; // milliseconds
  keyGenerator?: (args: any) => string;
  enabled?: boolean;
}

export interface RetryConfig {
  maxAttempts: number;
  backoffMs: number;
  backoffStrategy?: 'linear' | 'exponential';
  retryableErrors?: string[];
}

export interface ValidationConfig {
  sanitizeInput?: boolean;
  validateOutput?: boolean;
  outputSchema?: z.ZodSchema;
}

export interface ToolExecutionContext {
  startTime: Date;
  attemptNumber: number;
  userId?: string;
  sessionId?: string;
  metadata?: Record<string, any>;
}

export interface ToolExecutionResult<T = any> {
  success: boolean;
  data?: T;
  error?: ToolExecutionError;
  metadata: {
    executionTime: number;
    cached: boolean;
    attemptNumber: number;
    timestamp: Date;
  };
}

export interface ToolExecutionError {
  code: string;
  message: string;
  retryable: boolean;
  details?: any;
}

/**
 * In-memory cache for tool results
 */
class ToolCache {
  private cache: Map<string, { value: any; expiresAt: number }> = new Map();

  set(key: string, value: any, ttl: number): void {
    const expiresAt = Date.now() + ttl;
    this.cache.set(key, { value, expiresAt });
  }

  get(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.value;
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

/**
 * Rate limiter for tool invocations
 */
class RateLimiter {
  private calls: Map<string, number[]> = new Map();

  constructor(private config: RateLimitConfig) {}

  canExecute(userId: string = 'default'): boolean {
    const now = Date.now();
    const windowStart = now - this.config.windowMs;

    // Get existing calls within window
    let userCalls = this.calls.get(userId) || [];
    userCalls = userCalls.filter(callTime => callTime > windowStart);

    // Check if under limit
    if (userCalls.length >= this.config.maxCalls) {
      return false;
    }

    // Record this call
    userCalls.push(now);
    this.calls.set(userId, userCalls);

    return true;
  }

  reset(userId?: string): void {
    if (userId) {
      this.calls.delete(userId);
    } else {
      this.calls.clear();
    }
  }

  getRemainingCalls(userId: string = 'default'): number {
    const now = Date.now();
    const windowStart = now - this.config.windowMs;
    const userCalls = (this.calls.get(userId) || []).filter(callTime => callTime > windowStart);
    return Math.max(0, this.config.maxCalls - userCalls.length);
  }
}

/**
 * MCP Tool Handler
 *
 * Handles tool execution with built-in features:
 * - Input validation
 * - Output validation
 * - Rate limiting
 * - Caching
 * - Retries with backoff
 * - Timeout handling
 * - Error handling
 * - Performance metrics
 */
export class MCPToolHandler<TInput = any, TOutput = any> {
  private config: Required<ToolHandlerConfig>;
  private cache?: ToolCache;
  private rateLimiter?: RateLimiter;
  private executionCount: number = 0;
  private errorCount: number = 0;
  private cacheHits: number = 0;

  constructor(config: ToolHandlerConfig) {
    this.config = {
      ...config,
      rateLimits: config.rateLimits,
      cache: config.cache,
      timeout: config.timeout || 30000,
      retries: config.retries || { maxAttempts: 1, backoffMs: 1000 },
      validation: config.validation || {},
      metadata: config.metadata || {}
    } as Required<ToolHandlerConfig>;

    // Initialize cache if enabled
    if (this.config.cache?.enabled !== false) {
      this.cache = new ToolCache();
    }

    // Initialize rate limiter if configured
    if (this.config.rateLimits) {
      this.rateLimiter = new RateLimiter(this.config.rateLimits);
    }
  }

  /**
   * Execute the tool with full handling
   */
  async execute(args: TInput, userId?: string): Promise<ToolExecutionResult<TOutput>> {
    const context: ToolExecutionContext = {
      startTime: new Date(),
      attemptNumber: 1,
      userId,
      metadata: {}
    };

    try {
      // Check rate limits
      if (this.rateLimiter && !this.rateLimiter.canExecute(userId)) {
        return this.createErrorResult('RATE_LIMIT_EXCEEDED', 'Rate limit exceeded', context, false);
      }

      // Validate input
      const validatedArgs = this.validateInput(args);

      // Check cache
      if (this.cache) {
        const cacheKey = this.generateCacheKey(validatedArgs);
        const cachedResult = this.cache.get(cacheKey);

        if (cachedResult !== null) {
          this.cacheHits++;
          return this.createSuccessResult(cachedResult, context, true);
        }
      }

      // Execute with retries
      const result = await this.executeWithRetries(validatedArgs, context);

      // Validate output
      const validatedResult = this.validateOutput(result);

      // Cache result
      if (this.cache && this.config.cache) {
        const cacheKey = this.generateCacheKey(validatedArgs);
        this.cache.set(cacheKey, validatedResult, this.config.cache.ttl);
      }

      this.executionCount++;
      return this.createSuccessResult(validatedResult, context, false);

    } catch (error) {
      this.errorCount++;
      return this.createErrorResult(
        error.code || 'EXECUTION_FAILED',
        error.message || 'Tool execution failed',
        context,
        error.retryable || false,
        error
      );
    }
  }

  /**
   * Execute with retry logic
   */
  private async executeWithRetries(args: TInput, context: ToolExecutionContext): Promise<TOutput> {
    let lastError: any;

    for (let attempt = 1; attempt <= this.config.retries.maxAttempts; attempt++) {
      context.attemptNumber = attempt;

      try {
        const result = await this.executeWithTimeout(args, context);
        return result;
      } catch (error) {
        lastError = error;

        // Check if error is retryable
        const isRetryable = this.isRetryableError(error);
        if (!isRetryable || attempt >= this.config.retries.maxAttempts) {
          throw error;
        }

        // Wait before retry
        const backoffTime = this.calculateBackoff(attempt);
        await this.sleep(backoffTime);
      }
    }

    throw lastError;
  }

  /**
   * Execute with timeout
   */
  private async executeWithTimeout(args: TInput, context: ToolExecutionContext): Promise<TOutput> {
    return Promise.race([
      this.config.handler(args, context),
      this.createTimeoutPromise(this.config.timeout)
    ]);
  }

  /**
   * Validate input using Zod schema
   */
  private validateInput(args: any): TInput {
    try {
      return this.config.inputSchema.parse(args);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
        throw {
          code: 'VALIDATION_ERROR',
          message: `Input validation failed: ${errors}`,
          retryable: false,
          details: error.errors
        };
      }
      throw error;
    }
  }

  /**
   * Validate output if schema is provided
   */
  private validateOutput(result: any): TOutput {
    if (this.config.validation.outputSchema) {
      try {
        return this.config.validation.outputSchema.parse(result);
      } catch (error) {
        if (error instanceof z.ZodError) {
          const errors = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
          throw {
            code: 'OUTPUT_VALIDATION_ERROR',
            message: `Output validation failed: ${errors}`,
            retryable: false,
            details: error.errors
          };
        }
        throw error;
      }
    }
    return result;
  }

  /**
   * Generate cache key
   */
  private generateCacheKey(args: TInput): string {
    if (this.config.cache?.keyGenerator) {
      return this.config.cache.keyGenerator(args);
    }
    return `${this.config.name}:${JSON.stringify(args)}`;
  }

  /**
   * Check if error is retryable
   */
  private isRetryableError(error: any): boolean {
    if (!this.config.retries.retryableErrors) {
      return error.retryable || false;
    }
    return this.config.retries.retryableErrors.includes(error.code);
  }

  /**
   * Calculate backoff time for retries
   */
  private calculateBackoff(attempt: number): number {
    const strategy = this.config.retries.backoffStrategy || 'exponential';

    if (strategy === 'exponential') {
      return this.config.retries.backoffMs * Math.pow(2, attempt - 1);
    } else {
      return this.config.retries.backoffMs * attempt;
    }
  }

  /**
   * Create timeout promise
   */
  private createTimeoutPromise<T>(ms: number): Promise<T> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject({
          code: 'TIMEOUT',
          message: `Tool execution timed out after ${ms}ms`,
          retryable: true
        });
      }, ms);
    });
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Create success result
   */
  private createSuccessResult(
    data: TOutput,
    context: ToolExecutionContext,
    cached: boolean
  ): ToolExecutionResult<TOutput> {
    return {
      success: true,
      data,
      metadata: {
        executionTime: Date.now() - context.startTime.getTime(),
        cached,
        attemptNumber: context.attemptNumber,
        timestamp: new Date()
      }
    };
  }

  /**
   * Create error result
   */
  private createErrorResult(
    code: string,
    message: string,
    context: ToolExecutionContext,
    retryable: boolean,
    details?: any
  ): ToolExecutionResult<TOutput> {
    return {
      success: false,
      error: {
        code,
        message,
        retryable,
        details
      },
      metadata: {
        executionTime: Date.now() - context.startTime.getTime(),
        cached: false,
        attemptNumber: context.attemptNumber,
        timestamp: new Date()
      }
    };
  }

  /**
   * Get tool statistics
   */
  getStats() {
    return {
      name: this.config.name,
      executionCount: this.executionCount,
      errorCount: this.errorCount,
      cacheHits: this.cacheHits,
      cacheSize: this.cache?.size() || 0,
      errorRate: this.executionCount > 0 ? this.errorCount / this.executionCount : 0
    };
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache?.clear();
    this.cacheHits = 0;
  }

  /**
   * Reset rate limiter
   */
  resetRateLimit(userId?: string): void {
    this.rateLimiter?.reset(userId);
  }

  /**
   * Get remaining rate limit calls
   */
  getRemainingCalls(userId?: string): number {
    return this.rateLimiter?.getRemainingCalls(userId) ?? Infinity;
  }
}

export default MCPToolHandler;
