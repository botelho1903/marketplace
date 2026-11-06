import { MercadoPagoConfig, Payment, Preference } from 'mercadopago'
import crypto from 'crypto'

export interface MercadoPagoConfigOptions {
  accessToken: string
  publicKey?: string
  webhookSecret?: string
}

export interface PaymentData {
  amount: number
  currency: string
  description: string
  externalReference: string
  payer: {
    email: string
    firstName?: string
    lastName?: string
    identification?: {
      type: string
      number: string
    }
    phone?: {
      areaCode: string
      number: string
    }
  }
  paymentMethodId?: string
  installments?: number
  token?: string
  issuerId?: number
  notificationUrl?: string
  backUrls?: {
    success: string
    failure: string
    pending: string
  }
  metadata?: Record<string, unknown>
}

export interface PixPaymentData extends PaymentData {
  paymentMethodId: 'pix'
}

export interface CreditCardPaymentData extends PaymentData {
  paymentMethodId: string
  token: string
  installments: number
  issuerId?: number
}

export interface PaymentResult {
  id: string
  status: string
  statusDetail: string
  amount: number
  currencyId: string
  paymentMethodId: string
  paymentTypeId: string
  dateCreated: string
  dateApproved?: string
  externalReference: string
  metadata?: Record<string, unknown>
  pointOfInteraction?: {
    transactionData?: {
      qrCode?: string
      qrCodeBase64?: string
      ticketUrl?: string
    }
  }
}

export class MercadoPagoProvider {
  private client: MercadoPagoConfig
  private payment: Payment
  private preference: Preference
  private accessToken: string

  constructor(config: MercadoPagoConfigOptions) {
    this.accessToken = config.accessToken
    this.client = new MercadoPagoConfig({
      accessToken: config.accessToken,
      options: {
        timeout: 30000,
      },
    })
    this.payment = new Payment(this.client)
    this.preference = new Preference(this.client)
  }

  async createPayment(data: PaymentData, idempotencyKey: string): Promise<PaymentResult> {
    try {
      const paymentData: any = {
        transaction_amount: data.amount,
        currency: data.currency,
        description: data.description,
        external_reference: data.externalReference,
        payer: data.payer,
        payment_method_id: data.paymentMethodId,
        installments: data.installments || 1,
        token: data.token,
        notification_url: data.notificationUrl,
        back_urls: data.backUrls,
        metadata: data.metadata,
      }

      if (data.issuerId !== undefined) {
        paymentData.issuer_id = data.issuerId
      }

      const result = await this.payment.create({
        body: paymentData,
        requestOptions: {
          idempotencyKey,
        },
      })

      return this.mapPaymentResult(result)
    } catch (error) {
      console.error('Mercado Pago payment creation error:', error)
      throw new Error(`Failed to create payment: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async createPixPayment(data: PixPaymentData, idempotencyKey: string): Promise<PaymentResult & { qrCode: string; qrCodeBase64: string }> {
    const result = await this.createPayment(data, idempotencyKey)
    return {
      ...result,
      qrCode: result.pointOfInteraction?.transactionData?.qrCode || '',
      qrCodeBase64: result.pointOfInteraction?.transactionData?.qrCodeBase64 || '',
    }
  }

  async createCreditCardPayment(data: CreditCardPaymentData, idempotencyKey: string): Promise<PaymentResult> {
    return this.createPayment(data, idempotencyKey)
  }

  async createPreference(data: PaymentData, idempotencyKey: string): Promise<{ id: string; initPoint: string; sandboxInitPoint: string }> {
    try {
      const preferenceData = {
        items: [
          {
            id: data.externalReference,
            title: data.description,
            quantity: 1,
            unit_price: data.amount,
            currency_id: data.currency,
          },
        ],
        payer: data.payer,
        payment_methods: {
          excluded_payment_methods: [],
          excluded_payment_types: [],
          installments: data.installments || 12,
        },
        back_urls: data.backUrls,
        notification_url: data.notificationUrl,
        external_reference: data.externalReference,
        metadata: data.metadata,
        expires: false,
      }

      const result = await this.preference.create({
        body: preferenceData,
        requestOptions: {
          idempotencyKey,
        },
      })

      return {
        id: result.id!,
        initPoint: result.init_point!,
        sandboxInitPoint: result.sandbox_init_point!,
      }
    } catch (error) {
      console.error('Mercado Pago preference creation error:', error)
      throw new Error(`Failed to create preference: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async getPayment(paymentId: string): Promise<PaymentResult> {
    try {
      const result = await this.payment.get({ id: paymentId })
      return this.mapPaymentResult(result)
    } catch (error) {
      console.error('Mercado Pago get payment error:', error)
      throw new Error(`Failed to get payment: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async refundPayment(paymentId: string, amount?: number, idempotencyKey?: string): Promise<PaymentResult> {
    try {
      const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}/refunds`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.client.accessToken}`,
          'Content-Type': 'application/json',
          ...(idempotencyKey && { 'X-Idempotency-Key': idempotencyKey }),
        },
        body: JSON.stringify(amount ? { amount } : {}),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`Refund failed: ${errorData.message || response.statusText}`)
      }

      const result = await response.json()
      return this.mapPaymentResult(result)
    } catch (error) {
      console.error('Mercado Pago refund error:', error)
      throw new Error(`Failed to refund payment: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async verifyWebhookSignature(payload: string, signature: string, secret: string): Promise<boolean> {
    try {
      // Verify Mercado Pago webhook signature
      // Format: ts=timestamp,v1=signature
      const parts = signature.split(',')
      const timestamp = parts.find(p => p.startsWith('ts='))?.split('=')[1]
      const v1Signature = parts.find(p => p.startsWith('v1='))?.split('=')[1]

      if (!timestamp || !v1Signature) {
        return false
      }

      // Check timestamp is not too old (5 minutes)
      const now = Math.floor(Date.now() / 1000)
      if (now - parseInt(timestamp) > 300) {
        return false
      }

      // Create expected signature
      const manifest = `id:${timestamp};request-id:${timestamp};ts:${timestamp}`
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(manifest)
        .digest('hex')

      return crypto.timingSafeEqual(Buffer.from(v1Signature), Buffer.from(expectedSignature))
    } catch (error) {
      console.error('Webhook signature verification error:', error)
      return false
    }
  }

  private mapPaymentResult(result: any): PaymentResult {
    return {
      id: result.id,
      status: result.status,
      statusDetail: result.status_detail,
      amount: result.transaction_amount || result.transactionAmount,
      currencyId: result.currency_id || result.currencyId,
      paymentMethodId: result.payment_method_id || result.paymentMethodId,
      paymentTypeId: result.payment_type_id || result.paymentTypeId,
      dateCreated: result.date_created || result.dateCreated,
      dateApproved: result.date_approved || result.dateApproved,
      externalReference: result.external_reference || result.externalReference,
      metadata: result.metadata,
      pointOfInteraction: result.point_of_interaction || result.pointOfInteraction,
    }
  }
}

export function getMercadoPagoConfig(): MercadoPagoConfigOptions {
  return {
    accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN!,
    publicKey: process.env.MERCADO_PAGO_PUBLIC_KEY,
    webhookSecret: process.env.MERCADO_PAGO_WEBHOOK_SECRET,
  }
}

export function createMercadoPagoProvider(sellerAccessToken?: string): MercadoPagoProvider {
  const config = getMercadoPagoConfig()
  if (sellerAccessToken) {
    return new MercadoPagoProvider({
      ...config,
      accessToken: sellerAccessToken,
    })
  }
  return new MercadoPagoProvider(config)
}