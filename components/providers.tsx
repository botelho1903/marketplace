'use client'

import { SessionProvider } from 'next-auth/react'
import { ReactNode } from 'react'
import { Toaster } from '@/components/ui/toast'
import { TooltipProvider } from '@/components/ui/tooltip'
import { ServiceWorkerRegistration } from '@/components/service-worker-registration'

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <TooltipProvider>
        {children}
        <Toaster><></></Toaster>
        <ServiceWorkerRegistration />
      </TooltipProvider>
    </SessionProvider>
  )
}