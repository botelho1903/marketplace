'use client'

import { useState } from 'react'
import { Bell, Check, Mail, Truck, CreditCard, Star, AlertCircle, Tag, Clock, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

const mockNotifications = [
  { id: '1', type: 'order', title: 'Pedido confirmado', message: 'Seu pedido MP-2024-001234 foi confirmado e está sendo preparado.', time: '2 min atrás', read: false, icon: Check, color: 'text-success', bgColor: 'bg-success/10' },
  { id: '2', type: 'shipping', title: 'Pedido enviado', message: 'Seu pedido MP-2024-001235 foi enviado via Jadlog. Código: BR987654321BR', time: '1 hora atrás', read: false, icon: Truck, color: 'text-brand-600', bgColor: 'bg-brand-100' },
  { id: '3', type: 'payment', title: 'Pagamento aprovado', message: 'O pagamento do pedido MP-2024-001236 foi aprovado (PIX).', time: '3 horas atrás', read: true, icon: CreditCard, color: 'text-success', bgColor: 'bg-success/10' },
  { id: '4', type: 'promo', title: 'Oferta especial para você', message: 'Cupom BEMVINDO10: 10% OFF na sua próxima compra acima de R$ 50.', time: '1 dia atrás', read: true, icon: Tag, color: 'text-brand-600', bgColor: 'bg-brand-100' },
  { id: '5', type: 'review', title: 'Avalie sua compra', message: 'Como foi sua experiência com o Smartphone Galaxy S24 Ultra?', time: '2 dias atrás', read: false, icon: Star, color: 'text-warning', bgColor: 'bg-warning/10' },
  { id: '6', type: 'system', title: 'Atualização de política', message: 'Nossos Termos de Uso foram atualizados. Confira as novidades.', time: '5 dias atrás', read: true, icon: AlertCircle, color: 'text-info', bgColor: 'bg-info/10' },
  { id: '7', type: 'order', title: 'Entrega realizada', message: 'Seu pedido MP-2024-001234 foi entregue com sucesso.', time: '1 semana atrás', read: true, icon: Check, color: 'text-success', bgColor: 'bg-success/10' },
]

const tabs = [
  { id: 'all', label: `Todas (${mockNotifications.length})` },
  { id: 'unread', label: `Não lidas (${mockNotifications.filter(n => !n.read).length})` },
  { id: 'orders', label: `Pedidos (${mockNotifications.filter(n => n.type === 'order' || n.type === 'shipping').length})` },
  { id: 'promos', label: `Promoções (${mockNotifications.filter(n => n.type === 'promo').length})` },
]

export default function NotificacoesPage() {
  const [activeTab, setActiveTab] = useState('all')
  const [notifications, setNotifications] = useState(mockNotifications)

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'unread') return !n.read
    if (activeTab === 'orders') return ['order', 'shipping'].includes(n.type)
    if (activeTab === 'promos') return n.type === 'promo'
    return true
  })

  return (
    <div className="section">
      <div className="container-main">
        <div className="flex items-center justify-between mb-8 animate-in">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-1">Notificações</h1>
            <p className="text-muted-foreground">Acompanhe novidades, pedidos e promoções</p>
          </div>
          {notifications.some(n => !n.read) && (
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              <Check className="mr-2 h-4 w-4" />
              Marcar todas como lidas
            </Button>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="animate-in">
          <TabsList className="grid w-full grid-cols-4">
            {tabs.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id}>{tab.label}</TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <NotificationList notifications={filteredNotifications} onMarkAsRead={markAsRead} onDelete={deleteNotification} />
          </TabsContent>
          <TabsContent value="unread" className="mt-6">
            <NotificationList notifications={filteredNotifications} onMarkAsRead={markAsRead} onDelete={deleteNotification} />
          </TabsContent>
          <TabsContent value="orders" className="mt-6">
            <NotificationList notifications={filteredNotifications} onMarkAsRead={markAsRead} onDelete={deleteNotification} />
          </TabsContent>
          <TabsContent value="promos" className="mt-6">
            <NotificationList notifications={filteredNotifications} onMarkAsRead={markAsRead} onDelete={deleteNotification} />
          </TabsContent>
        </Tabs>

        {filteredNotifications.length === 0 && (
          <div className="text-center py-12 animate-in">
            <Bell className="mx-auto h-12 w-12 text-muted-400 mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">Nenhuma notificação</h2>
            <p className="text-muted-foreground">Tudo em dia! Novas notificações aparecerão aqui.</p>
          </div>
        )}
      </div>
    </div>
  )
}

function NotificationList({ notifications, onMarkAsRead, onDelete }: { notifications: any[]; onMarkAsRead: (id: string) => void; onDelete: (id: string) => void }) {
  return (
    <div className="space-y-3">
      {notifications.map((notification) => (
        <Card
          key={notification.id}
          className={cn('border-muted/50 transition-colors', !notification.read && 'ring-1 ring-brand-500/20 bg-brand-50/50')}
        >
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className={cn('p-2.5 rounded-lg flex-shrink-0', notification.bgColor)}>
                <notification.icon className={cn('h-5 w-5', notification.color)} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h4 className={cn('font-medium text-foreground', !notification.read && 'font-semibold')}>
                    {notification.title}
                  </h4>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{notification.time}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
              </div>
              <div className="flex items-center gap-1">
                {!notification.read && (
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onMarkAsRead(notification.id)} aria-label="Marcar como lida">
                    <Check className="h-4 w-4 text-success" />
                  </Button>
                )}
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-400 hover:text-destructive" onClick={() => onDelete(notification.id)} aria-label="Excluir notificação">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}