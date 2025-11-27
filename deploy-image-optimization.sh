#!/bin/bash

# Image Optimization Deployment Script
# This script deploys the image loading optimizations to the production server

set -e  # Exit on any error

echo "=========================================="
echo "Image Optimization Deployment"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
SERVER_USER="root"
SERVER_IP="167.71.232.76"
APP_DIR="/root/invoicefbr"
PM2_APP_NAME="invoicefbr"

echo -e "${BLUE}Step 1: Building the application locally...${NC}"
npm run build
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Build successful${NC}"
else
    echo -e "${RED}✗ Build failed${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}Step 2: Connecting to server and deploying...${NC}"
echo -e "${YELLOW}Note: You may be prompted for the server password${NC}"
echo ""

# Create a temporary deployment package
echo "Creating deployment package..."
tar -czf /tmp/image-optimization-deploy.tar.gz \
  app/how-it-works/page.tsx \
  next.config.js \
  package.json \
  package-lock.json

echo -e "${GREEN}✓ Package created${NC}"

echo ""
echo -e "${BLUE}Step 3: Uploading and deploying on server...${NC}"

# Upload and deploy in one SSH session
cat /tmp/image-optimization-deploy.tar.gz | ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP} '
set -e

cd /root/invoicefbr

echo "Extracting files..."
tar -xzf - 

echo "Installing dependencies..."
npm install --production=false

echo "Building application..."
npm run build

echo "Restarting PM2 application..."
pm2 restart invoicefbr

echo "Checking application status..."
pm2 status invoicefbr

echo ""
echo "Deployment completed successfully!"
'

# Clean up
rm -f /tmp/image-optimization-deploy.tar.gz

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}=========================================="
    echo -e "✓ Deployment Successful!"
    echo -e "==========================================${NC}"
    echo ""
    echo -e "${YELLOW}Image Optimization Changes Deployed:${NC}"
    echo "  • Priority loading for first 2 images"
    echo "  • Animated shimmer placeholders"
    echo "  • Improved image quality (85)"
    echo "  • Long-term caching (1 year)"
    echo "  • Background colors for smooth loading"
    echo ""
    echo -e "${BLUE}Test the changes:${NC}"
    echo "  1. Visit: https://invoicefbr.com/how-it-works"
    echo "  2. Clear browser cache (Ctrl+Shift+R)"
    echo "  3. Notice smooth image loading with shimmer effect"
    echo "  4. Refresh page - images load instantly from cache"
    echo ""
    echo -e "${YELLOW}Monitor the application:${NC}"
    echo "  ssh root@167.71.232.76"
    echo "  pm2 logs invoicefbr"
    echo ""
else
    echo ""
    echo -e "${RED}=========================================="
    echo -e "✗ Deployment Failed!"
    echo -e "==========================================${NC}"
    echo ""
    echo "Please check the error messages above and try again."
    exit 1
fi
