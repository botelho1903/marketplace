import { UserRole, UserStatus, ProductStatus, OrderStatus, PaymentStatus, PaymentMethod, ShippingStatus, ProductType, DigitalDeliveryType, LicenseKeyStatus } from '@prisma/client'

export type { UserRole, UserStatus, ProductStatus, OrderStatus, PaymentStatus, PaymentMethod, ShippingStatus, ProductType, DigitalDeliveryType, LicenseKeyStatus }

export interface User {
  id: string
  email: string
  name: string
  phone?: string | null
  avatar?: string | null
  role: UserRole
  status: UserStatus
  emailVerified?: Date | null
  phoneVerified?: Date | null
  lastLoginAt?: Date | null
  createdAt: Date
  updatedAt: Date
  licenseKeys?: LicenseKey[]
}

export interface Category {
  id: string
  name: string
  slug: string
  description?: string | null
  image?: string | null
  icon?: string | null
  parentId?: string | null
  parent?: Category | null
  children?: Category[]
  sortOrder: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface ProductImage {
  id: string
  url: string
  alt?: string | null
  sortOrder: number
  isPrimary: boolean
}

export interface ProductVariant {
  id: string
  name: string
  sku: string
  price: number
  compareAtPrice?: number | null
  stock: number
  weight?: number | null
  dimensions?: Record<string, unknown> | null
  isActive: boolean
  attributeValues: ProductVariantAttributeValue[]
}

export interface ProductVariantAttributeValue {
  id: string
  variantId: string
  attributeValueId: string
  attributeValue: AttributeValue
}

export interface Attribute {
  id: string
  name: string
  slug: string
  type: string
  isRequired: boolean
  isFilterable: boolean
  sortOrder: number
  values: AttributeValue[]
}

export interface AttributeValue {
  id: string
  value: string
  color?: string | null
  image?: string | null
  sortOrder: number
}

export interface ProductAttribute {
  id: string
  productId: string
  attributeId: string
  attribute: Attribute
  values: AttributeValue[]
}

export interface DigitalFile {
  id: string
  name: string
  url: string
  size: number
  mimeType: string
  sortOrder: number
  productId: string
  createdAt: Date
}

export interface LicenseKey {
  id: string
  key: string
  productId: string
  orderId?: string | null
  userId?: string | null
  status: LicenseKeyStatus
  activatedAt?: Date | null
  expiresAt?: Date | null
  createdAt: Date
  updatedAt: Date
}

export interface Product {
  id: string
  sku: string
  name: string
  slug: string
  description: string
  shortDescription?: string | null
  basePrice: number
  salePrice?: number | null
  costPrice?: number | null
  compareAtPrice?: number | null
  stock: number
  reservedStock: number
  lowStockThreshold: number
  trackInventory: boolean
  allowBackorder: boolean
  weight?: number | null
  dimensions?: Record<string, unknown> | null
  status: ProductStatus
  isFeatured: boolean
  type: ProductType

  // Physical product fields
  shippingClass?: string | null
  warehouseLocation?: string | null
  requiresShipping: boolean
  shippingWeight?: number | null
  shippingDimensions?: Record<string, unknown> | null

  // Digital product fields
  isDigital: boolean
  digitalFileUrl?: string | null
  digitalDeliveryType?: DigitalDeliveryType | null
  downloadLimit?: number | null
  downloadExpiryDays?: number | null
  licenseKeyTemplate?: string | null
  requiresActivation: boolean
  activationUrl?: string | null
  maxActivations?: number | null

  tags: string[]
  metaTitle?: string | null
  metaDescription?: string | null
  sellerId: string
  categoryId: string
  createdAt: Date
  updatedAt: Date
  publishedAt?: Date | null
  images: ProductImage[]
  variants: ProductVariant[]
  attributes: ProductAttribute[]
  digitalFiles: DigitalFile[]
  licenseKeys: LicenseKey[]
  category?: Category
  seller?: User
  reviews?: Review[]
  _count?: {
    reviews: number
    favorites: number
  }
}

export interface Review {
  id: string
  rating: number
  title?: string | null
  comment?: string | null
  isVerified: boolean
  isApproved: boolean
  helpfulCount: number
  productId: string
  userId: string
  user?: User
  createdAt: Date
  updatedAt: Date
  images?: ReviewImage[]
}

export interface ReviewImage {
  id: string
  url: string
}

export interface Address {
  id: string
  userId: string
  type: string
  name: string
  phone: string
  cep: string
  street: string
  number: string
  complement?: string | null
  neighborhood: string
  city: string
  state: string
  country: string
  isDefault: boolean
  createdAt: Date
  updatedAt: Date
}

export interface OrderItem {
  id: string
  quantity: number
  unitPrice: number
  totalPrice: number
  productName: string
  productSku: string
  variantName?: string | null
  variantSku?: string | null
  productImage?: string | null
  productId: string
  variantId?: string | null
  product?: Product
  variant?: ProductVariant
}

export interface Payment {
  id: string
  paymentId: string
  amount: number
  currency: string
  method: PaymentMethod
  status: PaymentStatus
  gatewayResponse?: Record<string, unknown> | null
  processedAt?: Date | null
  createdAt: Date
}

export interface ShipmentEvent {
  id: string
  status: ShippingStatus
  location?: string | null
  description: string
  occurredAt: Date
}

export interface Shipment {
  id: string
  trackingNumber: string
  carrier: string
  service?: string | null
  status: ShippingStatus
  shippingCost: number
  estimatedDelivery?: Date | null
  deliveredAt?: Date | null
  trackingUrl?: string | null
  events: ShipmentEvent[]
}

export interface OrderStatusHistory {
  id: string
  status: OrderStatus
  note?: string | null
  createdBy?: string | null
  createdAt: Date
}

export interface Order {
  id: string
  orderNumber: string
  status: OrderStatus
  paymentStatus: PaymentStatus
  shippingStatus: ShippingStatus
  subtotal: number
  discountAmount: number
  shippingAmount: number
  taxAmount: number
  total: number
  currency: string
  notes?: string | null
  buyerId: string
  sellerId?: string | null
  shippingAddressId?: string | null
  billingAddressId?: string | null
  couponId?: string | null
  paidAt?: Date | null
  shippedAt?: Date | null
  deliveredAt?: Date | null
  cancelledAt?: Date | null
  createdAt: Date
  updatedAt: Date
  items: OrderItem[]
  payments: Payment[]
  shipments: Shipment[]
  statusHistory: OrderStatusHistory[]
  shippingAddress?: Address
  billingAddress?: Address
  buyer?: User
  seller?: User
  licenseKeys?: LicenseKey[]
}

export interface CartItem {
  id: string
  quantity: number
  userId: string
  productId: string
  variantId?: string | null
  product: Product
  variant?: ProductVariant
  createdAt: Date
  updatedAt: Date
}

export interface Coupon {
  id: string
  code: string
  name: string
  description?: string | null
  type: string
  value: number
  minAmount?: number | null
  maxDiscount?: number | null
  usageLimit?: number | null
  usedCount: number
  userLimit: number
  startsAt: Date
  expiresAt: Date
  isActive: boolean
  applicableTo: string
}

export interface Wallet {
  id: string
  userId: string
  balance: number
  pendingBalance: number
  currency: string
}

export interface WalletTransaction {
  id: string
  type: string
  amount: number
  balanceAfter: number
  description?: string | null
  referenceId?: string | null
  referenceType?: string | null
  createdAt: Date
}

export interface SellerProfile {
  id: string
  userId: string
  storeName: string
  storeSlug: string
  storeDescription?: string | null
  storeLogo?: string | null
  storeBanner?: string | null
  cnpj?: string | null
  corporateName?: string | null
  phone?: string | null
  email?: string | null
  website?: string | null
  isVerified: boolean
  verifiedAt?: Date | null
  commissionRate: number
  payoutSchedule: string
  bankAccount?: Record<string, unknown> | null
  pixKey?: string | null
}

export interface Notification {
  id: string
  userId: string
  type: string
  title: string
  message: string
  data?: Record<string, unknown> | null
  isRead: boolean
  readAt?: Date | null
  createdAt: Date
}

export interface Setting {
  id: string
  key: string
  value: Record<string, unknown>
  type: string
  group: string
  label: string
  description?: string | null
  isPublic: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: Record<string, unknown>
  }
  meta?: Record<string, unknown>
}

export type ProductFilters = {
  category?: string
  minPrice?: number
  maxPrice?: number
  status?: ProductStatus
  isFeatured?: boolean
  tags?: string[]
  sellerId?: string
  search?: string
  sortBy?: 'newest' | 'oldest' | 'price_asc' | 'price_desc' | 'best_selling' | 'rating'
  page?: number
  limit?: number
}

export type OrderFilters = {
  status?: OrderStatus
  paymentStatus?: PaymentStatus
  buyerId?: string
  sellerId?: string
  startDate?: Date
  endDate?: Date
  page?: number
  limit?: number
}

export interface DashboardStats {
  totalUsers: number
  totalProducts: number
  totalOrders: number
  totalRevenue: number
  ordersToday: number
  revenueToday: number
  newUsersToday: number
  pendingOrders: number
  lowStockProducts: number
}

export interface SellerPaymentSettings {
  hasMercadoPagoCredentials: boolean
  mercadopagoPublicKey?: string | null
  mercadopagoUserId?: string | null
  mercadopagoConnectedAt?: Date | null
  pixKey?: string | null
  bankAccount?: Record<string, unknown> | null
  commissionRate: number
  payoutSchedule: string
}

export interface PaymentVerificationResult {
  verified: boolean
  payment?: {
    id: string
    paymentId: string
    status: PaymentStatus
    gatewayStatus?: string
    gatewayStatusDetail?: string
    amount: number
    method: PaymentMethod
    processedAt?: Date | null
  } | null
  error?: string
}

export interface AuditLog {
  id: string
  action: string
  entityType: string
  entityId: string
  userId?: string | null
  sellerId?: string | null
  oldData?: Record<string, unknown> | null
  newData?: Record<string, unknown> | null
  metadata?: Record<string, unknown> | null
  ipAddress?: string | null
  userAgent?: string | null
  createdAt: Date
  user?: User
  seller?: User
}

export type AuditLogFilters = {
  action?: string
  entityType?: string
  entityId?: string
  userId?: string
  sellerId?: string
  dateFrom?: Date
  dateTo?: Date
  page?: number
  limit?: number
}