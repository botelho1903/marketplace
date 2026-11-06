'use client'

import { useState, useEffect } from 'react'
import { Globe, Image, FileImage, Save, Loader2, AlertCircle, CheckCircle, XCircle, Clock, User, Globe as GlobeIcon, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { LogoUploadWithBg } from '@/components/admin/logo-upload-with-bg'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'

interface SiteSettings {
  id: string
  name: string
  domain: string
  subdomain: string | null
  description: string | null
  logo: string | null
  favicon: string | null
  isActive: boolean
  isPrimary: boolean
  theme: any
  settings: any
  defaultCurrency: string
  defaultLocale: string
  timezone: string
  ownerId: string
  createdAt: string
  updatedAt: string
}

export default function AdminConfiguracoesPage() {
  const { toast } = useToast()
  const [site, setSite] = useState<SiteSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  type TabValue = 'aparencia' | 'geral' | 'pagamentos' | 'envios' | 'vendedores' | 'seo' | 'email' | 'social' | 'subdominios'
const [activeTab, setActiveTab] = useState<TabValue>('aparencia')

  const handleTabChange = (value: string) => {
    setActiveTab(value as TabValue)
  }

  // Form states
  const [siteName, setSiteName] = useState('')
  const [logo, setLogo] = useState('')
  const [background, setBackground] = useState('')
  const [favicon, setFavicon] = useState('')
  const [description, setDescription] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [defaultCurrency, setDefaultCurrency] = useState('BRL')
  const [defaultLocale, setDefaultLocale] = useState('pt-BR')
  const [timezone, setTimezone] = useState('America/Sao_Paulo')
  const [maintenanceMode, setMaintenanceMode] = useState(false)
  const [maintenanceMessage, setMaintenanceMessage] = useState('')

  // Fetch site data
  useEffect(() => {
    fetchSite()
  }, [])

  const fetchSite = async () => {
    try {
      const response = await fetch('/api/admin/sites?primary=true')
      if (response.ok) {
        const data = await response.json()
        if (data.length > 0) {
          setSite(data[0])
          setSiteName(data[0].name || '')
          setLogo(data[0].logo || '')
          setBackground(data[0].settings?.background || '')
          setFavicon(data[0].favicon || '')
          setDescription(data[0].description || '')
          setIsActive(data[0].isActive)
          setDefaultCurrency(data[0].defaultCurrency || 'BRL')
          setDefaultLocale(data[0].defaultLocale || 'pt-BR')
          setTimezone(data[0].timezone || 'America/Sao_Paulo')
        }
      }
    } catch (error) {
      console.error('Error fetching site:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!site) return

    setSaving(true)
    try {
      const updateData: any = {
        name: siteName,
        description,
        isActive,
        defaultCurrency,
        defaultLocale,
        timezone,
      }

      if (logo) updateData.logo = logo
      if (favicon) updateData.favicon = favicon
      if (background) {
        updateData.settings = { ...(site.settings || {}), background }
      }

      const response = await fetch(`/api/admin/sites/${site.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      })

      if (response.ok) {
        toast({
          title: 'Sucesso',
          description: 'Configurações salvas com sucesso',
        })
        fetchSite()
      } else {
        const data = await response.json()
        throw new Error(data.message || 'Erro ao salvar')
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Erro ao salvar configurações',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="section">
        <div className="container-main">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="section">
      <div className="container-main">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Configurações do Site</h1>
            <p className="text-muted-foreground">
              Gerencie a aparência, configurações gerais e integrações do seu marketplace
            </p>
          </div>
          <Button onClick={handleSave} disabled={saving} className="whitespace-nowrap">
            <Save className="mr-2 h-4 w-4" />
            {saving ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-4 sm:grid-cols-9 scrollbar-hide">
            <TabsTrigger value="aparencia">Aparência</TabsTrigger>
            <TabsTrigger value="geral">Geral</TabsTrigger>
            <TabsTrigger value="pagamentos">Pagamentos</TabsTrigger>
            <TabsTrigger value="envios">Envios</TabsTrigger>
            <TabsTrigger value="vendedores">Vendedores</TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
            <TabsTrigger value="email">E-mail</TabsTrigger>
            <TabsTrigger value="social">Social</TabsTrigger>
            <TabsTrigger value="subdominios">Subdomínios</TabsTrigger>
          </TabsList>

          {/* Aparência Tab */}
          <TabsContent value="aparencia" className="mt-6 animate-in">
            <LogoUploadWithBg
              currentSiteName={siteName}
              currentLogo={logo}
              currentBackground={background}
              currentFavicon={favicon}
              onSiteNameChange={setSiteName}
              onLogoChange={setLogo}
              onBackgroundChange={setBackground}
              onFaviconChange={setFavicon}
              siteId={site?.id}
              showBackgroundUpload={true}
              showFaviconUpload={true}
              maxFileSize={5}
            />
          </TabsContent>

          {/* Geral Tab */}
          <TabsContent value="geral" className="mt-6 animate-in space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Informações Básicas
                </CardTitle>
                <CardDescription>Configure as informações principais do site</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="site-name">Nome do Site *</Label>
                    <Input
                      id="site-name"
                      value={siteName}
                      onChange={(e) => setSiteName(e.target.value)}
                      placeholder="Ex: Meu Marketplace"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="site-domain">Domínio Principal</Label>
                    <Input
                      id="site-domain"
                      value={site?.domain || ''}
                      disabled
                      placeholder="exemplo.com"
                    />
                    <p className="text-sm text-muted-foreground">O domínio não pode ser alterado aqui</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="site-subdomain">Subdomínio</Label>
                    <Input
                      id="site-subdomain"
                      value={site?.subdomain || ''}
                      disabled
                      placeholder="app"
                    />
                    <p className="text-sm text-muted-foreground">Subdomínio para acesso direto</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="site-currency">Moeda Padrão</Label>
                    <Select value={defaultCurrency} onValueChange={setDefaultCurrency}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BRL">BRL - Real Brasileiro</SelectItem>
                        <SelectItem value="USD">USD - Dólar Americano</SelectItem>
                        <SelectItem value="EUR">EUR - Euro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="site-locale">Idioma Padrão</Label>
                    <Select value={defaultLocale} onValueChange={setDefaultLocale}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                        <SelectItem value="en-US">English (US)</SelectItem>
                        <SelectItem value="es-ES">Español</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="site-timezone">Fuso Horário</Label>
                    <Select value={timezone} onValueChange={setTimezone}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="America/Sao_Paulo">America/Sao_Paulo (GMT-3)</SelectItem>
                        <SelectItem value="America/New_York">America/New_York (GMT-5)</SelectItem>
                        <SelectItem value="Europe/Lisbon">Europe/Lisbon (GMT+0)</SelectItem>
                        <SelectItem value="UTC">UTC</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="site-description">Descrição do Site</Label>
                  <textarea
                    id="site-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Breve descrição do seu marketplace..."
                    className="w-full min-h-[100px] p-3 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                    rows={4}
                  />
                </div>

                <div className="flex items-center gap-3">
                  <Switch
                    id="site-active"
                    checked={isActive}
                    onCheckedChange={setIsActive}
                  />
                  <div>
                    <Label htmlFor="site-active" className="font-medium">Site Ativo</Label>
                    <p className="text-sm text-muted-foreground">Desative para colocar o site em manutenção</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Switch
                    id="maintenance-mode"
                    checked={maintenanceMode}
                    onCheckedChange={setMaintenanceMode}
                  />
                  <div>
                    <Label htmlFor="maintenance-mode" className="font-medium">Modo Manutenção</Label>
                    <p className="text-sm text-muted-foreground">Exibe página de manutenção para visitantes</p>
                  </div>
                </div>

                {maintenanceMode && (
                  <div className="space-y-2">
                    <Label htmlFor="maintenance-message">Mensagem de Manutenção</Label>
                    <Input
                      id="maintenance-message"
                      value={maintenanceMessage}
                      onChange={(e) => setMaintenanceMessage(e.target.value)}
                      placeholder="Estamos em manutenção, voltamos em breve!"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pagamentos Tab */}
          <TabsContent value="pagamentos" className="mt-6 animate-in space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileImage className="h-5 w-5" />
                  Configurações de Pagamento
                </CardTitle>
                <CardDescription>Configure métodos de pagamento e gateways</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {['pix_enabled', 'credit_card_enabled', 'boleto_enabled', 'mercado_pago_enabled', 'stripe_enabled'].map((key) => (
                    <div key={key} className="flex items-center gap-3 p-4 border rounded-lg bg-muted/50">
                      <Switch
                        id={key}
                        checked={false}
                        onCheckedChange={() => {}}
                      />
                      <Label htmlFor={key} className="font-medium cursor-pointer">
                        {key.replace('_enabled', '').replace('_', ' ').toUpperCase()}
                      </Label>
                    </div>
                  ))}
                </div>

                <Separator />

                <h3 className="text-lg font-medium">Credenciais do Mercado Pago</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="mp-client-id">Client ID</Label>
                    <Input id="mp-client-id" type="password" placeholder="APP_USR-xxx" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mp-client-secret">Client Secret</Label>
                    <Input id="mp-client-secret" type="password" placeholder="••••••••" />
                  </div>
                </div>

                <h3 className="text-lg font-medium">Credenciais do Stripe</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="stripe-pub-key">Publishable Key</Label>
                    <Input id="stripe-pub-key" type="password" placeholder="pk_test_xxx" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stripe-secret-key">Secret Key</Label>
                    <Input id="stripe-secret-key" type="password" placeholder="sk_test_xxx" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Envios Tab */}
          <TabsContent value="envios" className="mt-6 animate-in space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Configurações de Envio
                </CardTitle>
                <CardDescription>Configure transportadoras e regras de frete</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="shipping-carrier">Transportadora Padrão</Label>
                    <Select value="correios" onValueChange={() => {}}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="correios">Correios</SelectItem>
                        <SelectItem value="jadlog">Jadlog</SelectItem>
                        <SelectItem value="azul">Azul Cargo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="free-shipping-min">Frete Grátis Acima de (R$)</Label>
                    <Input id="free-shipping-min" type="number" value="199.90" step="0.01" />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {['correios', 'jadlog', 'azul'].map((carrier) => (
                    <div key={carrier} className="flex items-center gap-3 p-4 border rounded-lg bg-muted/50">
                      <Switch
                        id={`shipping-${carrier}`}
                        checked={carrier !== 'azul'}
                        onCheckedChange={() => {}}
                      />
                      <Label htmlFor={`shipping-${carrier}`} className="font-medium cursor-pointer capitalize">
                        {carrier}
                      </Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Vendedores Tab */}
          <TabsContent value="vendedores" className="mt-6 animate-in space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Image className="h-5 w-5" />
                  Configurações de Vendedores
                </CardTitle>
                <CardDescription>Configure regras para vendedores do marketplace</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="default-commission">Comissão Padrão (%)</Label>
                    <Input id="default-commission" type="number" value="10" min="0" max="100" step="0.1" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="min-commission">Comissão Mínima (%)</Label>
                    <Input id="min-commission" type="number" value="5" min="0" max="100" step="0.1" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="max-commission">Comissão Máxima (%)</Label>
                    <Input id="max-commission" type="number" value="20" min="0" max="100" step="0.1" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="min-payout">Valor Mínimo para Saque (R$)</Label>
                    <Input id="min-payout" type="number" value="50" min="0" step="1" />
                  </div>
                </div>

                <Separator />

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-4 border rounded-lg bg-muted/50">
                    <Switch id="seller-verification" checked onCheckedChange={() => {}} />
                    <Label htmlFor="seller-verification" className="font-medium cursor-pointer">
                      Verificação Obrigatória
                    </Label>
                  </div>
                  <div className="flex items-center gap-3 p-4 border rounded-lg bg-muted/50">
                    <Switch id="seller-auto-approve" checked={false} onCheckedChange={() => {}} />
                    <Label htmlFor="seller-auto-approve" className="font-medium cursor-pointer">
                      Aprovação Automática
                    </Label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="payout-schedule">Agenda de Pagamento Padrão</Label>
                  <Select value="weekly" onValueChange={() => {}}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Diário</SelectItem>
                      <SelectItem value="weekly">Semanal</SelectItem>
                      <SelectItem value="biweekly">Quinzenal</SelectItem>
                      <SelectItem value="monthly">Mensal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SEO Tab */}
          <TabsContent value="seo" className="mt-6 animate-in space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  SEO e Metadados
                </CardTitle>
                <CardDescription>Configure títulos, descrições e palavras-chave para buscadores</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="meta-title">Título SEO</Label>
                  <Input id="meta-title" value="Marketplace - Compre e Venda Online" />
                  <p className="text-sm text-muted-foreground">Máximo 60 caracteres</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="meta-description">Meta Description</Label>
                  <textarea
                    id="meta-description"
                    value="Encontre os melhores produtos com preços imperdíveis. Entrega rápida e segura."
                    className="w-full min-h-[80px] p-3 border border-input bg-background rounded-md"
                    rows={3}
                  />
                  <p className="text-sm text-muted-foreground">Máximo 160 caracteres</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="meta-keywords">Palavras-chave</Label>
                  <Input id="meta-keywords" value="marketplace, compras online, ecommerce, ofertas" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="og-image">Imagem Open Graph</Label>
                  <Input id="og-image" type="url" placeholder="https://exemplo.com/og-image.jpg" />
                  <p className="text-sm text-muted-foreground">Recomendado: 1200x630px</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* E-mail Tab */}
          <TabsContent value="email" className="mt-6 animate-in space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileImage className="h-5 w-5" />
                  Configurações de E-mail
                </CardTitle>
                <CardDescription>Configure SMTP para envio de e-mails transacionais</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="smtp-host">SMTP Host</Label>
                    <Input id="smtp-host" placeholder="smtp.gmail.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtp-port">Porta</Label>
                    <Input id="smtp-port" type="number" value="587" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtp-user">Usuário</Label>
                    <Input id="smtp-user" placeholder="seu@email.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtp-password">Senha</Label>
                    <Input id="smtp-password" type="password" placeholder="••••••••" />
                  </div>
                </div>

                <Separator />

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email-from">E-mail Remetente</Label>
                    <Input id="email-from" value="noreply@marketplace.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email-support">E-mail Suporte</Label>
                    <Input id="email-support" value="suporte@marketplace.com" />
                  </div>
                </div>

                <Button variant="outline" onClick={() => toast({ title: 'Teste', description: 'E-mail de teste enviado!' })}>
                  Enviar E-mail de Teste
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Social Tab */}
          <TabsContent value="social" className="mt-6 animate-in space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Redes Sociais
                </CardTitle>
                <CardDescription>Links para redes sociais do marketplace</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {['facebook', 'instagram', 'twitter', 'youtube', 'linkedin'].map((network) => (
                  <div key={network} className="flex items-center gap-4 p-4 border rounded-lg bg-muted/50">
                    <div className="w-10 h-10 rounded-lg bg-brand-100 flex items-center justify-center text-brand-600">
                      {network.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 space-y-1">
                      <Label htmlFor={`social-${network}`} className="font-medium capitalize">
                        {network}
                      </Label>
                      <Input
                        id={`social-${network}`}
                        type="url"
                        placeholder={`https://${network}.com/seumarketplace`}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Subdomínios Tab */}
          <TabsContent value="subdominios" className="mt-6 animate-in space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GlobeIcon className="h-5 w-5" />
                  Solicitações de Subdomínio
                </CardTitle>
                <CardDescription>
                  Aprove ou rejeite solicitações de subdomínios personalizados dos vendedores
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Stats */}
                <div className="grid sm:grid-cols-3 gap-4">
                  <Card className="bg-warning/10 border-warning/20">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-warning/20">
                          <Clock className="h-5 w-5 text-warning" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-warning">3</p>
                          <p className="text-sm text-muted-foreground">Pendentes</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-success/10 border-success/20">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-success/20">
                          <CheckCircle2 className="h-5 w-5 text-success" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-success">12</p>
                          <p className="text-sm text-muted-foreground">Aprovados</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-destructive/10 border-destructive/20">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-destructive/20">
                          <XCircle className="h-5 w-5 text-destructive" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-destructive">2</p>
                          <p className="text-sm text-muted-foreground">Rejeitados</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Requests List */}
                <div className="space-y-4">
                  <h4 className="font-medium">Todas as Solicitações</h4>
                  <div className="space-y-3">
                    {[
                      {
                        id: 1,
                        seller: 'João Silva',
                        sellerEmail: 'joao@email.com',
                        storeName: 'Loja do João',
                        requestedSubdomain: 'loja-joao',
                        status: 'PENDING',
                        requestedAt: '2024-01-20T10:30:00Z',
                      },
                      {
                        id: 2,
                        seller: 'Maria Santos',
                        sellerEmail: 'maria@email.com',
                        storeName: 'Moda Maria',
                        requestedSubdomain: 'moda-maria',
                        status: 'PENDING',
                        requestedAt: '2024-01-19T15:45:00Z',
                      },
                      {
                        id: 3,
                        seller: 'Pedro Costa',
                        sellerEmail: 'pedro@email.com',
                        storeName: 'Tech Pedro',
                        requestedSubdomain: 'tech-pedro',
                        status: 'PENDING',
                        requestedAt: '2024-01-18T09:15:00Z',
                      },
                      {
                        id: 4,
                        seller: 'Ana Oliveira',
                        sellerEmail: 'ana@email.com',
                        storeName: 'Casa da Ana',
                        requestedSubdomain: 'casa-ana',
                        status: 'APPROVED',
                        requestedAt: '2024-01-15T14:20:00Z',
                        approvedAt: '2024-01-16T10:00:00Z',
                      },
                      {
                        id: 5,
                        seller: 'Carlos Lima',
                        sellerEmail: 'carlos@email.com',
                        storeName: 'Carlos Esportes',
                        requestedSubdomain: 'super-loja-carlos',
                        status: 'REJECTED',
                        requestedAt: '2024-01-10T11:00:00Z',
                        rejectedAt: '2024-01-11T09:30:00Z',
                        reason: 'Nome muito genérico, pode confundir com outras lojas',
                      },
                    ].map((req) => {
                      const statusConfigs = {
                        APPROVED: { label: 'Aprovado', color: 'bg-success/10 text-success border-success/20', icon: CheckCircle2 },
                        PENDING: { label: 'Pendente', color: 'bg-warning/10 text-warning border-warning/20', icon: Clock },
                        REJECTED: { label: 'Rejeitado', color: 'bg-destructive/10 text-destructive border-destructive/20', icon: XCircle },
                      }
                      const statusConfig = statusConfigs[req.status as keyof typeof statusConfigs]
                      const Icon = statusConfig?.icon
                      return (
                        <Card key={req.id} className={cn('border', statusConfig?.color)}>
                          <CardContent className="p-4 md:p-6">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                              <div className="flex items-center gap-4 flex-1">
                                <div className="p-3 rounded-xl bg-brand-100 text-brand-600">
                                  <User className="h-6 w-6" />
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-3 flex-wrap">
                                    <p className="font-semibold text-foreground truncate">{req.storeName}</p>
                                    <Badge variant="outline" className={cn('font-medium', statusConfig?.color)}>
                                      <Icon className="h-3 w-3" />
                                      {statusConfig?.label}
                                    </Badge>
                                  </div>
                                  <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1 flex-wrap">
                                    <span>{req.seller}</span>
                                    <span>{req.sellerEmail}</span>
                                    <span className="font-mono">Solicitado: {new Date(req.requestedAt).toLocaleDateString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-3 flex-wrap">
                                <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
                                  <GlobeIcon className="h-4 w-4 text-muted-foreground" />
                                  <span className="font-mono text-sm">{req.requestedSubdomain}.marketplace.com</span>
                                </div>
                                {req.status === 'PENDING' && (
                                  <>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="min-h-[44px] text-success border-success/50 hover:bg-success/10"
                                      onClick={() => toast({ title: 'Aprovado', description: `Subdomínio ${req.requestedSubdomain} aprovado!` })}
                                    >
                                      <CheckCircle2 className="mr-2 h-4 w-4" />
                                      Aprovar
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="min-h-[44px] text-destructive border-destructive/50 hover:bg-destructive/10"
                                      onClick={() => {
                                        const reason = prompt('Motivo da rejeição:')
                                        if (reason) toast({ title: 'Rejeitado', description: `Subdomínio ${req.requestedSubdomain} rejeitado: ${reason}`, variant: 'destructive' })
                                      }}
                                    >
                                      <XCircle className="mr-2 h-4 w-4" />
                                      Rejeitar
                                    </Button>
                                  </>
                                )}
                                {req.status === 'APPROVED' && (
                                  <div className="text-sm text-success">
                                    Aprovado em {new Date(req.approvedAt!).toLocaleDateString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                  </div>
                                )}
                                {req.status === 'REJECTED' && (
                                  <div className="text-sm text-destructive">
                                    Rejeitado em {new Date(req.rejectedAt!).toLocaleDateString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                  </div>
                                )}
                              </div>
                            </div>
                            {req.reason && (
                              <div className="mt-4 p-3 bg-destructive/5 border-destructive/20 border rounded-lg">
                                <p className="text-sm text-destructive flex items-center gap-2">
                                  <AlertCircle className="h-4 w-4" />
                                  <strong>Motivo da rejeição:</strong> {req.reason}
                                </p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                </div>

                {/* Settings */}
                <Separator />
                <h4 className="font-medium">Configurações de Subdomínio</h4>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="subdomain-base">Domínio Base</Label>
                    <Input id="subdomain-base" value="marketplace.com" disabled />
                    <p className="text-sm text-muted-foreground">Todos os subdomínios usarão este domínio</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="min-length">Tamanho Mínimo</Label>
                    <Input id="min-length" type="number" value="3" min="2" max="10" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="max-length">Tamanho Máximo</Label>
                    <Input id="max-length" type="number" value="30" min="10" max="50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reserved-count">Subdomínios Reservados</Label>
                    <Input id="reserved-count" type="number" value="50" min="0" />
                    <p className="text-sm text-muted-foreground">Quantidade reservada para uso interno</p>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-4 border rounded-lg bg-muted/50">
                    <Switch id="auto-approve" checked={false} onCheckedChange={() => {}} />
                    <Label htmlFor="auto-approve" className="font-medium cursor-pointer">
                      Aprovação Automática para Vendedores Verificados
                    </Label>
                  </div>
                  <div className="flex items-center gap-3 p-4 border rounded-lg bg-muted/50">
                    <Switch id="notify-seller" checked onCheckedChange={() => {}} />
                    <Label htmlFor="notify-seller" className="font-medium cursor-pointer">
                      Notificar Vendedor por E-mail
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}