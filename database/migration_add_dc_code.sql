-- ============================================
-- Migration: Add DC Code to Invoices Table
-- ============================================
-- Description: Adds an optional dc_code (Delivery Challan Code) field to the invoices table
-- Date: 2025-11-24
-- ============================================

-- Add dc_code column to invoices table
ALTER TABLE invoices 
ADD COLUMN dc_code VARCHAR(100);

-- Add index for better query performance (optional, but recommended if you'll search by DC code)
CREATE INDEX idx_invoices_dc_code ON invoices(dc_code) WHERE dc_code IS NOT NULL;

-- Add comment to document the column
COMMENT ON COLUMN invoices.dc_code IS 'Delivery Challan Code - Optional reference number for delivery challans';
