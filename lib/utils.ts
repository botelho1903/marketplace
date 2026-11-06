import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(
  value: number | string,
  currency: string = 'BRL',
  locale: string = 'pt-BR'
): string {
  const numValue = typeof value === 'string' ? parseFloat(value) : value
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(numValue)
}

export function formatNumber(value: number, locale: string = 'pt-BR'): string {
  return new Intl.NumberFormat(locale).format(value)
}

export function formatDate(
  date: Date | string,
  locale: string = 'pt-BR',
  options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }
): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat(locale, options).format(d)
}

export function formatRelativeTime(date: Date | string, locale: string = 'pt-BR'): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffSecs < 60) return 'agora mesmo'
  if (diffMins < 60) return `${diffMins} min atrás`
  if (diffHours < 24) return `${diffHours}h atrás`
  if (diffDays < 7) return `${diffDays}d atrás`
  return formatDate(d, locale)
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export function generateSKU(prefix: string = 'PRD'): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `${prefix}-${timestamp}-${random}`
}

export function generateOrderNumber(): string {
  const date = new Date()
  const year = date.getFullYear().toString().slice(-2)
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `ORD-${year}${month}${day}-${random}`
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text
  return text.slice(0, length).trim() + '...'
}

export function calculateDiscount(originalPrice: number, salePrice: number): number {
  if (originalPrice <= 0) return 0
  return Math.round(((originalPrice - salePrice) / originalPrice) * 100)
}

export function calculateInstallments(
  total: number,
  maxInstallments: number = 12,
  interestRate: number = 0
): Array<{ installments: number; value: number; total: number; hasInterest: boolean }> {
  const results = []
  for (let i = 1; i <= maxInstallments; i++) {
    let value: number
    let totalWithInterest: number
    if (i <= 6 || interestRate === 0) {
      value = total / i
      totalWithInterest = total
    } else {
      const monthlyRate = interestRate / 100
      value = (total * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -i))
      totalWithInterest = value * i
    }
    results.push({
      installments: i,
      value: Math.round(value * 100) / 100,
      total: Math.round(totalWithInterest * 100) / 100,
      hasInterest: i > 6 && interestRate > 0,
    })
  }
  return results
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function maskPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`
  }
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`
  }
  return phone
}

export function maskCPF(cpf: string): string {
  const cleaned = cpf.replace(/\D/g, '')
  if (cleaned.length === 11) {
    return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9)}`
  }
  return cpf
}

export function maskCNPJ(cnpj: string): string {
  const cleaned = cnpj.replace(/\D/g, '')
  if (cleaned.length === 14) {
    return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5, 8)}/${cleaned.slice(8, 12)}-${cleaned.slice(12)}`
  }
  return cnpj
}

export function validateCPF(cpf: string): boolean {
  const cleaned = cpf.replace(/\D/g, '')
  if (cleaned.length !== 11 || /^(\d)\1+$/.test(cleaned)) return false

  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleaned[i]) * (10 - i)
  }
  let digit1 = 11 - (sum % 11)
  if (digit1 >= 10) digit1 = 0

  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleaned[i]) * (11 - i)
  }
  let digit2 = 11 - (sum % 11)
  if (digit2 >= 10) digit2 = 0

  return digit1 === parseInt(cleaned[9]) && digit2 === parseInt(cleaned[10])
}

export function validateCNPJ(cnpj: string): boolean {
  const cleaned = cnpj.replace(/\D/g, '')
  if (cleaned.length !== 14 || /^(\d)\1+$/.test(cleaned)) return false

  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]

  let sum = 0
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cleaned[i]) * weights1[i]
  }
  let digit1 = sum % 11 < 2 ? 0 : 11 - (sum % 11)

  sum = 0
  for (let i = 0; i < 13; i++) {
    sum += parseInt(cleaned[i]) * weights2[i]
  }
  let digit2 = sum % 11 < 2 ? 0 : 11 - (sum % 11)

  return digit1 === parseInt(cleaned[12]) && digit2 === parseInt(cleaned[13])
}

export function validateCEP(cep: string): boolean {
  const cleaned = cep.replace(/\D/g, '')
  return cleaned.length === 8
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }
}

export function omit<T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> {
  const result = { ...obj }
  keys.forEach((key) => delete result[key])
  return result
}

export function pick<T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  const result = {} as Pick<T, K>
  keys.forEach((key) => {
    if (key in obj) result[key] = obj[key]
  })
  return result
}