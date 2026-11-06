import { z } from 'zod'

export const registerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres').max(100),
  confirmPassword: z.string(),
  phone: z.string().optional(),
  acceptTerms: z.boolean().refine((val) => val === true, 'Você deve aceitar os termos'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Senhas não coincidem',
  path: ['confirmPassword'],
})

export const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
  rememberMe: z.boolean().optional(),
})

export const forgotPasswordSchema = z.object({
  email: z.string().email('E-mail inválido'),
})

export const resetPasswordSchema = z.object({
  password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres').max(100),
  confirmPassword: z.string(),
  token: z.string().min(1, 'Token é obrigatório'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Senhas não coincidem',
  path: ['confirmPassword'],
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Senha atual é obrigatória'),
  newPassword: z.string().min(8, 'Nova senha deve ter pelo menos 8 caracteres').max(100),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Senhas não coincidem',
  path: ['confirmPassword'],
})

export const addressSchema = z.object({
  type: z.enum(['shipping', 'billing']).default('shipping'),
  name: z.string().min(2, 'Nome completo é obrigatório').max(100),
  phone: z.string().min(10, 'Telefone inválido').max(20),
  cep: z.string().regex(/^\d{5}-?\d{3}$/, 'CEP inválido'),
  street: z.string().min(3, 'Rua é obrigatória').max(200),
  number: z.string().min(1, 'Número é obrigatório').max(20),
  complement: z.string().max(100).optional(),
  neighborhood: z.string().min(2, 'Bairro é obrigatório').max(100),
  city: z.string().min(2, 'Cidade é obrigatória').max(100),
  state: z.string().length(2, 'Estado deve ter 2 letras'),
  country: z.string().default('Brasil'),
  isDefault: z.boolean().default(false),
})

const physicalProductSchema = z.object({
  type: z.literal('PHYSICAL'),
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres').max(200),
  slug: z.string().min(3, 'Slug deve ter pelo menos 3 caracteres').max(220).optional(),
  description: z.string().min(10, 'Descrição deve ter pelo menos 10 caracteres'),
  shortDescription: z.string().max(500).optional(),
  basePrice: z.number().positive('Preço deve ser maior que zero'),
  salePrice: z.number().positive().optional().nullable(),
  costPrice: z.number().positive().optional().nullable(),
  compareAtPrice: z.number().positive().optional().nullable(),
  stock: z.number().int().min(0).default(0),
  lowStockThreshold: z.number().int().min(0).default(5),
  trackInventory: z.boolean().default(true),
  allowBackorder: z.boolean().default(false),
  weight: z.number().positive().optional().nullable(),
  dimensions: z.object({
    length: z.number().positive(),
    width: z.number().positive(),
    height: z.number().positive(),
  }).optional().nullable(),
  categoryId: z.string().min(1, 'Categoria é obrigatória'),
  tags: z.array(z.string()).default([]),
  metaTitle: z.string().max(60).optional(),
  metaDescription: z.string().max(160).optional(),
  isFeatured: z.boolean().default(false),
  isDigital: z.boolean().default(false),
  digitalFileUrl: z.string().url().optional().nullable(),
  // Physical product specific fields
  shippingClass: z.enum(['normal', 'fragile', 'hazardous']).optional(),
  warehouseLocation: z.string().optional(),
  requiresShipping: z.boolean().default(true),
  shippingWeight: z.number().positive().optional().nullable(),
  shippingDimensions: z.object({
    length: z.number().positive(),
    width: z.number().positive(),
    height: z.number().positive(),
  }).optional().nullable(),
  images: z.array(z.object({
    url: z.string().url('URL da imagem inválida'),
    alt: z.string().optional(),
    isPrimary: z.boolean().default(false),
  })).min(1, 'Pelo menos uma imagem é obrigatória'),
  variants: z.array(z.object({
    name: z.string().min(1, 'Nome da variação é obrigatório'),
    sku: z.string().optional(),
    price: z.number().positive('Preço deve ser maior que zero'),
    compareAtPrice: z.number().positive().optional().nullable(),
    stock: z.number().int().min(0).default(0),
    weight: z.number().positive().optional().nullable(),
    dimensions: z.object({
      length: z.number().positive(),
      width: z.number().positive(),
      height: z.number().positive(),
    }).optional().nullable(),
    isActive: z.boolean().default(true),
    attributeValues: z.array(z.object({
      attributeValueId: z.string(),
    })).optional(),
  })).optional(),
  attributes: z.array(z.object({
    attributeId: z.string(),
    valueIds: z.array(z.string()),
  })).optional(),
})

const digitalProductSchema = z.object({
  type: z.literal('DIGITAL'),
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres').max(200),
  slug: z.string().min(3, 'Slug deve ter pelo menos 3 caracteres').max(220).optional(),
  description: z.string().min(10, 'Descrição deve ter pelo menos 10 caracteres'),
  shortDescription: z.string().max(500).optional(),
  basePrice: z.number().positive('Preço deve ser maior que zero'),
  salePrice: z.number().positive().optional().nullable(),
  costPrice: z.number().positive().optional().nullable(),
  compareAtPrice: z.number().positive().optional().nullable(),
  stock: z.number().int().min(0).default(0),
  lowStockThreshold: z.number().int().min(0).default(5),
  trackInventory: z.boolean().default(false),
  allowBackorder: z.boolean().default(true),
  weight: z.number().positive().optional().nullable(),
  dimensions: z.object({
    length: z.number().positive(),
    width: z.number().positive(),
    height: z.number().positive(),
  }).optional().nullable(),
  categoryId: z.string().min(1, 'Categoria é obrigatória'),
  tags: z.array(z.string()).default([]),
  metaTitle: z.string().max(60).optional(),
  metaDescription: z.string().max(160).optional(),
  isFeatured: z.boolean().default(false),
  isDigital: z.boolean().default(true),
  digitalFileUrl: z.string().url().optional().nullable(),
  // Digital product specific fields
  digitalDeliveryType: z.enum(['EMAIL', 'ACCOUNT', 'LICENSE_KEY', 'DOWNLOAD_LINK']).optional(),
  downloadLimit: z.number().int().min(0).default(0),
  downloadExpiryDays: z.number().int().positive().optional().nullable(),
  licenseKeyTemplate: z.string().optional().nullable(),
  requiresActivation: z.boolean().default(false),
  activationUrl: z.string().url().optional().nullable(),
  maxActivations: z.number().int().positive().default(1),
  digitalFiles: z.array(z.object({
    name: z.string().min(1, 'Nome do arquivo é obrigatório'),
    url: z.string().url('URL do arquivo inválida'),
    size: z.number().int().positive('Tamanho deve ser maior que zero'),
    mimeType: z.string().min(1, 'Tipo MIME é obrigatório'),
    sortOrder: z.number().int().default(0),
  })).optional(),
  images: z.array(z.object({
    url: z.string().url('URL da imagem inválida'),
    alt: z.string().optional(),
    isPrimary: z.boolean().default(false),
  })).min(1, 'Pelo menos uma imagem é obrigatória'),
  variants: z.array(z.object({
    name: z.string().min(1, 'Nome da variação é obrigatório'),
    sku: z.string().optional(),
    price: z.number().positive('Preço deve ser maior que zero'),
    compareAtPrice: z.number().positive().optional().nullable(),
    stock: z.number().int().min(0).default(0),
    weight: z.number().positive().optional().nullable(),
    dimensions: z.object({
      length: z.number().positive(),
      width: z.number().positive(),
      height: z.number().positive(),
    }).optional().nullable(),
    isActive: z.boolean().default(true),
    attributeValues: z.array(z.object({
      attributeValueId: z.string(),
    })).optional(),
  })).optional(),
  attributes: z.array(z.object({
    attributeId: z.string(),
    valueIds: z.array(z.string()),
  })).optional(),
})

const serviceProductSchema = z.object({
  type: z.literal('SERVICE'),
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres').max(200),
  slug: z.string().min(3, 'Slug deve ter pelo menos 3 caracteres').max(220).optional(),
  description: z.string().min(10, 'Descrição deve ter pelo menos 10 caracteres'),
  shortDescription: z.string().max(500).optional(),
  basePrice: z.number().positive('Preço deve ser maior que zero'),
  salePrice: z.number().positive().optional().nullable(),
  costPrice: z.number().positive().optional().nullable(),
  compareAtPrice: z.number().positive().optional().nullable(),
  stock: z.number().int().min(0).default(0),
  lowStockThreshold: z.number().int().min(0).default(5),
  trackInventory: z.boolean().default(false),
  allowBackorder: z.boolean().default(true),
  weight: z.number().positive().optional().nullable(),
  dimensions: z.object({
    length: z.number().positive(),
    width: z.number().positive(),
    height: z.number().positive(),
  }).optional().nullable(),
  categoryId: z.string().min(1, 'Categoria é obrigatória'),
  tags: z.array(z.string()).default([]),
  metaTitle: z.string().max(60).optional(),
  metaDescription: z.string().max(160).optional(),
  isFeatured: z.boolean().default(false),
  isDigital: z.boolean().default(false),
  digitalFileUrl: z.string().url().optional().nullable(),
  images: z.array(z.object({
    url: z.string().url('URL da imagem inválida'),
    alt: z.string().optional(),
    isPrimary: z.boolean().default(false),
  })).min(1, 'Pelo menos uma imagem é obrigatória'),
  variants: z.array(z.object({
    name: z.string().min(1, 'Nome da variação é obrigatório'),
    sku: z.string().optional(),
    price: z.number().positive('Preço deve ser maior que zero'),
    compareAtPrice: z.number().positive().optional().nullable(),
    stock: z.number().int().min(0).default(0),
    weight: z.number().positive().optional().nullable(),
    dimensions: z.object({
      length: z.number().positive(),
      width: z.number().positive(),
      height: z.number().positive(),
    }).optional().nullable(),
    isActive: z.boolean().default(true),
    attributeValues: z.array(z.object({
      attributeValueId: z.string(),
    })).optional(),
  })).optional(),
  attributes: z.array(z.object({
    attributeId: z.string(),
    valueIds: z.array(z.string()),
  })).optional(),
})

const subscriptionProductSchema = z.object({
  type: z.literal('SUBSCRIPTION'),
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres').max(200),
  slug: z.string().min(3, 'Slug deve ter pelo menos 3 caracteres').max(220).optional(),
  description: z.string().min(10, 'Descrição deve ter pelo menos 10 caracteres'),
  shortDescription: z.string().max(500).optional(),
  basePrice: z.number().positive('Preço deve ser maior que zero'),
  salePrice: z.number().positive().optional().nullable(),
  costPrice: z.number().positive().optional().nullable(),
  compareAtPrice: z.number().positive().optional().nullable(),
  stock: z.number().int().min(0).default(0),
  lowStockThreshold: z.number().int().min(0).default(5),
  trackInventory: z.boolean().default(false),
  allowBackorder: z.boolean().default(true),
  weight: z.number().positive().optional().nullable(),
  dimensions: z.object({
    length: z.number().positive(),
    width: z.number().positive(),
    height: z.number().positive(),
  }).optional().nullable(),
  categoryId: z.string().min(1, 'Categoria é obrigatória'),
  tags: z.array(z.string()).default([]),
  metaTitle: z.string().max(60).optional(),
  metaDescription: z.string().max(160).optional(),
  isFeatured: z.boolean().default(false),
  isDigital: z.boolean().default(false),
  digitalFileUrl: z.string().url().optional().nullable(),
  images: z.array(z.object({
    url: z.string().url('URL da imagem inválida'),
    alt: z.string().optional(),
    isPrimary: z.boolean().default(false),
  })).min(1, 'Pelo menos uma imagem é obrigatória'),
  variants: z.array(z.object({
    name: z.string().min(1, 'Nome da variação é obrigatório'),
    sku: z.string().optional(),
    price: z.number().positive('Preço deve ser maior que zero'),
    compareAtPrice: z.number().positive().optional().nullable(),
    stock: z.number().int().min(0).default(0),
    weight: z.number().positive().optional().nullable(),
    dimensions: z.object({
      length: z.number().positive(),
      width: z.number().positive(),
      height: z.number().positive(),
    }).optional().nullable(),
    isActive: z.boolean().default(true),
    attributeValues: z.array(z.object({
      attributeValueId: z.string(),
    })).optional(),
  })).optional(),
  attributes: z.array(z.object({
    attributeId: z.string(),
    valueIds: z.array(z.string()),
  })).optional(),
})

export const productSchema = z.discriminatedUnion('type', [
  physicalProductSchema,
  digitalProductSchema,
  serviceProductSchema,
  subscriptionProductSchema,
])

export const categorySchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100),
  slug: z.string().min(2, 'Slug deve ter pelo menos 2 caracteres').max(120).optional(),
  description: z.string().max(1000).optional(),
  image: z.string().url().optional().nullable(),
  icon: z.string().optional(),
  parentId: z.string().optional().nullable(),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
})

export const reviewSchema = z.object({
  rating: z.number().int().min(1, 'Avaliação mínima é 1 estrela').max(5, 'Avaliação máxima é 5 estrelas'),
  title: z.string().max(100).optional(),
  comment: z.string().min(10, 'Comentário deve ter pelo menos 10 caracteres').max(2000).optional(),
  images: z.array(z.string().url()).max(5).optional(),
})

export const couponSchema = z.object({
  code: z.string().min(3, 'Código deve ter pelo menos 3 caracteres').max(30).toUpperCase(),
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100),
  description: z.string().max(500).optional(),
  type: z.enum(['percentage', 'fixed', 'free_shipping']).default('percentage'),
  value: z.number().positive('Valor deve ser maior que zero'),
  minAmount: z.number().positive().optional().nullable(),
  maxDiscount: z.number().positive().optional().nullable(),
  usageLimit: z.number().int().positive().optional().nullable(),
  userLimit: z.number().int().positive().default(1),
  startsAt: z.date(),
  expiresAt: z.date(),
  isActive: z.boolean().default(true),
  applicableTo: z.enum(['all', 'categories', 'products', 'first_order']).default('all'),
  categoryIds: z.array(z.string()).optional(),
  productIds: z.array(z.string()).optional(),
})

export const checkoutSchema = z.object({
  shippingAddressId: z.string().min(1, 'Endereço de entrega é obrigatório'),
  billingAddressId: z.string().optional(),
  paymentMethod: z.enum(['credit_card', 'debit_card', 'pix', 'boleto', 'mercado_pago', 'stripe', 'wallet']),
  couponCode: z.string().optional(),
  notes: z.string().max(1000).optional(),
  saveAddresses: z.boolean().default(false),
})

export const sellerProfileSchema = z.object({
  storeName: z.string().min(2, 'Nome da loja deve ter pelo menos 2 caracteres').max(100),
  storeSlug: z.string().min(2, 'Slug da loja deve ter pelo menos 2 caracteres').max(120).regex(/^[a-z0-9-]+$/, 'Slug deve conter apenas letras minúsculas, números e hífen'),
  storeDescription: z.string().max(2000).optional(),
  storeLogo: z.string().url().optional().nullable(),
  storeBanner: z.string().url().optional().nullable(),
  cnpj: z.string().regex(/^\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}$/, 'CNPJ inválido').optional().nullable(),
  corporateName: z.string().max(200).optional(),
  phone: z.string().min(10, 'Telefone inválido').max(20).optional(),
  email: z.string().email('E-mail inválido').optional().nullable(),
  website: z.string().url('URL inválida').optional().nullable(),
  pixKey: z.string().max(100).optional().nullable(),
  bankAccount: z.object({
    bankCode: z.string(),
    agency: z.string(),
    agencyDigit: z.string().optional(),
    account: z.string(),
    accountDigit: z.string(),
    accountType: z.enum(['checking', 'savings']),
    documentType: z.enum(['cpf', 'cnpj']),
    documentNumber: z.string(),
    legalName: z.string(),
  }).optional().nullable(),
})

export const profileSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100),
  phone: z.string().min(10, 'Telefone inválido').max(20).optional(),
  avatar: z.string().url().optional().nullable(),
})

export const notificationPreferencesSchema = z.object({
  emailOrders: z.boolean().default(true),
  emailPromotions: z.boolean().default(true),
  emailNewsletter: z.boolean().default(false),
  pushOrders: z.boolean().default(true),
  pushPromotions: z.boolean().default(false),
  smsOrders: z.boolean().default(false),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>
export type AddressInput = z.infer<typeof addressSchema>
export type ProductInput = z.infer<typeof productSchema>
export type CategoryInput = z.infer<typeof categorySchema>
export type ReviewInput = z.infer<typeof reviewSchema>
export type CouponInput = z.infer<typeof couponSchema>
export type CheckoutInput = z.infer<typeof checkoutSchema>
export type SellerProfileInput = z.infer<typeof sellerProfileSchema>
export type ProfileInput = z.infer<typeof profileSchema>
export type NotificationPreferencesInput = z.infer<typeof notificationPreferencesSchema>