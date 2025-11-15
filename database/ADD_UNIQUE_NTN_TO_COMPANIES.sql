-- Add unique constraint to NTN number in companies table
-- This ensures no two companies can have the same NTN number
-- NULL values are allowed (for companies without NTN yet)

-- Step 1: First, clean up any duplicate NTN numbers if they exist
-- This query will help identify duplicates (run this first to check)
-- SELECT ntn_number, COUNT(*) as count 
-- FROM companies 
-- WHERE ntn_number IS NOT NULL AND ntn_number != ''
-- GROUP BY ntn_number 
-- HAVING COUNT(*) > 1;

-- Step 2: If duplicates exist, you need to manually resolve them
-- For example, you can update duplicates to make them unique:
-- UPDATE companies 
-- SET ntn_number = ntn_number || '-' || id::text 
-- WHERE id IN (
--   SELECT id FROM (
--     SELECT id, ROW_NUMBER() OVER (PARTITION BY ntn_number ORDER BY created_at) as rn
--     FROM companies 
--     WHERE ntn_number IS NOT NULL AND ntn_number != ''
--   ) t WHERE rn > 1
-- );

-- Step 3: Add unique constraint
-- This will allow NULL values but ensure non-NULL values are unique
ALTER TABLE companies 
ADD CONSTRAINT companies_ntn_number_unique 
UNIQUE (ntn_number);

-- Note: In PostgreSQL, NULL values are considered distinct from each other
-- So multiple companies can have NULL ntn_number, but no two companies
-- can have the same non-NULL ntn_number

-- Step 4: Create an index for better query performance
CREATE INDEX IF NOT EXISTS idx_companies_ntn_number 
ON companies(ntn_number) 
WHERE ntn_number IS NOT NULL AND ntn_number != '';

-- Verification query (run after migration)
-- SELECT 
--   COUNT(*) as total_companies,
--   COUNT(DISTINCT ntn_number) as unique_ntns,
--   COUNT(ntn_number) as companies_with_ntn,
--   COUNT(*) - COUNT(ntn_number) as companies_without_ntn
-- FROM companies;
