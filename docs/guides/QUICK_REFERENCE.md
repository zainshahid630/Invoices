# 🚀 Quick Reference - InvoiceFBR Optimizations

## 🔥 Immediate Actions (5 minutes)

### 1. Stop Duplicate API Calls
```bash
# Restart your dev server
npm run dev
```
✅ `reactStrictMode: false` is already set in `next.config.js`

### 2. Verify Fix
- Open DevTools → Network tab
- Navigate to any page
- Should see only 1 API call per endpoint (not 2)

---

## 📚 Common Patterns

### Fetching Data (Use React Query)
```typescript
import { useInvoices } from '@/hooks/useInvoices';

const { data, isLoading, error } = useInvoices(companyId, { page: 1 });
```

### Debounced Search
```typescript
import { useDebounce } from '@/hooks/useDebounce';

const [search, setSearch] = useState('');
const debouncedSearch = useDebounce(search, 500);
```

### Cached Settings
```typescript
import { useSettings } from '@/contexts/SettingsContext';

const { settings, company } = useSettings();
```

### Error Handling
```typescript
import { apiCall } from '@/lib/errorHandling';

const data = await apiCall('/api/invoices', {}, { retries: 3 });
```

### Prevent Duplicates
```typescript
import { useEffectOnce } from '@/hooks/useEffectOnce';

useEffectOnce(() => {
  loadData(); // Runs only once
});
```

---

## 🎯 Performance Checklist

- [ ] Using React Query hooks (not manual fetch)
- [ ] Search inputs are debounced
- [ ] Settings loaded from context (not API)
- [ ] Database indexes created
- [ ] No duplicate API calls
- [ ] Bundle size < 250KB

---

## 📊 Expected Results

| Metric | Target |
|--------|--------|
| Page Load | < 2s |
| API Calls | 3-5 per page |
| Search Delay | 500ms |
| Database Query | < 150ms |
| Duplicate Calls | 0 |

---

## 🐛 Quick Fixes

**Duplicate calls?**
→ Restart: `npm run dev`

**Slow queries?**
→ Run: `database/indexes/performance_indexes.sql`

**Cache not