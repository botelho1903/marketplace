import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth/config'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const product = await prisma.product.findFirst({
      where: { slug },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        category: { select: { id: true, name: true, slug: true } },
        seller: {
          select: {
            id: true,
            name: true,
            sellerProfile: { select: { storeName: true, storeSlug: true, storeLogo: true } }
          }
        },
        variants: {
          where: { isActive: true },
          include: {
            attributeValues: {
              include: {
                attributeValue: {
                  include: { attribute: true }
                }
              }
            }
          }
        },
        attributes: {
          include: {
            attribute: { include: { values: true } },
            values: true
          }
        },
        digitalFiles: { orderBy: { sortOrder: 'asc' } },
        _count: { select: { reviews: true, orderItems: true, favorites: true } },
        reviews: {
          where: { isApproved: true },
          include: { user: { select: { name: true, avatar: true } }, images: true },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
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

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || (session.user as any).role !== 'SELLER' && (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    const { slug } = await params
    const body = await req.json()
    const sellerId = (session.user as any).id

    // Check if product belongs to seller (unless admin)
    const existingProduct = await prisma.product.findFirst({
      where: { slug },
      select: { sellerId: true, id: true }
    })

    if (!existingProduct) {
      return NextResponse.json({ message: 'Produto não encontrado' }, { status: 404 })
    }

    if ((session.user as any).role !== 'ADMIN' && existingProduct.sellerId !== sellerId) {
      return NextResponse.json({ message: 'Não autorizado a editar este produto' }, { status: 403 })
    }

    // Extract digital files from body
    const { digitalFiles, images, variants, attributes, ...productData } = body

    const product = await prisma.product.update({
      where: { id: existingProduct.id },
      data: {
        ...productData,
        images: images ? {
          deleteMany: {},
          create: images.map((img: any, index: number) => ({
            url: img.url,
            alt: img.alt,
            sortOrder: img.sortOrder ?? index,
            isPrimary: img.isPrimary ?? index === 0,
          }))
        } : undefined,
        variants: variants ? {
          deleteMany: {},
          create: variants.map((variant: any) => ({
            name: variant.name,
            sku: variant.sku,
            price: variant.price,
            compareAtPrice: variant.compareAtPrice,
            stock: variant.stock,
            weight: variant.weight,
            dimensions: variant.dimensions,
            isActive: variant.isActive ?? true,
            attributeValues: variant.attributeValues ? {
              create: variant.attributeValues.map((av: any) => ({
                attributeValueId: av.attributeValueId,
              }))
            } : undefined,
          }))
        } : undefined,
        attributes: attributes ? {
          deleteMany: {},
          create: attributes.map((attr: any) => ({
            attributeId: attr.attributeId,
            values: {
              connect: attr.valueIds.map((id: string) => ({ id })),
            },
          }))
        } : undefined,
        digitalFiles: digitalFiles ? {
          deleteMany: {},
          create: digitalFiles.map((file: any, index: number) => ({
            name: file.name,
            url: file.url,
            size: file.size,
            mimeType: file.mimeType,
            sortOrder: file.sortOrder ?? index,
          }))
        } : undefined,
      },
      include: {
        images: true,
        variants: true,
        attributes: true,
        digitalFiles: true,
      },
    })

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json({ message: 'Erro ao atualizar produto' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || (session.user as any).role !== 'SELLER' && (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    const { slug } = await params
    const sellerId = (session.user as any).id

    const existingProduct = await prisma.product.findFirst({
      where: { slug },
      select: { sellerId: true, id: true }
    })

    if (!existingProduct) {
      return NextResponse.json({ message: 'Produto não encontrado' }, { status: 404 })
    }

    if ((session.user as any).role !== 'ADMIN' && existingProduct.sellerId !== sellerId) {
      return NextResponse.json({ message: 'Não autorizado a excluir este produto' }, { status: 403 })
    }

    await prisma.product.delete({
      where: { id: existingProduct.id }
    })

    return NextResponse.json({ message: 'Produto excluído com sucesso' })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json({ message: 'Erro ao excluir produto' }, { status: 500 })
  }
}