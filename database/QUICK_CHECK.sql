-- QUICK CHECK: Run this single query to see all constraints

SELECT 
    conname AS constraint_name,
    CASE contype
        WHEN 'p' THEN 'PRIMARY KEY'
        WHEN 'u' THEN 'UNIQUE'
        WHEN 'f' THEN 'FOREIGN KEY'
        WHEN 'c' THEN 'CHECK'
    END AS type,
    pg_get_constraintdef(oid) AS definition,
    CASE 
        WHEN conname = 'invoices_company_invoice_number_unique' 
             AND pg_get_constraintdef(oid) = 'UNIQUE (company_id, invoice_number)'
        THEN '✅ CORRECT - Unique per company'
        WHEN pg_get_constraintdef(oid) LIKE '%UNIQUE%invoice_number%' 
             AND pg_get_constraintdef(oid) NOT LIKE '%company_id%'
        THEN '❌ WRONG - Globally unique (needs fix)'
        ELSE 'ℹ️ Other constraint'
    END AS status
FROM pg_constraint
WHERE conrelid = 'invoices'::regclass
ORDER BY contype, conname;
