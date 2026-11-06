import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth/config'
import { createPaymentService } from '@/lib/payments/payment-service'

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || (session.user as any).role !== 'SELLER' && (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const userRole = (session.user as any).role
    const body = await req.json()

    const { paymentId, amount, reason } = body

    if (!paymentId) {
      return NextResponse.json({ message: 'paymentId é obrigatório' }, { status: 400 })
    }

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { order: true },
    })

    if (!payment) {
      return NextResponse.json({ message: 'Pagamento não encontrado' }, { status: 404 })
    }

    // Check permissions - seller can only refund their own orders, admin can refund any
    if (userRole !== 'ADMIN' && payment.order.sellerId !== userId) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 403 })
    }

    // Check if payment can be refunded
    if (payment.status === 'REFUNDED' || payment.status === 'PARTIALLY_REFUNDED') {
      return NextResponse.json({ message: 'Pagamento já foi reembolsado' }, { status: 400 })
    }

    if (payment.status !== 'COMPLETED') {
      return NextResponse.json({ message: 'Apenas pagamentos completados podem ser reembolsados' }, { status: 400 })
    }

    // Validate amount
    const refundAmount = amount || payment.amount.toNumber()
    if (refundAmount > payment.amount.toNumber()) {
      return NextResponse.json({ message: 'Valor do reembolso excede o valor do pagamento' }, { status: 400 })
    }

    const isPartialRefund = refundAmount < payment.amount.toNumber()

    const paymentService = createPaymentService()
    const result = await paymentService.refundPayment(paymentId, refundAmount, reason, userId)

    // Update order payment status
    await prisma.order.update({
      where: { id: payment.orderId },
      data: {
        paymentStatus: isPartialRefund ? 'PARTIALLY_REFUNDED' : 'REFUNDED',
        status: isPartialRefund ? 'REFUNDED' : 'REFUNDED',
      },
    })

    // Create order status history
    await prisma.orderStatusHistory.create({
      data: {
        orderId: payment.orderId,
        status: isPartialRefund ? 'REFUNDED' : 'REFUNDED',
        note: `Reembolso ${isPartialRefund ? 'parcial' : 'total'}: ${reason || 'Não informado'}`,
        createdBy: userId,
      },
    })

    return NextResponse.json({
      success: true,
      payment: {
        id: result.payment.id,
        status: result.payment.status,
        refundedAmount: refundAmount,
        isPartialRefund,
      },
    })
  } catch (error) {
    console.error('Error processing refund:', error)
    return NextResponse.json({
      message: 'Erro ao processar reembolso',
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    }, { status: 500 })
  }
}