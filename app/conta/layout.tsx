import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Minha Conta',
  description: 'Gerencie sua conta, pedidos, endereços e preferências.',
}

export default function ContaLayout({ children }: { children: React.ReactNode }) {
  return children
}