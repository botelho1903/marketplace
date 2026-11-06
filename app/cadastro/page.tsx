'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, User, Eye, EyeOff, Store, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

const passwordRequirements = [
  { text: 'Mínimo 8 caracteres', test: (p: string) => p.length >= 8 },
  { text: 'Uma letra maiúscula', test: (p: string) => /[A-Z]/.test(p) },
  { text: 'Uma letra minúscula', test: (p: string) => /[a-z]/.test(p) },
  { text: 'Um número', test: (p: string) => /[0-9]/.test(p) },
  { text: 'Um caractere especial', test: (p: string) => /[!@#$%^&*]/.test(p) },
]

export default function CadastroPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    acceptTerms: false,
    receiveOffers: true,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [success, setSuccess] = useState(false)

  const validateField = (name: string, value: string | boolean) => {
    const strValue = typeof value === 'string' ? value : ''
    const boolValue = typeof value === 'boolean' ? value : false

    switch (name) {
      case 'name':
        if (!strValue.trim()) return 'Nome é obrigatório'
        if (strValue.trim().length < 2) return 'Nome deve ter pelo menos 2 caracteres'
        break
      case 'email':
        if (!strValue) return 'E-mail é obrigatório'
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(strValue)) return 'E-mail inválido'
        break
      case 'phone':
        if (strValue && !/^\(\d{2}\)\s\d{4,5}-\d{4}$/.test(strValue)) return 'Formato: (11) 99999-9999'
        break
      case 'password':
        if (!strValue) return 'Senha é obrigatória'
        if (strValue.length < 8) return 'Mínimo 8 caracteres'
        break
      case 'confirmPassword':
        if (strValue !== formData.password) return 'As senhas não coincidem'
        break
      case 'acceptTerms':
        if (!boolValue) return 'Você deve aceitar os termos'
        break
    }
    return ''
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined
    setFormData(prev => ({ ...prev, [name]: checked ?? value }))
    const error = validateField(name, checked ?? value)
    setErrors(prev => ({ ...prev, [name]: error }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const newErrors: Record<string, string> = {}
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key as keyof typeof formData] as string)
      if (error) newErrors[key] = error
    })

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsLoading(true)
    setErrors({})

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || 'Erro ao criar conta')
      }

      setSuccess(true)
      setTimeout(() => router.push('/login?registered=true'), 2000)
    } catch (err) {
      setErrors({ form: err instanceof Error ? err.message : 'Erro ao criar conta. Tente novamente.' })
    } finally {
      setIsLoading(false)
    }
  }

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 2) return `(${numbers}`
    if (numbers.length <= 6) return `(${numbers.slice(0,2)}) ${numbers.slice(2)}`
    if (numbers.length <= 10) return `(${numbers.slice(0,2)}) ${numbers.slice(2,6)}-${numbers.slice(6)}`
    return `(${numbers.slice(0,2)}) ${numbers.slice(2,7)}-${numbers.slice(7,11)}`
  }

  return (
    <div className="section flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2" aria-label="Marketplace Home">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500">
              <Store className="h-7 w-7 text-white" />
            </div>
            <span className="font-bold text-2xl text-foreground">Marketplace</span>
          </Link>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl">Criar sua conta</CardTitle>
            <CardDescription>Preencha seus dados para começar</CardDescription>
          </CardHeader>

          {success && (
            <div className="mx-6 mb-4 p-3 rounded-lg bg-success/10 border border-success/20 text-success text-sm flex items-center gap-2 animate-in">
              <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
              <span>Conta criada com sucesso! Redirecionando...</span>
            </div>
          )}

          {errors.form && (
            <div className="mx-6 mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2 animate-in">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{errors.form}</span>
            </div>
          )}

          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">Nome completo</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="João da Silva"
                    value={formData.name}
                    onChange={handleChange}
                    className={cn("pl-10", errors.name && "border-destructive focus:border-destructive focus:ring-destructive/20")}
                    required
                    autoComplete="name"
                    disabled={isLoading || success}
                  />
                </div>
                {errors.name && <p className="text-sm text-destructive flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.name}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email">E-mail</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    className={cn("pl-10", errors.email && "border-destructive focus:border-destructive focus:ring-destructive/20")}
                    required
                    autoComplete="email"
                    disabled={isLoading || success}
                  />
                </div>
                {errors.email && <p className="text-sm text-destructive flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.email}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="phone">Telefone (opcional)</Label>
                <div className="relative">
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="(11) 99999-9999"
                    value={formData.phone}
                    onChange={(e) => handleChange({ ...e, target: { ...e.target, value: formatPhone(e.target.value) } })}
                    className={cn("pl-10", errors.phone && "border-destructive focus:border-destructive focus:ring-destructive/20")}
                    autoComplete="tel"
                    disabled={isLoading || success}
                  />
                </div>
                {errors.phone && <p className="text-sm text-destructive flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.phone}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    className={cn("pl-10 pr-10", errors.password && "border-destructive focus:border-destructive focus:ring-destructive/20")}
                    required
                    autoComplete="new-password"
                    disabled={isLoading || success}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-sm text-destructive flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.password}</p>}

                {/* Password Strength */}
                {formData.password && (
                  <div className="space-y-2">
                    <div className="flex h-1.5 gap-1" role="progressbar" aria-label="Força da senha">
                      {passwordRequirements.map((req, i) => (
                        <div
                          key={i}
                          className={cn(
                            "flex-1 rounded transition-colors",
                            req.test(formData.password) ? "bg-brand-500" : "bg-muted"
                          )}
                        />
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                      {passwordRequirements.map((req, i) => (
                        <span
                          key={i}
                          className={cn(
                            "flex items-center gap-1",
                            req.test(formData.password) ? "text-success" : "text-muted-foreground"
                          )}
                        >
                          <CheckCircle2 className={cn("h-3 w-3", req.test(formData.password) ? "text-success" : "text-muted-400")} />
                          {req.text}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword">Confirmar senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={cn("pl-10", errors.confirmPassword && "border-destructive focus:border-destructive focus:ring-destructive/20")}
                    required
                    autoComplete="new-password"
                    disabled={isLoading || success}
                  />
                </div>
                {errors.confirmPassword && <p className="text-sm text-destructive flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.confirmPassword}</p>}
              </div>

              <div className="space-y-2">
                <Label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="acceptTerms"
                    checked={formData.acceptTerms}
                    onChange={handleChange}
                    className="mt-1 h-4 w-4 rounded border-muted-300 text-brand-500 focus:ring-brand-500"
                    disabled={isLoading || success}
                    required
                  />
                  <span className="text-sm text-muted-foreground">
                    Aceito os <Link href="/termos" className="text-brand-600 hover:underline">Termos de Uso</Link> e a{' '}
                    <Link href="/privacidade" className="text-brand-600 hover:underline">Política de Privacidade</Link>
                  </span>
                </Label>
                {errors.acceptTerms && <p className="text-sm text-destructive flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.acceptTerms}</p>}

                <Label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="receiveOffers"
                    checked={formData.receiveOffers}
                    onChange={handleChange}
                    className="h-4 w-4 rounded border-muted-300 text-brand-500 focus:ring-brand-500"
                    disabled={isLoading || success}
                  />
                  <span className="text-sm text-muted-foreground">Quero receber ofertas e novidades por e-mail</span>
                </Label>
              </div>

              <Button type="submit" className="w-full" size="lg" loading={isLoading} disabled={success}>
                {success ? (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Conta criada!
                  </>
                ) : (
                  'Criar conta'
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4 pt-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">ou cadastre-se com</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" disabled={isLoading || success} className="gap-2">
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </Button>
              <Button variant="outline" disabled={isLoading || success} className="gap-2">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.305-.536-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                </svg>
                GitHub
              </Button>
            </div>

            <p className="text-center text-sm text-muted-foreground">
              Já tem conta?{' '}
              <Link href="/login" className="font-medium text-brand-600 hover:text-brand-700">
                Entrar
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}