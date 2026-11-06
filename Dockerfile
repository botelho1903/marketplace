# Marketplace - Dockerfile for Production
# Multi-stage build for minimal image size

# ============================================================
# STAGE 1: Base & Dependencies
# ============================================================
FROM node:20-alpine AS base

# Install dependencies for native modules (bcrypt, sharp, etc.)
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    libc6-compat \
    openssl \
    git

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# ============================================================
# STAGE 2: Install Dependencies
# ============================================================
FROM base AS deps

# Install production dependencies
RUN npm ci --only=production --ignore-scripts

# Generate Prisma Client
RUN npx prisma generate

# ============================================================
# STAGE 3: Build Application
# ============================================================
FROM base AS builder

# Install ALL dependencies (including devDependencies for build)
RUN npm ci

# Generate Prisma Client
RUN npx prisma generate

# Copy source code
COPY . .

# Build Next.js (standalone output)
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ============================================================
# STAGE 4: Production Runner
# ============================================================
FROM node:20-alpine AS runner

# Install runtime dependencies
RUN apk add --no-cache \
    openssl \
    ca-certificates \
    tzdata

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

WORKDIR /app

# Set environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Copy built application from builder
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

# Copy node_modules from deps (production only)
COPY --from=deps --chown=nextjs:nodejs /app/node_modules ./node_modules

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Start application
CMD ["node", "server.js"]