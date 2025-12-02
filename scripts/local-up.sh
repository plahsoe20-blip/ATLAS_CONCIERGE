#!/bin/bash

# ============================================================================
# ATLAS Concierge - Local Development Setup Script
# ============================================================================

set -e

echo "🚀 ATLAS Concierge - Local Development Setup"
echo "=============================================="
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Error: Docker is not running. Please start Docker and try again."
    exit 1
fi

echo "✅ Docker is running"
echo ""

# Stop any existing containers
echo "🛑 Stopping existing containers..."
docker-compose down -v

# Start services
echo "🐳 Starting Docker services (Postgres + Redis)..."
docker-compose up -d postgres redis

# Wait for Postgres to be ready
echo "⏳ Waiting for Postgres to be ready..."
until docker-compose exec -T postgres pg_isready -U atlas > /dev/null 2>&1; do
    sleep 1
done

echo "✅ Postgres is ready"

# Wait for Redis to be ready
echo "⏳ Waiting for Redis to be ready..."
until docker-compose exec -T redis redis-cli ping > /dev/null 2>&1; do
    sleep 1
done

echo "✅ Redis is ready"
echo ""

# Navigate to backend directory
cd backend-nestjs

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Copy .env.example if .env doesn't exist
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file..."
    cp ../.env.example .env
    echo "⚠️  Please update .env with your actual credentials"
fi

# Generate Prisma Client
echo "🔧 Generating Prisma Client..."
npm run prisma:generate

# Run migrations
echo "🗄️  Running database migrations..."
npm run prisma:migrate

# Seed database
echo "🌱 Seeding database..."
npm run prisma:seed

echo ""
echo "✅ Local development environment is ready!"
echo ""
echo "📋 Next steps:"
echo "   1. Start the backend: npm run start:dev"
echo "   2. Open Prisma Studio: npm run prisma:studio"
echo "   3. View API docs: http://localhost:4000/api"
echo "   4. Health check: http://localhost:4000/health"
echo ""
echo "🔑 Test credentials:"
echo "   Email: admin@acmeconcierge.com"
echo "   Password: Password123!"
echo ""
