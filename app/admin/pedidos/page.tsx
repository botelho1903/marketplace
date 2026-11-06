'use client'

import { Search, Filter, Package, Truck, CreditCard, RotateCcw, AlertCircle, CheckCircle2, XCircle, Clock, Eye, MoreHorizontal, Download, DollarSign, User, MapPin, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

const orders = [
  { id: 'MP-2024-001234', buyer: 'Maria Silva', buyerId: '1', seller: 'Loja do João', sellerId: '2', total: 6548.99, commission: 654.90, status: 'DELIVERED', paymentStatus: 'PAID', date: '2024-01-15', items: 2, shipping: { carrier: 'Correios', tracking: 'BR123456789BR', address: 'Av. Paulista, 1000 - São Paulo/SP' } },
  { id: 'MP-2024-001235', buyer: 'João Santos', buyerId: '2', seller: 'Pedro Tech', sellerId: '4', total: 549.99, commission: 55.00, status: 'SHIPPED', paymentStatus: 'PAID', date: '2024-01-20', items: 1, shipping: { carrier: 'Jadlog', tracking: 'BR987654321BR', address: 'Rua das Flores, 123 - Rio de Janeiro/RJ' } },
  { id: 'MP-2024-001236', buyer: 'Ana Costa', buyerId: '3', seller: 'Loja do João', sellerId: '2', total: 1899.00, commission: 189.90, status: 'PROCESSING', paymentStatus: 'PAID', date: '2024-01-22', items: 1, shipping: null },
  { id: 'MP-2024-001237', buyer: 'Pedro Oliveira', buyerId: '4', seller: 'Beleza da Fer', sellerId: '7', total: 2799.00, commission: 279.90, status: 'PAID', paymentStatus: 'PAID', date: '2024-01-23', items: 1, shipping: null },
  { id: 'MP-2024-001238', buyer: 'Lucia Ferreira', buyerId: '5', seller: 'Loja do João', sellerId: '2', total: 229.90, commission: 22.99, status: 'PENDING_PAYMENT', paymentStatus: 'PENDING', date: '2024-01-24', items: 3, shipping: null },
  { id: 'MP-2024-001239', buyer: 'Lucas Lima', buyerId: '6', seller: 'Casa & Conforto', sellerId: '9', total: 2799.00, commission: 279.90, status: 'PAID', paymentStatus: 'PAID', date: '2024-01-24', items: 1, shipping: null },
  { id: 'MP-2024-001240', buyer: 'Fernanda Alves', buyerId: '7', seller: 'Pedro Tech', sellerId: '4', total: 7799.00, commission: 779.90, status: 'PROCESSING', paymentStatus: 'PAID', date: '2024-01-24', items: 1, shipping: null },
  { id: 'MP-2024-001241', buyer: 'Ricardo Souza', buyerId: '8', seller: 'Beleza da Fer', sellerId: '7', total: 549.99, commission: 55.00, status: 'PENDING_PAYMENT', paymentStatus: 'PENDING', date: '2024-01-24', items: 1, shipping: null },
  { id: 'MP-2024-001242', buyer: 'Amanda Costa', buyerId: '10', seller: 'Loja do João', sellerId: '2', total: 1299.00, commission: 129.90, status: 'CANCELLED', paymentStatus: 'REFUNDED', date: '2024-01-23', items: 1, shipping: null },
  { id: 'MP-2024-001243', buyer: 'Bruno Lima', buyerId: '11', seller: 'Casa & Conforto', sellerId: '9', total: 3499.00, commission: 349.90, status: 'REFUNDED', paymentStatus: 'REFUNDED', date: '2024-01-22', items: 1, shipping: { carrier: 'Correios', tracking: 'BR111222333BR', address: 'Av. Brasil, 500 - Belo Horizonte/MG' } },
]

const statusConfig = {
  PENDING_PAYMENT: { label: 'Aguardando pagamento', color: 'bg-warning/10 text-warning', icon: Clock },
  PAID: { label: 'Pagamento aprovado', color: 'bg-info/10 text-info', icon: CheckCircle2 },
  PROCESSING: { label: 'Em preparação', color: 'bg-brand-100 text-brand-700', icon: Package },
  SHIPPED: { label: 'Enviado', color: 'bg-blue-100 text-blue-700', icon: Truck },
  DELIVERED: { label: 'Entregue', color: 'bg-success/10 text-success', icon: CheckCircle2 },
  CANCELLED: { label: 'Cancelado', color: 'bg-destructive/10 text-destructive', icon: XCircle },
  REFUNDED: { label: 'Reembolsado', color: 'bg-muted text-muted-foreground', icon: RotateCcw },
}

const paymentStatusConfig = {
  PAID: { label: 'Pago', color: 'bg-success/10 text-success' },
  PENDING: { label: 'Pendente', color: 'bg-warning/10 text-warning' },
  REFUNDED: { label: 'Reembolsado', color: 'bg-muted text-muted-foreground' },
  FAILED: { label: 'Falhou', color: 'bg-destructive/10 text-destructive' },
}

const tabs = [
  { id: 'all', label: `Todos (${orders.length})` },
  { id: 'pending', label: `Aguardando (${orders.filter(o => o.status === 'PENDING_PAYMENT').length})` },
  { id: 'paid', label: `Pagos (${orders.filter(o => o.status === 'PAID').length})` },
  { id: 'processing', label: `Preparando (${orders.filter(o => o.status === 'PROCESSING').length})` },
  { id: 'shipped', label: `Enviados (${orders.filter(o => o.status === 'SHIPPED').length})` },
  { id: 'delivered', label: `Entregues (${orders.filter(o => o.status === 'DELIVERED').length})` },
  { id: 'cancelled', label: `Cancelados (${orders.filter(o => o.status === 'CANCELLED').length})` },
  { id: 'refunded', label: `Reembolsados (${orders.filter(o => o.status === 'REFUNDED').length})` },
]

function OrderCard({ order }: { order: typeof orders[0] }) {
  const config = statusConfig[order.status as keyof typeof statusConfig]
  const payConfig = paymentStatusConfig[order.paymentStatus as keyof typeof paymentStatusConfig]
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
      <div className="grid grid-cols-2 gap-3 text-sm mb-3 text-muted-foreground">
        <div><span>🏪</span> {order.seller}</div>
        <div><span>📅</span> {new Date(order.date).toLocaleDateString('pt-BR')}</div>
        <div><span>📦</span> {order.items} item{order.items > 1 ? 's' : ''}</div>
        <div><span>💰</span> R$ {order.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
      </div>
      <div className="grid grid-cols-3 gap-3 text-sm mb-3">
        <div>
          <p className="text-muted-foreground">Comissão</p>
          <p className="font-medium">R$ {order.commission.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Pagamento</p>
          <Badge variant="outline" className={payConfig?.color}>{payConfig?.label}</Badge>
        </div>
        <div>
          <p className="text-muted-foreground">Entrega</p>
          <p className="font-medium truncate">{order.shipping ? `${order.shipping.carrier} - ${order.shipping.tracking}` : '—'}</p>
        </div>
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-muted/50">
        <Button variant="ghost" size="icon" className="h-10 w-10 min-h-[44px] min-w-[44px]"><Eye className="h-4 w-4" /></Button>
      </div>
    </div>
  )
}

export default function AdminPedidosPage() {
  const [activeTab, setActiveTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredOrders = orders.filter(o => {
    if (activeTab === 'pending' && o.status !== 'PENDING_PAYMENT') return false
    if (activeTab === 'paid' && o.status !== 'PAID') return false
    if (activeTab === 'processing' && o.status !== 'PROCESSING') return false
    if (activeTab === 'shipped' && o.status !== 'SHIPPED') return false
    if (activeTab === 'delivered' && o.status !== 'DELIVERED') return false
    if (activeTab === 'cancelled' && o.status !== 'CANCELLED') return false
    if (activeTab === 'refunded' && o.status !== 'REFUNDED') return false
    if (searchQuery && !o.id.toLowerCase().includes(searchQuery.toLowerCase()) && !o.buyer.toLowerCase().includes(searchQuery.toLowerCase()) && !o.seller.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0)
  const totalCommission = orders.reduce((sum, o) => sum + o.commission, 0)
  const pendingOrders = orders.filter(o => o.status === 'PENDING_PAYMENT' || o.status === 'PAID' || o.status === 'PROCESSING').length

  const handleTabChange = (value: string) => {
    setActiveTab(value as 'all' | 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded')
  }

  return (
    <div className="section safe-top safe-bottom pb-20">
      <div className="container-main">
        <div className="flex flex-col gap-4 mb-6 animate-in">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Gerenciar Pedidos</h1>
            <p className="text-sm text-muted-foreground mt-1">Acompanhe todos os pedidos da plataforma</p>
          </div>
          <Button variant="outline" className="w-full sm:w-auto justify-center min-h-[44px]"><Download className="mr-2 h-4 w-4" />Exportar</Button>
        </div>

        {/* Stats Cards - 2 per row on mobile, 4 on desktop */}
        <div className="grid grid-cols-2 gap-4 mb-6 animate-in stagger-1">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total de Pedidos</p>
                  <p className="text-2xl font-bold">{orders.length}</p>
                </div>
                <div className="p-3 rounded-xl bg-blue-100 text-blue-600"><Package className="h-6 w-6" /></div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Receita Total</p>
                  <p className="text-2xl font-bold">R$ {totalRevenue.toFixed(2)}</p>
                </div>
                <div className="p-3 rounded-xl bg-green-100 text-green-600"><DollarSign className="h-6 w-6" /></div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Comissão Total</p>
                  <p className="text-2xl font-bold">R$ {totalCommission.toFixed(2)}</p>
                </div>
                <div className="p-3 rounded-xl bg-brand-100 text-brand-600"><CreditCard className="h-6 w-6" /></div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pedidos Pendentes</p>
                  <p className="text-2xl font-bold">{pendingOrders}</p>
                </div>
                <div className="p-3 rounded-xl bg-warning/10 text-warning"><Clock className="h-6 w-6" /></div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6 animate-in">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Buscar por ID, cliente, vendedor..." className="pl-10 min-h-[44px]" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
              </div>
              <Select defaultValue="30d">
                <SelectTrigger className="w-full sm:w-40 min-h-[44px]"><SelectValue placeholder="Período" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Hoje</SelectItem>
                  <SelectItem value="7d">Últimos 7 dias</SelectItem>
                  <SelectItem value="30d">Últimos 30 dias</SelectItem>
                  <SelectItem value="90d">Últimos 90 dias</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="all">
                <SelectTrigger className="w-full sm:w-40 min-h-[44px]"><SelectValue placeholder="Pagamento" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="PAID">Pago</SelectItem>
                  <SelectItem value="PENDING">Pendente</SelectItem>
                  <SelectItem value="REFUNDED">Reembolsado</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="w-full sm:w-auto justify-center min-h-[44px]"><Filter className="mr-2 h-4 w-4" />Mais filtros</Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabs - Horizontal scroll on mobile */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="animate-in">
          <TabsList className="flex w-full grid-cols-[repeat(8,auto)] gap-1 p-1 scrollbar-hide" role="tablist" aria-label="Filtros de pedidos">
            {tabs.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id} className="px-3 py-2 text-sm">{tab.label}</TabsTrigger>
            ))}
          </TabsList>

          {tabs.map((tab) => (
            <TabsContent key={tab.id} value={tab.id} className="mt-4">
              <Card>
                <CardContent className="pt-0">
                  {/* Desktop Table */}
                  <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b text-left text-sm text-muted-foreground">
                          <th className="pb-3 font-medium">Pedido</th>
                          <th className="pb-3 font-medium">Comprador</th>
                          <th className="pb-3 font-medium hidden md:table-cell">Vendedor</th>
                          <th className="pb-3 font-medium hidden lg:table-cell">Data</th>
                          <th className="pb-3 font-medium text-center hidden md:table-cell">Itens</th>
                          <th className="pb-3 font-medium text-right">Total</th>
                          <th className="pb-3 font-medium text-right hidden lg:table-cell">Comissão</th>
                          <th className="pb-3 font-medium">Status</th>
                          <th className="pb-3 font-medium hidden lg:table-cell">Pagamento</th>
                          <th className="pb-3 font-medium hidden lg:table-cell">Entrega</th>
                          <th className="pb-3 font-medium text-right">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredOrders.map((order) => {
                          const config = statusConfig[order.status as keyof typeof statusConfig]
                          const payConfig = paymentStatusConfig[order.paymentStatus as keyof typeof paymentStatusConfig]
                          const Icon = config?.icon || Package
                          return (
                            <tr key={order.id} className="border-b hover:bg-muted/50">
                              <td className="py-4 font-mono font-medium">{order.id}</td>
                              <td className="py-4">
                                <div>
                                  <p className="font-medium">{order.buyer}</p>
                                  <p className="text-xs text-muted-foreground">ID: {order.buyerId}</p>
                                </div>
                              </td>
                              <td className="py-4 hidden md:table-cell">
                                <div>
                                  <p className="font-medium">{order.seller}</p>
                                  <p className="text-xs text-muted-foreground">ID: {order.sellerId}</p>
                                </div>
                              </td>
                              <td className="py-4 hidden lg:table-cell text-sm text-muted-foreground">
                                {new Date(order.date).toLocaleDateString('pt-BR')}
                              </td>
                              <td className="py-4 text-center hidden md:table-cell">{order.items}</td>
                              <td className="py-4 text-right font-medium">R$ {order.total.toFixed(2)}</td>
                              <td className="py-4 text-right hidden lg:table-cell text-sm text-muted-foreground">
                                R$ {order.commission.toFixed(2)}
                              </td>
                              <td className="py-4">
                                <Badge variant="outline" className={cn('gap-1', config?.color)}>
                                  <Icon className="h-3 w-3" />
                                  {config?.label}
                                </Badge>
                              </td>
                              <td className="py-4 hidden lg:table-cell">
                                <Badge variant="outline" className={payConfig?.color}>
                                  {payConfig?.label}
                                </Badge>
                              </td>
                              <td className="py-4 hidden lg:table-cell">
                                {order.shipping ? (
                                  <div className="text-sm">
                                    <p className="font-medium">{order.shipping.carrier}</p>
                                    <p className="text-muted-foreground">{order.shipping.tracking}</p>
                                  </div>
                                ) : (
                                  <span className="text-sm text-muted-foreground">—</span>
                                )}
                              </td>
                              <td className="py-4 text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <Button variant="ghost" size="icon" className="h-8 w-8"><Eye className="h-4 w-4" /></Button>
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
                    <div className="text-center py-12 text-muted-foreground">
                      <Package className="mx-auto h-12 w-12 mb-3 text-muted-400" />
                      <p>Nenhum pedido encontrado</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>

        {/* Pagination */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in stagger-2">
          <p className="text-sm text-muted-foreground">Mostrando 1 a {filteredOrders.length} de {filteredOrders.length} pedidos</p>
          <nav className="flex items-center gap-2">
            <Button variant="outline" size="icon" disabled className="min-h-[44px] min-w-[44px]"><ChevronLeft className="h-4 w-4" /></Button>
            <Button variant="default" size="icon" className="w-10 min-h-[44px]" aria-current="page">1</Button>
            <Button variant="outline" size="icon" className="w-10 min-h-[44px]">2</Button>
            <Button variant="outline" size="icon" className="w-10 min-h-[44px]">3</Button>
            <span className="px-2 text-muted-foreground">...</span>
            <Button variant="outline" size="icon" className="w-10 min-h-[44px]">5</Button>
            <Button variant="outline" size="icon" className="min-h-[44px] min-w-[44px]"><ChevronRight className="h-4 w-4" /></Button>
          </nav>
        </div>
      </div>
    </div>
  )
}