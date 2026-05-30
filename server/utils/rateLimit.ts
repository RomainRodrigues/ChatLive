/**
 * Simple in-memory rate limiter for single-server deployments.
 * Uses a Map to track request counts per key with automatic window reset.
 *
 * For multi-server/clustered deployments, replace with Redis-based rate limiting.
 */

interface RateLimitEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()

// Periodically clean up expired entries to prevent memory leaks
const CLEANUP_INTERVAL = 60_000 // 1 minute
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of store) {
    if (now > entry.resetAt) {
      store.delete(key)
    }
  }
}, CLEANUP_INTERVAL)

interface RateLimitOptions {
  /** Maximum number of requests allowed in the window */
  max: number
  /** Time window in seconds */
  windowSeconds: number
}

/**
 * Check and enforce rate limiting for a given key.
 * Throws a 429 error if the limit is exceeded.
 *
 * @param key - Unique identifier (e.g., `userId:endpoint`)
 * @param options - Rate limit configuration
 */
export function enforceRateLimit(key: string, options: RateLimitOptions): void {
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || now > entry.resetAt) {
    // New window
    store.set(key, {
      count: 1,
      resetAt: now + options.windowSeconds * 1000
    })
    return
  }

  entry.count++

  if (entry.count > options.max) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000)
    throw createError({
      statusCode: 429,
      statusMessage: `Trop de requêtes. Réessayez dans ${retryAfter} secondes.`
    })
  }
}
