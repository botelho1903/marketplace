import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Favoritos',
  description: 'Seus produtos favoritos salvos para comprar depois.',
}

export default function FavoritosLayout({ children }: { children: React.ReactNode }) {
  return children
}