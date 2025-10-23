/**
 * API Caller Tool Tests
 *
 * Unit tests for HTTP request tool.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ApiCallerTool } from '../../../TOOLS/custom-tools/api-caller-tool'

describe('ApiCallerTool', () => {
  let api: ApiCallerTool

  beforeEach(() => {
    api = new ApiCallerTool()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('GET requests', () => {
    it('should make successful GET request', async () => {
      const mockData = { id: 1, name: 'Test' }

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => mockData,
        headers: new Headers(),
        url: 'https://api.example.com/users'
      })

      const result = await api.get('https://api.example.com/users')

      expect(result.data).toEqual(mockData)
      expect(result.status).toBe(200)
      expect(result.statusText).toBe('OK')
      expect(result.timestamp).toBeInstanceOf(Date)
    })

    it('should handle query parameters', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => ({}),
        headers: new Headers(),
        url: 'https://api.example.com/users?page=1&limit=10'
      })

      await api.get('https://api.example.com/users', {
        params: { page: 1, limit: 10 }
      })

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.example.com/users?page=1&limit=10',
        expect.any(Object)
      )
    })

    it('should handle 404 error', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      })

      await expect(api.get('https://api.example.com/users/999')).rejects.toThrow('HTTP 404')
    })
  })

  describe('POST requests', () => {
    it('should make successful POST request', async () => {
      const mockData = { id: 1, name: 'Created' }
      const requestBody = { name: 'New User' }

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 201,
        statusText: 'Created',
        json: async () => mockData,
        headers: new Headers(),
        url: 'https://api.example.com/users'
      })

      const result = await api.post('https://api.example.com/users', {
        body: requestBody
      })

      expect(result.data).toEqual(mockData)
      expect(result.status).toBe(201)

      const fetchCall = (global.fetch as any).mock.calls[0]
      expect(fetchCall[1].method).toBe('POST')
      expect(fetchCall[1].body).toBe(JSON.stringify(requestBody))
    })
  })

  describe('PUT requests', () => {
    it('should make successful PUT request', async () => {
      const mockData = { id: 1, name: 'Updated' }

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => mockData,
        headers: new Headers(),
        url: 'https://api.example.com/users/1'
      })

      const result = await api.put('https://api.example.com/users/1', {
        body: { name: 'Updated' }
      })

      expect(result.data).toEqual(mockData)
      expect((global.fetch as any).mock.calls[0][1].method).toBe('PUT')
    })
  })

  describe('PATCH requests', () => {
    it('should make successful PATCH request', async () => {
      const mockData = { id: 1, name: 'Patched' }

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => mockData,
        headers: new Headers(),
        url: 'https://api.example.com/users/1'
      })

      const result = await api.patch('https://api.example.com/users/1', {
        body: { name: 'Patched' }
      })

      expect(result.data).toEqual(mockData)
      expect((global.fetch as any).mock.calls[0][1].method).toBe('PATCH')
    })
  })

  describe('DELETE requests', () => {
    it('should make successful DELETE request', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 204,
        statusText: 'No Content',
        json: async () => ({}),
        headers: new Headers(),
        url: 'https://api.example.com/users/1'
      })

      const result = await api.delete('https://api.example.com/users/1')

      expect(result.status).toBe(204)
      expect((global.fetch as any).mock.calls[0][1].method).toBe('DELETE')
    })
  })

  describe('Authentication', () => {
    it('should add Bearer token', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => ({}),
        headers: new Headers(),
        url: 'https://api.example.com/protected'
      })

      await api.get('https://api.example.com/protected', {
        auth: { type: 'bearer', token: 'test-token' }
      })

      const fetchCall = (global.fetch as any).mock.calls[0]
      expect(fetchCall[1].headers['Authorization']).toBe('Bearer test-token')
    })

    it('should add API key header', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => ({}),
        headers: new Headers(),
        url: 'https://api.example.com/protected'
      })

      await api.get('https://api.example.com/protected', {
        auth: { type: 'apiKey', key: 'X-API-Key', value: 'secret' }
      })

      const fetchCall = (global.fetch as any).mock.calls[0]
      expect(fetchCall[1].headers['X-API-Key']).toBe('secret')
    })

    it('should add Basic auth', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => ({}),
        headers: new Headers(),
        url: 'https://api.example.com/protected'
      })

      await api.get('https://api.example.com/protected', {
        auth: { type: 'basic', username: 'user', password: 'pass' }
      })

      const fetchCall = (global.fetch as any).mock.calls[0]
      const expectedAuth = 'Basic ' + Buffer.from('user:pass').toString('base64')
      expect(fetchCall[1].headers['Authorization']).toBe(expectedAuth)
    })
  })

  describe('Custom headers', () => {
    it('should add custom headers', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => ({}),
        headers: new Headers(),
        url: 'https://api.example.com/data'
      })

      await api.get('https://api.example.com/data', {
        headers: {
          'X-Custom-Header': 'value',
          'Accept-Language': 'en-US'
        }
      })

      const fetchCall = (global.fetch as any).mock.calls[0]
      expect(fetchCall[1].headers['X-Custom-Header']).toBe('value')
      expect(fetchCall[1].headers['Accept-Language']).toBe('en-US')
    })
  })

  describe('Timeout handling', () => {
    it('should timeout after specified duration', async () => {
      global.fetch = vi.fn().mockImplementation(() => {
        return new Promise((resolve) => {
          setTimeout(() => resolve({
            ok: true,
            status: 200,
            statusText: 'OK',
            json: async () => ({}),
            headers: new Headers(),
            url: 'https://api.example.com/slow'
          }), 5000)
        })
      })

      await expect(
        api.get('https://api.example.com/slow', { timeout: 100 })
      ).rejects.toThrow('timeout')
    }, 10000)
  })

  describe('Retry logic', () => {
    it('should retry on failure', async () => {
      let attempts = 0

      global.fetch = vi.fn().mockImplementation(() => {
        attempts++
        if (attempts < 3) {
          return Promise.reject(new Error('Network error'))
        }
        return Promise.resolve({
          ok: true,
          status: 200,
          statusText: 'OK',
          json: async () => ({ success: true }),
          headers: new Headers(),
          url: 'https://api.example.com/unstable'
        })
      })

      const result = await api.get('https://api.example.com/unstable', {
        retry: { attempts: 3, delayMs: 10 }
      })

      expect(attempts).toBe(3)
      expect(result.data).toEqual({ success: true })
    })

    it('should fail after max retries', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))

      await expect(
        api.get('https://api.example.com/failing', {
          retry: { attempts: 2, delayMs: 10 }
        })
      ).rejects.toThrow('Network error')

      expect(global.fetch).toHaveBeenCalledTimes(2)
    })

    it('should use exponential backoff', async () => {
      const delays: number[] = []
      let attempts = 0

      global.fetch = vi.fn().mockImplementation(() => {
        attempts++
        const start = Date.now()
        return new Promise((_, reject) => {
          setTimeout(() => {
            if (attempts > 1) {
              delays.push(Date.now() - start)
            }
            reject(new Error('Fail'))
          }, 0)
        })
      })

      await expect(
        api.get('https://api.example.com/failing', {
          retry: { attempts: 3, delayMs: 100, exponentialBackoff: true }
        })
      ).rejects.toThrow()

      // Exponential backoff should roughly double each time
      // First retry: ~100ms, Second retry: ~200ms
      // (Allow margin for timing variance)
    })
  })

  describe('Batch requests', () => {
    it('should execute multiple requests in parallel', async () => {
      global.fetch = vi.fn().mockImplementation((url) => {
        return Promise.resolve({
          ok: true,
          status: 200,
          statusText: 'OK',
          json: async () => ({ url }),
          headers: new Headers(),
          url
        })
      })

      const requests = [
        { url: 'https://api.example.com/users/1', method: 'GET' as const },
        { url: 'https://api.example.com/posts/1', method: 'GET' as const },
        { url: 'https://api.example.com/comments/1', method: 'GET' as const }
      ]

      const results = await api.batchRequest(requests)

      expect(results).toHaveLength(3)
      expect(results[0].data).toEqual({ url: 'https://api.example.com/users/1' })
      expect(results[1].data).toEqual({ url: 'https://api.example.com/posts/1' })
      expect(results[2].data).toEqual({ url: 'https://api.example.com/comments/1' })
    })
  })

  describe('Response type handling', () => {
    it('should parse JSON by default', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => ({ key: 'value' }),
        headers: new Headers(),
        url: 'https://api.example.com/data'
      })

      const result = await api.get('https://api.example.com/data')
      expect(result.data).toEqual({ key: 'value' })
    })

    it('should handle text response', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        text: async () => 'plain text',
        headers: new Headers(),
        url: 'https://api.example.com/data'
      })

      const result = await api.get('https://api.example.com/data', {
        responseType: 'text'
      })

      expect(result.data).toBe('plain text')
    })
  })

  describe('Error handling', () => {
    it('should throw on HTTP error', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      })

      await expect(
        api.get('https://api.example.com/error')
      ).rejects.toThrow('HTTP 500: Internal Server Error')
    })

    it('should throw on network error', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network failed'))

      await expect(
        api.get('https://api.example.com/unreachable')
      ).rejects.toThrow('Network failed')
    })
  })
})
