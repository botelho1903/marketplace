import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Notificações',
  description: 'Suas notificações e alertas do Marketplace.',
}

export default function NotificacoesLayout({ children }: { children: React.ReactNode }) {
  return children
}