import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth/config'
import { createPaymentService } from '@/lib/payments/payment-service'

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const userRole = (session.user as any).role
    const body = await req.json()

    const { paymentId, orderId } = body

    if (!paymentId && !orderId) {
      return NextResponse.json({ message: 'paymentId ou orderId é obrigatório' }, { status: 400 })
    }

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

    // For cash payments, no external verification needed
    if (payment.method === 'DINHEIRO' || payment.method === 'CASH_ON_DELIVERY') {
      return NextResponse.json({
        verified: true,
        payment: {
          id: payment.id,
          paymentId: payment.paymentId,
          status: payment.status,
          method: payment.method,
          amount: payment.amount,
        },
        message: 'Pagamento em dinheiro - verificação manual necessária',
      })
    }

    // Verify with payment provider
    const paymentService = createPaymentService()
    const result = await paymentService.verifyPayment(payment.id)

    return NextResponse.json({
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
  } catch (error) {
    console.error('Error verifying payment:', error)
    return NextResponse.json({ message: 'Erro ao verificar pagamento' }, { status: 500 })
  }
}