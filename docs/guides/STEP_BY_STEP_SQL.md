# Step-by-Step SQL Execution

Run these queries **ONE AT A TIME** in Supabase SQL Editor.

---

## STEP 1: Create invoice_templates table

```sql
CREATE TABLE invoice_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  template_key VARCHAR(100) UNIQUE NOT NULL,
  preview_image_url TEXT,
  is_paid BOOLEAN DEFAULT false,
  price DECIMAL(10, 2) DEFAULT 0.00,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  features JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Expected Result:** `CREATE TABLE`

---

## STEP 2: Create company_template_access table

```sql
CREATE TABLE company_template_access (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  template_id UUID REFERENCES invoice_templates(id) ON DELETE CASCADE,
  granted_by UUID REFERENCES super_admins(id),
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  UNIQUE(company_id, template_id)
);
```

**Expected Result:** `CREATE TABLE`

---

## STEP 3: Insert Modern Template (Free)

```sql
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
```

**Expected Result:** `INSERT 0 1`

---

## STEP 4: Insert Classic Template (Free)

```sql
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
```

**Expected Result:** `INSERT 0 1`

---

## STEP 5: Insert Minimal Template (Paid - PKR 499)

```sql
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
```

**Expected Result:** `INSERT 0 1`

---

## STEP 6: Insert Corporate Template (Paid - PKR 799)

```sql
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
```

**Expected Result:** `INSERT 0 1`

---

## STEP 7: Insert Creative Template (Paid - PKR 599)

```sql
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
```

**Expected Result:** `INSERT 0 1`

---

## STEP 8: Create Indexes

```sql
CREATE INDEX idx_invoice_templates_active ON invoice_templates(is_active);
CREATE INDEX idx_invoice_templates_paid ON invoice_templates(is_paid);
CREATE INDEX idx_company_template_access_company ON company_template_access(company_id);
CREATE INDEX idx_company_template_access_template ON company_template_access(template_id);
```

**Expected Result:** `CREATE INDEX` (4 times)

---

## STEP 9: Verify Everything Works

```sql
SELECT * FROM invoice_templates ORDER BY display_order;
```

**Expected Result:** 5 rows showing all templates

---

## STEP 10: Count Templates

```sql
SELECT 
  COUNT(*) as total_templates,
  SUM(CASE WHEN is_paid = false THEN 1 ELSE 0 END) as free_templates,
  SUM(CASE WHEN is_paid = true THEN 1 ELSE 0 END) as paid_templates
FROM invoice_templates;
```

**Expected Result:**
- total_templates: 5
- free_templates: 2
- paid_templates: 3

---

## ✅ Done!

Now refresh your app and go to **Settings → Templates** to see all templates!

