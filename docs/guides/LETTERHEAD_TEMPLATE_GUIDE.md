# 📄 Letterhead Invoice Template Guide

## Overview

The **Letterhead Template** is designed for businesses that use pre-printed letterhead paper. It leaves 120mm of space at the top for your company's letterhead and focuses on the invoice details below.

## Features

✅ **120mm space for pre-printed letterhead** - Company name, logo, address already on paper
✅ **Clean, professional layout** - Matches traditional invoice format
✅ **Detailed item breakdown** - Shows tax calculations per item
✅ **Compact design** - Fits on A4 paper with letterhead
✅ **Print-optimized** - Perfect alignment for pre-printed stationery

---

## How to Use

### 1. Access the Template

Navigate to any invoice and add `?template=letterhead` to the URL:

```
/seller/invoices/[invoice-id]/print?template=letterhead
```

### 2. From Invoice Detail Page

When viewing an invoice, click "Print" and select "Letterhead" template from the options.

### 3. Print Settings

**Important Print Settings:**
- Paper Size: **A4 (210mm x 297mm)**
- Orientation: **Portrait**
- Margins: **None** or **Minimal**
- Scale: **100%** (Do not shrink to fit)
- Background Graphics: **Enabled**

---

## Template Layout

### Top Section (120mm)
```
┌─────────────────────────────────────┐
│                                     │
│     PRE-PRINTED LETTERHEAD          │
│     (Your Company Info)             │
│                                     │
│     • Company Name                  │
│     • Logo                          │
│     • Address                       │
│     • Contact Details               │
│     • NTN/GST Numbers               │
│                                     │
└─────────────────────────────────────┘
```

### Invoice Section
```
┌─────────────────────────────────────┐
│      SALES TAX INVOICE              │
├─────────────────────────────────────┤
│ Invoice No: 35        Date: 20/08/25│
│ Buyer's Name: ABC Company           │
│ M/S: ABC Sugar Mills Limited        │
│ Address: House #109-A, Lahore       │
│ P.O NO: 138-07-2025                 │
│ ST Registration No: 04-09-1703-001  │
│ National Tax No: 0225972-9          │
├─────────────────────────────────────┤
│                                     │
│         ITEMS TABLE                 │
│  Qty | Description | Rate | Tax    │
│                                     │
├─────────────────────────────────────┤
│  TOTALS & SIGNATURE                 │
└─────────────────────────────────────┘
```

---

## Customization

### Adjust Letterhead Space

If your letterhead is smaller or larger than 120mm, edit the template:

**File:** `app/seller/invoices/[id]/print/page.tsx`

Find the LetterheadTemplate function and change:

```typescript
{/* Space for Pre-printed Letterhead - 120mm */}
<div className="h-[120mm] print:h-[120mm] ...">
```

Change `120mm` to your desired height (e.g., `100mm`, `140mm`).

### Common Letterhead Sizes

- **Small Letterhead:** 80-100mm
- **Standard Letterhead:** 120mm (default)
- **Large Letterhead:** 140-160mm

---

## Comparison with Other Templates

| Feature | Letterhead | Modern | Excel | Classic |
|---------|-----------|--------|-------|---------|
| Pre-printed Paper | ✅ Yes | ❌ No | ❌ No | ❌ No |
| Company Info | On paper | In template | In template | In template |
| Best For | Traditional | Digital | B&W Print | Formal |
| Space Efficient | ✅ Yes | ❌ No | ✅ Yes | ❌ No |

---

## Example Use Cases

### 1. Established Business
You have professionally printed letterhead with your company branding.

**Solution:** Use Letterhead template to avoid printing company info twice.

### 2. Government Contracts
Official invoices require pre-approved letterhead.

**Solution:** Print invoices on official letterhead using this template.

### 3. Cost Savings
Reduce ink usage by not printing company logo/info every time.

**Solution:** Print letterhead in bulk, use this template for invoices.

---

## Printing Tips

### For Best Results:

1. **Test Print First**
   - Print one invoice on plain paper
   - Check alignment with your letterhead
   - Adjust spacing if needed

2. **Use Quality Paper**
   - 80-100 GSM paper recommended
   - White or off-white color
   - Pre-printed letterhead should be professional quality

3. **Printer Settings**
   - Use "Actual Size" not "Fit to Page"
   - Disable "Shrink to Fit"
   - Enable "Print Background Colors"

4. **Alignment Check**
   - Hold printed invoice over letterhead
   - Ensure no overlap
   - Adjust margins if needed

---

## Troubleshooting

### Issue: Content overlaps letterhead

**Solution:** Increase letterhead space height
```typescript
<div className="h-[140mm] print:h-[140mm] ...">
```

### Issue: Too much white space

**Solution:** Decrease letterhead space height
```typescript
<div className="h-[100mm] print:h-[100mm] ...">
```

### Issue: Table doesn't fit

**Solution:** Reduce font size in template
```typescript
<div className="... text-[10px]"> // Change to text-[9px]
```

### Issue: Signature line too high/low

**Solution:** Adjust padding in summary section
```typescript
<div className="... mt-8"> // Change mt-8 to mt-4 or mt-12
```

---

## Technical Details

### Dimensions
- **Total Page:** 210mm x 297mm (A4)
- **Letterhead Space:** 120mm (configurable)
- **Invoice Content:** ~177mm
- **Font Size:** 10-11px (optimized for readability)

### Print CSS
The template uses special print-only CSS:
- Removes shadows and borders
- Hides navigation elements
- Optimizes for A4 paper
- Ensures single-page printing

---

## Quick Reference

### URL Parameters

```
?template=letterhead          # Use letterhead template
?template=modern             # Use modern template
?template=excel              # Use Excel-style template
?template=classic            # Use classic template
```

### Keyboard Shortcuts

- **Ctrl/Cmd + P:** Quick print
- **Ctrl/Cmd + N:** New invoice
- **Escape:** Close print preview

---

## Support

For issues or customization re