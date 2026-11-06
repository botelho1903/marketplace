import { auth } from '@/lib/auth/config'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const token = req.auth?.user
  const pathname = req.nextUrl.pathname

  // Admin routes - only ADMIN role
  if (pathname.startsWith('/admin')) {
    if ((token as any)?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', req.url))
    }
  }

  // Seller routes - SELLER or ADMIN role
  if (pathname.startsWith('/seller')) {
    if ((token as any)?.role !== 'SELLER' && (token as any)?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/vender', req.url))
    }
  }

  // Auth routes - require authentication
  if (pathname.startsWith('/conta') ||
      pathname.startsWith('/carrinho') ||
      pathname.startsWith('/checkout') ||
      pathname.startsWith('/meus-pedidos') ||
      pathname.startsWith('/favoritos') ||
      pathname.startsWith('/notificacoes')) {
    if (!token) {
      const callbackUrl = encodeURIComponent(pathname)
      return NextResponse.redirect(new URL(`/login?callbackUrl=${callbackUrl}`, req.url))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}