#!/bin/bash
# start.sh - Simple startup script for HTTP deployment
# Usage: ./start.sh

set -e

echo "🚀 Starting Marketplace in HTTP mode..."

# Check if .env.production exists
if [ ! -f .env.production ]; then
    echo "❌ .env.production not found. Copy .env.production.example and configure it."
    exit 1
fi

# Load environment variables
export $(cat .env.production | grep -v '^#' | xargs)

# Ensure DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL not set in .env.production"
    exit 1
fi

# Ensure NEXTAUTH_URL is HTTP
if [[ "$NEXTAUTH_URL" == https://* ]]; then
    echo "⚠️  NEXTAUTH_URL is HTTPS. Changing to HTTP for this deployment..."
    export NEXTAUTH_URL=$(echo $NEXTAUTH_URL | sed 's/https:/http:/')
fi

if [[ "$NEXT_PUBLIC_APP_URL" == https://* ]]; then
    export NEXT_PUBLIC_APP_URL=$(echo $NEXT_PUBLIC_APP_URL | sed 's/https:/http:/')
fi

echo "📦 Running database migrations..."
npx prisma migrate deploy

echo "🔨 Building application..."
npm run build

echo "🌐 Starting server on HTTP port 3000..."
npm run start