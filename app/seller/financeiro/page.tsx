'use client'

import { DollarSign, CreditCard, TrendingUp, AlertTriangle, Clock, CheckCircle2, Download, Wallet, ArrowUpRight, ArrowDownRight, Plus } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

const transactions = [
  { id: '1', type: 'sale', description: 'Venda: Smartphone Galaxy S24 Ultra', amount: 5999.00, status: 'COMPLETED', date: '2024-01-24T10:30:00Z', orderId: 'MP-2024-001234' },
  { id: '2', type: 'sale', description: 'Venda: Tênis Nike Air Max 270', amount: 549.99, status: 'COMPLETED', date: '2024-01-23T14:20:00Z', orderId: 'MP-2024-001235' },
  { id: '3', type: 'commission', description: 'Comissão Marketplace (10%)', amount: -654.90, status: 'COMPLETED', date: '2024-01-23T14:20:00Z', orderId: 'MP-2024-001234' },
  { id: '4', type: 'payout', description: 'Saque para conta bancária', amount: -5000.00, status: 'COMPLETED', date: '2024-01-22T09:00:00Z', orderId: null },
  { id: '5', type: 'sale', description: 'Venda: Kit Skincare Completo', amount: 229.90, status: 'PENDING', date: '2024-01-24T16:45:00Z', orderId: 'MP-2024-001238' },
  { id: '6', type: 'fee', description: 'Taxa de anúncio premium', amount: -99.00, status: 'COMPLETED', date: '2024-01-20T00:00:00Z', orderId: null },
]

const summary = {
  available: 12450.50,
  pending: 3450.75,
  totalSales: 45230.00,
  totalCommission: 4523.00,
  totalPayouts: 28000.00,
}

export default function SellerFinanceiroPage() {
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <div className="section">
      <div className="container-main">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 animate-in">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Financeiro</h1>
            <p className="text-muted-foreground">Gerencie seus saldos, saques e extratos</p>
          </div>
          <Button variant="outline"><Download className="mr-2 h-4 w-4" />Exportar Extrato</Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-in stagger-1">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Disponível para saque</p>
                  <p className="text-2xl font-bold text-success mt-1">R$ {summary.available.toFixed(2)}</p>
                </div>
                <div className="p-3 rounded-xl bg-success/10 text-success"><Wallet className="h-6 w-6" /></div>
              </div>
              <Button className="mt-4 w-full" size="sm">
                <ArrowUpRight className="mr-2 h-4 w-4" />
                Solicitar saque
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pendente (14 dias)</p>
                  <p className="text-2xl font-bold text-warning mt-1">R$ {summary.pending.toFixed(2)}</p>
                </div>
                <div className="p-3 rounded-xl bg-warning/10 text-warning"><Clock className="h-6 w-6" /></div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Vendas do mês</p>
                  <p className="text-2xl font-bold text-foreground mt-1">R$ {summary.totalSales.toFixed(2)}</p>
                </div>
                <div className="p-3 rounded-xl bg-brand-100 text-brand-600"><TrendingUp className="h-6 w-6" /></div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Comissão do mês</p>
                  <p className="text-2xl font-bold text-muted-foreground mt-1">R$ {summary.totalCommission.toFixed(2)}</p>
                </div>
                <div className="p-3 rounded-xl bg-muted text-muted-foreground"><CreditCard className="h-6 w-6" /></div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="animate-in stagger-2">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Resumo</TabsTrigger>
            <TabsTrigger value="transactions">Extrato</TabsTrigger>
            <TabsTrigger value="payouts">Saques</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6 space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Payout Form */}
              <Card>
                <CardHeader>
                  <CardTitle>Solicitar Saque</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-success/5 border border-success/20 rounded-lg">
                    <p className="text-sm text-success">Disponível: <span className="font-medium">R$ {summary.available.toFixed(2)}</span></p>
                    <p className="text-xs text-muted-foreground mt-1">Mínimo para saque: R$ 50,00 • Processamento em até 2 dias úteis</p>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="payoutAmount">Valor do saque</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">R$</span>
                      <Input id="payoutAmount" type="number" placeholder="0,00" className="pl-8" step="0.01" min="50" max={summary.available} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Conta bancária</Label>
                    <Select defaultValue="1">
                      <SelectTrigger><SelectValue placeholder="Selecione a conta" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Banco do Brasil •••• 1234 (CPF: 123.456.789-00)</SelectItem>
                        <SelectItem value="2">Nubank •••• 5678 (CPF: 123.456.789-00)</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm" className="w-full"><Plus className="mr-2 h-4 w-4" />Adicionar nova conta</Button>
                  </div>
                  <Button className="w-full" disabled={summary.available < 50}>
                    <ArrowUpRight className="mr-2 h-4 w-4" />
                    Confirmar saque
                  </Button>
                </CardContent>
              </Card>

              {/* Next Payout */}
              <Card>
                <CardHeader>
                  <CardTitle>Próximo Pagamento Automático</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-brand-50 border border-brand-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-brand-700">Pagamento semanal</p>
                        <p className="text-sm text-brand-600">Próximo: Quarta-feira, 29 de Janeiro</p>
                      </div>
                      <Badge variant="secondary" className="bg-brand-100 text-brand-700">Agendado</Badge>
                    </div>
                    <p className="text-sm text-brand-600">Valor estimado: <span className="font-bold">R$ {summary.pending.toFixed(2)}</span></p>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between"><span>Vendas pendentes</span><span className="font-medium">R$ {summary.pending.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span>Comissão estimada (10%)</span><span className="font-medium text-muted-foreground">-R$ {(summary.pending * 0.1).toFixed(2)}</span></div>
                    <div className="flex justify-between"><span>Taxa de saque</span><span className="font-medium text-muted-foreground">-R$ 0,00</span></div>
                    <Separator />
                    <div className="flex justify-between text-lg font-bold"><span>Líquido a receber</span><span className="text-success">R$ {(summary.pending * 0.9).toFixed(2)}</span></div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sales Chart Placeholder */}
            <Card>
              <CardHeader>
                <CardTitle>Vendas dos Últimos 30 Dias</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-muted/50 rounded-lg">
                  <div className="text-center">
                    <TrendingUp className="mx-auto h-12 w-12 text-muted-400 mb-3" />
                    <p className="text-muted-foreground">Gráfico de vendas será implementado com Recharts</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions" className="mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Extrato de Transações</CardTitle>
                <div className="flex items-center gap-2">
                  <Select defaultValue="all">
                    <SelectTrigger className="w-40"><SelectValue placeholder="Tipo" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="sale">Vendas</SelectItem>
                      <SelectItem value="commission">Comissões</SelectItem>
                      <SelectItem value="payout">Saques</SelectItem>
                      <SelectItem value="fee">Taxas</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select defaultValue="all">
                    <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="COMPLETED">Concluídas</SelectItem>
                      <SelectItem value="PENDING">Pendentes</SelectItem>
                      <SelectItem value="FAILED">Falhou</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-left text-sm text-muted-foreground">
                        <th className="pb-3 font-medium">Data</th>
                        <th className="pb-3 font-medium">Tipo</th>
                        <th className="pb-3 font-medium">Descrição</th>
                        <th className="pb-3 font-medium">Pedido</th>
                        <th className="pb-3 font-medium text-right">Valor</th>
                        <th className="pb-3 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((tx) => (
                        <tr key={tx.id} className="border-b hover:bg-muted/50">
                          <td className="py-4 text-sm text-muted-foreground">{new Date(tx.date).toLocaleString('pt-BR')}</td>
                          <td className="py-4">
                            <Badge variant="outline" className={cn(
                              tx.type === 'sale' ? 'bg-success/10 text-success' :
                              tx.type === 'commission' ? 'bg-warning/10 text-warning' :
                              tx.type === 'payout' ? 'bg-info/10 text-info' :
                              'bg-muted text-muted-foreground'
                            )}>
                              {tx.type === 'sale' ? 'Venda' : tx.type === 'commission' ? 'Comissão' : tx.type === 'payout' ? 'Saque' : 'Taxa'}
                            </Badge>
                          </td>
                          <td className="py-4">{tx.description}</td>
                          <td className="py-4 text-sm font-mono text-muted-foreground">{tx.orderId || '—'}</td>
                          <td className="py-4 text-right font-medium" style={{ color: tx.amount >= 0 ? 'var(--success)' : 'var(--destructive)' }}>
                            {tx.amount >= 0 ? '+' : ''}R$ {Math.abs(tx.amount).toFixed(2)}
                          </td>
                          <td className="py-4">
                            <Badge variant={tx.status === 'COMPLETED' ? 'default' : 'outline'} className={tx.status === 'COMPLETED' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}>
                              {tx.status === 'COMPLETED' ? 'Concluído' : 'Pendente'}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payouts" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Saques</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-left text-sm text-muted-foreground">
                        <th className="pb-3 font-medium">Data</th>
                        <th className="pb-3 font-medium">Valor</th>
                        <th className="pb-3 font-medium">Conta Destino</th>
                        <th className="pb-3 font-medium">Status</th>
                        <th className="pb-3 font-medium">Processado em</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { date: '2024-01-22', amount: 5000.00, account: 'Banco do Brasil •••• 1234', status: 'COMPLETED', processed: '2024-01-23' },
                        { date: '2024-01-15', amount: 3000.00, account: 'Nubank •••• 5678', status: 'COMPLETED', processed: '2024-01-16' },
                        { date: '2024-01-08', amount: 2500.00, account: 'Banco do Brasil •••• 1234', status: 'COMPLETED', processed: '2024-01-09' },
                      ].map((payout, i) => (
                        <tr key={i} className="border-b hover:bg-muted/50">
                          <td className="py-4">{new Date(payout.date).toLocaleDateString('pt-BR')}</td>
                          <td className="py-4 font-medium">R$ {payout.amount.toFixed(2)}</td>
                          <td className="py-4 text-sm text-muted-foreground">{payout.account}</td>
                          <td className="py-4">
                            <Badge variant="default" className="bg-success/10 text-success">
                              <CheckCircle2 className="mr-1.5 h-3 w-3" />{payout.status === 'COMPLETED' ? 'Concluído' : 'Processando'}
                            </Badge>
                          </td>
                          <td className="py-4 text-sm text-muted-foreground">{new Date(payout.processed).toLocaleDateString('pt-BR')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

// Label component
function Label({ htmlFor, children, className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement> & { className?: string }) {
  return <label htmlFor={htmlFor} className={cn('text-sm font-medium text-foreground', className)} {...props}>{children}</label>
}