import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth/config'
import { createPaymentService } from '@/lib/payments/payment-service'
import { confirmCashPaymentSchema } from '@/lib/validations/payment'
import { cashConfirmationRateLimiter, addRateLimitHeaders } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await cashConfirmationRateLimiter(req)
    if (!rateLimitResult.success) {
      return rateLimitResult.response!
    }

    const session = await auth()
    if (!session?.user || (session.user as any).role !== 'SELLER' && (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ message: 'Não autorizado. Apenas vendedores podem confirmar pagamentos em dinheiro.' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const userRole = (session.user as any).role
    const body = await req.json()

    // Validate input
    const validation = confirmCashPaymentSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { message: 'Dados inválidos', errors: validation.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { paymentId, confirmationNote } = validation.data

    // Get payment with order
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        order: {
          include: {
            buyer: { select: { id: true, name: true, email: true } },
            seller: { select: { id: true, name: true, email: true } },
            items: { include: { product: true } },
          },
        },
      },
    })

    if (!payment) {
      return NextResponse.json({ message: 'Pagamento não encontrado' }, { status: 404 })
    }

    // Verify permissions - only the seller of this order or admin can confirm
    if (userRole !== 'ADMIN' && payment.order.sellerId !== userId) {
      return NextResponse.json({ message: 'Não autorizado a confirmar este pagamento' }, { status: 403 })
    }

    // Verify payment is a cash payment
    if (payment.method !== 'DINHEIRO' && payment.method !== 'CASH_ON_DELIVERY') {
      return NextResponse.json(
        { message: 'Este endpoint é apenas para confirmação de pagamentos em dinheiro (DINHEIRO/CASH_ON_DELIVERY)' },
        { status: 400 }
      )
    }

    // Verify payment is pending
    if (payment.status !== 'PENDING') {
      return NextResponse.json(
        { message: `Pagamento não está pendente. Status atual: ${payment.status}` },
        { status: 400 }
      )
    }

    // Update payment status to COMPLETED
    const updatedPayment = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: 'COMPLETED',
        processedAt: new Date(),
        metadata: {
          ...(payment.metadata as Record<string, unknown> || {}),
          cashConfirmedAt: new Date().toISOString(),
          cashConfirmedBy: userId,
          confirmationNote: confirmationNote || null,
        },
      },
    })

    // Update order payment status and order status
    await prisma.order.update({
      where: { id: payment.orderId },
      data: {
        paymentStatus: 'COMPLETED',
        status: 'PAID',
        paidAt: new Date(),
      },
    })

    // Create order status history
    await prisma.orderStatusHistory.create({
      data: {
        orderId: payment.orderId,
        status: 'PAID',
        note: `Pagamento em dinheiro confirmado pelo vendedor${confirmationNote ? `: ${confirmationNote}` : ''}`,
        createdBy: userId,
      },
    })

    // Trigger digital delivery if applicable
    const paymentService = createPaymentService()
    await (paymentService as any).triggerDigitalDelivery?.(payment.orderId)

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'CASH_PAYMENT_CONFIRMED',
        entityType: 'Payment',
        entityId: paymentId,
        userId,
        sellerId: userId,
        oldData: { status: 'PENDING', method: payment.method },
        newData: {
          status: 'COMPLETED',
          method: payment.method,
          confirmedAt: new Date().toISOString(),
          confirmationNote: confirmationNote || null,
        },
        metadata: {
          orderId: payment.orderId,
          orderNumber: payment.order.orderNumber,
          buyerId: payment.order.buyerId,
        },
        ipAddress: req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
                   req.headers.get('x-real-ip') ||
                   undefined,
        userAgent: req.headers.get('user-agent') || undefined,
      },
    })

    // Notify buyer
    await prisma.notification.create({
      data: {
        userId: payment.order.buyerId,
        type: 'PAYMENT_CONFIRMED',
        title: 'Pagamento confirmado',
        message: `Seu pagamento em dinheiro para o pedido ${payment.order.orderNumber} foi confirmado pelo vendedor.`,
        data: {
          orderId: payment.orderId,
          orderNumber: payment.order.orderNumber,
          paymentId: payment.id,
          paymentMethod: payment.method,
        },
      },
    })

    const response = NextResponse.json({
      success: true,
      message: 'Pagamento em dinheiro confirmado com sucesso',
      payment: {
        id: updatedPayment.id,
        paymentId: updatedPayment.paymentId,
        status: updatedPayment.status,
        method: updatedPayment.method,
        amount: updatedPayment.amount,
        processedAt: updatedPayment.processedAt,
      },
    })

    return addRateLimitHeaders(response, rateLimitResult.remaining, rateLimitResult.resetTime, 30)
  } catch (error) {
    console.error('Error confirming cash payment:', error)
    return NextResponse.json(
      { message: 'Erro ao confirmar pagamento em dinheiro', error: error instanceof Error ? error.message : 'Erro desconhecido' },
      { status: 500 }
    )
  }
}