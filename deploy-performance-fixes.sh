#!/bin/bash

# ============================================
# Deploy Performance Fixes to Production
# ============================================

SERVER_IP="157.173.121.26"
SERVER_USER="root"
SERVER_PATH="/var/www/inovices"

echo "🚀 Deploying Performance Fixes to Production"
echo "============================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if we can connect
echo -e "${YELLOW}Testing connection to server...${NC}"
ssh -o ConnectTimeout=5 ${SERVER_USER}@${SERVER_IP} "echo 'Connection successful'" 2>/dev/null
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Cannot connect to server. Please check:${NC}"
    echo "   - Server IP: ${SERVER_IP}"
    echo "   - Username: ${SERVER_USER}"
    echo "   - SSH key or password"
    exit 1
fi

echo -e "${GREEN}✅ Connected to server${NC}"
echo ""

# Create backup on server
echo -e "${YELLOW}📦 Creating backup on server...${NC}"
ssh ${SERVER_USER}@${SERVER_IP} "cd ${SERVER_PATH} && cp -r . ../inovices-backup-\$(date +%Y%m%d-%H%M%S)"
echo -e "${GREEN}✅ Backup created${NC}"
echo ""

# Upload optimized files
echo -e "${YELLOW}📤 Uploading optimized files...${NC}"

# Upload middleware.ts
echo "   → middleware.ts"
scp middleware.ts ${SERVER_USER}@${SERVER_IP}:${SERVER_PATH}/

# Upload lib/supabase-server.ts
echo "   → lib/supabase-server.ts"
scp lib/supabase-server.ts ${SERVER_USER}@${SERVER_IP}:${SERVER_PATH}/lib/

# Upload app/api/stats/fbr-invoices/route.ts
echo "   → app/api/stats/fbr-invoices/route.ts"
scp app/api/stats/fbr-invoices/route.ts ${SERVER_USER}@${SERVER_IP}:${SERVER_PATH}/app/api/stats/fbr-invoices/

# Upload ecosystem.config.js
echo "   → ecosystem.config.js"
scp ecosystem.config.js ${SERVER_USER}@${SERVER_IP}:${SERVER_PATH}/

echo -e "${GREEN}✅ Files uploaded${NC}"
echo ""

# Rebuild and restart
echo -e "${YELLOW}🔨 Rebuilding application...${NC}"
ssh ${SERVER_USER}@${SERVER_IP} << 'ENDSSH'
cd /var/www/inovices

# Build Next.js
echo "Building Next.js..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo "✅ Build successful"

# Restart PM2
echo "Restarting PM2..."
pm2 delete invoicefbr 2>/dev/null
pm2 start ecosystem.config.js
pm2 save

echo "✅ PM2 restarted"

# Check status
echo ""
echo "PM2 Status:"
pm2 status

echo ""
echo "Checking health..."
sleep 3
curl -s http://localhost:3001/api/health | jq . || echo "Health check endpoint not responding yet"

ENDSSH

echo ""
echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Run database indexes (see below)"
echo "2. Test the deployment"
echo "3. Run load test"
echo ""
echo "============================================"
echo "📊 DATABASE INDEXES (Run in Supabase)"
echo "============================================"
echo ""
cat << 'EOF'
-- Copy and paste this in Supabase SQL Editor:

CREATE INDEX IF NOT EXISTS idx_invoices_status 
ON invoices(status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_invoices_deleted_at 
ON invoices(deleted_at) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_invoices_company_id 
ON invoices(company_id) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_products_company_id 
ON products(company_id);

CREATE INDEX IF NOT EXISTS idx_customers_company_id 
ON customers(company_id);

ANALYZE invoices;
ANALYZE companies;
ANALYZE products;
ANALYZE customers;
EOF

echo ""
echo "============================================"
echo "🧪 TESTING"
echo "============================================"
echo ""
echo "SSH into server and run:"
echo "  ssh ${SERVER_USER}@${SERVER_IP}"
echo ""
echo "Then test:"
echo "  curl http://localhost:3001/api/health"
echo "  time curl http://localhost:3001/api/stats/fbr-invoices"
echo "  time curl http://localhost:3001/api/stats/fbr-invoices  # Should be faster!"
echo ""
echo "Monitor logs:"
echo "  pm2 logs invoicefbr --lines 50"
echo ""
echo "Run load test from local:"
echo "  artillery run load-test-simple.yml"
echo ""
