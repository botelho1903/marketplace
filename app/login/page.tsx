import { Suspense } from 'react'
import { LoginForm } from '@/components/auth/login-form'

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="section flex items-center justify-center p-4"><div className="w-full max-w-md"><div className="animate-pulse space-y-6"><div className="h-12 bg-muted rounded w-1/4 mx-auto"></div><div className="h-80 bg-muted rounded"></div></div></div></div>}>
      <LoginForm />
    </Suspense>
  )
}