-- Add Email SMTP configuration columns to companies table
-- This allows each seller to configure their own SMTP server for sending invoices

ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS email_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS smtp_host VARCHAR(255),
ADD COLUMN IF NOT EXISTS smtp_port INTEGER DEFAULT 587,
ADD COLUMN IF NOT EXISTS smtp_secure VARCHAR(10) DEFAULT 'tls',
ADD COLUMN IF NOT EXISTS smtp_user VARCHAR(255),
ADD COLUMN IF NOT EXISTS smtp_password TEXT,
ADD COLUMN IF NOT EXISTS smtp_from_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS smtp_from_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS email_subject_template VARCHAR(500) DEFAULT 'Invoice {invoice_number} from {company_name}',
ADD COLUMN IF NOT EXISTS email_body_template TEXT DEFAULT 'Dear {customer_name},

Please find attached your invoice {invoice_number} dated {invoice_date}.

Invoice Details:
- Invoice Number: {invoice_number}
- Amount: Rs. {total_amount}
- Status: {payment_status}

Thank you for your business!

Best regards,
{company_name}';

-- Add comments
COMMENT ON COLUMN companies.email_enabled IS 'Whether email integration is enabled for this company';
COMMENT ON COLUMN companies.smtp_host IS 'SMTP server hostname (e.g., smtp.gmail.com)';
COMMENT ON COLUMN companies.smtp_port IS 'SMTP server port (587 for TLS, 465 for SSL, 25 for non-secure)';
COMMENT ON COLUMN companies.smtp_secure IS 'Security type: tls, ssl, or none';
COMMENT ON COLUMN companies.smtp_user IS 'SMTP username (usually email address)';
COMMENT ON COLUMN companies.smtp_password IS 'SMTP password or app-specific password';
COMMENT ON COLUMN companies.smtp_from_email IS 'From email address for outgoing emails';
COMMENT ON COLUMN companies.smtp_from_name IS 'From name for outgoing emails';
COMMENT ON COLUMN companies.email_subject_template IS 'Email subject template with placeholders';
COMMENT ON COLUMN companies.email_body_template IS 'Email body template with placeholders';

-- Create table for tracking sent emails
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
  recipient_email VARCHAR(255) NOT NULL,
  subject VARCHAR(500),
  status VARCHAR(20) DEFAULT 'sent',
  sent_at TIMESTAMP DEFAULT NOW(),
  delivered_at TIMESTAMP,
  opened_at TIMESTAMP,
  failed_at TIMESTAMP,
  error_message TEXT,
  message_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_logs_company ON email_logs(company_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_invoice ON email_logs(invoice_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_sent_at ON email_logs(sent_at);

COMMENT ON TABLE email_logs IS 'Track emails sent to customers';

-- Verify the changes
SELECT 
  id,
  name,
  email_enabled,
  smtp_host,
  smtp_from_email,
  LEFT(email_subject_template, 50) as subject_preview
FROM companies
LIMIT 5;
