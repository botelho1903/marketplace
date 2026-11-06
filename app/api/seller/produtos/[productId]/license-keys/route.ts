import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth/config'
import crypto from 'crypto'

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

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    const { productId } = await params
    const userId = (session.user as any).id
    const userRole = (session.user as any).role
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { sellerId: true }
    })

    if (!product) {
      return NextResponse.json({ message: 'Produto não encontrado' }, { status: 404 })
    }

    if (userRole !== 'ADMIN' && product.sellerId !== userId) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 403 })
    }

    const where: any = { productId }
    if (status) where.status = status

    const [licenseKeys, total] = await Promise.all([
      prisma.licenseKey.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          order: { select: { id: true, orderNumber: true, createdAt: true } },
          user: { select: { id: true, name: true, email: true } }
        }
      }),
      prisma.licenseKey.count({ where })
    ])

    return NextResponse.json({
      licenseKeys,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      }
    })
  } catch (error) {
    console.error('Error fetching license keys:', error)
    return NextResponse.json({ message: 'Erro ao buscar chaves de licença' }, { status: 500 })
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || (session.user as any).role !== 'SELLER' && (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    const { productId } = await params
    const userId = (session.user as any).id
    const userRole = (session.user as any).role
    const body = await req.json()

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { sellerId: true, licenseKeyTemplate: true, type: true, maxActivations: true }
    })

    if (!product) {
      return NextResponse.json({ message: 'Produto não encontrado' }, { status: 404 })
    }

    if (userRole !== 'ADMIN' && product.sellerId !== userId) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 403 })
    }

    if (product.type !== 'DIGITAL') {
      return NextResponse.json({ message: 'Apenas produtos digitais podem ter chaves de licença' }, { status: 400 })
    }

    const count = body.count || 1
    const expiresAt = body.expiresAt ? new Date(body.expiresAt) : null
    const maxActivations = body.maxActivations || product.maxActivations || 1

    const licenseKeys = []
    for (let i = 0; i < count; i++) {
      const key = generateLicenseKey(product.licenseKeyTemplate ?? undefined)
      const licenseKey = await prisma.licenseKey.create({
        data: {
          key,
          productId,
          status: 'AVAILABLE',
          expiresAt,
          maxActivations,
        }
      })
      licenseKeys.push(licenseKey)
    }

    return NextResponse.json(licenseKeys, { status: 201 })
  } catch (error) {
    console.error('Error creating license keys:', error)
    return NextResponse.json({ message: 'Erro ao criar chaves de licença' }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || (session.user as any).role !== 'SELLER' && (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    const { productId } = await params
    const userId = (session.user as any).id
    const userRole = (session.user as any).role
    const body = await req.json()

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { sellerId: true }
    })

    if (!product) {
      return NextResponse.json({ message: 'Produto não encontrado' }, { status: 404 })
    }

    if (userRole !== 'ADMIN' && product.sellerId !== userId) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 403 })
    }

    const { keyId, ...updateData } = body

    if (!keyId) {
      return NextResponse.json({ message: 'ID da chave é obrigatório' }, { status: 400 })
    }

    const key = await prisma.licenseKey.findFirst({
      where: { id: keyId, productId }
    })

    if (!key) {
      return NextResponse.json({ message: 'Chave não encontrada' }, { status: 404 })
    }

    const updatedKey = await prisma.licenseKey.update({
      where: { id: keyId },
      data: updateData
    })

    return NextResponse.json(updatedKey)
  } catch (error) {
    console.error('Error updating license key:', error)
    return NextResponse.json({ message: 'Erro ao atualizar chave de licença' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || (session.user as any).role !== 'SELLER' && (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    const { productId } = await params
    const userId = (session.user as any).id
    const userRole = (session.user as any).role
    const { searchParams } = new URL(req.url)
    const keyId = searchParams.get('keyId')

    if (!keyId) {
      return NextResponse.json({ message: 'ID da chave é obrigatório' }, { status: 400 })
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { sellerId: true }
    })

    if (!product) {
      return NextResponse.json({ message: 'Produto não encontrado' }, { status: 404 })
    }

    if (userRole !== 'ADMIN' && product.sellerId !== userId) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 403 })
    }

    const key = await prisma.licenseKey.findFirst({
      where: { id: keyId, productId }
    })

    if (!key) {
      return NextResponse.json({ message: 'Chave não encontrada' }, { status: 404 })
    }

    if (key.status !== 'AVAILABLE') {
      return NextResponse.json({ message: 'Não é possível excluir chaves já vendidas ou ativadas' }, { status: 400 })
    }

    await prisma.licenseKey.delete({
      where: { id: keyId }
    })

    return NextResponse.json({ message: 'Chave de licença excluída com sucesso' })
  } catch (error) {
    console.error('Error deleting license key:', error)
    return NextResponse.json({ message: 'Erro ao excluir chave de licença' }, { status: 500 })
  }
}