import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth/config'

// This endpoint handles digital product delivery after a successful purchase
// It can be called from webhooks (payment confirmation) or manually by admin

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { orderId, orderItemId } = body

    if (!orderId || !orderItemId) {
      return NextResponse.json({ message: 'orderId e orderItemId são obrigatórios' }, { status: 400 })
    }

    // Get the order item with product details
    const orderItem = await prisma.orderItem.findUnique({
      where: { id: orderItemId },
      include: {
        product: {
          include: {
            digitalFiles: { orderBy: { sortOrder: 'asc' } },
          }
        },
        order: {
          include: {
            buyer: true
          }
        }
      }
    })

    if (!orderItem) {
      return NextResponse.json({ message: 'Item do pedido não encontrado' }, { status: 404 })
    }

    const product = orderItem.product
    const order = orderItem.order
    const buyer = order.buyer

    if (!product.isDigital) {
      return NextResponse.json({ message: 'Produto não é digital' }, { status: 400 })
    }

    const deliveryResults = {
      licenseKey: null as any,
      digitalFiles: [] as any[],
      downloadLinks: [] as any[],
    }

    // Handle license key delivery
    if (product.digitalDeliveryType === 'LICENSE_KEY' || product.requiresActivation) {
      // Find or create an available license key
      let licenseKey = await prisma.licenseKey.findFirst({
        where: {
          productId: product.id,
          status: 'AVAILABLE'
        }
      })

      if (!licenseKey) {
        // Generate a new one if none available
        const key = generateLicenseKey(product.licenseKeyTemplate ?? undefined)
        licenseKey = await prisma.licenseKey.create({
          data: {
            key,
            productId: product.id,
            orderId: order.id,
            userId: buyer.id,
            status: 'SOLD',
            maxActivations: product.maxActivations || 1,
          }
        })
      } else {
        // Assign the existing key to this order/user
        licenseKey = await prisma.licenseKey.update({
          where: { id: licenseKey.id },
          data: {
            orderId: order.id,
            userId: buyer.id,
            status: 'SOLD',
          }
        })
      }

      deliveryResults.licenseKey = {
        key: licenseKey.key,
        maxActivations: licenseKey.maxActivations,
        expiresAt: licenseKey.expiresAt,
        activationUrl: product.activationUrl,
      }
    }

    // Handle digital files delivery
    if (product.digitalFiles.length > 0) {
      const downloadExpiryDays = product.downloadExpiryDays || 30
      const expiryDate = new Date()
      expiryDate.setDate(expiryDate.getDate() + downloadExpiryDays)

      for (const file of product.digitalFiles) {
        // Create a secure download link (in production, use signed URLs)
        const downloadToken = crypto.getRandomValues(new Uint8Array(32))
          .reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '')

        deliveryResults.digitalFiles.push({
          id: file.id,
          name: file.name,
          size: file.size,
          mimeType: file.mimeType,
          downloadUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/download/${file.id}?token=${downloadToken}&order=${order.id}`,
          expiresAt: expiryDate,
          downloadLimit: product.downloadLimit || 0,
        })

        deliveryResults.downloadLinks.push({
          fileId: file.id,
          fileName: file.name,
          url: deliveryResults.digitalFiles[deliveryResults.digitalFiles.length - 1].downloadUrl,
          expiresAt: expiryDate,
        })
      }
    }

    // Create notification for the buyer
    await prisma.notification.create({
      data: {
        userId: buyer.id,
        type: 'DIGITAL_DELIVERY',
        title: 'Seu produto digital está pronto!',
        message: `O produto "${product.name}" foi entregue. ${deliveryResults.licenseKey ? 'Sua chave de licença: ' + deliveryResults.licenseKey.key : ''} ${deliveryResults.downloadLinks.length > 0 ? 'Arquivos disponíveis para download.' : ''}`,
        data: {
          orderId: order.id,
          orderItemId: orderItem.id,
          productId: product.id,
          deliveryResults,
        }
      }
    })

    // If delivery is by email, send email (implement with your email service)
    if (product.digitalDeliveryType === 'EMAIL') {
      // await sendDigitalDeliveryEmail(buyer.email, product, deliveryResults)
    }

    return NextResponse.json({
      success: true,
      delivery: deliveryResults,
    })
  } catch (error) {
    console.error('Error delivering digital product:', error)
    return NextResponse.json({ message: 'Erro ao entregar produto digital' }, { status: 500 })
  }
}

function generateLicenseKey(template?: string): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  const segments = template ? template.split('-').length : 4
  const segmentLength = template ? template.split('-')[0].length : 5

  let key = ''
  for (let i = 0; i < segments; i++) {
    let segment = ''
    for (let j = 0; j < segmentLength; j++) {
      segment += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    key += segment
    if (i < segments - 1) key += '-'
  }
  return key
}

// GET endpoint to check delivery status
export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const orderId = searchParams.get('orderId')

    if (!orderId) {
      return NextResponse.json({ message: 'orderId é obrigatório' }, { status: 400 })
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: {
              include: {
                digitalFiles: true,
                licenseKeys: {
                  where: { orderId },
                  include: { user: { select: { id: true } } }
                }
              }
            }
          }
        }
      }
    })

    if (!order) {
      return NextResponse.json({ message: 'Pedido não encontrado' }, { status: 404 })
    }

    // Check if user owns this order
    const userId = (session.user as any).id
    const userRole = (session.user as any).role

    if (userRole !== 'ADMIN' && order.buyerId !== userId) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 403 })
    }

    const digitalDeliveries = order.items
      .filter(item => item.product.isDigital)
      .map(item => ({
        orderItemId: item.id,
        productName: item.product.name,
        productType: item.product.type,
        digitalDeliveryType: item.product.digitalDeliveryType,
        licenseKeys: item.product.licenseKeys.map(lk => ({
          key: lk.key,
          status: lk.status,
          activatedAt: lk.activatedAt,
          expiresAt: lk.expiresAt,
          maxActivations: lk.maxActivations,
        })),
        digitalFiles: item.product.digitalFiles.map(f => ({
          id: f.id,
          name: f.name,
          size: f.size,
          mimeType: f.mimeType,
        })),
      }))

    return NextResponse.json({ deliveries: digitalDeliveries })
  } catch (error) {
    console.error('Error fetching digital delivery:', error)
    return NextResponse.json({ message: 'Erro ao buscar entrega digital' }, { status: 500 })
  }
}