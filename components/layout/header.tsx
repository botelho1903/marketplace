'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Search, ShoppingCart, User, Heart, Store, Bell } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel } from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Início', href: '/' },
  { name: 'Categorias', href: '/categorias' },
  { name: 'Ofertas', href: '/ofertas' },
  { name: 'Lojas', href: '/lojas' },
]

export function Header() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Top Bar */}
      <div className="hidden md:flex h-10 items-center justify-between border-b px-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <span>Entrega para todo o Brasil</span>
          <span>•</span>
          <span>Frete grátis acima de R$ 199</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/ajuda" className="hover:text-foreground transition-colors">Ajuda</Link>
          <Link href="/vender" className="hover:text-foreground transition-colors">Vender</Link>
          <Link href="/app" className="hover:text-foreground transition-colors">Baixar App</Link>
        </div>
      </div>

      {/* Main Header */}
      <div className="flex h-16 md:h-14 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0" aria-label="Marketplace Home">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500">
            <Store className="h-5 w-5 text-white" />
          </div>
          <span className="hidden font-bold text-xl text-foreground md:block">
            Marketplace
          </span>
        </Link>

        {/* Search Bar */}
        <div className="hidden md:flex md:flex-1 max-w-2xl mx-6">
          <form className="relative w-full" role="search">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <input
              type="search"
              placeholder="O que você procura hoje?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-full border bg-background/50 text-sm placeholder:text-muted-foreground focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              aria-label="Buscar produtos"
            />
          </form>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 md:gap-2">
          {/* Mobile Search */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-accent"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-1">
            <Link href="/favoritos" className="relative p-2 rounded-lg hover:bg-accent transition-colors" aria-label="Favoritos">
              <Heart className="h-5 w-5" />
            </Link>

            <Link href="/notificacoes" className="relative p-2 rounded-lg hover:bg-accent transition-colors" aria-label="Notificações">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white">3</span>
            </Link>

            <Link href="/carrinho" className="relative p-2 rounded-lg hover:bg-accent transition-colors" aria-label="Carrinho">
              <ShoppingCart className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-500 text-[10px] font-bold text-white">5</span>
            </Link>
          </div>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
                <Avatar fallback="U" className="h-10 w-10" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">Usuário Demo</p>
                  <p className="text-xs leading-none text-muted-foreground">usuario@email.com</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/conta" className="flex w-full items-center justify-start">
                  <User className="mr-2 h-4 w-4" />
                  Minha Conta
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/meus-pedidos" className="flex w-full items-center justify-start">
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Meus Pedidos
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/favoritos" className="flex w-full items-center justify-start">
                  <Heart className="mr-2 h-4 w-4" />
                  Favoritos
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/vender" className="flex w-full items-center justify-start">
                  <Store className="mr-2 h-4 w-4" />
                  Seja Vendedor
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => {}}>
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Mobile Search & Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t px-4 py-4 space-y-4 animate-slide-down">
          <form className="relative" role="search">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <input
              type="search"
              placeholder="O que você procura hoje?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-full border bg-background text-sm"
              aria-label="Buscar produtos"
            />
          </form>
          <nav className="flex flex-col space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  pathname === item.href
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      )}

      {/* Desktop Navigation */}
      <nav className="hidden md:flex md:justify-center md:px-4 md:py-2 border-t bg-muted/30">
        <ol className="flex items-center gap-6" aria-label="Navegação principal">
          {navigation.map((item) => (
            <li key={item.name}>
              <Link
                href={item.href}
                className={cn(
                  'px-2 py-1.5 text-sm font-medium transition-colors',
                  pathname === item.href
                    ? 'text-brand-600'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {item.name}
              </Link>
            </li>
          ))}
        </ol>
      </nav>
    </header>
  )
}