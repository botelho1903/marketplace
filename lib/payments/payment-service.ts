import { prisma } from '@/lib/prisma'
import { createMercadoPagoProvider, MercadoPagoProvider, PaymentData, PixPaymentData, CreditCardPaymentData, PaymentResult } from './providers'
import { PaymentMethod, PaymentStatus, OrderStatus, Prisma } from '@prisma/client'
import crypto from 'crypto'

function toJsonObject(obj: any): Prisma.InputJsonObject {
  return JSON.parse(JSON.stringify(obj))
}

export interface CreatePaymentInput {
  orderId: string
  amount: number
  currency: string
  method: PaymentMethod
  metadata?: Record<string, unknown>
  pixData?: PixPaymentData
  creditCardData?: CreditCardPaymentData
  idempotencyKey: string
  buyerId: string
  sellerId?: string
}

export interface PaymentVerificationResult {
  isValid: boolean
  payment?: PaymentResult
  error?: string
}

export interface AuditLogEntry {
  id: string
  action: string
  entityType: string
  entityId: string
  userId?: string
  sellerId?: string
  oldData?: Record<string, unknown>
  newData?: Record<string, unknown>
  metadata?: Record<string, unknown>
  ipAddress?: string
  userAgent?: string
  createdAt: Date
}

function generateIdempotencyKey(prefix: string, ...parts: string[]): string {
  const hash = crypto.createHash('sha256')
    .update(parts.join(':'))
    .digest('hex')
    .substring(0, 32)
  return `${prefix}_${hash}`
}

function generateExternalReference(orderId: string): string {
  return `ORDER_${orderId}_${Date.now()}`
}

export class PaymentService {
  private provider: MercadoPagoProvider
  private sellerAccessToken?: string

  constructor(sellerAccessToken?: string) {
    this.sellerAccessToken = sellerAccessToken
    this.provider = createMercadoPagoProvider(sellerAccessToken)
  }

  async createPayment(input: CreatePaymentInput): Promise<{ payment: any; auditLog: AuditLogEntry }> {
    const { orderId, amount, currency, method, metadata, pixData, creditCardData, idempotencyKey, buyerId, sellerId } = input

    // Check if payment with this idempotency key already exists
    const existingPayment = await prisma.payment.findFirst({
      where: {
        metadata: {
          path: ['idempotencyKey'],
          equals: idempotencyKey,
        },
      },
    })

    if (existingPayment) {
      return {
        payment: existingPayment,
        auditLog: await this.createAuditLog({
          action: 'PAYMENT_DUPLICATE_ATTEMPT',
          entityType: 'Payment',
          entityId: existingPayment.id,
          userId: buyerId,
          sellerId,
          newData: { method, amount, currency, idempotencyKey },
          metadata: { duplicateOf: existingPayment.id },
        }),
      }
    }

    // Get order details
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        buyer: true,
        seller: true,
        items: {
          include: {
            product: true,
          },
        },
        shippingAddress: true,
      },
    })

    if (!order) {
      throw new Error('Order not found')
    }

    const externalReference = generateExternalReference(orderId)
    const notificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/mercado-pago`
    const backUrls = {
      success: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?orderId=${orderId}`,
      failure: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/failure?orderId=${orderId}`,
      pending: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/pending?orderId=${orderId}`,
    }

    let paymentResult: PaymentResult

    switch (method) {
      case 'PIX': {
        const pixPayload: PixPaymentData = {
          amount,
          currency,
          description: `Pedido ${order.orderNumber}`,
          externalReference,
          payer: {
            email: order.buyer.email,
            firstName: order.buyer.name.split(' ')[0],
            lastName: order.buyer.name.split(' ').slice(1).join(' '),
            phone: order.buyer.phone ? {
              areaCode: order.buyer.phone.substring(0, 2),
              number: order.buyer.phone.substring(2),
            } : undefined,
          },
          paymentMethodId: 'pix',
          notificationUrl,
          backUrls,
          metadata: {
            ...metadata,
            idempotencyKey,
            orderId,
            buyerId,
            sellerId,
          },
        }

        paymentResult = await this.provider.createPixPayment(pixPayload, idempotencyKey)
        break
      }

      case 'CREDIT_CARD': {
        if (!creditCardData) {
          throw new Error('Credit card data is required for credit card payments')
        }

        const ccPayload: CreditCardPaymentData = {
          amount,
          currency,
          description: `Pedido ${order.orderNumber}`,
          externalReference,
          payer: {
            email: order.buyer.email,
            firstName: order.buyer.name.split(' ')[0],
            lastName: order.buyer.name.split(' ').slice(1).join(' '),
            phone: order.buyer.phone ? {
              areaCode: order.buyer.phone.substring(0, 2),
              number: order.buyer.phone.substring(2),
            } : undefined,
            identification: creditCardData.payer.identification,
          },
          paymentMethodId: creditCardData.paymentMethodId,
          token: creditCardData.token,
          installments: creditCardData.installments,
          issuerId: creditCardData.issuerId,
          notificationUrl,
          backUrls,
          metadata: {
            ...metadata,
            idempotencyKey,
            orderId,
            buyerId,
            sellerId,
          },
        }

        paymentResult = await this.provider.createCreditCardPayment(ccPayload, idempotencyKey)
        break
      }

      case 'DINHEIRO':
      case 'CASH_ON_DELIVERY': {
        // Cash payment - create a pending payment record
        const payment = await prisma.payment.create({
          data: {
            paymentId: `CASH_${orderId}_${Date.now()}`,
            amount: new Prisma.Decimal(amount),
            currency,
            method,
            status: 'PENDING',
            orderId,
            metadata: {
              idempotencyKey,
              externalReference,
              ...metadata,
            } as Prisma.InputJsonObject,
          },
        })

        // Create audit log
        const auditLog = await this.createAuditLog({
          action: 'PAYMENT_CREATED',
          entityType: 'Payment',
          entityId: payment.id,
          userId: buyerId,
          sellerId,
          newData: { method, amount, currency, status: 'PENDING', type: 'cash' },
        })

        return { payment, auditLog }
      }

      default:
        throw new Error(`Unsupported payment method: ${method}`)
    }

    // Create payment record in database
    const payment = await prisma.payment.create({
      data: {
        paymentId: paymentResult.id,
        amount: new Prisma.Decimal(paymentResult.amount),
        currency: paymentResult.currencyId,
        method,
        status: this.mapMercadoPagoStatus(paymentResult.status),
        gatewayResponse: toJsonObject(paymentResult),
        metadata: {
          idempotencyKey,
          externalReference,
          statusDetail: paymentResult.statusDetail,
          ...metadata,
        } as Prisma.InputJsonObject,
        orderId,
        processedAt: paymentResult.dateApproved ? new Date(paymentResult.dateApproved) : null,
      },
    })

    // Update order payment status
    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: this.mapMercadoPagoStatusToOrderPaymentStatus(paymentResult.status),
        ...(paymentResult.status === 'approved' && { paidAt: new Date() }),
      },
    })

    // Create audit log
    const auditLog = await this.createAuditLog({
      action: 'PAYMENT_CREATED',
      entityType: 'Payment',
      entityId: payment.id,
      userId: buyerId,
      sellerId,
      newData: {
        method,
        amount,
        currency,
        status: paymentResult.status,
        externalReference,
        gatewayPaymentId: paymentResult.id,
        qrCode: 'pointOfInteraction' in paymentResult ? paymentResult.pointOfInteraction?.transactionData?.qrCode : undefined,
      },
    })

    return { payment, auditLog }
  }

  async verifyPayment(paymentId: string): Promise<PaymentVerificationResult> {
    try {
      // Get payment from database
      const payment = await prisma.payment.findUnique({
        where: { id: paymentId },
        include: { order: true },
      })

      if (!payment) {
        return { isValid: false, error: 'Payment not found' }
      }

      // If it's a cash payment, no external verification needed
      if (payment.method === 'DINHEIRO' || payment.method === 'CASH_ON_DELIVERY') {
        return { isValid: true, payment: payment as any }
      }

      // Verify with Mercado Pago
      const mpPayment = await this.provider.getPayment(payment.paymentId)

      // Check if status matches
      const isStatusConsistent = this.mapMercadoPagoStatus(mpPayment.status) === payment.status

      if (!isStatusConsistent) {
        // Update payment status
        await this.updatePaymentStatus(payment.id, mpPayment.status)

        await this.createAuditLog({
          action: 'PAYMENT_STATUS_SYNC',
          entityType: 'Payment',
          entityId: payment.id,
          oldData: { status: payment.status },
          newData: { status: mpPayment.status, gatewayStatusDetail: mpPayment.statusDetail },
          metadata: { syncedFromGateway: true },
        })
      }

      return {
        isValid: true,
        payment: mpPayment,
      }
    } catch (error) {
      console.error('Payment verification error:', error)
      return {
        isValid: false,
        error: error instanceof Error ? error.message : 'Verification failed',
      }
    }
  }

  async processWebhookNotification(notification: any, signature: string): Promise<{ success: boolean; auditLog?: AuditLogEntry }> {
    // Verify webhook signature
    const config = {
      accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN!,
      webhookSecret: process.env.MERCADO_PAGO_WEBHOOK_SECRET!,
    }

    const provider = createMercadoPagoProvider()
    const isValidSignature = await provider.verifyWebhookSignature(
      JSON.stringify(notification),
      signature,
      config.webhookSecret
    )

    if (!isValidSignature) {
      await this.createAuditLog({
        action: 'WEBHOOK_INVALID_SIGNATURE',
        entityType: 'Webhook',
        entityId: notification.id || 'unknown',
        newData: { notificationType: notification.type, resourceId: notification.data?.id },
        metadata: { reason: 'Invalid signature' },
      })

      return { success: false }
    }

    // Process payment notification
    if (notification.type === 'payment') {
      const paymentId = notification.data.id
      const mpPayment = await this.provider.getPayment(paymentId)

      // Find payment in our database
      const payment = await prisma.payment.findUnique({
        where: { paymentId },
        include: { order: true },
      })

      if (!payment) {
        await this.createAuditLog({
          action: 'WEBHOOK_PAYMENT_NOT_FOUND',
          entityType: 'Payment',
          entityId: paymentId,
          newData: { gatewayPaymentId: paymentId, status: mpPayment.status },
          metadata: { notification },
        })

        return { success: false }
      }

      const oldStatus = payment.status
      const newStatus = this.mapMercadoPagoStatus(mpPayment.status)

      // Update payment
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: newStatus,
          gatewayResponse: toJsonObject(mpPayment),
          processedAt: mpPayment.dateApproved ? new Date(mpPayment.dateApproved) : null,
        },
      })

      // Update order
      const orderPaymentStatus = this.mapMercadoPagoStatusToOrderPaymentStatus(mpPayment.status)
      await prisma.order.update({
        where: { id: payment.orderId },
        data: {
          paymentStatus: orderPaymentStatus,
          ...(mpPayment.status === 'approved' && { paidAt: new Date(), status: 'PAID' as OrderStatus }),
        },
      })

      // If payment approved, trigger digital delivery
      if (mpPayment.status === 'approved' && oldStatus !== 'COMPLETED') {
        await this.triggerDigitalDelivery(payment.orderId)
      }

      const auditLog = await this.createAuditLog({
        action: 'WEBHOOK_PAYMENT_UPDATED',
        entityType: 'Payment',
        entityId: payment.id,
        userId: payment.order.buyerId,
        sellerId: payment.order.sellerId || undefined,
        oldData: { status: oldStatus },
        newData: { status: newStatus, gatewayStatusDetail: mpPayment.statusDetail, gatewayProcessedAt: mpPayment.dateApproved },
        metadata: { notificationId: notification.id, notificationType: notification.type },
      })

      return { success: true, auditLog }
    }

    return { success: true }
  }

  async refundPayment(paymentId: string, amount?: number, reason?: string, userId?: string): Promise<{ payment: any; auditLog: AuditLogEntry }> {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { order: true },
    })

    if (!payment) {
      throw new Error('Payment not found')
    }

    if (payment.method === 'DINHEIRO' || payment.method === 'CASH_ON_DELIVERY') {
      // For cash payments, just update status
      const updatedPayment = await prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: 'REFUNDED',
          processedAt: new Date(),
        },
      })

      const auditLog = await this.createAuditLog({
        action: 'PAYMENT_REFUNDED',
        entityType: 'Payment',
        entityId: paymentId,
        userId,
        sellerId: payment.order.sellerId || undefined,
        oldData: { status: payment.status, amount: payment.amount.toNumber() },
        newData: { status: 'REFUNDED', amount: amount || payment.amount.toNumber(), reason },
        metadata: { type: 'cash' },
      })

      return { payment: updatedPayment, auditLog }
    }

    const idempotencyKey = generateIdempotencyKey('refund', paymentId, amount?.toString() || 'full')
    const refundResult = await this.provider.refundPayment(payment.paymentId, amount, idempotencyKey)

    const updatedPayment = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: this.mapMercadoPagoStatus(refundResult.status),
        gatewayResponse: toJsonObject(refundResult),
        processedAt: new Date(),
      },
    })

    const auditLog = await this.createAuditLog({
      action: 'PAYMENT_REFUNDED',
      entityType: 'Payment',
      entityId: paymentId,
      userId,
      sellerId: payment.order.sellerId || undefined,
      oldData: { status: payment.status, amount: payment.amount.toNumber() },
      newData: { status: refundResult.status, amount: amount || payment.amount.toNumber(), reason, gatewayRefundId: refundResult.id },
      metadata: { idempotencyKey },
    })

    return { payment: updatedPayment, auditLog }
  }

  private async triggerDigitalDelivery(orderId: string): Promise<void> {
    try {
      // Call digital delivery API internally
      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/digital-delivery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      })

      if (!response.ok) {
        console.error('Digital delivery trigger failed:', await response.text())
      }
    } catch (error) {
      console.error('Digital delivery trigger error:', error)
    }
  }

  private async updatePaymentStatus(paymentId: string, mercadoPagoStatus: string): Promise<void> {
    const newStatus = this.mapMercadoPagoStatus(mercadoPagoStatus)
    const orderPaymentStatus = this.mapMercadoPagoStatusToOrderPaymentStatus(mercadoPagoStatus)

    await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: newStatus,
        processedAt: mercadoPagoStatus === 'approved' ? new Date() : null,
      },
    })

    const payment = await prisma.payment.findUnique({ where: { id: paymentId } })
    if (payment) {
      await prisma.order.update({
        where: { id: payment.orderId },
        data: {
          paymentStatus: orderPaymentStatus,
          ...(mercadoPagoStatus === 'approved' && { paidAt: new Date(), status: 'PAID' as OrderStatus }),
        },
      })
    }
  }

  private mapMercadoPagoStatus(status: string): PaymentStatus {
    switch (status) {
      case 'approved':
        return 'COMPLETED'
      case 'pending':
      case 'in_process':
        return 'PROCESSING'
      case 'rejected':
      case 'cancelled':
        return 'FAILED'
      case 'refunded':
        return 'REFUNDED'
      case 'charged_back':
        return 'REFUNDED'
      case 'in_mediation':
        return 'PROCESSING'
      default:
        return 'PENDING'
    }
  }

  private mapMercadoPagoStatusToOrderPaymentStatus(status: string): PaymentStatus {
    switch (status) {
      case 'approved':
        return 'COMPLETED'
      case 'pending':
      case 'in_process':
        return 'PENDING'
      case 'rejected':
      case 'cancelled':
        return 'FAILED'
      case 'refunded':
      case 'charged_back':
        return 'REFUNDED'
      case 'in_mediation':
        return 'PROCESSING'
      default:
        return 'PENDING'
    }
  }

  private async createAuditLog(entry: Omit<AuditLogEntry, 'id' | 'createdAt'>): Promise<AuditLogEntry> {
    const auditLog = await prisma.auditLog.create({
      data: {
        action: entry.action,
        entityType: entry.entityType,
        entityId: entry.entityId,
        userId: entry.userId,
        sellerId: entry.sellerId,
        oldData: entry.oldData as Prisma.InputJsonObject | undefined,
        newData: entry.newData as Prisma.InputJsonObject | undefined,
        metadata: entry.metadata as Prisma.InputJsonObject | undefined,
        ipAddress: entry.ipAddress,
        userAgent: entry.userAgent,
      },
    })

    return auditLog as AuditLogEntry
  }

  static generateIdempotencyKey(prefix: string, ...parts: string[]): string {
    return generateIdempotencyKey(prefix, ...parts)
  }
}

export function createPaymentService(sellerAccessToken?: string): PaymentService {
  return new PaymentService(sellerAccessToken)
}