import { Metadata } from 'next'
import Link from 'next/link'
import { Store, Shield, Heart, Star, Zap, Package, Search, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const metadata: Metadata = {
  title: 'Sua Loja Online Completa',
  description: 'Marketplace moderno para comprar e vender com segurança. Milhares de produtos, frete rápido e pagamento facilitado.',
}

const features = [
  { icon: Shield, title: 'Compra Segura', desc: 'Proteção do pagamento à entrega' },
  { icon: Heart, title: 'Devolução Fácil', desc: 'Até 7 dias para trocas e devoluções' },
  { icon: Star, title: 'Avaliações Reais', desc: 'Reviews verificados de compradores' },
]

const categories = [
  { name: 'Eletrônicos', slug: 'eletronicos', count: '2.4k', icon: Zap },
  { name: 'Moda', slug: 'moda', count: '5.1k', icon: Package },
  { name: 'Casa & Decoração', slug: 'casa-decoracao', count: '3.2k', icon: Package },
  { name: 'Beleza', slug: 'beleza', count: '1.8k', icon: Heart },
  { name: 'Esportes', slug: 'esportes', count: '1.5k', icon: Zap },
  { name: 'Brinquedos', slug: 'brinquedos', count: '2.1k', icon: Star },
]

const stats = [
  { value: '50k+', label: 'Produtos' },
  { value: '10k+', label: 'Vendedores' },
  { value: '100k+', label: 'Clientes' },
  { value: '98%', label: 'Satisfação' },
]

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50 via-white to-teal-50 py-20 sm:py-28 lg:py-32">
        <div className="container-main">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="secondary" className="mb-4 text-sm px-3 py-1">
              <Zap className="mr-1.5 h-3.5 w-3.5" /> Novo: Marketplace Pro para vendedores
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-6 animate-in">
              Compre e venda com{' '}
              <span className="gradient-text">confiança total</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-in stagger-1">
              Milhares de produtos, frete rápido, pagamento seguro e suporte dedicado.
              A melhor experiência de marketplace do Brasil.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in stagger-2">
              <Link href="/categorias">
                <Button size="xl" className="w-full sm:w-auto px-8 py-3.5 text-lg">
                  <Search className="mr-2 h-5 w-5" />
                  Explorar Categorias
                </Button>
              </Link>
              <Link href="/vender">
                <Button size="xl" variant="brand-outline" className="w-full sm:w-auto px-8 py-3.5 text-lg">
                  <Store className="mr-2 h-5 w-5" />
                  Começar a Vender
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div className="absolute top-20 left-10 w-72 h-72 bg-brand-100/50 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-72 h-72 bg-teal-100/50 rounded-full blur-3xl" />
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-12 border-y bg-muted/30">
        <div className="container-main">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={stat.label} className="text-center animate-in stagger-3">
                <div className="text-3xl sm:text-4xl font-bold text-brand-600">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section">
        <div className="container-main">
          <div className="text-center mb-12 animate-in">
            <h2 className="text-3xl font-bold text-foreground mb-3">Por que escolher o Marketplace?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Tudo o que você precisa para uma experiência de compra e venda excepcional.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Card key={feature.title} className="card-hover border-muted/50 animate-in stagger-4">
                  <CardContent className="p-6 text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100 text-brand-600">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.desc}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="section bg-muted/30">
        <div className="container-main">
          <div className="flex items-center justify-between mb-8 animate-in">
            <div>
              <h2 className="text-3xl font-bold text-foreground">Categorias Populares</h2>
              <p className="text-muted-foreground mt-1">Encontre o que procura nas nossas principais categorias</p>
            </div>
            <Link href="/categorias" className="text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1 text-sm">
              Ver todas <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category, index) => {
              const Icon = category.icon
              return (
                <Link
                  key={category.slug}
                  href={`/categorias/${category.slug}`}
                  className="group card-hover p-4 rounded-xl bg-background border border-muted/50 text-center animate-in stagger-4"
                >
                  <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-brand-50 text-brand-600 group-hover:bg-brand-100 group-hover:text-brand-700 transition-colors">
                    <Icon className="h-7 w-7" />
                  </div>
                  <h3 className="font-medium text-foreground group-hover:text-brand-600 transition-colors">{category.name}</h3>
                  <p className="text-xs text-muted-foreground">{category.count} produtos</p>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section">
        <div className="container-main">
          <Card className="bg-gradient-to-r from-brand-500 via-brand-600 to-teal-600 overflow-hidden">
            <CardContent className="p-8 md:p-12 text-center text-white relative">
              <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10" aria-hidden="true" />
              <div className="relative z-10 max-w-2xl mx-auto">
                <h2 className="text-3xl sm:text-4xl font-bold mb-4">Quer vender seus produtos?</h2>
                <p className="text-brand-100 mb-8 text-lg">
                  Junte-se a milhares de vendedores e alcance milhões de clientes.
                  Cadastro grátis, comissão justa e suporte completo.
                </p>
                <Link href="/vender">
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