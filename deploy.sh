#!/bin/bash

echo "🚀 Starting deployment..."

# Navigate to project directory
cd /var/www/inovices

# Pull latest code
echo "📥 Pulling latest code..."
git pull

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build application
echo "🔨 Building application..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    
    # Reload PM2 with zero downtime
    echo "🔄 Reloading PM2..."
    pm2 reload ecosystem.config.js
    
    # Check PM2 status
    echo "📊 PM2 Status:"
    pm2 status
    
    echo "✅ Deployment complete!"
else
    echo "❌ Build failed! Not reloading PM2."
    exit 1
fi
