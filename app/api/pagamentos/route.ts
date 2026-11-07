import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth/config'
import { createPaymentService, PaymentService } from '@/lib/payments/payment-service'
import { PaymentMethod, Prisma } from '@prisma/client'
import { createPaymentSchema } from '@/lib/validations/payment'
import { paymentCreationRateLimiter, addRateLimitHeaders } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await paymentCreationRateLimiter(req)
    if (!rateLimitResult.success) {
      return rateLimitResult.response!
    }

    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const body = await req.json()

    // Validate input with Zod
    const validation = createPaymentSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { message: 'Dados inválidos', errors: validation.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const {
      orderId,
      paymentMethod,
      creditCardToken,
      creditCardInstallments,
      creditCardIssuerId,
      creditCardPaymentMethodId,
      cardholderIdentification,
      cardholderName,
      metadata,
    } = validation.data

    // Get order with all details
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        buyer: true,
        seller: true,
        items: {
          include: {
            product: {
              include: {
                seller: true,
              },
            },
          },
        },
      },
    })

    if (!order) {
      return NextResponse.json({ message: 'Pedido não encontrado' }, { status: 404 })
    }

    // Verify buyer owns this order
    if (order.buyerId !== userId) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 403 })
    }

    // Verify order is in a payable state
    if (order.status !== 'PENDING_PAYMENT' || order.paymentStatus !== 'PENDING') {
      return NextResponse.json({ message: 'Pedido não pode ser pago no estado atual' }, { status: 400 })
    }

    // Generate idempotency key
    const idempotencyKey = PaymentService.generateIdempotencyKey('payment', orderId, paymentMethod, userId)

    // Determine seller access token for Mercado Pago
    let sellerAccessToken: string | undefined
    if (order.sellerId) {
      const sellerProfile = await prisma.sellerProfile.findUnique({
        where: { userId: order.sellerId },
        select: { mercadopagoAccessToken: true },
      })

      if (sellerProfile?.mercadopagoAccessToken) {
        // Decrypt the access token
        const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-32-char-encryption-key-change-in-production'
        const crypto = await import('crypto')
        try {
          const [ivHex, authTagHex, encryptedHex] = sellerProfile.mercadopagoAccessToken.split(':')
          const iv = Buffer.from(ivHex, 'hex')
          const authTag = Buffer.from(authTagHex, 'hex')
          const encrypted = Buffer.from(encryptedHex, 'hex')
          const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32)
          const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv)
          decipher.setAuthTag(authTag)
          sellerAccessToken = Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8')
        } catch {
          console.error('Failed to decrypt seller access token')
        }
      }
    }

    const paymentService = createPaymentService(sellerAccessToken)

    // Prepare payment input
    const paymentInput = {
      orderId,
      amount: order.total.toNumber(),
      currency: order.currency,
      method: paymentMethod,
      metadata: {
        ...metadata,
        orderNumber: order.orderNumber,
        buyerName: order.buyer.name,
        buyerEmail: order.buyer.email,
      },
      idempotencyKey,
      buyerId: userId,
      sellerId: order.sellerId || undefined,
    }

    let paymentResult: any

    if (paymentMethod === 'CREDIT_CARD') {
      paymentResult = await paymentService.createPayment({
        ...paymentInput,
        creditCardData: {
          amount: order.total.toNumber(),
          currency: order.currency,
          description: `Pedido ${order.orderNumber}`,
          externalReference: `ORDER_${orderId}_${Date.now()}`,
          payer: {
            email: order.buyer.email,
            firstName: order.buyer.name.split(' ')[0],
            lastName: order.buyer.name.split(' ').slice(1).join(' ') || '',
            identification: cardholderIdentification ? {
              type: cardholderIdentification.type || 'CPF',
              number: cardholderIdentification.number,
            } : undefined,
            phone: order.buyer.phone ? {
              areaCode: order.buyer.phone.substring(0, 2),
              number: order.buyer.phone.substring(2),
            } : undefined,
          },
          paymentMethodId: creditCardPaymentMethodId!,
          token: creditCardToken!,
          installments: creditCardInstallments!,
          issuerId: creditCardIssuerId,
          notificationUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/mercado-pago`,
          backUrls: {
            success: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?orderId=${orderId}`,
            failure: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/failure?orderId=${orderId}`,
            pending: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/pending?orderId=${orderId}`,
          },
          metadata: paymentInput.metadata,
        },
      })
    } else if (paymentMethod === 'PIX') {
      paymentResult = await paymentService.createPayment({
        ...paymentInput,
        pixData: {
          amount: order.total.toNumber(),
          currency: order.currency,
          description: `Pedido ${order.orderNumber}`,
          externalReference: `ORDER_${orderId}_${Date.now()}`,
          payer: {
            email: order.buyer.email,
            firstName: order.buyer.name.split(' ')[0],
            lastName: order.buyer.name.split(' ').slice(1).join(' ') || '',
            phone: order.buyer.phone ? {
              areaCode: order.buyer.phone.substring(0, 2),
              number: order.buyer.phone.substring(2),
            } : undefined,
          },
          paymentMethodId: 'pix',
          notificationUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/mercado-pago`,
          backUrls: {
            success: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?orderId=${orderId}`,
            failure: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/failure?orderId=${orderId}`,
            pending: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/pending?orderId=${orderId}`,
          },
          metadata: paymentInput.metadata,
        },
      })
    } else {
      // Cash payment (DINHEIRO or CASH_ON_DELIVERY)
      paymentResult = await paymentService.createPayment(paymentInput)
    }

    // Return payment details to frontend
    const payment = paymentResult.payment
    let paymentResponse: any = {
      success: true,
      payment: {
        id: payment.id,
        paymentId: payment.paymentId,
        amount: payment.amount,
        currency: payment.currency,
        method: payment.method,
        status: payment.status,
        createdAt: payment.createdAt,
      },
    }

    // Include PIX QR code if available
    if (paymentMethod === 'PIX' && payment.gatewayResponse) {
      const gatewayResponse = payment.gatewayResponse as any
      if (gatewayResponse.pointOfInteraction?.transactionData) {
        paymentResponse.payment.qrCode = gatewayResponse.pointOfInteraction.transactionData.qrCode
        paymentResponse.payment.qrCodeBase64 = gatewayResponse.pointOfInteraction.transactionData.qrCodeBase64
        paymentResponse.payment.ticketUrl = gatewayResponse.pointOfInteraction.transactionData.ticketUrl
      }
    }

    const response = NextResponse.json(paymentResponse, { status: 201 })
    return addRateLimitHeaders(response, rateLimitResult.remaining, rateLimitResult.resetTime, 20)
  } catch (error) {
    console.error('Error creating payment:', error)
    return NextResponse.json({
      message: 'Erro ao processar pagamento',
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const userRole = (session.user as any).role
    const { searchParams } = new URL(req.url)
    const orderId = searchParams.get('orderId')
    const paymentId = searchParams.get('paymentId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where: any = {}

    if (orderId) {
      where.orderId = orderId
      // Verify access to order
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        select: { buyerId: true, sellerId: true },
      })
      if (!order) {
        return NextResponse.json({ message: 'Pedido não encontrado' }, { status: 404 })
      }
      if (userRole !== 'ADMIN' && order.buyerId !== userId && order.sellerId !== userId) {
        return NextResponse.json({ message: 'Não autorizado' }, { status: 403 })
      }
    } else if (userRole === 'ADMIN') {
      // Admin can see all
    } else if (userRole === 'SELLER') {
      // Seller can see payments for their orders
      where.order = { sellerId: userId }
    } else {
      // Buyer can see their own payments
      where.order = { buyerId: userId }
    }

    if (paymentId) {
      where.id = paymentId
    }

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          order: {
            select: {
              id: true,
              orderNumber: true,
              status: true,
              paymentStatus: true,
              buyer: { select: { id: true, name: true, email: true } },
              seller: { select: { id: true, name: true, sellerProfile: { select: { storeName: true } } } },
            },
          },
        },
      }),
      prisma.payment.count({ where }),
    ])

    return NextResponse.json({
      payments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching payments:', error)
    return NextResponse.json({ message: 'Erro ao buscar pagamentos' }, { status: 500 })
  }
}