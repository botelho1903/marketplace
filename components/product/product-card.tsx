'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Heart, ShoppingCart, Star, MapPin, Truck } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Product, ProductImage, Category, User } from '@prisma/client'

interface ProductWithRelations extends Product {
  images?: ProductImage[]
  seller?: User & {
    sellerProfile?: {
      storeName: string
      storeSlug: string
    } | null
  }
  category?: Category
  _count?: {
    reviews: number
    favorites: number
  }
}

interface ProductCardProps {
  product: ProductWithRelations
  variant?: 'default' | 'compact' | 'featured'
  showSeller?: boolean
  onFavoriteClick?: (productId: string) => void
  onAddToCartClick?: (productId: string) => void
  isFavorite?: boolean
}

export function ProductCard({
  product,
  variant = 'default',
  showSeller = false,
  onFavoriteClick,
  onAddToCartClick,
  isFavorite = false,
}: ProductCardProps) {
  const primaryImage = product.images?.find((img) => img.isPrimary) || product.images?.[0]
  const hasDiscount = product.salePrice && product.salePrice < product.basePrice
  const discountPercent = hasDiscount
    ? Math.round(((Number(product.basePrice) - Number(product.salePrice!)) / Number(product.basePrice)) * 100)
    : 0

  const price = hasDiscount ? Number(product.salePrice!) : Number(product.basePrice)
  const originalPrice = hasDiscount ? Number(product.basePrice) : null

  if (variant === 'compact') {
    return (
      <Link
        href={`/produto/${product.slug}`}
        className="flex gap-3 p-2 rounded-lg bg-background hover:bg-accent/50 transition-colors group"
        aria-label={product.name}
      >
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-muted">
          {primaryImage ? (
            <Image
              src={primaryImage.url}
              alt={primaryImage.alt || product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="80px"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              <ShoppingCart className="h-6 w-6" />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1 flex flex-col justify-between">
          <div>
            <h3 className="font-medium text-sm text-foreground line-clamp-2 group-hover:text-brand-600 transition-colors">
              {product.name}
            </h3>
            <div className="mt-1 flex items-center gap-2">
              <span className="font-semibold text-brand-600">{formatCurrency(price)}</span>
              {originalPrice && (
                <span className="text-xs text-muted-foreground line-through">
                  {formatCurrency(originalPrice)}
                </span>
              )}
              {hasDiscount && (
                <Badge variant="destructive" className="text-xs px-1.5 py-0.5">
                  -{discountPercent}%
                </Badge>
              )}
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="w-full opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.preventDefault()
              onAddToCartClick?.(product.id)
            }}
          >
            Adicionar
          </Button>
        </div>
      </Link>
    )
  }

  if (variant === 'featured') {
    return (
      <Card className="relative h-full flex flex-col group">
        <div className="relative aspect-square overflow-hidden rounded-t-lg bg-muted">
          <Link href={`/produto/${product.slug}`} aria-label={product.name}>
            {primaryImage ? (
              <Image
                src={primaryImage.url}
                alt={primaryImage.alt || product.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                <ShoppingCart className="h-12 w-12" />
              </div>
            )}
          </Link>

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {hasDiscount && (
              <Badge variant="destructive" className="px-2 py-1">
                -{discountPercent}%
              </Badge>
            )}
            {product.isFeatured && (
              <Badge variant="brand" className="px-2 py-1">
                Destaque
              </Badge>
            )}
            {product.tags.includes('novo') && (
              <Badge variant="success" className="px-2 py-1">
                Novo
              </Badge>
            )}
          </div>

          {/* Favorite Button */}
          <button
            className={cn(
              'absolute top-2 right-2 p-1.5 rounded-full bg-background/90 backdrop-blur opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background',
              isFavorite && 'opacity-100 text-destructive'
            )}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onFavoriteClick?.(product.id)
            }}
            aria-label={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          >
            <Heart
              className={cn('h-4 w-4', isFavorite ? 'fill-current' : '')}
              aria-hidden="true"
            />
          </button>

          {/* Quick Add to Cart */}
          <Button
            size="sm"
            className="absolute bottom-2 left-1/2 -translate-x-1/2 translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-200"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onAddToCartClick?.(product.id)
            }}
          >
            <ShoppingCart className="mr-1.5 h-3.5 w-3.5" />
            Adicionar
          </Button>
        </div>

        <CardContent className="flex-1 flex flex-col p-4">
          {/* Category & Seller */}
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <span className="truncate max-w-[70%]">{product.category?.name || 'Categoria'}</span>
            {showSeller && product.seller && (
              <span className="truncate max-w-[30%] text-right">{product.seller.name}</span>
            )}
          </div>

          {/* Product Name */}
          <Link href={`/produto/${product.slug}`} className="group">
            <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-brand-600 transition-colors mb-2">
              {product.name}
            </h3>
          </Link>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center gap-0.5">
              <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" aria-hidden="true" />
              <span className="text-sm font-medium">4.5</span>
              <span className="text-xs text-muted-foreground">(128)</span>
            </div>
            {product.seller && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground ml-auto">
                <MapPin className="h-3 w-3" aria-hidden="true" />
                {product.seller.name}
              </span>
            )}
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-2 mt-auto">
            <span className="text-xl font-bold text-brand-600">{formatCurrency(price)}</span>
            {originalPrice && (
              <span className="text-sm text-muted-foreground line-through">{formatCurrency(originalPrice)}</span>
            )}
            {hasDiscount && (
              <Badge variant="destructive" className="text-xs ml-auto">
                {discountPercent}% OFF
              </Badge>
            )}
          </div>

          {/* Installments */}
          <p className="text-xs text-muted-foreground mt-1">
            ou 12x de {formatCurrency(price / 12)} sem juros
          </p>

          {/* Free Shipping */}
          {price >= 199 && (
            <div className="flex items-center gap-1 mt-2 text-xs text-green-600">
              <Truck className="h-3 w-3" aria-hidden="true" />
              Frete grátis
            </div>
          )}
        </CardContent>

        <CardFooter className="p-0 pt-4">
          <Button
            className="w-full"
            asChild
            onClick={(e) => {
              e.preventDefault()
              onAddToCartClick?.(product.id)
            }}
          >
            <Link href={`/produto/${product.slug}`} className="w-full flex items-center justify-center">
              <ShoppingCart className="mr-2 h-4 w-4" />
              Ver Produto
            </Link>
          </Button>
        </CardFooter>
      </Card>
    )
  }

  // Default variant
  return (
    <Card className="relative h-full flex flex-col group">
      <div className="relative aspect-square overflow-hidden rounded-t-lg bg-muted">
        <Link href={`/produto/${product.slug}`} aria-label={product.name}>
          {primaryImage ? (
            <Image
              src={primaryImage.url}
              alt={primaryImage.alt || product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              <ShoppingCart className="h-10 w-10" />
            </div>
          )}
        </Link>

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {hasDiscount && (
            <Badge variant="destructive" className="px-2 py-1">
              -{discountPercent}%
            </Badge>
          )}
          {product.isFeatured && (
            <Badge variant="brand" className="px-2 py-1">
              Destaque
            </Badge>
          )}
        </div>

        {/* Favorite Button */}
        <button
          className={cn(
            'absolute top-2 right-2 p-1.5 rounded-full bg-background/90 backdrop-blur opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background',
            isFavorite && 'opacity-100 text-destructive'
          )}
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onFavoriteClick?.(product.id)
          }}
          aria-label={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
        >
          <Heart
            className={cn('h-4 w-4', isFavorite ? 'fill-current' : '')}
            aria-hidden="true"
          />
        </button>
      </div>

      <CardContent className="flex-1 flex flex-col p-4">
        {/* Category */}
        <p className="text-xs text-muted-foreground mb-1 truncate">
          {product.category?.name || 'Categoria'}
        </p>

        {/* Product Name */}
        <Link href={`/produto/${product.slug}`} className="group mb-2">
          <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-brand-600 transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Rating & Seller */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" aria-hidden="true" />
            <span className="text-sm font-medium">4.5</span>
            <span className="text-xs text-muted-foreground">(128)</span>
          </div>
          {showSeller && product.seller && (
            <span className="text-xs text-muted-foreground truncate max-w-[50%] text-right">
              {product.seller.name}
            </span>
          )}
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-2 mt-auto">
          <span className="text-lg font-bold text-brand-600">{formatCurrency(price)}</span>
          {originalPrice && (
            <span className="text-sm text-muted-foreground line-through">{formatCurrency(originalPrice)}</span>
          )}
        </div>

        {/* Installments */}
        <p className="text-xs text-muted-foreground mt-1">
          ou 12x de {formatCurrency(price / 12)} sem juros
        </p>
      </CardContent>

      <CardFooter className="p-0 px-4 pb-4">
        <Button className="w-full" asChild>
          <Link href={`/produto/${product.slug}`} className="w-full flex items-center justify-center">
            <ShoppingCart className="mr-2 h-4 w-4" />
            Comprar
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}