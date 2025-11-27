#!/bin/bash

# ============================================
# Setup Fresh Nginx for InvoiceFBR
# ============================================

echo "🚀 Setting up Fresh Nginx Configuration"
echo "============================================"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "❌ Please run as root (use sudo)"
    exit 1
fi

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}This will:${NC}"
echo "1. Stop current nginx"
echo "2. Backup existing configuration"
echo "3. Install fresh nginx configuration"
echo "4. Create cache directories"
echo "5. Test and restart nginx"
echo ""
read -p "Continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Aborted."
    exit 0
fi

echo ""
echo "============================================"
echo "STEP 1: Stop Current Nginx"
echo "============================================"

systemctl stop nginx
echo -e "${GREEN}✅ Nginx stopped${NC}"
echo ""

echo "============================================"
echo "STEP 2: Backup Existing Configuration"
echo "============================================"

BACKUP_DIR="/etc/nginx/backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p $BACKUP_DIR

if [ -d "/etc/nginx/sites-available" ]; then
    cp -r /etc/nginx/sites-available $BACKUP_DIR/
    cp -r /etc/nginx/sites-enabled $BACKUP_DIR/
    cp /etc/nginx/nginx.conf $BACKUP_DIR/
    echo -e "${GREEN}✅ Backup created: $BACKUP_DIR${NC}"
else
    echo -e "${YELLOW}⚠️  No existing configuration found${NC}"
fi

echo ""

echo "============================================"
echo "STEP 3: Remove Old Configuration"
echo "============================================"

# Remove old site configs
rm -f /etc/nginx/sites-enabled/invoicefbr*
rm -f /etc/nginx/sites-enabled/default
rm -f /etc/nginx/sites-available/invoicefbr*

echo -e "${GREEN}✅ Old configuration removed${NC}"
echo ""

echo "============================================"
echo "STEP 4: Install New Configuration"
echo "============================================"

# Copy new configuration
cp nginx-invoicefbr.conf /etc/nginx/sites-available/invoicefbr.conf

# Create symlink
ln -sf /etc/nginx/sites-available/invoicefbr.conf /etc/nginx/sites-enabled/

echo -e "${GREEN}✅ New configuration installed${NC}"
echo ""

echo "============================================"
echo "STEP 5: Create Cache Directories"
echo "============================================"

# Create cache directory
mkdir -p /var/cache/nginx/invoicefbr
chown -R www-data:www-data /var/cache/nginx/invoicefbr
chmod -R 755 /var/cache/nginx/invoicefbr

# Create log directory
mkdir -p /var/log/nginx
chown -R www-data:www-data /var/log/nginx

echo -e "${GREEN}✅ Cache directories created${NC}"
echo ""

echo "============================================"
echo "STEP 6: Create SSL Certificate Directory"
echo "============================================"

# Create certbot directory for Let's Encrypt
mkdir -p /var/www/certbot
chown -R www-data:www-data /var/www/certbot

echo -e "${GREEN}✅ SSL directories created${NC}"
echo ""

echo "============================================"
echo "STEP 7: Test Nginx Configuration"
echo "============================================"

nginx -t

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Nginx configuration test failed!${NC}"
    echo ""
    echo "Restoring backup..."
    cp -r $BACKUP_DIR/sites-available/* /etc/nginx/sites-available/
    cp -r $BACKUP_DIR/sites-enabled/* /etc/nginx/sites-enabled/
    cp $BACKUP_DIR/nginx.conf /etc/nginx/nginx.conf
    echo "Backup restored. Please check the configuration."
    exit 1
fi

echo -e "${GREEN}✅ Configuration test passed${NC}"
echo ""

echo "============================================"
echo "STEP 8: Start Nginx"
echo "============================================"

systemctl start nginx
systemctl enable nginx

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to start nginx${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Nginx started${NC}"
echo ""

echo "============================================"
echo "STEP 9: Verify Nginx Status"
echo "============================================"

systemctl status nginx --no-pager

echo ""
echo "============================================"
echo "✅ NGINX SETUP COMPLETE!"
echo "============================================"
echo ""
echo "Configuration: /etc/nginx/sites-available/invoicefbr.conf"
echo "Backup: $BACKUP_DIR"
echo ""
echo "Next steps:"
echo "1. Setup SSL certificate (see below)"
echo "2. Update PM2 ports if needed"
echo "3. Test the website"
echo ""
echo "============================================"
echo "📜 SSL CERTIFICATE SETUP"
echo "============================================"
echo ""
echo "If you don't have SSL certificate yet:"
echo ""
echo "# Install certbot"
echo "apt-get update"
echo "apt-get install -y certbot python3-certbot-nginx"
echo ""
echo "# Get certificate"
echo "certbot --nginx -d invoicefbr.com -d www.invoicefbr.com"
echo ""
echo "# Auto-renewal"
echo "certbot renew --dry-run"
echo ""
echo "============================================"
echo "🧪 TESTING"
echo "============================================"
echo ""
echo "Test nginx:"
echo "  curl -I http://localhost"
echo "  curl -I https://invoicefbr.com"
echo ""
echo "Check logs:"
echo "  tail -f /var/log/nginx/invoicefbr-access.log"
echo "  tail -f /var/log/nginx/invoicefbr-error.log"
echo ""
echo "Reload nginx:"
echo "  systemctl reload nginx"
echo ""
