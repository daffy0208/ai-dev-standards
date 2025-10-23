/**
 * Vitest Configuration
 *
 * Fast, modern testing framework for TypeScript projects.
 */

import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    // Test environment
    environment: 'node',

    // Global test utilities
    globals: true,

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.test.ts',
        '**/*.spec.ts',
        '**/examples.ts',
        'CLI/node_modules/',
        '**/*.config.ts',
        '**/dist/',
        '**/build/'
      ],
      // Target: 80% coverage
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80
      }
    },

    // Test setup
    setupFiles: ['./tests/setup.ts'],

    // Test patterns
    include: [
      'tests/**/*.test.ts',
      'tests/**/*.spec.ts'
    ],

    // Timeout for tests
    testTimeout: 10000,

    // Hooks timeout
    hookTimeout: 10000,

    // Reporter
    reporter: ['verbose', 'json', 'html'],

    // Parallel execution
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false
      }
    }
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
      '@integrations': path.resolve(__dirname, './INTEGRATIONS'),
      '@components': path.resolve(__dirname, './COMPONENTS'),
      '@utils': path.resolve(__dirname, './UTILS'),
      '@tools': path.resolve(__dirname, './TOOLS')
    }
  }
})
