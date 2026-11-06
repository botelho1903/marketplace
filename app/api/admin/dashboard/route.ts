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
    const period = searchParams.get('period') || '30d'

    const days = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 365
    const dateFrom = new Date()
    dateFrom.setDate(dateFrom.getDate() - days)

    // Parallel queries for dashboard stats
    const [
      totalUsers,
      totalSellers,
      totalProducts,
      totalOrders,
      totalRevenue,
      pendingSellers,
      recentOrders,
      topSellers,
      revenueByDay,
      ordersByStatus,
      usersByRole,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'SELLER' } }),
      prisma.product.count({ where: { status: 'ACTIVE' } }),
      prisma.order.count({ where: { createdAt: { gte: dateFrom } } }),
      prisma.order.aggregate({
        where: {
          createdAt: { gte: dateFrom },
          paymentStatus: 'COMPLETED',
        },
        _sum: { total: true },
      }),
      prisma.user.count({ where: { role: 'SELLER', status: 'PENDING_VERIFICATION' } }),
      prisma.order.findMany({
        where: { createdAt: { gte: dateFrom } },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          buyer: { select: { name: true } },
          seller: { select: { sellerProfile: { select: { storeName: true } } } },
          items: { select: { productName: true, quantity: true } },
        },
      }),
      prisma.user.findMany({
        where: { role: 'SELLER' },
        take: 5,
        include: {
          sellerProfile: { select: { storeName: true } },
          _count: { select: { sales: { where: { createdAt: { gte: dateFrom } } } } },
        },
        orderBy: { sales: { _count: 'desc' } },
      }),
      prisma.$queryRaw`
        SELECT DATE(created_at) as date, SUM(total)::numeric as revenue
        FROM "Order"
        WHERE created_at >= ${dateFrom} AND payment_status = 'COMPLETED'
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `,
      prisma.order.groupBy({
        by: ['status'],
        where: { createdAt: { gte: dateFrom } },
        _count: { id: true },
      }),
      prisma.user.groupBy({
        by: ['role'],
        _count: { id: true },
      }),
    ])

    return NextResponse.json({
      stats: {
        totalUsers,
        totalSellers,
        totalProducts,
        totalOrders,
        totalRevenue: totalRevenue._sum.total || 0,
        pendingSellers,
      },
      recentOrders,
      topSellers: topSellers.map(s => ({
        id: s.id,
        storeName: s.sellerProfile?.storeName || s.name,
        salesCount: s._count.sales,
      })),
      revenueByDay,
      ordersByStatus,
      usersByRole,
    })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json({ message: 'Erro ao buscar estatísticas' }, { status: 500 })
  }
}