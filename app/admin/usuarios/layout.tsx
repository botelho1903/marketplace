import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Gerenciar Usuários',
  description: 'Gerencie usuários, vendedores e administradores da plataforma.',
}

export default function AdminUsuariosLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}