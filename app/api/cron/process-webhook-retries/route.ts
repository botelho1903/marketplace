import { NextRequest, NextResponse } from 'next/server'
import { processWebhookRetries, getWebhookRetryStats, cleanupOldWebhooks } from '@/lib/webhooks/webhook-retry'

// This endpoint should be called by a cron job (e.g., Vercel Cron, GitHub Actions, or external cron)
// Configure to run every 1-5 minutes
export async function GET(req: NextRequest) {
  try {
    // Verify cron secret to prevent unauthorized access
    const cronSecret = req.headers.get('x-cron-secret') || req.nextUrl.searchParams.get('secret')
    const expectedSecret = process.env.CRON_SECRET

    if (expectedSecret && cronSecret !== expectedSecret) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    // Process pending webhook retries
    const result = await processWebhookRetries()

    // Clean up old webhooks (optional, run less frequently)
    const cleanupResult = await cleanupOldWebhooks()

    // Get current stats
    const stats = await getWebhookRetryStats()

    return NextResponse.json({
      success: true,
      processed: result.processed,
      succeeded: result.succeeded,
      failed: result.failed,
      cleanup: cleanupResult,
      stats,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Cron webhook retry error:', error)
    return NextResponse.json(
      { message: 'Erro ao processar webhooks', error: error instanceof Error ? error.message : 'Erro desconhecido' },
      { status: 500 }
    )
  }
}

// Also support POST for cron services that require POST
export async function POST(req: NextRequest) {
  return GET(req)
}