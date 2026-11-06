'use client'

import { ReactNode, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import { MainLayout } from '@/components/layout/main-layout'
import { Loader2, Shield, Users, Package, Truck, Settings } from 'lucide-react'
import Link from 'next/link'

const adminNavigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: Shield },
  { name: 'Usuários', href: '/admin/usuarios', icon: Users },
  { name: 'Produtos', href: '/admin/produtos', icon: Package },
  { name: 'Pedidos', href: '/admin/pedidos', icon: Truck },
  { name: 'Configurações', href: '/admin/configuracoes', icon: Settings },
]

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && status === 'unauthenticated') {
      router.push(`/login?callbackUrl=${encodeURIComponent(pathname)}`)
    } else if (mounted && status === 'authenticated') {
      const userRole = (session?.user as any)?.role
      if (userRole !== 'ADMIN') {
        router.push('/')
      }
    }
  }, [mounted, status, router, pathname, session])

  if (!mounted || status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-500" aria-hidden="true" />
        <span className="sr-only">Carregando...</span>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return null
  }

  const userRole = (session?.user as any)?.role
  if (userRole !== 'ADMIN') {
    return (
      <MainLayout>
        <div className="container-main section">
          <div className="text-center py-16">
            <Shield className="mx-auto h-16 w-16 text-muted-400 mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">Acesso Restrito</h1>
            <p className="text-muted-foreground">Você não tem permissão para acessar o painel administrativo.</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="flex">
        {/* Admin Sidebar */}
        <aside className="hidden lg:block w-64 border-r bg-muted/30 min-h-[calc(100vh-4rem)] sticky top-16">
          <div className="p-4 border-b">
            <h2 className="font-bold text-foreground flex items-center gap-2">
              <Shield className="h-5 w-5 text-brand-500" />
              Admin
            </h2>
          </div>
          <nav className="p-4 space-y-1" aria-label="Navegação administrativa">
            {adminNavigation.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-brand-50 text-brand-700'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  }`}
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1" id="main-content">
          {children}
        </main>
      </div>
    </MainLayout>
  )
}