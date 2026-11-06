import { NextRequest, NextResponse } from 'next/server'
import { createPaymentService } from '@/lib/payments/payment-service'

export async function POST(req: NextRequest) {
  try {
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
        },
      },
    })

    // Process the webhook
    const paymentService = createPaymentService()
    const result = await paymentService.processWebhookNotification(notification, signature || '')

    if (!result.success) {
      console.error('Webhook processing failed:', notification)
      return NextResponse.json({ message: 'Webhook processing failed' }, { status: 400 })
    }

    // Return 200 OK to acknowledge receipt
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ message: 'Erro ao processar webhook' }, { status: 500 })
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({ status: 'ok', service: 'mercado-pago-webhook' })
}