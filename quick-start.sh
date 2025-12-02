#!/bin/bash

# ============================================================================
# ATLAS Concierge - Quick Start Script
# Starts all services and checks health
# ============================================================================

set -e

echo "🚀 Starting ATLAS Concierge Application"
echo "========================================"
echo ""

cd backend-nestjs

# Start Docker services
echo "📦 Starting Docker services (PostgreSQL & Redis)..."
docker-compose up -d postgres redis

# Wait for services to be healthy
echo "⏳ Waiting for services to be ready..."
sleep 5

# Check PostgreSQL
echo "🔍 Checking PostgreSQL..."
until docker exec atlas_postgres pg_isready -U atlas > /dev/null 2>&1; do
    echo "   Waiting for PostgreSQL..."
    sleep 2
done
echo "✅ PostgreSQL is ready"

# Check Redis
echo "🔍 Checking Redis..."
until docker exec atlas_redis redis-cli ping > /dev/null 2>&1; do
    echo "   Waiting for Redis..."
    sleep 2
done
echo "✅ Redis is ready"

# Generate Prisma Client
echo ""
echo "🔧 Generating Prisma Client..."
npx prisma generate

# Run migrations
echo ""
echo "📊 Running database migrations..."
npx prisma migrate dev --name init

# Seed database
echo ""
echo "🌱 Seeding database..."
npm run prisma:seed

echo ""
echo "=========================================="
echo "✅ All services are running!"
echo ""
echo "📝 Available commands:"
echo ""
echo "  Start backend (dev mode):"
echo "    cd backend-nestjs && npm run start:dev"
echo ""
echo "  Start backend (debug mode):"
echo "    Press F5 in VS Code"
echo ""
echo "  Open Prisma Studio:"
echo "    cd backend-nestjs && npm run prisma:studio"
echo ""
echo "  View logs:"
echo "    docker-compose logs -f"
echo ""
echo "  Stop services:"
echo "    docker-compose down"
echo ""
echo "🌐 Service URLs:"
echo "  - Backend API: http://localhost:4000"
echo "  - Swagger Docs: http://localhost:4000/api"
echo "  - Health Check: http://localhost:4000/health"
echo ""
echo "🔑 Test Credentials (from seed):"
echo "  - admin@acmeconcierge.com / Password123!"
echo "  - dispatch@acmeconcierge.com / Password123!"
echo "  - driver1@acmeconcierge.com / Password123!"
echo ""
