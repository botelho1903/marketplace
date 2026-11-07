import { z } from 'zod'

// PIX key validation - supports CPF, CNPJ, email, phone, random key
const pixKeyRegex = {
  cpf: /^\d{11}$/,
  cnpj: /^\d{14}$/,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^\+?55\d{10,11}$/,
  random: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
}

function validatePixKey(key: string): { valid: boolean; type?: string } {
  if (pixKeyRegex.cpf.test(key)) return { valid: true, type: 'CPF' }
  if (pixKeyRegex.cnpj.test(key)) return { valid: true, type: 'CNPJ' }
  if (pixKeyRegex.email.test(key)) return { valid: true, type: 'EMAIL' }
  if (pixKeyRegex.phone.test(key)) return { valid: true, type: 'PHONE' }
  if (pixKeyRegex.random.test(key)) return { valid: true, type: 'RANDOM' }
  return { valid: false }
}

// Payment creation schema
export const createPaymentSchema = z.object({
  orderId: z.string().cuid({ message: 'orderId deve ser um CUID válido' }),
  paymentMethod: z.enum(['PIX', 'CREDIT_CARD', 'DINHEIRO', 'CASH_ON_DELIVERY'], {
    errorMap: () => ({ message: 'Método de pagamento inválido. Use: PIX, CREDIT_CARD, DINHEIRO ou CASH_ON_DELIVERY' }),
  }),
  creditCardToken: z.string().optional(),
  creditCardInstallments: z.number().int().min(1).max(12).optional(),
  creditCardIssuerId: z.number().int().positive().optional(),
  creditCardPaymentMethodId: z.string().optional(),
  cardholderIdentification: z.object({
    type: z.enum(['CPF', 'CNPJ']).default('CPF'),
    number: z.string().min(11).max(18),
  }).optional(),
  cardholderName: z.string().min(3).max(100).optional(),
  metadata: z.record(z.unknown()).optional(),
}).refine(
  (data) => {
    if (data.paymentMethod === 'CREDIT_CARD') {
      return data.creditCardToken && data.creditCardInstallments && data.creditCardPaymentMethodId
    }
    return true
  },
  {
    message: 'Para pagamento com cartão de crédito, são obrigatórios: creditCardToken, creditCardInstallments e creditCardPaymentMethodId',
    path: ['creditCardToken'],
  }
)

// Seller payment settings schema
export const sellerPaymentSettingsSchema = z.object({
  mercadopagoAccessToken: z.string().min(10).optional(),
  mercadopagoPublicKey: z.string().min(10).optional(),
  mercadopagoUserId: z.string().optional(),
  pixKey: z.string().refine(
    (key) => !key || validatePixKey(key).valid,
    { message: 'Chave PIX inválida. Use CPF, CNPJ, email, telefone ou chave aleatória' }
  ).optional(),
  bankAccount: z.object({
    bankCode: z.string().length(3),
    agency: z.string().max(10),
    agencyDigit: z.string().max(2).optional(),
    account: z.string().max(20),
    accountDigit: z.string().max(2),
    accountType: z.enum(['CHECKING', 'SAVINGS']),
    documentNumber: z.string().min(11).max(18),
    legalName: z.string().min(3).max(100),
  }).optional(),
  commissionRate: z.number().min(0).max(100).optional(),
  payoutSchedule: z.enum(['daily', 'weekly', 'monthly']).optional(),
})

// Webhook notification schema
export const mercadoPagoWebhookSchema = z.object({
  id: z.number().int().positive(),
  type: z.enum(['payment', 'preference', 'merchant_order', 'subscription', 'invoice']),
  action: z.enum(['created', 'updated', 'deleted']),
  data: z.object({
    id: z.string(),
  }),
  date_created: z.string().datetime(),
  live_mode: z.boolean(),
  application_id: z.string().optional(),
  user_id: z.number().int().positive().optional(),
  version: z.number().int().optional(),
  api_version: z.string().optional(),
})

// Payment verification schema
export const verifyPaymentSchema = z.object({
  paymentId: z.string().cuid().optional(),
  orderId: z.string().cuid().optional(),
}).refine(
  (data) => data.paymentId || data.orderId,
  { message: 'paymentId ou orderId é obrigatório', path: ['paymentId'] }
)

// Refund schema
export const refundPaymentSchema = z.object({
  paymentId: z.string().cuid({ message: 'paymentId deve ser um CUID válido' }),
  amount: z.number().positive().optional(),
  reason: z.string().max(500).optional(),
})

// Cash payment confirmation by seller
export const confirmCashPaymentSchema = z.object({
  paymentId: z.string().cuid({ message: 'paymentId deve ser um CUID válido' }),
  confirmationNote: z.string().max(500).optional(),
})

// Payment status query schema
export const paymentQuerySchema = z.object({
  orderId: z.string().cuid().optional(),
  paymentId: z.string().cuid().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
})

// Seller payout schema
export const sellerPayoutSchema = z.object({
  sellerId: z.string().cuid(),
  amount: z.number().positive(),
  bankAccount: z.object({
    bankCode: z.string().length(3),
    agency: z.string().max(10),
    agencyDigit: z.string().max(2).optional(),
    account: z.string().max(20),
    accountDigit: z.string().max(2),
    accountType: z.enum(['CHECKING', 'SAVINGS']),
    documentNumber: z.string().min(11).max(18),
    legalName: z.string().min(3).max(100),
  }),
})

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>
export type SellerPaymentSettingsInput = z.infer<typeof sellerPaymentSettingsSchema>
export type VerifyPaymentInput = z.infer<typeof verifyPaymentSchema>
export type RefundPaymentInput = z.infer<typeof refundPaymentSchema>
export type ConfirmCashPaymentInput = z.infer<typeof confirmCashPaymentSchema>
export type PaymentQueryInput = z.infer<typeof paymentQuerySchema>
export type SellerPayoutInput = z.infer<typeof sellerPayoutSchema>
export { validatePixKey }