'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Package, Truck, CreditCard, RotateCcw, AlertCircle, CheckCircle2, XCircle, Clock, Eye, Edit, MoreHorizontal, Filter, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

const orders = [
  { id: 'MP-2024-001234', buyer: 'Maria Silva', total: 6548.99, status: 'DELIVERED', date: '2024-01-15', items: 2, shipping: { carrier: 'Correios', tracking: 'BR123456789BR' } },
  { id: 'MP-2024-001235', buyer: 'João Santos', total: 549.99, status: 'SHIPPED', date: '2024-01-20', items: 1, shipping: { carrier: 'Jadlog', tracking: 'BR987654321BR' } },
  { id: 'MP-2024-001236', buyer: 'Ana Costa', total: 1899.00, status: 'PROCESSING', date: '2024-01-22', items: 1, shipping: null },
  { id: 'MP-2024-001237', buyer: 'Pedro Oliveira', total: 2799.00, status: 'PAID', date: '2024-01-23', items: 1, shipping: null },
  { id: 'MP-2024-001238', buyer: 'Lucia Ferreira', total: 229.90, status: 'PENDING_PAYMENT', date: '2024-01-24', items: 3, shipping: null },
  { id: 'MP-2024-001239', buyer: 'Lucas Lima', total: 2799.00, status: 'PAID', date: '2024-01-24', items: 1, shipping: null },
  { id: 'MP-2024-001240', buyer: 'Fernanda Alves', total: 7799.00, status: 'PROCESSING', date: '2024-01-24', items: 1, shipping: null },
  { id: 'MP-2024-001241', buyer: 'Ricardo Souza', total: 549.99, status: 'PENDING_PAYMENT', date: '2024-01-24', items: 1, shipping: null },
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

const tabs = [
  { id: 'all', label: `Todos (${orders.length})` },
  { id: 'pending', label: `Aguardando (${orders.filter(o => o.status === 'PENDING_PAYMENT').length})` },
  { id: 'paid', label: `Pagos (${orders.filter(o => o.status === 'PAID').length})` },
  { id: 'processing', label: `Preparando (${orders.filter(o => o.status === 'PROCESSING').length})` },
  { id: 'shipped', label: `Enviados (${orders.filter(o => o.status === 'SHIPPED').length})` },
  { id: 'delivered', label: `Entregues (${orders.filter(o => o.status === 'DELIVERED').length})` },
]

export default function SellerPedidosPage() {
  const [activeTab, setActiveTab] = useState('all')

  const filteredOrders = orders.filter(o => {
    if (activeTab === 'pending') return o.status === 'PENDING_PAYMENT'
    if (activeTab === 'paid') return o.status === 'PAID'
    if (activeTab === 'processing') return o.status === 'PROCESSING'
    if (activeTab === 'shipped') return o.status === 'SHIPPED'
    if (activeTab === 'delivered') return o.status === 'DELIVERED'
    return true
  })

  return (
    <div className="section">
      <div className="container-main">
        <div className="mb-8 animate-in">
          <h1 className="text-3xl font-bold text-foreground mb-1">Gerenciar Pedidos</h1>
          <p className="text-muted-foreground">Acompanhe e processe os pedidos da sua loja</p>
        </div>

        {/* Filters */}
        <Card className="mb-6 animate-in">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Buscar por ID, cliente..." className="pl-10" />
              </div>
              <Select defaultValue="30d">
                <SelectTrigger className="w-40"><SelectValue placeholder="Período" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Hoje</SelectItem>
                  <SelectItem value="7d">Últimos 7 dias</SelectItem>
                  <SelectItem value="30d">Últimos 30 dias</SelectItem>
                  <SelectItem value="90d">Últimos 90 dias</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline"><Download className="mr-2 h-4 w-4" />Exportar</Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="animate-in">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
            {tabs.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id}>{tab.label}</TabsTrigger>
            ))}
          </TabsList>

          {tabs.map((tab) => (
            <TabsContent key={tab.id} value={tab.id} className="mt-6">
              <Card>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b text-left text-sm text-muted-foreground">
                          <th className="pb-3 font-medium">Pedido</th>
                          <th className="pb-3 font-medium">Cliente</th>
                          <th className="pb-3 font-medium">Data</th>
                          <th className="pb-3 font-medium">Itens</th>
                          <th className="pb-3 font-medium text-right">Total</th>
                          <th className="pb-3 font-medium">Status</th>
                          <th className="pb-3 font-medium">Entrega</th>
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
                              <td className="py-4">{order.buyer}</td>
                              <td className="py-4 text-sm text-muted-foreground">{new Date(order.date).toLocaleDateString('pt-BR')}</td>
                              <td className="py-4 text-center">{order.items}</td>
                              <td className="py-4 text-right font-medium">R$ {order.total.toFixed(2)}</td>
                              <td className="py-4">
                                <Badge variant="outline" className={cn('gap-1', config?.color)}>
                                  <Icon className="h-3 w-3" />
                                  {config?.label}
                                </Badge>
                              </td>
                              <td className="py-4">
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
                                  {order.status === 'PAID' && (
                                    <Button variant="ghost" size="icon" className="h-8 w-8"><Truck className="h-4 w-4" /></Button>
                                  )}
                                  {order.status === 'PROCESSING' && (
                                    <Button variant="ghost" size="icon" className="h-8 w-8"><Package className="h-4 w-4" /></Button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
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
      </div>
    </div>
  )
}

// Search icon
function Search({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg className={className} {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8" />
      <path d="M21 21l-4.35-4.35" />
    </svg>
  )
}