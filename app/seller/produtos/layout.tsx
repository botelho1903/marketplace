import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Gerenciar Produtos',
  description: 'Gerencie os produtos da sua loja.',
}

export default function SellerProdutosLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}