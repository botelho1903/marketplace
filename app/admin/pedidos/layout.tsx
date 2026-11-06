import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Gerenciar Pedidos',
  description: 'Gerencie todos os pedidos da plataforma.',
}

export default function AdminPedidosLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}