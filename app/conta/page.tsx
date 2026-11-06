'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { User, Package, Heart, CreditCard, Truck, Settings, LogOut, Bell, Store, ArrowLeft, Menu, X, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Avatar } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet'

const navItems = [
  { id: 'perfil', label: 'Perfil', icon: User, href: '/conta' },
  { id: 'pedidos', label: 'Meus Pedidos', icon: Package, href: '/meus-pedidos' },
  { id: 'enderecos', label: 'Endereços', icon: MapPin, href: '/conta/enderecos' },
  { id: 'pagamentos', label: 'Pagamentos', icon: CreditCard, href: '/conta/pagamentos' },
  { id: 'favoritos', label: 'Favoritos', icon: Heart, href: '/favoritos' },
  { id: 'configuracoes', label: 'Configurações', icon: Settings, href: '/conta/configuracoes' },
]

export default function ContaPage() {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState('perfil')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const user = session?.user as any

  return (
    <div className="section safe-top safe-bottom pb-20">
      <div className="container-main">
        {/* Mobile Header with Menu Button */}
        <div className="lg:hidden mb-6 animate-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-10 w-10 min-h-[44px] min-w-[44px]">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 p-0">
                  <SidebarContent user={user} activeTab={activeTab} setActiveTab={setActiveTab} setSidebarOpen={setSidebarOpen} />
                </SheetContent>
              </Sheet>
              <div>
                <h1 className="text-xl font-bold text-foreground">Minha Conta</h1>
                <p className="text-xs text-muted-foreground">Gerencie suas informações</p>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden lg:block mb-8 animate-in">
          <h1 className="text-3xl font-bold text-foreground mb-2">Minha Conta</h1>
          <p className="text-muted-foreground">Gerencie suas informações e preferências</p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar - Desktop */}
          <aside className="hidden lg:block animate-in">
            <Card className="sticky top-24">
              <CardContent className="p-4">
                <div className="flex items-center gap-4 mb-6 pb-6 border-b">
                  <Avatar className="h-16 w-16" fallback={user?.name?.[0] || 'U'} />
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground truncate">{user?.name || 'Usuário'}</p>
                    <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
                    {user?.role === 'SELLER' && (
                      <Badge variant="secondary" className="mt-2 inline-flex items-center gap-1">
                        <Store className="h-3 w-3" /> Vendedor
                      </Badge>
                    )}
                    {user?.role === 'ADMIN' && (
                      <Badge variant="destructive" className="mt-2 inline-flex items-center gap-1">
                        Admin
                      </Badge>
                    )}
                  </div>
                </div>

                <nav className="space-y-1" aria-label="Navegação da conta">
                  {navItems.map((item) => {
                    const Icon = item.icon
                    const isActive = activeTab === item.id
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={cn(
                          'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left',
                          isActive
                            ? 'bg-brand-50 text-brand-700'
                            : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                        )}
                      >
                        <Icon className="h-5 w-5" aria-hidden="true" />
                        {item.label}
                      </button>
                    )
                  })}
                </nav>

                <div className="mt-6 pt-6 border-t">
                  <Button variant="ghost" className="w-full justify-start text-destructive hover:bg-destructive/10" onClick={() => {}}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sair
                  </Button>
                </div>
              </CardContent>
            </Card>
          </aside>

          {/* Content */}
          <main className="lg:col-span-3 animate-in stagger-1">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-xl capitalize">{activeTab}</CardTitle>
              </CardHeader>
              <CardContent>
                {activeTab === 'perfil' && <PerfilContent user={user} />}
                {activeTab === 'enderecos' && <EnderecosContent />}
                {activeTab === 'pagamentos' && <PagamentosContent />}
                {activeTab === 'configuracoes' && <ConfiguracoesContent />}
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </div>
  )
}

// Mobile Sidebar Content
function SidebarContent({ user, activeTab, setActiveTab, setSidebarOpen }: { user: any; activeTab: string; setActiveTab: (id: string) => void; setSidebarOpen: (open: boolean) => void }) {
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b flex items-center justify-between">
        <h2 className="font-semibold">Minha Conta</h2>
        <SheetClose asChild>
          <Button variant="ghost" size="icon" className="h-10 w-10"><X className="h-5 w-5" /></Button>
        </SheetClose>
      </div>
      <div className="p-4 border-b">
        <div className="flex items-center gap-4 mb-4">
          <Avatar className="h-14 w-14" fallback={user?.name?.[0] || 'U'} />
          <div className="min-w-0">
            <p className="font-semibold text-foreground truncate">{user?.name || 'Usuário'}</p>
            <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
            {user?.role === 'SELLER' && (
              <Badge variant="secondary" className="mt-2 inline-flex items-center gap-1">
                <Store className="h-3 w-3" /> Vendedor
              </Badge>
            )}
            {user?.role === 'ADMIN' && (
              <Badge variant="destructive" className="mt-2 inline-flex items-center gap-1">
                Admin
              </Badge>
            )}
          </div>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto p-4 space-y-1" aria-label="Navegação da conta">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id
          return (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors text-left min-h-[44px]',
                isActive
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              )}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              {item.label}
            </button>
          )
        })}
      </nav>
      <div className="p-4 border-t">
        <SheetClose asChild>
          <Button variant="ghost" className="w-full justify-start text-destructive hover:bg-destructive/10 min-h-[44px]">
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
        </SheetClose>
      </div>
    </div>
  )
}

function PerfilContent({ user }: { user: any }) {
  return (
    <form className="space-y-6 max-w-xl">
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="name">Nome completo</Label>
          <Input id="name" defaultValue={user?.name} className="min-h-[44px]" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="phone">Telefone</Label>
          <Input id="phone" defaultValue={user?.phone || ''} className="min-h-[44px]" placeholder="(11) 99999-9999" />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="email">E-mail</Label>
        <Input id="email" type="email" defaultValue={user?.email} disabled className="min-h-[44px] bg-muted" />
        <p className="text-xs text-muted-foreground">Para alterar o e-mail, acesse Configurações</p>
      </div>
      <div className="pt-4 border-t">
        <Button type="submit" className="w-full sm:w-auto min-h-[44px]">Salvar alterações</Button>
      </div>
    </form>
  )
}

function EnderecosContent() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Endereços salvos</h3>
        <Button size="sm" className="min-h-[44px]"><MapPin className="mr-2 h-4 w-4" />Adicionar endereço</Button>
      </div>
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <Card key={i} className="border-muted/50">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium">Casa</span>
                    <Badge variant="secondary">Principal</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">Rua das Flores, 123 - Apto 45</p>
                  <p className="text-sm text-muted-foreground">Centro - São Paulo/SP</p>
                  <p className="text-sm text-muted-foreground">01000-000</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Button variant="outline" size="sm" className="min-h-[44px]">Editar</Button>
                  <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive min-h-[44px]">Excluir</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function PagamentosContent() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Métodos de pagamento</h3>
        <Button size="sm" className="min-h-[44px]"><CreditCard className="mr-2 h-4 w-4" />Adicionar cartão</Button>
      </div>
      <div className="space-y-3">
        {['Visa •••• 1234', 'Mastercard •••• 5678'].map((card, i) => (
          <Card key={i} className="border-muted/50">
            <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-16 rounded bg-gradient-to-r from-blue-600 to-blue-800 flex items-center justify-center text-white font-bold">VISA</div>
                <div>
                  <p className="font-medium">{card}</p>
                  <p className="text-xs text-muted-foreground">Expira 12/27</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive min-h-[44px]">Remover</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function ConfiguracoesContent() {
  return (
    <div className="space-y-6 max-w-xl">
      <section>
        <h3 className="font-medium mb-4">Notificações</h3>
        <div className="space-y-3">
          {[
            { label: 'Novos pedidos', desc: 'Receba alertas quando houver novos pedidos' },
            { label: 'Atualizações de envio', desc: 'Acompanhe o status de entrega dos seus pedidos' },
            { label: 'Promoções e ofertas', desc: 'Receba cupons e ofertas exclusivas por e-mail' },
            { label: 'Newsletter semanal', desc: 'Resumo das melhores ofertas da semana' },
          ].map((item, i) => (
            <label key={i} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 cursor-pointer p-3 bg-muted/50 rounded-lg">
              <div>
                <p className="font-medium">{item.label}</p>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
              <input type="checkbox" defaultChecked className="h-5 w-5 rounded border-muted-300 text-brand-500 focus:ring-brand-500 shrink-0" />
            </label>
          ))}
        </div>
      </section>
      <section className="pt-6 border-t">
        <h3 className="font-medium mb-4">Privacidade</h3>
        <div className="space-y-3">
          <Button variant="outline" className="w-full justify-start min-h-[44px]">Baixar meus dados</Button>
          <Button variant="outline" className="w-full justify-start text-destructive hover:text-destructive border-destructive/50 min-h-[44px]">Excluir conta</Button>
        </div>
      </section>
    </div>
  )
}