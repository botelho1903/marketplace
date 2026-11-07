import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth/config'
import { getWebhookRetryStats, manualRetryWebhook } from '@/lib/webhooks/webhook-retry'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status') // pending, failed, dead-letter

    const where: any = {}

    if (status === 'pending') {
      where.nextRetryAt = { lte: new Date() }
      where.attempts = { lt: 5 }
    } else if (status === 'failed') {
      where.nextRetryAt = { gt: new Date() }
      where.attempts = { lt: 5 }
    } else if (status === 'dead-letter') {
      where.attempts = { gte: 5 }
    }

    const [webhooks, total, stats] = await Promise.all([
      prisma.webhookRetry.findMany({
        where,
        orderBy: { nextRetryAt: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.webhookRetry.count({ where }),
      getWebhookRetryStats(),
    ])

    return NextResponse.json({
      webhooks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats,
    })
  } catch (error) {
    console.error('Error fetching webhook retries:', error)
    return NextResponse.json({ message: 'Erro ao buscar webhooks' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    const body = await req.json()
    const { action, webhookId } = body

    if (action === 'retry' && webhookId) {
      const result = await manualRetryWebhook(webhookId)
      return NextResponse.json(result)
    }

    if (action === 'cleanup') {
      const { cleanupOldWebhooks } = await import('@/lib/webhooks/webhook-retry')
      const count = await cleanupOldWebhooks()
      return NextResponse.json({ success: true, cleaned: count })
    }

    return NextResponse.json({ message: 'Ação inválida' }, { status: 400 })
  } catch (error) {
    console.error('Error managing webhook retries:', error)
    return NextResponse.json({ message: 'Erro ao gerenciar webhooks' }, { status: 500 })
  }
}