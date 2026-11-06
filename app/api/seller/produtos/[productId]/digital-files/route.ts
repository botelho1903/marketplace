import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth/config'

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

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { sellerId: true, digitalFiles: true }
    })

    if (!product) {
      return NextResponse.json({ message: 'Produto não encontrado' }, { status: 404 })
    }

    if (userRole !== 'ADMIN' && product.sellerId !== userId) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 403 })
    }

    const digitalFiles = await prisma.digitalFile.findMany({
      where: { productId },
      orderBy: { sortOrder: 'asc' }
    })

    return NextResponse.json(digitalFiles)
  } catch (error) {
    console.error('Error fetching digital files:', error)
    return NextResponse.json({ message: 'Erro ao buscar arquivos digitais' }, { status: 500 })
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
      select: { sellerId: true, type: true }
    })

    if (!product) {
      return NextResponse.json({ message: 'Produto não encontrado' }, { status: 404 })
    }

    if (userRole !== 'ADMIN' && product.sellerId !== userId) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 403 })
    }

    if (product.type !== 'DIGITAL') {
      return NextResponse.json({ message: 'Apenas produtos digitais podem ter arquivos' }, { status: 400 })
    }

    const digitalFile = await prisma.digitalFile.create({
      data: {
        name: body.name,
        url: body.url,
        size: body.size,
        mimeType: body.mimeType,
        sortOrder: body.sortOrder || 0,
        productId,
      }
    })

    return NextResponse.json(digitalFile, { status: 201 })
  } catch (error) {
    console.error('Error creating digital file:', error)
    return NextResponse.json({ message: 'Erro ao criar arquivo digital' }, { status: 500 })
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

    const { fileId, ...updateData } = body

    if (!fileId) {
      return NextResponse.json({ message: 'ID do arquivo é obrigatório' }, { status: 400 })
    }

    const file = await prisma.digitalFile.findFirst({
      where: { id: fileId, productId }
    })

    if (!file) {
      return NextResponse.json({ message: 'Arquivo não encontrado' }, { status: 404 })
    }

    const updatedFile = await prisma.digitalFile.update({
      where: { id: fileId },
      data: updateData
    })

    return NextResponse.json(updatedFile)
  } catch (error) {
    console.error('Error updating digital file:', error)
    return NextResponse.json({ message: 'Erro ao atualizar arquivo digital' }, { status: 500 })
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
    const fileId = searchParams.get('fileId')

    if (!fileId) {
      return NextResponse.json({ message: 'ID do arquivo é obrigatório' }, { status: 400 })
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

    const file = await prisma.digitalFile.findFirst({
      where: { id: fileId, productId }
    })

    if (!file) {
      return NextResponse.json({ message: 'Arquivo não encontrado' }, { status: 404 })
    }

    await prisma.digitalFile.delete({
      where: { id: fileId }
    })

    return NextResponse.json({ message: 'Arquivo excluído com sucesso' })
  } catch (error) {
    console.error('Error deleting digital file:', error)
    return NextResponse.json({ message: 'Erro ao excluir arquivo digital' }, { status: 500 })
  }
}