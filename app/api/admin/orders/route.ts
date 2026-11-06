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
    const paymentStatus = searchParams.get('paymentStatus')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    const sort = searchParams.get('sort') || 'newest'

    const where: any = {}
    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { buyer: { name: { contains: search, mode: 'insensitive' } } },
        { buyer: { email: { contains: search, mode: 'insensitive' } } },
      ]
    }
    if (status) where.status = status
    if (paymentStatus) where.paymentStatus = paymentStatus
    if (dateFrom || dateTo) {
      where.createdAt = {}
      if (dateFrom) where.createdAt.gte = new Date(dateFrom)
      if (dateTo) where.createdAt.lte = new Date(dateTo)
    }

    const orderBy: any = {}
    switch (sort) {
      case 'total_asc': orderBy.total = 'asc'; break
      case 'total_desc': orderBy.total = 'desc'; break
      case 'oldest': orderBy.createdAt = 'asc'; break
      default: orderBy.createdAt = 'desc'
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          buyer: { select: { id: true, name: true, email: true } },
          seller: { select: { id: true, name: true, sellerProfile: { select: { storeName: true } } } },
          items: { select: { id: true, productName: true, quantity: true, unitPrice: true } },
          payments: { select: { id: true, amount: true, method: true, status: true } },
          shippingAddress: true,
        },
      }),
      prisma.order.count({ where }),
    ])

    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json({ message: 'Erro ao buscar pedidos' }, { status: 500 })
  }
}