'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Package, ShoppingCart, DollarSign, TrendingUp, Users, Plus, Eye, Edit, Trash2, MoreHorizontal, AlertTriangle, CheckCircle2, Clock, Truck, XCircle, Search, Star, Settings, Store, Copy, Share2, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'

const stats = [
  { label: 'Produtos Ativos', value: '24', change: '+3', changeType: 'positive', icon: Package },
  { label: 'Pedidos este mês', value: '156', change: '+12%', changeType: 'positive', icon: ShoppingCart },
  { label: 'Faturamento', value: 'R$ 45.230', change: '+8.5%', changeType: 'positive', icon: DollarSign },
  { label: 'Taxa de Conversão', value: '3.2%', change: '+0.3%', changeType: 'positive', icon: TrendingUp },
]

const recentOrders = [
  { id: 'MP-2024-001234', customer: 'Maria Silva', total: 6548.99, status: 'DELIVERED', date: '2024-01-15', items: 2 },
  { id: 'MP-2024-001235', customer: 'João Santos', total: 549.99, status: 'SHIPPED', date: '2024-01-20', items: 1 },
  { id: 'MP-2024-001236', customer: 'Ana Costa', total: 1899.00, status: 'PROCESSING', date: '2024-01-22', items: 1 },
  { id: 'MP-2024-001237', customer: 'Pedro Oliveira', total: 2799.00, status: 'PAID', date: '2024-01-23', items: 1 },
  { id: 'MP-2024-001238', customer: 'Lucia Ferreira', total: 229.90, status: 'PENDING_PAYMENT', date: '2024-01-24', items: 3 },
]

const statusConfig = {
  PENDING_PAYMENT: { label: 'Aguardando', color: 'bg-warning/10 text-warning', icon: Clock },
  PAID: { label: 'Pago', color: 'bg-info/10 text-info', icon: CheckCircle2 },
  PROCESSING: { label: 'Preparando', color: 'bg-brand-100 text-brand-700', icon: Package },
  SHIPPED: { label: 'Enviado', color: 'bg-blue-100 text-blue-700', icon: Truck },
  DELIVERED: { label: 'Entregue', color: 'bg-success/10 text-success', icon: CheckCircle2 },
  CANCELLED: { label: 'Cancelado', color: 'bg-destructive/10 text-destructive', icon: XCircle },
}

const products = [
  { id: '1', name: 'Smartphone Galaxy S24 Ultra 256GB', sku: 'SAM-S24U-256-BK', price: 5999.00, stock: 45, status: 'ACTIVE', sales: 124, rating: 4.8 },
  { id: '2', name: 'Notebook Dell XPS 13 Plus Intel i7', sku: 'DEL-XPS13P-I7-16-512', price: 7799.00, stock: 8, status: 'ACTIVE', sales: 23, rating: 4.9 },
  { id: '3', name: 'Tênis Nike Air Max 270 Masculino', sku: 'NIKE-AM270-M-42-BK', price: 549.99, stock: 0, status: 'OUT_OF_STOCK', sales: 89, rating: 4.7 },
  { id: '4', name: 'Sofá 3 Lugares Retrátil Veludo Cinza', sku: 'SOFA-3L-RET-VEL-CZ', price: 1899.00, stock: 5, status: 'ACTIVE', sales: 12, rating: 4.6 },
  { id: '5', name: 'Kit Skincare Completo', sku: 'SKIN-KIT-4PASSOS', price: 229.90, stock: 150, status: 'ACTIVE', sales: 345, rating: 4.9 },
]

// Mobile Card Components
function OrderCard({ order }: { order: typeof recentOrders[0] }) {
  const config = statusConfig[order.status as keyof typeof statusConfig]
  const Icon = config?.icon || Package
  return (
    <div key={order.id} className="p-4 border-b border-muted/50 last:border-0 bg-card">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <p className="font-mono font-medium text-sm truncate">{order.id}</p>
          <p className="text-sm text-muted-foreground truncate">{order.customer}</p>
        </div>
        <Badge variant="outline" className={cn('gap-1 shrink-0', config?.color)}>
          <Icon className="h-2.5 w-2.5" />
          {config?.label}
        </Badge>
      </div>
      <div className="grid grid-cols-3 gap-3 text-sm mb-3 text-muted-foreground">
        <div><span>📅</span> {new Date(order.date).toLocaleDateString('pt-BR')}</div>
        <div><span>📦</span> {order.items} item{order.items > 1 ? 's' : ''}</div>
        <div><span>💰</span> R$ {order.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-muted/50">
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-10 w-10 min-h-[44px] min-w-[44px]"><Eye className="h-4 w-4" /></Button>
          {['PAID', 'PROCESSING'].includes(order.status) && (
            <Button variant="ghost" size="icon" className="h-10 w-10 min-h-[44px] min-w-[44px]"><Truck className="h-4 w-4" /></Button>
          )}
        </div>
      </div>
    </div>
  )
}

function ProductCard({ product }: { product: typeof products[0] }) {
  const statusBadge = product.status === 'ACTIVE'
    ? <Badge className="bg-success/10 text-success">Ativo</Badge>
    : <Badge variant="outline" className="text-muted-foreground">Sem estoque</Badge>

  const stockColor = product.stock === 0 ? 'text-destructive' : product.stock < 10 ? 'text-warning' : 'text-success'

  return (
    <div key={product.id} className="p-4 border rounded-lg bg-muted/50">
      <div className="flex items-start gap-3 mb-3">
        <div className="h-14 w-14 rounded bg-muted/50 flex items-center justify-center shrink-0">
          <Package className="h-7 w-7 text-muted-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{product.name}</p>
          <p className="text-xs text-muted-foreground font-mono">{product.sku}</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3 text-sm mb-3">
        <div>
          <p className="text-muted-foreground">Preço</p>
          <p className="font-medium">R$ {product.price.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Estoque</p>
          <p className={cn('font-medium', stockColor)}>{product.stock}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Vendas</p>
          <p className="font-medium">{product.sales}</p>
        </div>
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-muted/50">
        <div className="flex items-center gap-2">
          {statusBadge}
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium">{product.rating}</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-10 w-10 min-h-[44px] min-w-[44px]"><Eye className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" className="h-10 w-10 min-h-[44px] min-w-[44px]"><Edit className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" className="h-10 w-10 min-h-[44px] min-w-[44px] text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
        </div>
      </div>
    </div>
  )
}

export default function SellerDashboardPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [orderSearch, setOrderSearch] = useState('')
  const [orderFilter, setOrderFilter] = useState('all')
  const [productSearch, setProductSearch] = useState('')

  const filteredOrders = recentOrders.filter(o => {
    const matchesSearch = o.id.toLowerCase().includes(orderSearch.toLowerCase()) || o.customer.toLowerCase().includes(orderSearch.toLowerCase())
    const matchesFilter = orderFilter === 'all' || o.status === orderFilter
    return matchesSearch && matchesFilter
  })

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(productSearch.toLowerCase()) || p.sku.toLowerCase().includes(productSearch.toLowerCase())
  )

  const handleTabChange = (value: string) => {
    setActiveTab(value as 'overview' | 'orders' | 'products')
  }

  return (
    <div className="section safe-top safe-bottom pb-20">
      <div className="container-main">
        {/* Header */}
        <div className="flex flex-col gap-4 mb-6 animate-in">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">Visão geral da sua loja: Loja do João</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full">
            <Link href="/seller/produtos/novo" className="flex-1">
              <Button className="w-full justify-center min-h-[44px]">
                <Plus className="mr-2 h-4 w-4" />
                Novo Produto
              </Button>
            </Link>
            {/* Store Link Actions */}
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                className="flex-1 justify-center min-h-[44px] gap-2"
                onClick={() => {
                  const url = `${window.location.origin}/loja/joao-silva`;
                  navigator.clipboard.writeText(url);
                  alert('Link da loja copiado! ✅\n\n' + url);
                }}
              >
                <Copy className="h-4 w-4" />
                <Store className="h-4 w-4" />
                Copiar Link da Loja
              </Button>
              <Button
                variant="ghost"
                className="flex-1 justify-center min-h-[44px] gap-2"
                onClick={() => {
                  const url = `${window.location.origin}/loja/joao-silva`;
                  if (navigator.share) {
                    navigator.share({
                      title: 'Minha Loja - Marketplace Botelho',
                      text: 'Confira meus produtos!',
                      url,
                    });
                  } else {
                    navigator.clipboard.writeText(url);
                    alert('Link copiado! (Compartilhamento nativo não disponível)');
                  }
                }}
              >
                <Share2 className="h-4 w-4" />
                Compartilhar
              </Button>
              <a
                href="/loja/joao-silva"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="ghost" className="flex-1 justify-center min-h-[44px] gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Ver Loja
                </Button>
              </a>
            </div>
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
                        {stat.change} vs mês anterior
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
          <TabsList className="flex w-full grid-cols-[repeat(3,auto)] gap-1 p-1 scrollbar-hide" role="tablist" aria-label="Abas do dashboard vendedor">
            <TabsTrigger value="overview" className="px-3 py-2 text-sm">Visão Geral</TabsTrigger>
            <TabsTrigger value="orders" className="px-3 py-2 text-sm">Pedidos</TabsTrigger>
            <TabsTrigger value="products" className="px-3 py-2 text-sm">Produtos</TabsTrigger>
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
                  <Link href="/seller/produtos/novo" className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent transition-colors min-h-[44px]">
                    <div className="p-2 rounded-lg bg-brand-100 text-brand-600 shrink-0"><Plus className="h-5 w-5" /></div>
                    <div className="min-w-0"><p className="font-medium truncate">Adicionar produto</p><p className="text-xs text-muted-foreground truncate">Cadastrar novo item na loja</p></div>
                  </Link>
                  <Link href="/seller/pedidos" className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent transition-colors min-h-[44px]">
                    <div className="p-2 rounded-lg bg-blue-100 text-blue-600 shrink-0"><ShoppingCart className="h-5 w-5" /></div>
                    <div className="min-w-0"><p className="font-medium truncate">Gerenciar pedidos</p><p className="text-xs text-muted-foreground truncate">Ver e processar pedidos</p></div>
                  </Link>
                  <Link href="/seller/financeiro" className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent transition-colors min-h-[44px]">
                    <div className="p-2 rounded-lg bg-success/10 text-success shrink-0"><DollarSign className="h-5 w-5" /></div>
                    <div className="min-w-0"><p className="font-medium truncate">Financeiro</p><p className="text-xs text-muted-foreground truncate">Saldos, saques e extratos</p></div>
                  </Link>
                  <Link href="/seller/configuracoes" className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent transition-colors min-h-[44px]">
                    <div className="p-2 rounded-lg bg-muted text-muted-foreground shrink-0"><Settings className="h-5 w-5" /></div>
                    <div className="min-w-0"><p className="font-medium truncate">Configurações</p><p className="text-xs text-muted-foreground truncate">Perfil da loja, frete, etc.</p></div>
                  </Link>
                </CardContent>
              </Card>

              {/* Alerts */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2"><AlertTriangle className="h-5 w-5" />Alertas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 pt-0">
                  <div className="p-3 rounded-lg bg-warning/10 border border-warning/20 flex items-center gap-3 min-h-[44px]">
                    <AlertTriangle className="h-5 w-5 text-warning shrink-0" />
                    <div className="min-w-0">
                      <p className="font-medium text-warning truncate">Estoque baixo</p>
                      <p className="text-xs text-muted-foreground truncate">3 produtos com estoque abaixo do mínimo</p>
                    </div>
                    <Link href="/seller/produtos?filter=low_stock" className="ml-auto shrink-0 text-sm text-brand-600 hover:underline">Ver</Link>
                  </div>
                  <div className="p-3 rounded-lg bg-info/10 border border-info/20 flex items-center gap-3 min-h-[44px]">
                    <svg className="h-5 w-5 text-info shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
                    <div className="min-w-0">
                      <p className="font-medium text-info truncate">Pagamento pendente</p>
                      <p className="text-xs text-muted-foreground truncate">R$ 2.450,00 aguardando liberação (14 dias)</p>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-success/10 border border-success/20 flex items-center gap-3 min-h-[44px]">
                    <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
                    <div className="min-w-0">
                      <p className="font-medium text-success truncate">Loja verificada</p>
                      <p className="text-xs text-muted-foreground truncate">Sua loja está verificada e com selo de confiança</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Performance Chart */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Desempenho dos Últimos 30 Dias</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48 sm:h-64 flex items-center justify-center bg-muted/50 rounded-lg">
                  <div className="text-center px-4">
                    <TrendingUp className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-muted-400 mb-2" />
                    <p className="text-sm text-muted-foreground">Gráfico de vendas (Recharts)</p>
                  </div>
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
                      <SelectItem value="PENDING_PAYMENT">Aguardando pagamento</SelectItem>
                      <SelectItem value="PROCESSING">Em preparação</SelectItem>
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
                        <th className="pb-3 font-medium">Cliente</th>
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
                            <td className="py-4 font-mono font-medium">{order.id}</td>
                            <td className="py-4">{order.customer}</td>
                            <td className="py-4 text-sm text-muted-foreground">{new Date(order.date).toLocaleDateString('pt-BR')}</td>
                            <td className="py-4 text-center">{order.items}</td>
                            <td className="py-4 text-right font-medium">R$ {order.total.toFixed(2)}</td>
                            <td className="py-4"><Badge variant="outline" className={cn('gap-1', config?.color)}><Icon className="h-3 w-3" />{config?.label}</Badge></td>
                            <td className="py-4 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Button variant="ghost" size="icon" className="h-8 w-8"><Eye className="h-4 w-4" /></Button>
                                {['PAID', 'PROCESSING'].includes(order.status) && (
                                  <Button variant="ghost" size="icon" className="h-8 w-8"><Truck className="h-4 w-4" /></Button>
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

          {/* Products Tab */}
          <TabsContent value="products" className="mt-4">
            <Card>
              <CardHeader className="flex flex-col gap-3 pb-3">
                <CardTitle className="text-lg">Meus Produtos</CardTitle>
                <div className="flex flex-col sm:flex-row gap-2 w-full">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar produtos..."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      className="pl-10 min-h-[44px]"
                    />
                  </div>
                  <Link href="/seller/produtos/novo" className="w-full sm:w-auto">
                    <Button className="w-full sm:w-auto justify-center min-h-[44px]"><Plus className="mr-2 h-4 w-4" />Novo</Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {/* Desktop Table */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-left text-sm text-muted-foreground">
                        <th className="pb-3 font-medium">Produto</th>
                        <th className="pb-3 font-medium">SKU</th>
                        <th className="pb-3 font-medium text-right">Preço</th>
                        <th className="pb-3 font-medium text-center">Estoque</th>
                        <th className="pb-3 font-medium">Status</th>
                        <th className="pb-3 font-medium text-center">Vendas</th>
                        <th className="pb-3 font-medium text-center">Avaliação</th>
                        <th className="pb-3 font-medium text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.map((product) => (
                        <tr key={product.id} className="border-b hover:bg-muted/50">
                          <td className="py-4">
                            <div className="flex items-center gap-3">
                              <div className="h-12 w-12 rounded bg-muted/50 flex items-center justify-center">
                                <Package className="h-6 w-6 text-muted-400" />
                              </div>
                              <div>
                                <p className="font-medium">{product.name}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 text-sm font-mono text-muted-foreground">{product.sku}</td>
                          <td className="py-4 text-right font-medium">R$ {product.price.toFixed(2)}</td>
                          <td className="py-4 text-center">
                            <span className={cn('font-medium', product.stock === 0 ? 'text-destructive' : product.stock < 10 ? 'text-warning' : 'text-success')}>
                              {product.stock}
                            </span>
                          </td>
                          <td className="py-4">
                            <Badge variant={product.status === 'ACTIVE' ? 'default' : 'outline'} className={product.status === 'ACTIVE' ? 'bg-success/10 text-success' : 'text-muted-foreground'}>
                              {product.status === 'ACTIVE' ? 'Ativo' : 'Sem estoque'}
                            </Badge>
                          </td>
                          <td className="py-4 text-center">{product.sales}</td>
                          <td className="py-4 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span>{product.rating}</span>
                            </div>
                          </td>
                          <td className="py-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8"><Eye className="h-4 w-4" /></Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8"><Edit className="h-4 w-4" /></Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="lg:hidden space-y-3 p-1">
                  {filteredProducts.map(product => <ProductCard key={product.id} product={product} />)}
                </div>

                {filteredProducts.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="mx-auto h-10 w-10 text-muted-400 mb-2" />
                    <p>Nenhum produto encontrado</p>
                  </div>
                )}

                <div className="mt-4 flex justify-center">
                  <Button variant="outline" size="sm" className="min-h-[44px]">Ver todos os produtos</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}