import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Painel Administrativo',
  description: 'Painel de controle administrativo do Marketplace.',
}

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}