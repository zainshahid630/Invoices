# Invoice Template Extraction Plan

## Goal
Extract all invoice templates from `app/seller/invoices/[id]/print/page.tsx` into separate reusable component files to ensure consistency across all print pages.

## Current Status
✅ Created shared types file: `components/invoice-templates/types.ts`
✅ Created Modern template: `components/invoice-templates/ModernTemplate.tsx`
⏳ Need to extract: Excel, Classic, and Letterhead templates

## Templates to Extract

### 1. Modern Template ✅
- **File**: `components/invoice-templates/ModernTemplate.tsx`
- **Status**: Created
- **Features**: Blue gradient header, modern layout, QR codes

### 2. Excel Template ⏳
- **Target File**: `components/invoice-templates/ExcelTemplate.tsx`
- **Features**: Spreadsheet style, B&W optimized, compact layout
- **Source**: Lines ~500-700 in print/page.tsx

### 3. Classic Template ⏳
- **Target File**: `components/invoice-templates/ClassicTemplate.tsx`
- **Features**: Traditional bordered design, serif fonts
- **Source**: Lines ~700-900 in print/page.tsx

### 4. Letterhead Template ✅ (in bulk print)
- **Target File**: `components/invoice-templates/LetterheadTemplate.tsx`
- **Features**: Pre-printed letterhead space, detailed tax breakdown
- **Source**: Lines ~950-1181 in print/page.tsx
- **Status**: Already extracted in bulk print page

## Implementation Steps

### Step 1: Extract Excel Template
```typescript
// components/invoice-templates/ExcelTemplate.tsx
import { InvoiceTemplateProps } from './types';

export function ExcelTemplate({ invoice, company, qrCodeUrl }: InvoiceTemplateProps) {
  // Copy implementation from print/page.tsx
}
```

### Step 2: Extract Classic Template
```typescript
// components/invoice-templates/ClassicTemplate.tsx
import { InvoiceTemplateProps } from './types';

export function ClassicTemplate({ invoice, company, qrCodeUrl }: InvoiceTemplateProps) {
  // Copy implementation from print/page.tsx
}
```

### Step 3: Extract Letterhead Template
```typescript
// components/invoice-templates/LetterheadTemplate.tsx
import { LetterheadTemplateProps } from './types';

export function LetterheadTemplate({ 
  invoice, 
  company, 
  qrCodeUrl,
  topSpace = 120,
  showQr = true 
}: LetterheadTemplateProps) {
  // Copy implementation from print/page.tsx
}
```

### Step 4: Update Index File
```typescript
// components/invoice-templates/index.ts
export { ModernTemplate } from './ModernTemplate';
export { ExcelTemplate } from './ExcelTemplate';
export { ClassicTemplate } from './ClassicTemplate';
export { LetterheadTemplate } from './LetterheadTemplate';
export * from './types';
```

### Step 5: Update Print Pages
Replace local template functions with imports:

```typescript
// app/seller/invoices/[id]/print/page.tsx
import { 
  ModernTemplate, 
  ExcelTemplate, 
  ClassicTemplate, 
  LetterheadTemplate 
} from '@/components/invoice-templates';

// Remove all local template function definitions
// Use imported components directly
```

```typescript
// app/seller/invoices/bulk-print/detailed/page.tsx
import { 
  ModernTemplate, 
  ExcelTemplate, 
  ClassicTemplate, 
  LetterheadTemplate 
} from '@/components/invoice-templates';

// Remove all local template function definitions
// Use imported components directly
```

## Benefits

1. **Single Source of Truth**: One template definition used everywhere
2. **Easy Maintenance**: Update template once, changes reflect everywhere
3. **Consistency**: Same look across single and bulk printing
4. **Reusability**: Can use templates in other features (email, PDF export, etc.)
5. **Testing**: Easier to test individual templates
6. **Code Organization**: Cleaner, more modular codebase

## Current Workaround

For now, the Letterhead template is duplicated in the bulk print page. The Modern template has been extracted but not yet integrated due to conflicts with existing code.

## Next Steps

1. Complete extraction of all 4 templates
2. Update both print pages to use shared templates
3. Remove all duplicate template code
4. Test all templates in both single and bulk print
5. Verify settings (letterhead space, QR visibility) work correctly

## Files to Modify

- ✅ `components/invoice-templates/types.ts` - Created
- ✅ `components/invoice-templates/ModernTemplate.tsx` - Created
- ⏳ `components/invoice-templates/ExcelTemplate.tsx` - To create
- ⏳ `components/invoice-templates/ClassicTemplate.tsx` - To create
- ⏳ `components/invoice-templates/LetterheadTemplate.tsx` - To create
- ⏳ `components/invoice-templates/index.ts` - Update exports
- ⏳ `app/seller/invoices/[id]/print/page.tsx` - Remove local templates, use imports
- ⏳ `app/seller/invoices/bulk-print/detailed/page.tsx` - Remove local templates, use imports
