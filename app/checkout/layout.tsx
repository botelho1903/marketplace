import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Finalizar Compra',
  description: 'Complete seu pedido no Marketplace.',
}

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return children
}