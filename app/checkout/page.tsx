'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CreditCard, QrCode, Truck, Shield, Check, ChevronRight, Mail, MapPin, Phone, User, Lock, ArrowLeft, MessageSquare, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

const mockCartItems = [
  {
    id: 1,
    name: 'Smartphone Galaxy S24 Ultra 256GB',
    price: 5999.00,
    quantity: 1,
    image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400',
    seller: 'Loja do João',
    sellerPhone: '5511999991111',
    sellerName: 'João Silva',
  },
  {
    id: 2,
    name: 'Tênis Nike Air Max 270 Masculino',
    price: 549.99,
    quantity: 1,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
    seller: 'Loja do João',
    sellerPhone: '5511999991111',
    sellerName: 'João Silva',
  },
]

const steps = [
  { id: 'shipping', label: 'Entrega', icon: Truck },
  { id: 'payment', label: 'Pagamento', icon: CreditCard },
  { id: 'review', label: 'Revisão', icon: Shield },
]

const paymentMethods = [
  { id: 'credit_card', label: 'Cartão de Crédito', icon: CreditCard, description: 'Até 12x sem juros', installments: true },
  { id: 'pix', label: 'PIX', icon: QrCode, description: 'Pagamento instantâneo com 5% de desconto', discount: 0.05 },
  { id: 'boleto', label: 'Boleto Bancário', icon: CreditCard, description: 'Vencimento em 3 dias úteis', installments: false },
  { id: 'whatsapp', label: 'Dinheiro / Combinar no WhatsApp', icon: MessageSquare, description: 'Fale direto com o vendedor e combine a entrega', whatsapp: true },
]

const mockAddresses = [
  { id: '1', name: 'Casa', street: 'Rua das Flores, 123', complement: 'Apto 45', neighborhood: 'Centro', city: 'São Paulo', state: 'SP', cep: '01000-000', isDefault: true },
  { id: '2', name: 'Trabalho', street: 'Av. Paulista, 1000', complement: 'Sala 500', neighborhood: 'Bela Vista', city: 'São Paulo', state: 'SP', cep: '01310-100', isDefault: false },
]

export default function CheckoutPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedAddress, setSelectedAddress] = useState(mockAddresses[0].id)
  const [paymentMethod, setPaymentMethod] = useState('pix')
  const [cardData, setCardData] = useState({ number: '', name: '', expiry: '', cvv: '' })
  const [installments, setInstallments] = useState(1)
  const [coupon, setCoupon] = useState('')
  const [notes, setNotes] = useState('')
  // Simplified buyer info - only name and phone for WhatsApp payment
  const [buyerName, setBuyerName] = useState('')
  const [buyerPhone, setBuyerPhone] = useState('')
  const [showBuyerForm, setShowBuyerForm] = useState(false)

  const subtotal = mockCartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = subtotal >= 199 ? 0 : 29.90
  const discount = paymentMethod === 'pix' ? subtotal * 0.05 : 0
  const total = subtotal + shipping - discount

  const goNext = () => {
    // If WhatsApp payment selected on payment step, show buyer info form
    if (currentStep === 1 && paymentMethod === 'whatsapp') {
      setShowBuyerForm(true)
      return
    }
    setCurrentStep(prev => Math.min(prev + 1, steps.length - 1))
  }

  const goBack = () => setCurrentStep(prev => Math.max(prev - 1, 0))

  const handleWhatsAppPayment = () => {
    if (!buyerName.trim() || !buyerPhone.trim()) {
      alert('Por favor, preencha seu nome e WhatsApp para continuar')
      return
    }

    // Generate WhatsApp message
    const itemsText = mockCartItems.map(item =>
      `• ${item.name} (Qtd: ${item.quantity}) - R$ ${(item.price * item.quantity).toFixed(2)}`
    ).join('\n')

    const message = `Olá ${mockCartItems[0].sellerName}! 👋

Gostaria de comprar os seguintes produtos:

${itemsText}

📦 *Total: R$ ${total.toFixed(2)}*
${shipping === 0 ? '🚚 Frete grátis!' : `🚚 Frete: R$ ${shipping.toFixed(2)}`}

👤 *Comprador:* ${buyerName}
📱 *WhatsApp:* ${buyerPhone}
📍 *Endereço:* ${mockAddresses.find(a => a.id === selectedAddress)?.street}, ${mockAddresses.find(a => a.id === selectedAddress)?.city}/${mockAddresses.find(a => a.id === selectedAddress)?.state}

Gostaria de combinar o pagamento em dinheiro e a entrega. Podemos conversar?

Obrigado!`

    const encodedMessage = encodeURIComponent(message)
    const sellerPhone = mockCartItems[0].sellerPhone
    const whatsappUrl = `https://wa.me/${sellerPhone}?text=${encodedMessage}`

    // Open WhatsApp in new tab
    window.open(whatsappUrl, '_blank')

    // Show success message
    alert('Redirecionando para o WhatsApp do vendedor! Combine os detalhes da entrega e pagamento diretamente com ele.')

    // Optionally clear cart or redirect to success page
    router.push('/pedido-enviado-whatsapp')
  }

  return (
    <div className="section safe-top safe-bottom pb-20">
      <div className="container-main">
        {/* Progress Steps */}
        <div className="mb-8 animate-in">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex flex-col items-center relative">
                <div className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium transition-colors',
                  index < currentStep
                    ? 'bg-brand-500 text-white'
                    : index === currentStep
                    ? 'bg-brand-500 text-white ring-4 ring-brand-500/20'
                    : 'bg-muted text-muted-foreground'
                )}>
                  {index < currentStep ? <Check className="h-5 w-5" /> : <step.icon className="h-5 w-5" />}
                </div>
                <span className={cn('mt-2 text-xs font-medium', index <= currentStep ? 'text-foreground' : 'text-muted-foreground')}>
                  {step.label}
                </span>
                {index < steps.length - 1 && (
                  <div className={cn(
                    'absolute top-5 left-1/2 w-full h-1 -translate-x-1/2',
                    index < currentStep ? 'bg-brand-500' : 'bg-muted'
                  )} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2 space-y-6 animate-in">
            {/* Step 1: Shipping */}
            {currentStep === 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5 text-brand-500" />
                    Endereço de Entrega
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {mockAddresses.map((address) => (
                      <label key={address.id} className={cn(
                        'relative flex cursor-pointer items-center p-4 rounded-lg border-2 transition-colors min-h-[44px]',
                        selectedAddress === address.id
                          ? 'border-brand-500 bg-brand-50'
                          : 'border-muted hover:border-brand-300'
                      )}>
                        <input
                          type="radio"
                          name="address"
                          value={address.id}
                          checked={selectedAddress === address.id}
                          onChange={() => setSelectedAddress(address.id)}
                          className="sr-only"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{address.name}</span>
                            {address.isDefault && <Badge variant="secondary" className="text-xs">Padrão</Badge>}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {address.street}, {address.complement} - {address.neighborhood}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {address.city}/{address.state} - {address.cep}
                          </p>
                        </div>
                        <div className={cn('h-5 w-5 rounded-full border-2 flex items-center justify-center', selectedAddress === address.id ? 'border-brand-500 bg-brand-500' : 'border-muted')}>
                          {selectedAddress === address.id && <Check className="h-3 w-3 text-white" />}
                        </div>
                      </label>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full min-h-[44px]" onClick={() => {}}>
                    <MapPin className="mr-2 h-4 w-4" />
                    Adicionar novo endereço
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Payment */}
            {currentStep === 1 && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-brand-500" />
                      Forma de Pagamento
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                      {paymentMethods.map((method) => (
                        <label key={method.id} className={cn(
                          'relative flex cursor-pointer items-center p-4 rounded-lg border-2 transition-colors min-h-[44px]',
                          paymentMethod === method.id
                            ? 'border-brand-500 bg-brand-50'
                            : 'border-muted hover:border-brand-300'
                        )}>
                          <RadioGroupItem value={method.id} className="sr-only" />
                          <div className="flex items-center gap-4 flex-1">
                            <div className={cn('p-3 rounded-xl', method.whatsapp ? 'bg-green-100 text-green-600' : 'bg-brand-100 text-brand-600')}>
                              <method.icon className="h-6 w-6" />
                            </div>
                            <div>
                              <p className="font-medium">{method.label}</p>
                              <p className="text-sm text-muted-foreground">{method.description}</p>
                            </div>
                            {method.discount && (
                              <Badge variant="secondary" className="bg-success/10 text-success">
                                {Math.round(method.discount * 100)}% OFF
                              </Badge>
                            )}
                            {method.whatsapp && (
                              <Badge variant="secondary" className="bg-green-100 text-green-700">
                                Sem cadastro
                              </Badge>
                            )}
                          </div>
                        </label>
                      ))}
                    </RadioGroup>
                  </CardContent>
                </Card>

                {paymentMethod === 'credit_card' && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Dados do Cartão</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5 sm:col-span-2">
                          <Label htmlFor="cardNumber">Número do Cartão</Label>
                          <Input
                            id="cardNumber"
                            placeholder="0000 0000 0000 0000"
                            value={cardData.number}
                            onChange={(e) => setCardData({ ...cardData, number: e.target.value.replace(/\D/g, '').replace(/(\d{4})/g, '$1 ').trim() })}
                            maxLength={19}
                            className="min-h-[44px]"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="cardName">Nome no Cartão</Label>
                          <Input
                            id="cardName"
                            placeholder="JOAO DA SILVA"
                            value={cardData.name}
                            onChange={(e) => setCardData({ ...cardData, name: e.target.value.toUpperCase() })}
                            className="min-h-[44px]"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="cardExpiry">Validade</Label>
                          <Input
                            id="cardExpiry"
                            placeholder="MM/AA"
                            value={cardData.expiry}
                            onChange={(e) => {
                              let v = e.target.value.replace(/\D/g, '')
                              if (v.length >= 2) v = v.slice(0,2) + '/' + v.slice(2,4)
                              setCardData({ ...cardData, expiry: v })
                            }}
                            maxLength={5}
                            className="min-h-[44px]"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="cardCvv">CVV</Label>
                          <Input
                            id="cardCvv"
                            type="password"
                            placeholder="***"
                            value={cardData.cvv}
                            onChange={(e) => setCardData({ ...cardData, cvv: e.target.value.replace(/\D/g, '').slice(0,4) })}
                            maxLength={4}
                            className="min-h-[44px]"
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label>Parcelamento</Label>
                        <select
                          value={installments}
                          onChange={(e) => setInstallments(parseInt(e.target.value))}
                          className="w-full px-3 py-2 border rounded-lg min-h-[44px]"
                        >
                          {[1,2,3,4,5,6,7,8,9,10,11,12].map(n => (
                            <option key={n} value={n}>
                              {n}x {n === 1 ? 'sem juros' : `R$ ${(total / n).toFixed(2)}`} {n > 1 && n <= 12 ? '(com juros)' : ''}
                            </option>
                          ))}
                        </select>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {paymentMethod === 'pix' && (
                  <Card className="border-success/50 bg-success/5">
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className="p-3 rounded-xl bg-success/10 text-success">
                        <QrCode className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="font-medium text-success">Pague com PIX e ganhe 5% de desconto</p>
                        <p className="text-sm text-muted-foreground">Desconto de R$ {discount.toFixed(2)} aplicado automaticamente</p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {paymentMethod === 'whatsapp' && (
                  <Card className="border-green-200 bg-green-50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-green-700">
                        <MessageSquare className="h-5 w-5" />
                        Pagamento via WhatsApp
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="p-4 bg-white rounded-lg border border-green-100">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-3 rounded-xl bg-green-100 text-green-600">
                            <MessageSquare className="h-6 w-6" />
                          </div>
                          <div>
                            <p className="font-medium text-green-700">Como funciona</p>
                            <p className="text-sm text-green-600">Você será direcionado para o WhatsApp do vendedor para combinar pagamento em dinheiro e entrega</p>
                          </div>
                        </div>
                        <ul className="text-sm text-green-600 space-y-1">
                          <li className="flex items-center gap-2">✅ Sem necessidade de cadastro</li>
                          <li className="flex items-center gap-2">✅ Combine direto com o vendedor</li>
                          <li className="flex items-center gap-2">✅ Pague na entrega (dinheiro/PIX)</li>
                          <li className="flex items-center gap-2">✅ Combinem o local e horário</li>
                        </ul>
                      </div>

                      {/* Buyer Info Form - Only for WhatsApp payment */}
                      <div className="space-y-4 p-4 bg-white rounded-lg border border-green-100">
                        <h4 className="font-medium text-green-700 flex items-center gap-2">
                          <User className="h-5 w-5" />
                          Seus dados para o vendedor
                        </h4>
                        <p className="text-sm text-green-600">Preencha apenas nome e WhatsApp - o vendedor receberá essas infos no chat</p>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <Label htmlFor="buyerName">Seu nome *</Label>
                            <Input
                              id="buyerName"
                              placeholder="João da Silva"
                              value={buyerName}
                              onChange={(e) => setBuyerName(e.target.value)}
                              className="min-h-[44px]"
                              required
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="buyerPhone">Seu WhatsApp *</Label>
                            <Input
                              id="buyerPhone"
                              placeholder="(11) 99999-9999"
                              value={buyerPhone}
                              onChange={(e) => setBuyerPhone(e.target.value.replace(/\D/g, '').replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3'))}
                              maxLength={15}
                              className="min-h-[44px]"
                              required
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {paymentMethod === 'boleto' && (
                  <Card className="border-warning/50 bg-warning/5">
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className="p-3 rounded-xl bg-warning/10 text-warning">
                        <DollarSign className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="font-medium text-warning">Pague com Boleto Bancário</p>
                        <p className="text-sm text-muted-foreground">Vencimento em 3 dias úteis. O pedido será liberado após compensação.</p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Mail className="h-5 w-5 text-brand-500" />
                      Cupom de Desconto
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Digite seu cupom"
                        value={coupon}
                        onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                        className="flex-1 min-h-[44px]"
                      />
                      <Button variant="outline" className="min-h-[44px]">Aplicar</Button>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Step 3: Review */}
            {currentStep === 2 && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-brand-500" />
                      Endereço de Entrega
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <MapPin className="h-5 w-5 text-brand-500 mt-0.5" />
                      <div>
                        {(() => {
                          const addr = mockAddresses.find(a => a.id === selectedAddress)
                          return (
                            <>
                              <p className="font-medium">{addr?.name}</p>
                              <p className="text-sm text-muted-foreground">{addr?.street}, {addr?.complement}</p>
                              <p className="text-sm text-muted-foreground">{addr?.neighborhood} - {addr?.city}/{addr?.state} - {addr?.cep}</p>
                            </>
                          )
                        })()}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="mt-3 min-h-[44px]" onClick={() => setCurrentStep(0)}>
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Alterar endereço
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-brand-500" />
                      Pagamento
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      const method = paymentMethods.find(m => m.id === paymentMethod)
                      const PaymentIcon = method?.icon
                      return (
                        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                          <div className={cn('p-2 rounded-lg', method?.whatsapp ? 'bg-green-100 text-green-600' : 'bg-brand-100 text-brand-600')}>
                            {PaymentIcon && <PaymentIcon className="h-5 w-5" />}
                          </div>
                          <div>
                            <p className="font-medium">{method?.label}</p>
                            {paymentMethod === 'credit_card' && (
                              <p className="text-sm text-muted-foreground">{installments}x de R$ {(total / installments).toFixed(2)}</p>
                            )}
                            {paymentMethod === 'whatsapp' && (
                              <p className="text-sm text-green-600">Será redirecionado para o WhatsApp do vendedor</p>
                            )}
                          </div>
                        </div>
                      )
                    })()}
                    <Button variant="ghost" size="sm" className="mt-3 min-h-[44px]" onClick={() => setCurrentStep(1)}>
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Alterar pagamento
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-brand-500" />
                      Observações (opcional)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 min-h-[44px]"
                      placeholder="Instruções de entrega, horários preferenciais, etc."
                    />
                  </CardContent>
                </Card>
              </>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-4">
              {currentStep > 0 && (
                <Button variant="outline" onClick={goBack} className="min-h-[44px]">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar
                </Button>
              )}
              {currentStep < steps.length - 1 ? (
                <Button onClick={goNext} size="lg" className="min-h-[44px]">
                  Continuar <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                paymentMethod === 'whatsapp' ? (
                  <Button onClick={handleWhatsAppPayment} size="lg" className="w-full sm:w-auto min-h-[44px] bg-green-600 hover:bg-green-700">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Ir para WhatsApp do Vendedor
                  </Button>
                ) : (
                  <Button onClick={() => alert('Pedido finalizado!')} size="lg" className="w-full sm:w-auto min-h-[44px]">
                    <Lock className="mr-2 h-4 w-4" />
                    Finalizar Pedido - R$ {total.toFixed(2)}
                  </Button>
                )
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="animate-in stagger-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Resumo do Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {mockCartItems.map((item) => (
                    <Link key={item.id} href={`/produtos/${item.name.toLowerCase().replace(/\s+/g, '-')}`} className="flex gap-3 p-2">
                      <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded bg-muted/50">
                        <Image src={item.image} alt={item.name} fill className="object-cover" sizes="64px" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium line-clamp-1">{item.name}</p>
                        <p className="text-xs text-muted-foreground">Qtd: {item.quantity}</p>
                      </div>
                      <span className="text-sm font-medium text-foreground">R$ {(item.price * item.quantity).toFixed(2)}</span>
                    </Link>
                  ))}
                </div>

                <Separator />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal ({mockCartItems.length} itens)</span>
                    <span>R$ {subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Frete</span>
                    <span className={shipping === 0 ? 'text-success' : ''}>
                      {shipping === 0 ? 'Grátis' : `R$ ${shipping.toFixed(2)}`}
                    </span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-success">
                      <span>Desconto PIX (5%)</span>
                      <span>-R$ {discount.toFixed(2)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>R$ {total.toFixed(2)}</span>
                  </div>
                </div>

                {paymentMethod === 'whatsapp' && (
                  <div className="p-3 bg-green-50 border border-green-100 rounded-lg">
                    <p className="text-sm font-medium text-green-700 flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Pagamento combinado no WhatsApp
                    </p>
                    <p className="text-xs text-green-600 mt-1">Sem taxas • Direto com o vendedor • Pague na entrega</p>
                  </div>
                )}

                <div className="pt-4 space-y-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    <span>Compra segura - Seus dados protegidos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4" />
                    <span>Frete grátis acima de R$ 199</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    <span>Parcele em até 12x no cartão</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}