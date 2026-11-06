import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth/config'
import { z } from 'zod'

const settingSchema = z.object({
  key: z.string(),
  value: z.any(), // Required by default in z.any()
  type: z.enum(['string', 'number', 'boolean', 'json']),
  group: z.string(),
  label: z.string(),
  description: z.string().optional(),
  isPublic: z.boolean().default(false),
  siteId: z.string().optional(),
})

// Default settings
const defaultSettings = [
  // General
  { key: 'site_name', value: 'Marketplace', type: 'string', group: 'general', label: 'Nome do Site', isPublic: true },
  { key: 'site_description', value: 'Seu marketplace de confiança', type: 'string', group: 'general', label: 'Descrição do Site', isPublic: true },
  { key: 'site_logo', value: '', type: 'string', group: 'general', label: 'Logo do Site', isPublic: true },
  { key: 'site_favicon', value: '', type: 'string', group: 'general', label: 'Favicon', isPublic: true },
  { key: 'maintenance_mode', value: false, type: 'boolean', group: 'general', label: 'Modo Manutenção' },
  { key: 'maintenance_message', value: 'Estamos em manutenção, voltamos em breve!', type: 'string', group: 'general', label: 'Mensagem de Manutenção', isPublic: true },

  // Commission
  { key: 'default_commission_rate', value: 10, type: 'number', group: 'commission', label: 'Taxa de Comissão Padrão (%)' },
  { key: 'min_commission_rate', value: 5, type: 'number', group: 'commission', label: 'Taxa Mínima de Comissão (%)' },
  { key: 'max_commission_rate', value: 20, type: 'number', group: 'commission', label: 'Taxa Máxima de Comissão (%)' },

  // Payments
  { key: 'pix_enabled', value: true, type: 'boolean', group: 'payments', label: 'PIX Habilitado', isPublic: true },
  { key: 'credit_card_enabled', value: true, type: 'boolean', group: 'payments', label: 'Cartão de Crédito Habilitado', isPublic: true },
  { key: 'boleto_enabled', value: true, type: 'boolean', group: 'payments', label: 'Boleto Habilitado', isPublic: true },
  { key: 'mercado_pago_enabled', value: false, type: 'boolean', group: 'payments', label: 'Mercado Pago Habilitado', isPublic: true },
  { key: 'stripe_enabled', value: false, type: 'boolean', group: 'payments', label: 'Stripe Habilitado', isPublic: true },
  { key: 'mercado_pago_client_id', value: '', type: 'string', group: 'payments', label: 'Mercado Pago Client ID' },
  { key: 'mercado_pago_client_secret', value: '', type: 'string', group: 'payments', label: 'Mercado Pago Client Secret' },
  { key: 'stripe_publishable_key', value: '', type: 'string', group: 'payments', label: 'Stripe Publishable Key', isPublic: true },
  { key: 'stripe_secret_key', value: '', type: 'string', group: 'payments', label: 'Stripe Secret Key' },

  // Shipping
  { key: 'default_shipping_carrier', value: 'correios', type: 'string', group: 'shipping', label: 'Transportadora Padrão', isPublic: true },
  { key: 'free_shipping_min_value', value: 199.9, type: 'number', group: 'shipping', label: 'Valor Mínimo para Frete Grátis', isPublic: true },
  { key: 'shipping_correios_enabled', value: true, type: 'boolean', group: 'shipping', label: 'Correios Habilitado', isPublic: true },
  { key: 'shipping_jadlog_enabled', value: true, type: 'boolean', group: 'shipping', label: 'Jadlog Habilitado', isPublic: true },
  { key: 'shipping_azul_enabled', value: false, type: 'boolean', group: 'shipping', label: 'Azul Cargo Habilitado', isPublic: true },

  // Seller
  { key: 'seller_verification_required', value: true, type: 'boolean', group: 'seller', label: 'Verificação de Vendedor Obrigatória' },
  { key: 'seller_auto_approve', value: false, type: 'boolean', group: 'seller', label: 'Aprovação Automática de Vendedores' },
  { key: 'default_payout_schedule', value: 'weekly', type: 'string', group: 'seller', label: 'Agenda de Pagamento Padrão' },
  { key: 'min_payout_amount', value: 50, type: 'number', group: 'seller', label: 'Valor Mínimo para Saque' },

  // SEO
  { key: 'meta_title', value: 'Marketplace - Compre e Venda Online', type: 'string', group: 'seo', label: 'Título SEO', isPublic: true },
  { key: 'meta_description', value: 'Encontre os melhores produtos com preços imperdíveis. Entrega rápida e segura.', type: 'string', group: 'seo', label: 'Meta Description', isPublic: true },
  { key: 'meta_keywords', value: 'marketplace, compras online, ecommerce, ofertas', type: 'string', group: 'seo', label: 'Palavras-chave', isPublic: true },
  { key: 'og_image', value: '', type: 'string', group: 'seo', label: 'Imagem Open Graph', isPublic: true },

  // Email
  { key: 'smtp_host', value: '', type: 'string', group: 'email', label: 'SMTP Host' },
  { key: 'smtp_port', value: 587, type: 'number', group: 'email', label: 'SMTP Port' },
  { key: 'smtp_user', value: '', type: 'string', group: 'email', label: 'SMTP User' },
  { key: 'smtp_password', value: '', type: 'string', group: 'email', label: 'SMTP Password' },
  { key: 'email_from', value: 'noreply@marketplace.com', type: 'string', group: 'email', label: 'E-mail Remetente' },
  { key: 'email_support', value: 'suporte@marketplace.com', type: 'string', group: 'email', label: 'E-mail Suporte', isPublic: true },

  // Social
  { key: 'social_facebook', value: '', type: 'string', group: 'social', label: 'Facebook URL', isPublic: true },
  { key: 'social_instagram', value: '', type: 'string', group: 'social', label: 'Instagram URL', isPublic: true },
  { key: 'social_twitter', value: '', type: 'string', group: 'social', label: 'Twitter/X URL', isPublic: true },
  { key: 'social_youtube', value: '', type: 'string', group: 'social', label: 'YouTube URL', isPublic: true },
  { key: 'social_linkedin', value: '', type: 'string', group: 'social', label: 'LinkedIn URL', isPublic: true },
]

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    const settings = await prisma.setting.findMany({
      orderBy: { group: 'asc' },
    })

    // Merge with defaults
    const settingsMap = new Map(settings.map(s => [s.key, s]))
    const mergedSettings = defaultSettings.map(defaultSetting => {
      const existing = settingsMap.get(defaultSetting.key)
      return existing ? { ...defaultSetting, ...existing, value: existing.value } : defaultSetting
    })

    return NextResponse.json(mergedSettings)
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json({ message: 'Erro ao buscar configurações' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    const body = await req.json()
    const validated = settingSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        { message: validated.error.errors[0].message },
        { status: 400 }
      )
    }

    // Use compound unique key (key, siteId)
    const siteId = validated.data.siteId || null
    const setting = await prisma.setting.upsert({
      where: {
        key_siteId: {
          key: validated.data.key,
          siteId: siteId as string
        }
      },
      create: {
        ...validated.data,
        siteId,
        value: validated.data.value ?? ''
      },
      update: validated.data,
    })

    return NextResponse.json(setting)
  } catch (error) {
    console.error('Error creating/updating setting:', error)
    return NextResponse.json({ message: 'Erro ao salvar configuração' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    const body = await req.json()

    // Bulk update settings - only update existing settings
    const results = await Promise.all(
      Object.entries(body).map(async ([key, value]) => {
        if (typeof value === 'object' && value !== null && 'value' in value) {
          const setting = value as { value: any; siteId?: string }
          const siteId = setting.siteId || null
          return prisma.setting.update({
            where: { key_siteId: { key, siteId: siteId as string } },
            data: { value: setting.value },
          })
        }
        // For simple value updates, find the setting first
        const existing = await prisma.setting.findFirst({ where: { key } })
        if (existing) {
          return prisma.setting.update({
            where: { id: existing.id },
            data: { value: value as any },
          })
        }
        return null
      })
    )

    return NextResponse.json({ message: 'Configurações salvas com sucesso', results: results.filter(Boolean) })
  } catch (error) {
    console.error('Error bulk updating settings:', error)
    return NextResponse.json({ message: 'Erro ao salvar configurações' }, { status: 500 })
  }
}