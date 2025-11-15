-- Add WhatsApp configuration columns to companies table
-- This allows each seller to configure their own WhatsApp Business number

ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS whatsapp_number VARCHAR(20),
ADD COLUMN IF NOT EXISTS whatsapp_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS whatsapp_message_template TEXT DEFAULT 'Hello {customer_name}, 

Your invoice {invoice_number} for Rs. {total_amount} is ready.

Invoice Date: {invoice_date}
Amount: Rs. {total_amount}

Thank you for your business!

{company_name}',
ADD COLUMN IF NOT EXISTS whatsapp_phone_number_id VARCHAR(100),
ADD COLUMN IF NOT EXISTS whatsapp_access_token TEXT,
ADD COLUMN IF NOT EXISTS whatsapp_business_account_id VARCHAR(100),
ADD COLUMN IF NOT EXISTS whatsapp_api_mode VARCHAR(20) DEFAULT 'link';

-- Add comments
COMMENT ON COLUMN companies.whatsapp_number IS 'WhatsApp Business number in international format (e.g., 923001234567)';
COMMENT ON COLUMN companies.whatsapp_enabled IS 'Whether WhatsApp integration is enabled for this company';
COMMENT ON COLUMN companies.whatsapp_message_template IS 'Custom message template for sending invoices via WhatsApp';
COMMENT ON COLUMN companies.whatsapp_phone_number_id IS 'WhatsApp Business API Phone Number ID from Meta';
COMMENT ON COLUMN companies.whatsapp_access_token IS 'WhatsApp Business API Access Token from Meta';
COMMENT ON COLUMN companies.whatsapp_business_account_id IS 'WhatsApp Business Account ID from Meta';
COMMENT ON COLUMN companies.whatsapp_api_mode IS 'Mode: link (wa.me) or api (Business API)';

-- Create table for tracking WhatsApp messages
CREATE TABLE IF NOT EXISTS whatsapp_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
  recipient_phone VARCHAR(20) NOT NULL,
  message_id VARCHAR(100),
  message_text TEXT,
  status VARCHAR(20) DEFAULT 'sent',
  sent_at TIMESTAMP DEFAULT NOW(),
  delivered_at TIMESTAMP,
  read_at TIMESTAMP,
  failed_at TIMESTAMP,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_company ON whatsapp_messages(company_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_invoice ON whatsapp_messages(invoice_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_status ON whatsapp_messages(status);

COMMENT ON TABLE whatsapp_messages IS 'Track WhatsApp messages sent to customers';

-- Verify the changes
SELECT 
  id,
  name,
  whatsapp_number,
  whatsapp_enabled,
  LEFT(whatsapp_message_template, 50) as template_preview
FROM companies
LIMIT 5;
