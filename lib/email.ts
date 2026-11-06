import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

// Configuração do transporter (ajuste conforme seu provedor)
function createTransporter() {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '587');
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) {
    console.warn('⚠️ SMTP não configurado - emails serão logados no console');
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

export async function sendEmail({ to, subject, html, text }: EmailOptions): Promise<{ success: boolean; error?: string }> {
  const transporter = createTransporter();

  // Fallback para desenvolvimento: loga no console
  if (!transporter) {
    console.log('📧 [DEV] Email que seria enviado:');
    console.log(`Para: ${to}`);
    console.log(`Assunto: ${subject}`);
    console.log(`HTML: ${html}`);
    return { success: true };
  }

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'Marketplace Botelho <noreply@botelho.com>',
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''),
    });
    return { success: true };
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    return { success: false, error: 'Falha ao enviar email' };
  }
}

export function generateResetToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

export function getResetEmailHtml(token: string, name: string, resetUrl: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 28px;">Marketplace Botelho</h1>
  </div>
  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 12px 12px; border: 1px solid #eee;">
    <h2 style="color: #333; margin-top: 0;">Redefinição de Senha</h2>
    <p>Olá <strong>${name}</strong>,</p>
    <p>Recebemos uma solicitação para redefinir sua senha. Clique no botão abaixo para criar uma nova senha:</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${resetUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
        Redefinir Minha Senha
      </a>
    </div>
    <p style="color: #666; font-size: 14px;">Ou copie este link no navegador:</p>
    <p style="color: #667eea; word-break: break-all; font-size: 13px;">${resetUrl}</p>
    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
    <p style="color: #999; font-size: 12px;">
      <strong>Token de segurança:</strong> ${token}<br>
      Este link expira em <strong>1 hora</strong>.<br>
      Se você não solicitou isso, ignore este email.
    </p>
  </div>
  <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
    &copy; ${new Date().getFullYear()} Marketplace Botelho. Todos os direitos reservados.
  </div>
</body>
</html>`;
}

export function getResetConfirmationHtml(name: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 28px;">✅ Senha Alterada</h1>
  </div>
  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 12px 12px; border: 1px solid #eee;">
    <h2 style="color: #333; margin-top: 0;">Senha Atualizada com Sucesso</h2>
    <p>Olá <strong>${name}</strong>,</p>
    <p>Sua senha foi alterada com sucesso em <strong>${new Date().toLocaleString('pt-BR')}</strong>.</p>
    <p>Se você não fez esta alteração, entre em contato conosco imediatamente.</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://www.botelho.com'}/login" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
        Fazer Login
      </a>
    </div>
  </div>
</body>
</html>`;
}