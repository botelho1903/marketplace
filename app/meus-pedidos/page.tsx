'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Package, Truck, CreditCard, RotateCcw, Eye, AlertCircle, CheckCircle2, XCircle, Clock, ChevronDown, ChevronUp, Search, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import Image from 'next/image'

const statusConfig: Record<string, { label: string; icon: React.ComponentType<{ className?: string }>; color: string; bgColor: string }> = {
  PENDING_PAYMENT: { label: 'Aguardando pagamento', icon: Clock, color: 'text-warning', bgColor: 'bg-warning/10' },
  PAID: { label: 'Pagamento aprovado', icon: CheckCircle2, color: 'text-success', bgColor: 'bg-success/10' },
  PROCESSING: { label: 'Em preparação', icon: Package, color: 'text-info', bgColor: 'bg-info/10' },
  SHIPPED: { label: 'Enviado', icon: Truck, color: 'text-brand-600', bgColor: 'bg-brand-100' },
  DELIVERED: { label: 'Entregue', icon: CheckCircle2, color: 'text-success', bgColor: 'bg-success/10' },
  CANCELLED: { label: 'Cancelado', icon: XCircle, color: 'text-destructive', bgColor: 'bg-destructive/10' },
  REFUNDED: { label: 'Reembolsado', icon: RotateCcw, color: 'text-muted-foreground', bgColor: 'bg-muted' },
  DISPUTED: { label: 'Em disputa', icon: AlertCircle, color: 'text-warning', bgColor: 'bg-warning/10' },
}

const mockOrders = [
  {
    id: 'ORD-2024-001',
    orderNumber: 'MP-2024-001234',
    status: 'DELIVERED',
    createdAt: '2024-01-15T10:30:00Z',
    total: 6548.99,
    items: [
      { name: 'Smartphone Galaxy S24 Ultra 256GB', price: 5999.00, quantity: 1, image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400' },
      { name: 'Capa Protetora Transparente', price: 49.99, quantity: 1, image: 'https://images.unsplash.com/photo-1601593346740-925612772716?w=400' },
    ],
    shipping: { trackingCode: 'BR123456789BR', carrier: 'Correios', estimatedDelivery: '2024-01-18' },
  },
  {
    id: 'ORD-2024-002',
    orderNumber: 'MP-2024-001235',
    status: 'SHIPPED',
    createdAt: '2024-01-20T14:20:00Z',
    total: 549.99,
    items: [
      { name: 'Tênis Nike Air Max 270 Masculino', price: 549.99, quantity: 1, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400' },
    ],
    shipping: { trackingCode: 'BR987654321BR', carrier: 'Jadlog', estimatedDelivery: '2024-01-25' },
  },
  {
    id: 'ORD-2024-003',
    orderNumber: 'MP-2024-001236',
    status: 'PROCESSING',
    createdAt: '2024-01-22T09:15:00Z',
    total: 1899.00,
    items: [
      { name: 'Sofá 3 Lugares Retrátil Veludo Cinza', price: 1899.00, quantity: 1, image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400' },
    ],
    shipping: null,
  },
]

const tabs = [
  { id: 'all', label: 'Todos (3)' },
  { id: 'processing', label: 'Em andamento (2)' },
  { id: 'delivered', label: 'Entregues (1)' },
  { id: 'cancelled', label: 'Cancelados (0)' },
]

function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] || { label: status, icon: Package, color: '', bgColor: '' }
  const Icon = config.icon
  return (
    <Badge variant="outline" className={cn('gap-1.5', config.bgColor, config.color)}>
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  )
}

function OrderCard({ order, expandedOrder, setExpandedOrder }: { order: any; expandedOrder: string | null; setExpandedOrder: (id: string | null) => void }) {
  const isExpanded = expandedOrder === order.id
  const config = statusConfig[order.status]

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        {/* Header */}
        <div
          className="p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer"
          onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
        >
          <div className="flex items-center gap-4">
            <div className={cn('p-3 rounded-xl', config.bgColor)}>
              <config.icon className={cn('h-6 w-6', config.color)} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-medium text-foreground">{order.orderNumber}</span>
                <StatusBadge status={order.status} />
              </div>
              <p className="text-sm text-muted-foreground">{new Date(order.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-lg font-bold text-foreground">R$ {order.total.toFixed(2)}</p>
              <p className="text-sm text-muted-foreground">{order.items.length} item{order.items.length > 1 ? 's' : ''}</p>
            </div>
            <div className={cn('transition-transform', isExpanded ? 'rotate-180' : '')}>
              <ChevronDown className="h-5 w-5 text-muted-400" />
            </div>
          </div>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="border-t bg-muted/30 animate-slide-down">
            <div className="p-4 md:p-6">
              <div className="grid md:grid-cols-3 gap-6 mb-6">
                {/* Items */}
                <div className="md:col-span-2 space-y-3">
                  <h4 className="font-medium">Itens do pedido</h4>
                  <div className="space-y-3">
                    {order.items.map((item: any, i: number) => (
                      <Link key={i} href={`/produtos/${item.name.toLowerCase().replace(/\s+/g, '-')}`} className="flex items-center gap-3 p-3 bg-background rounded-lg border">
                        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded bg-muted/50">
                          <Image src={item.image} alt={item.name} fill className="object-cover" sizes="64px" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm line-clamp-1">{item.name}</p>
                          <p className="text-sm text-muted-foreground">Qtd: {item.quantity}</p>
                        </div>
                        <span className="font-medium text-foreground">R$ {(item.price * item.quantity).toFixed(2)}</span>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Shipping Info */}
                <div className="space-y-3">
                  <h4 className="font-medium">Entrega</h4>
                  {order.shipping ? (
                    <div className="space-y-2 p-3 bg-background rounded-lg border">
                      <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{order.shipping.carrier}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <p>Código: <span className="font-mono font-medium">{order.shipping.trackingCode}</span></p>
                        <p>Previsão: {new Date(order.shipping.estimatedDelivery).toLocaleDateString('pt-BR')}</p>
                      </div>
                      <Button variant="outline" size="sm" className="w-full min-h-[44px]">
                        <Eye className="mr-2 h-3.5 w-3.5" />
                        Rastrear
                      </Button>
                    </div>
                  ) : (
                    <div className="p-3 bg-background rounded-lg border">
                      <Clock className="h-4 w-4 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">Pedido em processamento. Código de rastreio será enviado por e-mail.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-3 pt-4 border-t">
                {order.status === 'DELIVERED' && (
                  <>
                    <Button variant="outline" className="flex-1 sm:flex-none min-h-[44px]">
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Comprar novamente
                    </Button>
                    <Button variant="outline" className="flex-1 sm:flex-none min-h-[44px]">
                      <Star className="mr-2 h-4 w-4" />
                      Avaliar produtos
                    </Button>
                  </>
                )}
                {['PAID', 'PROCESSING'].includes(order.status) && (
                  <Button variant="outline" className="flex-1 sm:flex-none min-h-[44px] text-destructive border-destructive/50 hover:bg-destructive/10">
                    <XCircle className="mr-2 h-4 w-4" />
                    Solicitar cancelamento
                  </Button>
                )}
                {order.status === 'SHIPPED' && (
                  <Button variant="outline" className="flex-1 sm:flex-none min-h-[44px]">
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Confirmar recebimento
                  </Button>
                )}
                <Link href={`/pedidos/${order.id}`}>
                  <Button variant="ghost" className="flex-1 sm:flex-none min-h-[44px]">
                    Ver detalhes
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function MeusPedidosPage() {
  const [activeTab, setActiveTab] = useState('all')
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)

  const handleTabChange = (value: string) => {
    setActiveTab(value as 'all' | 'processing' | 'delivered' | 'cancelled')
  }

  return (
    <div className="section safe-top safe-bottom pb-20">
      <div className="container-main">
        <div className="mb-8 animate-in">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Meus Pedidos</h1>
          <p className="text-muted-foreground">Acompanhe o status de todas as suas compras</p>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="animate-in">
          <TabsList className="flex w-full grid-cols-[repeat(4,auto)] gap-1 p-1 scrollbar-hide" role="tablist" aria-label="Filtros de pedidos">
            {tabs.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id} className="px-3 py-2 text-sm">{tab.label}</TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="all" className="mt-6 space-y-4">
            {mockOrders.map((order) => (
              <OrderCard key={order.id} order={order} expandedOrder={expandedOrder} setExpandedOrder={setExpandedOrder} />
            ))}
          </TabsContent>

          <TabsContent value="processing" className="mt-6 space-y-4">
            {mockOrders.filter(o => ['PENDING_PAYMENT', 'PAID', 'PROCESSING', 'SHIPPED'].includes(o.status)).map((order) => (
              <OrderCard key={order.id} order={order} expandedOrder={expandedOrder} setExpandedOrder={setExpandedOrder} />
            ))}
          </TabsContent>

          <TabsContent value="delivered" className="mt-6 space-y-4">
            {mockOrders.filter(o => o.status === 'DELIVERED').map((order) => (
              <OrderCard key={order.id} order={order} expandedOrder={expandedOrder} setExpandedOrder={setExpandedOrder} />
            ))}
          </TabsContent>

          <TabsContent value="cancelled" className="mt-6 space-y-4">
            <div className="text-center py-12 text-muted-foreground">
              <XCircle className="mx-auto h-12 w-12 mb-4 text-muted-400" />
              <p>Nenhum pedido cancelado</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function Star({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg className={className} {...props} viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}

function ChevronLeft({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg className={className} {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M15 18l-6-6 6-6" />
    </svg>
  )
}

function ChevronRight({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg className={className} {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 18l6-6-6-6" />
    </svg>
  )
}