import { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight, Package, Zap, Shirt, Home, Sparkles, Dumbbell, Baby } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const metadata: Metadata = {
  title: 'Categorias',
  description: 'Explore todas as categorias de produtos disponíveis no Marketplace.',
}

const categories = [
  { name: 'Eletrônicos', slug: 'eletronicos', icon: Zap, count: '2.450', subcategories: ['Smartphones', 'Notebooks', 'Tablets', 'Áudio', 'Gaming', 'Acessórios'] },
  { name: 'Moda Feminina', slug: 'moda-feminina', icon: Shirt, count: '3.200', subcategories: ['Roupas', 'Calçados', 'Bolsas', 'Acessórios', 'Joias', 'Praia'] },
  { name: 'Moda Masculina', slug: 'moda-masculina', icon: Shirt, count: '2.100', subcategories: ['Roupas', 'Calçados', 'Relógios', 'Acessórios', 'Perfumes', 'Barbearia'] },
  { name: 'Casa & Decoração', slug: 'casa-decoracao', icon: Home, count: '4.500', subcategories: ['Móveis', 'Decoração', 'Cama & Banho', 'Cozinha', 'Organização', 'Jardim'] },
  { name: 'Beleza & Perfumaria', slug: 'beleza-perfumaria', icon: Sparkles, count: '2.800', subcategories: ['Maquiagem', 'Skincare', 'Cabelos', 'Perfumes', 'Unhas', 'Corpo'] },
  { name: 'Esportes & Lazer', slug: 'esportes-lazer', icon: Dumbbell, count: '1.900', subcategories: ['Fitness', 'Corrida', 'Ciclismo', 'Natação', 'Outdoor', 'Jogos'] },
  { name: 'Brinquedos & Bebê', slug: 'brinquedos-bebe', icon: Baby, count: '2.300', subcategories: ['Brinquedos', 'Primeira Infância', 'Escolar', 'Jogos', 'Colecionáveis', 'Festas'] },
  { name: 'Automotivo', slug: 'automotivo', icon: Package, count: '1.200', subcategories: ['Peças', 'Acessórios', 'Ferramentas', 'Som', 'Iluminação', 'Cuidados'] },
]

export default function CategoriasPage() {
  return (
    <div className="section">
      <div className="container-main">
        {/* Header */}
        <div className="mb-10 animate-in">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">Todas as Categorias</h1>
          <p className="text-muted-foreground">Encontre produtos em mais de {categories.length} categorias diferentes</p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categories.map((category, index) => {
            const Icon = category.icon
            return (
              <Link
                key={category.slug}
                href={`/categorias/${category.slug}`}
                className="group card-hover p-6 bg-background border border-muted/50 rounded-xl animate-in stagger-1"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-brand-50 text-brand-600 group-hover:bg-brand-100 group-hover:text-brand-700 transition-colors">
                    <Icon className="h-7 w-7" />
                  </div>
                  <Badge variant="secondary" className="text-xs self-start">
                    {category.count}+
                  </Badge>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-3 group-hover:text-brand-600 transition-colors">
                  {category.name}
                </h3>
                <ul className="space-y-1.5 text-sm text-muted-foreground">
                  {category.subcategories.slice(0, 4).map((sub, i) => (
                    <li key={sub} className="flex items-center gap-2 group-hover:text-foreground/80 transition-colors">
                      <ChevronRight className="h-3.5 w-3.5 text-muted-400" />
                      {sub}
                    </li>
                  ))}
                  {category.subcategories.length > 4 && (
                    <li className="text-brand-600 font-medium flex items-center gap-1">
                      +{category.subcategories.length - 4} mais
                    </li>
                  )}
                </ul>
              </Link>
            )
          })}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center animate-in">
          <p className="text-muted-foreground mb-4">Não encontrou o que procura?</p>
          <Link href="/busca" className="inline-flex items-center gap-2 text-brand-600 hover:text-brand-700 font-medium">
            Buscar produtos <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}