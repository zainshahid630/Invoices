# Fix: Default UOM Not Showing in Invoice Items

## Problem

When creating a new invoice, the first item's Unit of Measurement (UOM) field is not showing the default value from company settings.

## Root Cause

The `default_uom` column doesn't exist in the `settings` table yet. It needs to be added via database migration.

## Solution

Run this SQL migration in Supabase SQL Editor:

```sql
-- Add default_uom field to settings table
ALTER TABLE settings 
ADD COLUMN IF NOT EXISTS default_uom VARCHAR(50) DEFAULT 'Numbers, pieces, units';

-- Add comment
COMMENT ON COLUMN settings.default_uom IS 'Default Unit of Measurement for first item in new invoices';

-- Update existing settings to have default value
UPDATE settings 
SET default_uom = 'Numbers, pieces, units' 
WHERE default_uom IS NULL OR default_uom = '';

-- Create index for faster filtering
CREATE INDEX IF NOT EXISTS idx_settings_default_uom ON settings(default_uom);
```

## Verification

After running the migration, verify it worked:

```sql
-- Check if column exists
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'settings' 
AND column_name = 'default_uom';

-- Check current values
SELECT company_id, default_uom
FROM settings;
```

Expected output:
```
column_name  | data_type        | column_default
-------------|------------------|--------------------------------
default_uom  | character varying| 'Numbers, pieces, units'::character varying
```

## How It Works

### 1. Settings Table

The `default_uom` column stores the default Unit of Measurement for each company:

```sql
CREATE TABLE settings (
  ...
  default_uom VARCHAR(50) DEFAULT 'Numbers, pieces, units',
  ...
);
```

### 2. API Returns Default

The init-data API reads this value and returns it:

```typescript
// app/api/seller/invoices/init-data/route.ts
return NextResponse.json({
  ...
  defaultUom: settings.default_uom || 'Numbers, pieces, units',
  ...
});
```

### 3. Frontend Uses Default

The invoice creation page sets the first item's UOM:

```typescript
// app/seller/invoices/new/page.tsx
if (data.defaultHsCode || data.defaultUom) {
  setItems(prev => prev.map((item, idx) => 
    idx === 0 ? { 
      ...item, 
      hs_code: data.defaultHsCode || item.hs_code,
      uom: data.defaultUom || item.uom  // ✅ Sets default UOM
    } : item
  ));
}
```

## Testing

### Test 1: Check Default Value

1. Create a new invoice
2. First item should have UOM = "Numbers, pieces, units"
3. ✅ If it shows, migration worked!

### Test 2: Change Default

```sql
-- Change default UOM for a company
UPDATE settings 
SET default_uom = 'Kilograms' 
WHERE company_id = 'your-company-id';
```

Then create a new invoice - first item should have UOM = "Kilograms"

### Test 3: Add New Item

1. Create first item with any UOM
2. Click "Add Item"
3. Second item should copy UOM from first item (auto-fill feature)

## Customizing Default UOM

Users can change their default UOM in Settings page:

```typescript
// In Settings page
<select
  value={settings.default_uom}
  onChange={(e) => updateSettings({ default_uom: e.target.value })}
>
  <option value="Numbers, pieces, units">Numbers, pieces, units</option>
  <option value="Kilograms">Kilograms</option>
  <option value="Meters">Meters</option>
  <option value="Liters">Liters</option>
  <option value="Dozens">Dozens</option>
  <option value="Boxes">Boxes</option>
  <option value="Cartons">Cartons</option>
  <option value="Pairs">Pairs</option>
  <option value="Sets">Sets</option>
</select>
```

## Summary

✅ **Migration**: Adds `default_uom` column to settings table
✅ **Default Value**: "Numbers, pieces, units"
✅ **Customizable**: Each company can set their own default
✅ **Auto-Fill**: New items copy UOM from previous item

Run the migration SQL above to fix the issue!
