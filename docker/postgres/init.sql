-- Nexus AI PostgreSQL initialization script

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";    -- for fuzzy text search
CREATE EXTENSION IF NOT EXISTS "btree_gin";  -- for JSONB indexing

-- Set default encoding and timezone
SET client_encoding = 'UTF8';
SET timezone = 'UTC';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE nexus_ai TO nexus;
