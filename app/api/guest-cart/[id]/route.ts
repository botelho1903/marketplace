import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const guestCart = await prisma.guestCart.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: { include: { images: true, variants: true } },
            variant: true,
          },
        },
        chats: { orderBy: { createdAt: 'asc' } },
        address: true,
        seller: { select: { id: true, name: true, email: true } },
      },
    });

    if (!guestCart) {
      return NextResponse.json({ error: 'Carrinho não encontrado' }, { status: 404 });
    }

    return NextResponse.json({ guestCart });
  } catch (error) {
    console.error('Erro ao buscar carrinho guest:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || (session.user.role !== 'SELLER' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status, sellerId, notes } = body;

    const guestCart = await prisma.guestCart.update({
      where: { id },
      data: {
        status,
        sellerId: sellerId || session.user.id,
        notes,
      },
      include: {
        items: { include: { product: { include: { images: true } }, variant: true } },
        chats: { orderBy: { createdAt: 'asc' } },
        address: true,
      },
    });

    return NextResponse.json({ guestCart });
  } catch (error) {
    console.error('Erro ao atualizar carrinho guest:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.guestCart.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao deletar carrinho guest:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}