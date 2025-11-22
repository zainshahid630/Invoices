# Template Setting Fix - Bulk Print

## Issue
The bulk print detailed page was not picking up the saved template setting from Settings, while the single invoice print page was working correctly.

## Root Cause
**Inconsistent field name usage:**
- Database field: `invoice_template`
- Single invoice page: Uses `invoice_template` ✅
- Bulk print page: Was using `default_template` ❌

## Fix Applied
Changed line 92 in `app/seller/invoices/bulk-print/detailed/page.tsx`:

```typescript
// Before (incorrect)
setTemplate(settingsData.settings?.default_template || 'modern');

// After (correct)
setTemplate(settingsData.settings?.invoice_template || 'modern');
```

## Verification
Both pages now correctly read from the same database field:
- ✅ Single invoice print: `/seller/invoices/[id]/print`
- ✅ Bulk print detailed: `/seller/invoices/bulk-print/detailed`

The template saved in Settings will now be applied consistently across all print pages.
