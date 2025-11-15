-- ============================================
-- Diagnostic Queries for Missing Invoice Items
-- ============================================

-- 1. Find invoices without any items
SELECT 
  i.id,
  i.invoice_number,
  i.invoice_date,
  i.status,
  i.created_at,
  COUNT(ii.id) as item_count
FROM invoices i
LEFT JOIN invoice_items ii ON i.id = ii.invoice_id
WHERE i.deleted_at IS NULL
GROUP BY i.id, i.invoice_number, i.invoice_date, i.status, i.created_at
HAVING COUNT(ii.id) = 0
ORDER BY i.created_at DESC;

-- 2. Count invoices with and without items
SELECT 
  CASE 
    WHEN item_count = 0 THEN 'No Items'
    WHEN item_count > 0 THEN 'Has Items'
  END as status,
  COUNT(*) as invoice_count
FROM (
  SELECT 
    i.id,
    COUNT(ii.id) as item_count
  FROM invoices i
  LEFT JOIN invoice_items ii ON i.id = ii.invoice_id
  WHERE i.deleted_at IS NULL
  GROUP BY i.id
) as counts
GROUP BY status;

-- 3. Check for orphaned invoice items (items without invoice)
SELECT 
  ii.*
FROM invoice_items ii
LEFT JOIN invoices i ON ii.invoice_id = i.id
WHERE i.id IS NULL;

-- 4. Recent invoices with item counts
SELECT 
  i.id,
  i.invoice_number,
  i.invoice_date,
  i.status,
  i.buyer_name,
  i.total_amount,
  COUNT(ii.id) as item_count,
  i.created_at,
  i.updated_at
FROM invoices i
LEFT JOIN invoice_items ii ON i.id = ii.invoice_id
WHERE i.deleted_at IS NULL
GROUP BY i.id, i.invoice_number, i.invoice_date, i.status, i.buyer_name, i.total_amount, i.created_at, i.updated_at
ORDER BY i.created_at DESC
LIMIT 20;

-- 5. Check if there are any constraints or triggers that might be deleting items
SELECT 
  conname as constraint_name,
  contype as constraint_type,
  pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conrelid = 'invoice_items'::regclass;
