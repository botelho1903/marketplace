import { Metadata } from 'next'
import { Search, Filter, Grid, List, ChevronLeft, ChevronRight, Star, Truck, RotateCcw, Tag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Busca',
  description: 'Busque produtos no Marketplace. Encontre as melhores ofertas.',
}

const sortOptions = [
  { value: 'relevance', label: 'Mais relevantes' },
  { value: 'price_asc', label: 'Menor preço' },
  { value: 'price_desc', label: 'Maior preço' },
  { value: 'newest', label: 'Mais recentes' },
  { value: 'rating', label: 'Melhor avaliados' },
  { value: 'sales', label: 'Mais vendidos' },
]

const mockProducts = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  name: `Produto Exemplo ${i + 1}`,
  price: (Math.random() * 500 + 50).toFixed(2),
  originalPrice: (Math.random() * 600 + 100).toFixed(2),
  rating: (Math.random() * 2 + 3).toFixed(1),
  reviews: Math.floor(Math.random() * 500) + 10,
  image: `https://images.unsplash.com/photo-${1500000000000 + i * 1000000}?w=400&h=400&fit=crop`,
  discount: Math.floor(Math.random() * 30) + 5,
  freeShipping: Math.random() > 0.5,
}))

export default function BuscaPage({ searchParams }: { searchParams: Promise<{ q?: string; page?: string; sort?: string }> }) {
  return (
    <div className="section">
      <div className="container-main">
        {/* Search Header */}
        <div className="mb-8 animate-in">
          <h1 className="text-3xl font-bold text-foreground mb-2">Resultados da Busca</h1>
          <p className="text-muted-foreground">
            Encontramos <span className="font-semibold text-foreground">2.450</span> produtos
          </p>
        </div>

        {/* Filters & Sort */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6 pb-4 border-b animate-in">
          <div className="flex-1 max-w-md">
            <Select defaultValue="relevance">
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="lg:hidden">
              <Filter className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" aria-label="Visualização em grade">
              <Grid className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" aria-label="Visualização em lista">
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {mockProducts.map((product) => (
            <Link key={product.id} href={`/produtos/produto-exemplo-${product.id}`} className="group">
              <Card className="card-hover h-full border-muted/50 overflow-hidden">
                <div className="relative aspect-product overflow-hidden bg-muted/30">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  {product.discount > 0 && (
                    <Badge className="absolute top-2 left-2 bg-brand-500 text-white">
                      -{product.discount}%
                    </Badge>
                  )}
                  {product.freeShipping && (
                    <Badge className="absolute top-2 right-2 bg-teal-500 text-white">
                      <Truck className="h-3 w-3 mr-1" /> Frete Grátis
                    </Badge>
                  )}
                </div>
                <CardContent className="p-4">
                  <h3 className="font-medium text-foreground line-clamp-2 mb-2 group-hover:text-brand-600 transition-colors">
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{product.rating}</span>
                    <span className="text-sm text-muted-foreground">({product.reviews})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-brand-600">R$ {product.price}</span>
                    <span className="text-sm text-muted-foreground line-through">R$ {product.originalPrice}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Pagination */}
        <nav className="mt-10 flex items-center justify-center gap-2 animate-in" aria-label="Paginação">
          <Button variant="outline" size="icon" disabled aria-label="Página anterior">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="default" size="icon" className="w-10" aria-current="page">1</Button>
          <Button variant="outline" size="icon" className="w-10">2</Button>
          <Button variant="outline" size="icon" className="w-10">3</Button>
          <span className="px-2 text-muted-foreground">...</span>
          <Button variant="outline" size="icon" className="w-10">10</Button>
          <Button variant="outline" size="icon" aria-label="Próxima página">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </nav>
      </div>
    </div>
  )
}