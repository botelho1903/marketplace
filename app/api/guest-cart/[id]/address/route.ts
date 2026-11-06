import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { encrypt, decrypt } from '@/lib/crypto';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const address = await prisma.guestAddress.findUnique({
      where: { guestCartId: id },
    });

    if (!address) {
      return NextResponse.json({ address: null });
    }

    // Descriptografar dados sensíveis se existirem
    const decryptedAddress = address.encryptedData
      ? { ...address, ...JSON.parse(decrypt(address.encryptedData)) }
      : address;

    return NextResponse.json({ address: decryptedAddress });
  } catch (error) {
    console.error('Erro ao buscar endereço:', error);
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
    const { name, phone, cep, street, number, complement, neighborhood, city, state, country, encryptData } = body;

    if (!name || !phone || !cep || !street || !number || !neighborhood || !city || !state) {
      return NextResponse.json({ error: 'Todos os campos de endereço são obrigatórios' }, { status: 400 });
    }

    const guestCart = await prisma.guestCart.findUnique({ where: { id } });
    if (!guestCart) {
      return NextResponse.json({ error: 'Carrinho não encontrado' }, { status: 404 });
    }

    // Criptografar dados sensíveis (telefone, complemento)
    const sensitiveData = { phone, complement };
    const encryptedData = encrypt(JSON.stringify(sensitiveData));

    const address = await prisma.guestAddress.upsert({
      where: { guestCartId: id },
      create: {
        guestCartId: id,
        name,
        phone,
        cep,
        street,
        number,
        complement,
        neighborhood,
        city,
        state,
        country: country || 'Brasil',
        encryptedData,
      },
      update: {
        name,
        phone,
        cep,
        street,
        number,
        complement,
        neighborhood,
        city,
        state,
        country: country || 'Brasil',
        encryptedData,
      },
    });

    return NextResponse.json({ address });
  } catch (error) {
    console.error('Erro ao salvar endereço:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.guestAddress.delete({ where: { guestCartId: id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao deletar endereço:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}