'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, CheckCircle, CreditCard, QrCode, Banknote, Shield, Save, Loader2, Eye, EyeOff, Copy, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SellerPaymentSettings {
  hasMercadoPagoCredentials: boolean
  mercadopagoPublicKey?: string | null
  mercadopagoUserId?: string | null
  mercadopagoConnectedAt?: Date | null
  pixKey?: string | null
  bankAccount?: Record<string, unknown> | null
  commissionRate: number
  payoutSchedule: string
}

export default function PaymentSettingsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('mercado-pago')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [settings, setSettings] = useState<SellerPaymentSettings | null>(null)
  const [showAccessToken, setShowAccessToken] = useState(false)
  const [formData, setFormData] = useState<{
    mercadopagoAccessToken: string
    mercadopagoPublicKey: string
    mercadopagoUserId: string
    pixKey: string
    commissionRate: number
    payoutSchedule: string
    bankAccount: {
      bankCode: string
      agency: string
      agencyDigit: string
      account: string
      accountDigit: string
      accountType: string
      documentNumber: string
      legalName: string
    }
  }>({
    mercadopagoAccessToken: '',
    mercadopagoPublicKey: '',
    mercadopagoUserId: '',
    pixKey: '',
    commissionRate: 10,
    payoutSchedule: 'weekly',
    bankAccount: {
      bankCode: '',
      agency: '',
      agencyDigit: '',
      account: '',
      accountDigit: '',
      accountType: 'checking',
      documentNumber: '',
      legalName: '',
    },
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [successMessage, setSuccessMessage] = useState('')

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/seller/payment-settings')
      if (response.ok) {
        const data = await response.json()
        setSettings(data)
        if (data.mercadopagoPublicKey) setFormData(prev => ({ ...prev, mercadopagoPublicKey: data.mercadopagoPublicKey }))
        if (data.mercadopagoUserId) setFormData(prev => ({ ...prev, mercadopagoUserId: data.mercadopagoUserId }))
        if (data.pixKey) setFormData(prev => ({ ...prev, pixKey: data.pixKey }))
        if (data.commissionRate) setFormData(prev => ({ ...prev, commissionRate: data.commissionRate }))
        if (data.payoutSchedule) setFormData(prev => ({ ...prev, payoutSchedule: data.payoutSchedule }))
        if (data.bankAccount) setFormData(prev => ({ ...prev, bankAccount: data.bankAccount as any }))
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async (section: string) => {
    setIsSaving(true)
    setErrors({})
    setSuccessMessage('')

    try {
      let payload: any = {}

      if (section === 'mercado-pago') {
        payload = {
          mercadopagoAccessToken: formData.mercadopagoAccessToken || undefined,
          mercadopagoPublicKey: formData.mercadopagoPublicKey || undefined,
          mercadopagoUserId: formData.mercadopagoUserId || undefined,
        }
      } else if (section === 'pix') {
        payload = {
          pixKey: formData.pixKey || undefined,
        }
      } else if (section === 'bank-account') {
        payload = {
          bankAccount: formData.bankAccount,
        }
      } else if (section === 'commission') {
        payload = {
          commissionRate: formData.commissionRate,
          payoutSchedule: formData.payoutSchedule,
        }
      }

      const response = await fetch('/api/seller/payment-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao salvar')
      }

      setSuccessMessage('Configurações salvas com sucesso!')
      await fetchSettings()
    } catch (error) {
      setErrors({ general: error instanceof Error ? error.message : 'Erro ao salvar configurações' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => {
      if (field.includes('.')) {
        const [parent, child] = field.split('.')
        return {
          ...prev,
          [parent]: { ...(prev[parent as keyof typeof prev] as Record<string, any>), [child]: value }
        } as typeof prev
      }
      return { ...prev, [field]: value } as typeof prev
    })
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }))
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setSuccessMessage('Copiado para a área de transferência!')
    setTimeout(() => setSuccessMessage(''), 3000)
  }

  if (isLoading) {
    return (
      <div className="section safe-top safe-bottom pb-20">
        <div className="container-main">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="section safe-top safe-bottom pb-20">
      <div className="container-main">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-6 w-6 text-brand-500" />
            <h1 className="text-2xl font-bold">Configurações de Pagamento</h1>
          </div>
          <p className="text-muted-foreground">
            Configure seus métodos de recebimento, chaves PIX e dados bancários
          </p>
        </div>

        {/* Success/Error Messages */}
        {(successMessage || errors.general) && (
          <div className="mb-6 p-4 rounded-lg border flex items-center gap-3"
            style={{
              backgroundColor: successMessage ? 'rgb(34 197 94 / 0.1)' : 'rgb(239 68 68 / 0.1)',
              borderColor: successMessage ? 'rgb(34 197 94 / 0.3)' : 'rgb(239 68 68 / 0.3)',
              color: successMessage ? 'rgb(34 197 94)' : 'rgb(239 68 68)'
            }}
          >
            {successMessage ? <CheckCircle className="h-5 w-5 flex-shrink-0" /> : <AlertCircle className="h-5 w-5 flex-shrink-0" />}
            <span>{successMessage || errors.general}</span>
          </div>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="mercado-pago">
              <CreditCard className="h-4 w-4 mr-2" />
              Mercado Pago
            </TabsTrigger>
            <TabsTrigger value="pix">
              <QrCode className="h-4 w-4 mr-2" />
              PIX
            </TabsTrigger>
            <TabsTrigger value="bank-account">
              <Banknote className="h-4 w-4 mr-2" />
              Conta Bancária
            </TabsTrigger>
            <TabsTrigger value="commission">
              <Shield className="h-4 w-4 mr-2" />
              Comissão & Repasse
            </TabsTrigger>
          </TabsList>

          {/* Mercado Pago Tab */}
          <TabsContent value="mercado-pago" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-brand-500" />
                      Integração Mercado Pago
                    </CardTitle>
                    <CardDescription>
                      Conecte sua conta do Mercado Pago para receber pagamentos via cartão de crédito, PIX e boleto diretamente
                    </CardDescription>
                  </div>
                  {settings?.hasMercadoPagoCredentials && (
                    <Badge variant="success" className="gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Conectado
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {!settings?.hasMercadoPagoCredentials ? (
                  <div className="space-y-4">
                    <p className="text-muted-foreground">
                      Para receber pagamentos online, você precisa conectar sua conta do Mercado Pago.
                      O Access Token permite que nossa plataforma crie pagamentos em seu nome.
                    </p>
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800 mb-2 font-medium">Como obter suas credenciais:</p>
                      <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                        <li>Acesse <a href="https://www.mercadopago.com.br/developers/panel" target="_blank" rel="noopener noreferrer" className="underline">Mercado Pago Developers</a></li>
                        <li>Crie uma aplicação ou selecione uma existente</li>
                        <li>Copie o <strong>Access Token de produção</strong> (começa com APP_USR-)</li>
                        <li>Opcional: Copie a <strong>Public Key</strong> e seu <strong>User ID</strong></li>
                      </ol>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="accessToken">Access Token de Produção *</Label>
                        <div className="relative">
                          <Input
                            id="accessToken"
                            type={showAccessToken ? 'text' : 'password'}
                            placeholder="APP_USR-..."
                            value={formData.mercadopagoAccessToken}
                            onChange={(e) => handleInputChange('mercadopagoAccessToken', e.target.value)}
                            className="pr-10 min-h-[44px]"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowAccessToken(!showAccessToken)}
                            className="absolute right-3 top-[38px] text-muted-foreground hover:text-foreground"
                          >
                            {showAccessToken ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        </div>
                        {errors.mercadopagoAccessToken && <p className="text-sm text-destructive">{errors.mercadopagoAccessToken}</p>}
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="publicKey">Public Key (Opcional)</Label>
                        <Input
                          id="publicKey"
                          placeholder="APP_USR-..."
                          value={formData.mercadopagoPublicKey}
                          onChange={(e) => handleInputChange('mercadopagoPublicKey', e.target.value)}
                          className="min-h-[44px]"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="userId">User ID (Opcional)</Label>
                        <Input
                          id="userId"
                          placeholder="123456789"
                          value={formData.mercadopagoUserId}
                          onChange={(e) => handleInputChange('mercadopagoUserId', e.target.value)}
                          className="min-h-[44px]"
                        />
                      </div>
                    </div>
                    <Button onClick={() => handleSave('mercado-pago')} disabled={isSaving} className="w-full min-h-[44px]">
                      {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                      Salvar Credenciais
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-green-100 rounded-xl text-green-600">
                          <CheckCircle className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="font-medium text-green-800">Conta conectada com sucesso!</p>
                          <p className="text-sm text-green-700">
                            {settings.mercadopagoConnectedAt && `Conectado em ${new Date(settings.mercadopagoConnectedAt).toLocaleDateString('pt-BR')}`}
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" onClick={() => handleInputChange('mercadopagoAccessToken', '')} className="min-h-[44px]">
                        Desconectar
                      </Button>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <Label>Public Key</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            value={settings.mercadopagoPublicKey || 'Não configurada'}
                            readOnly
                            className="flex-1 min-h-[44px] bg-muted/50"
                          />
                          {settings.mercadopagoPublicKey && (
                            <Button variant="ghost" size="icon" onClick={() => copyToClipboard(settings.mercadopagoPublicKey!)} className="min-h-[44px]">
                              <Copy className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label>User ID</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            value={settings.mercadopagoUserId || 'Não configurado'}
                            readOnly
                            className="flex-1 min-h-[44px] bg-muted/50"
                          />
                          {settings.mercadopagoUserId && (
                            <Button variant="ghost" size="icon" onClick={() => copyToClipboard(settings.mercadopagoUserId!)} className="min-h-[44px]">
                              <Copy className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label>Testar Integração</Label>
                        <Button variant="outline" className="w-full min-h-[44px]" onClick={() => window.open('https://www.mercadopago.com.br/developers/panel', '_blank')}>
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Ir para Painel do Desenvolvedor
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment Methods Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-brand-500" />
                  Métodos de Pagamento Disponíveis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="p-4 bg-brand-50 border border-brand-200 rounded-lg">
                    <CreditCard className="h-8 w-8 text-brand-500 mb-2" />
                    <h4 className="font-medium">Cartão de Crédito</h4>
                    <p className="text-sm text-muted-foreground mt-1">Até 12x com juros do Mercado Pago</p>
                  </div>
                  <div className="p-4 bg-success-50 border border-success-200 rounded-lg">
                    <QrCode className="h-8 w-8 text-success mb-2" />
                    <h4 className="font-medium">PIX</h4>
                    <p className="text-sm text-muted-foreground mt-1">Pagamento instantâneo com QR Code</p>
                  </div>
                  <div className="p-4 bg-warning-50 border border-warning-200 rounded-lg">
                    <Banknote className="h-8 w-8 text-warning mb-2" />
                    <h4 className="font-medium">Boleto</h4>
                    <p className="text-sm text-muted-foreground mt-1">Vencimento em até 3 dias úteis</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* PIX Tab */}
          <TabsContent value="pix" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="h-5 w-5 text-brand-500" />
                  Chave PIX para Recebimento Direto
                </CardTitle>
                <CardDescription>
                  Configure sua chave PIX para receber pagamentos via WhatsApp/dinheiro e transferências diretas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="pixKey">Chave PIX *</Label>
                  <Input
                    id="pixKey"
                    placeholder="CPF, CNPJ, E-mail, Telefone ou Chave Aleatória"
                    value={formData.pixKey}
                    onChange={(e) => handleInputChange('pixKey', e.target.value)}
                    className="min-h-[44px]"
                  />
                  {errors.pixKey && <p className="text-sm text-destructive">{errors.pixKey}</p>}
                </div>
                <p className="text-sm text-muted-foreground">
                  A chave PIX será exibida para compradores que escolherem "Combinar no WhatsApp" ou pagamento em dinheiro.
                  Tipos aceitos: CPF, CNPJ, E-mail, Telefone (com DDD) ou Chave Aleatória.
                </p>
                <Button onClick={() => handleSave('pix')} disabled={isSaving} className="w-full min-h-[44px]">
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                  Salvar Chave PIX
                </Button>
              </CardContent>
            </Card>

            {settings?.pixKey && (
              <Card className="border-success/50 bg-success/5">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-success/10 text-success rounded-xl">
                        <QrCode className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="font-medium text-success">Chave PIX Configurada</p>
                        <p className="text-sm text-muted-foreground font-mono">{settings.pixKey}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => copyToClipboard(settings.pixKey!)} className="min-h-[44px]">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Bank Account Tab */}
          <TabsContent value="bank-account" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Banknote className="h-5 w-5 text-brand-500" />
                  Dados Bancários para Repasse
                </CardTitle>
                <CardDescription>
                  Configure sua conta bancária para receber os repasses das vendas (descontada a comissão da plataforma)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="bankCode">Código do Banco *</Label>
                    <Input
                      id="bankCode"
                      placeholder="Ex: 260 (Nubank), 341 (Itaú), 001 (BB)"
                      value={formData.bankAccount.bankCode}
                      onChange={(e) => handleInputChange('bankAccount.bankCode', e.target.value)}
                      className="min-h-[44px]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="accountType">Tipo de Conta *</Label>
                    <select
                      value={formData.bankAccount.accountType}
                      onChange={(e) => handleInputChange('bankAccount.accountType', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg min-h-[44px]"
                    >
                      <option value="checking">Conta Corrente</option>
                      <option value="savings">Poupança</option>
                      <option value="payment">Conta Pagamento</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="agency">Agência *</Label>
                    <Input
                      id="agency"
                      placeholder="1234"
                      value={formData.bankAccount.agency}
                      onChange={(e) => handleInputChange('bankAccount.agency', e.target.value)}
                      className="min-h-[44px]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="agencyDigit">Dígito da Agência</Label>
                    <Input
                      id="agencyDigit"
                      placeholder="X"
                      value={formData.bankAccount.agencyDigit}
                      onChange={(e) => handleInputChange('bankAccount.agencyDigit', e.target.value)}
                      className="min-h-[44px]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="account">Conta *</Label>
                    <Input
                      id="account"
                      placeholder="123456"
                      value={formData.bankAccount.account}
                      onChange={(e) => handleInputChange('bankAccount.account', e.target.value)}
                      className="min-h-[44px]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="accountDigit">Dígito da Conta *</Label>
                    <Input
                      id="accountDigit"
                      placeholder="X"
                      value={formData.bankAccount.accountDigit}
                      onChange={(e) => handleInputChange('bankAccount.accountDigit', e.target.value)}
                      className="min-h-[44px]"
                    />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="documentNumber">CPF/CNPJ do Titular *</Label>
                    <Input
                      id="documentNumber"
                      placeholder="000.000.000-00 ou 00.000.000/0000-00"
                      value={formData.bankAccount.documentNumber}
                      onChange={(e) => handleInputChange('bankAccount.documentNumber', e.target.value)}
                      className="min-h-[44px]"
                    />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="legalName">Nome Completo / Razão Social *</Label>
                    <Input
                      id="legalName"
                      placeholder="Nome do titular da conta"
                      value={formData.bankAccount.legalName}
                      onChange={(e) => handleInputChange('bankAccount.legalName', e.target.value)}
                      className="min-h-[44px]"
                    />
                  </div>
                </div>
                <Button onClick={() => handleSave('bank-account')} disabled={isSaving} className="w-full min-h-[44px]">
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                  Salvar Dados Bancários
                </Button>
              </CardContent>
            </Card>

            {settings?.bankAccount && Object.keys(settings.bankAccount).length > 0 && (
              <Card className="border-success/50 bg-success/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-success">
                    <CheckCircle className="h-5 w-5" />
                    Conta Bancária Configurada
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 gap-4 text-sm">
                    <div><span className="text-muted-foreground">Banco:</span> <span className="font-medium ml-2">{formData.bankAccount.bankCode}</span></div>
                    <div><span className="text-muted-foreground">Tipo:</span> <span className="font-medium ml-2">{formData.bankAccount.accountType === 'checking' ? 'Conta Corrente' : formData.bankAccount.accountType === 'savings' ? 'Poupança' : 'Conta Pagamento'}</span></div>
                    <div><span className="text-muted-foreground">Agência:</span> <span className="font-medium ml-2">{formData.bankAccount.agency}{formData.bankAccount.agencyDigit ? '-' + formData.bankAccount.agencyDigit : ''}</span></div>
                    <div><span className="text-muted-foreground">Conta:</span> <span className="font-medium ml-2">{formData.bankAccount.account}-{formData.bankAccount.accountDigit}</span></div>
                    <div className="sm:col-span-2"><span className="text-muted-foreground">Titular:</span> <span className="font-medium ml-2">{formData.bankAccount.legalName}</span></div>
                    <div className="sm:col-span-2"><span className="text-muted-foreground">CPF/CNPJ:</span> <span className="font-medium ml-2 font-mono">{formData.bankAccount.documentNumber}</span></div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Commission & Payout Tab */}
          <TabsContent value="commission" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-brand-500" />
                  Comissão da Plataforma & Cronograma de Repasse
                </CardTitle>
                <CardDescription>
                  Configure a taxa de comissão e a frequência dos repasses para sua conta bancária
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-1.5">
                  <Label htmlFor="commissionRate">Taxa de Comissão (%) *</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="commissionRate"
                      type="number"
                      min="0"
                      max="50"
                      step="0.1"
                      value={formData.commissionRate}
                      onChange={(e) => handleInputChange('commissionRate', parseFloat(e.target.value) || 0)}
                      className="w-32 min-h-[44px]"
                    />
                    <span className="text-muted-foreground">% sobre cada venda</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    A comissão é descontada automaticamente de cada venda antes do repasse.
                    Valor padrão da plataforma: 10%
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="payoutSchedule">Frequência de Repasse *</Label>
                  <select
                    id="payoutSchedule"
                    value={formData.payoutSchedule}
                    onChange={(e) => handleInputChange('payoutSchedule', e.target.value)}
                    className="w-full max-w-xs px-3 py-2 border rounded-lg min-h-[44px]"
                  >
                    <option value="daily">Diário (D+1)</option>
                    <option value="weekly">Semanal (Todas as segundas)</option>
                    <option value="biweekly">Quinzenal (Dias 1 e 16)</option>
                    <option value="monthly">Mensal (Dia 1)</option>
                  </select>
                  <p className="text-sm text-muted-foreground">
                    Os repasses são processados apenas para vendas com status "Entregue" ou após o período de garantia.
                    Valores mínimos podem se aplicar.
                  </p>
                </div>

                <Separator />

                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-medium mb-3">Exemplo de Cálculo</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Venda de R$ 100,00</span>
                      <span>R$ 100,00</span>
                    </div>
                    <div className="flex justify-between text-destructive">
                      <span>Comissão ({formData.commissionRate}%)</span>
                      <span>-R$ {(100 * formData.commissionRate / 100).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-success font-medium border-t pt-2">
                      <span>Seu Repasse</span>
                      <span>R$ {(100 * (1 - formData.commissionRate / 100)).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <Button onClick={() => handleSave('commission')} disabled={isSaving} className="w-full min-h-[44px]">
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                  Salvar Configurações de Comissão
                </Button>
              </CardContent>
            </Card>

            {/* Current Settings Display */}
            <Card>
              <CardHeader>
                <CardTitle>Configurações Atuais</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-4 text-sm">
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-muted-foreground">Taxa de Comissão</p>
                    <p className="font-medium text-lg">{settings?.commissionRate || 10}%</p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-muted-foreground">Cronograma de Repasse</p>
                    <p className="font-medium capitalize">{settings?.payoutSchedule || 'weekly'}</p>
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