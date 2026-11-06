'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus, Minus, Upload, Image, File, X, Save, Loader2, Package, Settings, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

type ProductType = 'PHYSICAL' | 'DIGITAL' | 'SERVICE' | 'SUBSCRIPTION'

interface DigitalFile {
  id: string
  name: string
  url: string
  size: number
  mimeType: string
  sortOrder: number
}

interface ProductFormData {
  type: ProductType
  name: string
  slug: string
  description: string
  shortDescription: string
  basePrice: number
  salePrice: number | null
  costPrice: number | null
  compareAtPrice: number | null
  stock: number
  lowStockThreshold: number
  trackInventory: boolean
  allowBackorder: boolean
  weight: number | null
  dimensions: { length: number; width: number; height: number } | null
  categoryId: string
  tags: string[]
  metaTitle: string
  metaDescription: string
  isFeatured: boolean

  // Physical product fields
  shippingClass: string
  warehouseLocation: string
  requiresShipping: boolean
  shippingWeight: number | null
  shippingDimensions: { length: number; width: number; height: number } | null

  // Digital product fields
  isDigital: boolean
  digitalFileUrl: string
  digitalDeliveryType: string
  downloadLimit: number
  downloadExpiryDays: number | null
  licenseKeyTemplate: string
  requiresActivation: boolean
  activationUrl: string
  maxActivations: number
  digitalFiles: DigitalFile[]

  images: { url: string; alt: string; isPrimary: boolean }[]
  variants: any[]
  attributes: any[]
}

const initialFormData: ProductFormData = {
  type: 'PHYSICAL',
  name: '',
  slug: '',
  description: '',
  shortDescription: '',
  basePrice: 0,
  salePrice: null,
  costPrice: null,
  compareAtPrice: null,
  stock: 0,
  lowStockThreshold: 5,
  trackInventory: true,
  allowBackorder: false,
  weight: null,
  dimensions: null,
  categoryId: '',
  tags: [],
  metaTitle: '',
  metaDescription: '',
  isFeatured: false,

  // Physical product fields
  shippingClass: 'normal',
  warehouseLocation: '',
  requiresShipping: true,
  shippingWeight: null,
  shippingDimensions: null,

  // Digital product fields
  isDigital: false,
  digitalFileUrl: '',
  digitalDeliveryType: 'DOWNLOAD_LINK',
  downloadLimit: 0,
  downloadExpiryDays: null,
  licenseKeyTemplate: '',
  requiresActivation: false,
  activationUrl: '',
  maxActivations: 1,
  digitalFiles: [],

  images: [],
  variants: [],
  attributes: [],
}

const categories = [
  { id: '1', name: 'Roupas' },
  { id: '2', name: 'Eletrônicos' },
  { id: '3', name: 'Acessórios' },
  { id: '4', name: 'Jogos' },
  { id: '5', name: 'Licenças' },
  { id: '6', name: 'Produtos Oficiais' },
]

const productTypes: { value: ProductType; label: string; description: string; icon: React.ReactNode }[] = [
  {
    value: 'PHYSICAL',
    label: 'Produto Físico',
    description: 'Roupas, eletrônicos, acessórios - requer envio físico',
    icon: <Package className="h-5 w-5" />
  },
  {
    value: 'DIGITAL',
    label: 'Produto Digital',
    description: 'Jogos, licenças, produtos oficiais - entrega digital',
    icon: <File className="h-5 w-5" />
  },
  {
    value: 'SERVICE',
    label: 'Serviço',
    description: 'Serviços prestados - sem estoque físico',
    icon: <Settings className="h-5 w-5" />
  },
  {
    value: 'SUBSCRIPTION',
    label: 'Assinatura',
    description: 'Produtos recorrentes - cobrança periódica',
    icon: <RefreshCw className="h-5 w-5" />
  },
]

const digitalDeliveryTypes = [
  { value: 'DOWNLOAD_LINK', label: 'Link de Download' },
  { value: 'EMAIL', label: 'Entrega por E-mail' },
  { value: 'ACCOUNT', label: 'Entrega na Conta' },
  { value: 'LICENSE_KEY', label: 'Chave de Licença' },
]

const shippingClasses = [
  { value: 'normal', label: 'Normal' },
  { value: 'fragile', label: 'Frágil' },
  { value: 'hazardous', label: 'Perigoso' },
]

export default function NovoProdutoPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<ProductFormData>(initialFormData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState('basic')
  const [imagePreviews, setImagePreviews] = useState<string[]>([])

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleNestedChange = (parent: 'dimensions' | 'shippingDimensions', field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parent]: { ...(prev[parent] as Record<string, any> || {}), [field]: value }
    }))
  }

  const handleTypeChange = (type: ProductType) => {
    const newData = { ...initialFormData, type }
    if (type === 'DIGITAL') {
      newData.isDigital = true
      newData.trackInventory = false
      newData.allowBackorder = true
      newData.requiresShipping = false
    } else if (type === 'SERVICE' || type === 'SUBSCRIPTION') {
      newData.trackInventory = false
      newData.allowBackorder = true
      newData.requiresShipping = false
    }
    setFormData(newData)
    setImagePreviews([])
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    for (const file of files) {
      if (imagePreviews.length + 1 > 10) break
      // In production, upload to storage service and get URL
      const url = URL.createObjectURL(file)
      setImagePreviews(prev => [...prev, url])
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, { url, alt: file.name, isPrimary: prev.images.length === 0 }]
      }))
    }
  }

  const removeImage = (index: number) => {
    setImagePreviews(prev => prev.filter((_, i) => i !== index))
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index).map((img, i) => ({
        ...img,
        isPrimary: i === 0
      }))
    }))
  }

  const addDigitalFile = () => {
    setFormData(prev => ({
      ...prev,
      digitalFiles: [...prev.digitalFiles, {
        id: crypto.randomUUID(),
        name: '',
        url: '',
        size: 0,
        mimeType: '',
        sortOrder: prev.digitalFiles.length,
      }]
    }))
  }

  const removeDigitalFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      digitalFiles: prev.digitalFiles.filter((_, i) => i !== index)
    }))
  }

  const updateDigitalFile = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      digitalFiles: prev.digitalFiles.map((file, i) =>
        i === index ? { ...file, [field]: value } : file
      )
    }))
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value
    handleChange('name', name)
    if (!formData.slug) {
      handleChange('slug', generateSlug(name))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Prepare data for API
      const submitData = {
        ...formData,
        basePrice: Number(formData.basePrice),
        salePrice: formData.salePrice ? Number(formData.salePrice) : null,
        costPrice: formData.costPrice ? Number(formData.costPrice) : null,
        compareAtPrice: formData.compareAtPrice ? Number(formData.compareAtPrice) : null,
        stock: Number(formData.stock),
        lowStockThreshold: Number(formData.lowStockThreshold),
        weight: formData.weight ? Number(formData.weight) : null,
        shippingWeight: formData.shippingWeight ? Number(formData.shippingWeight) : null,
        downloadLimit: Number(formData.downloadLimit),
        downloadExpiryDays: formData.downloadExpiryDays ? Number(formData.downloadExpiryDays) : null,
        maxActivations: Number(formData.maxActivations),
        digitalFiles: formData.digitalFiles.filter(f => f.name && f.url),
      }

      const response = await fetch('/api/produtos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Erro ao criar produto')
      }

      const product = await response.json()
      router.push(`/seller/produtos/${product.slug}`)
    } catch (error) {
      console.error('Error creating product:', error)
      alert(error instanceof Error ? error.message : 'Erro ao criar produto')
    } finally {
      setIsSubmitting(false)
    }
  }

  const isPhysical = formData.type === 'PHYSICAL'
  const isDigital = formData.type === 'DIGITAL'
  const isService = formData.type === 'SERVICE'
  const isSubscription = formData.type === 'SUBSCRIPTION'

  return (
    <div className="section">
      <div className="container-main">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <Link href="/seller/produtos" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-2">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Voltar
            </Link>
            <h1 className="text-3xl font-bold text-foreground">Novo Produto</h1>
            <p className="text-muted-foreground">Preencha as informações do produto</p>
          </div>

          <div className="flex gap-2">
            <Link href="/seller/produtos">
              <Button variant="outline">Cancelar</Button>
            </Link>
            <Button type="submit" form="product-form" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Produto
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Product Type Selection */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Tipo de Produto
            </CardTitle>
            <CardDescription>
              Selecione o tipo de produto para exibir os campos relevantes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {productTypes.map(type => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => handleTypeChange(type.value)}
                  className={cn(
                    'p-4 border-2 rounded-lg transition-all text-left',
                    formData.type === type.value
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50 hover:bg-muted/50'
                  )}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {type.icon}
                    <span className="font-medium">{type.label}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{type.description}</p>
                </button>
              ))}
            </div>
            <Badge
              variant={isPhysical ? 'default' : isDigital ? 'secondary' : isService ? 'outline' : 'destructive'}
              className="mt-4"
            >
              Tipo selecionado: {productTypes.find(t => t.value === formData.type)?.label}
            </Badge>
          </CardContent>
        </Card>

        <form id="product-form" onSubmit={handleSubmit}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Informações Básicas</TabsTrigger>
              <TabsTrigger value={isPhysical ? 'physical' : isDigital ? 'digital' : 'details'}>
                {isPhysical ? 'Detalhes Físicos' : isDigital ? 'Detalhes Digitais' : 'Detalhes'}
              </TabsTrigger>
              <TabsTrigger value="images">Imagens</TabsTrigger>
              <TabsTrigger value="seo">SEO</TabsTrigger>
            </TabsList>

            {/* Basic Info Tab */}
            <TabsContent value="basic" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Informações Principais</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="md:col-span-2">
                      <Label htmlFor="name">Nome do Produto *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={handleNameChange}
                        placeholder="Ex: Camiseta Básica Preta"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="slug">Slug (URL) *</Label>
                      <Input
                        id="slug"
                        value={formData.slug}
                        onChange={e => handleChange('slug', e.target.value)}
                        placeholder="camiseta-basica-preta"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="categoryId">Categoria *</Label>
                      <Select value={formData.categoryId} onValueChange={v => handleChange('categoryId', v)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map(cat => (
                            <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="basePrice">Preço Base (R$) *</Label>
                      <Input
                        id="basePrice"
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={formData.basePrice}
                        onChange={e => handleChange('basePrice', parseFloat(e.target.value) || 0)}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Descrição Completa *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={e => handleChange('description', e.target.value)}
                      placeholder="Descreva o produto em detalhes..."
                      className="min-h-[150px]"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="shortDescription">Descrição Curta</Label>
                    <Textarea
                      id="shortDescription"
                      value={formData.shortDescription}
                      onChange={e => handleChange('shortDescription', e.target.value)}
                      placeholder="Resumo para listagens (máx. 500 caracteres)"
                      className="min-h-[80px]"
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <Label htmlFor="salePrice">Preço Promocional (R$)</Label>
                      <Input
                        id="salePrice"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.salePrice || ''}
                        onChange={e => handleChange('salePrice', e.target.value ? parseFloat(e.target.value) : null)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="costPrice">Preço de Custo (R$)</Label>
                      <Input
                        id="costPrice"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.costPrice || ''}
                        onChange={e => handleChange('costPrice', e.target.value ? parseFloat(e.target.value) : null)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="compareAtPrice">Preço de Comparação (R$)</Label>
                      <Input
                        id="compareAtPrice"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.compareAtPrice || ''}
                        onChange={e => handleChange('compareAtPrice', e.target.value ? parseFloat(e.target.value) : null)}
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <Label htmlFor="stock">Estoque Inicial</Label>
                      <Input
                        id="stock"
                        type="number"
                        min="0"
                        value={formData.stock}
                        onChange={e => handleChange('stock', parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="lowStockThreshold">Alerta de Estoque Baixo</Label>
                      <Input
                        id="lowStockThreshold"
                        type="number"
                        min="0"
                        value={formData.lowStockThreshold}
                        onChange={e => handleChange('lowStockThreshold', parseInt(e.target.value) || 5)}
                      />
                    </div>
                    <div className="flex items-end">
                      <div className="flex items-center gap-2 w-full">
                        <Switch
                          id="trackInventory"
                          checked={formData.trackInventory}
                          onCheckedChange={checked => handleChange('trackInventory', checked)}
                        />
                        <Label htmlFor="trackInventory" className="cursor-pointer mb-0">
                          Controlar estoque
                        </Label>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Switch
                        id="allowBackorder"
                        checked={formData.allowBackorder}
                        onCheckedChange={checked => handleChange('allowBackorder', checked)}
                      />
                      <Label htmlFor="allowBackorder" className="cursor-pointer mb-0">
                        Permitir encomenda (backorder)
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        id="isFeatured"
                        checked={formData.isFeatured}
                        onCheckedChange={checked => handleChange('isFeatured', checked)}
                      />
                      <Label htmlFor="isFeatured" className="cursor-pointer mb-0">
                        Produto em destaque
                      </Label>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="tags">Tags (separadas por vírgula)</Label>
                    <Input
                      id="tags"
                      value={formData.tags.join(', ')}
                      onChange={e => handleChange('tags', e.target.value.split(',').map(t => t.trim()).filter(Boolean))}
                      placeholder="promocao, lancamento, best-seller"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Physical Details Tab */}
            {isPhysical && (
              <TabsContent value="physical" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      Detalhes do Produto Físico
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label htmlFor="shippingClass">Classe de Envio</Label>
                        <Select value={formData.shippingClass} onValueChange={v => handleChange('shippingClass', v)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {shippingClasses.map(sc => (
                              <SelectItem key={sc.value} value={sc.value}>{sc.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="warehouseLocation">Localização no Estoque</Label>
                        <Input
                          id="warehouseLocation"
                          value={formData.warehouseLocation}
                          onChange={e => handleChange('warehouseLocation', e.target.value)}
                          placeholder="Ex: Prateleira A-12, Setor 3"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Switch
                          id="requiresShipping"
                          checked={formData.requiresShipping}
                          onCheckedChange={checked => handleChange('requiresShipping', checked)}
                        />
                        <Label htmlFor="requiresShipping" className="cursor-pointer mb-0">
                          Requer envio físico
                        </Label>
                      </div>
                    </div>

                    <Separator />

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label htmlFor="shippingWeight">Peso para Envio (kg)</Label>
                        <Input
                          id="shippingWeight"
                          type="number"
                          step="0.001"
                          min="0"
                          value={formData.shippingWeight || ''}
                          onChange={e => handleChange('shippingWeight', e.target.value ? parseFloat(e.target.value) : null)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="weight">Peso do Produto (kg)</Label>
                        <Input
                          id="weight"
                          type="number"
                          step="0.001"
                          min="0"
                          value={formData.weight || ''}
                          onChange={e => handleChange('weight', e.target.value ? parseFloat(e.target.value) : null)}
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Dimensões para Envio (cm)</Label>
                      <div className="grid gap-4 md:grid-cols-3">
                        <Input
                          placeholder="Comprimento"
                          type="number"
                          step="0.1"
                          min="0"
                          value={formData.shippingDimensions?.length || ''}
                          onChange={e => handleNestedChange('shippingDimensions', 'length', e.target.value ? parseFloat(e.target.value) : null)}
                        />
                        <Input
                          placeholder="Largura"
                          type="number"
                          step="0.1"
                          min="0"
                          value={formData.shippingDimensions?.width || ''}
                          onChange={e => handleNestedChange('shippingDimensions', 'width', e.target.value ? parseFloat(e.target.value) : null)}
                        />
                        <Input
                          placeholder="Altura"
                          type="number"
                          step="0.1"
                          min="0"
                          value={formData.shippingDimensions?.height || ''}
                          onChange={e => handleNestedChange('shippingDimensions', 'height', e.target.value ? parseFloat(e.target.value) : null)}
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Dimensões do Produto (cm)</Label>
                      <div className="grid gap-4 md:grid-cols-3">
                        <Input
                          placeholder="Comprimento"
                          type="number"
                          step="0.1"
                          min="0"
                          value={formData.dimensions?.length || ''}
                          onChange={e => handleNestedChange('dimensions', 'length', e.target.value ? parseFloat(e.target.value) : null)}
                        />
                        <Input
                          placeholder="Largura"
                          type="number"
                          step="0.1"
                          min="0"
                          value={formData.dimensions?.width || ''}
                          onChange={e => handleNestedChange('dimensions', 'width', e.target.value ? parseFloat(e.target.value) : null)}
                        />
                        <Input
                          placeholder="Altura"
                          type="number"
                          step="0.1"
                          min="0"
                          value={formData.dimensions?.height || ''}
                          onChange={e => handleNestedChange('dimensions', 'height', e.target.value ? parseFloat(e.target.value) : null)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            {/* Digital Details Tab */}
            {isDigital && (
              <TabsContent value="digital" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <File className="h-5 w-5" />
                      Detalhes do Produto Digital
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label htmlFor="digitalDeliveryType">Tipo de Entrega Digital</Label>
                        <Select value={formData.digitalDeliveryType} onValueChange={v => handleChange('digitalDeliveryType', v)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {digitalDeliveryTypes.map(dt => (
                              <SelectItem key={dt.value} value={dt.value}>{dt.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-end">
                        <div className="flex items-center gap-2 w-full">
                          <Switch
                            id="requiresActivation"
                            checked={formData.requiresActivation}
                            onCheckedChange={checked => handleChange('requiresActivation', checked)}
                          />
                          <Label htmlFor="requiresActivation" className="cursor-pointer mb-0">
                            Requer ativação
                          </Label>
                        </div>
                      </div>
                    </div>

                    {formData.requiresActivation && (
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <Label htmlFor="activationUrl">URL de Ativação</Label>
                          <Input
                            id="activationUrl"
                            type="url"
                            value={formData.activationUrl}
                            onChange={e => handleChange('activationUrl', e.target.value)}
                            placeholder="https://seusite.com/ativar"
                          />
                        </div>
                        <div>
                          <Label htmlFor="maxActivations">Máx. Ativações por Chave</Label>
                          <Input
                            id="maxActivations"
                            type="number"
                            min="1"
                            value={formData.maxActivations}
                            onChange={e => handleChange('maxActivations', parseInt(e.target.value) || 1)}
                          />
                        </div>
                      </div>
                    )}

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label htmlFor="downloadLimit">Limite de Downloads (0 = ilimitado)</Label>
                        <Input
                          id="downloadLimit"
                          type="number"
                          min="0"
                          value={formData.downloadLimit}
                          onChange={e => handleChange('downloadLimit', parseInt(e.target.value) || 0)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="downloadExpiryDays">Dias para Expiração do Link</Label>
                        <Input
                          id="downloadExpiryDays"
                          type="number"
                          min="1"
                          value={formData.downloadExpiryDays || ''}
                          onChange={e => handleChange('downloadExpiryDays', e.target.value ? parseInt(e.target.value) : null)}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="licenseKeyTemplate">Template de Chave de Licença (opcional)</Label>
                      <Input
                        id="licenseKeyTemplate"
                        value={formData.licenseKeyTemplate}
                        onChange={e => handleChange('licenseKeyTemplate', e.target.value)}
                        placeholder="XXXXX-XXXXX-XXXXX-XXXXX"
                      />
                    </div>

                    <Separator />

                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <Label>Arquivos Digitais</Label>
                        <Button type="button" variant="outline" size="sm" onClick={addDigitalFile}>
                          <Plus className="mr-2 h-4 w-4" />
                          Adicionar Arquivo
                        </Button>
                      </div>

                      {formData.digitalFiles.length === 0 ? (
                        <p className="text-muted-foreground text-center py-8">
                          Nenhum arquivo adicionado. Clique em "Adicionar Arquivo" para começar.
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {formData.digitalFiles.map((file, index) => (
                            <Card key={file.id} className="p-4">
                              <div className="grid gap-4 md:grid-cols-4">
                                <Input
                                  placeholder="Nome do arquivo"
                                  value={file.name}
                                  onChange={e => updateDigitalFile(index, 'name', e.target.value)}
                                />
                                <Input
                                  placeholder="URL do arquivo"
                                  type="url"
                                  value={file.url}
                                  onChange={e => updateDigitalFile(index, 'url', e.target.value)}
                                />
                                <Input
                                  placeholder="Tamanho (bytes)"
                                  type="number"
                                  min="0"
                                  value={file.size}
                                  onChange={e => updateDigitalFile(index, 'size', parseInt(e.target.value) || 0)}
                                />
                                <Input
                                  placeholder="Tipo MIME"
                                  value={file.mimeType}
                                  onChange={e => updateDigitalFile(index, 'mimeType', e.target.value)}
                                />
                              </div>
                              <div className="flex items-center justify-end gap-2 mt-3">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeDigitalFile(index)}
                                >
                                  <X className="h-4 w-4" />
                                  Remover
                                </Button>
                              </div>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            {/* Images Tab */}
            <TabsContent value="images" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Image className="h-5 w-5" />
                    Imagens do Produto
                  </CardTitle>
                  <CardDescription>
                    Adicione pelo menos uma imagem. A primeira será a imagem principal.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <Label className="block mb-2">Upload de Imagens (máx. 10)</Label>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
                    />
                  </div>

                  {imagePreviews.length === 0 ? (
                    <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                      <Upload className="h-12 w-12 mx-auto text-muted-400 mb-4" />
                      <p className="text-muted-foreground">Nenhuma imagem adicionada</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-square rounded-lg overflow-hidden border">
                            <img src={preview} alt={`Imagem ${index + 1}`} className="w-full h-full object-cover" />
                          </div>
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2 p-2">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="text-white hover:text-red-400"
                              onClick={() => removeImage(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          {formData.images[index]?.isPrimary && (
                            <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground">
                              Principal
                            </Badge>
                          )}
                          <Badge className="absolute bottom-2 right-2" variant="secondary">
                            {index + 1}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* SEO Tab */}
            <TabsContent value="seo" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Configurações de SEO</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="metaTitle">Meta Title</Label>
                    <Input
                      id="metaTitle"
                      value={formData.metaTitle}
                      onChange={e => handleChange('metaTitle', e.target.value)}
                      placeholder="Título para buscadores (máx. 60 caracteres)"
                      maxLength={60}
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      {formData.metaTitle.length}/60 caracteres
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="metaDescription">Meta Description</Label>
                    <Textarea
                      id="metaDescription"
                      value={formData.metaDescription}
                      onChange={e => handleChange('metaDescription', e.target.value)}
                      placeholder="Descrição para buscadores (máx. 160 caracteres)"
                      maxLength={160}
                      className="min-h-[80px]"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      {formData.metaDescription.length}/160 caracteres
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </form>
      </div>
    </div>
  )
}