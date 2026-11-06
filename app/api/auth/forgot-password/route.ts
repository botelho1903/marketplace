import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendEmail, generateResetToken, getResetEmailHtml } from '@/lib/email';
import { hashToken } from '@/lib/crypto';

const RESET_TOKEN_EXPIRY_HOURS = 1;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, phone } = body;

    if (!email && !phone) {
      return NextResponse.json(
        { error: 'Informe email ou telefone' },
        { status: 400 }
      );
    }

    // Buscar usuário por email OU telefone
    const user = await prisma.user.findFirst({
      where: email ? { email } : { phone },
    });

    // Sempre retorna sucesso (segurança: não revela se usuário existe)
    if (!user) {
      return NextResponse.json({ success: true, message: 'Se o cadastro existir, enviaremos instruções' });
    }

    // Gerar token de reset
    const rawToken = generateResetToken();
    const hashedToken = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);

    // Salvar token no banco (usando a tabela VerificationToken do PrismaAdapter ou criar uma customizada)
    // Como o PrismaAdapter usa VerificationToken, vamos usar ela para reset de senha também
    await prisma.verificationToken.upsert({
      where: {
        identifier_token: {
          identifier: email || phone || '',
          token: hashedToken,
        },
      },
      update: { expires: expiresAt },
      create: {
        identifier: email || phone || '',
        token: hashedToken,
        expires: expiresAt,
      },
    });

    // Enviar por email
    if (email) {
      const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://www.botelho.com'}/resetar-senha/${rawToken}`;
      const html = getResetEmailHtml(rawToken, user.name || 'Cliente', resetUrl);

      await sendEmail({
        to: email,
        subject: 'Redefina sua senha - Marketplace Botelho',
        html,
      });
    }

    // Enviar por SMS (se tiver telefone)
    if (phone) {
      await sendResetSMS(phone, rawToken);
    }

    return NextResponse.json({
      success: true,
      message: 'Instruções enviadas. Verifique seu email ou SMS.'
    });
  } catch (error) {
    console.error('Erro em forgot-password:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

// Função para enviar SMS (Twilio, Zenvia, etc.)
async function sendResetSMS(phone: string, token: string): Promise<void> {
  const provider = process.env.SMS_PROVIDER || 'mock';

  const message = `Marketplace Botelho: Seu código de redefinição de senha é: ${token}. Válido por 1 hora. Não compartilhe.`;

  try {
    switch (provider) {
      case 'twilio':
        // const twilio = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
        // await twilio.messages.create({ body: message, from: process.env.TWILIO_SMS_FROM, to: phone });
        console.log(`[Twilio SMS] Para ${phone}: ${message}`);
        break;
      case 'zenvia':
        // await fetch('https://api.zenvia.com/v2/channels/sms/messages', { ... })
        console.log(`[Zenvia SMS] Para ${phone}: ${message}`);
        break;
      default:
        console.log(`[DEV SMS] Para ${phone}: ${message}`);
    }
  } catch (error) {
    console.error('Erro ao enviar SMS:', error);
  }
}