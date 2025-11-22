# 🔧 Fix for Duplicate API Calls

## Problem
React 18 Strict Mode intentionally double-mounts components in development, causing duplicate API calls.

## Solutions (Choose One)

### Solution 1: Disable Strict Mode (Quick Fix - Development Only)

**File: `app/layout.tsx`**

Remove or comment out `<React.StrictMode>`:

```typescript
// Before:
<React.StrictMode>
  {children}
</React.StrictMode>

// After:
{children}
```

### Solution 2: Use React Query (Recommended - Already Implemented)

React Query automatically handles deduplication. Just ensure you're using it:

```typescript
// ✅ CORRECT - Uses React Query (no duplicates)
import { useInvoices } from '@/hooks/useInvoices';

const { data, isLoading } = useInvoices(companyId, { page: 1 });
```

### Solution 3: Use useEffectOnce Hook

**For manual fetch calls:**

```typescript
import { useEffectOnce } from '@/hooks/useEffectOnce';

// ❌ WRONG - Runs twice in Strict Mode
useEffect(() => {
  loadData();
}, []);

// ✅ CORRECT - Runs only once
useEffectOnce(() => {
  loadData();
});
```

### Solution 4: Use Request Deduplication

**For direct fetch calls:**

```typescript
import { deduplicatedFetch } from '@/lib/requestDeduplication';

// ❌ WRONG - Can duplicate
const data = await fetch('/api/invoices');

// ✅ CORRECT - Deduplicated
const data = await deduplicatedFetch('/api/invoices');
```

## Quick Fix for All Pages

Update `next.config.js`:

```javascript
// Add to next.config.js
const nextConfig = {
  // ... existing config
  
  // Disable Strict Mode in development
  reactStrictMode: false, // Add this line
}
```

## Implementation Steps

1. **Immediate Fix (5 minutes):**
   - Add `reactStrictMode: false` to `next.config.js`
   - Restart dev server: `npm run dev`

2. **Long-term Fix (Use React Query):**
   - Already implemented in Week 2
   - Replace all manual `useEffect` + `fetch` with React Query hooks
   - See `hooks/useInvoices.ts`, `hooks/useCustomers.ts`, etc.

3. **For Custom Hooks:**
   - Use `useEffectOnce` instead of `useEffect`
   - Use `deduplicatedFetch` instead of `fetch`

## Testing

After applying fix:
1. Open DevTools → Network tab
2. Navigate to any page
3. Verify only 1 API call per endpoint
4. Check console for "🔄 Returning cached request" messages
