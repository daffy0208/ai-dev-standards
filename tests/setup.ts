/**
 * Test Setup
 *
 * Global setup and utilities for tests.
 */

import { beforeAll, afterAll, afterEach } from 'vitest'

// Set test environment variables
process.env.NODE_ENV = 'test'

// Mock environment variables for testing
beforeAll(() => {
  // Mock required env vars
  process.env.SUPABASE_URL = 'https://test.supabase.co'
  process.env.SUPABASE_ANON_KEY = 'test-anon-key'
  process.env.OPENAI_API_KEY = 'sk-test-key'
  process.env.ANTHROPIC_API_KEY = 'sk-ant-test-key'
  process.env.STRIPE_SECRET_KEY = 'sk_test_key'
  process.env.RESEND_API_KEY = 're_test_key'
  process.env.PINECONE_API_KEY = 'test-pinecone-key'
  process.env.PINECONE_ENVIRONMENT = 'test-env'
  process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test'
})

// Cleanup after all tests
afterAll(() => {
  // Cleanup global resources
})

// Reset mocks after each test
afterEach(() => {
  // Clear any mocks or spies
})

// Global test utilities
export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export const mockFetch = (response: any, status = 200) => {
  global.fetch = vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    json: async () => response,
    text: async () => JSON.stringify(response),
    headers: new Headers(),
    url: 'https://test.example.com'
  })
}

export const mockFetchError = (error: Error) => {
  global.fetch = vi.fn().mockRejectedValue(error)
}

// Helper to create temporary test directory
export const createTempDir = async () => {
  const { mkdtemp } = await import('fs/promises')
  const { tmpdir } = await import('os')
  const { join } = await import('path')
  return await mkdtemp(join(tmpdir(), 'ai-dev-test-'))
}

// Helper to cleanup temp directory
export const cleanupTempDir = async (dir: string) => {
  const { rm } = await import('fs/promises')
  try {
    await rm(dir, { recursive: true, force: true })
  } catch (error) {
    console.warn('Failed to cleanup temp dir:', error)
  }
}
