import { NextRequest, NextResponse } from 'next/server'
import Redis from 'ioredis'

interface RateLimitConfig {
  windowMs: number
  maxRequests: number
  keyPrefix: string
}

interface RateLimitEntry {
  count: number
  resetTime: number
}

/**
 * Redis client singleton - connects via REDIS_URL env var
 * Falls back to in-memory if Redis unavailable (dev only)
 */
function createRedisClient(): Redis | null {
  const redisUrl = process.env.REDIS_URL
  if (!redisUrl) {
    console.warn('[rate-limit] REDIS_URL not set, using in-memory fallback (dev only)')
    return null
  }

  try {
    const client = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      lazyConnect: true,
    })

    client.on('error', (err) => {
      console.error('[rate-limit] Redis connection error:', err.message)
    })

    client.on('connect', () => {
      console.log('[rate-limit] Redis connected')
    })

    return client
  } catch (err) {
    console.error('[rate-limit] Failed to create Redis client:', err)
    return null
  }
}

const redis = createRedisClient()

// In-memory fallback for dev (when Redis not configured)
const memoryStore = new Map<string, RateLimitEntry>()
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of Array.from(memoryStore.entries())) {
    if (entry.resetTime < now) {
      memoryStore.delete(key)
    }
  }
}, 60000)

/**
 * Sliding window rate limiter using Redis sorted sets (or memory fallback)
 * Key format: "ratelimit:{prefix}:{identifier}"
 * Sorted set members: timestamp (score = timestamp, value = unique request id)
 */
export function createRateLimiter(config: RateLimitConfig) {
  return async function rateLimiter(
    request: NextRequest,
    identifier?: string
  ): Promise<{ success: boolean; response?: NextResponse; remaining: number; resetTime: number }> {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
               request.headers.get('x-real-ip') ||
               'unknown'
    const key = `ratelimit:${config.keyPrefix}:${identifier || ip}`
    const now = Date.now()
    const windowStart = now - config.windowMs
    const windowSec = Math.ceil(config.windowMs / 1000)
    const resetTime = now + config.windowMs

    if (redis) {
      // Redis implementation: sliding window with sorted set
      try {
        await redis.connect()

        const pipeline = redis.pipeline()

        // Remove expired entries
        pipeline.zremrangebyscore(key, 0, windowStart)

        // Count current requests in window
        pipeline.zcard(key)

        // Add current request
        const requestId = `${now}:${Math.random().toString(36).slice(2)}`
        pipeline.zadd(key, now, requestId)

        // Set TTL on key (window + buffer)
        pipeline.expire(key, windowSec + 10)

        const results = await pipeline.exec()

        if (!results) throw new Error('Pipeline returned null')

        const currentCount = (results[1]?.[1] as number) || 0
        const newCount = currentCount + 1
        const remaining = Math.max(0, config.maxRequests - newCount)

        if (newCount > config.maxRequests) {
          // Retry-after based on window start (conservative estimate)
          const retryAfter = Math.ceil(config.windowMs / 1000)

          return {
            success: false,
            response: NextResponse.json(
              {
                message: 'Muitas requisições. Tente novamente mais tarde.',
                retryAfter,
              },
              {
                status: 429,
                headers: {
                  'X-RateLimit-Limit': config.maxRequests.toString(),
                  'X-RateLimit-Remaining': '0',
                  'X-RateLimit-Reset': Math.ceil(resetTime / 1000).toString(),
                  'Retry-After': retryAfter.toString(),
                },
              }
            ),
            remaining: 0,
            resetTime,
          }
        }

        return { success: true, remaining, resetTime }
      } catch (err) {
        console.error('[rate-limit] Redis error, falling back to memory:', err)
        // Fall through to memory implementation
      }
    }

    // In-memory fallback (dev only)
    let entry = memoryStore.get(key)

    if (!entry || entry.resetTime < now) {
      entry = { count: 0, resetTime }
      memoryStore.set(key, entry)
    }

    if (entry.resetTime < now) {
      entry.count = 0
      entry.resetTime = resetTime
    }

    entry.count++
    const remaining = Math.max(0, config.maxRequests - entry.count)

    if (entry.count > config.maxRequests) {
      const retryAfter = Math.ceil((entry.resetTime - now) / 1000)
      return {
        success: false,
        response: NextResponse.json(
          {
            message: 'Muitas requisições. Tente novamente mais tarde.',
            retryAfter,
          },
          {
            status: 429,
            headers: {
              'X-RateLimit-Limit': config.maxRequests.toString(),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': Math.ceil(entry.resetTime / 1000).toString(),
              'Retry-After': retryAfter.toString(),
            },
          }
        ),
        remaining: 0,
        resetTime: entry.resetTime,
      }
    }

    return { success: true, remaining, resetTime: entry.resetTime }
  }
}

// Pre-configured rate limiters for payment endpoints
export const paymentCreationRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 20, // 20 payment attempts per 15 min
  keyPrefix: 'payment:create',
})

export const paymentVerificationRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 30, // 30 verifications per minute
  keyPrefix: 'payment:verify',
})

export const webhookRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100, // 100 webhooks per minute
  keyPrefix: 'webhook:mercado-pago',
})

export const sellerSettingsRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 10, // 10 settings updates per 15 min
  keyPrefix: 'seller:payment-settings',
})

export const cashConfirmationRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 30, // 30 confirmations per minute
  keyPrefix: 'payment:cash-confirm',
})

// Helper to add rate limit headers to successful responses
export function addRateLimitHeaders(
  response: NextResponse,
  remaining: number,
  resetTime: number,
  limit: number
): NextResponse {
  response.headers.set('X-RateLimit-Limit', limit.toString())
  response.headers.set('X-RateLimit-Remaining', remaining.toString())
  response.headers.set('X-RateLimit-Reset', Math.ceil(resetTime / 1000).toString())
  return response
}