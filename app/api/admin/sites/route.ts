import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth/config'
import { z } from 'zod'

const siteSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  domain: z.string().min(3, 'Domínio inválido'),
  subdomain: z.string().regex(/^[a-z0-9-]+$/, 'Subdomínio deve conter apenas letras minúsculas, números e hífens').optional().or(z.literal('')),
  description: z.string().optional(),
  logo: z.string().url().optional().or(z.literal('')),
  favicon: z.string().url().optional().or(z.literal('')),
  isActive: z.boolean().default(true),
  theme: z.any().optional(),
  settings: z.any().optional(),
  defaultCurrency: z.string().default('BRL'),
  defaultLocale: z.string().default('pt-BR'),
  timezone: z.string().default('America/Sao_Paulo'),
})

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    const sites = await prisma.site.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        _count: { select: { products: true, categories: true, orders: true, users: true } },
      },
    })

    return NextResponse.json(sites)
  } catch (error) {
    console.error('Error fetching sites:', error)
    return NextResponse.json({ message: 'Erro ao buscar sites' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    const body = await req.json()
    const validated = siteSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        { message: validated.error.errors[0].message },
        { status: 400 }
      )
    }

    // Check if domain is unique
    const existingDomain = await prisma.site.findUnique({
      where: { domain: validated.data.domain },
    })
    if (existingDomain) {
      return NextResponse.json({ message: 'Este domínio já está em uso' }, { status: 400 })
    }

    // Check if subdomain is unique
    if (validated.data.subdomain) {
      const existingSubdomain = await prisma.site.findUnique({
        where: { subdomain: validated.data.subdomain },
      })
      if (existingSubdomain) {
        return NextResponse.json({ message: 'Este subdomínio já está em uso' }, { status: 400 })
      }
    }

    // If this is the first site, make it primary
    const siteCount = await prisma.site.count()
    const isPrimary = siteCount === 0

    const site = await prisma.site.create({
      data: {
        ...validated.data,
        ownerId: (session.user as any).id,
        isPrimary,
      },
      include: {
        owner: { select: { id: true, name: true, email: true } },
      },
    })

    // Create default settings for the site
    const defaultSettings = [
      { key: 'site_name', value: site.name, type: 'string', group: 'general', label: 'Nome do Site', isPublic: true, siteId: site.id },
      { key: 'site_description', value: site.description || '', type: 'string', group: 'general', label: 'Descrição do Site', isPublic: true, siteId: site.id },
      { key: 'default_commission_rate', value: 10, type: 'number', group: 'commission', label: 'Taxa de Comissão Padrão (%)', siteId: site.id },
      { key: 'pix_enabled', value: true, type: 'boolean', group: 'payments', label: 'PIX Habilitado', isPublic: true, siteId: site.id },
      { key: 'credit_card_enabled', value: true, type: 'boolean', group: 'payments', label: 'Cartão de Crédito Habilitado', isPublic: true, siteId: site.id },
      { key: 'boleto_enabled', value: true, type: 'boolean', group: 'payments', label: 'Boleto Habilitado', isPublic: true, siteId: site.id },
      { key: 'free_shipping_min_value', value: 199.9, type: 'number', group: 'shipping', label: 'Valor Mínimo para Frete Grátis', isPublic: true, siteId: site.id },
    ]

    await prisma.setting.createMany({ data: defaultSettings })

    // Create a default category
    await prisma.category.create({
      data: {
        name: 'Geral',
        slug: 'geral',
        description: 'Categoria padrão',
        siteId: site.id,
        isActive: true,
      },
    })

    return NextResponse.json(site, { status: 201 })
  } catch (error) {
    console.error('Error creating site:', error)
    return NextResponse.json({ message: 'Erro ao criar site' }, { status: 500 })
  }
}