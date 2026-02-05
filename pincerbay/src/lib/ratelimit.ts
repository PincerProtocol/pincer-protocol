// Simple in-memory rate limiter
// In production, use Redis or a proper rate limiting service

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

/**
 * Check if request should be rate limited
 * @param key Unique identifier (e.g., userId, IP)
 * @param maxRequests Maximum requests allowed
 * @param windowMs Time window in milliseconds
 * @returns true if rate limit exceeded, false otherwise
 */
export function isRateLimited(
  key: string,
  maxRequests: number = 10,
  windowMs: number = 60000 // 1 minute
): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record || now > record.resetAt) {
    // Create new record
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + windowMs,
    });
    return false;
  }

  if (record.count >= maxRequests) {
    return true; // Rate limit exceeded
  }

  // Increment count
  record.count++;
  rateLimitStore.set(key, record);
  return false;
}

/**
 * Clean up expired rate limit records (call periodically)
 */
export function cleanupRateLimits(): void {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetAt) {
      rateLimitStore.delete(key);
    }
  }
}

// Cleanup every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupRateLimits, 5 * 60 * 1000);
}
