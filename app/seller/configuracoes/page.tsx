'use client'

import { User, Bell, Shield, Globe, Palette, Truck, CreditCard, Store, Settings, Save, Loader2, Globe as GlobeIcon, CheckCircle2, AlertTriangle, XCircle, Clock, Copy, Share2, ExternalLink, Link as LinkIcon } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { LogoUploadWithBg } from '@/components/admin/logo-upload-with-bg'

const shippingOptions = [
  { id: 'correios', name: 'Correios (PAC/Sedex)', enabled: true },
  { id: 'jadlog', name: 'Jadlog', enabled: true },
  { id: 'azul', name: 'Azul Cargo', enabled: false },
  { id: 'retirada', name: 'Retirada na loja', enabled: true },
]

const paymentMethods = [
  { id: 'pix', name: 'PIX', enabled: true, fee: '0%' },
  { id: 'credit_card', name: 'Cartão de Crédito', enabled: true, fee: '3.99% + R$ 0,60' },
  { id: 'boleto', name: 'Boleto Bancário', enabled: true, fee: 'R$ 3,49' },
  { id: 'mercado_pago', name: 'Mercado Pago', enabled: false, fee: '3.99% + R$ 0,60' },
]

export default function SellerConfiguracoesPage() {
  const [activeTab, setActiveTab] = useState('geral')
  const [saving, setSaving] = useState(false)

  // Logo upload state
  const [storeName, setStoreName] = useState('Minha Loja Oficial')
  const [logo, setLogo] = useState('')
  const [background, setBackground] = useState('')
  const [favicon, setFavicon] = useState('')

  const handleSave = async () => {
    setSaving(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setSaving(false)
  }

  return (
    <div className="section">
      <div className="container-main">
        <div className="mb-8 animate-in">
          <h1 className="text-3xl font-bold text-foreground mb-1">Configurações da Loja</h1>
          <p className="text-muted-foreground">Gerencie as configurações da sua loja</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="animate-in">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-7 scrollbar-hide">
            <TabsTrigger value="geral"><Settings className="mr-2 h-4 w-4" />Geral</TabsTrigger>
            <TabsTrigger value="loja"><Store className="mr-2 h-4 w-4" />Loja</TabsTrigger>
            <TabsTrigger value="dominio"><GlobeIcon className="mr-2 h-4 w-4" />Domínio</TabsTrigger>
            <TabsTrigger value="entrega"><Truck className="mr-2 h-4 w-4" />Entrega</TabsTrigger>
            <TabsTrigger value="pagamentos"><CreditCard className="mr-2 h-4 w-4" />Pagamentos</TabsTrigger>
            <TabsTrigger value="notificacoes"><Bell className="mr-2 h-4 w-4" />Notificações</TabsTrigger>
            <TabsTrigger value="seguranca"><Shield className="mr-2 h-4 w-4" />Segurança</TabsTrigger>
          </TabsList>

          {/* Geral */}
          <TabsContent value="geral" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações da Conta</CardTitle>
                <CardDescription>Dados cadastrais do vendedor</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <Label htmlFor="nomeLoja">Nome da Loja *</Label>
                    <Input id="nomeLoja" defaultValue="Minha Loja Oficial" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="cnpj">CNPJ *</Label>
                    <Input id="cnpj" placeholder="00.000.000/0000-00" defaultValue="12.345.678/0001-90" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="razaoSocial">Razão Social</Label>
                    <Input id="razaoSocial" defaultValue="Minha Loja LTDA" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="inscricaoEstadual">Inscrição Estadual</Label>
                    <Input id="inscricaoEstadual" placeholder="Isento ou número" defaultValue="ISENTO" />
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <Label htmlFor="emailContato">E-mail de Contato *</Label>
                    <Input id="emailContato" type="email" defaultValue="contato@minhaloja.com" />
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <Label htmlFor="telefoneContato">Telefone de Contato</Label>
                    <Input id="telefoneContato" placeholder="(11) 99999-9999" defaultValue="(11) 98765-4321" />
                  </div>
                </div>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Salvar alterações
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Endereço da Loja</CardTitle>
                <CardDescription>Endereço para emissão de notas fiscais e cálculo de frete</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <Label htmlFor="cep">CEP *</Label>
                    <Input id="cep" placeholder="00000-000" defaultValue="01310-100" />
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <Label htmlFor="logradouro">Logradouro *</Label>
                    <Input id="logradouro" defaultValue="Av. Paulista" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="numero">Número *</Label>
                    <Input id="numero" defaultValue="1000" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="complemento">Complemento</Label>
                    <Input id="complemento" placeholder="Sala 101" defaultValue="Conjunto 101" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="bairro">Bairro *</Label>
                    <Input id="bairro" defaultValue="Bela Vista" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="cidade">Cidade *</Label>
                    <Input id="cidade" defaultValue="São Paulo" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="estado">Estado *</Label>
                    <Select defaultValue="SP">
                      <SelectTrigger id="estado"><SelectValue placeholder="UF" /></SelectTrigger>
                      <SelectContent>
                        {['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'].map(uf => (
                          <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button variant="outline" onClick={handleSave} disabled={saving}>
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Salvar endereço
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Loja */}
          <TabsContent value="loja" className="mt-6 space-y-6">
            <LogoUploadWithBg
              currentSiteName={storeName}
              currentLogo={logo}
              currentBackground={background}
              currentFavicon={favicon}
              onSiteNameChange={setStoreName}
              onLogoChange={setLogo}
              onBackgroundChange={setBackground}
              onFaviconChange={setFavicon}
              siteId="seller-store" // Will use seller-specific upload
              showBackgroundUpload={true}
              showFaviconUpload={true}
              maxFileSize={5}
            />

            <Card>
              <CardHeader>
                <CardTitle>Identidade Visual - Cores e Fonte</CardTitle>
                <CardDescription>Personalize as cores e tipografia da sua loja</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-1.5">
                  <Label htmlFor="descricaoLoja">Descrição da Loja</Label>
                  <Textarea id="descricaoLoja" rows={4} placeholder="Conte sobre sua loja, história, missão..." defaultValue="Somos uma loja especializada em produtos de qualidade com atendimento personalizado." />
                </div>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="space-y-1.5">
                    <Label htmlFor="corPrimaria">Cor Primária</Label>
                    <Input id="corPrimaria" type="color" defaultValue="#FF6B35" className="h-12 w-20 cursor-pointer" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="corSecundaria">Cor Secundária</Label>
                    <Input id="corSecundaria" type="color" defaultValue="#009688" className="h-12 w-20 cursor-pointer" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="fonte">Fonte</Label>
                    <Select defaultValue="inter">
                      <SelectTrigger id="fonte"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="inter">Inter</SelectItem>
                        <SelectItem value="roboto">Roboto</SelectItem>
                        <SelectItem value="poppins">Poppins</SelectItem>
                        <SelectItem value="montserrat">Montserrat</SelectItem>
                        <SelectItem value="nunito">Nunito</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Salvar identidade visual
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>SEO e Redes Sociais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-1.5">
                  <Label htmlFor="metaTitle">Título da Página (SEO)</Label>
                  <Input id="metaTitle" placeholder="Minha Loja - Produtos Incríveis" defaultValue="Minha Loja Oficial - Melhores Ofertas" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="metaDescription">Meta Description</Label>
                  <Textarea id="metaDescription" rows={3} placeholder="Descrição para buscadores (máx. 160 caracteres)" defaultValue="Encontre os melhores produtos com preços imperdíveis. Entrega rápida e segura." />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="metaKeywords">Palavras-chave</Label>
                  <Input id="metaKeywords" placeholder="produtos, ofertas, loja online" defaultValue="ecommerce, marketplace, ofertas, compras online" />
                </div>
                <Separator />
                <div className="grid md:grid-cols-4 gap-4">
                  {[
                    { id: 'instagram', label: 'Instagram', placeholder: '@minhaloja', icon: '📷' },
                    { id: 'facebook', label: 'Facebook', placeholder: 'facebook.com/minhaloja', icon: '📘' },
                    { id: 'whatsapp', label: 'WhatsApp', placeholder: '+55 11 99999-9999', icon: '💚' },
                    { id: 'youtube', label: 'YouTube', placeholder: 'youtube.com/minhaloja', icon: '📺' },
                  ].map(social => (
                    <div key={social.id} className="space-y-1.5">
                      <Label htmlFor={social.id}>{social.label}</Label>
                      <Input id={social.id} placeholder={social.placeholder} />
                    </div>
                  ))}
                </div>
                <Button variant="outline" onClick={handleSave} disabled={saving}>
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Salvar SEO e redes sociais
                </Button>
              </CardContent>
            </Card>

            {/* Link da Loja */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LinkIcon className="h-5 w-5 text-brand-500" />
                  Link da Sua Loja
                </CardTitle>
                <CardDescription>
                  Compartilhe este link para que clientes acessem diretamente sua loja e vejam apenas seus produtos.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Current Store Link Display */}
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-brand-100 text-brand-600">
                      <Store className="h-6 w-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-muted-foreground">URL da Loja</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <code className="flex-1 min-w-0 text-sm bg-background px-3 py-2 rounded border truncate font-mono text-foreground">
                          https://www.botelho.com/loja/joao-silva
                        </code>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-9 w-9 shrink-0"
                          onClick={() => {
                            navigator.clipboard.writeText('https://www.botelho.com/loja/joao-silva');
                            alert('Link copiado! ✅');
                          }}
                          aria-label="Copiar link"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-9 w-9 shrink-0"
                          onClick={() => {
                            const url = 'https://www.botelho.com/loja/joao-silva';
                            if (navigator.share) {
                              navigator.share({ title: 'Minha Loja', text: 'Confira!', url });
                            } else {
                              navigator.clipboard.writeText(url);
                              alert('Link copiado! (Compartilhamento nativo não disponível)');
                            }
                          }}
                          aria-label="Compartilhar"
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                        <a href="/loja/joao-silva" target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" size="icon" className="h-9 w-9 shrink-0" aria-label="Ver loja">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </a>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-sm shrink-0">Ativo</Badge>
                  </div>
                </div>

                {/* QR Code */}
                <div className="flex items-center justify-center gap-8 p-4 border rounded-lg">
                  <div className="text-center">
                    <p className="text-sm font-medium mb-2">QR Code da Loja</p>
                    <img
                      src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=https://www.botelho.com/loja/joao-silva"
                      alt="QR Code da loja"
                      className="rounded-lg border bg-white p-2"
                    />
                    <p className="text-xs text-muted-foreground mt-2">Escaneie para abrir no celular</p>
                  </div>
                  <div className="space-y-3">
                    <Button
                      variant="outline"
                      className="w-full justify-center gap-2"
                      onClick={() => {
                        navigator.clipboard.writeText('https://www.botelho.com/loja/joao-silva');
                        alert('Link copiado! ✅');
                      }}
                    >
                      <Copy className="h-4 w-4" />
                      Copiar Link
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-center gap-2"
                      onClick={() => {
                        const url = 'https://www.botelho.com/loja/joao-silva';
                        if (navigator.share) navigator.share({ title: 'Minha Loja', text: 'Confira!', url });
                        else { navigator.clipboard.writeText(url); alert('Link copiado!'); }
                      }}
                    >
                      <Share2 className="h-4 w-4" />
                      Compartilhar
                    </Button>
                    <a href="/loja/joao-silva" target="_blank" rel="noopener noreferrer">
                      <Button variant="default" className="w-full justify-center gap-2">
                        <ExternalLink className="h-4 w-4" />
                        Ver Minha Loja
                      </Button>
                    </a>
                  </div>
                </div>

                {/* Dicas */}
                <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
                  <h5 className="font-medium text-blue-800 mb-3 flex items-center gap-2">
                    <LinkIcon className="h-4 w-4" />
                    Como usar seu link da loja
                  </h5>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• <strong>WhatsApp/Redes Sociais:</strong> Cole o link direto nos posts e stories</li>
                    <li>• <strong>Cartão de visita:</strong> Use o QR code impresso</li>
                    <li>• <strong>Assinatura de e-mail:</strong> Adicione o link no rodapé</li>
                    <li>• <strong>Anúncios pagos:</strong> Use como URL de destino (UTM automático)</li>
                    <li>• <strong>Clientes veem SÓ seus produtos</strong> — não mistura com outras lojas</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Domínio / Subdomínio Personalizado */}
          <TabsContent value="dominio" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GlobeIcon className="h-5 w-5 text-brand-500" />
                  Subdomínio Personalizado
                </CardTitle>
                <CardDescription>
                  Solicite um subdomínio exclusivo para sua loja (ex: sualoja.marketplace.com).
                  Requer aprovação do administrador.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Current Status */}
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-xl bg-brand-100 text-brand-600">
                        <GlobeIcon className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="font-medium">Subdomínio atual</p>
                        <p className="text-sm text-muted-foreground">minhaloja.marketplace.com</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-sm">Padrão</Badge>
                  </div>
                </div>

                {/* Request Form */}
                <div className="space-y-4">
                  <h4 className="font-medium">Solicitar Novo Subdomínio</h4>
                  <p className="text-sm text-muted-foreground">
                    Escolha um nome único para seu subdomínio. Apenas letras, números e hífen são permitidos.
                  </p>
                  <div className="flex items-center gap-3">
                    <Input
                      placeholder="minha-loja-incrivel"
                      className="flex-1 max-w-md"
                      id="customSubdomain"
                    />
                    <span className="text-muted-foreground">.marketplace.com</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <input type="checkbox" id="subdomainTerms" className="h-4 w-4 rounded border-muted" />
                    <label htmlFor="subdomainTerms" className="cursor-pointer">
                      Confirmo que este subdomínio não infringe marcas registradas e estou ciente de que
                      o administrador pode rejeitar a solicitação.
                    </label>
                  </div>
                  <Button onClick={() => alert('Solicitação enviada! Aguarde aprovação do administrador.')} disabled={saving}>
                    {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Enviar Solicitação para Aprovação
                  </Button>
                </div>

                {/* Pending Requests */}
                <div className="border-t pt-6">
                  <h4 className="font-medium mb-4">Minhas Solicitações</h4>
                  <div className="space-y-3">
                    {[
                      { subdomain: 'loja-joao', status: 'APPROVED', requestedAt: '2024-01-10', approvedAt: '2024-01-11' },
                      { subdomain: 'joao-silva-oficial', status: 'PENDING', requestedAt: '2024-01-20', approvedAt: null },
                      { subdomain: 'super-loja-joao', status: 'REJECTED', requestedAt: '2024-01-15', approvedAt: null, reason: 'Nome muito genérico' },
                    ].map((req, i) => {
                      const statusConfigs = {
                        APPROVED: { label: 'Aprovado', color: 'bg-success/10 text-success', icon: CheckCircle2 },
                        PENDING: { label: 'Pendente', color: 'bg-warning/10 text-warning', icon: Clock },
                        REJECTED: { label: 'Rejeitado', color: 'bg-destructive/10 text-destructive', icon: XCircle },
                      }
                      const statusConfig = statusConfigs[req.status as keyof typeof statusConfigs]
                      const Icon = statusConfig?.icon
                      return (
                        <div key={i} className="p-4 border rounded-lg hover:bg-muted/30">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={cn('p-2 rounded-lg', statusConfig?.color)}>
                                <Icon className="h-5 w-5" />
                              </div>
                              <div>
                                <p className="font-mono font-medium">{req.subdomain}.marketplace.com</p>
                                <p className="text-sm text-muted-foreground">Solicitado em {new Date(req.requestedAt).toLocaleDateString('pt-BR')}</p>
                              </div>
                            </div>
                            <Badge variant="outline" className={cn(statusConfig?.color)}>
                              <Icon className="h-3 w-3" />
                              {statusConfig?.label}
                            </Badge>
                          </div>
                          {req.reason && (
                            <div className="mt-3 pl-10 text-sm text-destructive flex items-center gap-2">
                              <AlertTriangle className="h-4 w-4" />
                              Motivo da rejeição: {req.reason}
                            </div>
                          )}
                          {req.approvedAt && (
                            <div className="mt-2 pl-10 text-sm text-success">
                              Aprovado em {new Date(req.approvedAt).toLocaleDateString('pt-BR')}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Guidelines */}
                <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
                  <h5 className="font-medium text-blue-800 mb-3 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Diretrizes para Subdomínios
                  </h5>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Apenas letras minúsculas, números e hífen (-)</li>
                    <li>• Entre 3 e 30 caracteres</li>
                    <li>• Não pode iniciar ou terminar com hífen</li>
                    <li>• Não use marcas registradas de terceiros</li>
                    <li>• O administrador pode rejeitar nomes inadequados</li>
                    <li>• Após aprovação, o link antigo continua funcionando por 30 dias</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Entrega */}
          <TabsContent value="entrega" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Transportadoras</CardTitle>
                <CardDescription>Configure as opções de entrega disponíveis</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {shippingOptions.map((option, index) => (
                  <div key={option.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30">
                    <div className="flex items-center gap-4">
                      <input type="checkbox" id={`ship-${option.id}`} defaultChecked={option.enabled} className="h-4 w-4 rounded border-muted" />
                      <label htmlFor={`ship-${option.id}`} className="font-medium cursor-pointer">{option.name}</label>
                    </div>
                    {option.enabled && (
                      <Button variant="outline" size="sm">Configurar</Button>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Frete Grátis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <input type="checkbox" id="freteGratis" defaultChecked className="h-4 w-4 rounded border-muted" />
                  <label htmlFor="freteGratis" className="font-medium">Oferecer frete grátis acima de valor mínimo</label>
                </div>
                <div className="grid md:grid-cols-3 gap-4 pl-10">
                  <div className="space-y-1.5">
                    <Label htmlFor="valorMinimoFrete">Valor mínimo</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">R$</span>
                      <Input id="valorMinimoFrete" type="number" placeholder="0,00" defaultValue="199,90" step="0.01" className="pl-8" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="regioesFrete">Regiões elegíveis</Label>
                    <Select defaultValue="sudeste">
                      <SelectTrigger id="regioesFrete"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="brasil">Todo o Brasil</SelectItem>
                        <SelectItem value="sudeste">Sudeste</SelectItem>
                        <SelectItem value="sul">Sul</SelectItem>
                        <SelectItem value="nordeste">Nordeste</SelectItem>
                        <SelectItem value="norte">Norte</SelectItem>
                        <SelectItem value="centro_oeste">Centro-Oeste</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="transportadoraFrete">Transportadora</Label>
                    <Select defaultValue="correios">
                      <SelectTrigger id="transportadoraFrete"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="correios">Correios (PAC)</SelectItem>
                        <SelectItem value="jadlog">Jadlog</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Salvar configurações de entrega
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Prazos de Preparação</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="prazoPadrao">Prazo padrão (dias úteis)</Label>
                    <Input id="prazoPadrao" type="number" defaultValue="2" min="0" max="30" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="prazoPersonalizado">Produtos personalizados (dias)</Label>
                    <Input id="prazoPersonalizado" type="number" defaultValue="7" min="0" max="60" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="prazoMaximo">Prazo máximo (dias)</Label>
                    <Input id="prazoMaximo" type="number" defaultValue="5" min="1" max="30" />
                  </div>
                </div>
                <Button variant="outline" onClick={handleSave} disabled={saving}>
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Salvar prazos
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pagamentos */}
          <TabsContent value="pagamentos" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Métodos de Pagamento</CardTitle>
                <CardDescription>Configure quais formas de pagamento sua loja aceita</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {paymentMethods.map((method) => (
                  <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30">
                    <div className="flex items-center gap-4">
                      <input type="checkbox" id={`pay-${method.id}`} defaultChecked={method.enabled} className="h-4 w-4 rounded border-muted" />
                      <label htmlFor={`pay-${method.id}`} className="font-medium cursor-pointer">{method.name}</label>
                      <Badge variant="outline" className="text-xs">{method.fee}</Badge>
                    </div>
                    {method.enabled && (
                      <Button variant="outline" size="sm">Configurar</Button>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Conta Bancária para Recebimentos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-1.5">
                  <Label htmlFor="banco">Banco</Label>
                  <Select defaultValue="bb">
                    <SelectTrigger id="banco"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bb">Banco do Brasil</SelectItem>
                      <SelectItem value="caixa">Caixa Econômica Federal</SelectItem>
                      <SelectItem value="itau">Itaú</SelectItem>
                      <SelectItem value="bradesco">Bradesco</SelectItem>
                      <SelectItem value="santander">Santander</SelectItem>
                      <SelectItem value="nubank">Nubank</SelectItem>
                      <SelectItem value="inter">Inter</SelectItem>
                      <SelectItem value="c6">C6 Bank</SelectItem>
                      <SelectItem value="outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <Label htmlFor="agencia">Agência</Label>
                    <Input id="agencia" placeholder="0000" defaultValue="1234" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="conta">Conta</Label>
                    <Input id="conta" placeholder="00000-0" defaultValue="56789-0" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="tipoConta">Tipo de Conta</Label>
                    <Select defaultValue="corrente">
                      <SelectTrigger id="tipoConta"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="corrente">Corrente</SelectItem>
                        <SelectItem value="poupanca">Poupança</SelectItem>
                        <SelectItem value="pagamento">Conta Pagamento</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="titularConta">Titular</Label>
                    <Input id="titularConta" placeholder="Nome completo" defaultValue="João da Silva" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="cpfTitular">CPF/CNPJ do Titular</Label>
                    <Input id="cpfTitular" placeholder="000.000.000-00" defaultValue="123.456.789-00" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="chavePix">Chave PIX</Label>
                    <Input id="chavePix" placeholder="chave@email.com ou CPF/CNPJ" defaultValue="contato@minhaloja.com" />
                  </div>
                </div>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Salvar conta bancária
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notificações */}
          <TabsContent value="notificacoes" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Preferências de Notificação</CardTitle>
                <CardDescription>Escolha como deseja receber avisos sobre sua loja</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { id: 'novoPedido', label: 'Novos pedidos', email: true, push: true, sms: false },
                  { id: 'pagamentoAprovado', label: 'Pagamentos aprovados', email: true, push: true, sms: false },
                  { id: 'pedidoEnviado', label: 'Pedidos enviados', email: true, push: true, sms: false },
                  { id: 'pedidoEntregue', label: 'Pedidos entregues', email: false, push: true, sms: false },
                  { id: 'cancelamento', label: 'Cancelamentos', email: true, push: true, sms: true },
                  { id: 'estoqueBaixo', label: 'Estoque baixo', email: true, push: false, sms: false },
                  { id: 'avaliacaoNova', label: 'Novas avaliações', email: true, push: true, sms: false },
                  { id: 'perguntaProduto', label: 'Perguntas sobre produtos', email: true, push: true, sms: false },
                  { id: 'relatorioSemanal', label: 'Relatório semanal', email: true, push: false, sms: false },
                  { id: 'promocoes', label: 'Promoções e novidades do marketplace', email: false, push: false, sms: false },
                ].map((notif) => (
                  <div key={notif.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30">
                    <div className="flex items-center gap-4">
                      <input type="checkbox" id={notif.id} defaultChecked={notif.email || notif.push || notif.sms} className="h-4 w-4 rounded border-muted" />
                      <label htmlFor={notif.id} className="font-medium cursor-pointer">{notif.label}</label>
                    </div>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 text-sm text-muted-foreground">
                        <input type="checkbox" defaultChecked={notif.email} className="h-4 w-4 rounded border-muted" /> E-mail
                      </label>
                      <label className="flex items-center gap-2 text-sm text-muted-foreground">
                        <input type="checkbox" defaultChecked={notif.push} className="h-4 w-4 rounded border-muted" /> Push
                      </label>
                      <label className="flex items-center gap-2 text-sm text-muted-foreground">
                        <input type="checkbox" defaultChecked={notif.sms} className="h-4 w-4 rounded border-muted" /> SMS
                      </label>
                    </div>
                  </div>
                ))}
                <Button variant="outline" onClick={handleSave} disabled={saving}>
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Salvar preferências
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Segurança */}
          <TabsContent value="seguranca" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Autenticação de Dois Fatores (2FA)</CardTitle>
                <CardDescription>Adicione uma camada extra de segurança à sua conta</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Autenticador (Google Authenticator, Authy, etc.)</p>
                    <p className="text-sm text-muted-foreground">Gera códigos de 6 dígitos no seu celular</p>
                  </div>
                  <Button variant="outline">Ativar 2FA</Button>
                </div>
                <p className="text-sm text-muted-foreground">A 2FA será exigida para login, saques e alterações sensíveis.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Alterar Senha</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 max-w-md">
                <div className="space-y-1.5">
                  <Label htmlFor="senhaAtual">Senha Atual</Label>
                  <Input id="senhaAtual" type="password" placeholder="••••••••" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="novaSenha">Nova Senha</Label>
                  <Input id="novaSenha" type="password" placeholder="••••••••" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="confirmarSenha">Confirmar Nova Senha</Label>
                  <Input id="confirmarSenha" type="password" placeholder="••••••••" />
                </div>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Alterar senha
                </Button>
              </CardContent>
            </Card>

            <Card className="border-destructive/20">
              <CardHeader>
                <CardTitle className="text-destructive">Zona de Perigo</CardTitle>
                <CardDescription>Ações irreversíveis</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-destructive/20 rounded-lg bg-destructive/5">
                  <div>
                    <p className="font-medium text-destructive">Desativar Loja</p>
                    <p className="text-sm text-muted-foreground">Sua loja ficará invisível para compradores. Produtos e pedidos serão preservados.</p>
                  </div>
                  <Button variant="outline" className="border-destructive/50 text-destructive hover:bg-destructive/10">Desativar</Button>
                </div>
                <div className="flex items-center justify-between p-4 border border-destructive/20 rounded-lg bg-destructive/5">
                  <div>
                    <p className="font-medium text-destructive">Excluir Conta de Vendedor</p>
                    <p className="text-sm text-muted-foreground">Ação irreversível. Todos os dados serão permanentemente removidos.</p>
                  </div>
                  <Button variant="destructive" className="border-destructive/50 hover:bg-destructive/10">Excluir conta</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}