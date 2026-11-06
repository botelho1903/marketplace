import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Entrar',
  description: 'Acesse sua conta no Marketplace.',
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children
}