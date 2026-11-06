'use client'

import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  className?: string
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  return (
    <nav className={cn('mb-4', className)} aria-label="Breadcrumb">
      <ol className="flex items-center gap-1.5 text-sm" role="list">
        <li>
          <Link
            href="/"
            className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Home className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only">Início</span>
          </Link>
        </li>
        {items.map((item, index) => (
          <li key={item.label} className="flex items-center gap-1.5">
            <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            {item.href ? (
              <Link
                href={item.href}
                className={cn(
                  'text-muted-foreground hover:text-foreground transition-colors',
                  index === items.length - 1 && 'font-medium text-foreground'
                )}
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={cn(
                  'text-muted-foreground',
                  index === items.length - 1 && 'font-medium text-foreground'
                )}
                aria-current={index === items.length - 1 ? 'page' : undefined}
              >
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}