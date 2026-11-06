import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { productId, variantId, quantity } = body;

    if (!productId) {
      return NextResponse.json({ error: 'Produto obrigatório' }, { status: 400 });
    }

    const guestCart = await prisma.guestCart.findUnique({ where: { id } });
    if (!guestCart) {
      return NextResponse.json({ error: 'Carrinho não encontrado' }, { status: 404 });
    }

    const existingItem = await prisma.guestCartItem.findUnique({
      where: {
        guestCartId_productId_variantId: {
          guestCartId: id,
          productId,
          variantId: variantId || '',
        },
      },
    });

    let item;
    if (existingItem) {
      item = await prisma.guestCartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + (quantity || 1) },
        include: { product: { include: { images: true } }, variant: true },
      });
    } else {
      item = await prisma.guestCartItem.create({
        data: {
          guestCartId: id,
          productId,
          variantId,
          quantity: quantity || 1,
        },
        include: { product: { include: { images: true } }, variant: true },
      });
    }

    return NextResponse.json({ item });
  } catch (error) {
    console.error('Erro ao adicionar item:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { itemId, quantity } = body;

    if (!itemId || quantity === undefined) {
      return NextResponse.json({ error: 'ItemId e quantity obrigatórios' }, { status: 400 });
    }

    if (quantity <= 0) {
      await prisma.guestCartItem.delete({ where: { id: itemId } });
      return NextResponse.json({ success: true });
    }

    const item = await prisma.guestCartItem.update({
      where: { id: itemId },
      data: { quantity },
      include: { product: { include: { images: true } }, variant: true },
    });

    return NextResponse.json({ item });
  } catch (error) {
    console.error('Erro ao atualizar item:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('itemId');

    if (!itemId) {
      return NextResponse.json({ error: 'ItemId obrigatório' }, { status: 400 });
    }

    await prisma.guestCartItem.delete({ where: { id: itemId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao remover item:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}