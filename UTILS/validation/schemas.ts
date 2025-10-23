/**
 * Validation Schemas
 *
 * Reusable Zod schemas for common validation patterns.
 *
 * Features:
 * - Type-safe validation
 * - Reusable schemas
 * - Custom error messages
 * - Transform and coerce
 * - Common patterns (email, password, URL, etc.)
 *
 * Usage:
 * ```typescript
 * import { userSchema, emailSchema } from './schemas'
 *
 * const result = userSchema.safeParse(data)
 * if (!result.success) {
 *   throw new ValidationError('Invalid data', result.error.issues)
 * }
 * ```
 */

import { z } from 'zod'

/**
 * Common field schemas
 */
export const emailSchema = z
  .string()
  .email('Invalid email address')
  .toLowerCase()
  .trim()

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')

export const strongPasswordSchema = passwordSchema
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character')
  .min(12, 'Strong password must be at least 12 characters')

export const urlSchema = z
  .string()
  .url('Invalid URL')
  .trim()

export const phoneSchema = z
  .string()
  .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number (E.164 format)')

export const slugSchema = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug format')
  .min(3, 'Slug must be at least 3 characters')
  .max(50, 'Slug must be at most 50 characters')

export const uuidSchema = z
  .string()
  .uuid('Invalid UUID')

/**
 * Numeric schemas
 */
export const positiveIntSchema = z
  .number()
  .int('Must be an integer')
  .positive('Must be positive')

export const percentageSchema = z
  .number()
  .min(0, 'Must be at least 0')
  .max(100, 'Must be at most 100')

export const priceSchema = z
  .number()
  .nonnegative('Price must be non-negative')
  .multipleOf(0.01, 'Price must have at most 2 decimal places')

/**
 * Date schemas
 */
export const dateStringSchema = z
  .string()
  .datetime('Invalid datetime format')

export const futureDateSchema = z
  .date()
  .refine(date => date > new Date(), 'Date must be in the future')

export const pastDateSchema = z
  .date()
  .refine(date => date < new Date(), 'Date must be in the past')

/**
 * Array schemas
 */
export const nonEmptyArraySchema = <T extends z.ZodTypeAny>(schema: T) =>
  z.array(schema).nonempty('Array must not be empty')

export const uniqueArraySchema = <T extends z.ZodTypeAny>(schema: T) =>
  z.array(schema).refine(
    arr => new Set(arr).size === arr.length,
    'Array must contain unique values'
  )

/**
 * Pagination schema
 */
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10)
})

/**
 * Sort schema
 */
export const sortSchema = z.object({
  field: z.string(),
  order: z.enum(['asc', 'desc']).default('asc')
})

/**
 * User schemas
 */
export const userCreateSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  fullName: z.string().min(2, 'Name must be at least 2 characters').max(100),
  acceptTerms: z.boolean().refine(val => val === true, 'Must accept terms')
})

export const userUpdateSchema = z.object({
  email: emailSchema.optional(),
  fullName: z.string().min(2).max(100).optional(),
  bio: z.string().max(500).optional(),
  avatarUrl: urlSchema.optional()
})

export const userLoginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required')
})

export const passwordResetSchema = z.object({
  email: emailSchema
})

export const passwordUpdateSchema = z.object({
  password: passwordSchema,
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword']
})

/**
 * API request schemas
 */
export const idParamSchema = z.object({
  id: z.string().min(1, 'ID is required')
})

export const searchQuerySchema = z.object({
  q: z.string().min(1, 'Search query is required'),
  ...paginationSchema.shape
})

/**
 * File upload schemas
 */
export const imageFileSchema = z.object({
  name: z.string(),
  type: z.enum(['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  size: z.number().max(5 * 1024 * 1024, 'Image must be less than 5MB')
})

export const documentFileSchema = z.object({
  name: z.string(),
  type: z.enum(['application/pdf', 'application/msword', 'text/plain']),
  size: z.number().max(10 * 1024 * 1024, 'Document must be less than 10MB')
})

/**
 * Address schema
 */
export const addressSchema = z.object({
  street: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(2).max(2),
  zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code'),
  country: z.string().length(2, 'Country must be 2-letter code')
})

/**
 * Payment schema
 */
export const paymentMethodSchema = z.object({
  type: z.enum(['card', 'bank_account']),
  last4: z.string().length(4),
  expiryMonth: z.number().int().min(1).max(12).optional(),
  expiryYear: z.number().int().min(new Date().getFullYear()).optional()
})

/**
 * Subscription schema
 */
export const subscriptionSchema = z.object({
  planId: z.string().min(1),
  interval: z.enum(['month', 'year']),
  trialDays: z.number().int().nonnegative().optional()
})

/**
 * Metadata schema (for extensibility)
 */
export const metadataSchema = z.record(
  z.string(),
  z.union([z.string(), z.number(), z.boolean()])
)

/**
 * Environment variable schema
 */
export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  DATABASE_URL: z.string().url(),
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().startsWith('sk-').optional(),
  STRIPE_SECRET_KEY: z.string().startsWith('sk_').optional()
})

/**
 * Helper: Validate and parse data
 */
export function validate<T extends z.ZodTypeAny>(
  schema: T,
  data: unknown
): z.infer<T> {
  return schema.parse(data)
}

/**
 * Helper: Safe validation (returns result object)
 */
export function validateSafe<T extends z.ZodTypeAny>(
  schema: T,
  data: unknown
): { success: true; data: z.infer<T> } | { success: false; errors: z.ZodIssue[] } {
  const result = schema.safeParse(data)

  if (result.success) {
    return { success: true, data: result.data }
  }

  return { success: false, errors: result.error.issues }
}

/**
 * Helper: Validate request body in API route
 */
export async function validateRequestBody<T extends z.ZodTypeAny>(
  request: Request,
  schema: T
): Promise<z.infer<T>> {
  const body = await request.json()
  return schema.parse(body)
}

/**
 * Helper: Validate query parameters
 */
export function validateQueryParams<T extends z.ZodTypeAny>(
  searchParams: URLSearchParams,
  schema: T
): z.infer<T> {
  const params = Object.fromEntries(searchParams)
  return schema.parse(params)
}

/**
 * Example: Custom validation function
 */
export const isValidUsername = (username: string): boolean => {
  return /^[a-zA-Z0-9_]{3,20}$/.test(username)
}

export const usernameSchema = z
  .string()
  .refine(isValidUsername, 'Username must be 3-20 characters (letters, numbers, underscore)')

/**
 * Example: Conditional validation
 */
export const conditionalSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('email'),
    email: emailSchema
  }),
  z.object({
    type: z.literal('phone'),
    phone: phoneSchema
  })
])

/**
 * Example: Nested object validation
 */
export const profileSchema = z.object({
  user: userCreateSchema,
  address: addressSchema.optional(),
  preferences: z.object({
    emailNotifications: z.boolean().default(true),
    theme: z.enum(['light', 'dark', 'auto']).default('auto'),
    language: z.string().length(2).default('en')
  })
})

/**
 * Example usage in API route
 */
export async function exampleApiRoute(request: Request) {
  try {
    // Validate request body
    const data = await validateRequestBody(request, userCreateSchema)

    // Use validated data (type-safe!)
    console.log(data.email, data.password, data.fullName)

    return Response.json({ success: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        { error: 'Validation failed', issues: error.issues },
        { status: 400 }
      )
    }
    throw error
  }
}
