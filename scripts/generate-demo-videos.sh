#!/bin/bash

echo "🎬 Generating demo videos for all features..."
echo ""

# Create output directory
mkdir -p demo-videos

# Check if dev server is running
if ! curl -s http://localhost:3000 > /dev/null; then
    echo "❌ Dev server not running. Please start it with: npm run dev"
    exit 1
fi

echo "✅ Dev server is running"
echo ""

# Authentication demo
echo "📹 Recording: Authentication flow..."
PWVIDEO=1 npx playwright test tests/e2e/auth.spec.ts --headed --project=chromium --grep "should successfully login with valid seller credentials"

# Invoice demo
echo "📹 Recording: Invoice management..."
PWVIDEO=1 npx playwright test tests/e2e/invoices.spec.ts --headed --project=chromium --grep "display invoices page"

# Inventory demo
echo "📹 Recording: Inventory management..."
PWVIDEO=1 npx playwright test tests/e2e/inventory.spec.ts --headed --project=chromium --grep "display inventory page"

# Customer demo
echo "📹 Recording: Customer management..."
PWVIDEO=1 npx playwright test tests/e2e/customers.spec.ts --headed --project=chromium --grep "display customers page"

# Super Admin demo
echo "📹 Recording: Super Admin features..."
PWVIDEO=1 npx playwright test tests/e2e/super-admin.spec.ts --headed --project=chromium --grep "display super admin dashboard"

echo ""
echo "✅ All demo videos generated!"
echo "📁 Videos saved in: test-results/"
echo ""
echo "To view videos:"
echo "  1. Navigate to test-results/"
echo "  2. Find the test folders"
echo "  3. Open video.webm files"
