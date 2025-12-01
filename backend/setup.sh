#!/bin/bash

# ATLAS Backend Setup and Start Script

echo "🚀 Setting up ATLAS Backend..."

# Create necessary directories
mkdir -p logs

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  npm install
fi

# Create .env if it doesn't exist
if [ ! -f ".env" ]; then
  echo "📝 Creating .env file..."
  cp .env.example .env
  echo "⚠️  Please update .env with your configuration"
fi

echo "✅ Setup complete!"
echo ""
echo "To start the server:"
echo "  Development: npm run dev"
echo "  Production:  npm start"
echo ""
echo "Server will run on: http://localhost:5000"
echo "Health check: http://localhost:5000/health"
