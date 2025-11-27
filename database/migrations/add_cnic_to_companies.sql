-- Migration: Add CNIC number field to companies table
-- Date: 2024-11-24
-- Description: Adds cnic_number column to store company owner's CNIC

-- Add CNIC column to companies table
ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS cnic_number VARCHAR(20);

-- Add comment for documentation
COMMENT ON COLUMN companies.cnic_number IS 'CNIC (Computerized National Identity Card) number of the company owner - format: XXXXX-XXXXXXX-X';
