/**
 * API Error Handler
 *
 * Centralized error handling for API routes with type-safe errors.
 *
 * Features:
 * - Typed error classes
 * - HTTP status code mapping
 * - Error logging
 * - User-friendly messages
 * - Development vs production modes
 * - Error tracking integration ready
 *
 * Usage:
 * ```typescript
 * import { ApiError, handleApiError } from './errorHandler'
 *
 * // In API route
 * export async function GET() {
 *   try {
 *     // Your logic
 *     if (!user) {
 *       throw new ApiError(401, 'User not found')
 *     }
 *   } catch (error) {
 *     return handleApiError(error)
 *   }
 * }
 * ```
 */

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string,
    public details?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export class ValidationError extends ApiError {
  constructor(message: string, details?: any) {
    super(400, message, 'VALIDATION_ERROR', details)
    this.name = 'ValidationError'
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message: string = 'Unauthorized') {
    super(401, message, 'UNAUTHORIZED')
    this.name = 'UnauthorizedError'
  }
}

export class ForbiddenError extends ApiError {
  constructor(message: string = 'Forbidden') {
    super(403, message, 'FORBIDDEN')
    this.name = 'ForbiddenError'
  }
}

export class NotFoundError extends ApiError {
  constructor(resource: string = 'Resource') {
    super(404, `${resource} not found`, 'NOT_FOUND')
    this.name = 'NotFoundError'
  }
}

export class ConflictError extends ApiError {
  constructor(message: string) {
    super(409, message, 'CONFLICT')
    this.name = 'ConflictError'
  }
}

export class RateLimitError extends ApiError {
  constructor(message: string = 'Too many requests') {
    super(429, message, 'RATE_LIMIT_EXCEEDED')
    this.name = 'RateLimitError'
  }
}

export class InternalServerError extends ApiError {
  constructor(message: string = 'Internal server error') {
    super(500, message, 'INTERNAL_SERVER_ERROR')
    this.name = 'InternalServerError'
  }
}

/**
 * Error response interface
 */
interface ErrorResponse {
  error: {
    message: string
    code?: string
    statusCode: number
    details?: any
    stack?: string
  }
}

/**
 * Main error handler for API routes
 */
export function handleApiError(error: unknown): Response {
  // Log error
  console.error('[API Error]:', error)

  // Log to error tracking service (e.g., Sentry)
  // if (process.env.NODE_ENV === 'production') {
  //   Sentry.captureException(error)
  // }

  // Handle ApiError instances
  if (error instanceof ApiError) {
    return Response.json(
      {
        error: {
          message: error.message,
          code: error.code,
          statusCode: error.statusCode,
          details: error.details,
          ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
        }
      } as ErrorResponse,
      { status: error.statusCode }
    )
  }

  // Handle Zod validation errors
  if (error && typeof error === 'object' && 'issues' in error) {
    return Response.json(
      {
        error: {
          message: 'Validation failed',
          code: 'VALIDATION_ERROR',
          statusCode: 400,
          details: (error as any).issues
        }
      } as ErrorResponse,
      { status: 400 }
    )
  }

  // Handle standard Error instances
  if (error instanceof Error) {
    const statusCode = 500
    const message = process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : error.message

    return Response.json(
      {
        error: {
          message,
          code: 'INTERNAL_SERVER_ERROR',
          statusCode,
          ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
        }
      } as ErrorResponse,
      { status: statusCode }
    )
  }

  // Handle unknown errors
  return Response.json(
    {
      error: {
        message: 'An unexpected error occurred',
        code: 'UNKNOWN_ERROR',
        statusCode: 500
      }
    } as ErrorResponse,
    { status: 500 }
  )
}

/**
 * Async error wrapper for API routes
 */
export function withErrorHandler<T extends (...args: any[]) => Promise<Response>>(
  handler: T
): T {
  return (async (...args: any[]) => {
    try {
      return await handler(...args)
    } catch (error) {
      return handleApiError(error)
    }
  }) as T
}

/**
 * Type guard for ApiError
 */
export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}

/**
 * Get user-friendly error message
 */
export function getUserFriendlyMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'An unexpected error occurred'
}

/**
 * Example: API route with error handling
 */
export async function exampleApiRoute(request: Request) {
  return withErrorHandler(async () => {
    // Get user from auth
    const user = null // Replace with actual auth check

    if (!user) {
      throw new UnauthorizedError('Please sign in to continue')
    }

    // Validate request
    const body = await request.json()
    if (!body.email) {
      throw new ValidationError('Email is required', {
        field: 'email',
        message: 'Email field is missing'
      })
    }

    // Check permissions
    if (!user.isAdmin) {
      throw new ForbiddenError('Admin access required')
    }

    // Business logic
    const resource = null // Replace with actual lookup
    if (!resource) {
      throw new NotFoundError('User')
    }

    // Check for conflicts
    const existing = null // Replace with actual check
    if (existing) {
      throw new ConflictError('Email already exists')
    }

    // Success response
    return Response.json({ success: true })
  })(request)
}

/**
 * Example: Protected API route pattern
 */
export async function protectedApiRoute(
  request: Request,
  handler: (user: any) => Promise<Response>
) {
  return withErrorHandler(async () => {
    // Get user from session/token
    // const user = await getUser(request)
    const user = null

    if (!user) {
      throw new UnauthorizedError()
    }

    return handler(user)
  })(request)
}

/**
 * Example: Paginated API route pattern
 */
export async function paginatedApiRoute(
  request: Request,
  handler: (params: { page: number; limit: number }) => Promise<any>
) {
  return withErrorHandler(async () => {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    if (page < 1 || limit < 1 || limit > 100) {
      throw new ValidationError('Invalid pagination parameters', {
        page: 'Must be >= 1',
        limit: 'Must be between 1 and 100'
      })
    }

    const data = await handler({ page, limit })

    return Response.json(data)
  })(request)
}
