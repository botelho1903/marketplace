'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Users, User, Package, ShoppingCart, DollarSign, TrendingUp, Shield, AlertTriangle, CheckCircle2, Settings, Plus, Eye, Edit, Trash2, MoreHorizontal, Activity, BarChart2, Truck, XCircle, Search, Filter, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'

const stats = [
  { label: 'Usuários Totais', value: '12.450', change: '+234', changeType: 'positive', icon: Users },
  { label: 'Produtos Ativos', value: '8.230', change: '+156', changeType: 'positive', icon: Package },
  { label: 'Pedidos Hoje', value: '342', change: '+12%', changeType: 'positive', icon: ShoppingCart },
  { label: 'Receita Mês', value: 'R$ 1.2M', change: '+8.5%', changeType: 'positive', icon: DollarSign },
]

const recentUsers = [
  { id: '1', name: 'João Silva', email: 'joao@email.com', role: 'USER', status: 'ACTIVE', createdAt: '2024-01-24', orders: 5, totalSpent: 1250.00 },
  { id: '2', name: 'Maria Santos', email: 'maria@email.com', role: 'SELLER', status: 'PENDING_VERIFICATION', createdAt: '2024-01-24', orders: 0, totalSpent: 0 },
  { id: '3', name: 'Pedro Costa', email: 'pedro@email.com', role: 'USER', status: 'ACTIVE', createdAt: '2024-01-23', orders: 12, totalSpent: 3450.00 },
  { id: '4', name: 'Ana Oliveira', email: 'ana@email.com', role: 'USER', status: 'SUSPENDED', createdAt: '2024-01-23', orders: 3, totalSpent: 890.00 },
  { id: '5', name: 'Carlos Ferreira', email: 'carlos@email.com', role: 'SELLER', status: 'ACTIVE', createdAt: '2024-01-22', orders: 45, totalSpent: 12500.00 },
]

const recentOrders = [
  { id: 'MP-2024-001239', buyer: 'Lucas Lima', seller: 'Loja do João', total: 2799.00, status: 'PAID', date: '2024-01-24', items: 1 },
  { id: 'MP-2024-001240', buyer: 'Fernanda Alves', seller: 'Tech Store', total: 7799.00, status: 'PROCESSING', date: '2024-01-24', items: 1 },
  { id: 'MP-2024-001241', buyer: 'Ricardo Souza', seller: 'Loja do João', total: 549.99, status: 'PENDING_PAYMENT', date: '2024-01-24', items: 1 },
  { id: 'MP-2024-001242', buyer: 'Juliana Rocha', seller: 'Eletrônicos BR', total: 229.90, status: 'SHIPPED', date: '2024-01-23', items: 2 },
  { id: 'MP-2024-001243', buyer: 'Marcos Pinto', seller: 'Moda Feminina', total: 1899.00, status: 'DELIVERED', date: '2024-01-23', items: 1 },
]

const pendingSellers = [
  { id: '6', storeName: 'Nova Loja', owner: 'Roberto Silva', email: 'roberto@email.com', cnpj: '12.345.678/0001-90', createdAt: '2024-01-24' },
  { id: '7', storeName: 'Artigos Esportivos', owner: 'Amanda Santos', email: 'amanda@email.com', cnpj: '98.765.432/0001-10', createdAt: '2024-01-23' },
]

const statusConfig = {
  ACTIVE: { label: 'Ativo', color: 'bg-success/10 text-success', icon: CheckCircle2 },
  INACTIVE: { label: 'Inativo', color: 'bg-muted text-muted-foreground', icon: User },
  SUSPENDED: { label: 'Suspenso', color: 'bg-destructive/10 text-destructive', icon: AlertTriangle },
  PENDING_VERIFICATION: { label: 'Pendente', color: 'bg-warning/10 text-warning', icon: AlertTriangle },
  PENDING_PAYMENT: { label: 'Aguardando', color: 'bg-warning/10 text-warning', icon: AlertTriangle },
  PAID: { label: 'Pago', color: 'bg-info/10 text-info', icon: CheckCircle2 },
  PROCESSING: { label: 'Processando', color: 'bg-brand-100 text-brand-700', icon: Activity },
  SHIPPED: { label: 'Enviado', color: 'bg-blue-100 text-blue-700', icon: Truck },
  DELIVERED: { label: 'Entregue', color: 'bg-success/10 text-success', icon: CheckCircle2 },
  CANCELLED: { label: 'Cancelado', color: 'bg-destructive/10 text-destructive', icon: XCircle },
}

const roleBadges = {
  USER: { label: 'Comprador', color: 'bg-blue-100 text-blue-700' },
  SELLER: { label: 'Vendedor', color: 'bg-green-100 text-green-700' },
  ADMIN: { label: 'Admin', color: 'bg-red-100 text-red-700' },
}

// Mobile Card components for tables
function UserCard({ user }: { user: typeof recentUsers[0] }) {
  const config = statusConfig[user.status as keyof typeof statusConfig]
  const Icon = config?.icon || User
  const roleConfig = roleBadges[user.role as keyof typeof roleBadges]
  return (
    <div key={user.id} className="p-4 border-b border-muted/50 last:border-0 bg-card">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{user.name}</p>
          <p className="text-sm text-muted-foreground truncate">{user.email}</p>
        </div>
        <Badge className={cn('shrink-0', roleConfig?.color)}>{roleConfig?.label}</Badge>
      </div>
      <div className="grid grid-cols-3 gap-3 text-sm mb-3">
        <div className="flex items-center gap-1.5">
          <Icon className="h-3 w-3 text-muted-foreground" />
          <Badge variant="outline" className={cn('gap-1 text-xs', config?.color)}>
            <Icon className="h-2.5 w-2.5" />
            {config?.label}
          </Badge>
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <span>📅</span>
          <span>{new Date(user.createdAt).toLocaleDateString('pt-BR')}</span>
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <span>📦</span>
          <span>{user.orders} pedidos</span>
        </div>
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-muted/50">
        <p className="font-medium text-foreground">R$ {user.totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-10 w-10 min-h-[44px] min-w-[44px]"><Eye className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" className="h-10 w-10 min-h-[44px] min-w-[44px]"><Edit className="h-4 w-4" /></Button>
          {user.status !== 'SUSPENDED' ? (
            <Button variant="ghost" size="icon" className="h-10 w-10 min-h-[44px] min-w-[44px] text-destructive hover:text-destructive"><AlertTriangle className="h-4 w-4" /></Button>
          ) : (
            <Button variant="ghost" size="icon" className="h-10 w-10 min-h-[44px] min-w-[44px] text-success hover:text-success"><CheckCircle2 className="h-4 w-4" /></Button>
          )}
        </div>
      </div>
    </div>
  )
}

function OrderCard({ order }: { order: typeof recentOrders[0] }) {
  const config = statusConfig[order.status as keyof typeof statusConfig]
  const Icon = config?.icon || Package
  return (
    <div key={order.id} className="p-4 border-b border-muted/50 last:border-0 bg-card">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <p className="font-mono font-medium text-sm truncate">{order.id}</p>
          <p className="text-sm text-muted-foreground truncate">{order.buyer}</p>
        </div>
        <Badge variant="outline" className={cn('gap-1 shrink-0', config?.color)}>
          <Icon className="h-2.5 w-2.5" />
          {config?.label}
        </Badge>
      </div>
      <div className="grid grid-cols-3 gap-3 text-sm mb-3 text-muted-foreground">
        <div><span>🏪</span> {order.seller}</div>
        <div><span>📅</span> {new Date(order.date).toLocaleDateString('pt-BR')}</div>
        <div><span>📦</span> {order.items} item{order.items > 1 ? 's' : ''}</div>
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-muted/50">
        <p className="font-bold text-lg text-foreground">R$ {order.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        <Button variant="ghost" size="icon" className="h-10 w-10 min-h-[44px] min-w-[44px]"><Eye className="h-4 w-4" /></Button>
      </div>
    </div>
  )
}

function SellerCard({ seller }: { seller: typeof pendingSellers[0] }) {
  return (
    <div key={seller.id} className="p-4 border rounded-lg bg-muted/50">
      <div className="flex flex-col gap-3">
        <div>
          <p className="font-medium">{seller.storeName}</p>
          <p className="text-sm text-muted-foreground">{seller.owner} • {seller.email}</p>
          <p className="text-sm text-muted-foreground">CNPJ: {seller.cnpj} • {new Date(seller.createdAt).toLocaleDateString('pt-BR')}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="min-h-[44px] flex-1 min-w-[120px]"><Eye className="mr-2 h-4 w-4" />Ver documentos</Button>
          <Button size="sm" className="bg-success hover:bg-success/90 min-h-[44px] flex-1 min-w-[120px]"><CheckCircle2 className="mr-2 h-4 w-4" />Aprovar</Button>
          <Button variant="outline" size="sm" className="text-destructive border-destructive/50 hover:bg-destructive/10 min-h-[44px] flex-1 min-w-[120px]"><XCircle className="mr-2 h-4 w-4" />Rejeitar</Button>
        </div>
      </div>
    </div>
  )
}

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [userSearch, setUserSearch] = useState('')
  const [userFilter, setUserFilter] = useState('all')
  const [orderSearch, setOrderSearch] = useState('')
  const [orderFilter, setOrderFilter] = useState('all')

  // Filter data
  const filteredUsers = recentUsers.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase())
    const matchesFilter = userFilter === 'all' || u.role === userFilter
    return matchesSearch && matchesFilter
  })

  const filteredOrders = recentOrders.filter(o => {
    const matchesSearch = o.id.toLowerCase().includes(orderSearch.toLowerCase()) || o.buyer.toLowerCase().includes(orderSearch.toLowerCase())
    const matchesFilter = orderFilter === 'all' || o.status === orderFilter
    return matchesSearch && matchesFilter
  })

  const handleTabChange = (value: string) => {
    setActiveTab(value as 'overview' | 'users' | 'orders' | 'sellers')
  }

  return (
    <div className="section safe-top safe-bottom pb-20">
      <div className="container-main">
        {/* Header - Mobile First */}
        <div className="flex flex-col gap-4 mb-6 animate-in">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Painel Administrativo</h1>
            <p className="text-sm text-muted-foreground mt-1">Visão geral e gerenciamento do marketplace</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full">
            <Button variant="outline" className="flex-1 sm:flex-none min-h-[44px] justify-center"><Shield className="mr-2 h-4 w-4" />Modo Manutenção</Button>
            <Button className="flex-1 sm:flex-none min-h-[44px] justify-center"><Settings className="mr-2 h-4 w-4" />Configurações</Button>
          </div>
        </div>

        {/* Stats Cards - 2 per row on mobile, 4 on desktop */}
        <div className="grid grid-cols-2 gap-4 mb-6 animate-in stagger-1">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <Card key={stat.label} className="border-muted/50">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm text-muted-foreground truncate">{stat.label}</p>
                      <p className="text-xl sm:text-2xl font-bold text-foreground mt-1 truncate">{stat.value}</p>
                      <p className={cn('text-xs font-medium mt-1', stat.changeType === 'positive' ? 'text-success' : 'text-destructive')}>
                        {stat.change} vs período anterior
                      </p>
                    </div>
                    <div className="p-2 sm:p-3 rounded-xl bg-brand-100 text-brand-600 shrink-0">
                      <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Tabs - Horizontal scroll on mobile */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="animate-in stagger-2">
          <TabsList className="flex w-full grid-cols-[repeat(4,auto)] gap-1 p-1 scrollbar-hide" role="tablist" aria-label="Abas do painel admin">
            <TabsTrigger value="overview" className="px-3 py-2 text-sm">Visão Geral</TabsTrigger>
            <TabsTrigger value="users" className="px-3 py-2 text-sm">Usuários</TabsTrigger>
            <TabsTrigger value="orders" className="px-3 py-2 text-sm">Pedidos</TabsTrigger>
            <TabsTrigger value="sellers" className="px-3 py-2 text-sm">Vendedores</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-4 space-y-4">
            <div className="grid gap-4">
              {/* Quick Actions */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2"><Plus className="h-5 w-5" />Ações Rápidas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 pt-0">
                  <Link href="/admin/usuarios/novo" className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent transition-colors min-h-[44px]">
                    <div className="p-2 rounded-lg bg-brand-100 text-brand-600 shrink-0"><Plus className="h-5 w-5" /></div>
                    <div className="min-w-0"><p className="font-medium truncate">Novo usuário</p><p className="text-xs text-muted-foreground truncate">Cadastrar administrador ou suporte</p></div>
                  </Link>
                  <Link href="/admin/produtos/novo" className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent transition-colors min-h-[44px]">
                    <div className="p-2 rounded-lg bg-blue-100 text-blue-600 shrink-0"><Package className="h-5 w-5" /></div>
                    <div className="min-w-0"><p className="font-medium truncate">Criar produto</p><p className="text-xs text-muted-foreground truncate">Adicionar produto em destaque</p></div>
                  </Link>
                  <Link href="/admin/configuracoes" className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent transition-colors min-h-[44px]">
                    <div className="p-2 rounded-lg bg-success/10 text-success shrink-0"><DollarSign className="h-5 w-5" /></div>
                    <div className="min-w-0"><p className="font-medium truncate">Configurações gerais</p><p className="text-xs text-muted-foreground truncate">Comissões, frete, cupons, etc.</p></div>
                  </Link>
                  <Link href="/admin/relatorios" className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent transition-colors min-h-[44px]">
                    <div className="p-2 rounded-lg bg-muted text-muted-foreground shrink-0"><BarChart2 className="h-5 w-5" /></div>
                    <div className="min-w-0"><p className="font-medium truncate">Relatórios</p><p className="text-xs text-muted-foreground truncate">Analytics e exportação de dados</p></div>
                  </Link>
                </CardContent>
              </Card>

              {/* System Health */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2"><Activity className="h-5 w-5" />Saúde do Sistema</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 pt-0">
                  <div className="p-3 rounded-lg bg-success/10 border border-success/20 flex items-center gap-3 min-h-[44px]">
                    <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
                    <div className="min-w-0">
                      <p className="font-medium text-success truncate">Banco de dados</p>
                      <p className="text-xs text-muted-foreground truncate">Conectado e operacional (latência: 12ms)</p>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-success/10 border border-success/20 flex items-center gap-3 min-h-[44px]">
                    <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
                    <div className="min-w-0">
                      <p className="font-medium text-success truncate">API de pagamentos</p>
                      <p className="text-xs text-muted-foreground truncate">Stripe e Mercado Pago operacionais</p>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-warning/10 border border-warning/20 flex items-center gap-3 min-h-[44px]">
                    <AlertTriangle className="h-5 w-5 text-warning shrink-0" />
                    <div className="min-w-0">
                      <p className="font-medium text-warning truncate">Storage</p>
                      <p className="text-xs text-muted-foreground truncate">78% utilizado - considerar limpeza</p>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-success/10 border border-success/20 flex items-center gap-3 min-h-[44px]">
                    <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
                    <div className="min-w-0">
                      <p className="font-medium text-success truncate">Redis Cache</p>
                      <p className="text-xs text-muted-foreground truncate">Conectado - Hit rate: 94%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts Placeholder */}
            <div className="grid gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Receita dos Últimos 30 Dias</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48 sm:h-64 flex items-center justify-center bg-muted/50 rounded-lg">
                    <div className="text-center px-4">
                      <BarChart2 className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-muted-400 mb-2" />
                      <p className="text-sm text-muted-foreground">Gráfico de receita (Recharts)</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Novos Usuários por Dia</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48 sm:h-64 flex items-center justify-center bg-muted/50 rounded-lg">
                    <div className="text-center px-4">
                      <Activity className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-muted-400 mb-2" />
                      <p className="text-sm text-muted-foreground">Gráfico de usuários (Recharts)</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="mt-4">
            <Card>
              <CardHeader className="flex flex-col gap-3 pb-3">
                <CardTitle className="text-lg">Gerenciar Usuários</CardTitle>
                <div className="flex flex-col sm:flex-row gap-2 w-full">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar usuários..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="pl-10 min-h-[44px]"
                    />
                  </div>
                  <Select value={userFilter} onValueChange={setUserFilter}>
                    <SelectTrigger className="w-full sm:w-40 min-h-[44px]"><SelectValue placeholder="Todos" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="USER">Compradores</SelectItem>
                      <SelectItem value="SELLER">Vendedores</SelectItem>
                      <SelectItem value="ADMIN">Administradores</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {/* Desktop Table */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-left text-sm text-muted-foreground">
                        <th className="pb-3 font-medium">Usuário</th>
                        <th className="pb-3 font-medium">E-mail</th>
                        <th className="pb-3 font-medium">Perfil</th>
                        <th className="pb-3 font-medium">Status</th>
                        <th className="pb-3 font-medium">Cadastro</th>
                        <th className="pb-3 font-medium text-right">Pedidos</th>
                        <th className="pb-3 font-medium text-right">Gasto Total</th>
                        <th className="pb-3 font-medium text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user) => {
                        const config = statusConfig[user.status as keyof typeof statusConfig]
                        const Icon = config?.icon || User
                        const roleConfig = roleBadges[user.role as keyof typeof roleBadges]
                        return (
                          <tr key={user.id} className="border-b hover:bg-muted/50">
                            <td className="py-3 font-medium">{user.name}</td>
                            <td className="py-3 text-sm text-muted-foreground">{user.email}</td>
                            <td className="py-3"><Badge className={roleConfig?.color}>{roleConfig?.label}</Badge></td>
                            <td className="py-3"><Badge variant="outline" className={cn('gap-1', config?.color)}><Icon className="h-3 w-3" />{config?.label}</Badge></td>
                            <td className="py-3 text-sm text-muted-foreground">{new Date(user.createdAt).toLocaleDateString('pt-BR')}</td>
                            <td className="py-3 text-right">{user.orders}</td>
                            <td className="py-3 text-right font-medium">R$ {user.totalSpent.toFixed(2)}</td>
                            <td className="py-3 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Button variant="ghost" size="icon" className="h-8 w-8"><Eye className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8"><Edit className="h-4 w-4" /></Button>
                                {user.status !== 'SUSPENDED' ? (
                                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive"><AlertTriangle className="h-4 w-4" /></Button>
                                ) : (
                                  <Button variant="ghost" size="icon" className="h-8 w-8 text-success hover:text-success"><CheckCircle2 className="h-4 w-4" /></Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="lg:hidden space-y-0">
                  {filteredUsers.map(user => <UserCard key={user.id} user={user} />)}
                </div>

                {filteredUsers.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Search className="mx-auto h-10 w-10 text-muted-400 mb-2" />
                    <p>Nenhum usuário encontrado</p>
                  </div>
                )}

                <div className="mt-4 flex justify-center">
                  <Button variant="outline" size="sm" className="min-h-[44px]">Ver todos os usuários</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="mt-4">
            <Card>
              <CardHeader className="flex flex-col gap-3 pb-3">
                <CardTitle className="text-lg">Pedidos Recentes</CardTitle>
                <div className="flex flex-col sm:flex-row gap-2 w-full">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar pedidos..."
                      value={orderSearch}
                      onChange={(e) => setOrderSearch(e.target.value)}
                      className="pl-10 min-h-[44px]"
                    />
                  </div>
                  <Select value={orderFilter} onValueChange={setOrderFilter}>
                    <SelectTrigger className="w-full sm:w-40 min-h-[44px]"><SelectValue placeholder="Todos" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="PENDING_PAYMENT">Aguardando</SelectItem>
                      <SelectItem value="PROCESSING">Processando</SelectItem>
                      <SelectItem value="SHIPPED">Enviados</SelectItem>
                      <SelectItem value="DELIVERED">Entregues</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {/* Desktop Table */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-left text-sm text-muted-foreground">
                        <th className="pb-3 font-medium">Pedido</th>
                        <th className="pb-3 font-medium">Comprador</th>
                        <th className="pb-3 font-medium">Loja</th>
                        <th className="pb-3 font-medium">Data</th>
                        <th className="pb-3 font-medium">Itens</th>
                        <th className="pb-3 font-medium text-right">Total</th>
                        <th className="pb-3 font-medium">Status</th>
                        <th className="pb-3 font-medium text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.map((order) => {
                        const config = statusConfig[order.status as keyof typeof statusConfig]
                        const Icon = config?.icon || Package
                        return (
                          <tr key={order.id} className="border-b hover:bg-muted/50">
                            <td className="py-3 font-mono font-medium text-sm">{order.id}</td>
                            <td className="py-3">{order.buyer}</td>
                            <td className="py-3 text-sm text-muted-foreground">{order.seller}</td>
                            <td className="py-3 text-sm text-muted-foreground">{new Date(order.date).toLocaleDateString('pt-BR')}</td>
                            <td className="py-3 text-center">{order.items}</td>
                            <td className="py-3 text-right font-medium">R$ {order.total.toFixed(2)}</td>
                            <td className="py-3"><Badge variant="outline" className={cn('gap-1', config?.color)}><Icon className="h-3 w-3" />{config?.label}</Badge></td>
                            <td className="py-3 text-right"><Button variant="ghost" size="icon" className="h-8 w-8"><Eye className="h-4 w-4" /></Button></td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="lg:hidden space-y-0">
                  {filteredOrders.map(order => <OrderCard key={order.id} order={order} />)}
                </div>

                {filteredOrders.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <ShoppingCart className="mx-auto h-10 w-10 text-muted-400 mb-2" />
                    <p>Nenhum pedido encontrado</p>
                  </div>
                )}

                <div className="mt-4 flex justify-center">
                  <Button variant="outline" size="sm" className="min-h-[44px]">Ver todos os pedidos</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sellers Tab */}
          <TabsContent value="sellers" className="mt-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center justify-between">
                  Vendedores Pendentes de Aprovação
                  <Badge variant="secondary" className="ml-2">{pendingSellers.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {pendingSellers.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle2 className="mx-auto h-12 w-12 text-success mb-3" />
                    <p>Nenhum vendedor pendente no momento</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingSellers.map(seller => <SellerCard key={seller.id} seller={seller} />)}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}