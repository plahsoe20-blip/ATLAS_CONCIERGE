#!/bin/bash

# ============================================================================
# ATLAS Concierge - Database Migration Script
# ============================================================================

set -e

echo "🗄️  ATLAS Concierge - Database Migration"
echo "========================================"
echo ""

# Check for DATABASE_URL
if [ -z "$DATABASE_URL" ]; then
    echo "❌ Error: DATABASE_URL environment variable is not set"
    exit 1
fi

cd backend-nestjs

# Run migrations
echo "📦 Running Prisma migrations..."
npx prisma migrate deploy

# Generate Prisma Client
echo "🔧 Generating Prisma Client..."
npx prisma generate

echo ""
echo "✅ Database migration completed successfully!"
