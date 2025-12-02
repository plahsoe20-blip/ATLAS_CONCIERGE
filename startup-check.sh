#!/bin/bash

# ============================================================================
# ATLAS Concierge - Complete Startup & Debug Check
# ============================================================================

set -e

echo "🚀 ATLAS Concierge - Startup & Debug Check"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Function to check if Docker container is running
check_container() {
    local container=$1
    if docker ps --filter "name=$container" --format "{{.Names}}" 2>/dev/null | grep -q "$container"; then
        return 0
    else
        return 1
    fi
}

echo "📋 Pre-flight Checks"
echo "===================="
echo ""

# Check Node.js
if command -v node &> /dev/null; then
    echo -e "${GREEN}✅ Node.js $(node --version)${NC}"
else
    echo -e "${RED}❌ Node.js not found${NC}"
    exit 1
fi

# Check npm
if command -v npm &> /dev/null; then
    echo -e "${GREEN}✅ npm $(npm --version)${NC}"
else
    echo -e "${RED}❌ npm not found${NC}"
    exit 1
fi

# Check Docker
if command -v docker &> /dev/null; then
    echo -e "${GREEN}✅ Docker $(docker --version | cut -d' ' -f3 | tr -d ',')${NC}"
else
    echo -e "${YELLOW}⚠️  Docker not found (will use local services)${NC}"
fi

echo ""
echo "🔍 Checking Components"
echo "======================"
echo ""

# Check if node_modules exists
if [ -d "backend-nestjs/node_modules" ]; then
    echo -e "${GREEN}✅ Backend dependencies installed${NC}"
else
    echo -e "${YELLOW}⚠️  Backend dependencies missing${NC}"
    echo -e "   ${BLUE}Run: cd backend-nestjs && npm install${NC}"
fi

# Check if Prisma Client is generated
if [ -d "backend-nestjs/node_modules/.prisma" ]; then
    echo -e "${GREEN}✅ Prisma Client generated${NC}"
else
    echo -e "${YELLOW}⚠️  Prisma Client not generated${NC}"
    echo -e "   ${BLUE}Run: cd backend-nestjs && npx prisma generate${NC}"
fi

# Check .env file
if [ -f "backend-nestjs/.env" ]; then
    echo -e "${GREEN}✅ Environment file exists${NC}"
else
    echo -e "${YELLOW}⚠️  .env file missing${NC}"
    echo -e "   ${BLUE}Using .env.example as template${NC}"
fi

# Check Prisma migrations
if [ -d "backend-nestjs/prisma/migrations" ]; then
    echo -e "${GREEN}✅ Prisma migrations directory exists${NC}"
else
    echo -e "${YELLOW}⚠️  No migrations found${NC}"
    echo -e "   ${BLUE}Run: cd backend-nestjs && npx prisma migrate dev${NC}"
fi

echo ""
echo "🐳 Docker Services Check"
echo "========================"
echo ""

# Check PostgreSQL
if check_container "atlas_postgres" || check_container "postgres"; then
    echo -e "${GREEN}✅ PostgreSQL container running${NC}"
elif check_port 5432; then
    echo -e "${GREEN}✅ PostgreSQL running on port 5432${NC}"
else
    echo -e "${YELLOW}⚠️  PostgreSQL not running${NC}"
    echo -e "   ${BLUE}Run: cd backend-nestjs && docker-compose up -d postgres${NC}"
fi

# Check Redis
if check_container "atlas_redis" || check_container "redis"; then
    echo -e "${GREEN}✅ Redis container running${NC}"
elif check_port 6379; then
    echo -e "${GREEN}✅ Redis running on port 6379${NC}"
else
    echo -e "${YELLOW}⚠️  Redis not running${NC}"
    echo -e "   ${BLUE}Run: cd backend-nestjs && docker-compose up -d redis${NC}"
fi

echo ""
echo "🔌 Port Availability Check"
echo "=========================="
echo ""

# Check port 4000 (Backend)
if check_port 4000; then
    echo -e "${YELLOW}⚠️  Port 4000 (Backend) is in use${NC}"
    echo -e "   ${BLUE}Kill process: lsof -ti:4000 | xargs kill -9${NC}"
else
    echo -e "${GREEN}✅ Port 4000 (Backend) available${NC}"
fi

# Check port 5173 (Frontend)
if check_port 5173; then
    echo -e "${YELLOW}⚠️  Port 5173 (Frontend) is in use${NC}"
    echo -e "   ${BLUE}Kill process: lsof -ti:5173 | xargs kill -9${NC}"
else
    echo -e "${GREEN}✅ Port 5173 (Frontend) available${NC}"
fi

# Check port 5555 (Prisma Studio)
if check_port 5555; then
    echo -e "${YELLOW}⚠️  Port 5555 (Prisma Studio) is in use${NC}"
else
    echo -e "${GREEN}✅ Port 5555 (Prisma Studio) available${NC}"
fi

echo ""
echo "📦 Missing Packages Check"
echo "========================="
echo ""

cd backend-nestjs

# Check for critical missing packages
MISSING_PACKAGES=()

if ! npm list @nestjs/swagger > /dev/null 2>&1; then
    MISSING_PACKAGES+=("@nestjs/swagger")
fi

if ! npm list @nestjs/mapped-types > /dev/null 2>&1; then
    MISSING_PACKAGES+=("@nestjs/mapped-types")
fi

if ! npm list @types/compression > /dev/null 2>&1; then
    MISSING_PACKAGES+=("@types/compression (dev)")
fi

if [ ${#MISSING_PACKAGES[@]} -eq 0 ]; then
    echo -e "${GREEN}✅ All critical packages installed${NC}"
else
    echo -e "${YELLOW}⚠️  Missing packages:${NC}"
    for pkg in "${MISSING_PACKAGES[@]}"; do
        echo -e "   - $pkg"
    done
    echo -e "   ${BLUE}Run: npm install${NC}"
fi

cd ..

echo ""
echo "🧪 TypeScript Compilation Check"
echo "==============================="
echo ""

cd backend-nestjs
if npm run build > /dev/null 2>&1; then
    echo -e "${GREEN}✅ TypeScript compilation successful${NC}"
else
    echo -e "${RED}❌ TypeScript compilation failed${NC}"
    echo -e "   ${BLUE}Check errors with: npm run build${NC}"
fi
cd ..

echo ""
echo "=========================================="
echo ""

# Summary and next steps
echo -e "${BLUE}📝 Next Steps:${NC}"
echo ""
echo "1. Start Docker services (if not running):"
echo -e "   ${YELLOW}cd backend-nestjs && docker-compose up -d${NC}"
echo ""
echo "2. Run database migrations:"
echo -e "   ${YELLOW}cd backend-nestjs && npx prisma migrate dev${NC}"
echo ""
echo "3. Seed the database:"
echo -e "   ${YELLOW}cd backend-nestjs && npm run prisma:seed${NC}"
echo ""
echo "4. Start debugging:"
echo -e "   ${YELLOW}Press F5 in VS Code${NC}"
echo "   OR"
echo -e "   ${YELLOW}cd backend-nestjs && npm run start:dev${NC}"
echo ""
echo "5. Access services:"
echo "   - Backend API: http://localhost:4000"
echo "   - Swagger Docs: http://localhost:4000/api"
echo "   - Health Check: http://localhost:4000/health"
echo "   - Prisma Studio: npx prisma studio (port 5555)"
echo ""
echo -e "${GREEN}✨ Ready to debug!${NC}"
echo ""
