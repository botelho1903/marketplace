import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const chats = await prisma.guestChat.findMany({
      where: { guestCartId: id },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({ chats });
  } catch (error) {
    console.error('Erro ao buscar chats:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { senderType, senderName, message, contactInfo } = body;

    if (!senderType || !senderName || !message) {
      return NextResponse.json({ error: 'Dados obrigatórios faltando' }, { status: 400 });
    }

    // Verificar se carrinho existe
    const guestCart = await prisma.guestCart.findUnique({ where: { id } });
    if (!guestCart) {
      return NextResponse.json({ error: 'Carrinho não encontrado' }, { status: 404 });
    }

    const chat = await prisma.guestChat.create({
      data: {
        guestCartId: id,
        senderType,
        senderName,
        message,
        contactInfo,
        isRead: false,
      },
    });

    // Atualizar status do carrinho se vendedor respondeu
    if (senderType === 'SELLER') {
      await prisma.guestCart.update({
        where: { id },
        data: { status: 'CONTACTED' },
      });
    }

    return NextResponse.json({ chat });
  } catch (error) {
    console.error('Erro ao criar chat:', error);
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
    const { searchParams } = new URL(request.url);
    const chatId = searchParams.get('chatId');

    if (!chatId) {
      return NextResponse.json({ error: 'ChatId obrigatório' }, { status: 400 });
    }

    const chat = await prisma.guestChat.update({
      where: { id: chatId },
      data: { isRead: true },
    });

    return NextResponse.json({ chat });
  } catch (error) {
    console.error('Erro ao marcar chat como lido:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}