import { NextRequest, NextResponse } from 'next/server'
import { createPaymentService } from '@/lib/payments/payment-service'
import { mercadoPagoWebhookSchema } from '@/lib/validations/payment'
import { webhookRateLimiter } from '@/lib/rate-limit'
import { queueWebhookForRetry } from '@/lib/webhooks/webhook-retry'

export async function POST(req: NextRequest) {
  try {
    // Rate limiting for webhooks
    const rateLimitResult = await webhookRateLimiter(req)
    if (!rateLimitResult.success) {
      console.warn('Webhook rate limit exceeded')
      return rateLimitResult.response!
    }

    // Get signature from headers
    const signature = req.headers.get('x-signature') || req.headers.get('X-Signature')
    const requestId = req.headers.get('x-request-id') || req.headers.get('X-Request-Id')

    // Get raw body for signature verification
    const rawBody = await req.text()
    let notification

    try {
      notification = JSON.parse(rawBody)
    } catch {
      console.error('Invalid JSON in webhook')
      return NextResponse.json({ message: 'Invalid JSON' }, { status: 400 })
    }

    // Validate webhook structure with Zod
    const validation = mercadoPagoWebhookSchema.safeParse(notification)
    if (!validation.success) {
      console.error('Invalid webhook structure:', validation.error.flatten().fieldErrors)
      return NextResponse.json({ message: 'Invalid webhook structure' }, { status: 400 })
    }

    // Log webhook received
    console.log('Mercado Pago webhook received:', {
      type: notification.type,
      action: notification.action,
      dataId: notification.data?.id,
      requestId,
    })

    // Create audit log for webhook receipt
    const { prisma } = await import('@/lib/prisma')
    await prisma.auditLog.create({
      data: {
        action: 'WEBHOOK_RECEIVED',
        entityType: 'Webhook',
        entityId: notification.data?.id || 'unknown',
        newData: {
          type: notification.type,
          action: notification.action,
          dataId: notification.data?.id,
          requestId,
        },
        metadata: {
          notification,
          signature: signature ? 'present' : 'missing',
          liveMode: notification.live_mode,
        },
        ipAddress: req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
                   req.headers.get('x-real-ip') ||
                   undefined,
        userAgent: req.headers.get('user-agent') || undefined,
      },
    })

    // Process the webhook
    const paymentService = createPaymentService()
    const result = await paymentService.processWebhookNotification(notification, signature || '')

    if (!result.success) {
      console.error('Webhook processing failed, queuing for retry:', notification)

      // Log failed processing
      await prisma.auditLog.create({
        data: {
          action: 'WEBHOOK_PROCESSING_FAILED',
          entityType: 'Webhook',
          entityId: notification.data?.id || 'unknown',
          newData: {
            type: notification.type,
            action: notification.action,
            dataId: notification.data?.id,
          },
          metadata: { notification, reason: 'Processing returned failure' },
        },
      })

      // Queue for retry
      await queueWebhookForRetry(notification, signature || '', 'Webhook processing returned failure')

      // Return 200 OK to acknowledge receipt (MercadoPago expects 2xx)
      // The actual processing will happen in the retry
      return NextResponse.json({ success: true, queued: true })
    }

    // Return 200 OK to acknowledge receipt
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Webhook error:', error)

    // Queue for retry on unexpected errors
    try {
      const rawBody = await req.text()
      const notification = JSON.parse(rawBody)
      const signature = req.headers.get('x-signature') || req.headers.get('X-Signature') || ''
      await queueWebhookForRetry(notification, signature, error instanceof Error ? error.message : 'Unknown error')
    } catch {
      // Ignore queue errors
    }

    return NextResponse.json({ message: 'Erro ao processar webhook' }, { status: 500 })
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({ status: 'ok', service: 'mercado-pago-webhook' })
}