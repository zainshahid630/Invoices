-- Create indexes for performance
CREATE INDEX idx_invoice_templates_active ON invoice_templates(is_active);
CREATE INDEX idx_invoice_templates_paid ON invoice_templates(is_paid);
CREATE INDEX idx_company_template_access_company ON company_template_access(company_id);
CREATE INDEX idx_company_template_access_template ON company_template_access(template_id);

