#!/bin/bash

echo "==================================="
echo "ATLAS Concierge - Integration Setup"
echo "==================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Navigate to project root
cd /workspaces/ATLAS_CONCIERGE

echo "📦 Step 1: Installing Frontend Dependencies..."
echo "--------------------------------------"
npm install axios socket.io-client
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Frontend dependencies installed${NC}"
else
    echo -e "${RED}✗ Failed to install frontend dependencies${NC}"
    exit 1
fi
echo ""

echo "🗄️  Step 2: Checking Backend Status..."
echo "--------------------------------------"
cd backend-nestjs

# Check if Docker containers are running
if docker-compose ps | grep -q "postgres.*Up"; then
    echo -e "${GREEN}✓ PostgreSQL is running${NC}"
else
    echo -e "${YELLOW}⚠ PostgreSQL not running. Starting Docker services...${NC}"
    docker-compose up -d
    echo "Waiting 10 seconds for database to initialize..."
    sleep 10
fi

if docker-compose ps | grep -q "redis.*Up"; then
    echo -e "${GREEN}✓ Redis is running${NC}"
else
    echo -e "${YELLOW}⚠ Redis not running${NC}"
fi
echo ""

echo "🔄 Step 3: Generating Prisma Client..."
echo "--------------------------------------"
npx prisma generate
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Prisma client generated${NC}"
else
    echo -e "${RED}✗ Failed to generate Prisma client${NC}"
fi
echo ""

echo "📊 Step 4: Running Database Migrations..."
echo "--------------------------------------"
npx prisma migrate deploy
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Database migrations applied${NC}"
else
    echo -e "${YELLOW}⚠ Migration failed or already applied${NC}"
fi
echo ""

echo "🌱 Step 5: Seeding Database (Optional)..."
echo "--------------------------------------"
npx prisma db seed 2>/dev/null
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Database seeded with test data${NC}"
else
    echo -e "${YELLOW}⚠ Seed script not found or already seeded${NC}"
fi
echo ""

echo "🔍 Step 6: Verifying Setup..."
echo "--------------------------------------"

# Check if node_modules exist
if [ -d "node_modules/@nestjs/core" ]; then
    echo -e "${GREEN}✓ Backend dependencies installed${NC}"
else
    echo -e "${RED}✗ Backend dependencies missing. Run: npm install${NC}"
fi

# Check if .env exists
if [ -f ".env" ]; then
    echo -e "${GREEN}✓ Backend .env file exists${NC}"
else
    echo -e "${RED}✗ Backend .env file missing${NC}"
fi

# Check if frontend .env exists
cd /workspaces/ATLAS_CONCIERGE
if [ -f ".env" ]; then
    echo -e "${GREEN}✓ Frontend .env file exists${NC}"
else
    echo -e "${RED}✗ Frontend .env file missing${NC}"
fi

# Check if API services exist
if [ -f "services/api/client.ts" ]; then
    echo -e "${GREEN}✓ API client services created${NC}"
else
    echo -e "${RED}✗ API client services missing${NC}"
fi
echo ""

echo "==================================="
echo "✨ Integration Setup Complete!"
echo "==================================="
echo ""
echo "🚀 Next Steps:"
echo ""
echo "1. Start Backend API:"
echo "   cd backend-nestjs && npm run start:dev"
echo ""
echo "2. In a new terminal, start Frontend:"
echo "   cd /workspaces/ATLAS_CONCIERGE && npm run dev"
echo ""
echo "3. Open browser: http://localhost:5173"
echo ""
echo "📝 Test Accounts:"
echo "   Concierge: concierge@atlas.com / Password123!"
echo "   Driver:    driver@atlas.com / Password123!"
echo "   Operator:  operator@atlas.com / Password123!"
echo ""
echo "📚 Documentation: See INTEGRATION_STATUS.md"
echo ""
