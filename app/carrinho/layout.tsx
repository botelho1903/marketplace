import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Carrinho',
  description: 'Seu carrinho de compras no Marketplace.',
}

export default function CarrinhoLayout({ children }: { children: React.ReactNode }) {
  return children
}