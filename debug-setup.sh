#!/bin/bash

# ============================================================================
# ATLAS Concierge - Debug Setup Script
# ============================================================================

set -e

echo "🔧 ATLAS Concierge Debug Setup"
echo "================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "📋 Checking prerequisites..."
if ! command_exists node; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Node.js $(node --version)${NC}"

if ! command_exists npm; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ npm $(npm --version)${NC}"

if ! command_exists docker; then
    echo -e "${YELLOW}⚠️  Docker is not installed (optional)${NC}"
else
    echo -e "${GREEN}✅ Docker $(docker --version)${NC}"
fi

echo ""

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend-nestjs
if [ ! -d "node_modules" ]; then
    npm install
    echo -e "${GREEN}✅ Backend dependencies installed${NC}"
else
    echo -e "${YELLOW}⚠️  node_modules exists, skipping install${NC}"
    echo "   Run 'npm install' manually if you need to update dependencies"
fi

# Generate Prisma Client
echo ""
echo "🔧 Generating Prisma Client..."
npx prisma generate
echo -e "${GREEN}✅ Prisma Client generated${NC}"

cd ..

# Install frontend dependencies
echo ""
echo "📦 Installing frontend dependencies..."
if [ ! -d "node_modules" ]; then
    npm install
    echo -e "${GREEN}✅ Frontend dependencies installed${NC}"
else
    echo -e "${YELLOW}⚠️  node_modules exists, skipping install${NC}"
fi

echo ""
echo "================================"
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo ""
echo "📝 Next Steps:"
echo ""
echo "1. Start PostgreSQL and Redis:"
echo "   ${YELLOW}cd backend-nestjs && docker-compose up -d${NC}"
echo ""
echo "2. Run database migrations:"
echo "   ${YELLOW}cd backend-nestjs && npx prisma migrate dev${NC}"
echo ""
echo "3. Seed the database:"
echo "   ${YELLOW}cd backend-nestjs && npm run prisma:seed${NC}"
echo ""
echo "4. Start debugging in VS Code:"
echo "   ${YELLOW}Press F5 or use the Debug panel${NC}"
echo "   ${YELLOW}Select 'Debug NestJS Backend' or 'Full Stack Debug'${NC}"
echo ""
echo "5. Or start manually:"
echo "   Backend:  ${YELLOW}cd backend-nestjs && npm run start:dev${NC}"
echo "   Frontend: ${YELLOW}npm run dev${NC}"
echo ""
echo "📚 API Documentation: http://localhost:4000/api"
echo "🏥 Health Check: http://localhost:4000/health"
echo "🗄️  Prisma Studio: ${YELLOW}cd backend-nestjs && npm run prisma:studio${NC}"
echo ""
