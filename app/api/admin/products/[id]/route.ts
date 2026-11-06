import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth/config'
import { z } from 'zod'

const updateProductSchema = z.object({
  status: z.enum(['DRAFT', 'PENDING_REVIEW', 'ACTIVE', 'INACTIVE', 'OUT_OF_STOCK', 'REJECTED']).optional(),
  isFeatured: z.boolean().optional(),
  flagged: z.boolean().optional(),
  rejectionReason: z.string().optional(),
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
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        images: true,
        category: true,
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
            sellerProfile: { select: { storeName: true, storeSlug: true, isVerified: true } },
          },
        },
        variants: true,
        attributes: { include: { attribute: true, values: true } },
        _count: { select: { reviews: true, orderItems: true, favorites: true, cartItems: true } },
      },
    })

    if (!product) {
      return NextResponse.json({ message: 'Produto não encontrado' }, { status: 404 })
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json({ message: 'Erro ao buscar produto' }, { status: 500 })
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
    const validated = updateProductSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        { message: validated.error.errors[0].message },
        { status: 400 }
      )
    }

    const data: any = { ...validated.data }

    // If status changes to ACTIVE and was DRAFT/PENDING_REVIEW, set publishedAt
    if (data.status === 'ACTIVE') {
      const current = await prisma.product.findUnique({ where: { id }, select: { status: true, publishedAt: true } })
      if (current && (current.status === 'DRAFT' || current.status === 'PENDING_REVIEW') && !current.publishedAt) {
        data.publishedAt = new Date()
      }
    }

    const product = await prisma.product.update({
      where: { id },
      data,
      include: {
        images: { where: { isPrimary: true }, take: 1 },
        category: { select: { id: true, name: true } },
        seller: { select: { id: true, name: true, sellerProfile: { select: { storeName: true } } } },
      },
    })

    // Create notification for seller if status changed
    if (validated.data.status && validated.data.status !== 'DRAFT') {
      await prisma.notification.create({
        data: {
          userId: product.sellerId,
          type: 'PRODUCT_STATUS_CHANGED',
          title: 'Status do produto alterado',
          message: `O produto "${product.name}" teve seu status alterado para ${validated.data.status}`,
          data: { productId: product.id, newStatus: validated.data.status },
        },
      })
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json({ message: 'Erro ao atualizar produto' }, { status: 500 })
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
    await prisma.product.delete({ where: { id } })

    return NextResponse.json({ message: 'Produto excluído com sucesso' })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json({ message: 'Erro ao excluir produto' }, { status: 500 })
  }
}