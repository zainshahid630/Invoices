-- Verification and Cleanup Script
-- Run this to check if migration is complete and clean up if needed

-- ============================================
-- STEP 1: CHECK CURRENT STATE
-- ============================================

-- Check all unique constraints on invoices table
SELECT 
    '=== CURRENT UNIQUE CONSTRAINTS ===' AS info;

SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS definition,
    CASE 
        WHEN conname = 'invoices_company_invoice_number_unique' 
             AND pg_get_constraintdef(oid) = 'UNIQUE (company_id, invoice_number)'
        THEN '✅ CORRECT'
        WHEN pg_get_constraintdef(oid) LIKE '%invoice_number%' 
             AND pg_get_constraintdef(oid) NOT LIKE '%company_id%'
        THEN '❌ NEEDS REMOVAL'
        ELSE 'ℹ️ OK'
    END AS status
FROM pg_constraint
WHERE conrelid = 'invoices'::regclass
AND contype = 'u'
ORDER BY conname;

-- ============================================
-- STEP 2: CHECK IF CORRECT CONSTRAINT EXISTS
-- ============================================

SELECT 
    '=== VERIFICATION ===' AS info;

SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 
            FROM pg_constraint 
            WHERE conrelid = 'invoices'::regclass 
            AND conname = 'invoices_company_invoice_number_unique'
            AND pg_get_constraintdef(oid) = 'UNIQUE (company_id, invoice_number)'
        ) THEN '✅ Migration Complete: Invoice numbers are unique per company'
        ELSE '❌ Migration Needed: Run the migration script'
    END AS migration_status;

-- ============================================
-- STEP 3: CLEANUP OLD CONSTRAINTS (if needed)
-- ============================================

-- If you see any constraints marked as "❌ NEEDS REMOVAL" in Step 1,
-- uncomment and run the appropriate DROP statement below:

-- Example: If you see "invoices_invoice_number_key"
-- ALTER TABLE invoices DROP CONSTRAINT invoices_invoice_number_key;

-- Example: If you see "invoices_invoice_number_unique"
-- ALTER TABLE invoices DROP CONSTRAINT invoices_invoice_number_unique;

-- Example: If you see "invoice_number_unique"
-- ALTER TABLE invoices DROP CONSTRAINT invoice_number_unique;

-- ============================================
-- STEP 4: TEST THE CONSTRAINT
-- ============================================

-- Test 1: Try to insert same invoice number in different companies (should succeed)
DO $$
DECLARE
    test_company_1 UUID := '00000000-0000-0000-0000-000000000001';
    test_company_2 UUID := '00000000-0000-0000-0000-000000000002';
BEGIN
    -- Clean up any previous test data
    DELETE FROM invoices WHERE invoice_number = 'TEST_CONSTRAINT_001';
    
    -- Insert same invoice number in two different companies
    INSERT INTO invoices (company_id, invoice_number, invoice_date, invoice_type, subtotal, total_amount, buyer_name)
    VALUES 
        (test_company_1, 'TEST_CONSTRAINT_001', CURRENT_DATE, 'Sale Invoice', 1000, 1000, 'Test Buyer 1'),
        (test_company_2, 'TEST_CONSTRAINT_001', CURRENT_DATE, 'Sale Invoice', 2000, 2000, 'Test Buyer 2');
    
    RAISE NOTICE '✅ Test 1 PASSED: Same invoice number in different companies works';
    
    -- Clean up
    DELETE FROM invoices WHERE invoice_number = 'TEST_CONSTRAINT_001';
    
EXCEPTION
    WHEN unique_violation THEN
        RAISE NOTICE '❌ Test 1 FAILED: Cannot use same invoice number in different companies (constraint is still global)';
        DELETE FROM invoices WHERE invoice_number = 'TEST_CONSTRAINT_001';
    WHEN OTHERS THEN
        RAISE NOTICE '⚠️ Test 1 ERROR: %', SQLERRM;
        DELETE FROM invoices WHERE invoice_number = 'TEST_CONSTRAINT_001';
END $$;

-- Test 2: Try to insert duplicate invoice number in same company (should fail)
DO $$
DECLARE
    test_company UUID := '00000000-0000-0000-0000-000000000001';
BEGIN
    -- Clean up any previous test data
    DELETE FROM invoices WHERE invoice_number = 'TEST_CONSTRAINT_002';
    
    -- Insert first invoice
    INSERT INTO invoices (company_id, invoice_number, invoice_date, invoice_type, subtotal, total_amount, buyer_name)
    VALUES (test_company, 'TEST_CONSTRAINT_002', CURRENT_DATE, 'Sale Invoice', 1000, 1000, 'Test Buyer');
    
    -- Try to insert duplicate (should fail)
    BEGIN
        INSERT INTO invoices (company_id, invoice_number, invoice_date, invoice_type, subtotal, total_amount, buyer_name)
        VALUES (test_company, 'TEST_CONSTRAINT_002', CURRENT_DATE, 'Sale Invoice', 2000, 2000, 'Test Buyer');
        
        RAISE NOTICE '❌ Test 2 FAILED: Duplicate invoice number in same company was allowed (constraint missing)';
    EXCEPTION
        WHEN unique_violation THEN
            RAISE NOTICE '✅ Test 2 PASSED: Duplicate invoice number in same company correctly blocked';
    END;
    
    -- Clean up
    DELETE FROM invoices WHERE invoice_number = 'TEST_CONSTRAINT_002';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '⚠️ Test 2 ERROR: %', SQLERRM;
        DELETE FROM invoices WHERE invoice_number = 'TEST_CONSTRAINT_002';
END $$;

-- ============================================
-- STEP 5: FINAL SUMMARY
-- ============================================

SELECT 
    '=== FINAL STATUS ===' AS info;

SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 
            FROM pg_constraint 
            WHERE conrelid = 'invoices'::regclass 
            AND conname = 'invoices_company_invoice_number_unique'
            AND pg_get_constraintdef(oid) = 'UNIQUE (company_id, invoice_number)'
        ) THEN 
            '✅ READY: Invoice numbering system is correctly configured. ' ||
            'Different companies can use the same invoice numbers.'
        ELSE 
            '❌ ACTION REQUIRED: Run the migration script to fix the constraint.'
    END AS final_status;

-- Show all constraints one more time for reference
SELECT 
    '=== ALL CONSTRAINTS (for reference) ===' AS info;

SELECT 
    conname AS constraint_name,
    CASE contype
        WHEN 'p' THEN 'PRIMARY KEY'
        WHEN 'u' THEN 'UNIQUE'
        WHEN 'f' THEN 'FOREIGN KEY'
        WHEN 'c' THEN 'CHECK'
    END AS type,
    pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE conrelid = 'invoices'::regclass
ORDER BY contype, conname;
