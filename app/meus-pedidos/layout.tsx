import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Meus Pedidos',
  description: 'Acompanhe seus pedidos e histórico de compras.',
}

export default function MeusPedidosLayout({ children }: { children: React.ReactNode }) {
  return children
}