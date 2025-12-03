#!/bin/bash

echo "🚀 Starting ATLAS Concierge Development Environment..."
echo ""

# Kill existing processes
echo "🧹 Cleaning up existing processes..."
pkill -f "vite" 2>/dev/null
pkill -f "nest start" 2>/dev/null
lsof -ti:3000,3001,4000,5173 2>/dev/null | xargs kill -9 2>/dev/null
sleep 2
echo "   ✅ Ports cleared"
echo ""

# Change to project root
cd /workspaces/ATLAS_CONCIERGE

# Start backend
echo "🔧 Starting Backend (NestJS on port 4000)..."
echo "   Log: /tmp/atlas-backend.log"
cd backend-nestjs
npm run start:dev > /tmp/atlas-backend.log 2>&1 &
BACKEND_PID=$!
echo "   PID: $BACKEND_PID"
cd ..
echo ""

# Wait for backend to initialize
sleep 3

# Start frontend  
echo "🎨 Starting Frontend (Vite)..."
echo "   Log: /tmp/atlas-frontend.log"
npm run dev > /tmp/atlas-frontend.log 2>&1 &
FRONTEND_PID=$!
echo "   PID: $FRONTEND_PID"
echo ""

# Wait for servers
echo "⏳ Waiting for servers to start..."
for i in {1..10}; do
    echo -n "."
    sleep 1
done
echo ""
echo ""

# Check status
echo "📊 Server Status:"
if ps -p $BACKEND_PID > /dev/null 2>&1; then
    echo "   ✅ Backend: Running (PID $BACKEND_PID)"
    echo "      http://localhost:4000/api"
else
    echo "   ❌ Backend: Failed"
fi

if ps -p $FRONTEND_PID > /dev/null 2>&1; then
    # Try to get the actual port from logs
    PORT=$(grep -oP "Local:.*localhost:\K\d+" /tmp/atlas-frontend.log | tail -1)
    if [ -z "$PORT" ]; then PORT="checking..."; fi
    echo "   ✅ Frontend: Running (PID $FRONTEND_PID)"
    echo "      http://localhost:$PORT"
else
    echo "   ❌ Frontend: Failed"
fi
echo ""

echo "📋 Quick Commands:"
echo "   View frontend logs:  tail -f /tmp/atlas-frontend.log"
echo "   View backend logs:   tail -f /tmp/atlas-backend.log"
echo "   Stop all servers:    pkill -f 'vite|nest start'"
echo "   Check processes:     ps aux | grep -E '(vite|nest)'"
echo ""
echo "🌐 Waiting 3 more seconds for Vite to be ready..."
sleep 3

# Get actual frontend port
FRONTEND_PORT=$(grep -oP "Local:.*localhost:\K\d+" /tmp/atlas-frontend.log | tail -1)
if [ ! -z "$FRONTEND_PORT" ]; then
    echo "✨ Frontend ready on port $FRONTEND_PORT"
    echo ""
    echo "🎯 Open this URL: http://localhost:$FRONTEND_PORT"
else
    echo "⚠️  Check logs for frontend port"
fi
echo ""
echo "✅ Development environment ready!"
echo "   Edit files and see live updates with hot reload"

