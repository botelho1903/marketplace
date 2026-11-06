import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || (session.user.role !== 'SELLER' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where: any = {
      sellerId: session.user.id,
    };

    if (status && status !== 'all') {
      where.status = status;
    }

    const [guestCarts, total] = await Promise.all([
      prisma.guestCart.findMany({
        where,
        include: {
          items: {
            include: {
              product: {
                include: { images: true },
                select: { name: true, slug: true, basePrice: true, salePrice: true },
              },
              variant: { select: { name: true, price: true } },
            },
          },
          chats: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
          address: { select: { street: true, number: true, neighborhood: true, city: true, state: true, cep: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.guestCart.count({ where }),
    ]);

    return NextResponse.json({
      guestCarts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Erro ao listar carrinhos guest:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}