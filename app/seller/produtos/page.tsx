'use client'

import Link from 'next/link'
import { Plus, Search, Filter, Package, Edit, Trash2, Eye, AlertTriangle, CheckCircle2, MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

const products = [
  { id: '1', name: 'Smartphone Galaxy S24 Ultra 256GB', sku: 'SAM-S24U-256-BK', price: 5999.00, stock: 45, status: 'ACTIVE', sales: 124, rating: 4.8, category: 'Eletrônicos' },
  { id: '2', name: 'Notebook Dell XPS 13 Plus Intel i7', sku: 'DEL-XPS13P-I7-16-512', price: 7799.00, stock: 8, status: 'ACTIVE', sales: 23, rating: 4.9, category: 'Eletrônicos' },
  { id: '3', name: 'Tênis Nike Air Max 270 Masculino', sku: 'NIKE-AM270-M-42-BK', price: 549.99, stock: 0, status: 'OUT_OF_STOCK', sales: 89, rating: 4.7, category: 'Moda Masculina' },
  { id: '4', name: 'Sofá 3 Lugares Retrátil Veludo Cinza', sku: 'SOFA-3L-RET-VEL-CZ', price: 1899.00, stock: 5, status: 'ACTIVE', sales: 12, rating: 4.6, category: 'Casa & Decoração' },
  { id: '5', name: 'Kit Skincare Completo', sku: 'SKIN-KIT-4PASSOS', price: 229.90, stock: 150, status: 'ACTIVE', sales: 345, rating: 4.9, category: 'Beleza & Perfumaria' },
  { id: '6', name: 'Smart TV 55" 4K QLED Samsung Q60C', sku: 'SAM-TV55-Q60C', price: 2799.00, stock: 18, status: 'ACTIVE', sales: 67, rating: 4.5, category: 'Eletrônicos' },
]

const statusConfig = {
  ACTIVE: { label: 'Ativo', color: 'bg-success/10 text-success' },
  INACTIVE: { label: 'Inativo', color: 'bg-muted text-muted-foreground' },
  OUT_OF_STOCK: { label: 'Sem estoque', color: 'bg-destructive/10 text-destructive' },
  DRAFT: { label: 'Rascunho', color: 'bg-warning/10 text-warning' },
  PENDING_REVIEW: { label: 'Em análise', color: 'bg-info/10 text-info' },
  REJECTED: { label: 'Rejeitado', color: 'bg-destructive/10 text-destructive' },
}

export default function SellerProdutosPage() {
  return (
    <div className="section">
      <div className="container-main">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 animate-in">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Meus Produtos</h1>
            <p className="text-muted-foreground">Gerencie o catálogo da sua loja</p>
          </div>
          <Link href="/seller/produtos/novo">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Produto
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <Card className="mb-6 animate-in">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Buscar por nome, SKU..." className="pl-10" />
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="w-48"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="ACTIVE">Ativos</SelectItem>
                  <SelectItem value="INACTIVE">Inativos</SelectItem>
                  <SelectItem value="OUT_OF_STOCK">Sem estoque</SelectItem>
                  <SelectItem value="DRAFT">Rascunhos</SelectItem>
                  <SelectItem value="PENDING_REVIEW">Em análise</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="all">
                <SelectTrigger className="w-48"><SelectValue placeholder="Categoria" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="eletronicos">Eletrônicos</SelectItem>
                  <SelectItem value="moda">Moda</SelectItem>
                  <SelectItem value="casa">Casa & Decoração</SelectItem>
                  <SelectItem value="beleza">Beleza</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline"><Filter className="mr-2 h-4 w-4" />Filtros</Button>
            </div>
          </CardContent>
        </Card>

        {/* Products Table */}
        <Card className="animate-in stagger-1">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Lista de Produtos ({products.length})</CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Ordenar por:</span>
              <Select defaultValue="newest">
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Mais recentes</SelectItem>
                  <SelectItem value="name">Nome A-Z</SelectItem>
                  <SelectItem value="price_asc">Preço menor</SelectItem>
                  <SelectItem value="price_desc">Preço maior</SelectItem>
                  <SelectItem value="stock">Estoque</SelectItem>
                  <SelectItem value="sales">Mais vendidos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm text-muted-foreground">
                    <th className="pb-3 font-medium">Produto</th>
                    <th className="pb-3 font-medium">SKU</th>
                    <th className="pb-3 font-medium">Categoria</th>
                    <th className="pb-3 font-medium text-right">Preço</th>
                    <th className="pb-3 font-medium text-center">Estoque</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium text-center">Vendas</th>
                    <th className="pb-3 font-medium text-center">Avaliação</th>
                    <th className="pb-3 font-medium text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => {
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
                            </div>
                          </div>
                        </td>
                        <td className="py-4 text-sm font-mono text-muted-foreground">{product.sku}</td>
                        <td className="py-4 text-sm">{product.category}</td>
                        <td className="py-4 text-right font-medium">R$ {product.price.toFixed(2)}</td>
                        <td className="py-4 text-center">
                          <span className={cn('font-medium', product.stock === 0 ? 'text-destructive' : product.stock < 10 ? 'text-warning' : 'text-success')}>
                            {product.stock}
                          </span>
                        </td>
                        <td className="py-4">
                          <Badge variant="outline" className={cn(config?.color)}>
                            {config?.label}
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
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="mt-6 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Mostrando 1 a 6 de 24 produtos</p>
              <nav className="flex items-center gap-2">
                <Button variant="outline" size="icon" disabled><ChevronLeft className="h-4 w-4" /></Button>
                <Button variant="default" size="icon" className="w-10" aria-current="page">1</Button>
                <Button variant="outline" size="icon" className="w-10">2</Button>
                <Button variant="outline" size="icon" className="w-10">3</Button>
                <span className="px-2 text-muted-foreground">...</span>
                <Button variant="outline" size="icon" className="w-10">5</Button>
                <Button variant="outline" size="icon"><ChevronRight className="h-4 w-4" /></Button>
              </nav>
            </div>
          </CardContent>
        </Card>

        {/* Bulk Actions Bar (hidden by default, shows when items selected) */}
        <div className="mt-4 hidden" id="bulk-actions">
          <Card className="border-warning/50 bg-warning/5">
            <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-sm font-medium text-warning">3 produtos selecionados</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm"><Edit className="mr-2 h-4 w-4" />Editar em lote</Button>
                <Button variant="outline" size="sm" className="text-destructive border-destructive/50 hover:bg-destructive/10"><Trash2 className="mr-2 h-4 w-4" />Excluir</Button>
                <Button variant="ghost" size="sm" onClick={() => document.getElementById('bulk-actions')?.classList.add('hidden')}>Cancelar</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

// Star icon
function Star({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg className={className} {...props} viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}

// ChevronLeft icon
function ChevronLeft({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg className={className} {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M15 18l-6-6 6-6" />
    </svg>
  )
}

// ChevronRight icon
function ChevronRight({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg className={className} {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 18l6-6-6-6" />
    </svg>
  )
}