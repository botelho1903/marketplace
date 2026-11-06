import { Metadata } from 'next'
import Link from 'next/link'
import { Store, Shield, Truck, BarChart2, Users, CreditCard, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const metadata: Metadata = {
  title: 'Seja Vendedor',
  description: 'Abra sua loja no Marketplace e alcance milhões de clientes. Cadastro grátis, comissão justa.',
}

const benefits = [
  { icon: Users, title: 'Milhões de clientes', desc: 'Acesso imediato a uma base de mais de 100k compradores ativos' },
  { icon: CreditCard, title: 'Recebimento rápido', desc: 'Pagamentos liberados em até 14 dias após a entrega confirmada' },
  { icon: Shield, title: 'Proteção ao vendedor', desc: 'Seguro contra chargebacks e fraudes em vendas elegíveis' },
  { icon: Truck, title: 'Logística integrada', desc: 'Parceria com Correios e transportadoras com até 50% de desconto' },
  { icon: BarChart2, title: 'Dashboard completo', desc: 'Gestão de estoque, pedidos, métricas e relatórios em tempo real' },
  { icon: Sparkles, title: 'Suporte dedicado', desc: 'Equipe especializada para ajudar seu negócio a crescer' },
]

const plans = [
  {
    name: 'Iniciante',
    price: 'Grátis',
    commission: '12%',
    features: [
      'Até 50 produtos ativos',
      'Comissão 12% por venda',
      'Dashboard básico',
      'Suporte por e-mail (48h)',
      'Pagamento em 14 dias',
      'Frete com desconto padrão',
    ],
    cta: 'Começar grátis',
    popular: false,
  },
  {
    name: 'Profissional',
    price: 'R$ 99/mês',
    commission: '8%',
    features: [
      'Produtos ilimitados',
      'Comissão 8% por venda',
      'Dashboard avançado + relatórios',
      'Suporte prioritário (chat/telefone)',
      'Pagamento em 7 dias',
      'Frete com desconto premium',
      'Loja personalizada (subdomínio)',
      'Ferramentas de marketing',
    ],
    cta: 'Assinar Professional',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 'Sob consulta',
    commission: '5%',
    features: [
      'Tudo do Professional',
      'Comissão 5% por venda',
      'Gerente de conta dedicado',
      'API para integração ERP',
      'Pagamento em 2 dias',
      'Frete grátis ilimitado',
      'SLA garantido 99.9%',
      'Treinamento da equipe',
    ],
    cta: 'Falar com vendas',
    popular: false,
  },
]

const steps = [
  { number: '01', title: 'Cadastro', desc: 'Preencha seus dados e crie sua conta de vendedor' },
  { number: '02', title: 'Documentos', desc: 'Envie CPF/CNPJ, comprovante de endereço e conta bancária' },
  { number: '03', title: 'Aprovação', desc: 'Análise em até 24h úteis. Acompanhe pelo painel' },
  { number: '04', title: 'Primeira venda', desc: 'Cadastre produtos e comece a vender no mesmo dia' },
]

export default function VenderPage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50 via-white to-teal-50 py-20 sm:py-28 lg:py-32">
        <div className="container-main">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="secondary" className="mb-4 text-sm px-3 py-1">
              <Sparkles className="mr-1.5 h-3.5 w-3.5" /> Nova comissão reduzida por tempo limitado
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-6 animate-in">
              Transforme seu negócio no{' '}
              <span className="gradient-text">Marketplace</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-in stagger-1">
              Junte-se a mais de 10.000 vendedores. Cadastro gratuito, sem fidelidade e comissão a partir de 5%.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in stagger-2">
              <Link href="/cadastro?type=seller">
                <Button size="xl" className="w-full sm:w-auto px-8 py-3.5 text-lg">
                  <Store className="mr-2 h-5 w-5" />
                  Criar Minha Loja Grátis
                </Button>
              </Link>
              <Link href="#planos">
                <Button size="xl" variant="brand-outline" className="w-full sm:w-auto px-8 py-3.5 text-lg">
                  Ver Planos <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground animate-in stagger-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <span>Sem taxa de adesão</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <span>Cancela quando quiser</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <span>Pagamento garantido</span>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div className="absolute top-20 left-10 w-72 h-72 bg-brand-100/50 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-72 h-72 bg-teal-100/50 rounded-full blur-3xl" />
        </div>
      </section>

      {/* Benefits */}
      <section className="section">
        <div className="container-main">
          <div className="text-center mb-12 animate-in">
            <h2 className="text-3xl font-bold text-foreground mb-3">Por que vender no Marketplace?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Tudo que você precisa para escalar suas vendas online com segurança e praticidade.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon
              return (
                <Card key={benefit.title} className="card-hover border-muted/50 animate-in stagger-1">
                  <CardContent className="p-6">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">{benefit.title}</h3>
                    <p className="text-sm text-muted-foreground">{benefit.desc}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="section bg-muted/30">
        <div className="container-main">
          <div className="text-center mb-12 animate-in">
            <h2 className="text-3xl font-bold text-foreground mb-3">Como funciona</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Do cadastro à primeira venda em 4 passos simples</p>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {steps.map((step, index) => (
              <div key={step.number} className="relative text-center animate-in stagger-1">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-500 text-white font-bold text-2xl">
                  {step.number}
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-1/2 w-full h-0.5 bg-gradient-to-r from-brand-500 to-transparent" />
                )}
                <h3 className="font-semibold text-foreground mb-1">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Plans */}
      <section id="planos" className="section">
        <div className="container-main">
          <div className="text-center mb-12 animate-in">
            <h2 className="text-3xl font-bold text-foreground mb-3">Planos flexíveis para seu negócio</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Escolha o plano ideal. Pode alterar ou cancelar a qualquer momento.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                className={`relative flex flex-col ${plan.popular ? 'border-brand-500 ring-2 ring-brand-500/20' : 'border-muted/50'}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-brand-500 text-white px-3 py-1">Mais popular</Badge>
                  </div>
                )}
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                    {plan.commission && <span className="text-muted-foreground">• Comissão {plan.commission}</span>}
                  </div>
                </CardHeader>
                <CardContent className="flex-1 space-y-3">
                  <ul className="space-y-3">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                        <span className="text-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <div className="p-4 pt-0">
                  <Link href={plan.name === 'Enterprise' ? '/contato-vendas' : '/cadastro?type=seller'}>
                    <Button
                      className="w-full"
                      variant={plan.popular ? 'brand' : 'outline'}
                      size="lg"
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section bg-muted/30">
        <div className="container-main max-w-3xl">
          <div className="text-center mb-10 animate-in">
            <h2 className="text-3xl font-bold text-foreground mb-3">Dúvidas frequentes</h2>
          </div>
          <dl className="space-y-4">
            {[
              { q: 'Preciso ter CNPJ para vender?', a: 'Não. Você pode começar como pessoa física (CPF) e migrar para CNPJ depois. Para volumes maiores, recomendamos CNPJ.' },
              { q: 'Como recebo os pagamentos?', a: 'Os valores ficam disponíveis no seu painel. Você pode solicitar transferência para sua conta bancária (TED/PIX) a qualquer momento.' },
              { q: 'Qual o prazo de aprovação?', a: 'A análise de documentos leva até 24h úteis. Você recebe notificação por e-mail e pode acompanhar o status no painel.' },
              { q: 'Posso cancelar a qualquer momento?', a: 'Sim, sem multa nem fidelidade. Basta não renovar o plano pago ou desativar a loja no plano gratuito.' },
              { q: 'Como funciona o frete?', a: 'Temos parceria com Correios e transportadoras. Você gera as etiquetas no painel com desconto e o comprador paga o frete (ou você oferece grátis).' },
            ].map((faq, i) => (
              <div key={i} className="animate-in stagger-1">
                <dt className="font-medium text-foreground mb-1">{faq.q}</dt>
                <dd className="text-sm text-muted-foreground">{faq.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* CTA Final */}
      <section className="section">
        <div className="container-main">
          <Card className="bg-gradient-to-r from-brand-500 via-brand-600 to-teal-600 overflow-hidden">
            <CardContent className="p-8 md:p-12 text-center text-white relative">
              <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10" aria-hidden="true" />
              <div className="relative z-10 max-w-2xl mx-auto">
                <h2 className="text-3xl sm:text-4xl font-bold mb-4">Pronto para começar?</h2>
                <p className="text-brand-100 mb-8 text-lg">
                  Cadastre-se grátis hoje e faça sua primeira venda esta semana.
                  Sem risco, sem compromisso.
                </p>
                <Link href="/cadastro?type=seller">
                  <Button size="xl" variant="secondary" className="w-full sm:w-auto px-8 py-3.5 text-lg">
                    <Store className="mr-2 h-5 w-5" />
                    Criar Minha Loja Grátis
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}