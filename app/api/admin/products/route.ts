import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth/config'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search')
    const status = searchParams.get('status')
    const sellerId = searchParams.get('sellerId')
    const categoryId = searchParams.get('categoryId')
    const flagged = searchParams.get('flagged')
    const sort = searchParams.get('sort') || 'newest'

    const where: any = {}
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ]
    }
    if (status) where.status = status
    if (sellerId) where.sellerId = sellerId
    if (categoryId) where.categoryId = categoryId
    if (flagged === 'true') where.flagged = true

    const orderBy: any = {}
    switch (sort) {
      case 'name_asc': orderBy.name = 'asc'; break
      case 'name_desc': orderBy.name = 'desc'; break
      case 'price_asc': orderBy.basePrice = 'asc'; break
      case 'price_desc': orderBy.basePrice = 'desc'; break
      case 'stock_asc': orderBy.stock = 'asc'; break
      case 'stock_desc': orderBy.stock = 'desc'; break
      case 'sales': orderBy.orderItems = { _count: 'desc' }; break
      default: orderBy.createdAt = 'desc'
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          images: { where: { isPrimary: true }, take: 1 },
          category: { select: { id: true, name: true, slug: true } },
          seller: { select: { id: true, name: true, email: true, sellerProfile: { select: { storeName: true } } } },
          _count: { select: { reviews: true, orderItems: true } },
        },
      }),
      prisma.product.count({ where }),
    ])

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json({ message: 'Erro ao buscar produtos' }, { status: 500 })
  }
}