-- Insert Modern Template (Free)
INSERT INTO invoice_templates (name, description, template_key, is_paid, price, display_order, features)
VALUES (
  'Modern Template',
  'Clean, contemporary design with blue gradient header. Perfect for tech companies and startups.',
  'modern',
  false,
  0.00,
  1,
  '["Blue gradient header", "Modern typography", "Clean minimal design", "FBR logo & QR code", "Professional layout"]'
);

-- Insert Classic Template (Free)
INSERT INTO invoice_templates (name, description, template_key, is_paid, price, display_order, features)
VALUES (
  'Classic Template',
  'Traditional, formal design with bold borders. Ideal for traditional businesses and law firms.',
  'classic',
  false,
  0.00,
  2,
  '["Bold borders", "Serif typography", "Formal structured layout", "FBR logo & QR code", "Alternating row colors"]'
);

-- Insert Minimal Template (Paid - PKR 499)
INSERT INTO invoice_templates (name, description, template_key, is_paid, price, display_order, features)
VALUES (
  'Minimal Template',
  'Ultra-clean minimalist design with maximum white space. For premium brands.',
  'minimal',
  true,
  499.00,
  3,
  '["Minimalist design", "Maximum white space", "Premium typography", "FBR logo & QR code", "Elegant layout"]'
);

-- Insert Corporate Template (Paid - PKR 799)
INSERT INTO invoice_templates (name, description, template_key, is_paid, price, display_order, features)
VALUES (
  'Corporate Template',
  'Professional corporate design with company branding. Perfect for large enterprises.',
  'corporate',
  true,
  799.00,
  4,
  '["Corporate branding", "Custom color schemes", "Logo integration", "FBR logo & QR code", "Multi-page support"]'
);

-- Insert Creative Template (Paid - PKR 599)
INSERT INTO invoice_templates (name, description, template_key, is_paid, price, display_order, features)
VALUES (
  'Creative Template',
  'Bold, creative design with vibrant colors. Ideal for creative agencies and designers.',
  'creative',
  true,
  599.00,
  5,
  '["Vibrant colors", "Creative layout", "Modern design", "FBR logo & QR code", "Unique styling"]'
);

