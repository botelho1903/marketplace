import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Financeiro',
  description: 'Gerencie suas finanças, saldos e saques.',
}

export default function SellerFinanceiroLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}