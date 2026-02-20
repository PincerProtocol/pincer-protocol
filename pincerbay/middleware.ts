/**
 * 🛡️ Simplified Middleware (Edge Runtime Compatible)
 * Security headers + Basic CORS + Auth checks
 * Rate limiting handled in API routes
 */

import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// ============================================================================
// Configuration
// ============================================================================

const getAllowedOrigins = (): string[] => {
  return [
    "http://localhost:3000",
    "https://pincerbay.com",
    "https://www.pincerbay.com",
    "https://pincer-protocol.vercel.app",
  ]
}

// ============================================================================
// Middleware
// ============================================================================

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Handle OPTIONS preflight
  if (request.method === "OPTIONS") {
    return handleCORS(request, new NextResponse(null, { status: 204 }))
  }

  // NOTE: Auth checks moved to individual API routes for better reliability
  // Middleware only handles CORS and security headers now

  // Continue with response
  const response = NextResponse.next()

  // Apply CORS headers
  handleCORS(request, response)

  // Apply security headers
  applySecurityHeaders(response)

  // Add request tracking
  response.headers.set("X-Request-ID", crypto.randomUUID())

  return response
}

// ============================================================================
// CORS Handler
// ============================================================================

function handleCORS(request: NextRequest, response: NextResponse): NextResponse {
  const origin = request.headers.get("origin")
  const allowedOrigins = getAllowedOrigins()

  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin)
    response.headers.set("Access-Control-Allow-Credentials", "true")
  }
  // Removed: wildcard CORS when no origin (fail-closed security posture)

  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS")
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-API-Key, X-Requested-With, X-Agent-ID")
  response.headers.set("Access-Control-Expose-Headers", "X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset, X-Request-ID")
  response.headers.set("Access-Control-Max-Age", "86400")

  return response
}

// ============================================================================
// Security Headers
// ============================================================================

function applySecurityHeaders(response: NextResponse) {
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("X-XSS-Protection", "1; mode=block")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), interest-cohort=()")
  response.headers.set("Content-Length-Limit", "52428800") // 50MB max request body
  
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https: blob:",
    "font-src 'self' data:",
    "connect-src 'self' https: wss:",
    "media-src 'self' https:",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests"
  ]
  
  response.headers.set("Content-Security-Policy", cspDirectives.join("; "))
  response.headers.set("X-DNS-Prefetch-Control", "off")
  response.headers.set("X-Download-Options", "noopen")
  response.headers.set("X-Permitted-Cross-Domain-Policies", "none")
}

// ============================================================================
// Middleware Configuration
// ============================================================================

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|souls|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|eot)$).*)",
  ],
}
