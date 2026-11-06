import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;

    // Check environment variables
    const requiredEnvVars = [
      'DATABASE_URL',
      'NEXTAUTH_SECRET',
      'NEXTAUTH_URL',
      'JWT_SECRET',
      'ENCRYPTION_KEY',
    ];

    const missingEnvVars = requiredEnvVars.filter((v) => !process.env[v]);

    if (missingEnvVars.length > 0) {
      return NextResponse.json(
        {
          status: 'degraded',
          timestamp: new Date().toISOString(),
          checks: {
            database: 'healthy',
            environment: 'missing_vars',
            missingVars: missingEnvVars,
          },
        },
        { status: 503 }
      );
    }

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      checks: {
        database: 'healthy',
        environment: 'configured',
      },
    });
  } catch (error) {
    console.error('Health check failed:', error);

    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        checks: {
          database: 'unhealthy',
          environment: 'configured',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { status: 503 }
    );
  }
}