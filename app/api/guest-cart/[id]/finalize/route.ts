import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { notifySellerNewCart, notifySellerCashOnDelivery, formatWhatsAppMessage, formatWhatsAppNumber, formatCashOnDeliveryMessage } from '@/lib/whatsapp';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { guestName, guestPhone, guestEmail, paymentMethod = 'PIX' } = body;

    // Buscar carrinho completo
    const guestCart = await prisma.guestCart.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: { include: { images: true } },
            variant: true,
          },
        },
        chats: { orderBy: { createdAt: 'asc' } },
        address: true,
        seller: { select: { id: true, name: true, phone: true, email: true } },
        site: { select: { domain: true, name: true } },
      },
    });

    if (!guestCart) {
      return NextResponse.json({ error: 'Carrinho não encontrado' }, { status: 404 });
    }

    if (!guestCart.seller) {
      return NextResponse.json({ error: 'Vendedor não associado ao carrinho' }, { status: 400 });
    }

    if (!guestCart.seller.phone) {
      return NextResponse.json({ error: 'Vendedor não tem telefone cadastrado' }, { status: 400 });
    }

    // Preparar dados
    const items = guestCart.items.map(item => ({
      name: item.product.name,
      quantity: item.quantity,
      price: Number(item.variant?.price || item.product.salePrice || item.product.basePrice),
      variant: item.variant?.name,
      productId: item.productId,
      variantId: item.variantId,
    }));

    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shipping = 15.00;
    const total = subtotal + shipping;

    // URL do carrinho
    const baseUrl = guestCart.site?.domain
      ? `https://${guestCart.site.domain}`
      : process.env.NEXT_PUBLIC_APP_URL || 'https://www.botelho.com';

    const cartUrl = `${baseUrl}/carrinho/${encodeURIComponent(guestCart.guestName)}?token=${guestCart.guestToken}`;

    const isCashOnDelivery = paymentMethod === 'CASH_ON_DELIVERY' || paymentMethod === 'DINHEIRO';
    const paymentMethodLabel = isCashOnDelivery ? '💰 Dinheiro na Entrega' :
      paymentMethod === 'PIX' ? '📱 PIX' :
      paymentMethod === 'CREDIT_CARD' ? '💳 Cartão de Crédito' :
      paymentMethod === 'DEBIT_CARD' ? '💳 Cartão de Débito' :
      paymentMethod === 'MERCADO_PAGO' ? '💙 Mercado Pago' : paymentMethod;

    // Formatar mensagem WhatsApp específica
    const messageData = {
      sellerPhone: formatWhatsAppNumber(guestCart.seller.phone),
      sellerName: guestCart.seller.name,
      guestName: guestCart.guestName,
      guestPhone: guestCart.guestPhone || guestPhone || 'Não informado',
      guestEmail: guestCart.guestEmail || guestEmail,
      items: items.map(item => ({
        ...item,
        variantId: item.variantId || undefined,
      })),
      subtotal,
      shipping,
      total,
      paymentMethod: paymentMethodLabel,
      isCashOnDelivery,
      address: guestCart.address ? {
        street: guestCart.address.street,
        number: guestCart.address.number,
        neighborhood: guestCart.address.neighborhood,
        city: guestCart.address.city,
        state: guestCart.address.state,
        cep: guestCart.address.cep,
      } : undefined,
      notes: guestCart.notes || undefined,
      cartUrl,
    };

    // Enviar WhatsApp (mensagem específica para cash on delivery)
    const whatsappResult = isCashOnDelivery
      ? await notifySellerCashOnDelivery(guestCart.seller.phone, guestCart.seller.name, messageData)
      : await notifySellerNewCart(guestCart.seller.phone, guestCart.seller.name, messageData);

    // Criar endereço de entrega primeiro (se houver)
    let shippingAddressId: string | undefined;
    if (guestCart.address) {
      const address = await prisma.address.create({
        data: {
          name: guestCart.address.name,
          phone: guestCart.address.phone,
          cep: guestCart.address.cep,
          street: guestCart.address.street,
          number: guestCart.address.number,
          complement: guestCart.address.complement,
          neighborhood: guestCart.address.neighborhood,
          city: guestCart.address.city,
          state: guestCart.address.state,
          country: guestCart.address.country,
          type: 'shipping',
          userId: guestCart.sellerId!,
        },
      });
      shippingAddressId = address.id;
    }

    // Atualizar status do carrinho
    await prisma.guestCart.update({
      where: { id },
      data: { status: 'CONVERTED' },
    });

    // Criar Pedido (Order) no banco
    const order = await prisma.order.create({
      data: {
        orderNumber: `ORD-${Date.now().toString(36).toUpperCase()}`,
        status: isCashOnDelivery ? 'PENDING_PAYMENT' : 'PENDING_PAYMENT',
        paymentStatus: isCashOnDelivery ? 'PENDING' : 'PENDING',
        subtotal,
        shippingAmount: shipping,
        total,
        currency: 'BRL',
        buyerId: guestCart.sellerId || 'guest',
        sellerId: guestCart.sellerId!,
        siteId: guestCart.siteId,
        notes: `Pagamento: ${paymentMethodLabel}${guestCart.notes ? `\nRecado: ${guestCart.notes}` : ''}`,
        items: {
          create: items.map(item => ({
            quantity: item.quantity,
            unitPrice: item.price,
            totalPrice: item.price * item.quantity,
            productName: item.name,
            productSku: item.productId,
            variantName: item.variant,
            productId: item.productId,
            variantId: item.variantId,
          })),
        },
        shippingAddressId,
      },
    });

    // Criar notificação para o vendedor
    await prisma.notification.create({
      data: {
        userId: guestCart.seller.id,
        type: 'NEW_GUEST_CART',
        title: `Novo pedido de ${guestCart.guestName} - ${paymentMethodLabel}`,
        message: `Cliente ${guestCart.guestName} finalizou pedido #${order.orderNumber} no valor de R$ ${total.toFixed(2)} (${paymentMethodLabel}). WhatsApp ${whatsappResult.success ? 'enviado' : 'falhou'}.`,
        data: { guestCartId: id, orderId: order.id, whatsappSent: whatsappResult.success, paymentMethod },
      },
    });

    return NextResponse.json({
      success: true,
      whatsappSent: whatsappResult.success,
      messageId: whatsappResult.messageId,
      total,
      orderId: order.id,
      orderNumber: order.orderNumber,
      paymentMethod,
      isCashOnDelivery,
      cartUrl,
    });
  } catch (error) {
    console.error('Erro ao finalizar carrinho guest:', error);
    return NextResponse.json({ error: 'Erro interno ao finalizar' }, { status: 500 });
  }
}