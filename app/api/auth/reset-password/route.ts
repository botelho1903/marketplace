import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashToken } from '@/lib/crypto';
import bcrypt from 'bcryptjs';
import { sendEmail, getResetConfirmationHtml } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, password, confirmPassword } = body;

    if (!token || !password || !confirmPassword) {
      return NextResponse.json(
        { error: 'Token, nova senha e confirmação são obrigatórios' },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: 'As senhas não conferem' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'A senha deve ter pelo menos 8 caracteres' },
        { status: 400 }
      );
    }

    // Hash do token para buscar no banco
    const hashedToken = hashToken(token);

    // Buscar token válido (não expirado)
    const verificationToken = await prisma.verificationToken.findUnique({
      where: {
        identifier_token: {
          identifier: '', // O PrismaAdapter usa identifier + token, mas precisamos buscar só por token
          token: hashedToken,
        },
      },
    });

    // Busca alternativa: procurar por token na tabela
    const tokenRecord = await prisma.verificationToken.findFirst({
      where: { token: hashedToken },
    });

    if (!tokenRecord) {
      return NextResponse.json(
        { error: 'Token inválido ou expirado' },
        { status: 400 }
      );
    }

    if (tokenRecord.expires < new Date()) {
      // Limpar token expirado
      await prisma.verificationToken.delete({
        where: {
          identifier_token: {
            identifier: tokenRecord.identifier,
            token: tokenRecord.token,
          },
        },
      });
      return NextResponse.json(
        { error: 'Token expirado. Solicite um novo.' },
        { status: 400 }
      );
    }

    // Buscar usuário pelo identifier (email ou telefone)
    const user = await prisma.user.findFirst({
      where: { OR: [{ email: tokenRecord.identifier }, { phone: tokenRecord.identifier }] },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 400 }
      );
    }

    // Hash da nova senha
    const passwordHash = await bcrypt.hash(password, 12);

    // Atualizar senha
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    // Deletar token usado
    await prisma.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: tokenRecord.identifier,
          token: tokenRecord.token,
        },
      },
    });

    // Enviar email de confirmação (se tiver email)
    if (user.email) {
      await sendEmail({
        to: user.email,
        subject: 'Senha alterada com sucesso - Marketplace Botelho',
        html: getResetConfirmationHtml(user.name || 'Cliente'),
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Senha alterada com sucesso. Faça login com a nova senha.',
    });
  } catch (error) {
    console.error('Erro em reset-password:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}