# Quick Migration Guide: Add Caching to Pages

## Pages to Migrate (Priority Order)

### High Priority (Do First):
1. ✅ `app/seller/dashboard/page.tsx` - DONE
2. ✅ `app/seller/products/page.tsx` - DONE
3. ⏳ `app/seller/invoices/page.tsx` - TODO
4. ⏳ `app/seller/customers/page.tsx` - TODO
5. ⏳ `app/seller/reports/page.tsx` - TODO

### Medium Priority:
6. ⏳ `app/seller/subscription/page.tsx`
7. ⏳ `app/seller/fbr-sandbox/page.tsx`
8. ⏳ `app/seller/invoices/deleted/page.tsx`

### Low Priority (Components):
9. ⏳ `app/seller/components/BulkPrintModal.tsx`
10. ⏳ `app/seller/components/LedgerModal.tsx`
11. ⏳ `app/seller/components/EnhancedFBRModal.tsx`

---

## Quick Copy-Paste Template

### 1. Add Imports
```typescript
import { useRef } from 'react'; // Add to existing import
import { cachedFetch, invalidateCache } from '@/lib/api-cache';
```

### 2. Add useRef
```typescript
const hasLoadedRef = useRef(false);
```

### 3. Update useEffect
```typescript
useEffect(() => {
  // Add this line at the top
  if (hasLoadedRef.current) return;
  hasLoadedRef.current = true;

  // Rest of your code...
}, [dependencies]);
```

### 4. Replace fetch calls
```typescript
// Find this pattern:
const response = await fetch('/api/...');
const data = await response.json();

// Replace with:
const data = await cachedFetch('/api/...', undefined, {
  ttl: 5 * 60 * 1000, // Adjust TTL as needed
});
```

### 5. Add cache invalidation after mutations
```typescript
// After POST/PUT/DELETE
await fetch('/api/...', { method: 'POST', ... });
invalidateCache('/api/...'); // Add this line
```

---

## Example: Invoices Page

### Before:
```typescript
'use client';
import { useEffect, useState } from 'react';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    const response = await fetch('/api/seller/invoices?company_id=123');
    const data = await response.json();
    setInvoices(data);
  };

  const handleDelete = async (id) => {
    await fetch(`/api/seller/invoices/${id}`, { method: 'DELETE' });
    loadInvoices();
  };
}
```

### After:
```typescript
'use client';
import { useEffect, useState, useRef } from 'react';
import { cachedFetch, invalidateCache } from '@/lib/api-cache';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    const data = await cachedFetch('/api/seller/invoices?company_id=123', undefined, {
      ttl: 2 * 60 * 1000, // 2 minutes
    });
    setInvoices(data);
  };

  const handleDelete = async (id) => {
    await fetch(`/api/seller/invoices/${id}`, { method: 'DELETE' });
    invalidateCache('/api/seller/invoices'); // Clear cache
    loadInvoices();
  };
}
```

---

## TTL Recommendations

```typescript
// Fast-changing data (2 minutes)
ttl: 2 * 60 * 1000

// Medium-changing data (5 minutes)
ttl: 5 * 60 * 1000

// Slow-changing data (10 minutes)
ttl: 10 * 60 * 1000

// Very slow-changing data (30 minutes)
ttl: 30 * 60 * 1000
```

---

## Testing Checklist

After migrating each page:

- [ ] Page loads without errors
- [ ] No duplicate API calls in Network tab
- [ ] Cache logs appear in console
- [ ] Data updates after mutations
- [ ] No stale data issues
- [ ] Performance improved

---

## Automated Find & Replace

Use your IDE's find & replace:

### Find:
```
const response = await fetch\(([^)]+)\);
\s+const data = await response\.json\(\);
```

### Replace:
```
const data = await cachedFetch($1, undefined, { ttl: 5 * 60 * 1000 });
```

**Note:** Review each replacement manually!

---

## Common Patterns

### Pattern 1: Simple GET
```typescript
// Before
const res = await fetch('/api/data');
const data = await res.json();

// After
const data = await cachedFetch('/api/data');
```

### Pattern 2: GET with error handling
```typescript
// Before
try {
  const res = await fetch('/api/data');
  if (res.ok) {
    const data = await res.json();
    setData(data);
  }
} catch (error) {
  console.error(error);
}

// After
try {
  const data = await cachedFetch('/api/data', undefined, {
    ttl: 5 * 60 * 1000,
  });
  setData(data);
} catch (error) {
  console.error(error);
}
```

### Pattern 3: Multiple parallel requests
```typescript
// Before
const res1 = await fetch('/api/data1');
const res2 = await fetch('/api/data2');
const data1 = await res1.json();
const data2 = await res2.json();

// After
const [data1, data2] = await Promise.all([
  cachedFetch('/api/data1'),
  cachedFetch('/api/data2'),
]);
```

---

## Quick Commands

```bash
# Find all fetch calls
grep -r "await fetch" app/seller/

# Find all useEffect
grep -r "useEffect" app/seller/

# Count API calls per file
grep -c "await fetch" app/seller/**/*.tsx
```

---

## Time Estimates

- Simple page (1 fetch): 5 minutes
- Medium page (2-3 fetches): 10 minutes
- Complex page (5+ fetches): 20 minutes
- Component with modal: 15 minutes

**Total for all pages: 2-3 hours**

---

## Need Help?

See `DUPLICATE_API_CALLS_SOLUTION.md` for detailed guide!
