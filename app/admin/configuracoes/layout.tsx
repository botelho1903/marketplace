import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Configurações | Painel Administrativo',
  description: 'Configurações do marketplace - aparência, pagamentos, envios e mais.',
}

export default function AdminConfiguracoesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}