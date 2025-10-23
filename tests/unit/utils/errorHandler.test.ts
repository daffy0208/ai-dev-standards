/**
 * Error Handler Tests
 *
 * Unit tests for API error handling.
 */

import { describe, it, expect } from 'vitest'
import {
  ApiError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  ServerError,
  handleApiError,
  isApiError
} from '../../../UTILS/api/errorHandler'

describe('ApiError Classes', () => {
  describe('ApiError', () => {
    it('should create error with status code', () => {
      const error = new ApiError(400, 'Bad Request')
      expect(error.statusCode).toBe(400)
      expect(error.message).toBe('Bad Request')
      expect(error.name).toBe('ApiError')
    })

    it('should accept code and details', () => {
      const error = new ApiError(400, 'Bad Request', 'INVALID_INPUT', { field: 'email' })
      expect(error.code).toBe('INVALID_INPUT')
      expect(error.details).toEqual({ field: 'email' })
    })
  })

  describe('ValidationError', () => {
    it('should create validation error', () => {
      const error = new ValidationError('Invalid email')
      expect(error.statusCode).toBe(400)
      expect(error.message).toBe('Invalid email')
      expect(error.code).toBe('VALIDATION_ERROR')
    })

    it('should accept validation errors array', () => {
      const errors = [
        { field: 'email', message: 'Invalid email' },
        { field: 'password', message: 'Too short' }
      ]
      const error = new ValidationError('Validation failed', errors)
      expect(error.details).toEqual(errors)
    })
  })

  describe('AuthenticationError', () => {
    it('should create 401 error', () => {
      const error = new AuthenticationError('Please log in')
      expect(error.statusCode).toBe(401)
      expect(error.code).toBe('AUTHENTICATION_ERROR')
    })
  })

  describe('AuthorizationError', () => {
    it('should create 403 error', () => {
      const error = new AuthorizationError('Access denied')
      expect(error.statusCode).toBe(403)
      expect(error.code).toBe('AUTHORIZATION_ERROR')
    })
  })

  describe('NotFoundError', () => {
    it('should create 404 error', () => {
      const error = new NotFoundError('User')
      expect(error.statusCode).toBe(404)
      expect(error.message).toBe('User not found')
      expect(error.code).toBe('NOT_FOUND')
    })

    it('should accept custom message', () => {
      const error = new NotFoundError('User', 'Custom message')
      expect(error.message).toBe('Custom message')
    })
  })

  describe('ConflictError', () => {
    it('should create 409 error', () => {
      const error = new ConflictError('Email already exists')
      expect(error.statusCode).toBe(409)
      expect(error.code).toBe('CONFLICT')
    })
  })

  describe('RateLimitError', () => {
    it('should create 429 error', () => {
      const error = new RateLimitError(60)
      expect(error.statusCode).toBe(429)
      expect(error.message).toBe('Too many requests. Please try again in 60 seconds.')
      expect(error.details).toEqual({ retryAfter: 60 })
    })
  })

  describe('ServerError', () => {
    it('should create 500 error', () => {
      const error = new ServerError('Database connection failed')
      expect(error.statusCode).toBe(500)
      expect(error.code).toBe('SERVER_ERROR')
    })
  })
})

describe('handleApiError', () => {
  it('should handle ApiError', () => {
    const error = new ApiError(400, 'Bad Request', 'INVALID_INPUT')
    const response = handleApiError(error)

    expect(response.status).toBe(400)

    // Parse response body
    return response.json().then(data => {
      expect(data.error.message).toBe('Bad Request')
      expect(data.error.code).toBe('INVALID_INPUT')
      expect(data.error.statusCode).toBe(400)
    })
  })

  it('should handle ValidationError with details', () => {
    const validationErrors = [
      { field: 'email', message: 'Invalid' }
    ]
    const error = new ValidationError('Validation failed', validationErrors)
    const response = handleApiError(error)

    expect(response.status).toBe(400)

    return response.json().then(data => {
      expect(data.error.details).toEqual(validationErrors)
    })
  })

  it('should handle generic Error', () => {
    const error = new Error('Something went wrong')
    const response = handleApiError(error)

    expect(response.status).toBe(500)

    return response.json().then(data => {
      expect(data.error.message).toBe('Something went wrong')
      expect(data.error.statusCode).toBe(500)
    })
  })

  it('should handle unknown error', () => {
    const error = 'string error'
    const response = handleApiError(error)

    expect(response.status).toBe(500)

    return response.json().then(data => {
      expect(data.error.message).toBe('Internal server error')
      expect(data.error.statusCode).toBe(500)
    })
  })

  it('should handle RateLimitError with retry header', () => {
    const error = new RateLimitError(60)
    const response = handleApiError(error)

    expect(response.status).toBe(429)
    expect(response.headers.get('Retry-After')).toBe('60')
  })
})

describe('isApiError', () => {
  it('should return true for ApiError', () => {
    const error = new ApiError(400, 'Bad Request')
    expect(isApiError(error)).toBe(true)
  })

  it('should return true for subclasses', () => {
    expect(isApiError(new ValidationError('Invalid'))).toBe(true)
    expect(isApiError(new AuthenticationError('Unauthorized'))).toBe(true)
    expect(isApiError(new NotFoundError('User'))).toBe(true)
  })

  it('should return false for generic Error', () => {
    const error = new Error('Generic error')
    expect(isApiError(error)).toBe(false)
  })

  it('should return false for non-errors', () => {
    expect(isApiError(null)).toBe(false)
    expect(isApiError(undefined)).toBe(false)
    expect(isApiError('string')).toBe(false)
    expect(isApiError({})).toBe(false)
  })
})

describe('Error Serialization', () => {
  it('should serialize ApiError to JSON', () => {
    const error = new ApiError(400, 'Bad Request', 'INVALID_INPUT', { field: 'email' })
    const response = handleApiError(error)

    return response.json().then(data => {
      expect(data).toHaveProperty('error')
      expect(data.error).toHaveProperty('message')
      expect(data.error).toHaveProperty('code')
      expect(data.error).toHaveProperty('statusCode')
      expect(data.error).toHaveProperty('details')
    })
  })

  it('should not expose stack traces in production', () => {
    const originalEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'production'

    const error = new ApiError(500, 'Server error')
    const response = handleApiError(error)

    return response.json().then(data => {
      expect(data.error).not.toHaveProperty('stack')
      process.env.NODE_ENV = originalEnv
    })
  })
})

describe('HTTP Status Codes', () => {
  it('should map errors to correct status codes', () => {
    const testCases = [
      { error: new ValidationError('Invalid'), expectedStatus: 400 },
      { error: new AuthenticationError('Unauthorized'), expectedStatus: 401 },
      { error: new AuthorizationError('Forbidden'), expectedStatus: 403 },
      { error: new NotFoundError('User'), expectedStatus: 404 },
      { error: new ConflictError('Exists'), expectedStatus: 409 },
      { error: new RateLimitError(60), expectedStatus: 429 },
      { error: new ServerError('Error'), expectedStatus: 500 }
    ]

    testCases.forEach(({ error, expectedStatus }) => {
      const response = handleApiError(error)
      expect(response.status).toBe(expectedStatus)
    })
  })
})
