/**
 * MCP Resource Handler Component
 *
 * Standardized resource handling pattern for MCP servers.
 * Handles resource access, versioning, caching, and content delivery.
 *
 * @example
 * ```typescript
 * import { MCPResourceHandler } from './mcp-resource-handler';
import * as crypto from 'crypto';

 * const resourceHandler = new MCPResourceHandler({
 *   uri: 'myapp://docs/readme',
 *   name: 'README',
 *   description: 'Application documentation',
 *   mimeType: 'text/markdown',
 *   handler: async () => {
 *     return fs.readFileSync('README.md', 'utf-8');
 *   },
 *   cache: { enabled: true, ttl: 600000 },
 *   versioning: { enabled: true }
 * });
 *
 * const content = await resourceHandler.get();
 * ```
 */

export interface ResourceHandlerConfig {
  uri: string
  name: string
  description: string
  mimeType?: string
  handler: (version?: string) => Promise<string | Buffer>
  cache?: ResourceCacheConfig
  versioning?: ResourceVersioningConfig
  metadata?: Record<string, any>
  accessControl?: AccessControlConfig
}

export interface ResourceCacheConfig {
  enabled: boolean
  ttl?: number // milliseconds
  maxSize?: number // bytes
}

export interface ResourceVersioningConfig {
  enabled: boolean
  currentVersion?: string
  availableVersions?: string[]
}

export interface AccessControlConfig {
  requiresAuth?: boolean
  allowedRoles?: string[]
  rateLimits?: {
    maxRequests: number
    windowMs: number
  }
}

export interface ResourceMetadata {
  uri: string
  name: string
  description: string
  mimeType?: string
  version?: string
  size?: number
  lastModified?: Date
  etag?: string
}

export interface ResourceAccessResult {
  success: boolean
  content?: string | Buffer
  metadata: ResourceMetadata
  cached: boolean
  accessTime: number
  error?: {
    code: string
    message: string
  }
}

/**
 * Resource cache with size limiting
 */
class ResourceCache {
  private cache: Map<
    string,
    { content: string | Buffer; size: number; expiresAt: number; etag: string }
  > = new Map()
  private currentSize: number = 0

  constructor(private maxSize?: number) {}

  set(key: string, content: string | Buffer, ttl: number): string {
    const size = Buffer.isBuffer(content) ? content.length : Buffer.byteLength(content, 'utf-8')
    const expiresAt = Date.now() + ttl
    const etag = this.generateEtag(content)

    // Check if adding this would exceed max size
    if (this.maxSize && this.currentSize + size > this.maxSize) {
      this.evictOldest()
    }

    this.cache.set(key, { content, size, expiresAt, etag })
    this.currentSize += size

    return etag
  }

  get(key: string): { content: string | Buffer; etag: string } | null {
    const entry = this.cache.get(key)
    if (!entry) return null

    if (Date.now() > entry.expiresAt) {
      this.delete(key)
      return null
    }

    return { content: entry.content, etag: entry.etag }
  }

  delete(key: string): void {
    const entry = this.cache.get(key)
    if (entry) {
      this.currentSize -= entry.size
      this.cache.delete(key)
    }
  }

  clear(): void {
    this.cache.clear()
    this.currentSize = 0
  }

  private evictOldest(): void {
    let oldestKey: string | null = null
    let oldestTime = Infinity

    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiresAt < oldestTime) {
        oldestTime = entry.expiresAt
        oldestKey = key
      }
    }

    if (oldestKey) {
      this.delete(oldestKey)
    }
  }

  private generateEtag(content: string | Buffer): string {
    const hash = crypto.createHash('md5')
    hash.update(content)
    return hash.digest('hex')
  }

  getStats() {
    return {
      entryCount: this.cache.size,
      currentSize: this.currentSize,
      maxSize: this.maxSize
    }
  }
}

/**
 * MCP Resource Handler
 *
 * Manages resource access with:
 * - Content caching
 * - Version management
 * - Access control
 * - ETags for cache validation
 * - Content compression
 * - Rate limiting
 */
export class MCPResourceHandler {
  private config: ResourceHandlerConfig
  private cache?: ResourceCache
  private accessLog: Array<{ timestamp: Date; userId?: string; version?: string }> = []
  private versions: Map<string, { content: string | Buffer; timestamp: Date }> = new Map()

  constructor(config: ResourceHandlerConfig) {
    this.config = config

    // Initialize cache if enabled
    if (this.config.cache?.enabled) {
      this.cache = new ResourceCache(this.config.cache.maxSize)
    }

    // Initialize versioning
    if (this.config.versioning?.enabled) {
      const currentVersion = this.config.versioning.currentVersion || '1.0.0'
      this.config.versioning.currentVersion = currentVersion
      this.config.versioning.availableVersions = this.config.versioning.availableVersions || [
        currentVersion
      ]
    }
  }

  /**
   * Get resource content
   */
  async get(options?: {
    version?: string
    userId?: string
    ifNoneMatch?: string // ETag for conditional requests
  }): Promise<ResourceAccessResult> {
    const startTime = Date.now()

    try {
      // Check access control
      if (this.config.accessControl) {
        const canAccess = await this.checkAccess(options?.userId)
        if (!canAccess) {
          return this.createErrorResult('ACCESS_DENIED', 'Access denied to resource', startTime)
        }
      }

      // Determine version
      const version = options?.version || this.config.versioning?.currentVersion

      // Check cache
      if (this.cache) {
        const cacheKey = this.getCacheKey(version)
        const cached = this.cache.get(cacheKey)

        if (cached) {
          // Check ETag for conditional requests
          if (options?.ifNoneMatch === cached.etag) {
            return this.createNotModifiedResult(cached.etag, startTime)
          }

          // Log access
          this.logAccess(options?.userId, version)

          return this.createSuccessResult(cached.content, true, cached.etag, version, startTime)
        }
      }

      // Fetch resource content
      const content = await this.config.handler(version)

      // Cache the result
      let etag: string | undefined
      if (this.cache && this.config.cache) {
        const cacheKey = this.getCacheKey(version)
        etag = this.cache.set(cacheKey, content, this.config.cache.ttl || 300000)
      }

      // Store version if versioning is enabled
      if (this.config.versioning?.enabled && version) {
        this.versions.set(version, { content, timestamp: new Date() })
      }

      // Log access
      this.logAccess(options?.userId, version)

      return this.createSuccessResult(content, false, etag, version, startTime)
    } catch (error) {
      return this.createErrorResult(
        'RESOURCE_ACCESS_FAILED',
        error.message || 'Failed to access resource',
        startTime
      )
    }
  }

  /**
   * Get resource metadata without content
   */
  async getMetadata(version?: string): Promise<ResourceMetadata> {
    const currentVersion = version || this.config.versioning?.currentVersion

    return {
      uri: this.config.uri,
      name: this.config.name,
      description: this.config.description,
      mimeType: this.config.mimeType,
      version: currentVersion,
      lastModified: this.getLastModified(currentVersion)
    }
  }

  /**
   * List available versions
   */
  listVersions(): string[] {
    if (!this.config.versioning?.enabled) {
      return []
    }
    return this.config.versioning.availableVersions || []
  }

  /**
   * Create a new version
   */
  async createVersion(version: string, content: string | Buffer): Promise<void> {
    if (!this.config.versioning?.enabled) {
      throw new Error('Versioning is not enabled for this resource')
    }

    // Store version
    this.versions.set(version, { content, timestamp: new Date() })

    // Update available versions
    if (!this.config.versioning.availableVersions) {
      this.config.versioning.availableVersions = []
    }

    if (!this.config.versioning.availableVersions.includes(version)) {
      this.config.versioning.availableVersions.push(version)
    }

    // Cache the new version
    if (this.cache && this.config.cache) {
      const cacheKey = this.getCacheKey(version)
      this.cache.set(cacheKey, content, this.config.cache.ttl || 300000)
    }
  }

  /**
   * Set current version
   */
  setCurrentVersion(version: string): void {
    if (!this.config.versioning?.enabled) {
      throw new Error('Versioning is not enabled for this resource')
    }

    const availableVersions = this.config.versioning.availableVersions || []
    if (!availableVersions.includes(version)) {
      throw new Error(`Version ${version} not found`)
    }

    this.config.versioning.currentVersion = version
  }

  /**
   * Clear cache for this resource
   */
  clearCache(version?: string): void {
    if (!this.cache) return

    if (version) {
      const cacheKey = this.getCacheKey(version)
      this.cache.delete(cacheKey)
    } else {
      this.cache.clear()
    }
  }

  /**
   * Get access statistics
   */
  getStats() {
    const now = Date.now()
    const last24h = this.accessLog.filter(log => now - log.timestamp.getTime() < 86400000)

    return {
      uri: this.config.uri,
      totalAccesses: this.accessLog.length,
      accessesLast24h: last24h.length,
      cacheStats: this.cache?.getStats() || null,
      versions: this.versions.size,
      currentVersion: this.config.versioning?.currentVersion
    }
  }

  /**
   * Check access permissions
   */
  private async checkAccess(userId?: string): Promise<boolean> {
    const accessControl = this.config.accessControl

    if (!accessControl) {
      return true
    }

    // Check rate limits
    if (accessControl.rateLimits) {
      const recentAccesses = this.accessLog.filter(log => {
        return (
          log.userId === userId &&
          Date.now() - log.timestamp.getTime() < accessControl.rateLimits!.windowMs
        )
      })

      if (recentAccesses.length >= accessControl.rateLimits.maxRequests) {
        return false
      }
    }

    // Additional access control logic can be added here
    // (e.g., role-based access control, authentication checks)

    return true
  }

  /**
   * Log resource access
   */
  private logAccess(userId?: string, version?: string): void {
    this.accessLog.push({
      timestamp: new Date(),
      userId,
      version
    })

    // Keep only last 10000 entries
    if (this.accessLog.length > 10000) {
      this.accessLog = this.accessLog.slice(-10000)
    }
  }

  /**
   * Get cache key for version
   */
  private getCacheKey(version?: string): string {
    return version ? `${this.config.uri}:${version}` : this.config.uri
  }

  /**
   * Get last modified timestamp
   */
  private getLastModified(version?: string): Date | undefined {
    if (version && this.versions.has(version)) {
      return this.versions.get(version)!.timestamp
    }
    return undefined
  }

  /**
   * Create success result
   */
  private createSuccessResult(
    content: string | Buffer,
    cached: boolean,
    etag?: string,
    version?: string,
    startTime?: number
  ): ResourceAccessResult {
    const size = Buffer.isBuffer(content) ? content.length : Buffer.byteLength(content, 'utf-8')

    return {
      success: true,
      content,
      metadata: {
        uri: this.config.uri,
        name: this.config.name,
        description: this.config.description,
        mimeType: this.config.mimeType,
        version,
        size,
        lastModified: this.getLastModified(version),
        etag
      },
      cached,
      accessTime: startTime ? Date.now() - startTime : 0
    }
  }

  /**
   * Create not modified result (304)
   */
  private createNotModifiedResult(etag: string, startTime: number): ResourceAccessResult {
    return {
      success: true,
      metadata: {
        uri: this.config.uri,
        name: this.config.name,
        description: this.config.description,
        mimeType: this.config.mimeType,
        etag
      },
      cached: true,
      accessTime: Date.now() - startTime
    }
  }

  /**
   * Create error result
   */
  private createErrorResult(
    code: string,
    message: string,
    startTime: number
  ): ResourceAccessResult {
    return {
      success: false,
      metadata: {
        uri: this.config.uri,
        name: this.config.name,
        description: this.config.description,
        mimeType: this.config.mimeType
      },
      cached: false,
      accessTime: Date.now() - startTime,
      error: {
        code,
        message
      }
    }
  }
}

export default MCPResourceHandler
