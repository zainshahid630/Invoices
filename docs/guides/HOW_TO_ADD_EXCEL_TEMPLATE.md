# How to Add Excel Template to Your System

## Quick Setup Guide

### Step 1: Add Template to Database

You need to run the SQL migration to add the Excel template to your database.

#### Option A: Using Supabase Dashboard (Recommended)
1. Go to your Supabase project dashboard
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"
4. Copy and paste the contents of `database/ADD_EXCEL_TEMPLATE.sql`
5. Click "Run" to execute the query
6. You should see a success message

#### Option B: Using Supabase CLI
```bash
# If you have Supabase CLI installed
supabase db execute --file database/ADD_EXCEL_TEMPLATE.sql
```

#### Option C: Manual SQL
Run this SQL in your database:

```sql
INSERT INTO invoice_templates (
  name,
  description,
  template_key,
  is_paid,
  price,
  display_order,
  features
) VALUES (
  'Excel Template',
  'Simple spreadsheet-style design optimized for black and white printing. Clean grid layout perfect for professional documentation.',
  'excel',
  false,
  0.00,
  6,
  '["Excel-style grid layout", "B&W print optimized", "Clean table design", "FBR logo & QR code", "Professional spreadsheet format", "Easy to read"]'::jsonb
)
ON CONFLICT (template_key) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  is_paid = EXCLUDED.is_paid,
  price = EXCLUDED.price,
  display_order = EXCLUDED.display_order,
  features = EXCLUDED.features,
  updated_at = NOW();
```

### Step 2: Verify Template is Added

Run this query to verify:

```sql
SELECT 
  id,
  name,
  template_key,
  is_paid,
  price,
  display_order,
  is_active
FROM invoice_templates
WHERE template_key = 'excel';
```

You should see one row with the Excel template details.

### Step 3: Access the Template

1. **Login to your seller account**
2. **Go to Settings** (click your profile icon → Settings)
3. **Click on "Templates" tab**
4. **Find "Excel Template"** in the grid
5. **Click "Use This Template"** to activate it

### Step 4: Test the Template

1. Go to any invoice
2. Click "View/Print Invoice"
3. The invoice will now use the Excel template
4. Click "Print Invoice" to see how it looks in print preview

## What You'll See

### In Settings → Templates Tab:
- A new card showing "Excel Template"
- Description: "Simple spreadsheet-style design optimized for black and white printing..."
- Features list including "B&W print optimized", "Excel-style grid layout", etc.
- A mini preview showing the grid layout
- "Use This Template" button (since it's free)

### When Printing:
- Clean spreadsheet-style layout
- Black and white optimized design
- Grid borders throughout
- Professional table format
- Grayscale logos and images

## Troubleshooting

### Template Not Showing Up?
1. Check if the SQL ran successfully
2. Verify `is_active = true` in the database
3. Refresh your browser (Ctrl+F5 or Cmd+Shift+R)
4. Check browser console for errors

### Template Shows But Can't Select?
1. Make sure `has_access = true` (it should be automatic for free templates)
2. Check if there are any JavaScript errors in the console
3. Try logging out and back in

### Print Doesn't Look Right?
1. Make sure you're using the latest version of the print page
2. Check that the template_key is 'excel' in the URL
3. Try a different browser
4. Check print settings (should be A4, portrait)

## Template Features

✅ **Free Template** - No payment required
✅ **B&W Optimized** - Perfect for black and white printing
✅ **Grid Layout** - Excel-style table structure
✅ **Professional** - Clean and organized
✅ **Cost-Effective** - Saves on color ink
✅ **Print-Friendly** - Optimized for A4 paper

## Support

If you encounter any issues:
1. Check the browser console for errors
2. Verify the database entry exists
3. Make sure all files are updated
4. Clear browser cache and try again

---

**That's it!** Your Excel template is now ready to use. 🎉
