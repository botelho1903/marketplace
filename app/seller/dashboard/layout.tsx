import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard do Vendedor',
  description: 'Painel de controle da sua loja no Marketplace.',
}

export default function SellerDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}