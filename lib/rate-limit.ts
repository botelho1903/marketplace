import { NextRequest, NextResponse } from 'next/server'

interface RateLimitConfig {
  windowMs: number
  maxRequests: number
  keyPrefix: string
}

interface RateLimitEntry {
  count: number
  resetTime: number
}

// In-memory store (use Redis in production)
const rateLimitStore = new Map<string, RateLimitEntry>()

// Cleanup old entries periodically
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of Array.from(rateLimitStore.entries())) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key)
    }
  }
}, 60000)

export function createRateLimiter(config: RateLimitConfig) {
  return async function rateLimiter(
    request: NextRequest,
    identifier?: string
  ): Promise<{ success: boolean; response?: NextResponse; remaining: number; resetTime: number }> {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
               request.headers.get('x-real-ip') ||
               'unknown'
    const key = `${config.keyPrefix}:${identifier || ip}`
    const now = Date.now()
    const windowStart = now - config.windowMs

    let entry = rateLimitStore.get(key)

    if (!entry || entry.resetTime < now) {
      entry = {
        count: 0,
        resetTime: now + config.windowMs,
      }
      rateLimitStore.set(key, entry)
    }

    // Remove old entries outside the window
    if (entry.resetTime < now) {
      entry.count = 0
      entry.resetTime = now + config.windowMs
    }

    entry.count++

    const remaining = Math.max(0, config.maxRequests - entry.count)
    const resetTime = entry.resetTime

    if (entry.count > config.maxRequests) {
      return {
        success: false,
        response: NextResponse.json(
          {
            message: 'Muitas requisições. Tente novamente mais tarde.',
            retryAfter: Math.ceil((entry.resetTime - now) / 1000),
          },
          {
            status: 429,
            headers: {
              'X-RateLimit-Limit': config.maxRequests.toString(),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': Math.ceil(entry.resetTime / 1000).toString(),
              'Retry-After': Math.ceil((entry.resetTime - now) / 1000).toString(),
            },
          }
        ),
        remaining: 0,
        resetTime,
      }
    }

    return {
      success: true,
      remaining,
      resetTime,
    }
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