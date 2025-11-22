-- Fix invoice_number constraint to be unique per company, not globally
-- This allows different companies to have the same invoice numbers

-- Step 1: Find and display existing constraints
-- Run this first to see what constraints exist
SELECT 
    conname AS constraint_name,
    contype AS constraint_type,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'invoices'::regclass
AND (conname LIKE '%invoice%' OR contype = 'u');

-- Step 2: Drop ALL unique constraints on invoice_number
-- This handles different possible constraint names
DO $$ 
DECLARE
    constraint_name TEXT;
BEGIN
    -- Find all unique constraints that involve invoice_number
    FOR constraint_name IN 
        SELECT conname 
        FROM pg_constraint 
        WHERE conrelid = 'invoices'::regclass 
        AND contype = 'u'
        AND pg_get_constraintdef(oid) LIKE '%invoice_number%'
    LOOP
        EXECUTE format('ALTER TABLE invoices DROP CONSTRAINT IF EXISTS %I', constraint_name);
        RAISE NOTICE 'Dropped constraint: %', constraint_name;
    END LOOP;
END $$;

-- Step 3: Create a composite UNIQUE constraint on (company_id, invoice_number)
-- This ensures invoice numbers are unique within each company, but can be duplicated across companies
ALTER TABLE invoices 
ADD CONSTRAINT invoices_company_invoice_number_unique 
UNIQUE (company_id, invoice_number);

-- Step 4: Create an index for faster lookups
CREATE INDEX IF NOT EXISTS idx_invoices_company_invoice_number 
ON invoices(company_id, invoice_number);

-- Step 5: Verification - Check the new constraint was created
SELECT 
    conname AS constraint_name,
    contype AS constraint_type,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'invoices'::regclass
AND conname = 'invoices_company_invoice_number_unique';

-- Expected result:
-- constraint_name: invoices_company_invoice_number_unique
-- constraint_type: u
-- constraint_definition: UNIQUE (company_id, invoice_number)
