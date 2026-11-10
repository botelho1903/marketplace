-- ============================================================
# MARKETPLACE - Database Initialization Script
-- Run automatically on first PostgreSQL startup
-- ============================================================

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create indexes for better performance (Prisma will handle most)
-- This script runs before Prisma migrations

-- Set timezone
SET timezone = 'America/Sao_Paulo';

-- Create a function to update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE marketplace TO marketplace;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO marketplace;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO marketplace;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO marketplace;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO marketplace;