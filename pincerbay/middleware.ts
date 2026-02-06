/**
 * 🛡️ Enhanced Security Middleware
 * API authentication, rate limiting, CORS, security headers
 */

import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { checkRateLimit } from "@/lib/security"
import { extractApiKey, validateApiKey } from "@/lib/auth"

// ============================================================================
// Configuration
// ============================================================================

// Allowed origins for CORS
const getAllowedOrigins = (): string[] => {
  const baseOrigins = [
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    "https://pincerbay.com",
    "https://www.pincerbay.com",
  ]
  
  // Add additional origins from environment
  const extraOrigins = process.env.ALLOWED_ORIGINS?.split(",").map(o => o.trim()) || []
  
  return [...baseOrigins, ...extraOrigins]
}

// API routes that require authentication
const PROTECTED_API_ROUTES = [
  "/api/wallets/create",
  "/api/wallets/withdraw",
  "/api/agents/upload",
  "/api/agents/purchase",
]

// Public API routes (no auth required)
const PUBLIC_API_ROUTES = [
  "/api/agents",
  "/api/health",
  "/api/auth",
  "/api/agent",      // Agent Power API
  "/api/ranking",    // Ranking API
]

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get client IP address from request
 */
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for")
  const real = request.headers.get("x-real-ip")
  const cf = request.headers.get("cf-connecting-ip")
  
  return forwarded?.split(',')[0] || real || cf || "unknown"
}

/**
 * Check if route requires API authentication
 */
function requiresAuth(pathname: string): boolean {
  return PROTECTED_API_ROUTES.some(route => pathname.startsWith(route))
}

/**
 * Check if route is public API
 */
function isPublicAPI(pathname: string): boolean {
  return PUBLIC_API_ROUTES.some(route => pathname.startsWith(route))
}

// ============================================================================
// Middleware
// ============================================================================

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const clientIP = getClientIP(request)
  const origin = request.headers.get("origin")
  
  // ============================================================================
  // 1. Handle OPTIONS preflight requests
  // ============================================================================
  if (request.method === "OPTIONS") {
    return handleCORS(request, new NextResponse(null, { status: 204 }))
  }
  
  // ============================================================================
  // 2. API Authentication (for protected routes)
  // ============================================================================
  if (pathname.startsWith("/api/") && requiresAuth(pathname)) {
    const apiKey = extractApiKey(request)
    
    if (!apiKey) {
      return new NextResponse(
        JSON.stringify({ 
          error: "Unauthorized",
          message: "API key required for this endpoint"
        }), 
        { 
          status: 401,
          headers: { "Content-Type": "application/json" }
        }
      )
    }
    
    const validation = validateApiKey(apiKey)
    if (!validation.valid) {
      return new NextResponse(
        JSON.stringify({ 
          error: "Unauthorized",
          message: "Invalid or expired API key"
        }), 
        { 
          status: 401,
          headers: { "Content-Type": "application/json" }
        }
      )
    }
    
    // Add agent ID to request headers for downstream use
    request.headers.set("x-agent-id", validation.agentId || "")
  }
  
  // ============================================================================
  // 3. Rate Limiting (endpoint-specific)
  // ============================================================================
  if (pathname.startsWith("/api/")) {
    const rateLimitResult = await checkRateLimit(clientIP, pathname)
    
    if (rateLimitResult) {
      // Rate limit exceeded, return error response
      return handleCORS(request, rateLimitResult)
    }
  }
  
  // ============================================================================
  // 4. Continue with response and apply security headers
  // ============================================================================
  const response = NextResponse.next()
  
  // Apply CORS headers
  handleCORS(request, response)
  
  // Apply security headers
  applySecurityHeaders(response)
  
  // Add request tracking
  response.headers.set("X-Request-ID", crypto.randomUUID())
  response.headers.set("X-Client-IP", clientIP)
  
  return response
}

// ============================================================================
// CORS Handler
// ============================================================================

function handleCORS(request: NextRequest, response: NextResponse): NextResponse {
  const origin = request.headers.get("origin")
  const allowedOrigins = getAllowedOrigins()
  
  // Check if origin is allowed
  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin)
    response.headers.set("Access-Control-Allow-Credentials", "true")
  } else if (!origin) {
    // Same-origin request
    response.headers.set("Access-Control-Allow-Origin", "*")
  }
  
  // CORS headers
  response.headers.set(
    "Access-Control-Allow-Methods", 
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  )
  response.headers.set(
    "Access-Control-Allow-Headers", 
    "Content-Type, Authorization, X-API-Key, X-Requested-With, X-Agent-ID"
  )
  response.headers.set(
    "Access-Control-Expose-Headers",
    "X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset, X-Request-ID"
  )
  response.headers.set("Access-Control-Max-Age", "86400") // 24 hours
  
  return response
}

// ============================================================================
// Security Headers
// ============================================================================

function applySecurityHeaders(response: NextResponse) {
  // Prevent clickjacking
  response.headers.set("X-Frame-Options", "DENY")
  
  // Prevent MIME-type sniffing
  response.headers.set("X-Content-Type-Options", "nosniff")
  
  // XSS Protection (legacy but still useful)
  response.headers.set("X-XSS-Protection", "1; mode=block")
  
  // Referrer policy
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  
  // Permissions policy (limit browser features)
  response.headers.set(
    "Permissions-Policy", 
    "camera=(), microphone=(), geolocation=(), interest-cohort=()"
  )
  
  // Content Security Policy (CSP)
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
  
  // HSTS (HTTP Strict Transport Security) - Production only
  if (process.env.NODE_ENV === "production") {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload"
    )
  }
  
  // Additional security headers
  response.headers.set("X-DNS-Prefetch-Control", "off")
  response.headers.set("X-Download-Options", "noopen")
  response.headers.set("X-Permitted-Cross-Domain-Policies", "none")
}

// ============================================================================
// Middleware Configuration
// ============================================================================

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon file)
     * - public folder assets
     * - Agent Power API (/api/agent, /api/ranking)
     */
    "/((?!_next/static|_next/image|favicon.ico|api/agent|api/ranking|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|eot)$).*)",
  ],
}
