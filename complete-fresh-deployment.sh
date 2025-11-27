#!/bin/bash

# ============================================
# Complete Fresh Deployment for InvoiceFBR
# Clean server + Deploy optimized application
# ============================================

set -e  # Exit on any error

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}"
cat << "EOF"
╔═══════════════════════════════════════════╗
║   InvoiceFBR - Fresh Deployment Script   ║
║   Complete Server Setup & Optimization   ║
╚═══════════════════════════════════════════╝
EOF
echo -e "${NC}"

echo ""
echo -e "${YELLOW}This script will:${NC}"
echo "  1. Stop all services (PM2, Nginx)"
echo "  2. Backup everything"
echo "  3. Clean up old files"
echo "  4. Deploy optimized code"
echo "  5. Setup fresh Nginx"
echo "  6. Configure PM2 cluster"
echo "  7. Start everything"
echo "  8. Verify deployment"
echo ""
echo -e "${RED}⚠️  WARNING: This will restart your server!${NC}"
echo ""
read -p "Continue with fresh deployment? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Deployment cancelled."
    exit 0
fi

# Configuration
PROJECT_DIR="/var/www/inovices"
BACKUP_DIR="/var/www/backups/deployment-$(date +%Y%m%d-%H%M%S)"
NGINX_BACKUP="/etc/nginx/backup-$(date +%Y%m%d-%H%M%S)"

echo ""
echo -e "${BLUE}═══════════════════════════════════════════${NC}"
echo -e "${BLUE}PHASE 1: STOP ALL SERVICES${NC}"
echo -e "${BLUE}═══════════════════════════════════════════${NC}"
echo ""

# Stop PM2
echo -e "${YELLOW}→ Stopping PM2 processes...${NC}"
pm2 stop all 2>/dev/null || true
pm2 delete all 2>/dev/null || true
pm2 save --force
echo -e "${GREEN}✅ PM2 stopped${NC}"

# Stop Nginx
echo -e "${YELLOW}→ Stopping Nginx...${NC}"
systemctl stop nginx 2>/dev/null || true
echo -e "${GREEN}✅ Nginx stopped${NC}"

echo ""
echo -e "${BLUE}═══════════════════════════════════════════${NC}"
echo -e "${BLUE}PHASE 2: CREATE BACKUPS${NC}"
echo -e "${BLUE}═══════════════════════════════════════════${NC}"
echo ""

# Backup project
echo -e "${YELLOW}→ Backing up project directory...${NC}"
mkdir -p /var/www/backups
if [ -d "$PROJECT_DIR" ]; then
    cp -r "$PROJECT_DIR" "$BACKUP_DIR"
    echo -e "${GREEN}✅ Project backed up to: $BACKUP_DIR${NC}"
else
    echo -e "${YELLOW}⚠️  No existing project found${NC}"
fi

# Backup Nginx
echo -e "${YELLOW}→ Backing up Nginx configuration...${NC}"
if [ -d "/etc/nginx" ]; then
    mkdir -p "$NGINX_BACKUP"
    cp -r /etc/nginx/sites-available "$NGINX_BACKUP/" 2>/dev/null || true
    cp -r /etc/nginx/sites-enabled "$NGINX_BACKUP/" 2>/dev/null || true
    cp /etc/nginx/nginx.conf "$NGINX_BACKUP/" 2>/dev/null || true
    echo -e "${GREEN}✅ Nginx backed up to: $NGINX_BACKUP${NC}"
fi

echo ""
echo -e "${BLUE}═══════════════════════════════════════════${NC}"
echo -e "${BLUE}PHASE 3: CLEANUP${NC}"
echo -e "${BLUE}═══════════════════════════════════════════${NC}"
echo ""

cd "$PROJECT_DIR" 2>/dev/null || { echo "Project directory not found"; exit 1; }

# Remove build artifacts
echo -e "${YELLOW}→ Removing build artifacts...${NC}"
rm -rf .next
rm -rf node_modules
rm -rf logs/*.log 2>/dev/null || true
echo -e "${GREEN}✅ Build artifacts removed${NC}"

# Remove old files
echo -e "${YELLOW}→ Removing old files...${NC}"
rm -f *.zip 2>/dev/null || true
rm -f *.pdf 2>/dev/null || true
find . -name ".DS_Store" -delete 2>/dev/null || true
rm -rf test-results playwright-report 2>/dev/null || true
echo -e "${GREEN}✅ Old files removed${NC}"

# Clean PM2 logs
echo -e "${YELLOW}→ Cleaning PM2 logs...${NC}"
pm2 flush 2>/dev/null || true
echo -e "${GREEN}✅ PM2 logs cleaned${NC}"

# Clean Nginx cache
echo -e "${YELLOW}→ Cleaning Nginx cache...${NC}"
rm -rf /var/cache/nginx/* 2>/dev/null || true
echo -e "${GREEN}✅ Nginx cache cleaned${NC}"

echo ""
echo -e "${BLUE}═══════════════════════════════════════════${NC}"
echo -e "${BLUE}PHASE 4: DEPLOY OPTIMIZED CODE${NC}"
echo -e "${BLUE}═══════════════════════════════════════════${NC}"
echo ""

# Note: Optimized files should already be uploaded
echo -e "${YELLOW}→ Verifying optimized files...${NC}"
if [ -f "middleware.ts" ] && [ -f "lib/supabase-server.ts" ] && [ -f "ecosystem.config.js" ]; then
    echo -e "${GREEN}✅ Optimized files present${NC}"
else
    echo -e "${RED}❌ Missing optimized files! Please upload them first.${NC}"
    exit 1
fi

# Install dependencies
echo -e "${YELLOW}→ Installing dependencies (including dev dependencies for build)...${NC}"
npm install
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ npm install failed!${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Dependencies installed${NC}"

# Build application
echo -e "${YELLOW}→ Building Next.js application...${NC}"
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed!${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Application built successfully${NC}"

echo ""
echo -e "${BLUE}═══════════════════════════════════════════${NC}"
echo -e "${BLUE}PHASE 5: SETUP NGINX${NC}"
echo -e "${BLUE}═══════════════════════════════════════════${NC}"
echo ""

# Remove old Nginx config
echo -e "${YELLOW}→ Removing old Nginx configuration...${NC}"
rm -f /etc/nginx/sites-enabled/* 2>/dev/null || true
rm -f /etc/nginx/sites-available/invoicefbr* 2>/dev/null || true
echo -e "${GREEN}✅ Old config removed${NC}"

# Install new Nginx config
echo -e "${YELLOW}→ Installing new Nginx configuration...${NC}"
if [ -f "/root/nginx-invoicefbr.conf" ]; then
    cp /root/nginx-invoicefbr.conf /etc/nginx/sites-available/invoicefbr.conf
    ln -sf /etc/nginx/sites-available/invoicefbr.conf /etc/nginx/sites-enabled/
    echo -e "${GREEN}✅ New Nginx config installed${NC}"
else
    echo -e "${RED}❌ nginx-invoicefbr.conf not found in /root/${NC}"
    echo -e "${YELLOW}Skipping Nginx setup. You can set it up manually later.${NC}"
fi

# Create Nginx directories
echo -e "${YELLOW}→ Creating Nginx directories...${NC}"
mkdir -p /var/cache/nginx/invoicefbr
mkdir -p /var/www/certbot
mkdir -p /var/log/nginx
chown -R www-data:www-data /var/cache/nginx/invoicefbr
chown -R www-data:www-data /var/www/certbot
chown -R www-data:www-data /var/log/nginx
echo -e "${GREEN}✅ Nginx directories created${NC}"

# Test Nginx config
echo -e "${YELLOW}→ Testing Nginx configuration...${NC}"
nginx -t
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Nginx configuration valid${NC}"
else
    echo -e "${RED}❌ Nginx configuration invalid!${NC}"
    echo -e "${YELLOW}Continuing without Nginx...${NC}"
fi

echo ""
echo -e "${BLUE}═══════════════════════════════════════════${NC}"
echo -e "${BLUE}PHASE 6: START SERVICES${NC}"
echo -e "${BLUE}═══════════════════════════════════════════${NC}"
echo ""

# Start PM2
echo -e "${YELLOW}→ Starting PM2 cluster...${NC}"
cd "$PROJECT_DIR"
pm2 start ecosystem.config.js
pm2 save
echo -e "${GREEN}✅ PM2 started${NC}"

# Wait for PM2 to start
echo -e "${YELLOW}→ Waiting for application to start...${NC}"
sleep 5

# Start Nginx
echo -e "${YELLOW}→ Starting Nginx...${NC}"
systemctl start nginx
systemctl enable nginx
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Nginx started${NC}"
else
    echo -e "${YELLOW}⚠️  Nginx failed to start (check SSL certificates)${NC}"
fi

echo ""
echo -e "${BLUE}═══════════════════════════════════════════${NC}"
echo -e "${BLUE}PHASE 7: VERIFICATION${NC}"
echo -e "${BLUE}═══════════════════════════════════════════${NC}"
echo ""

# Check PM2 status
echo -e "${YELLOW}→ PM2 Status:${NC}"
pm2 status

# Check Nginx status
echo ""
echo -e "${YELLOW}→ Nginx Status:${NC}"
systemctl status nginx --no-pager | head -10

# Test health endpoint
echo ""
echo -e "${YELLOW}→ Testing health endpoint...${NC}"
sleep 2
HEALTH_CHECK=$(curl -s http://localhost:3001/api/health 2>/dev/null)
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Health check passed${NC}"
    echo "$HEALTH_CHECK" | jq . 2>/dev/null || echo "$HEALTH_CHECK"
else
    echo -e "${RED}❌ Health check failed${NC}"
fi

# Test stats caching
echo ""
echo -e "${YELLOW}→ Testing stats API caching...${NC}"
echo "First call (should hit database):"
time curl -s http://localhost:3001/api/stats/fbr-invoices > /dev/null
echo "Second call (should be cached):"
time curl -s http://localhost:3001/api/stats/fbr-invoices > /dev/null

# System resources
echo ""
echo -e "${YELLOW}→ System Resources:${NC}"
echo "Memory:"
free -h | grep -E "Mem|Swap"
echo ""
echo "Disk:"
df -h /var/www | tail -1

echo ""
echo -e "${BLUE}═══════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ DEPLOYMENT COMPLETE!${NC}"
echo -e "${BLUE}═══════════════════════════════════════════${NC}"
echo ""

echo -e "${GREEN}Deployment Summary:${NC}"
echo "  • Project: $PROJECT_DIR"
echo "  • Backup: $BACKUP_DIR"
echo "  • Nginx Backup: $NGINX_BACKUP"
echo "  • PM2 Instances: $(pm2 list | grep -c online)"
echo "  • Nginx: $(systemctl is-active nginx)"
echo ""

echo -e "${YELLOW}Next Steps:${NC}"
echo ""
echo "1. ${BLUE}Setup SSL Certificate:${NC}"
echo "   sudo apt-get install certbot python3-certbot-nginx"
echo "   sudo certbot --nginx -d invoicefbr.com -d www.invoicefbr.com"
echo ""
echo "2. ${BLUE}Add Database Indexes:${NC}"
echo "   Go to Supabase Dashboard → SQL Editor"
echo "   Run the queries from database-indexes.sql"
echo ""
echo "3. ${BLUE}Test the deployment:${NC}"
echo "   curl https://invoicefbr.com/api/health"
echo "   curl https://invoicefbr.com"
echo ""
echo "4. ${BLUE}Run load test:${NC}"
echo "   artillery run load-test-simple.yml"
echo ""
echo "5. ${BLUE}Monitor:${NC}"
echo "   pm2 monit"
echo "   pm2 logs invoicefbr"
echo "   tail -f /var/log/nginx/invoicefbr-access.log"
echo ""

echo -e "${GREEN}═══════════════════════════════════════════${NC}"
echo -e "${GREEN}Your server is now optimized and ready! 🚀${NC}"
echo -e "${GREEN}═══════════════════════════════════════════${NC}"
echo ""
