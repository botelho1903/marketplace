import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth/config'
import crypto from 'crypto'

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-32-char-encryption-key-change-in-production'

function encrypt(text: string): string {
  const iv = crypto.randomBytes(16)
  const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32)
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()])
  const authTag = cipher.getAuthTag()
  return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted.toString('hex')
}

function decrypt(encryptedText: string): string {
  try {
    const [ivHex, authTagHex, encryptedHex] = encryptedText.split(':')
    const iv = Buffer.from(ivHex, 'hex')
    const authTag = Buffer.from(authTagHex, 'hex')
    const encrypted = Buffer.from(encryptedHex, 'hex')
    const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32)
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv)
    decipher.setAuthTag(authTag)
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()])
    return decrypted.toString('utf8')
  } catch {
    return ''
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || (session.user as any).role !== 'SELLER' && (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    const userId = (session.user as any).id

    const sellerProfile = await prisma.sellerProfile.findUnique({
      where: { userId },
      select: {
        id: true,
        mercadopagoAccessToken: true,
        mercadopagoPublicKey: true,
        mercadopagoUserId: true,
        mercadopagoConnectedAt: true,
        pixKey: true,
        bankAccount: true,
        commissionRate: true,
        payoutSchedule: true,
      }
    })

    if (!sellerProfile) {
      return NextResponse.json({ message: 'Perfil de vendedor não encontrado' }, { status: 404 })
    }

    // Don't return the actual encrypted tokens, just whether they're set
    return NextResponse.json({
      hasMercadoPagoCredentials: !!sellerProfile.mercadopagoAccessToken,
      mercadopagoPublicKey: sellerProfile.mercadopagoPublicKey,
      mercadopagoUserId: sellerProfile.mercadopagoUserId,
      mercadopagoConnectedAt: sellerProfile.mercadopagoConnectedAt,
      pixKey: sellerProfile.pixKey,
      bankAccount: sellerProfile.bankAccount,
      commissionRate: sellerProfile.commissionRate,
      payoutSchedule: sellerProfile.payoutSchedule,
    })
  } catch (error) {
    console.error('Error fetching seller payment settings:', error)
    return NextResponse.json({ message: 'Erro ao buscar configurações de pagamento' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || (session.user as any).role !== 'SELLER' && (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const body = await req.json()

    const {
      mercadopagoAccessToken,
      mercadopagoPublicKey,
      mercadopagoUserId,
      pixKey,
      bankAccount,
      commissionRate,
      payoutSchedule,
    } = body

    const updateData: any = {}

    if (mercadopagoAccessToken !== undefined) {
      updateData.mercadopagoAccessToken = mercadopagoAccessToken ? encrypt(mercadopagoAccessToken) : null
    }
    if (mercadopagoPublicKey !== undefined) {
      updateData.mercadopagoPublicKey = mercadopagoPublicKey
    }
    if (mercadopagoUserId !== undefined) {
      updateData.mercadopagoUserId = mercadopagoUserId
    }
    if (mercadopagoAccessToken !== undefined && mercadopagoAccessToken) {
      updateData.mercadopagoConnectedAt = new Date()
    }
    if (pixKey !== undefined) {
      updateData.pixKey = pixKey
    }
    if (bankAccount !== undefined) {
      updateData.bankAccount = bankAccount
    }
    if (commissionRate !== undefined) {
      updateData.commissionRate = commissionRate
    }
    if (payoutSchedule !== undefined) {
      updateData.payoutSchedule = payoutSchedule
    }

    const sellerProfile = await prisma.sellerProfile.upsert({
      where: { userId },
      update: updateData,
      create: {
        userId,
        storeName: 'Loja',
        storeSlug: `loja-${userId.substring(0, 8)}`,
        ...updateData,
      },
      select: {
        id: true,
        mercadopagoAccessToken: true,
        mercadopagoPublicKey: true,
        mercadopagoUserId: true,
        mercadopagoConnectedAt: true,
        pixKey: true,
        bankAccount: true,
        commissionRate: true,
        payoutSchedule: true,
      }
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'SELLER_PAYMENT_SETTINGS_UPDATED',
        entityType: 'SellerProfile',
        entityId: sellerProfile.id,
        userId,
        sellerId: userId,
        newData: {
          hasMercadoPagoCredentials: !!sellerProfile.mercadopagoAccessToken,
          mercadopagoUserId: sellerProfile.mercadopagoUserId,
          pixKey: sellerProfile.pixKey,
          commissionRate: sellerProfile.commissionRate,
          payoutSchedule: sellerProfile.payoutSchedule,
        },
        metadata: { updatedFields: Object.keys(updateData) },
      }
    })

    return NextResponse.json({
      message: 'Configurações de pagamento atualizadas com sucesso',
      hasMercadoPagoCredentials: !!sellerProfile.mercadopagoAccessToken,
      mercadopagoPublicKey: sellerProfile.mercadopagoPublicKey,
      mercadopagoUserId: sellerProfile.mercadopagoUserId,
      mercadopagoConnectedAt: sellerProfile.mercadopagoConnectedAt,
      pixKey: sellerProfile.pixKey,
      bankAccount: sellerProfile.bankAccount,
      commissionRate: sellerProfile.commissionRate,
      payoutSchedule: sellerProfile.payoutSchedule,
    })
  } catch (error) {
    console.error('Error updating seller payment settings:', error)
    return NextResponse.json({ message: 'Erro ao atualizar configurações de pagamento' }, { status: 500 })
  }
}