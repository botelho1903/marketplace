import { formatCurrency } from './utils';

interface WhatsAppMessageData {
  sellerPhone: string;
  sellerName: string;
  guestName: string;
  guestPhone: string;
  guestEmail?: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    variant?: string;
    productId?: string;
    variantId?: string;
  }>;
  subtotal: number;
  shipping: number;
  total: number;
  paymentMethod?: string;
  isCashOnDelivery?: boolean;
  address?: {
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
    cep: string;
  };
  notes?: string;
  cartUrl: string;
}

export function formatWhatsAppMessage(data: WhatsAppMessageData): string {
  const {
    sellerName,
    guestName,
    guestPhone,
    guestEmail,
    items,
    subtotal,
    shipping,
    total,
    address,
    notes,
    cartUrl
  } = data;

  const itemsText = items.map((item, i) =>
    `${i + 1}. ${item.name}${item.variant ? ` (${item.variant})` : ''} - Qtd: ${item.quantity} - ${formatCurrency(item.price * item.quantity)}`
  ).join('\n');

  const addressText = address
    ? `\n📍 *Endereço de Entrega:*\n${address.street}, ${address.number}\n${address.neighborhood}, ${address.city}/${address.state}\nCEP: ${address.cep}`
    : '\n📍 *Endereço:* A combinar com o cliente';

  const notesText = notes ? `\n💬 *Recado do cliente:*\n${notes}` : '';

  return `🔔 *NOVO PEDIDO RECEBIDO* 🔔

Olá ${sellerName}! Você recebeu um novo carrinho de compra.

👤 *Cliente:* ${guestName}
📞 *Telefone:* ${guestPhone}
${guestEmail ? `✉️ *Email:* ${guestEmail}` : ''}

📦 *Itens do Carrinho:*
${itemsText}

💰 *Resumo Financeiro:*
Subtotal: ${formatCurrency(subtotal)}
Frete: ${formatCurrency(shipping)}
${'─'.repeat(20)}
*Total: ${formatCurrency(total)}*

${addressText}${notesText}

🔗 *Ver carrinho completo:* ${cartUrl}

⚡ *Ação recomendada:* Entre em contato com o cliente via WhatsApp para confirmar detalhes e fechar a venda!

---
_Mensagem automática do Marketplace Botelho_`;
}

export function formatShortWhatsAppMessage(data: WhatsAppMessageData): string {
  const { sellerName, guestName, guestPhone, items, total, cartUrl } = data;

  const itemCount = items.length;
  const firstItem = items[0]?.name || 'Produtos';

  return `🔔 *Novo carrinho de ${guestName}*

${itemCount} item${itemCount > 1 ? 's' : ''} - ${firstItem}${itemCount > 1 ? ' + mais' : ''}
💰 Total: ${formatCurrency(total)}
📞 ${guestPhone}

🔗 Ver detalhes: ${cartUrl}

Responda rápido para fechar a venda! 🚀`;
}

// Para WhatsApp Business API (Twilio, Meta, etc.)
export interface WhatsAppProvider {
  sendMessage(to: string, message: string): Promise<{ success: boolean; messageId?: string; error?: string }>;
  sendTemplateMessage?(to: string, templateName: string, params: string[]): Promise<{ success: boolean; messageId?: string; error?: string }>;
}

// Implementação para WhatsApp Web (não oficial - usar com cuidado)
export class WhatsAppWebProvider implements WhatsAppProvider {
  async sendMessage(to: string, message: string) {
    // Esta é uma implementação de exemplo
    // Em produção, use WhatsApp Business API oficial (Meta/Twilio)
    console.log(`[WhatsApp] Enviando para ${to}:`, message);

    // Aqui você integraria com:
    // - Twilio WhatsApp API
    // - Meta WhatsApp Business API
    // - WhatsApp Web via puppeteer/venom-bot (não recomendado para produção)
    // - Z-API, Evolution API, etc.

    return { success: true, messageId: `msg_${Date.now()}` };
  }
}

// Implementação para Twilio
export class TwilioWhatsAppProvider implements WhatsAppProvider {
  private accountSid: string;
  private authToken: string;
  private fromNumber: string;

  constructor(accountSid: string, authToken: string, fromNumber: string) {
    this.accountSid = accountSid;
    this.authToken = authToken;
    this.fromNumber = fromNumber;
  }

  async sendMessage(to: string, message: string) {
    // Implementação real com Twilio
    // const twilio = require('twilio')(this.accountSid, this.authToken);
    // await twilio.messages.create({ body: message, from: `whatsapp:${this.fromNumber}`, to: `whatsapp:${to}` });

    console.log(`[Twilio WhatsApp] Enviando para ${to}`);
    return { success: true, messageId: `twilio_${Date.now()}` };
  }
}

// Implementação para Meta WhatsApp Business API
export class MetaWhatsAppProvider implements WhatsAppProvider {
  private accessToken: string;
  private phoneNumberId: string;

  constructor(accessToken: string, phoneNumberId: string) {
    this.accessToken = accessToken;
    this.phoneNumberId = phoneNumberId;
  }

  async sendMessage(to: string, message: string) {
    // Implementação real com Meta Graph API
    // await fetch(`https://graph.facebook.com/v18.0/${this.phoneNumberId}/messages`, {
    //   method: 'POST',
    //   headers: { 'Authorization': `Bearer ${this.accessToken}`, 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ messaging_product: 'whatsapp', to, type: 'text', text: { body: message } })
    // });

    console.log(`[Meta WhatsApp] Enviando para ${to}`);
    return { success: true, messageId: `meta_${Date.now()}` };
  }
}

// Factory para criar provedor baseado em config
export function createWhatsAppProvider(): WhatsAppProvider {
  const provider = process.env.WHATSAPP_PROVIDER || 'mock';

  switch (provider) {
    case 'twilio':
      return new TwilioWhatsAppProvider(
        process.env.TWILIO_ACCOUNT_SID!,
        process.env.TWILIO_AUTH_TOKEN!,
        process.env.TWILIO_WHATSAPP_FROM!
      );
    case 'meta':
      return new MetaWhatsAppProvider(
        process.env.META_WHATSAPP_TOKEN!,
        process.env.META_WHATSAPP_PHONE_ID!
      );
    default:
      return new WhatsAppWebProvider();
  }
}

// Formatar mensagem WhatsApp específica para pagamento na entrega
export function formatCashOnDeliveryMessage(data: WhatsAppMessageData): string {
  const {
    sellerName,
    guestName,
    guestPhone,
    guestEmail,
    items,
    subtotal,
    shipping,
    total,
    address,
    notes,
    cartUrl
  } = data;

  const itemsText = items.map((item, i) =>
    `${i + 1}. ${item.name}${item.variant ? ` (${item.variant})` : ''} - Qtd: ${item.quantity} - ${formatCurrency(item.price * item.quantity)}`
  ).join('\n');

  const addressText = address
    ? `\n📍 *Endereço de Entrega:*\n${address.street}, ${address.number}\n${address.neighborhood}, ${address.city}/${address.state}\nCEP: ${address.cep}`
    : '\n📍 *Endereço:* A combinar com o cliente';

  const notesText = notes ? `\n💬 *Recado do cliente:*\n${notes}` : '';

  return `💰 *PAGAMENTO NA ENTREGA - NOVO PEDIDO* 💰

Olá ${sellerName}! Você recebeu um novo pedido com pagamento em DINHEIRO NA ENTREGA.

⚠️ *ATENÇÃO:* Cliente vai pagar em dinheiro no momento da entrega. Combinar detalhes diretamente com o cliente via WhatsApp.

👤 *Cliente:* ${guestName}
📞 *Telefone/WhatsApp:* ${guestPhone}
${guestEmail ? `✉️ *Email:* ${guestEmail}` : ''}

📦 *Itens do Pedido:*
${itemsText}

💰 *Resumo Financeiro:*
Subtotal: ${formatCurrency(subtotal)}
Frete: ${formatCurrency(shipping)}
${'─'.repeat(20)}
*Total a Receber: ${formatCurrency(total)}*

${addressText}${notesText}

🔗 *Ver pedido completo:* ${cartUrl}

💡 *Próximos passos:*
1. Entre em contato com o cliente via WhatsApp: ${guestPhone}
2. Combine horário e local da entrega
3. Confirme o valor total a receber: ${formatCurrency(total)}
4. Leve troco se necessário

---
_Mensagem automática do Marketplace Botelho_`;
}

// Função principal para notificar vendedor
export async function notifySellerNewCart(
  sellerPhone: string,
  sellerName: string,
  data: Omit<WhatsAppMessageData, 'sellerPhone' | 'sellerName'>
) {
  const provider = createWhatsAppProvider();
  const message = formatWhatsAppMessage({ ...data, sellerPhone, sellerName });

  try {
    const result = await provider.sendMessage(sellerPhone, message);
    return result;
  } catch (error) {
    console.error('Erro ao enviar WhatsApp:', error);
    return { success: false, error: 'Erro ao enviar notificação WhatsApp' };
  }
}

// Função específica para notificar pagamento na entrega
export async function notifySellerCashOnDelivery(
  sellerPhone: string,
  sellerName: string,
  data: Omit<WhatsAppMessageData, 'sellerPhone' | 'sellerName'>
) {
  const provider = createWhatsAppProvider();
  const message = formatCashOnDeliveryMessage({ ...data, sellerPhone, sellerName, isCashOnDelivery: true });

  try {
    const result = await provider.sendMessage(sellerPhone, message);
    return result;
  } catch (error) {
    console.error('Erro ao enviar WhatsApp (Cash on Delivery):', error);
    return { success: false, error: 'Erro ao enviar notificação WhatsApp' };
  }
}

// Formatar número para WhatsApp (Brasil)
export function formatWhatsAppNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');

  // Se já tem código do país (55), retorna como está
  if (cleaned.startsWith('55') && cleaned.length >= 12) {
    return cleaned;
  }

  // Adiciona código do Brasil (55) se não tiver
  if (cleaned.length === 10 || cleaned.length === 11) {
    return `55${cleaned}`;
  }

  return cleaned;
}