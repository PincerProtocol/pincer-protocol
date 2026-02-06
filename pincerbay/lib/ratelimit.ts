import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

// Create ratelimiter only if environment variables are set
let ratelimit: Ratelimit | null = null

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(10, "10 s"), // 10 requests per 10 seconds
    analytics: true,
    prefix: "pincerbay"
  })
}

export async function checkRateLimit(identifier: string): Promise<Response | null> {
  // Skip rate limiting if not configured (development mode)
  if (!ratelimit) {
    console.warn("Rate limiting not configured - skipping check")
    return null
  }

  try {
    const { success, limit, reset, remaining } = await ratelimit.limit(identifier)
    
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
    // Fail open - don't block requests if rate limiting fails
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
