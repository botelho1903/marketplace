import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth/config'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const categoryId = searchParams.get('categoryId')
    const sellerId = searchParams.get('sellerId')
    const status = searchParams.get('status') || 'ACTIVE'
    const featured = searchParams.get('featured')
    const search = searchParams.get('search')
    const sort = searchParams.get('sort') || 'newest'
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const type = searchParams.get('type')

    const where: any = {
      status: status as any,
    }

    if (categoryId) where.categoryId = categoryId
    if (sellerId) where.sellerId = sellerId
    if (featured === 'true') where.isFeatured = true
    if (type) where.type = type
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ]
    }
    if (minPrice || maxPrice) {
      where.basePrice = {}
      if (minPrice) where.basePrice.gte = parseFloat(minPrice)
      if (maxPrice) where.basePrice.lte = parseFloat(maxPrice)
    }

    const orderBy: any = {}
    switch (sort) {
      case 'price_asc': orderBy.basePrice = 'asc'; break
      case 'price_desc': orderBy.basePrice = 'desc'; break
      case 'newest': orderBy.createdAt = 'desc'; break
      case 'rating': orderBy.reviews = { _count: 'desc' }; break
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
          seller: { select: { id: true, name: true, sellerProfile: { select: { storeName: true, storeSlug: true } } } },
          digitalFiles: true,
          _count: { select: { reviews: true, orderItems: true, digitalFiles: true, licenseKeys: true } },
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

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || (session.user as any).role !== 'SELLER' && (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    const body = await req.json()
    const sellerId = (session.user as any).id

    // Extract digital files and license keys from body
    const { digitalFiles, licenseKeys, ...productData } = body

    const product = await prisma.product.create({
      data: {
        ...productData,
        sellerId,
        status: 'DRAFT',
        digitalFiles: digitalFiles ? {
          create: digitalFiles.map((file: any) => ({
            name: file.name,
            url: file.url,
            size: file.size,
            mimeType: file.mimeType,
            sortOrder: file.sortOrder || 0,
          }))
        } : undefined,
      },
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json({ message: 'Erro ao criar produto' }, { status: 500 })
  }
}