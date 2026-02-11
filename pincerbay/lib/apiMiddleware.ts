/**
 * 🛡️ API Middleware Helpers
 * Reusable security wrappers for API routes
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from './auth'
import { validateApiKey } from './apiKeyAuth'
import { checkRateLimit, getIdentifier } from './ratelimit'
import { logger, logSecurityEvent } from './logger'
import { z } from 'zod'
import type { Session } from 'next-auth'
import type { Agent } from '@prisma/client'

// ============================================================================
// Type Definitions
// ============================================================================

type HandlerWithSession = (
  req: NextRequest,
  context: any,
  session: Session
) => Promise<NextResponse>

type HandlerWithApiKey = (
  req: NextRequest,
  context: any,
  agent: Agent
) => Promise<NextResponse>

type HandlerWithValidation<T> = (
  req: NextRequest,
  context: any,
  validated: T
) => Promise<NextResponse>

type BaseHandler = (
  req: NextRequest,
  context: any
) => Promise<NextResponse>

// ============================================================================
// Authentication Middleware
// ============================================================================

/**
 * Wraps a handler with session authentication check
 * Returns 401 if no valid session exists
 */
export function withAuth(handler: HandlerWithSession): BaseHandler {
  return async (req: NextRequest, context?: any) => {
    try {
      const session = await requireAuth()
      if (!session) {
        logSecurityEvent('unauthorized_access_attempt', {
          path: req.nextUrl.pathname,
          ip: getIdentifier(req),
          method: req.method
        })
        return NextResponse.json(
          { error: 'Unauthorized: Authentication required' },
          { status: 401 }
        )
      }
      return handler(req, context, session)
    } catch (error) {
      logger.error('Authentication error', { error, path: req.nextUrl.pathname })
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }
}

/**
 * Wraps a handler with API key authentication check
 * Returns 401 if no valid API key exists
 */
export function withApiKey(handler: HandlerWithApiKey): BaseHandler {
  return async (req: NextRequest, context?: any) => {
    try {
      const apiKey = req.headers.get('x-api-key')

      if (!apiKey) {
        logSecurityEvent('missing_api_key', {
          path: req.nextUrl.pathname,
          ip: getIdentifier(req),
          method: req.method
        })
        return NextResponse.json(
          { error: 'Unauthorized: API key required' },
          { status: 401 }
        )
      }

      const agent = await validateApiKey(apiKey)
      if (!agent) {
        logSecurityEvent('invalid_api_key', {
          path: req.nextUrl.pathname,
          ip: getIdentifier(req),
          method: req.method,
          apiKey: apiKey.substring(0, 8) + '...' // Log prefix only
        })
        return NextResponse.json(
          { error: 'Unauthorized: Invalid or suspended API key' },
          { status: 401 }
        )
      }

      return handler(req, context, agent)
    } catch (error) {
      logger.error('API key authentication error', { error, path: req.nextUrl.pathname })
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }
}

// ============================================================================
// Rate Limiting Middleware
// ============================================================================

/**
 * Wraps a handler with rate limiting
 * Returns 429 if rate limit is exceeded
 *
 * @param endpoint - Endpoint identifier for rate limiting (e.g., 'api/escrow')
 */
export function withRateLimit(endpoint: string) {
  return (handler: BaseHandler): BaseHandler => {
    return async (req: NextRequest, context?: any) => {
      try {
        const identifier = `${endpoint}:${getIdentifier(req)}`
        const rateLimitResponse = await checkRateLimit(identifier)

        if (rateLimitResponse) {
          logSecurityEvent('rate_limit_exceeded', {
            endpoint,
            ip: getIdentifier(req),
            path: req.nextUrl.pathname
          })
          // Convert Response to NextResponse
          const body = await rateLimitResponse.text()
          return new NextResponse(body, {
            status: rateLimitResponse.status,
            headers: rateLimitResponse.headers
          })
        }

        return handler(req, context)
      } catch (error) {
        logger.error('Rate limiting error', { error, endpoint, path: req.nextUrl.pathname })
        return NextResponse.json(
          { error: 'Internal server error' },
          { status: 500 }
        )
      }
    }
  }
}

// ============================================================================
// Input Validation Middleware
// ============================================================================

/**
 * Wraps a handler with Zod schema validation
 * Returns 400 if validation fails
 *
 * @param schema - Zod schema to validate request body against
 */
export function withValidation<T>(schema: z.ZodSchema<T>) {
  return (handler: HandlerWithValidation<T>): BaseHandler => {
    return async (req: NextRequest, context?: any) => {
      try {
        const body = await req.json()
        const validated = schema.parse(body)
        return handler(req, context, validated)
      } catch (error) {
        if (error instanceof z.ZodError) {
          logSecurityEvent('validation_failed', {
            path: req.nextUrl.pathname,
            ip: getIdentifier(req),
            errors: error.issues
          })
          return NextResponse.json(
            {
              error: 'Validation failed',
              details: error.issues.map(e => ({
                path: e.path.join('.'),
                message: e.message
              }))
            },
            { status: 400 }
          )
        }

        if (error instanceof SyntaxError) {
          return NextResponse.json(
            { error: 'Invalid JSON in request body' },
            { status: 400 }
          )
        }

        logger.error('Validation error', { error, path: req.nextUrl.pathname })
        return NextResponse.json(
          { error: 'Internal server error' },
          { status: 500 }
        )
      }
    }
  }
}

// ============================================================================
// Composable Middleware
// ============================================================================

/**
 * Composes multiple middleware functions
 * Executes from right to left (like function composition)
 *
 * Example:
 * export const POST = compose(
 *   withAuth,
 *   withRateLimit('api/escrow'),
 *   withValidation(createEscrowSchema)
 * )(handler)
 */
export function compose(...middlewares: Array<(handler: BaseHandler) => BaseHandler>) {
  return (handler: BaseHandler): BaseHandler => {
    return middlewares.reduceRight(
      (wrappedHandler, middleware) => middleware(wrappedHandler),
      handler
    )
  }
}

// ============================================================================
// Error Response Helper
// ============================================================================

/**
 * Creates a safe error response that doesn't leak sensitive information
 * Logs the full error server-side
 */
export function createErrorResponse(
  error: Error | unknown,
  userMessage: string = 'Internal server error',
  statusCode: number = 500
): NextResponse {
  // Log full error details server-side
  logger.error('API error', {
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
  })

  // Return generic error to client (no stack traces or internal details)
  return NextResponse.json(
    { error: userMessage },
    { status: statusCode }
  )
}
