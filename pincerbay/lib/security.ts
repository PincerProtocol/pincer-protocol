/**
 * 🛡️ Security Utilities
 * Input sanitization, validation, and security checks
 */

import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

// ============================================================================
// Input Sanitization
// ============================================================================

/**
 * Sanitize user input to prevent XSS attacks
 * @param input - Raw user input
 * @returns Sanitized string
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== "string") {
    return ""
  }

  return input
    .trim()
    // Remove null bytes
    .replace(/\0/g, "")
    // Escape HTML special characters
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;")
    // Remove potentially dangerous Unicode characters
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, "")
}

/**
 * Sanitize object with nested strings
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized = {} as T
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string") {
      sanitized[key as keyof T] = sanitizeInput(value) as any
    } else if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      sanitized[key as keyof T] = sanitizeObject(value)
    } else {
      sanitized[key as keyof T] = value
    }
  }
  
  return sanitized
}

// ============================================================================
// Wallet Address Validation
// ============================================================================

/**
 * Validate Ethereum wallet address (EVM-compatible)
 * @param address - Wallet address to validate
 * @returns true if valid Ethereum address
 */
export function validateWalletAddress(address: string): boolean {
  if (typeof address !== "string") {
    return false
  }

  // Check if it's a valid Ethereum address format (0x + 40 hex characters)
  const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/
  
  if (!ethAddressRegex.test(address)) {
    return false
  }

  // Additional checksum validation could be added here
  // For now, basic format validation is sufficient
  return true
}

/**
 * Validate contract address (same as wallet but can add contract-specific checks)
 */
export function validateContractAddress(address: string): boolean {
  return validateWalletAddress(address)
}

// ============================================================================
// Rate Limiting (Endpoint-specific)
// ============================================================================

type Duration = `${number} ms` | `${number} s` | `${number} m` | `${number} h` | `${number} d`

interface RateLimitConfig {
  requests: number
  window: Duration
}

const ENDPOINT_LIMITS: Record<string, RateLimitConfig> = {
  // Critical endpoints (strict limits)
  "/api/wallets/create": { requests: 5, window: "1 h" },
  "/api/wallets/withdraw": { requests: 10, window: "10 m" },
  "/api/agents/purchase": { requests: 10, window: "10 s" },
  "/api/agents/upload": { requests: 5, window: "1 h" },
  
  // Standard API endpoints
  "/api/agents": { requests: 30, window: "1 m" },
  "/api/wallets": { requests: 20, window: "1 m" },
  
  // Default fallback
  default: { requests: 60, window: "1 m" }
}

// Store ratelimiters per endpoint
const ratelimiters = new Map<string, Ratelimit>()

/**
 * Initialize rate limiter for a specific endpoint
 */
function getRateLimiter(endpoint: string): Ratelimit | null {
  // Skip if Redis not configured
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null
  }

  // Return cached limiter if exists
  if (ratelimiters.has(endpoint)) {
    return ratelimiters.get(endpoint)!
  }

  // Get config for this endpoint or use default
  const config = ENDPOINT_LIMITS[endpoint] || ENDPOINT_LIMITS.default

  // Create new limiter
  const limiter = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(config.requests, config.window),
    analytics: true,
    prefix: `pincerbay:${endpoint}`
  })

  ratelimiters.set(endpoint, limiter)
  return limiter
}

/**
 * Check rate limit for specific endpoint
 * @param ip - Client IP address
 * @param endpoint - API endpoint path
 * @returns null if allowed, Response if rate limited
 */
export async function checkRateLimit(
  ip: string, 
  endpoint: string
): Promise<Response | null> {
  const limiter = getRateLimiter(endpoint)
  
  if (!limiter) {
    console.warn(`Rate limiting not configured for: ${endpoint}`)
    return null
  }

  try {
    const identifier = `${ip}:${endpoint}`
    const { success, limit, reset, remaining } = await limiter.limit(identifier)
    
    if (!success) {
      const retryAfter = Math.ceil((reset - Date.now()) / 1000)
      
      return new Response(
        JSON.stringify({ 
          error: "Rate limit exceeded",
          message: `Too many requests to ${endpoint}. Please try again later.`,
          retryAfter,
          limit,
          remaining: 0
        }), 
        { 
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "X-RateLimit-Limit": limit.toString(),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": reset.toString(),
            "Retry-After": retryAfter.toString()
          }
        }
      )
    }
    
    return null
  } catch (error) {
    console.error("Rate limit check failed:", error)
    // Fail open - don't block requests if rate limiting fails
    return null
  }
}

// ============================================================================
// Security Headers Utilities
// ============================================================================

/**
 * Generate Content-Security-Policy header value
 */
export function generateCSP(nonce?: string): string {
  const directives = [
    "default-src 'self'",
    nonce 
      ? `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`
      : "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self'",
    "connect-src 'self' https:",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ]
  
  return directives.join("; ")
}

/**
 * Validate API key format (basic check)
 */
export function isValidApiKeyFormat(apiKey: string): boolean {
  // API keys should be at least 32 characters
  if (typeof apiKey !== "string" || apiKey.length < 32) {
    return false
  }
  
  // Only alphanumeric and hyphens
  return /^[a-zA-Z0-9-_]+$/.test(apiKey)
}

/**
 * Check if request is from internal service
 */
export function isInternalRequest(req: Request): boolean {
  const allowedIPs = (process.env.INTERNAL_IPS || "").split(",").map(ip => ip.trim())
  
  if (allowedIPs.length === 0) {
    return false
  }
  
  const forwarded = req.headers.get("x-forwarded-for")
  const real = req.headers.get("x-real-ip")
  const clientIP = forwarded?.split(',')[0] || real || ""
  
  return allowedIPs.includes(clientIP)
}

/**
 * Detect suspicious patterns in input
 */
export function detectSuspiciousInput(input: string): boolean {
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i, // Event handlers like onclick=
    /eval\(/i,
    /expression\(/i,
    /<iframe/i,
    /vbscript:/i,
    /data:text\/html/i,
  ]
  
  return suspiciousPatterns.some(pattern => pattern.test(input))
}

/**
 * Log security event
 */
export function logSecurityEvent(
  event: string, 
  details: Record<string, any>,
  severity: "low" | "medium" | "high" | "critical" = "medium"
) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    event,
    severity,
    details,
    source: "security.ts"
  }
  
  console.warn(`🛡️ [SECURITY ${severity.toUpperCase()}]`, JSON.stringify(logEntry, null, 2))
  
  // TODO: Send to external security monitoring (Sentry, Datadog, etc.)
  if (severity === "high" || severity === "critical") {
    // Alert admin
    console.error("🚨 CRITICAL SECURITY EVENT:", logEntry)
  }
}
