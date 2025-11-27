-- Migration: Create Commercial Invoices Tables
-- Description: Add support for commercial invoices with editable items
-- Date: 2024

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: commercial_invoices
-- Stores commercial invoice header information
CREATE TABLE IF NOT EXISTS commercial_invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Commercial invoice number (optional, can be auto-generated)
    commercial_invoice_number VARCHAR(100),
    
    -- Buyer information (copied from original, can be modified)
    buyer_name VARCHAR(255) NOT NULL,
    buyer_business_name VARCHAR(255),
    buyer_address TEXT,
    buyer_country VARCHAR(100),
    buyer_tax_id VARCHAR(100),
    
    -- Totals (calculated from items)
    subtotal DECIMAL(15, 2) NOT NULL DEFAULT 0,
    total_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
    
    -- Additional information
    notes TEXT,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure one commercial invoice per invoice
    CONSTRAINT unique_commercial_invoice_per_invoice UNIQUE(invoice_id)
);

-- Table: commercial_invoice_items
-- Stores line items for commercial invoices
CREATE TABLE IF NOT EXISTS commercial_invoice_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    commercial_invoice_id UUID NOT NULL REFERENCES commercial_invoices(id) ON DELETE CASCADE,
    
    -- Item details (fully editable for commercial invoice)
    description TEXT NOT NULL,
    hs_code VARCHAR(50) NOT NULL,
    uom VARCHAR(50) NOT NULL,
    quantity DECIMAL(15, 4) NOT NULL,
    unit_price DECIMAL(15, 2) NOT NULL,
    line_total DECIMAL(15, 2) NOT NULL,
    
    -- Link to original invoice item (optional, for reference)
    original_item_id UUID REFERENCES invoice_items(id) ON DELETE SET NULL,
    
    -- Order of items
    item_order INTEGER DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_commercial_invoices_invoice_id 
    ON commercial_invoices(invoice_id);

CREATE INDEX IF NOT EXISTS idx_commercial_invoices_company_id 
    ON commercial_invoices(company_id);

CREATE INDEX IF NOT EXISTS idx_commercial_invoice_items_commercial_invoice_id 
    ON commercial_invoice_items(commercial_invoice_id);

CREATE INDEX IF NOT EXISTS idx_commercial_invoice_items_original_item_id 
    ON commercial_invoice_items(original_item_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_commercial_invoice_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for commercial_invoices
CREATE TRIGGER trigger_update_commercial_invoice_updated_at
    BEFORE UPDATE ON commercial_invoices
    FOR EACH ROW
    EXECUTE FUNCTION update_commercial_invoice_updated_at();

-- Trigger for commercial_invoice_items
CREATE TRIGGER trigger_update_commercial_invoice_item_updated_at
    BEFORE UPDATE ON commercial_invoice_items
    FOR EACH ROW
    EXECUTE FUNCTION update_commercial_invoice_updated_at();

-- Comments for documentation
COMMENT ON TABLE commercial_invoices IS 'Stores commercial invoices for international trade';
COMMENT ON TABLE commercial_invoice_items IS 'Stores line items for commercial invoices';
COMMENT ON COLUMN commercial_invoices.invoice_id IS 'Reference to the original invoice';
COMMENT ON COLUMN commercial_invoice_items.original_item_id IS 'Optional reference to original invoice item';
