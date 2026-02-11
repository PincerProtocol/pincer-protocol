import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

// Create ratelimiter only if environment variables are set
const ratelimiter: Ratelimit | null = (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
  ? new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(10, "10 s"), // 10 requests per 10 seconds
      analytics: true,
      prefix: "pincerbay"
    })
  : null

// Export ratelimit object for direct use
export const ratelimit = {
  async limit(identifier: string) {
    if (!ratelimiter) {
      return { success: true, limit: 0, reset: 0, remaining: 0 }
    }
    return ratelimiter.limit(identifier)
  }
}

export async function checkRateLimit(identifier: string): Promise<Response | null> {
  // FAIL CLOSED: If rate limiting not configured, block in production
  if (!ratelimiter) {
    if (process.env.NODE_ENV === 'production') {
      console.error("CRITICAL: Rate limiting not configured in production")
      return new Response(
        JSON.stringify({ error: "Service temporarily unavailable" }),
        {
          status: 503,
          headers: { "Content-Type": "application/json" }
        }
      )
    }
    // Allow in development with warning
    console.warn("Rate limiting not configured - allowing request in development")
    return null
  }

  try {
    const { success, limit, reset, remaining } = await ratelimiter.limit(identifier)

    if (!success) {
      return new Response(
        JSON.stringify({
          error: "Too Many Requests - Please slow down",
          retryAfter: Math.ceil((reset - Date.now()) / 1000)
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "X-RateLimit-Limit": limit.toString(),
            "X-RateLimit-Remaining": remaining.toString(),
            "X-RateLimit-Reset": reset.toString(),
            "Retry-After": Math.ceil((reset - Date.now()) / 1000).toString()
          }
        }
      )
    }

    return null
  } catch (error) {
    console.error("Rate limit check failed:", error)
    // FAIL CLOSED: Block requests if rate limiting fails in production
    if (process.env.NODE_ENV === 'production') {
      return new Response(
        JSON.stringify({ error: "Service temporarily unavailable" }),
        {
          status: 503,
          headers: { "Content-Type": "application/json" }
        }
      )
    }
    // Fail open only in development
    console.warn("Rate limit check failed in development - allowing request")
    return null
  }
}

export function getIdentifier(req: Request): string {
  // Try multiple headers for IP detection
  const forwarded = req.headers.get("x-forwarded-for")
  const real = req.headers.get("x-real-ip")
  const cf = req.headers.get("cf-connecting-ip")
  
  const ip = forwarded?.split(',')[0] || real || cf || "unknown"
  
  return ip
}
