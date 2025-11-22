#!/bin/bash

echo "🧪 Testing Week 1 Optimizations..."
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Check if React Query is installed
echo "1️⃣  Checking React Query installation..."
if npm list @tanstack/react-query > /dev/null 2>&1; then
    echo -e "${GREEN}✅ React Query installed${NC}"
else
    echo -e "${RED}❌ React Query not found${NC}"
    echo "   Run: npm install @tanstack/react-query @tanstack/react-query-devtools"
fi
echo ""

# Test 2: Check if new files exist
echo "2️⃣  Checking new files..."
FILES=(
    "lib/supabase-server.ts"
    "app/providers.tsx"
    "lib/hooks/useInvoices.ts"
    "lib/hooks/useCustomers.ts"
    "lib/hooks/useProducts.ts"
    "lib/hooks/useDashboard.ts"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $file${NC}"
    else
        echo -e "${RED}❌ $file missing${NC}"
    fi
done
echo ""

# Test 3: Check React Strict Mode
echo "3️⃣  Checking React Strict Mode..."
if grep -q "reactStrictMode: true" next.config.js; then
    echo -e "${GREEN}✅ React Strict Mode enabled${NC}"
else
    echo -e "${YELLOW}⚠️  React Strict Mode not enabled${NC}"
fi
echo ""

# Test 4: Check PM2 cluster mode
echo "4️⃣  Checking PM2 configuration..."
if grep -q "exec_mode: 'cluster'" ecosystem.config.js; then
    echo -e "${GREEN}✅ PM2 cluster mode enabled${NC}"
else
    echo -e "${YELLOW}⚠️  PM2 still using fork mode${NC}"
fi
echo ""

# Test 5: Check if app compiles
echo "5️⃣  Testing TypeScript compilation..."
if npx tsc --noEmit > /dev/null 2>&1; then
    echo -e "${GREEN}✅ No TypeScript errors${NC}"
else
    echo -e "${YELLOW}⚠️  TypeScript errors found (check with: npx tsc --noEmit)${NC}"
fi
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Next steps:"
echo "1. Run: npm run dev"
echo "2. Open: http://localhost:3000"
echo "3. Check browser console for errors"
echo "4. Apply database indexes (see scripts/apply-indexes.md)"
echo "5. Update API routes to use Supabase singleton"
echo "6. Migrate pages to use React Query hooks"
echo ""
echo "📖 Full guide: WEEK1_IMPLEMENTATION_GUIDE.md"
echo ""
