import type {
  ApiResponse,
  AuthConfig,
  QueryParams,
  RequestOptions,
  RetryConfig
} from '../types/http'

const logInfo = (...messages: unknown[]): void => {
  const formatted = messages.map(message =>
    typeof message === 'string' ? message : JSON.stringify(message, null, 2)
  )
  process.stdout.write(`${formatted.join(' ')}\n`)
}

/**
 * API Caller Tool
 *
 * AI tool for making HTTP requests to APIs.
 *
 * Features:
 * - All HTTP methods (GET, POST, PUT, PATCH, DELETE)
 * - Authentication (Bearer, API Key, Basic)
 * - Request body (JSON, form data, multipart)
 * - Headers and query parameters
 * - Response parsing (JSON, text, blob)
 * - Error handling and retries
 * - Rate limiting
 * - Timeout handling
 *
 * Usage:
 * ```typescript
 * import { ApiCallerTool } from './api-caller-tool'
 *
 * const api = new ApiCallerTool()
 *
 * // GET request
 * const data = await api.get('https://api.example.com/users')
 *
 * // POST with auth
 * const result = await api.post('https://api.example.com/users', {
 *   body: { name: 'John', email: 'john@example.com' },
 *   auth: { type: 'bearer', token: 'your-token' }
 * })
 *
 * // Complex request
 * const response = await api.request({
 *   url: 'https://api.example.com/data',
 *   method: 'POST',
 *   headers: { 'X-Custom': 'value' },
 *   body: { key: 'value' },
 *   auth: { type: 'apiKey', key: 'X-API-Key', value: 'secret' },
 *   retry: { attempts: 3, delayMs: 1000 }
 * })
 * ```
 */

export class ApiCallerTool {
  private defaultTimeout: number = 30000
  private defaultRetry: RetryConfig = {
    attempts: 1,
    delayMs: 1000,
    exponentialBackoff: false
  }

  /**
   * Build URL with query parameters
   */
  private buildUrl(url: string, params?: QueryParams): string {
    if (!params || Object.keys(params).length === 0) {
      return url
    }

    const urlObj = new URL(url)
    Object.entries(params).forEach(([key, value]) => {
      urlObj.searchParams.append(key, String(value))
    })

    return urlObj.toString()
  }

  /**
   * Build headers with auth
   */
  private buildHeaders(
    headers?: Record<string, string>,
    auth?: AuthConfig
  ): Record<string, string> {
    const finalHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers
    }

    if (auth) {
      switch (auth.type) {
        case 'bearer':
          if (auth.token) {
            finalHeaders['Authorization'] = `Bearer ${auth.token}`
          }
          break

        case 'apiKey':
          if (auth.key && auth.value) {
            finalHeaders[auth.key] = auth.value
          }
          break

        case 'basic':
          if (auth.username && auth.password) {
            const credentials = Buffer.from(`${auth.username}:${auth.password}`).toString('base64')
            finalHeaders['Authorization'] = `Basic ${credentials}`
          }
          break
      }
    }

    return finalHeaders
  }

  /**
   * Execute request with retries
   */
  private async executeWithRetry<T>(fn: () => Promise<T>, retry?: RetryConfig): Promise<T> {
    const config = { ...this.defaultRetry, ...retry }
    let lastError: Error | null = null

    for (let attempt = 1; attempt <= config.attempts; attempt++) {
      try {
        return await fn()
      } catch (error) {
        lastError = error as Error
        console.error(`Request attempt ${attempt} failed:`, error)

        // Don't retry on last attempt
        if (attempt < config.attempts) {
          const delay = config.exponentialBackoff
            ? config.delayMs * Math.pow(2, attempt - 1)
            : config.delayMs

          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }
    }

    throw lastError || new Error('Request failed')
  }

  /**
   * Parse response based on type
   */
  private async parseResponse<T>(
    response: Response,
    responseType: RequestOptions['responseType'] = 'json'
  ): Promise<T> {
    switch (responseType) {
      case 'json':
        return (await response.json()) as T
      case 'text':
        return (await response.text()) as T
      case 'blob':
        return (await response.blob()) as T
      case 'arraybuffer':
        return (await response.arrayBuffer()) as T
      default:
        return (await response.json()) as T
    }
  }

  /**
   * Make HTTP request
   */
  async request<T = unknown>(options: RequestOptions): Promise<ApiResponse<T>> {
    return this.executeWithRetry(async () => {
      const url = this.buildUrl(options.url, options.params)
      const headers = this.buildHeaders(options.headers, options.auth)

      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), options.timeout || this.defaultTimeout)

      try {
        const response = await fetch(url, {
          method: options.method || 'GET',
          headers,
          body: options.body ? JSON.stringify(options.body) : undefined,
          signal: controller.signal
        })

        clearTimeout(timeout)

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        const data = await this.parseResponse<T>(response, options.responseType)

        // Convert Headers to plain object
        const responseHeaders: Record<string, string> = {}
        response.headers.forEach((value, key) => {
          responseHeaders[key] = value
        })

        return {
          data,
          status: response.status,
          statusText: response.statusText,
          headers: responseHeaders,
          url: response.url,
          timestamp: new Date()
        }
      } catch (error) {
        clearTimeout(timeout)

        if (error instanceof Error) {
          if (error.name === 'AbortError') {
            throw new Error(`Request timeout after ${options.timeout || this.defaultTimeout}ms`)
          }
        }

        throw error
      }
    }, options.retry)
  }

  /**
   * GET request
   */
  async get<T = unknown>(
    url: string,
    options?: Omit<RequestOptions, 'url' | 'method' | 'body'>
  ): Promise<ApiResponse<T>> {
    return this.request<T>({
      ...options,
      url,
      method: 'GET'
    })
  }

  /**
   * POST request
   */
  async post<T = unknown>(
    url: string,
    options?: Omit<RequestOptions, 'url' | 'method'>
  ): Promise<ApiResponse<T>> {
    return this.request<T>({
      ...options,
      url,
      method: 'POST'
    })
  }

  /**
   * PUT request
   */
  async put<T = unknown>(
    url: string,
    options?: Omit<RequestOptions, 'url' | 'method'>
  ): Promise<ApiResponse<T>> {
    return this.request<T>({
      ...options,
      url,
      method: 'PUT'
    })
  }

  /**
   * PATCH request
   */
  async patch<T = unknown>(
    url: string,
    options?: Omit<RequestOptions, 'url' | 'method'>
  ): Promise<ApiResponse<T>> {
    return this.request<T>({
      ...options,
      url,
      method: 'PATCH'
    })
  }

  /**
   * DELETE request
   */
  async delete<T = unknown>(
    url: string,
    options?: Omit<RequestOptions, 'url' | 'method' | 'body'>
  ): Promise<ApiResponse<T>> {
    return this.request<T>({
      ...options,
      url,
      method: 'DELETE'
    })
  }

  /**
   * Upload file (multipart form data)
   */
  async uploadFile(
    url: string,
    file: { name: string; data: Buffer | Blob; type?: string },
    options?: {
      fields?: Record<string, string>
      auth?: AuthConfig
      timeout?: number
    }
  ): Promise<ApiResponse> {
    const formData = new FormData()

    // Add file
    const blob = Buffer.isBuffer(file.data)
      ? new Blob([Buffer.from(file.data)], { type: file.type })
      : (file.data as Blob)

    formData.append('file', blob, file.name)

    // Add additional fields
    if (options?.fields) {
      Object.entries(options.fields).forEach(([key, value]) => {
        formData.append(key, value)
      })
    }

    // Build headers (without Content-Type for multipart)
    const headers = this.buildHeaders({}, options?.auth)
    delete headers['Content-Type'] // Let browser set boundary

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), options?.timeout || this.defaultTimeout)

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
        signal: controller.signal
      })

      clearTimeout(timeout)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      // Convert Headers to plain object
      const responseHeaders: Record<string, string> = {}
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value
      })

      return {
        data,
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
        url: response.url,
        timestamp: new Date()
      }
    } catch (error) {
      clearTimeout(timeout)
      throw error
    }
  }

  /**
   * Make multiple parallel requests
   */
  async batchRequest<T = unknown>(requests: RequestOptions[]): Promise<ApiResponse<T>[]> {
    return Promise.all(requests.map(request => this.request<T>(request)))
  }
}

/**
 * Tool definition for AI frameworks
 */
export const apiCallerToolDefinition = {
  name: 'api_caller',
  description:
    'Make HTTP requests to APIs. Supports GET, POST, PUT, PATCH, DELETE methods with authentication, headers, and request bodies.',
  parameters: {
    type: 'object',
    properties: {
      url: {
        type: 'string',
        description: 'The API endpoint URL'
      },
      method: {
        type: 'string',
        enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
        description: 'HTTP method',
        default: 'GET'
      },
      headers: {
        type: 'object',
        description: 'HTTP headers',
        additionalProperties: { type: 'string' }
      },
      params: {
        type: 'object',
        description: 'URL query parameters',
        additionalProperties: { type: ['string', 'number', 'boolean'] }
      },
      body: {
        type: 'object',
        description: 'Request body (for POST, PUT, PATCH)'
      },
      auth: {
        type: 'object',
        description: 'Authentication configuration',
        properties: {
          type: {
            type: 'string',
            enum: ['bearer', 'apiKey', 'basic']
          },
          token: { type: 'string' },
          key: { type: 'string' },
          value: { type: 'string' },
          username: { type: 'string' },
          password: { type: 'string' }
        },
        required: ['type']
      },
      timeout: {
        type: 'number',
        description: 'Request timeout in milliseconds'
      }
    },
    required: ['url']
  }
}

/**
 * Execute tool (for AI frameworks)
 */
export async function executeApiCallerTool(args: RequestOptions): Promise<ApiResponse<unknown>> {
  const api = new ApiCallerTool()

  return api.request({
    ...args,
    method: args.method || 'GET'
  })
}

/**
 * Example usage
 */
export async function examples() {
  const api = new ApiCallerTool()

  // Example 1: Simple GET request
  const users = await api.get('https://jsonplaceholder.typicode.com/users')
  logInfo('Users:', users.data)

  // Example 2: POST with body
  const newUser = await api.post('https://jsonplaceholder.typicode.com/users', {
    body: {
      name: 'John Doe',
      email: 'john@example.com'
    }
  })
  logInfo('Created user:', newUser.data)

  // Example 3: GET with query params
  const filteredUsers = await api.get('https://jsonplaceholder.typicode.com/users', {
    params: {
      userId: 1
    }
  })
  logInfo('Filtered users:', filteredUsers.data)

  // Example 4: Request with Bearer auth
  const protectedData = await api.get('https://api.example.com/protected', {
    auth: {
      type: 'bearer',
      token: 'your-access-token'
    }
  })
  logInfo('Protected data:', protectedData.data)

  // Example 5: Request with API key
  const apiData = await api.get('https://api.example.com/data', {
    auth: {
      type: 'apiKey',
      key: 'X-API-Key',
      value: 'your-api-key'
    }
  })
  logInfo('API data:', apiData.data)

  // Example 6: Request with retries
  const dataWithRetry = await api.get('https://api.example.com/unstable', {
    retry: {
      attempts: 3,
      delayMs: 1000,
      exponentialBackoff: true
    }
  })
  logInfo('Data with retry:', dataWithRetry.data)

  // Example 7: Batch requests
  const results = await api.batchRequest([
    {
      url: 'https://jsonplaceholder.typicode.com/users/1',
      method: 'GET'
    },
    {
      url: 'https://jsonplaceholder.typicode.com/posts/1',
      method: 'GET'
    },
    {
      url: 'https://jsonplaceholder.typicode.com/comments/1',
      method: 'GET'
    }
  ])
  logInfo(
    'Batch results:',
    results.map(r => r.data)
  )

  // Example 8: Upload file
  const fileBuffer = Buffer.from('Hello, World!')
  const uploadResult = await api.uploadFile(
    'https://api.example.com/upload',
    {
      name: 'test.txt',
      data: fileBuffer,
      type: 'text/plain'
    },
    {
      fields: {
        description: 'Test file'
      },
      auth: {
        type: 'bearer',
        token: 'your-token'
      }
    }
  )
  logInfo('Upload result:', uploadResult.data)

  // Example 9: Complex request with all options
  const complexRequest = await api.request({
    url: 'https://api.example.com/complex',
    method: 'POST',
    headers: {
      'X-Custom-Header': 'value',
      'Accept-Language': 'en-US'
    },
    params: {
      page: 1,
      limit: 10
    },
    body: {
      data: 'payload'
    },
    auth: {
      type: 'bearer',
      token: 'your-token'
    },
    timeout: 15000,
    retry: {
      attempts: 2,
      delayMs: 500
    }
  })
  logInfo('Complex request result:', complexRequest.data)
}
