import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Gerenciar Pedidos',
  description: 'Gerencie os pedidos da sua loja.',
}

export default function SellerPedidosLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}