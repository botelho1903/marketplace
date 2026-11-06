'use client'

import Link from 'next/link'
import { Heart, ShoppingCart, Tag, Eye, Trash2, Grid, List } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Image from 'next/image'

const mockFavorites = [
  {
    id: '1',
    name: 'Smartphone Galaxy S24 Ultra 256GB',
    price: 5999.00,
    originalPrice: 6999.00,
    rating: 4.8,
    reviews: 124,
    image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400',
    seller: 'Loja do João',
    sellerSlug: 'loja-do-joao',
    discount: 14,
    freeShipping: true,
    inStock: true,
  },
  {
    id: '2',
    name: 'Notebook Dell XPS 13 Plus Intel i7',
    price: 7799.00,
    originalPrice: 8499.00,
    rating: 4.9,
    reviews: 56,
    image: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=400',
    seller: 'Tech Store',
    sellerSlug: 'tech-store',
    discount: 8,
    freeShipping: true,
    inStock: true,
  },
  {
    id: '3',
    name: 'Tênis Nike Air Max 270 Masculino',
    price: 549.99,
    originalPrice: 699.99,
    rating: 4.7,
    reviews: 234,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
    seller: 'Loja do João',
    sellerSlug: 'loja-do-joao',
    discount: 21,
    freeShipping: false,
    inStock: true,
  },
  {
    id: '4',
    name: 'Smart TV 55" 4K QLED Samsung Q60C',
    price: 2799.00,
    originalPrice: 3299.00,
    rating: 4.6,
    reviews: 89,
    image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400',
    seller: 'Eletrônicos BR',
    sellerSlug: 'eletronicos-br',
    discount: 15,
    freeShipping: true,
    inStock: false,
  },
]

export default function FavoritosPage() {
  return (
    <div className="section">
      <div className="container-main">
        <div className="flex items-center justify-between mb-8 animate-in">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-1">Meus Favoritos</h1>
            <p className="text-muted-foreground">{mockFavorites.length} produto{mockFavorites.length !== 1 ? 's' : ''} salvo{mockFavorites.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" aria-label="Visualização em grade">
              <Grid className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" aria-label="Visualização em lista">
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {mockFavorites.length === 0 ? (
          <div className="text-center py-16 animate-in">
            <Heart className="mx-auto h-16 w-16 text-muted-400 mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">Nenhum favorito ainda</h2>
            <p className="text-muted-foreground mb-6">Salve produtos que você gostou para encontrar facilmente depois</p>
            <Link href="/categorias">
              <Button size="lg">
                <ShoppingCart className="mr-2 h-4 w-4" />
                Explorar produtos
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in">
              {mockFavorites.map((product) => (
                <Card key={product.id} className="card-hover border-muted/50 overflow-hidden group relative">
                  {!product.inStock && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                      <Badge variant="destructive" className="text-lg px-4 py-2">Indisponível</Badge>
                    </div>
                  )}
                  <div className="relative aspect-product overflow-hidden bg-muted/30">
                    <Link href={`/produtos/${product.name.toLowerCase().replace(/\s+/g, '-')}`}>
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />
                    </Link>
                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                      {product.discount > 0 && (
                        <Badge className="bg-brand-500 text-white">-{product.discount}%</Badge>
                      )}
                      {product.freeShipping && (
                        <Badge variant="secondary" className="bg-teal-500 text-white">
                          <Truck className="mr-1 h-3 w-3" /> Frete Grátis
                        </Badge>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 bg-background/80 hover:bg-background text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Remover dos favoritos"
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                  <CardContent className="p-4">
                    <Link href={`/produtos/${product.name.toLowerCase().replace(/\s+/g, '-')}`} className="block">
                      <h3 className="font-medium text-foreground line-clamp-2 mb-2 group-hover:text-brand-600 transition-colors">
                        {product.name}
                      </h3>
                    </Link>
                    <Link href={`/lojas/${product.sellerSlug}`} className="text-sm text-muted-foreground hover:text-foreground mb-2 block">
                      {product.seller}
                    </Link>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-lg font-bold text-brand-600">R$ {product.price.toFixed(2)}</span>
                      {product.originalPrice > product.price && (
                        <span className="text-sm text-muted-foreground line-through">R$ {product.originalPrice.toFixed(2)}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>{product.rating}</span>
                        <span className="text-muted-foreground">({product.reviews})</span>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button className="flex-1" size="sm">
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Comprar
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Bulk Actions */}
            <div className="mt-6 p-4 bg-muted/50 rounded-lg animate-in">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="h-4 w-4 rounded border-muted-300 text-brand-500 focus:ring-brand-500" />
                  Selecionar todos
                </label>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Tag className="mr-2 h-4 w-4" />
                    Adicionar à lista
                  </Button>
                  <Button variant="outline" size="sm" className="text-destructive border-destructive/50 hover:bg-destructive/10">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Remover selecionados
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// Star icon component
function Star({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg className={className} {...props} viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}

// Truck icon component
function Truck({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg className={className} {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="1" y="3" width="15" height="13" />
      <polygon points="16 8 20 8 23 11 16 11" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  )
}