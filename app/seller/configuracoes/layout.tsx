import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Configurações da Loja',
  description: 'Configure sua loja, preferências e integrações.',
}

export default function SellerConfiguracoesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}