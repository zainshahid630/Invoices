#!/bin/bash

# SaaS Invoice Management System - Production Start Script
# This script starts the application in production mode on port 3001

echo "🚀 Starting SaaS Invoice Management System..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed!"
    echo "Please install Node.js 21 using nvm:"
    echo "  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash"
    echo "  source ~/.bashrc"
    echo "  nvm install 21"
    echo "  nvm use 21"
    exit 1
fi

# Check Node version
NODE_VERSION=$(node -v)
echo "✅ Node.js version: $NODE_VERSION"

# Check if .next directory exists
if [ ! -d ".next" ]; then
    echo "❌ Build directory not found!"
    echo "Please run 'npm run build' first"
    exit 1
fi

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    echo "⚠️  Warning: .env.production not found!"
    echo "Using .env.local instead"
fi

# Create logs directory if it doesn't exist
mkdir -p logs

echo ""
echo "📋 Configuration:"
echo "  - Port: 3001"
echo "  - Environment: production"
echo "  - URL: http://localhost:3001"
echo ""

# Start the application
echo "🎯 Starting application..."
echo ""

# Use nvm if available
if [ -f "$HOME/.nvm/nvm.sh" ]; then
    source "$HOME/.nvm/nvm.sh"
    nvm use 21
fi

# Start with npm
NODE_ENV=production npm run start:prod

