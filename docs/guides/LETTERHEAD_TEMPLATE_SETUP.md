# 📄 Letterhead Template - Setup Guide

## What's New

The Letterhead template is now fully customizable with:
1. **Adjustable top space** for pre-printed letterhead (60-180mm)
2. **QR code section** for FBR invoice verification
3. **Settings page configuration** for easy customization

---

## Setup Steps

### 1. Run Database Migration

Execute in Supabase SQL Editor:

```sql
-- File: database/ADD_LETTERHEAD_SETTINGS.sql
ALTER TABLE public.settings 
ADD COLUMN IF NOT EXISTS letterhead_top_space INTEGER DEFAULT 120;

ALTER TABLE public.settings 
ADD COLUMN IF NOT EXISTS letterhead_show_qr BOOLEAN DEFAULT true;
```

### 2. Add Template to Database

Execute in Supabase SQL Editor:

```sql
-- File: database/ADD_LETTERHEAD_TEMPLATE.sql
INSERT INTO public.invoice_templates (
  id,
  name,
  description,
  template_key,
  is_active
) VALUES (
  gen_random_uuid(),
  'Letterhead',
  'For pre-printed letterhead paper with customizable top space',
  'letterhead',
  true
);
```

---

## How to Use

### For Users:

1. **Go to Settings → Templates tab**
2. **Scroll down to "Letterhead Template Settings"**
3. **Configure:**
   - **Top Space**: Adjust 60-180mm based on your letterhead design
   - **Show QR Code**: Enable/disable QR code display
4. **Click "Save Letterhead Settings"**

### To Print with Letterhead Template:

```
/seller/invoices/[id]/print?template=letterhead
```

---

## Features

### ✅ Customizable Top Space
- Default: 120mm
- Range: 60-180mm
- Adjust based on your pre-printed letterhead design

### ✅ QR Code Section
- Shows QR code for FBR posted invoices
- Includes FBR invoice number
- Can be toggled on/off in settings

### ✅ Professional Layout
- Matches the sample invoice format
- Clean table structure
- Buyer/Seller information sections
- Tax breakdown
- Signature line

---

## Settings Location

**Path:** Settings → Templates → Letterhead Template Settings

**Fields:**
- `letterhead_top_space` (integer, 60-180mm)
- `letterhead_show_qr` (boolean)

---

## Template Features

1. **Pre-printed Header Space**
   - Dashed border in preview (hidden when printed)
   - Shows space measurement
   - Fully customizable height

2. **Invoice Details**
   - Invoice number, date, PO number
   - Buyer information
   - Seller information (from letterhead)

3. **Items Table**
   - Quantity, Description, Rate, Unit
   - Amount excluding tax
   - Sales tax calculation
   - Further tax (if applicable)
   - Total with tax

4. **Summary Section**
   - Exclusive value
   - Sales tax
   - Further tax
   - Inclusive value (total)

5. **QR Code** (Optional)
   - Verification QR code
   - FBR invoice number
   - Only for FBR posted invoices

6. **Signature Line**
   - Professional signature area
   - Authorized signature label

---

## Testing

1. Navigate to invoice print page with letterhead template
2. Adjust top space in settings (try 100mm, 120mm, 140mm)
3. Toggle QR code on/off
4. Print preview to verify layout
5. Print on actual letterhead paper

---

## Troubleshooting

**Issue:** Top space too small/large
**Solution:** Adjust in Settings → Templates → Letterhead Top Space

**Issue:** QR code not showing
**Solution:** 
- Check if invoice is FBR posted
- Enable "Show QR Code" in settings
- Verify invoice has FBR invoice number

**Issue:** Template not available
**Solution:** Run database migration scripts

---

## Status

✅ Template created
✅ Settings page added
✅ QR code integrated
✅ Customizable top space
✅ Database migration ready

Ready to use!
