#!/bin/bash

# ATLAS CONCIERGE - Production Startup Script
# This script prepares and starts the application for production

set -e

echo "🚀 ATLAS CONCIERGE - Production Startup"
echo "========================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Node.js version
echo -e "\n${YELLOW}Checking Node.js version...${NC}"
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}Error: Node.js 18+ required. Current version: $(node -v)${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js $(node -v)${NC}"

# Check environment file
echo -e "\n${YELLOW}Checking environment configuration...${NC}"
if [ ! -f "backend-nestjs/.env" ]; then
    echo -e "${RED}Error: backend-nestjs/.env not found${NC}"
    echo "Please copy backend-nestjs/.env.example to backend-nestjs/.env and configure"
    exit 1
fi
echo -e "${GREEN}✓ Environment file found${NC}"

# Check required services
echo -e "\n${YELLOW}Checking required services...${NC}"

# Check PostgreSQL
if command -v psql &> /dev/null; then
    echo -e "${GREEN}✓ PostgreSQL installed${NC}"
else
    echo -e "${YELLOW}⚠ PostgreSQL not found locally (may be using remote database)${NC}"
fi

# Check Redis
if command -v redis-cli &> /dev/null; then
    if redis-cli ping &> /dev/null; then
        echo -e "${GREEN}✓ Redis is running${NC}"
    else
        echo -e "${RED}✗ Redis is not running${NC}"
        echo "Start Redis with: brew services start redis (macOS) or sudo systemctl start redis (Linux)"
        exit 1
    fi
else
    echo -e "${YELLOW}⚠ Redis not found locally (may be using remote cache)${NC}"
fi

# Install dependencies
echo -e "\n${YELLOW}Installing dependencies...${NC}"

# Backend dependencies
echo "Installing backend dependencies..."
cd backend-nestjs
npm install --production=false
cd ..
echo -e "${GREEN}✓ Backend dependencies installed${NC}"

# Frontend dependencies
echo "Installing frontend dependencies..."
npm install
echo -e "${GREEN}✓ Frontend dependencies installed${NC}"

# Database setup
echo -e "\n${YELLOW}Setting up database...${NC}"
cd backend-nestjs

# Generate Prisma Client
echo "Generating Prisma Client..."
npx prisma generate
echo -e "${GREEN}✓ Prisma Client generated${NC}"

# Run migrations
echo "Running database migrations..."
npx prisma migrate deploy
echo -e "${GREEN}✓ Database migrations applied${NC}"

# Optional: Seed database
read -p "Do you want to seed the database with test data? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if [ -f "prisma/seed.ts" ]; then
        echo "Seeding database..."
        npx prisma db seed
        echo -e "${GREEN}✓ Database seeded${NC}"
    else
        echo -e "${YELLOW}⚠ No seed file found${NC}"
    fi
fi

cd ..

# Build applications
echo -e "\n${YELLOW}Building applications...${NC}"

# Build backend
echo "Building backend..."
cd backend-nestjs
npm run build
echo -e "${GREEN}✓ Backend built${NC}"
cd ..

# Build frontend
echo "Building frontend..."
npm run build
echo -e "${GREEN}✓ Frontend built${NC}"

# Start services
echo -e "\n${YELLOW}Starting services...${NC}"

# Check if PM2 is available
if command -v pm2 &> /dev/null; then
    echo "Starting with PM2..."
    
    # Stop existing processes
    pm2 delete atlas-backend atlas-frontend 2>/dev/null || true
    
    # Start backend
    cd backend-nestjs
    pm2 start dist/main.js --name atlas-backend --node-args="--max-old-space-size=2048"
    cd ..
    
    # Start frontend (serve static build)
    pm2 serve dist 3000 --name atlas-frontend --spa
    
    # Save PM2 configuration
    pm2 save
    
    echo -e "${GREEN}✓ Services started with PM2${NC}"
    echo -e "\nView logs with: ${YELLOW}pm2 logs${NC}"
    echo -e "Monitor processes: ${YELLOW}pm2 monit${NC}"
    
else
    echo -e "${YELLOW}PM2 not found. Starting services directly...${NC}"
    echo -e "${YELLOW}Consider installing PM2 for production: npm install -g pm2${NC}"
    
    # Start backend in background
    cd backend-nestjs
    NODE_ENV=production node dist/main.js &
    BACKEND_PID=$!
    echo -e "${GREEN}✓ Backend started (PID: $BACKEND_PID)${NC}"
    cd ..
    
    # Start frontend with serve
    if command -v serve &> /dev/null; then
        serve -s dist -p 3000 &
        FRONTEND_PID=$!
        echo -e "${GREEN}✓ Frontend started (PID: $FRONTEND_PID)${NC}"
    else
        echo -e "${RED}Error: 'serve' not found. Install with: npm install -g serve${NC}"
        kill $BACKEND_PID
        exit 1
    fi
fi

# Health check
echo -e "\n${YELLOW}Performing health check...${NC}"
sleep 5

# Check backend
if curl -f http://localhost:3001/health &> /dev/null; then
    echo -e "${GREEN}✓ Backend is healthy${NC}"
else
    echo -e "${RED}✗ Backend health check failed${NC}"
    exit 1
fi

# Check frontend
if curl -f http://localhost:3000 &> /dev/null; then
    echo -e "${GREEN}✓ Frontend is accessible${NC}"
else
    echo -e "${YELLOW}⚠ Frontend may still be starting...${NC}"
fi

# Success message
echo -e "\n${GREEN}========================================="
echo "🎉 ATLAS CONCIERGE STARTED SUCCESSFULLY"
echo "=========================================${NC}"
echo -e "\n${YELLOW}Access the application:${NC}"
echo "Frontend: http://localhost:3000"
echo "Backend API: http://localhost:3001"
echo "API Health: http://localhost:3001/health"
echo -e "\n${YELLOW}Useful commands:${NC}"
echo "View logs: pm2 logs"
echo "Stop all: pm2 stop all"
echo "Restart: pm2 restart all"
echo "Monitor: pm2 monit"
echo -e "\n${GREEN}Happy transporting! 🚗✨${NC}\n"
