import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth/config'
import { z } from 'zod'

const sellerProfileSchema = z.object({
  storeName: z.string().min(2, 'Nome da loja deve ter pelo menos 2 caracteres'),
  storeSlug: z.string().min(2, 'Slug deve ter pelo menos 2 caracteres').regex(/^[a-z0-9-]+$/, 'Slug deve conter apenas letras minúsculas, números e hífens'),
  storeDescription: z.string().optional(),
  storeLogo: z.string().url().optional().or(z.literal('')),
  storeBanner: z.string().url().optional().or(z.literal('')),
  cnpj: z.string().optional(),
  corporateName: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  website: z.string().url().optional().or(z.literal('')),
  // Bank account
  bankName: z.string().optional(),
  bankAgency: z.string().optional(),
  bankAccount: z.string().optional(),
  bankAccountType: z.string().optional(),
  bankAccountHolder: z.string().optional(),
  bankAccountHolderDocument: z.string().optional(),
  pixKey: z.string().optional(),
  // Address
  cep: z.string().optional(),
  street: z.string().optional(),
  number: z.string().optional(),
  complement: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  // SEO
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
  // Social
  instagram: z.string().optional(),
  facebook: z.string().optional(),
  whatsapp: z.string().optional(),
  youtube: z.string().optional(),
  // Visual identity
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
  font: z.string().optional(),
  // Shipping
  freeShippingEnabled: z.boolean().optional(),
  freeShippingMinValue: z.number().optional(),
  freeShippingRegions: z.string().optional(),
  freeShippingCarrier: z.string().optional(),
  defaultPreparationDays: z.number().optional(),
  customPreparationDays: z.number().optional(),
  maxPreparationDays: z.number().optional(),
})

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || ((session.user as any).role !== 'SELLER' && (session.user as any).role !== 'ADMIN')) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const sellerProfile = await prisma.sellerProfile.findUnique({
      where: { userId },
    })

    if (!sellerProfile) {
      return NextResponse.json({ message: 'Perfil de vendedor não encontrado' }, { status: 404 })
    }

    return NextResponse.json(sellerProfile)
  } catch (error) {
    console.error('Error fetching seller profile:', error)
    return NextResponse.json({ message: 'Erro ao buscar perfil do vendedor' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || ((session.user as any).role !== 'SELLER' && (session.user as any).role !== 'ADMIN')) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const body = await req.json()
    const validated = sellerProfileSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        { message: validated.error.errors[0].message },
        { status: 400 }
      )
    }

    // Check if storeSlug is unique (excluding current user)
    const existingProfile = await prisma.sellerProfile.findUnique({
      where: { storeSlug: validated.data.storeSlug },
    })

    if (existingProfile && existingProfile.userId !== userId) {
      return NextResponse.json(
        { message: 'Este slug já está em uso' },
        { status: 400 }
      )
    }

    const sellerProfile = await prisma.sellerProfile.upsert({
      where: { userId },
      create: {
        userId,
        ...validated.data,
      },
      update: validated.data,
    })

    return NextResponse.json(sellerProfile)
  } catch (error) {
    console.error('Error updating seller profile:', error)
    return NextResponse.json({ message: 'Erro ao atualizar perfil do vendedor' }, { status: 500 })
  }
}