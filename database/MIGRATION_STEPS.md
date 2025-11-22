# Step-by-Step Migration Guide

## Issue
Invoice numbers are globally unique instead of unique per company.

## Solution
Change the UNIQUE constraint from `invoice_number` to `(company_id, invoice_number)`.

## Steps

### Step 1: Find Existing Constraints

Run this in Supabase SQL Editor:

```sql
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE conrelid = 'invoices'::regclass
AND contype = 'u';
```

**Expected Output**:
```
constraint_name              | definition
----------------------------|---------------------------
invoices_pkey               | PRIMARY KEY (id)
<some_constraint_name>      | UNIQUE (invoice_number)
```

**Note the constraint name** that has `UNIQUE (invoice_number)` - you'll need it in Step 2.

### Step 2: Drop the Old Constraint

Replace `<constraint_name>` with the actual name from Step 1:

```sql
ALTER TABLE invoices DROP CONSTRAINT <constraint_name>;
```

**Examples** (try the one that matches your constraint name):
```sql
-- If constraint is named "invoices_invoice_number_key"
ALTER TABLE invoices DROP CONSTRAINT invoices_invoice_number_key;

-- If constraint is named "invoices_invoice_number_unique"
ALTER TABLE invoices DROP CONSTRAINT invoices_invoice_number_unique;

-- If constraint is named "invoice_number_unique"
ALTER TABLE invoices DROP CONSTRAINT invoice_number_unique;
```

### Step 3: Create New Company-Scoped Constraint

```sql
ALTER TABLE invoices 
ADD CONSTRAINT invoices_company_invoice_number_unique 
UNIQUE (company_id, invoice_number);
```

### Step 4: Create Index for Performance

```sql
CREATE INDEX IF NOT EXISTS idx_invoices_company_invoice_number 
ON invoices(company_id, invoice_number);
```

### Step 5: Verify

```sql
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE conrelid = 'invoices'::regclass
AND conname = 'invoices_company_invoice_number_unique';
```

**Expected Output**:
```
constraint_name                           | definition
-----------------------------------------|----------------------------------
invoices_company_invoice_number_unique  | UNIQUE (company_id, invoice_number)
```

✅ If you see this, the migration is complete!

## Complete Script (Copy-Paste)

Once you know the constraint name from Step 1, use this complete script:

```sql
-- Replace <YOUR_CONSTRAINT_NAME> with actual name
ALTER TABLE invoices DROP CONSTRAINT <YOUR_CONSTRAINT_NAME>;

-- Create new constraint
ALTER TABLE invoices 
ADD CONSTRAINT invoices_company_invoice_number_unique 
UNIQUE (company_id, invoice_number);

-- Create index
CREATE INDEX IF NOT EXISTS idx_invoices_company_invoice_number 
ON invoices(company_id, invoice_number);

-- Verify
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE conrelid = 'invoices'::regclass
AND conname = 'invoices_company_invoice_number_unique';
```

## Troubleshooting

### Error: constraint does not exist

**Cause**: The constraint name is different than expected.

**Solution**: Run Step 1 again and use the exact constraint name shown.

### Error: duplicate key value violates unique constraint

**Cause**: You already have duplicate invoice numbers in the same company.

**Solution**: Find and fix duplicates first:

```sql
-- Find duplicates
SELECT company_id, invoice_number, COUNT(*) as count
FROM invoices 
GROUP BY company_id, invoice_number 
HAVING COUNT(*) > 1;

-- Fix by appending ID to duplicates
UPDATE invoices 
SET invoice_number = invoice_number || '-' || SUBSTRING(id::text, 1, 8)
WHERE id IN (
  SELECT id FROM (
    SELECT id, ROW_NUMBER() OVER (
      PARTITION BY company_id, invoice_number 
      ORDER BY created_at
    ) as rn
    FROM invoices
  ) t WHERE rn > 1
);
```

### Error: constraint already exists

**Cause**: The constraint was already created.

**Solution**: Skip to Step 5 to verify it's correct.

## Testing After Migration

### Test 1: Same invoice number in different companies (should work)

```sql
-- This should succeed
INSERT INTO invoices (company_id, invoice_number, invoice_date, invoice_type, subtotal, total_amount)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'TEST001', CURRENT_DATE, 'Sale Invoice', 1000, 1000),
  ('22222222-2222-2222-2222-222222222222', 'TEST001', CURRENT_DATE, 'Sale Invoice', 2000, 2000);

-- Clean up
DELETE FROM invoices WHERE invoice_number = 'TEST001';
```

### Test 2: Duplicate in same company (should fail)

```sql
-- First insert should succeed
INSERT INTO invoices (company_id, invoice_number, invoice_date, invoice_type, subtotal, total_amount)
VALUES ('11111111-1111-1111-1111-111111111111', 'TEST002', CURRENT_DATE, 'Sale Invoice', 1000, 1000);

-- Second insert should fail with: duplicate key value violates unique constraint
INSERT INTO invoices (company_id, invoice_number, invoice_date, invoice_type, subtotal, total_amount)
VALUES ('11111111-1111-1111-1111-111111111111', 'TEST002', CURRENT_DATE, 'Sale Invoice', 2000, 2000);

-- Clean up
DELETE FROM invoices WHERE invoice_number = 'TEST002';
```

## Summary

✅ **Before**: Invoice numbers were unique globally (across all companies)
✅ **After**: Invoice numbers are unique per company
✅ **Benefit**: Different companies can use the same invoice numbers

The migration is complete when you see the constraint `invoices_company_invoice_number_unique` with definition `UNIQUE (company_id, invoice_number)`.
