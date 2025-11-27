#!/bin/bash

# Quick deployment script for image optimization
# This uses git to deploy changes

echo "=========================================="
echo "Quick Image Optimization Deployment"
echo "=========================================="
echo ""

# Check if we're in a git repo
if [ ! -d .git ]; then
    echo "Error: Not in a git repository"
    exit 1
fi

# Check for uncommitted changes
if [[ -n $(git status -s) ]]; then
    echo "You have uncommitted changes. Committing them now..."
    git add app/how-it-works/page.tsx next.config.js
    git commit -m "Optimize image loading on how-it-works page with shimmer effect and priority loading"
    echo "✓ Changes committed"
else
    echo "✓ No uncommitted changes"
fi

echo ""
echo "Pushing to remote repository..."
git push origin main

if [ $? -eq 0 ]; then
    echo "✓ Pushed successfully"
else
    echo "✗ Push failed. Please check your git configuration."
    exit 1
fi

echo ""
echo "=========================================="
echo "Now deploying on server..."
echo "=========================================="
echo ""
echo "You will be prompted for the server password."
echo ""

# Deploy on server
ssh root@167.71.232.76 << 'ENDSSH'
cd /root/invoicefbr

echo "Pulling latest changes..."
git pull origin main

echo "Installing dependencies..."
npm install

echo "Building application..."
npm run build

echo "Restarting application..."
pm2 restart invoicefbr

echo ""
echo "✓ Deployment completed!"
echo ""
echo "Checking application status..."
pm2 status invoicefbr
ENDSSH

if [ $? -eq 0 ]; then
    echo ""
    echo "=========================================="
    echo "✓ Deployment Successful!"
    echo "=========================================="
    echo ""
    echo "Test your changes at:"
    echo "https://invoicefbr.com/how-it-works"
    echo ""
    echo "Clear browser cache (Ctrl+Shift+R) to see the shimmer effect!"
else
    echo ""
    echo "✗ Deployment failed. Please check the error messages above."
    exit 1
fi
