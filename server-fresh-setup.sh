#!/bin/bash

# ============================================
# Fresh Server Setup Script
# Clean up and redeploy from scratch
# ============================================

echo "🧹 InvoiceFBR - Fresh Server Setup"
echo "============================================"
echo ""
echo "⚠️  WARNING: This will clean up your server and redeploy everything"
echo "    - Stop all PM2 processes"
echo "    - Backup current installation"
echo "    - Clean up old files"
echo "    - Fresh deployment"
echo ""
read -p "Continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Aborted."
    exit 0
fi

echo ""
echo "============================================"
echo "STEP 1: Stop All PM2 Processes"
echo "============================================"

pm2 stop all
pm2 delete all
pm2 save --force

echo "✅ All PM2 processes stopped"
echo ""

echo "============================================"
echo "STEP 2: Backup Current Installation"
echo "============================================"

BACKUP_DIR="/var/www/backups/inovices-backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p /var/www/backups

if [ -d "/var/www/inovices" ]; then
    echo "Creating backup at: $BACKUP_DIR"
    cp -r /var/www/inovices $BACKUP_DIR
    echo "✅ Backup created: $BACKUP_DIR"
else
    echo "⚠️  No existing installation found"
fi

echo ""

echo "============================================"
echo "STEP 3: Clean Up Old Installation"
echo "============================================"

cd /var/www/inovices 2>/dev/null || { echo "No existing installation"; }

if [ -d "/var/www/inovices" ]; then
    # Remove build artifacts
    echo "Removing build artifacts..."
    rm -rf .next
    rm -rf node_modules
    rm -rf logs/*.log
    
    # Remove old files
    echo "Removing old documentation..."
    rm -f *.zip
    rm -f *.pdf
    find . -name ".DS_Store" -delete
    
    # Clean PM2 logs
    echo "Cleaning PM2 logs..."
    pm2 flush
    
    echo "✅ Cleanup complete"
fi

echo ""

echo "============================================"
echo "STEP 4: Install Fresh Dependencies"
echo "============================================"

cd /var/www/inovices

echo "Installing npm packages..."
npm install --production

if [ $? -ne 0 ]; then
    echo "❌ npm install failed!"
    exit 1
fi

echo "✅ Dependencies installed"
echo ""

echo "============================================"
echo "STEP 5: Build Application"
echo "============================================"

echo "Building Next.js..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo "✅ Build successful"
echo ""

echo "============================================"
echo "STEP 6: Setup PM2"
echo "============================================"

# Start with PM2
pm2 start ecosystem.config.js
pm2 save

echo "✅ PM2 started"
echo ""

# Wait for app to start
echo "Waiting for application to start..."
sleep 5

echo "============================================"
echo "STEP 7: Verify Installation"
echo "============================================"

echo ""
echo "PM2 Status:"
pm2 status

echo ""
echo "Health Check:"
curl -s http://localhost:3001/api/health | jq . || echo "⚠️  Health check failed"

echo ""
echo "Memory Usage:"
free -h

echo ""
echo "Disk Usage:"
df -h /var/www

echo ""
echo "============================================"
echo "✅ FRESH SETUP COMPLETE!"
echo "============================================"
echo ""
echo "Next steps:"
echo "1. Test the application: curl http://localhost:3001/api/health"
echo "2. Check logs: pm2 logs invoicefbr"
echo "3. Monitor: pm2 monit"
echo "4. Add database indexes (see below)"
echo ""
echo "Backup location: $BACKUP_DIR"
echo ""
