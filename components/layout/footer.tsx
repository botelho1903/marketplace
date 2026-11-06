'use client'

import Link from 'next/link'
import { Store, Truck, Shield, RotateCcw, MessageSquare, Facebook, Instagram, Twitter, Youtube } from 'lucide-react'

const footerLinks = {
  'Atendimento': [
    { name: 'Central de Ajuda', href: '/ajuda' },
    { name: 'Como Comprar', href: '/como-comprar' },
    { name: 'Formas de Pagamento', href: '/pagamentos' },
    { name: 'Entrega', href: '/entrega' },
    { name: 'Trocas e Devoluções', href: '/trocas' },
    { name: 'Fale Conosco', href: '/contato' },
  ],
  'Minha Conta': [
    { name: 'Meus Pedidos', href: '/meus-pedidos' },
    { name: 'Meus Favoritos', href: '/favoritos' },
    { name: 'Meus Dados', href: '/conta' },
    { name: 'Endereços', href: '/enderecos' },
    { name: 'Cupons', href: '/cupons' },
    { name: 'Carteira', href: '/carteira' },
  ],
  'Venda no Marketplace': [
    { name: 'Como Vender', href: '/como-vender' },
    { name: 'Central do Vendedor', href: '/vendedor' },
    { name: 'Anuncie Seus Produtos', href: '/anunciar' },
    { name: 'Termos de Uso', href: '/termos-vendedor' },
  ],
  'Empresa': [
    { name: 'Sobre Nós', href: '/sobre' },
    { name: 'Carreiras', href: '/carreiras' },
    { name: 'Imprensa', href: '/imprensa' },
    { name: 'Sustentabilidade', href: '/sustentabilidade' },
    { name: 'Política de Privacidade', href: '/privacidade' },
    { name: 'Termos de Uso', href: '/termos' },
  ],
}

const socialLinks = [
  { name: 'Facebook', icon: Facebook, href: 'https://facebook.com' },
  { name: 'Instagram', icon: Instagram, href: 'https://instagram.com' },
  { name: 'Twitter', icon: Twitter, href: 'https://twitter.com' },
  { name: 'YouTube', icon: Youtube, href: 'https://youtube.com' },
]

const benefits = [
  { icon: Shield, title: 'Compra Segura', description: 'Seus dados protegidos com criptografia' },
  { icon: Truck, title: 'Entrega Rápida', description: 'Envio para todo o Brasil' },
  { icon: RotateCcw, title: 'Troca Fácil', description: 'Devolução grátis em 7 dias' },
  { icon: MessageSquare, title: 'Suporte 24h', description: 'Atendimento humanizado' },
]

const paymentMethods = [
  { name: 'Visa', icon: '💳' },
  { name: 'Mastercard', icon: '💳' },
  { name: 'Elo', icon: '💳' },
  { name: 'Pix', icon: '📱' },
  { name: 'Boleto', icon: '📄' },
  { name: 'Mercado Pago', icon: '💰' },
]

export function Footer() {
  return (
    <footer className="border-t bg-muted/30" role="contentinfo">
      {/* Benefits Bar */}
      <div className="border-b px-4 py-6 md:py-8">
        <div className="mx-auto max-w-7xl grid gap-6 md:grid-cols-4">
          {benefits.map((benefit) => (
            <div key={benefit.title} className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400">
                <benefit.icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground">{benefit.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Links */}
      <div className="px-4 py-10 md:py-16">
        <div className="mx-auto max-w-7xl grid gap-8 md:grid-cols-2 lg:grid-cols-5">
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="mb-4 font-semibold text-foreground">{category}</h4>
              <nav aria-label={category}>
                <ul className="space-y-3">
                  {links.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          ))}
        </div>
      </div>

      {/* Newsletter & Social */}
      <div className="border-t px-4 py-8 md:py-10">
        <div className="mx-auto max-w-7xl grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {/* Brand Info */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4" aria-label="Marketplace Home">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-500">
                <Store className="h-6 w-6 text-white" />
              </div>
              <span className="font-bold text-xl text-foreground">Marketplace</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              O melhor marketplace para você comprar e vender com segurança, praticidade e os melhores preços.
            </p>
            <div className="mt-4 flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-brand-600 transition-colors"
                  aria-label={social.name}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Newsletter */}
          <div className="lg:col-span-1">
            <h4 className="mb-4 font-semibold text-foreground">Newsletter</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Receba ofertas exclusivas e novidades por e-mail.
            </p>
            <form className="flex gap-2" action="/newsletter" method="POST">
              <input
                type="email"
                name="email"
                placeholder="Seu e-mail"
                required
                className="flex-1 h-10 px-4 rounded-lg border bg-background text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                aria-label="E-mail para newsletter"
              />
              <button type="submit" className="h-10 px-4 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 transition-colors">
                Cadastrar
              </button>
            </form>
          </div>

          {/* Payment Methods */}
          <div className="lg:col-span-1">
            <h4 className="mb-4 font-semibold text-foreground">Formas de Pagamento</h4>
            <div className="flex flex-wrap gap-3">
              {paymentMethods.map((method) => (
                <div
                  key={method.name}
                  className="flex h-14 w-20 items-center justify-center gap-1.5 rounded-lg border bg-white px-2 text-xs font-medium text-gray-600"
                >
                  <span aria-hidden="true">{method.icon}</span>
                  <span>{method.name}</span>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Suas informações de pagamento são processadas com segurança. Não armazenamos dados do cartão.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t px-4 py-6">
        <div className="mx-auto max-w-7xl flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-sm text-muted-foreground text-center md:text-left">
            © {new Date().getFullYear()} Marketplace. Todos os direitos reservados.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
            <Link href="/privacidade" className="hover:text-foreground transition-colors">Privacidade</Link>
            <span aria-hidden="true">•</span>
            <Link href="/termos" className="hover:text-foreground transition-colors">Termos de Uso</Link>
            <span aria-hidden="true">•</span>
            <Link href="/cookies" className="hover:text-foreground transition-colors">Cookies</Link>
            <span aria-hidden="true">•</span>
            <Link href="/acessibilidade" className="hover:text-foreground transition-colors">Acessibilidade</Link>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Shield className="h-3 w-3" aria-hidden="true" />
              Site Seguro
            </span>
            <span className="flex items-center gap-1">
              <Store className="h-3 w-3" aria-hidden="true" />
              Made in Brazil
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}