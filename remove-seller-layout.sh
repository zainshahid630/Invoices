#!/bin/bash

# Script to remove SellerLayout wrapper from all seller pages

# List of files to process
files=(
  "app/seller/products/page.tsx"
  "app/seller/customers/page.tsx"
  "app/seller/invoices/page.tsx"
  "app/seller/payments/page.tsx"
  "app/seller/reports/page.tsx"
  "app/seller/settings/page.tsx"
  "app/seller/subscription/page.tsx"
  "app/seller/fbr-sandbox/page.tsx"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "Processing $file..."
    
    # Remove the import line for SellerLayout
    sed -i '' "/import SellerLayout from/d" "$file"
    
    # Remove <> opening tag
    sed -i '' "s/<>//g" "$file"
    
    # Remove </> closing tag
    sed -i '' "s/<\/SellerLayout>//g" "$file"
    
    echo "✓ Processed $file"
  else
    echo "✗ File not found: $file"
  fi
done

echo ""
echo "Done! All files processed."
