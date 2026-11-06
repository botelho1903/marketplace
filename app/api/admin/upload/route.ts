import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth/config'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as 'logo' | 'background' | 'favicon'
    const siteId = formData.get('siteId') as string

    if (!file || !type || !siteId) {
      return NextResponse.json(
        { message: 'Arquivo, tipo e siteId são obrigatórios' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { message: 'Tipo de arquivo não suportado. Use PNG, JPG, WebP ou SVG' },
        { status: 400 }
      )
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { message: 'Arquivo muito grande. Máximo: 5MB' },
        { status: 400 }
      )
    }

    // Verify site exists and user has access
    const site = await prisma.site.findUnique({
      where: { id: siteId },
    })

    if (!site) {
      return NextResponse.json({ message: 'Site não encontrado' }, { status: 404 })
    }

    // Create uploads directory if it doesn't exist
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'sites', siteId)
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const extension = file.name.split('.').pop() || 'png'
    const filename = `${type}-${timestamp}.${extension}`
    const filepath = join(uploadDir, filename)

    // Save file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filepath, buffer)

    // Return public URL
    const url = `/uploads/sites/${siteId}/${filename}`

    // Update site settings in database
    const updateData: Record<string, string> = {}
    if (type === 'logo') updateData.logo = url
    else if (type === 'background') updateData.settings = JSON.stringify({ ...(site.settings as object || {}), background: url })
    else if (type === 'favicon') updateData.favicon = url

    if (Object.keys(updateData).length > 0) {
      await prisma.site.update({
        where: { id: siteId },
        data: updateData,
      })
    }

    // Also update site settings table for background
    if (type === 'background') {
      await prisma.setting.upsert({
        where: {
          key_siteId: {
            key: 'site_background',
            siteId,
          },
        },
        create: {
          key: 'site_background',
          value: url,
          type: 'string',
          group: 'appearance',
          label: 'Background do Site',
          isPublic: true,
          siteId,
        },
        update: { value: url },
      })
    }

    return NextResponse.json({ url, message: 'Upload realizado com sucesso' })
  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json({ message: 'Erro ao fazer upload' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type') as 'logo' | 'background' | 'favicon'
    const siteId = searchParams.get('siteId')

    if (!type || !siteId) {
      return NextResponse.json(
        { message: 'Tipo e siteId são obrigatórios' },
        { status: 400 }
      )
    }

    const site = await prisma.site.findUnique({
      where: { id: siteId },
    })

    if (!site) {
      return NextResponse.json({ message: 'Site não encontrado' }, { status: 404 })
    }

    const updateData: Record<string, string | null> = {}
    if (type === 'logo') updateData.logo = null
    else if (type === 'favicon') updateData.favicon = null
    else if (type === 'background') {
      updateData.settings = JSON.stringify({ ...(site.settings as object || {}), background: null })
    }

    if (Object.keys(updateData).length > 0) {
      await prisma.site.update({
        where: { id: siteId },
        data: updateData,
      })
    }

    // Also clear from settings table
    if (type === 'background') {
      await prisma.setting.deleteMany({
        where: {
          key: 'site_background',
          siteId,
        },
      })
    }

    return NextResponse.json({ message: 'Removido com sucesso' })
  } catch (error) {
    console.error('Error deleting file:', error)
    return NextResponse.json({ message: 'Erro ao remover' }, { status: 500 })
  }
}