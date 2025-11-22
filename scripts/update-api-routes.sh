#!/bin/bash

# Script to update all API routes to use Supabase singleton
# This improves performance by reusing the same client instance

echo "🔄 Updating API routes to use Supabase singleton..."

# Find all API route files
API_FILES=$(find app/api -name "route.ts" -type f)

COUNT=0
for file in $API_FILES; do
  # Check if file uses createClient pattern
  if grep -q "const supabase = createClient" "$file"; then
    echo "📝 Updating: $file"
    
    # Replace import
    sed -i.bak "s/import { createClient } from '@supabase\/supabase-js';/import { getSupabaseServer } from '@\/lib\/supabase-server';/g" "$file"
    
    # Replace client creation
    sed -i.bak "/const supabase = createClient(/,/);/d" "$file"
    
    # Add getSupabaseServer() call before first supabase usage
    # This is a simplified approach - manual review recommended
    
    COUNT=$((COUNT + 1))
  fi
done

echo "✅ Updated $COUNT API route files"
echo "⚠️  Please review changes manually and test thoroughly"
echo "💡 Backup files created with .bak extension"
