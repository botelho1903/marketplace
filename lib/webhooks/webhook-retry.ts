import { prisma } from '@/lib/prisma'

export interface QueuedWebhook {
  id: string
  notification: any
  signature: string
  attempts: number
  maxAttempts: number
  nextRetryAt: Date
  lastError?: string
  createdAt: Date
  updatedAt: Date
}

const MAX_RETRY_ATTEMPTS = 5
const BASE_RETRY_DELAY_MS = 1000 // 1 second
const MAX_RETRY_DELAY_MS = 300000 // 5 minutes

/**
 * Calculate exponential backoff delay
 */
function calculateRetryDelay(attempt: number): number {
  const delay = BASE_RETRY_DELAY_MS * Math.pow(2, attempt - 1)
  const jitter = Math.random() * 1000 // Add up to 1 second jitter
  return Math.min(delay + jitter, MAX_RETRY_DELAY_MS)
}

/**
 * Queue a webhook for retry processing
 */
export async function queueWebhookForRetry(
  notification: any,
  signature: string,
  error: string
): Promise<void> {
  const nextRetryAt = new Date(Date.now() + calculateRetryDelay(1))

  await prisma.webhookRetry.create({
    data: {
      notification,
      signature,
      attempts: 1,
      maxAttempts: MAX_RETRY_ATTEMPTS,
      nextRetryAt,
      lastError: error,
    },
  })
}

/**
 * Process pending webhook retries
 * This should be called by a cron job or scheduled task
 */
export async function processWebhookRetries(): Promise<{ processed: number; succeeded: number; failed: number }> {
  const now = new Date()

  const pendingWebhooks = await prisma.webhookRetry.findMany({
    where: {
      nextRetryAt: { lte: now },
      attempts: { lt: MAX_RETRY_ATTEMPTS },
    },
    orderBy: { nextRetryAt: 'asc' },
    take: 50, // Process in batches
  })

  let processed = 0
  let succeeded = 0
  let failed = 0

  for (const webhook of pendingWebhooks) {
    try {
      // Import dynamically to avoid circular dependencies
      const { createPaymentService } = await import('@/lib/payments/payment-service')
      const paymentService = createPaymentService()

      const result = await paymentService.processWebhookNotification(webhook.notification, webhook.signature)

      if (result.success) {
        // Mark as completed by deleting
        await prisma.webhookRetry.delete({ where: { id: webhook.id } })
        succeeded++
      } else {
        // Increment attempts and schedule next retry
        const nextAttempt = webhook.attempts + 1
        const nextRetryAt = new Date(Date.now() + calculateRetryDelay(nextAttempt))

        await prisma.webhookRetry.update({
          where: { id: webhook.id },
          data: {
            attempts: nextAttempt,
            nextRetryAt,
            lastError: 'Webhook processing returned failure',
          },
        })
        failed++
      }
    } catch (error) {
      const nextAttempt = webhook.attempts + 1
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'

      if (nextAttempt >= MAX_RETRY_ATTEMPTS) {
        // Max attempts reached - mark as dead letter
        await prisma.webhookRetry.update({
          where: { id: webhook.id },
          data: {
            attempts: nextAttempt,
            lastError: errorMessage,
            nextRetryAt: new Date('2099-12-31'), // Effectively never retry
          },
        })
      } else {
        const nextRetryAt = new Date(Date.now() + calculateRetryDelay(nextAttempt))

        await prisma.webhookRetry.update({
          where: { id: webhook.id },
          data: {
            attempts: nextAttempt,
            nextRetryAt,
            lastError: errorMessage,
          },
        })
      }
      failed++
    }

    processed++
  }

  return { processed, succeeded, failed }
}

/**
 * Get webhook retry statistics
 */
export async function getWebhookRetryStats(): Promise<{
  pending: number
  processing: number
  failed: number
  deadLetter: number
}> {
  const now = new Date()

  const [pending, failed, deadLetter] = await Promise.all([
    prisma.webhookRetry.count({
      where: { nextRetryAt: { lte: now }, attempts: { lt: MAX_RETRY_ATTEMPTS } },
    }),
    prisma.webhookRetry.count({
      where: { attempts: { gte: 1, lt: MAX_RETRY_ATTEMPTS }, nextRetryAt: { gt: now } },
    }),
    prisma.webhookRetry.count({
      where: { attempts: { gte: MAX_RETRY_ATTEMPTS } },
    }),
  ])

  return {
    pending,
    processing: failed, // These are scheduled for retry
    failed: 0, // We don't have a separate failed state
    deadLetter,
  }
}

/**
 * Manually retry a specific webhook
 */
export async function manualRetryWebhook(webhookId: string): Promise<{ success: boolean; error?: string }> {
  const webhook = await prisma.webhookRetry.findUnique({
    where: { id: webhookId },
  })

  if (!webhook) {
    return { success: false, error: 'Webhook not found' }
  }

  try {
    const { createPaymentService } = await import('@/lib/payments/payment-service')
    const paymentService = createPaymentService()

    const result = await paymentService.processWebhookNotification(webhook.notification, webhook.signature)

    if (result.success) {
      await prisma.webhookRetry.delete({ where: { id: webhookId } })
      return { success: true }
    } else {
      return { success: false, error: 'Webhook processing returned failure' }
    }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

/**
 * Clean up old processed/failed webhooks (older than 30 days)
 */
export async function cleanupOldWebhooks(): Promise<number> {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

  const result = await prisma.webhookRetry.deleteMany({
    where: {
      OR: [
        { attempts: { gte: MAX_RETRY_ATTEMPTS }, updatedAt: { lt: thirtyDaysAgo } },
        { nextRetryAt: { lt: thirtyDaysAgo }, attempts: { lt: MAX_RETRY_ATTEMPTS } }, // Stuck webhooks
      ],
    },
  })

  return result.count
}