-- Query to check all constraints on the invoices table

-- 1. Check ALL constraints on invoices table
SELECT 
    conname AS constraint_name,
    contype AS constraint_type,
    CASE contype
        WHEN 'p' THEN 'PRIMARY KEY'
        WHEN 'u' THEN 'UNIQUE'
        WHEN 'f' THEN 'FOREIGN KEY'
        WHEN 'c' THEN 'CHECK'
        ELSE contype::text
    END AS type_description,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'invoices'::regclass
ORDER BY contype, conname;

-- 2. Check specifically for invoice_number related constraints
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE conrelid = 'invoices'::regclass
AND (conname LIKE '%invoice_number%' OR pg_get_constraintdef(oid) LIKE '%invoice_number%')
ORDER BY conname;

-- 3. Check all indexes on invoices table
SELECT 
    indexname AS index_name,
    indexdef AS index_definition
FROM pg_indexes
WHERE tablename = 'invoices'
ORDER BY indexname;

-- 4. Check if the correct constraint exists
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 
            FROM pg_constraint 
            WHERE conrelid = 'invoices'::regclass 
            AND conname = 'invoices_company_invoice_number_unique'
            AND pg_get_constraintdef(oid) = 'UNIQUE (company_id, invoice_number)'
        ) THEN '✅ CORRECT: Invoice numbers are unique per company'
        WHEN EXISTS (
            SELECT 1 
            FROM pg_constraint 
            WHERE conrelid = 'invoices'::regclass 
            AND pg_get_constraintdef(oid) LIKE '%UNIQUE%invoice_number%'
            AND pg_get_constraintdef(oid) NOT LIKE '%company_id%'
        ) THEN '❌ WRONG: Invoice numbers are globally unique (needs fix)'
        ELSE '⚠️ UNKNOWN: No unique constraint on invoice_number found'
    END AS status;

-- 5. Detailed check with explanation
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS definition,
    CASE 
        WHEN pg_get_constraintdef(oid) = 'UNIQUE (company_id, invoice_number)' 
        THEN '✅ CORRECT - Unique per company'
        WHEN pg_get_constraintdef(oid) LIKE 'UNIQUE (invoice_number%' 
        THEN '❌ WRONG - Globally unique'
        ELSE 'ℹ️ Other constraint'
    END AS status
FROM pg_constraint
WHERE conrelid = 'invoices'::regclass
AND contype = 'u'
ORDER BY conname;
