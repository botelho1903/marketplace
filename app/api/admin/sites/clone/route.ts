import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth/config'
import { z } from 'zod'

const cloneSiteSchema = z.object({
  sourceSiteId: z.string(),
  newName: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  newDomain: z.string().min(3, 'Domínio inválido'),
  newSubdomain: z.string().regex(/^[a-z0-9-]+$/).optional().or(z.literal('')),
  copyTheme: z.boolean().default(true),
  copySettings: z.boolean().default(true),
  copyCategories: z.boolean().default(true),
  copyProducts: z.boolean().default(false), // Usually don't copy products
})

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    const body = await req.json()
    const validated = cloneSiteSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        { message: validated.error.errors[0].message },
        { status: 400 }
      )
    }

    // Check if domain is unique
    const existingDomain = await prisma.site.findUnique({
      where: { domain: validated.data.newDomain },
    })
    if (existingDomain) {
      return NextResponse.json({ message: 'Este domínio já está em uso' }, { status: 400 })
    }

    // Check if subdomain is unique
    if (validated.data.newSubdomain) {
      const existingSubdomain = await prisma.site.findUnique({
        where: { subdomain: validated.data.newSubdomain },
      })
      if (existingSubdomain) {
        return NextResponse.json({ message: 'Este subdomínio já está em uso' }, { status: 400 })
      }
    }

    // Get source site
    const sourceSite = await prisma.site.findUnique({
      where: { id: validated.data.sourceSiteId },
      include: {
        categories: true,
        products: { include: { images: true, variants: true, attributes: { include: { values: true } } } },
        siteSettings: true,
      },
    })

    if (!sourceSite) {
      return NextResponse.json({ message: 'Site origem não encontrado' }, { status: 404 })
    }

    // Create new site
    const newSite = await prisma.site.create({
      data: {
        name: validated.data.newName,
        domain: validated.data.newDomain,
        subdomain: validated.data.newSubdomain || null,
        description: sourceSite.description,
        logo: validated.data.copyTheme ? sourceSite.logo : null,
        favicon: validated.data.copyTheme ? sourceSite.favicon : null,
        isActive: true,
        theme: validated.data.copyTheme ? (sourceSite.theme as any) : undefined,
        defaultCurrency: sourceSite.defaultCurrency,
        defaultLocale: sourceSite.defaultLocale,
        timezone: sourceSite.timezone,
        ownerId: (session.user as any).id,
        isPrimary: false,
      },
    })

    // Copy settings
    if (validated.data.copySettings && sourceSite.siteSettings) {
      const settingsToCreate = sourceSite.siteSettings.map((s: any) => ({
        key: s.key,
        value: s.value,
        type: s.type,
        group: s.group,
        label: s.label,
        description: s.description,
        isPublic: s.isPublic,
        siteId: newSite.id,
      }))

      if (settingsToCreate.length > 0) {
        await prisma.setting.createMany({ data: settingsToCreate })
      }
    }

    // Copy categories
    if (validated.data.copyCategories) {
      const categoriesToCreate = sourceSite.categories.map((c: any) => ({
        name: c.name,
        slug: c.slug,
        description: c.description,
        image: c.image,
        icon: c.icon,
        sortOrder: c.sortOrder,
        isActive: c.isActive,
        siteId: newSite.id,
      }))

      if (categoriesToCreate.length > 0) {
        await prisma.category.createMany({ data: categoriesToCreate })
      }
    }

    // Copy products (as drafts)
    if (validated.data.copyProducts) {
      for (const product of sourceSite.products) {
        const newProduct = await prisma.product.create({
          data: {
            sku: `${product.sku}-${newSite.id.slice(0, 6)}`,
            name: product.name,
            slug: `${product.slug}-${newSite.id.slice(0, 6)}`,
            description: product.description,
            shortDescription: product.shortDescription,
            basePrice: product.basePrice,
            salePrice: product.salePrice,
            costPrice: product.costPrice,
            compareAtPrice: product.compareAtPrice,
            stock: 0, // Reset stock
            reservedStock: 0,
            lowStockThreshold: product.lowStockThreshold,
            trackInventory: product.trackInventory,
            allowBackorder: product.allowBackorder,
            weight: product.weight,
            dimensions: product.dimensions as any,
            status: 'DRAFT',
            isFeatured: false,
            isDigital: product.isDigital,
            digitalFileUrl: product.digitalFileUrl,
            tags: product.tags,
            metaTitle: product.metaTitle,
            metaDescription: product.metaDescription,
            siteId: newSite.id,
            sellerId: (session.user as any).id,
            categoryId: product.categoryId, // Will need to map to new category IDs
          },
        })

        // Copy images
        if (product.images.length > 0) {
          await prisma.productImage.createMany({
            data: product.images.map((img: any) => ({
              url: img.url,
              alt: img.alt,
              sortOrder: img.sortOrder,
              isPrimary: img.isPrimary,
              productId: newProduct.id,
            })),
          })
        }
      }
    }

    return NextResponse.json(newSite, { status: 201 })
  } catch (error) {
    console.error('Error cloning site:', error)
    return NextResponse.json({ message: 'Erro ao clonar site' }, { status: 500 })
  }
}