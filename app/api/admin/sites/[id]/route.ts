import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth/config'
import { z } from 'zod'

const updateSiteSchema = z.object({
  name: z.string().min(2).optional(),
  domain: z.string().min(3).optional(),
  subdomain: z.string().regex(/^[a-z0-9-]+$/).optional().or(z.literal('')),
  description: z.string().optional(),
  logo: z.string().url().optional().or(z.literal('')),
  favicon: z.string().url().optional().or(z.literal('')),
  isActive: z.boolean().optional(),
  theme: z.any().optional(),
  settings: z.any().optional(),
  defaultCurrency: z.string().optional(),
  defaultLocale: z.string().optional(),
  timezone: z.string().optional(),
})

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    const { id } = await params
    const site = await prisma.site.findUnique({
      where: { id },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        _count: { select: { products: true, categories: true, orders: true, users: true } },
      },
    })

    if (!site) {
      return NextResponse.json({ message: 'Site não encontrado' }, { status: 404 })
    }

    return NextResponse.json(site)
  } catch (error) {
    console.error('Error fetching site:', error)
    return NextResponse.json({ message: 'Erro ao buscar site' }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()
    const validated = updateSiteSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        { message: validated.error.errors[0].message },
        { status: 400 }
      )
    }

    // Check if domain is unique
    if (validated.data.domain) {
      const existingDomain = await prisma.site.findUnique({
        where: { domain: validated.data.domain },
      })
      if (existingDomain && existingDomain.id !== id) {
        return NextResponse.json({ message: 'Este domínio já está em uso' }, { status: 400 })
      }
    }

    // Check if subdomain is unique
    if (validated.data.subdomain) {
      const existingSubdomain = await prisma.site.findUnique({
        where: { subdomain: validated.data.subdomain },
      })
      if (existingSubdomain && existingSubdomain.id !== id) {
        return NextResponse.json({ message: 'Este subdomínio já está em uso' }, { status: 400 })
      }
    }

    const site = await prisma.site.update({
      where: { id },
      data: validated.data,
      include: {
        owner: { select: { id: true, name: true, email: true } },
      },
    })

    return NextResponse.json(site)
  } catch (error) {
    console.error('Error updating site:', error)
    return NextResponse.json({ message: 'Erro ao atualizar site' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    const { id } = await params

    // Check if it's the primary site
    const site = await prisma.site.findUnique({ where: { id } })
    if (!site) {
      return NextResponse.json({ message: 'Site não encontrado' }, { status: 404 })
    }

    if (site.isPrimary) {
      return NextResponse.json(
        { message: 'Não é possível excluir o site principal' },
        { status: 400 }
      )
    }

    await prisma.site.delete({ where: { id } })

    return NextResponse.json({ message: 'Site excluído com sucesso' })
  } catch (error) {
    console.error('Error deleting site:', error)
    return NextResponse.json({ message: 'Erro ao excluir site' }, { status: 500 })
  }
}