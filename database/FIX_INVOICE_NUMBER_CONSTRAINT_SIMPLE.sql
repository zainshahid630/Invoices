-- Simple version: Fix invoice_number constraint to be unique per company
-- Run this if the main migration script doesn't work

-- Step 1: First, let's see what constraints exist
-- Copy the constraint name from the results
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE conrelid = 'invoices'::regclass
AND contype = 'u';

-- Step 2: Drop the constraint (replace <constraint_name> with actual name from Step 1)
-- Common names: invoices_invoice_number_key, invoices_pkey, etc.
-- If you see a constraint with invoice_number in it, use that name below:

-- Try these one by one until one works:
-- ALTER TABLE invoices DROP CONSTRAINT invoices_invoice_number_key;
-- ALTER TABLE invoices DROP CONSTRAINT invoices_invoice_number_unique;
-- ALTER TABLE invoices DROP CONSTRAINT invoice_number_unique;

-- Step 3: Create the new company-scoped constraint
ALTER TABLE invoices 
ADD CONSTRAINT invoices_company_invoice_number_unique 
UNIQUE (company_id, invoice_number);

-- Step 4: Create index for performance
CREATE INDEX IF NOT EXISTS idx_invoices_company_invoice_number 
ON invoices(company_id, invoice_number);

-- Step 5: Verify it worked
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE conrelid = 'invoices'::regclass
AND conname = 'invoices_company_invoice_number_unique';

-- You should see:
-- invoices_company_invoice_number_unique | UNIQUE (company_id, invoice_number)
