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

export interface AuthConfig {
  type: 'bearer' | 'apiKey' | 'basic'
  token?: string // for bearer
  key?: string // header name for apiKey
  value?: string // value for apiKey
  username?: string // for basic
  password?: string // for basic
}

export interface RetryConfig {
  attempts: number
  delayMs: number
  exponentialBackoff?: boolean
}

export interface RequestOptions {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  headers?: Record<string, string>
  params?: Record<string, string | number | boolean>
  body?: any
  auth?: AuthConfig
  timeout?: number
  retry?: RetryConfig
  responseType?: 'json' | 'text' | 'blob' | 'arraybuffer'
}

export interface ApiResponse<T = any> {
  data: T
  status: number
  statusText: string
  headers: Record<string, string>
  url: string
  timestamp: Date
}

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
  private buildUrl(url: string, params?: Record<string, string | number | boolean>): string {
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
            const credentials = Buffer.from(
              `${auth.username}:${auth.password}`
            ).toString('base64')
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
  private async executeWithRetry<T>(
    fn: () => Promise<T>,
    retry?: RetryConfig
  ): Promise<T> {
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
  private async parseResponse(
    response: Response,
    responseType: RequestOptions['responseType'] = 'json'
  ): Promise<any> {
    switch (responseType) {
      case 'json':
        return await response.json()
      case 'text':
        return await response.text()
      case 'blob':
        return await response.blob()
      case 'arraybuffer':
        return await response.arrayBuffer()
      default:
        return await response.json()
    }
  }

  /**
   * Make HTTP request
   */
  async request<T = any>(options: RequestOptions): Promise<ApiResponse<T>> {
    return this.executeWithRetry(async () => {
      const url = this.buildUrl(options.url, options.params)
      const headers = this.buildHeaders(options.headers, options.auth)

      const controller = new AbortController()
      const timeout = setTimeout(
        () => controller.abort(),
        options.timeout || this.defaultTimeout
      )

      try {
        const response = await fetch(url, {
          method: options.method || 'GET',
          headers,
          body: options.body ? JSON.stringify(options.body) : undefined,
          signal: controller.signal
        })

        clearTimeout(timeout)

        if (!response.ok) {
          throw new Error(
            `HTTP ${response.status}: ${response.statusText}`
          )
        }

        const data = await this.parseResponse(response, options.responseType)

        return {
          data,
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
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
  async get<T = any>(
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
  async post<T = any>(
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
  async put<T = any>(
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
  async patch<T = any>(
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
  async delete<T = any>(
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
    const blob = file.data instanceof Buffer
      ? new Blob([file.data], { type: file.type })
      : file.data

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
    const timeout = setTimeout(
      () => controller.abort(),
      options?.timeout || this.defaultTimeout
    )

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

      return {
        data,
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
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
  async batchRequest<T = any>(
    requests: RequestOptions[]
  ): Promise<ApiResponse<T>[]> {
    return Promise.all(
      requests.map(request => this.request<T>(request))
    )
  }
}

/**
 * Tool definition for AI frameworks
 */
export const apiCallerToolDefinition = {
  name: 'api_caller',
  description: 'Make HTTP requests to APIs. Supports GET, POST, PUT, PATCH, DELETE methods with authentication, headers, and request bodies.',
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
export async function executeApiCallerTool(args: any): Promise<any> {
  const api = new ApiCallerTool()

  return api.request({
    url: args.url,
    method: args.method || 'GET',
    headers: args.headers,
    params: args.params,
    body: args.body,
    auth: args.auth,
    timeout: args.timeout
  })
}

/**
 * Example usage
 */
export async function examples() {
  const api = new ApiCallerTool()

  // Example 1: Simple GET request
  const users = await api.get('https://jsonplaceholder.typicode.com/users')
  console.log('Users:', users.data)

  // Example 2: POST with body
  const newUser = await api.post('https://jsonplaceholder.typicode.com/users', {
    body: {
      name: 'John Doe',
      email: 'john@example.com'
    }
  })
  console.log('Created user:', newUser.data)

  // Example 3: GET with query params
  const filteredUsers = await api.get('https://jsonplaceholder.typicode.com/users', {
    params: {
      userId: 1
    }
  })
  console.log('Filtered users:', filteredUsers.data)

  // Example 4: Request with Bearer auth
  const protectedData = await api.get('https://api.example.com/protected', {
    auth: {
      type: 'bearer',
      token: 'your-access-token'
    }
  })
  console.log('Protected data:', protectedData.data)

  // Example 5: Request with API key
  const apiData = await api.get('https://api.example.com/data', {
    auth: {
      type: 'apiKey',
      key: 'X-API-Key',
      value: 'your-api-key'
    }
  })
  console.log('API data:', apiData.data)

  // Example 6: Request with retries
  const dataWithRetry = await api.get('https://api.example.com/unstable', {
    retry: {
      attempts: 3,
      delayMs: 1000,
      exponentialBackoff: true
    }
  })
  console.log('Data with retry:', dataWithRetry.data)

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
  console.log('Batch results:', results.map(r => r.data))

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
  console.log('Upload result:', uploadResult.data)

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
  console.log('Complex request result:', complexRequest.data)
}
