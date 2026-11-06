import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateToken } from '@/lib/crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { guestName, guestEmail, guestPhone, productId, variantId, quantity, notes, siteId } = body;

    if (!guestName || !productId) {
      return NextResponse.json({ error: 'Nome e produto são obrigatórios' }, { status: 400 });
    }

    // Gerar token único para o carrinho
    const guestToken = generateToken();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 dias

    // Buscar ou criar carrinho
    let guestCart = await prisma.guestCart.findFirst({
      where: {
        guestToken,
        status: 'ACTIVE',
      },
    });

    if (!guestCart) {
      guestCart = await prisma.guestCart.create({
        data: {
          guestName,
          guestToken,
          guestEmail,
          guestPhone,
          notes,
          siteId: siteId || 'default',
          expiresAt,
        },
      });
    }

    // Adicionar item ao carrinho
    const existingItem = await prisma.guestCartItem.findUnique({
      where: {
        guestCartId_productId_variantId: {
          guestCartId: guestCart.id,
          productId,
          variantId: variantId || '',
        },
      },
    });

    if (existingItem) {
      await prisma.guestCartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + (quantity || 1) },
      });
    } else {
      await prisma.guestCartItem.create({
        data: {
          guestCartId: guestCart.id,
          productId,
          variantId,
          quantity: quantity || 1,
        },
      });
    }

    // Retornar carrinho completo
    const fullCart = await prisma.guestCart.findUnique({
      where: { id: guestCart.id },
      include: {
        items: {
          include: {
            product: {
              include: { images: true, variants: true },
            },
            variant: true,
          },
        },
        chats: { orderBy: { createdAt: 'asc' } },
        address: true,
      },
    });

    return NextResponse.json({ guestCart: fullCart });
  } catch (error) {
    console.error('Erro ao criar carrinho guest:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const nome = searchParams.get('nome');

    if (!token && !nome) {
      return NextResponse.json({ error: 'Token ou nome obrigatório' }, { status: 400 });
    }

    let guestCart;

    if (token) {
      guestCart = await prisma.guestCart.findUnique({
        where: { guestToken: token },
        include: {
          items: {
            include: {
              product: { include: { images: true, variants: true } },
              variant: true,
            },
          },
          chats: { orderBy: { createdAt: 'asc' } },
          address: true,
        },
      });
    } else {
      if (!nome) {
        return NextResponse.json({ error: 'Nome obrigatório' }, { status: 400 });
      }
      guestCart = await prisma.guestCart.findFirst({
        where: { guestName: nome, status: 'ACTIVE' },
        orderBy: { createdAt: 'desc' },
        include: {
          items: {
            include: {
              product: { include: { images: true, variants: true } },
              variant: true,
            },
          },
          chats: { orderBy: { createdAt: 'asc' } },
          address: true,
        },
      });
    }

    if (!guestCart) {
      return NextResponse.json({ error: 'Carrinho não encontrado' }, { status: 404 });
    }

    return NextResponse.json({ guestCart });
  } catch (error) {
    console.error('Erro ao buscar carrinho guest:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}