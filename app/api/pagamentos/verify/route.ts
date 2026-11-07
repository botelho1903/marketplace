import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth/config'
import { createPaymentService } from '@/lib/payments/payment-service'
import { verifyPaymentSchema } from '@/lib/validations/payment'
import { paymentVerificationRateLimiter, addRateLimitHeaders } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await paymentVerificationRateLimiter(req)
    if (!rateLimitResult.success) {
      return rateLimitResult.response!
    }

    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const userRole = (session.user as any).role
    const body = await req.json()

    // Validate input with Zod
    const validation = verifyPaymentSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { message: 'Dados inválidos', errors: validation.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { paymentId, orderId } = validation.data

    let payment: any

    if (paymentId) {
      payment = await prisma.payment.findUnique({
        where: { id: paymentId },
        include: { order: true },
      })
    } else if (orderId) {
      payment = await prisma.payment.findFirst({
        where: { orderId },
        orderBy: { createdAt: 'desc' },
        include: { order: true },
      })
    }

    if (!payment) {
      return NextResponse.json({ message: 'Pagamento não encontrado' }, { status: 404 })
    }

    // Check permissions
    if (userRole !== 'ADMIN' && payment.order.buyerId !== userId && payment.order.sellerId !== userId) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 403 })
    }

    // For cash payments, return current status (seller confirms via separate endpoint)
    if (payment.method === 'DINHEIRO' || payment.method === 'CASH_ON_DELIVERY') {
      const response = NextResponse.json({
        verified: payment.status === 'COMPLETED',
        payment: {
          id: payment.id,
          paymentId: payment.paymentId,
          status: payment.status,
          method: payment.method,
          amount: payment.amount,
          processedAt: payment.processedAt,
        },
        message: payment.status === 'COMPLETED'
          ? 'Pagamento em dinheiro confirmado pelo vendedor'
          : 'Pagamento em dinheiro - aguardando confirmação do vendedor',
      })
      return addRateLimitHeaders(response, rateLimitResult.remaining, rateLimitResult.resetTime, 30)
    }

    // Verify with payment provider (MercadoPago)
    const paymentService = createPaymentService()
    const result = await paymentService.verifyPayment(payment.id)

    const response = NextResponse.json({
      verified: result.isValid,
      payment: result.payment ? {
        id: payment.id,
        paymentId: payment.paymentId,
        status: payment.status,
        gatewayStatus: result.payment?.status,
        gatewayStatusDetail: result.payment?.statusDetail,
        amount: payment.amount,
        method: payment.method,
        processedAt: payment.processedAt,
      } : null,
      error: result.error,
    })

    return addRateLimitHeaders(response, rateLimitResult.remaining, rateLimitResult.resetTime, 30)
  } catch (error) {
    console.error('Error verifying payment:', error)
    return NextResponse.json({ message: 'Erro ao verificar pagamento' }, { status: 500 })
  }
}