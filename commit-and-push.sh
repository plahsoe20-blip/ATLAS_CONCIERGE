#!/bin/bash

# ATLAS Concierge - Git Commit and Push Script
# This script commits all FAANG-level upgrades and pushes to GitHub

echo "🚀 ATLAS Concierge - Committing FAANG-Level Upgrades"
echo "=================================================="
echo ""

# Check if we're in a git repository
if [ ! -d .git ]; then
    echo "❌ Error: Not in a git repository"
    exit 1
fi

# Stage all changes
echo "📦 Staging all changes..."
git add -A

# Show status
echo ""
echo "📊 Git Status:"
git status --short

# Create commit
echo ""
echo "💾 Creating commit..."
git commit -m "feat: Upgrade to FAANG-level engineering standards

Major Enhancements:
- ✅ Enterprise-grade Node.js/Express backend with 29 REST endpoints
- ✅ Real-time WebSocket tracking with Socket.IO
- ✅ JWT authentication with bcrypt and RBAC
- ✅ Complete data models (7 entities)
- ✅ Comprehensive API documentation (4,600+ lines)
- ✅ AWS deployment templates and guides
- ✅ Security hardening (Helmet, CORS, rate limiting)
- ✅ Winston logging system
- ✅ Pricing engine with multi-region tax support
- ✅ Professional project structure

Backend Features:
- 5 Controllers: Auth, Booking, Concierge, Driver, Operator
- 7 Routes: Complete RESTful API
- 7 Models: User, Booking, Driver, Vehicle, Operator, Quote, Transaction
- 3 Middleware: Authentication, error handling, request logging
- 2 Services: Pricing engine, WebSocket handlers

Documentation:
- Architecture guide (850+ lines)
- API reference with examples (950+ lines)
- AWS deployment plan (1,100+ lines)
- Data models documentation (650+ lines)
- Cognito setup instructions (600+ lines)
- Backend README (450+ lines)

Infrastructure:
- Complete AWS deployment templates
- DynamoDB table creation scripts
- Lambda packaging instructions
- CI/CD pipeline configuration
- CloudWatch monitoring setup

Ready for:
- Local development and testing
- AWS cloud deployment
- Production launch

See PROJECT_STATUS.md for complete details."

# Check if commit was successful
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Commit successful!"
    echo ""
    
    # Push to GitHub
    echo "🌐 Pushing to GitHub..."
    git push origin main
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ Successfully pushed to GitHub!"
        echo ""
        echo "🎉 ATLAS Concierge upgrade complete!"
        echo ""
        echo "Next steps:"
        echo "1. Install backend dependencies: cd backend && npm install"
        echo "2. Start backend: npm run dev"
        echo "3. Test API: curl http://localhost:5000/health"
        echo "4. Review documentation in /docs"
    else
        echo ""
        echo "⚠️  Push failed. Please check your GitHub credentials and try:"
        echo "   git push origin main"
    fi
else
    echo ""
    echo "⚠️  Commit failed. Please check for errors above."
fi

echo ""
echo "=================================================="
