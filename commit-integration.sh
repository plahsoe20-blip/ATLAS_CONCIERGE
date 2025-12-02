#!/bin/bash

echo "==================================="
echo "ATLAS Concierge - Commit Integration"
echo "==================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Navigate to project root
cd /workspaces/ATLAS_CONCIERGE

echo "📋 Step 1: Checking Git Status..."
echo "--------------------------------------"
git status --short
echo ""

echo "➕ Step 2: Adding All Changes..."
echo "--------------------------------------"
git add -A

# Show what will be committed
echo ""
echo "Files to be committed:"
git status --short
echo ""

echo "💾 Step 3: Creating Commit..."
echo "--------------------------------------"
git commit -m "feat: Integrate backend API with frontend

- Created API client services (auth, rides, drivers, websocket)
- Updated Store context to use real API calls instead of mocks
- Enhanced LoginPage with error handling and loading states
- Added axios and socket.io-client dependencies
- Created comprehensive integration documentation
- Added setup-integration.sh automated setup script
- Fixed TypeScript types for backend integration
- Configured environment variables for API connection
- Implemented JWT authentication with auto-refresh
- Integrated real-time WebSocket updates

Breaking Changes: None
Migration Required: Run 'npm install' to add new dependencies

Closes: Backend-Frontend Integration
"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Commit created successfully${NC}"
else
    echo -e "${RED}✗ Commit failed${NC}"
    exit 1
fi
echo ""

echo "🚀 Step 4: Pushing to GitHub..."
echo "--------------------------------------"
git push origin main

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Successfully pushed to GitHub main branch${NC}"
else
    echo -e "${RED}✗ Push failed. You may need to pull first or check credentials${NC}"
    echo ""
    echo "Try running:"
    echo "  git pull --rebase origin main"
    echo "  git push origin main"
    exit 1
fi
echo ""

echo "==================================="
echo "✨ Commit & Push Complete!"
echo "==================================="
echo ""
echo "📊 Recent Commits:"
git log --oneline -5
echo ""
echo "🔗 Remote Status:"
git remote -v
echo ""
