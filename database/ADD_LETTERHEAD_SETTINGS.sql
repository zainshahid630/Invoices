-- =====================================================
-- ADD LETTERHEAD SETTINGS TO SETTINGS TABLE
-- =====================================================
-- This adds columns for letterhead template configuration
-- Run this in Supabase SQL Editor
-- =====================================================

-- Add letterhead_top_space column (in millimeters)
ALTER TABLE public.settings 
ADD COLUMN IF NOT EXISTS letterhead_top_space INTEGER DEFAULT 120;

-- Add letterhead_show_qr column
ALTER TABLE public.settings 
ADD COLUMN IF NOT EXISTS letterhead_show_qr BOOLEAN DEFAULT true;

-- Add comment
COMMENT ON COLUMN public.settings.letterhead_top_space IS 'Top space in millimeters for pre-printed letterhead (default: 120mm)';
COMMENT ON COLUMN public.settings.letterhead_show_qr IS 'Show QR code in letterhead template (default: true)';

-- Verify columns were added
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'settings' 
  AND column_name IN ('letterhead_top_space', 'letterhead_show_qr');

-- =====================================================
-- USAGE:
-- =====================================================
-- Users can now customize:
-- 1. letterhead_top_space: 80-150mm (adjust based on their letterhead)
-- 2. letterhead_show_qr: true/false (show/hide QR code)
-- =====================================================
