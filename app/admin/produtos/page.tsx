'use client'

import { Search, Filter, Package, Eye, Edit, Trash2, AlertTriangle, CheckCircle2, MoreHorizontal, Flag, Shield, Download } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

const products = [
  { id: '1', name: 'Smartphone Galaxy S24 Ultra 256GB', sku: 'SAM-S24U-256-BK', seller: 'Loja do João', sellerId: '2', price: 5999.00, stock: 45, status: 'ACTIVE', sales: 124, rating: 4.8, category: 'Eletrônicos', createdAt: '2023-10-15', flagged: false },
  { id: '2', name: 'Notebook Dell XPS 13 Plus Intel i7', sku: 'DEL-XPS13P-I7-16-512', seller: 'Pedro Tech', sellerId: '4', price: 7799.00, stock: 8, status: 'PENDING_REVIEW', sales: 0, rating: 0, category: 'Eletrônicos', createdAt: '2024-01-20', flagged: false },
  { id: '3', name: 'Tênis Nike Air Max 270 Masculino', sku: 'NIKE-AM270-M-42-BK', seller: 'Loja do João', sellerId: '2', price: 549.99, stock: 0, status: 'ACTIVE', sales: 89, rating: 4.7, category: 'Moda Masculina', createdAt: '2023-08-22', flagged: true },
  { id: '4', name: 'Sofá 3 Lugares Retrátil Veludo Cinza', sku: 'SOFA-3L-RET-VEL-CZ', seller: 'Casa & Conforto', sellerId: '9', price: 1899.00, stock: 5, status: 'ACTIVE', sales: 12, rating: 4.6, category: 'Casa & Decoração', createdAt: '2023-11-05', flagged: false },
  { id: '5', name: 'Kit Skincare Completo', sku: 'SKIN-KIT-4PASSOS', seller: 'Beleza da Fer', sellerId: '7', price: 229.90, stock: 150, status: 'ACTIVE', sales: 345, rating: 4.9, category: 'Beleza & Perfumaria', createdAt: '2023-09-12', flagged: false },
  { id: '6', name: 'Smart TV 55" 4K QLED Samsung Q60C', sku: 'SAM-TV55-Q60C', seller: 'Loja do João', sellerId: '2', price: 2799.00, stock: 18, status: 'REJECTED', sales: 0, rating: 0, category: 'Eletrônicos', createdAt: '2024-01-18', flagged: false },
  { id: '7', name: 'Fone Bluetooth JBL Tune 510BT', sku: 'JBL-T510BT-BK', seller: 'Pedro Tech', sellerId: '4', price: 249.90, stock: 32, status: 'PENDING_REVIEW', sales: 0, rating: 0, category: 'Eletrônicos', createdAt: '2024-01-22', flagged: false },
  { id: '8', name: 'Cadeira Gamer RGB Ergonômica', sku: 'GAMER-CHAIR-RGB-BK', seller: 'Casa & Conforto', sellerId: '9', price: 899.00, stock: 15, status: 'ACTIVE', sales: 67, rating: 4.5, category: 'Casa & Decoração', createdAt: '2023-12-01', flagged: false },
]

const statusConfig = {
  ACTIVE: { label: 'Ativo', color: 'bg-success/10 text-success' },
  INACTIVE: { label: 'Inativo', color: 'bg-muted text-muted-foreground' },
  OUT_OF_STOCK: { label: 'Sem estoque', color: 'bg-destructive/10 text-destructive' },
  DRAFT: { label: 'Rascunho', color: 'bg-warning/10 text-warning' },
  PENDING_REVIEW: { label: 'Em análise', color: 'bg-info/10 text-info' },
  REJECTED: { label: 'Rejeitado', color: 'bg-destructive/10 text-destructive' },
}

const tabs = [
  { id: 'all', label: `Todos (${products.length})` },
  { id: 'active', label: `Ativos (${products.filter(p => p.status === 'ACTIVE').length})` },
  { id: 'pending', label: `Em análise (${products.filter(p => p.status === 'PENDING_REVIEW').length})` },
  { id: 'rejected', label: `Rejeitados (${products.filter(p => p.status === 'REJECTED').length})` },
  { id: 'flagged', label: `Denunciados (${products.filter(p => p.flagged).length})` },
  { id: 'out_of_stock', label: `Sem estoque (${products.filter(p => p.stock === 0).length})` },
]

// Mobile Card Component
function ProductCard({ product }: { product: typeof products[0] }) {
  const config = statusConfig[product.status as keyof typeof statusConfig]
  const stockColor = product.stock === 0 ? 'text-destructive' : product.stock < 10 ? 'text-warning' : 'text-success'

  return (
    <div key={product.id} className="p-4 border rounded-lg bg-muted/50">
      <div className="flex items-start gap-3 mb-3">
        <div className="h-14 w-14 rounded bg-muted/50 flex items-center justify-center shrink-0">
          <Package className="h-7 w-7 text-muted-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{product.name}</p>
          <p className="text-xs text-muted-foreground font-mono">SKU: {product.sku}</p>
          {product.flagged && <Badge variant="destructive" className="mt-1 inline-flex items-center gap-1"><Flag className="h-3 w-3" />Denunciado</Badge>}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3 text-sm mb-3">
        <div>
          <p className="text-muted-foreground">Vendedor</p>
          <p className="font-medium truncate">{product.seller}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Categoria</p>
          <p className="font-medium truncate">{product.category}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Preço</p>
          <p className="font-medium">R$ {product.price.toFixed(2)}</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3 text-sm mb-3">
        <div>
          <p className="text-muted-foreground">Estoque</p>
          <p className={cn('font-medium', stockColor)}>{product.stock}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Vendas</p>
          <p className="font-medium">{product.sales}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Avaliação</p>
          <p className="font-medium flex items-center justify-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            {product.rating || '—'}
          </p>
        </div>
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-muted/50">
        <Badge variant="outline" className={config?.color}>{config?.label}</Badge>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-10 w-10 min-h-[44px] min-w-[44px]"><Eye className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" className="h-10 w-10 min-h-[44px] min-w-[44px]"><Edit className="h-4 w-4" /></Button>
          {product.status === 'PENDING_REVIEW' && (
            <>
              <Button variant="ghost" size="icon" className="h-10 w-10 min-h-[44px] min-w-[44px] text-success hover:text-success" title="Aprovar"><CheckCircle2 className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" className="h-10 w-10 min-h-[44px] min-w-[44px] text-destructive hover:text-destructive" title="Rejeitar"><XCircle className="h-4 w-4" /></Button>
            </>
          )}
          {product.flagged && (
            <Button variant="ghost" size="icon" className="h-10 w-10 min-h-[44px] min-w-[44px] text-warning hover:text-warning" title="Revisar denúncia"><Flag className="h-4 w-4" /></Button>
          )}
          <Button variant="ghost" size="icon" className="h-10 w-10 min-h-[44px] min-w-[44px] text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
        </div>
      </div>
    </div>
  )
}

export default function AdminProdutosPage() {
  const [activeTab, setActiveTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredProducts = products.filter(p => {
    if (activeTab === 'active' && p.status !== 'ACTIVE') return false
    if (activeTab === 'pending' && p.status !== 'PENDING_REVIEW') return false
    if (activeTab === 'rejected' && p.status !== 'REJECTED') return false
    if (activeTab === 'flagged' && !p.flagged) return false
    if (activeTab === 'out_of_stock' && p.stock > 0) return false
    if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase()) && !p.sku.toLowerCase().includes(searchQuery.toLowerCase()) && !p.seller.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  const handleTabChange = (value: string) => {
    setActiveTab(value as 'all' | 'active' | 'pending' | 'rejected' | 'flagged' | 'out_of_stock')
  }

  return (
    <div className="section safe-top safe-bottom pb-20">
      <div className="container-main">
        <div className="flex flex-col gap-4 mb-6 animate-in">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Gerenciar Produtos</h1>
            <p className="text-sm text-muted-foreground mt-1">Modere e gerencie todos os produtos da plataforma</p>
          </div>
          <Button variant="outline" className="w-full sm:w-auto justify-center min-h-[44px]"><Download className="mr-2 h-4 w-4" />Exportar Relatório</Button>
        </div>

        {/* Stats Cards - 2 per row on mobile, 4 on desktop */}
        <div className="grid grid-cols-2 gap-4 mb-6 animate-in stagger-1">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total de Produtos</p>
                  <p className="text-2xl font-bold">{products.length}</p>
                </div>
                <div className="p-3 rounded-xl bg-blue-100 text-blue-600"><Package className="h-6 w-6" /></div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Em Análise</p>
                  <p className="text-2xl font-bold">{products.filter(p => p.status === 'PENDING_REVIEW').length}</p>
                </div>
                <div className="p-3 rounded-xl bg-info/10 text-info"><Clock className="h-6 w-6" /></div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Denunciados</p>
                  <p className="text-2xl font-bold">{products.filter(p => p.flagged).length}</p>
                </div>
                <div className="p-3 rounded-xl bg-warning/10 text-warning"><Flag className="h-6 w-6" /></div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Rejeitados</p>
                  <p className="text-2xl font-bold">{products.filter(p => p.status === 'REJECTED').length}</p>
                </div>
                <div className="p-3 rounded-xl bg-destructive/10 text-destructive"><XCircle className="h-6 w-6" /></div>
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
                <Input placeholder="Buscar por nome, SKU, vendedor..." className="pl-10 min-h-[44px]" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="w-full sm:w-48 min-h-[44px]"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="ACTIVE">Ativos</SelectItem>
                  <SelectItem value="INACTIVE">Inativos</SelectItem>
                  <SelectItem value="PENDING_REVIEW">Em análise</SelectItem>
                  <SelectItem value="REJECTED">Rejeitados</SelectItem>
                  <SelectItem value="DRAFT">Rascunhos</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="all">
                <SelectTrigger className="w-full sm:w-48 min-h-[44px]"><SelectValue placeholder="Categoria" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="eletronicos">Eletrônicos</SelectItem>
                  <SelectItem value="moda">Moda</SelectItem>
                  <SelectItem value="casa">Casa & Decoração</SelectItem>
                  <SelectItem value="beleza">Beleza</SelectItem>
                  <SelectItem value="esportes">Esportes</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="w-full sm:w-auto justify-center min-h-[44px]"><Filter className="mr-2 h-4 w-4" />Filtros avançados</Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabs - Horizontal scroll on mobile */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="animate-in">
          <TabsList className="flex w-full grid-cols-[repeat(6,auto)] gap-1 p-1 scrollbar-hide" role="tablist" aria-label="Filtros de produtos">
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
                          <th className="pb-3 font-medium">Produto</th>
                          <th className="pb-3 font-medium">Vendedor</th>
                          <th className="pb-3 font-medium hidden md:table-cell">Categoria</th>
                          <th className="pb-3 font-medium text-right hidden md:table-cell">Preço</th>
                          <th className="pb-3 font-medium text-center hidden md:table-cell">Estoque</th>
                          <th className="pb-3 font-medium">Status</th>
                          <th className="pb-3 font-medium text-center hidden lg:table-cell">Vendas</th>
                          <th className="pb-3 font-medium text-center hidden lg:table-cell">Avaliação</th>
                          <th className="pb-3 font-medium hidden lg:table-cell">Cadastro</th>
                          <th className="pb-3 font-medium text-right">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredProducts.map((product) => {
                          const config = statusConfig[product.status as keyof typeof statusConfig]
                          return (
                            <tr key={product.id} className="border-b hover:bg-muted/50">
                              <td className="py-4">
                                <div className="flex items-center gap-3">
                                  <div className="h-12 w-12 rounded bg-muted/50 flex items-center justify-center">
                                    <Package className="h-6 w-6 text-muted-400" />
                                  </div>
                                  <div>
                                    <p className="font-medium">{product.name}</p>
                                    <p className="text-xs font-mono text-muted-foreground">SKU: {product.sku}</p>
                                    {product.flagged && <Badge variant="destructive" className="mt-1"><Flag className="mr-1 h-3 w-3" />Denunciado</Badge>}
                                  </div>
                                </div>
                              </td>
                              <td className="py-4">
                                <div>
                                  <p className="font-medium">{product.seller}</p>
                                  <p className="text-sm text-muted-foreground">ID: {product.sellerId}</p>
                                </div>
                              </td>
                              <td className="py-4 hidden md:table-cell text-sm">{product.category}</td>
                              <td className="py-4 text-right hidden md:table-cell font-medium">R$ {product.price.toFixed(2)}</td>
                              <td className="py-4 text-center hidden md:table-cell">
                                <span className={cn('font-medium', product.stock === 0 ? 'text-destructive' : product.stock < 10 ? 'text-warning' : 'text-success')}>
                                  {product.stock}
                                </span>
                              </td>
                              <td className="py-4">
                                <Badge variant="outline" className={cn(config?.color)}>
                                  {config?.label}
                                </Badge>
                              </td>
                              <td className="py-4 text-center hidden lg:table-cell">{product.sales}</td>
                              <td className="py-4 text-center hidden lg:table-cell">
                                <div className="flex items-center justify-center gap-1">
                                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                  <span>{product.rating || '—'}</span>
                                </div>
                              </td>
                              <td className="py-4 hidden lg:table-cell text-sm text-muted-foreground">
                                {new Date(product.createdAt).toLocaleDateString('pt-BR')}
                              </td>
                              <td className="py-4 text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <Button variant="ghost" size="icon" className="h-8 w-8"><Eye className="h-4 w-4" /></Button>
                                  <Button variant="ghost" size="icon" className="h-8 w-8"><Edit className="h-4 w-4" /></Button>
                                  {product.status === 'PENDING_REVIEW' && (
                                    <>
                                      <Button variant="ghost" size="icon" className="h-8 w-8 text-success hover:text-success" title="Aprovar"><CheckCircle2 className="h-4 w-4" /></Button>
                                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" title="Rejeitar"><XCircle className="h-4 w-4" /></Button>
                                    </>
                                  )}
                                  {product.flagged && (
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-warning hover:text-warning" title="Revisar denúncia"><Flag className="h-4 w-4" /></Button>
                                  )}
                                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Cards */}
                  <div className="lg:hidden space-y-3 p-1">
                    {filteredProducts.map(product => <ProductCard key={product.id} product={product} />)}
                  </div>

                  {filteredProducts.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      <Package className="mx-auto h-12 w-12 mb-3 text-muted-400" />
                      <p>Nenhum produto encontrado</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>

        {/* Pagination */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in stagger-2">
          <p className="text-sm text-muted-foreground">Mostrando 1 a {filteredProducts.length} de {filteredProducts.length} produtos</p>
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

function Star({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg className={className} {...props} viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}

function XCircle({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg className={className} {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M15 9l-6 6" />
      <path d="M9 9l6 6" />
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

function Clock({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg className={className} {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  )
}