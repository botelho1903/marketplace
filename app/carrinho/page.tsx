'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Trash2, Plus, Minus, ShoppingCart, ArrowLeft, Gift, Truck, CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import Image from 'next/image'

const mockCartItems = [
  {
    id: 1,
    productId: '1',
    name: 'Smartphone Galaxy S24 Ultra 256GB',
    sku: 'SAM-S24U-256-BK',
    price: 5999.00,
    originalPrice: 6999.00,
    image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400',
    quantity: 1,
    stock: 50,
    seller: 'Loja do João',
    sellerSlug: 'loja-do-joao',
    variant: null,
  },
  {
    id: 2,
    productId: '3',
    name: 'Tênis Nike Air Max 270 Masculino',
    sku: 'NIKE-AM270-M-42-BK',
    price: 549.99,
    originalPrice: 699.99,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
    quantity: 2,
    stock: 20,
    seller: 'Loja do João',
    sellerSlug: 'loja-do-joao',
    variant: 'Tamanho 42',
  },
]

export default function CarrinhoPage() {
  const [items, setItems] = useState(mockCartItems)
  const [coupon, setCoupon] = useState('')
  const [shipping, setShipping] = useState(0)

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity < 1) return
    setItems(prev => prev.map(item => item.id === id ? { ...item, quantity } : item))
  }

  const removeItem = (id: number) => {
    setItems(prev => prev.filter(item => item.id !== id))
  }

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const discount = items.reduce((sum, item) => sum + (item.originalPrice - item.price) * item.quantity, 0)
  const total = subtotal + shipping

  if (items.length === 0) {
    return (
      <div className="section flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-muted/50">
            <ShoppingCart className="h-12 w-12 text-muted-400" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Seu carrinho está vazio</h1>
          <p className="text-muted-foreground mb-6">Adicione produtos incríveis ao seu carrinho</p>
          <Link href="/categorias">
            <Button size="lg" className="w-full sm:w-auto">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Continuar comprando
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="section">
      <div className="container-main">
        <div className="mb-8 animate-in">
          <h1 className="text-3xl font-bold text-foreground mb-2">Carrinho ({items.length})</h1>
          <p className="text-muted-foreground">Revise seus itens antes de finalizar a compra</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 animate-in stagger-1">
            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {items.map((item) => (
                    <div key={item.id} className="p-4 md:p-6 flex flex-col md:flex-row gap-4">
                      <Link href={`/produtos/${item.sku.toLowerCase()}`} className="relative h-24 w-24 md:h-32 md:w-32 flex-shrink-0 overflow-hidden rounded-lg bg-muted/50">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="128px"
                        />
                      </Link>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <Link href={`/produtos/${item.sku.toLowerCase()}`} className="font-medium text-foreground line-clamp-1 hover:text-brand-600 transition-colors">
                              {item.name}
                            </Link>
                            <Link href={`/lojas/${item.sellerSlug}`} className="text-sm text-muted-foreground hover:text-foreground">
                              Vendido por {item.seller}
                            </Link>
                            {item.variant && (
                              <span className="text-xs text-muted-foreground">{item.variant}</span>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeItem(item.id)}
                            className="text-muted-400 hover:text-destructive"
                            aria-label="Remover item"
                          >
                            <Trash2 className="h-5 w-5" />
                          </Button>
                        </div>
                        <div className="mt-3 flex flex-wrap items-center gap-4">
                          <div className="flex items-center border rounded-lg overflow-hidden">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-9 w-9"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                              aria-label="Diminuir quantidade"
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <Input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                              className="w-16 text-center border-x-0 rounded-none bg-transparent focus:ring-0"
                              min={1}
                              max={item.stock}
                              aria-label="Quantidade"
                            />
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-9 w-9"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              disabled={item.quantity >= item.stock}
                              aria-label="Aumentar quantidade"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          <span className="text-sm text-muted-foreground">Estoque: {item.stock}</span>
                        </div>
                      </div>
                      <div className="flex items-center md:items-end md:justify-between w-full md:w-auto">
                        <div className="text-right">
                          <div className="text-lg font-bold text-foreground">R$ {item.price.toFixed(2)}</div>
                          {item.originalPrice > item.price && (
                            <div className="text-sm text-muted-foreground line-through">R$ {item.originalPrice.toFixed(2)}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Coupon */}
            <Card className="mt-6">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <label className="text-sm font-medium mb-2 block">Cupom de desconto</label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Digite seu cupom"
                        value={coupon}
                        onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                        className="flex-1"
                      />
                      <Button variant="outline">Aplicar</Button>
                    </div>
                  </div>
                  <Button variant="ghost" className="self-end">
                    <Gift className="mr-2 h-4 w-4" />
                    Usar vale-presente
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Summary */}
          <div className="animate-in stagger-2">
            <Card className="sticky top-24">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Resumo do pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal ({items.length} itens)</span>
                    <span className="font-medium">R$ {subtotal.toFixed(2)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-success">
                      <span>Desconto</span>
                      <span className="font-medium">-R$ {discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Frete</span>
                    <span className="font-medium">{shipping === 0 ? 'Grátis' : `R$ ${shipping.toFixed(2)}`}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>R$ {total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Truck className="h-4 w-4" />
                    <span>Frete grátis acima de R$ 199,00</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CreditCard className="h-4 w-4" />
                    <span>Parcele em até 12x sem juros</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Gift className="h-4 w-4" />
                    <span>Acumule pontos no programa de fidelidade</span>
                  </div>
                </div>

                <Link href="/checkout">
                  <Button className="w-full" size="lg">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Finalizar compra
                  </Button>
                </Link>

                <Button variant="outline" className="w-full" onClick={() => window.history.back()}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Continuar comprando
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  Ao finalizar a compra, você concorda com nossos{' '}
                  <Link href="/termos" className="underline">Termos de Uso</Link>
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}