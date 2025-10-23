/**
 * Validation Schemas Tests
 *
 * Unit tests for Zod validation schemas.
 */

import { describe, it, expect } from 'vitest'
import {
  emailSchema,
  passwordSchema,
  strongPasswordSchema,
  urlSchema,
  phoneSchema,
  slugSchema,
  uuidSchema,
  positiveIntSchema,
  percentageSchema,
  priceSchema,
  userCreateSchema,
  userLoginSchema,
  passwordUpdateSchema,
  paginationSchema,
  validate,
  validateSafe
} from '../../../UTILS/validation/schemas'

describe('Basic Field Schemas', () => {
  describe('emailSchema', () => {
    it('should validate correct email', () => {
      expect(emailSchema.parse('test@example.com')).toBe('test@example.com')
    })

    it('should lowercase email', () => {
      expect(emailSchema.parse('TEST@EXAMPLE.COM')).toBe('test@example.com')
    })

    it('should trim whitespace', () => {
      expect(emailSchema.parse('  test@example.com  ')).toBe('test@example.com')
    })

    it('should reject invalid email', () => {
      expect(() => emailSchema.parse('invalid-email')).toThrow()
      expect(() => emailSchema.parse('test@')).toThrow()
      expect(() => emailSchema.parse('@example.com')).toThrow()
    })
  })

  describe('passwordSchema', () => {
    it('should validate strong password', () => {
      const validPassword = 'Password123'
      expect(passwordSchema.parse(validPassword)).toBe(validPassword)
    })

    it('should reject password without uppercase', () => {
      expect(() => passwordSchema.parse('password123')).toThrow(/uppercase/)
    })

    it('should reject password without lowercase', () => {
      expect(() => passwordSchema.parse('PASSWORD123')).toThrow(/lowercase/)
    })

    it('should reject password without number', () => {
      expect(() => passwordSchema.parse('PasswordABC')).toThrow(/number/)
    })

    it('should reject short password', () => {
      expect(() => passwordSchema.parse('Pass1')).toThrow(/8 characters/)
    })
  })

  describe('strongPasswordSchema', () => {
    it('should validate strong password with special char', () => {
      const validPassword = 'Password123!'
      expect(strongPasswordSchema.parse(validPassword)).toBe(validPassword)
    })

    it('should reject password without special character', () => {
      expect(() => strongPasswordSchema.parse('Password123')).toThrow(/special character/)
    })

    it('should require 12 characters', () => {
      expect(() => strongPasswordSchema.parse('Pass123!')).toThrow(/12 characters/)
    })
  })

  describe('urlSchema', () => {
    it('should validate HTTP URL', () => {
      expect(urlSchema.parse('http://example.com')).toBe('http://example.com')
    })

    it('should validate HTTPS URL', () => {
      expect(urlSchema.parse('https://example.com')).toBe('https://example.com')
    })

    it('should trim whitespace', () => {
      expect(urlSchema.parse('  https://example.com  ')).toBe('https://example.com')
    })

    it('should reject invalid URL', () => {
      expect(() => urlSchema.parse('not-a-url')).toThrow()
      expect(() => urlSchema.parse('example.com')).toThrow()
    })
  })

  describe('phoneSchema', () => {
    it('should validate E.164 format', () => {
      expect(phoneSchema.parse('+12125551234')).toBe('+12125551234')
      expect(phoneSchema.parse('+442071234567')).toBe('+442071234567')
    })

    it('should validate without + prefix', () => {
      expect(phoneSchema.parse('12125551234')).toBe('12125551234')
    })

    it('should reject invalid phone', () => {
      expect(() => phoneSchema.parse('123')).toThrow()
      expect(() => phoneSchema.parse('abc')).toThrow()
    })
  })

  describe('slugSchema', () => {
    it('should validate lowercase slug', () => {
      expect(slugSchema.parse('my-slug')).toBe('my-slug')
      expect(slugSchema.parse('my-long-slug-123')).toBe('my-long-slug-123')
    })

    it('should reject uppercase', () => {
      expect(() => slugSchema.parse('My-Slug')).toThrow()
    })

    it('should reject spaces', () => {
      expect(() => slugSchema.parse('my slug')).toThrow()
    })

    it('should reject special characters', () => {
      expect(() => slugSchema.parse('my_slug')).toThrow()
      expect(() => slugSchema.parse('my.slug')).toThrow()
    })
  })

  describe('uuidSchema', () => {
    it('should validate UUID v4', () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000'
      expect(uuidSchema.parse(uuid)).toBe(uuid)
    })

    it('should reject invalid UUID', () => {
      expect(() => uuidSchema.parse('not-a-uuid')).toThrow()
      expect(() => uuidSchema.parse('550e8400')).toThrow()
    })
  })
})

describe('Numeric Schemas', () => {
  describe('positiveIntSchema', () => {
    it('should validate positive integer', () => {
      expect(positiveIntSchema.parse(5)).toBe(5)
      expect(positiveIntSchema.parse(100)).toBe(100)
    })

    it('should reject zero', () => {
      expect(() => positiveIntSchema.parse(0)).toThrow(/positive/)
    })

    it('should reject negative', () => {
      expect(() => positiveIntSchema.parse(-5)).toThrow(/positive/)
    })

    it('should reject decimal', () => {
      expect(() => positiveIntSchema.parse(5.5)).toThrow(/integer/)
    })
  })

  describe('percentageSchema', () => {
    it('should validate percentage', () => {
      expect(percentageSchema.parse(0)).toBe(0)
      expect(percentageSchema.parse(50)).toBe(50)
      expect(percentageSchema.parse(100)).toBe(100)
    })

    it('should reject below 0', () => {
      expect(() => percentageSchema.parse(-1)).toThrow()
    })

    it('should reject above 100', () => {
      expect(() => percentageSchema.parse(101)).toThrow()
    })
  })

  describe('priceSchema', () => {
    it('should validate price', () => {
      expect(priceSchema.parse(9.99)).toBe(9.99)
      expect(priceSchema.parse(100)).toBe(100)
      expect(priceSchema.parse(0)).toBe(0)
    })

    it('should reject negative price', () => {
      expect(() => priceSchema.parse(-5)).toThrow()
    })

    it('should reject more than 2 decimals', () => {
      expect(() => priceSchema.parse(9.999)).toThrow()
    })
  })
})

describe('User Schemas', () => {
  describe('userCreateSchema', () => {
    it('should validate complete user data', () => {
      const userData = {
        email: 'test@example.com',
        password: 'Password123',
        fullName: 'John Doe',
        acceptTerms: true
      }
      expect(userCreateSchema.parse(userData)).toEqual({
        ...userData,
        email: 'test@example.com' // lowercase
      })
    })

    it('should reject without accepting terms', () => {
      const userData = {
        email: 'test@example.com',
        password: 'Password123',
        fullName: 'John Doe',
        acceptTerms: false
      }
      expect(() => userCreateSchema.parse(userData)).toThrow(/accept terms/)
    })

    it('should reject short name', () => {
      const userData = {
        email: 'test@example.com',
        password: 'Password123',
        fullName: 'J',
        acceptTerms: true
      }
      expect(() => userCreateSchema.parse(userData)).toThrow()
    })
  })

  describe('userLoginSchema', () => {
    it('should validate login credentials', () => {
      const credentials = {
        email: 'test@example.com',
        password: 'anypassword'
      }
      expect(userLoginSchema.parse(credentials)).toEqual({
        email: 'test@example.com',
        password: 'anypassword'
      })
    })

    it('should reject empty password', () => {
      const credentials = {
        email: 'test@example.com',
        password: ''
      }
      expect(() => userLoginSchema.parse(credentials)).toThrow()
    })
  })

  describe('passwordUpdateSchema', () => {
    it('should validate matching passwords', () => {
      const data = {
        password: 'NewPassword123',
        confirmPassword: 'NewPassword123'
      }
      expect(passwordUpdateSchema.parse(data)).toEqual(data)
    })

    it('should reject non-matching passwords', () => {
      const data = {
        password: 'NewPassword123',
        confirmPassword: 'DifferentPassword123'
      }
      expect(() => passwordUpdateSchema.parse(data)).toThrow(/don't match/)
    })
  })
})

describe('Pagination Schema', () => {
  it('should use default values', () => {
    const result = paginationSchema.parse({})
    expect(result.page).toBe(1)
    expect(result.limit).toBe(10)
  })

  it('should parse string to number', () => {
    const result = paginationSchema.parse({ page: '5', limit: '20' })
    expect(result.page).toBe(5)
    expect(result.limit).toBe(20)
  })

  it('should reject negative page', () => {
    expect(() => paginationSchema.parse({ page: -1 })).toThrow()
  })

  it('should reject limit over 100', () => {
    expect(() => paginationSchema.parse({ limit: 101 })).toThrow()
  })
})

describe('Helper Functions', () => {
  describe('validate', () => {
    it('should return parsed data on success', () => {
      const result = validate(emailSchema, 'test@example.com')
      expect(result).toBe('test@example.com')
    })

    it('should throw on validation error', () => {
      expect(() => validate(emailSchema, 'invalid')).toThrow()
    })
  })

  describe('validateSafe', () => {
    it('should return success object', () => {
      const result = validateSafe(emailSchema, 'test@example.com')
      expect(result).toEqual({
        success: true,
        data: 'test@example.com'
      })
    })

    it('should return error object', () => {
      const result = validateSafe(emailSchema, 'invalid')
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.errors).toBeDefined()
        expect(Array.isArray(result.errors)).toBe(true)
      }
    })
  })
})
