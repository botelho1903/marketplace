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
    const role = searchParams.get('role')
    const status = searchParams.get('status')
    const sort = searchParams.get('sort') || 'newest'

    const where: any = {}
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ]
    }
    if (role) where.role = role
    if (status) where.status = status

    const orderBy: any = {}
    switch (sort) {
      case 'name_asc': orderBy.name = 'asc'; break
      case 'name_desc': orderBy.name = 'desc'; break
      case 'email_asc': orderBy.email = 'asc'; break
      case 'email_desc': orderBy.email = 'desc'; break
      case 'oldest': orderBy.createdAt = 'asc'; break
      default: orderBy.createdAt = 'desc'
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          status: true,
          avatar: true,
          createdAt: true,
          lastLoginAt: true,
          _count: {
            select: {
              orders: true,
              products: true,
              reviews: true,
            },
          },
          sellerProfile: {
            select: {
              storeName: true,
              isVerified: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ])

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ message: 'Erro ao buscar usuários' }, { status: 500 })
  }
}