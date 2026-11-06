'use client'

import { Search, Filter, MoreHorizontal, Shield, Mail, Phone, Calendar, Ban, Eye, Edit } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Avatar } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

const users = [
  { id: '1', name: 'Maria Silva', email: 'maria@email.com', phone: '(11) 99999-1111', role: 'USER', status: 'ACTIVE', createdAt: '2023-06-15', lastLogin: '2024-01-24', orders: 12, totalSpent: 3450.00 },
  { id: '2', name: 'João Santos', email: 'joao@email.com', phone: '(11) 99999-2222', role: 'SELLER', status: 'ACTIVE', createdAt: '2023-08-22', lastLogin: '2024-01-24', orders: 0, totalSpent: 0, storeName: 'Loja do João' },
  { id: '3', name: 'Ana Costa', email: 'ana@email.com', phone: '(21) 98888-3333', role: 'USER', status: 'ACTIVE', createdAt: '2023-11-10', lastLogin: '2024-01-23', orders: 5, totalSpent: 890.50 },
  { id: '4', name: 'Pedro Oliveira', email: 'pedro@email.com', phone: '(31) 97777-4444', role: 'SELLER', status: 'PENDING_VERIFICATION', createdAt: '2024-01-20', lastLogin: '2024-01-22', orders: 0, totalSpent: 0, storeName: 'Pedro Tech' },
  { id: '5', name: 'Lucia Ferreira', email: 'lucia@email.com', phone: '(41) 96666-5555', role: 'USER', status: 'SUSPENDED', createdAt: '2023-04-05', lastLogin: '2023-12-10', orders: 23, totalSpent: 5670.00 },
  { id: '6', name: 'Lucas Lima', email: 'lucas@email.com', phone: '(51) 95555-6666', role: 'ADMIN', status: 'ACTIVE', createdAt: '2023-01-10', lastLogin: '2024-01-24', orders: 0, totalSpent: 0 },
  { id: '7', name: 'Fernanda Alves', email: 'fernanda@email.com', phone: '(62) 94444-7777', role: 'SELLER', status: 'ACTIVE', createdAt: '2023-09-12', lastLogin: '2024-01-24', orders: 0, totalSpent: 0, storeName: 'Beleza da Fer' },
  { id: '8', name: 'Ricardo Souza', email: 'ricardo@email.com', phone: '(71) 93333-8888', role: 'USER', status: 'ACTIVE', createdAt: '2024-01-05', lastLogin: '2024-01-24', orders: 2, totalSpent: 150.00 },
]

const roleConfig = {
  USER: { label: 'Comprador', color: 'bg-blue-100 text-blue-700', icon: User },
  SELLER: { label: 'Vendedor', color: 'bg-brand-100 text-brand-700', icon: Store },
  ADMIN: { label: 'Admin', color: 'bg-purple-100 text-purple-700', icon: Shield },
}

const statusConfig = {
  ACTIVE: { label: 'Ativo', color: 'bg-success/10 text-success' },
  PENDING_VERIFICATION: { label: 'Pendente verificação', color: 'bg-warning/10 text-warning' },
  SUSPENDED: { label: 'Suspenso', color: 'bg-destructive/10 text-destructive' },
  INACTIVE: { label: 'Inativo', color: 'bg-muted text-muted-foreground' },
}

const tabs = [
  { id: 'all', label: `Todos (${users.length})` },
  { id: 'buyers', label: `Compradores (${users.filter(u => u.role === 'USER').length})` },
  { id: 'sellers', label: `Vendedores (${users.filter(u => u.role === 'SELLER').length})` },
  { id: 'admins', label: `Admins (${users.filter(u => u.role === 'ADMIN').length})` },
  { id: 'pending', label: `Pendentes (${users.filter(u => u.status === 'PENDING_VERIFICATION').length})` },
  { id: 'suspended', label: `Suspensos (${users.filter(u => u.status === 'SUSPENDED').length})` },
]

function UserCard({ user }: { user: typeof users[0] }) {
  const role = roleConfig[user.role as keyof typeof roleConfig]
  const status = statusConfig[user.status as keyof typeof statusConfig]
  const RoleIcon = role?.icon || User

  return (
    <div key={user.id} className="p-4 border rounded-lg bg-muted/50">
      <div className="flex items-start gap-3 mb-3">
        <Avatar className="h-12 w-12 shrink-0" src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} alt={user.name} fallback={user.name.charAt(0)} />
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{user.name}</p>
          <p className="text-sm text-muted-foreground truncate">{user.email}</p>
          {user.phone && <p className="text-xs text-muted-foreground">{user.phone}</p>}
          {user.storeName && <p className="text-xs text-brand-600">🏪 {user.storeName}</p>}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3 text-sm mb-3">
        <div>
          <p className="text-muted-foreground">Função</p>
          <Badge variant="outline" className={cn('gap-1', role?.color)}>
            <RoleIcon className="h-3 w-3" />
            {role?.label}
          </Badge>
        </div>
        <div>
          <p className="text-muted-foreground">Status</p>
          <Badge variant="outline" className={status?.color}>{status?.label}</Badge>
        </div>
        <div>
          <p className="text-muted-foreground">Cadastro</p>
          <p className="font-medium">{new Date(user.createdAt).toLocaleDateString('pt-BR')}</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3 text-sm mb-3">
        <div>
          <p className="text-muted-foreground">Último login</p>
          <p className="font-medium">{new Date(user.lastLogin).toLocaleDateString('pt-BR')}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Pedidos</p>
          <p className="font-medium">{user.orders}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Total gasto</p>
          <p className="font-medium">R$ {user.totalSpent.toFixed(2)}</p>
        </div>
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-muted/50">
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-10 w-10 min-h-[44px] min-w-[44px]"><Eye className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" className="h-10 w-10 min-h-[44px] min-w-[44px]"><Edit className="h-4 w-4" /></Button>
        </div>
        <div className="flex items-center gap-1">
          {user.status === 'PENDING_VERIFICATION' && (
            <Button variant="ghost" size="icon" className="h-10 w-10 min-h-[44px] min-w-[44px] text-success hover:text-success"><Shield className="h-4 w-4" /></Button>
          )}
          {user.status === 'ACTIVE' && user.role !== 'ADMIN' && (
            <Button variant="ghost" size="icon" className="h-10 w-10 min-h-[44px] min-w-[44px] text-destructive hover:text-destructive"><Ban className="h-4 w-4" /></Button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function AdminUsuariosPage() {
  const [activeTab, setActiveTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredUsers = users.filter(u => {
    if (activeTab === 'buyers' && u.role !== 'USER') return false
    if (activeTab === 'sellers' && u.role !== 'SELLER') return false
    if (activeTab === 'admins' && u.role !== 'ADMIN') return false
    if (activeTab === 'pending' && u.status !== 'PENDING_VERIFICATION') return false
    if (activeTab === 'suspended' && u.status !== 'SUSPENDED') return false
    if (searchQuery && !u.name.toLowerCase().includes(searchQuery.toLowerCase()) && !u.email.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  const handleTabChange = (value: string) => {
    setActiveTab(value as 'all' | 'buyers' | 'sellers' | 'admins' | 'pending' | 'suspended')
  }

  return (
    <div className="section safe-top safe-bottom pb-20">
      <div className="container-main">
        <div className="flex flex-col gap-4 mb-6 animate-in">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Gerenciar Usuários</h1>
            <p className="text-sm text-muted-foreground mt-1">Administre usuários, vendedores e administradores</p>
          </div>
          <Button className="w-full sm:w-auto justify-center min-h-[44px]">
            <UserPlus className="mr-2 h-4 w-4" />
            Novo Usuário
          </Button>
        </div>

        {/* Stats Cards - 2 per row on mobile, 4 on desktop */}
        <div className="grid grid-cols-2 gap-4 mb-6 animate-in stagger-1">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total de Usuários</p>
                  <p className="text-2xl font-bold">{users.length}</p>
                </div>
                <div className="p-3 rounded-xl bg-blue-100 text-blue-600"><UserPlus className="h-6 w-6" /></div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Compradores Ativos</p>
                  <p className="text-2xl font-bold">{users.filter(u => u.role === 'USER' && u.status === 'ACTIVE').length}</p>
                </div>
                <div className="p-3 rounded-xl bg-green-100 text-green-600"><Activity className="h-6 w-6" /></div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Vendedores Ativos</p>
                  <p className="text-2xl font-bold">{users.filter(u => u.role === 'SELLER' && u.status === 'ACTIVE').length}</p>
                </div>
                <div className="p-3 rounded-xl bg-brand-100 text-brand-600"><Store className="h-6 w-6" /></div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pendentes Verificação</p>
                  <p className="text-2xl font-bold">{users.filter(u => u.status === 'PENDING_VERIFICATION').length}</p>
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
                <Input placeholder="Buscar por nome, e-mail..." className="pl-10 min-h-[44px]" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="w-full sm:w-48 min-h-[44px]"><SelectValue placeholder="Função" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="USER">Compradores</SelectItem>
                  <SelectItem value="SELLER">Vendedores</SelectItem>
                  <SelectItem value="ADMIN">Administradores</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="all">
                <SelectTrigger className="w-full sm:w-48 min-h-[44px]"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="ACTIVE">Ativos</SelectItem>
                  <SelectItem value="PENDING_VERIFICATION">Pendentes</SelectItem>
                  <SelectItem value="SUSPENDED">Suspensos</SelectItem>
                  <SelectItem value="INACTIVE">Inativos</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="w-full sm:w-auto justify-center min-h-[44px]"><Filter className="mr-2 h-4 w-4" />Mais filtros</Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabs - Horizontal scroll on mobile */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="animate-in">
          <TabsList className="flex w-full grid-cols-[repeat(6,auto)] gap-1 p-1 scrollbar-hide" role="tablist" aria-label="Filtros de usuários">
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
                          <th className="pb-3 font-medium">Usuário</th>
                          <th className="pb-3 font-medium">Função</th>
                          <th className="pb-3 font-medium">Status</th>
                          <th className="pb-3 font-medium hidden md:table-cell">Cadastro</th>
                          <th className="pb-3 font-medium hidden lg:table-cell">Último Login</th>
                          <th className="pb-3 font-medium text-right hidden md:table-cell">Pedidos</th>
                          <th className="pb-3 font-medium text-right hidden lg:table-cell">Total Gasto</th>
                          <th className="pb-3 font-medium text-right">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.map((user) => {
                          const role = roleConfig[user.role as keyof typeof roleConfig]
                          const status = statusConfig[user.status as keyof typeof statusConfig]
                          const RoleIcon = role?.icon || UserPlus
                          return (
                            <tr key={user.id} className="border-b hover:bg-muted/50">
                              <td className="py-4">
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-10 w-10" src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} alt={user.name} fallback={user.name.charAt(0)} />
                                  <div>
                                    <p className="font-medium">{user.name}</p>
                                    <p className="text-sm text-muted-foreground">{user.email}</p>
                                    {user.phone && <p className="text-xs text-muted-foreground">{user.phone}</p>}
                                    {user.storeName && <p className="text-xs text-brand-600">🏪 {user.storeName}</p>}
                                  </div>
                                </div>
                              </td>
                              <td className="py-4">
                                <Badge variant="outline" className={cn('gap-1', role?.color)}>
                                  <RoleIcon className="h-3 w-3" />
                                  {role?.label}
                                </Badge>
                              </td>
                              <td className="py-4">
                                <Badge variant="outline" className={status?.color}>
                                  {status?.label}
                                </Badge>
                              </td>
                              <td className="py-4 hidden md:table-cell text-sm text-muted-foreground">
                                {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                              </td>
                              <td className="py-4 hidden lg:table-cell text-sm text-muted-foreground">
                                {new Date(user.lastLogin).toLocaleDateString('pt-BR')}
                              </td>
                              <td className="py-4 text-right hidden md:table-cell text-sm">
                                {user.orders}
                              </td>
                              <td className="py-4 text-right hidden lg:table-cell text-sm font-medium">
                                R$ {user.totalSpent.toFixed(2)}
                              </td>
                              <td className="py-4 text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <Button variant="ghost" size="icon" className="h-8 w-8"><Eye className="h-4 w-4" /></Button>
                                  <Button variant="ghost" size="icon" className="h-8 w-8"><Edit className="h-4 w-4" /></Button>
                                  {user.status === 'PENDING_VERIFICATION' && (
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-success hover:text-success"><Shield className="h-4 w-4" /></Button>
                                  )}
                                  {user.status === 'ACTIVE' && user.role !== 'ADMIN' && (
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive"><Ban className="h-4 w-4" /></Button>
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
                  <div className="lg:hidden space-y-3 p-1">
                    {filteredUsers.map(user => <UserCard key={user.id} user={user} />)}
                  </div>

                  {filteredUsers.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      <UserPlus className="mx-auto h-12 w-12 mb-3 text-muted-400" />
                      <p>Nenhum usuário encontrado</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>

        {/* Pagination */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in stagger-2">
          <p className="text-sm text-muted-foreground">Mostrando 1 a {filteredUsers.length} de {filteredUsers.length} usuários</p>
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

function UserPlus({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg className={className} {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <line x1="19" y1="8" x2="19" y2="14" />
      <line x1="22" y1="11" x2="16" y2="11" />
    </svg>
  )
}

function Store({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg className={className} {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <path d="M2 10h20" />
      <path d="M6 10V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v5" />
    </svg>
  )
}

function User({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg className={className} {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
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

function Activity({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg className={className} {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
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