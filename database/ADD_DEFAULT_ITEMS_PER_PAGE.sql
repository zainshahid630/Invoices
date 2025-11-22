-- =====================================================
-- ADD DEFAULT ITEMS PER PAGE SETTING
-- =====================================================
-- This adds a setting to control how many items to load
-- initially on the invoices page (default: 10)

ALTER TABLE public.settings 
ADD COLUMN IF NOT EXISTS default_items_per_page INTEGER DEFAULT 10;

-- Add comment
COMMENT ON COLUMN public.settings.default_items_per_page IS 'Default number of items to display per page on invoice list (default: 10)';

-- Verify the column was added
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'settings' 
AND column_name = 'default_items_per_page';
