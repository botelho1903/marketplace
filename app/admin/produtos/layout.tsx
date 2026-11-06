import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Gerenciar Produtos',
  description: 'Gerencie todos os produtos da plataforma.',
}

export default function AdminProdutosLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}