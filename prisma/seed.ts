import { PrismaClient, UserRole, UserStatus, ProductStatus, Category } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...')

  // 0. Create Primary Site
  const primarySite = await prisma.site.upsert({
    where: { domain: 'localhost' },
    update: {},
    create: {
      name: 'Marketplace Principal',
      domain: 'localhost',
      subdomain: 'app',
      description: 'Site principal do marketplace',
      isActive: true,
      isPrimary: true,
      defaultCurrency: 'BRL',
      defaultLocale: 'pt-BR',
      timezone: 'America/Sao_Paulo',
      ownerId: 'system', // Will be updated after admin creation
    },
  })
  console.log('✅ Site principal criado:', primarySite.domain)

  // 1. Create Admin User
  const adminPassword = await bcrypt.hash('admin123', 12)
  const admin = await prisma.user.upsert({
    where: { email_siteId: { email: 'admin@marketplace.com', siteId: primarySite.id } },
    update: {},
    create: {
      email: 'admin@marketplace.com',
      name: 'Administrador',
      passwordHash: adminPassword,
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      emailVerified: new Date(),
      phone: '(11) 99999-9999',
      siteId: primarySite.id,
    },
  })
  console.log('✅ Admin criado:', admin.email)

  // Update site owner
  await prisma.site.update({
    where: { id: primarySite.id },
    data: { ownerId: admin.id },
  })

  // 2. Create Test Seller
  const sellerPassword = await bcrypt.hash('seller123', 12)
  const seller = await prisma.user.upsert({
    where: { email_siteId: { email: 'vendedor@marketplace.com', siteId: primarySite.id } },
    update: {},
    create: {
      email: 'vendedor@marketplace.com',
      name: 'João Vendedor',
      passwordHash: sellerPassword,
      role: UserRole.SELLER,
      status: UserStatus.ACTIVE,
      emailVerified: new Date(),
      phone: '(11) 88888-8888',
      siteId: primarySite.id,
    },
  })

  const sellerProfile = await prisma.sellerProfile.upsert({
    where: { userId: seller.id },
    update: {},
    create: {
      userId: seller.id,
      storeName: 'Loja do João',
      storeSlug: 'loja-do-joao',
      storeDescription: 'Melhores produtos com os melhores preços!',
      cnpj: '12.345.678/0001-90',
      corporateName: 'João Vendedor ME',
      phone: '(11) 88888-8888',
      email: 'contato@lojadojoao.com',
      isVerified: true,
      verifiedAt: new Date(),
      commissionRate: 10,
      payoutSchedule: 'weekly',
    },
  })
  console.log('✅ Vendedor criado:', seller.email)

  // 3. Create Test Buyer
  const buyerPassword = await bcrypt.hash('buyer123', 12)
  const buyer = await prisma.user.upsert({
    where: { email_siteId: { email: 'cliente@marketplace.com', siteId: primarySite.id } },
    update: {},
    create: {
      email: 'cliente@marketplace.com',
      name: 'Maria Cliente',
      passwordHash: buyerPassword,
      role: UserRole.USER,
      status: UserStatus.ACTIVE,
      emailVerified: new Date(),
      phone: '(11) 77777-7777',
      siteId: primarySite.id,
    },
  })
  console.log('✅ Comprador criado:', buyer.email)

  // 4. Create Categories
  const categoriesData = [
    { name: 'Eletrônicos', slug: 'eletronicos', icon: '📱', description: 'Smartphones, notebooks, tablets e acessórios' },
    { name: 'Moda Feminina', slug: 'moda-feminina', icon: '👗', description: 'Roupas, calçados, bolsas e acessórios femininos' },
    { name: 'Moda Masculina', slug: 'moda-masculina', icon: '👔', description: 'Roupas, calçados, relógios e acessórios masculinos' },
    { name: 'Casa & Decoração', slug: 'casa-decoracao', icon: '🏠', description: 'Móveis, decoração, cama, banho e cozinha' },
    { name: 'Beleza & Perfumaria', slug: 'beleza-perfumaria', icon: '💄', description: 'Maquiagem, skincare, perfumes e cuidados pessoais' },
    { name: 'Esportes & Lazer', slug: 'esportes-lazer', icon: '⚽', description: 'Fitness, corrida, ciclismo, natação e outdoor' },
    { name: 'Brinquedos & Bebê', slug: 'brinquedos-bebe', icon: '🧸', description: 'Brinquedos, primeira infância, jogos e festas' },
    { name: 'Automotivo', slug: 'automotivo', icon: '🚗', description: 'Peças, acessórios, ferramentas e cuidados automotivos' },
  ]

  const categories: Category[] = []
  for (let i = 0; i < categoriesData.length; i++) {
    const cat = await prisma.category.upsert({
      where: { slug_siteId: { slug: categoriesData[i].slug, siteId: primarySite.id } },
      update: {},
      create: {
        ...categoriesData[i],
        sortOrder: i + 1,
        isActive: true,
        siteId: primarySite.id,
      },
    })
    categories.push(cat)
  }
  console.log('✅ Categorias criadas:', categories.length)

  // 5. Create Sample Products
  const productsData = [
    {
      name: 'Smartphone Galaxy S24 Ultra 256GB',
      slug: 'smartphone-galaxy-s24-ultra-256gb',
      description: 'O mais avançado smartphone da Samsung com tela Dynamic AMOLED 2X de 6.8", processador Snapdragon 8 Gen 3, câmera de 200MP e S Pen integrada.',
      shortDescription: 'Top de linha da Samsung com câmera 200MP e S Pen',
      basePrice: 6999.00,
      salePrice: 5999.00,
      compareAtPrice: 7499.00,
      stock: 50,
      sku: 'SAM-S24U-256-BK',
      weight: 0.232,
      dimensions: { width: 79, height: 162.3, depth: 8.6 },
      tags: ['smartphone', 'samsung', 'android', 'premium', 'camera'],
      isFeatured: true,
      categoryId: categories[0].id,
      sellerId: seller.id,
      images: [
        { url: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800', alt: 'Galaxy S24 Ultra preto', isPrimary: true, sortOrder: 0 },
        { url: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800', alt: 'Galaxy S24 Ultra lateral', isPrimary: false, sortOrder: 1 },
      ],
    },
    {
      name: 'Notebook Dell XPS 13 Plus Intel i7 16GB 512GB SSD',
      slug: 'notebook-dell-xps-13-plus-i7-16gb-512gb',
      description: 'Ultrabook premium com tela 13.4" 3.5K OLED, Intel Core i7-1360P, 16GB LPDDR5, 512GB SSD. Design minimalista em alumínio usinado.',
      shortDescription: 'Ultrabook premium 13" OLED com Intel i7',
      basePrice: 8499.00,
      salePrice: 7799.00,
      stock: 15,
      sku: 'DEL-XPS13P-I7-16-512',
      weight: 1.23,
      dimensions: { width: 295.3, height: 199.04, depth: 15.25 },
      tags: ['notebook', 'dell', 'ultrabook', 'oled', 'intel'],
      isFeatured: true,
      categoryId: categories[0].id,
      sellerId: seller.id,
      images: [
        { url: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800', alt: 'Dell XPS 13 Plus', isPrimary: true, sortOrder: 0 },
      ],
    },
    {
      name: 'Tênis Nike Air Max 270 Masculino',
      slug: 'tenis-nike-air-max-270-masculino',
      description: 'Conforto o dia todo com a unidade Max Air 270 no calcanhar. Cabedal em mesh respirável, entressola em espuma e solado de borracha durável.',
      shortDescription: 'Tênis casual com amortecimento Max Air',
      basePrice: 699.99,
      salePrice: 549.99,
      compareAtPrice: 799.99,
      stock: 100,
      sku: 'NIKE-AM270-M-42-BK',
      weight: 0.38,
      tags: ['tenis', 'nike', 'air-max', 'masculino', 'casual'],
      isFeatured: false,
      categoryId: categories[2].id,
      sellerId: seller.id,
      images: [
        { url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800', alt: 'Nike Air Max 270 preto', isPrimary: true, sortOrder: 0 },
      ],
      variants: [
        { name: 'Tamanho 40', sku: 'NIKE-AM270-M-40-BK', price: 549.99, stock: 10, attributeValues: [] },
        { name: 'Tamanho 41', sku: 'NIKE-AM270-M-41-BK', price: 549.99, stock: 15, attributeValues: [] },
        { name: 'Tamanho 42', sku: 'NIKE-AM270-M-42-BK', price: 549.99, stock: 20, attributeValues: [] },
        { name: 'Tamanho 43', sku: 'NIKE-AM270-M-43-BK', price: 549.99, stock: 15, attributeValues: [] },
        { name: 'Tamanho 44', sku: 'NIKE-AM270-M-44-BK', price: 549.99, stock: 10, attributeValues: [] },
      ],
    },
    {
      name: 'Sofá 3 Lugares Retrátil Veludo Cinza',
      slug: 'sofa-3-lugares-retratil-veludo-cinza',
      description: 'Sofá retrátil e reclinável de 3 lugares em veludo premium. Estrutura em madeira de eucalipto tratada, espuma D28 Soft e molas espirais.',
      shortDescription: 'Sofá retrátil 3 lugares veludo cinza',
      basePrice: 2499.00,
      salePrice: 1899.00,
      compareAtPrice: 2999.00,
      stock: 8,
      sku: 'SOFA-3L-RET-VEL-CZ',
      weight: 85,
      dimensions: { width: 220, height: 95, depth: 100 },
      tags: ['sofa', 'sala', 'retratil', 'veludo', 'moveis'],
      isFeatured: true,
      categoryId: categories[3].id,
      sellerId: seller.id,
      images: [
        { url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800', alt: 'Sofá 3 lugares cinza', isPrimary: true, sortOrder: 0 },
      ],
    },
    {
      name: 'Kit Skincare Completo - Limpeza, Tonico, Serum e Hidratante',
      slug: 'kit-skincare-completo',
      description: 'Rotina completa de cuidados com a pele: gel de limpeza suave, tônico equilibrante, sérum vitamina C e hidratante com ácido hialurônico. Para todos os tipos de pele.',
      shortDescription: 'Kit 4 passos para rotina completa de skincare',
      basePrice: 289.90,
      salePrice: 229.90,
      stock: 200,
      sku: 'SKIN-KIT-4PASSOS',
      weight: 0.5,
      tags: ['skincare', 'beleza', 'vitamina-c', 'acido-hialuronico', 'kit'],
      isFeatured: true,
      categoryId: categories[4].id,
      sellerId: seller.id,
      images: [
        { url: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=800', alt: 'Kit skincare completo', isPrimary: true, sortOrder: 0 },
      ],
    },
    {
      name: 'Smart TV 55" 4K QLED Samsung Q60C',
      slug: 'smart-tv-55-4k-qled-samsung-q60c',
      description: 'Smart TV 55 polegadas 4K QLED com Processador Quantum Lite, 100% Volume de Cor, Motion Xcelerator, Gaming Hub e Alexa built-in.',
      shortDescription: 'Smart TV 55" QLED 4K com Alexa',
      basePrice: 3299.00,
      salePrice: 2799.00,
      compareAtPrice: 3799.00,
      stock: 25,
      sku: 'SAM-TV55-Q60C',
      weight: 14.5,
      dimensions: { width: 122.6, height: 70.7, depth: 25.7 },
      tags: ['tv', 'samsung', 'qled', '4k', 'smart-tv', '55'],
      isFeatured: false,
      categoryId: categories[0].id,
      sellerId: seller.id,
      images: [
        { url: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800', alt: 'Samsung QLED 55"', isPrimary: true, sortOrder: 0 },
      ],
    },
  ]

  for (const productData of productsData) {
    const { images, variants, ...product } = productData

    const existingProduct = await prisma.product.findUnique({
      where: { sku_siteId: { sku: product.sku, siteId: primarySite.id } }
    })

    if (!existingProduct) {
      const createdProduct = await prisma.product.create({
        data: {
          ...product,
          status: ProductStatus.ACTIVE,
          publishedAt: new Date(),
          siteId: primarySite.id,
          images: {
            create: images,
          },
          variants: variants ? {
            create: variants.map(v => ({
              ...v,
              attributeValues: { create: v.attributeValues },
            })),
          } : undefined,
        },
      })
      console.log('✅ Produto criado:', createdProduct.name)
    }
  }

  // 6. Create Settings
  const settings = [
    { key: 'site_name', value: 'Marketplace', type: 'string', group: 'general', label: 'Nome do Site', isPublic: true },
    { key: 'site_description', value: 'Seu marketplace completo para comprar e vender', type: 'string', group: 'general', label: 'Descrição do Site', isPublic: true },
    { key: 'default_currency', value: 'BRL', type: 'string', group: 'general', label: 'Moeda Padrão', isPublic: true },
    { key: 'default_locale', value: 'pt-BR', type: 'string', group: 'general', label: 'Idioma Padrão', isPublic: true },
    { key: 'commission_rate_default', value: 10, type: 'number', group: 'seller', label: 'Comissão Padrão (%)', isPublic: false },
    { key: 'free_shipping_threshold', value: 199, type: 'number', group: 'shipping', label: 'Frete Grátis Acima de (R$)', isPublic: true },
    { key: 'max_images_per_product', value: 10, type: 'number', group: 'product', label: 'Máx. Imagens por Produto', isPublic: false },
    { key: 'order_auto_confirm_days', value: 7, type: 'number', group: 'order', label: 'Auto-confirmação de Entrega (dias)', isPublic: false },
    { key: 'return_window_days', value: 7, type: 'number', group: 'order', label: 'Prazo de Devolução (dias)', isPublic: true },
    { key: 'maintenance_mode', value: false, type: 'boolean', group: 'system', label: 'Modo Manutenção', isPublic: false },
  ]

  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { key_siteId: { key: setting.key, siteId: primarySite.id } },
      update: {},
      create: { ...setting, siteId: primarySite.id },
    })
  }
  console.log('✅ Configurações criadas:', settings.length)

  // 7. Create Coupons
  const coupons = [
    { code: 'BEMVINDO10', name: 'Boas-vindas 10%', type: 'percentage', value: 10, minAmount: 50, maxDiscount: 50, usageLimit: 1000, userLimit: 1, startsAt: new Date(), expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), isActive: true },
    { code: 'FRETEGRATIS', name: 'Frete Grátis', type: 'fixed', value: 0, minAmount: 199, usageLimit: 500, userLimit: 1, startsAt: new Date(), expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), isActive: true, applicableTo: 'shipping' },
    { code: 'BLACKFRIDAY20', name: 'Black Friday 20%', type: 'percentage', value: 20, minAmount: 100, maxDiscount: 200, usageLimit: 200, userLimit: 1, startsAt: new Date('2024-11-25'), expiresAt: new Date('2024-12-01'), isActive: false },
  ]

  for (const coupon of coupons) {
    await prisma.coupon.upsert({
      where: { code: coupon.code },
      update: {},
      create: coupon,
    })
  }
  console.log('✅ Cupons criados:', coupons.length)

  console.log('🎉 Seed concluído com sucesso!')
  console.log('')
  console.log('📋 Credenciais de teste:')
  console.log('   Admin:    admin@marketplace.com    / admin123')
  console.log('   Seller:   vendedor@marketplace.com / seller123')
  console.log('   Buyer:    cliente@marketplace.com  / buyer123')
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })