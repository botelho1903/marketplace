import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth/config'
import { z } from 'zod'

const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  role: z.enum(['USER', 'SELLER', 'ADMIN']).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION']).optional(),
  phone: z.string().optional(),
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
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true,
        emailVerified: true,
        phoneVerified: true,
        _count: {
          select: {
            orders: true,
            products: true,
            reviews: true,
            addresses: true,
          },
        },
        sellerProfile: {
          select: {
            id: true,
            storeName: true,
            storeSlug: true,
            storeDescription: true,
            cnpj: true,
            corporateName: true,
            isVerified: true,
            commissionRate: true,
            payoutSchedule: true,
            bankAccount: true,
            pixKey: true,
            createdAt: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ message: 'Usuário não encontrado' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json({ message: 'Erro ao buscar usuário' }, { status: 500 })
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
    const validated = updateUserSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        { message: validated.error.errors[0].message },
        { status: 400 }
      )
    }

    // Check if email is unique
    if (validated.data.email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email: validated.data.email,
          NOT: { id },
        },
      })
      if (existingUser) {
        return NextResponse.json(
          { message: 'Este e-mail já está em uso' },
          { status: 400 }
        )
      }
    }

    const user = await prisma.user.update({
      where: { id },
      data: validated.data,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json({ message: 'Erro ao atualizar usuário' }, { status: 500 })
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

    // Prevent deleting self
    if (id === (session.user as any).id) {
      return NextResponse.json(
        { message: 'Não é possível excluir sua própria conta' },
        { status: 400 }
      )
    }

    await prisma.user.delete({ where: { id } })

    return NextResponse.json({ message: 'Usuário excluído com sucesso' })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json({ message: 'Erro ao excluir usuário' }, { status: 500 })
  }
}