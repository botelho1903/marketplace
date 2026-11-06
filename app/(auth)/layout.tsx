'use client'

import { ReactNode, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import { MainLayout } from '@/components/layout/main-layout'
import { Loader2 } from 'lucide-react'

export default function AuthLayout({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && status === 'unauthenticated') {
      router.push(`/login?callbackUrl=${encodeURIComponent(pathname)}`)
    }
  }, [mounted, status, router, pathname])

  if (!mounted || status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-500" aria-hidden="true" />
        <span className="sr-only">Carregando...</span>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return null
  }

  return <MainLayout>{children}</MainLayout>
}