# Server-Side Pagination Implementation

## Overview
Implemented production-level server-side pagination with debounced search for both Customers and Invoices pages.

## Changes Made

### 1. Customers API (`app/api/seller/customers/route.ts`)
- Added pagination parameters: `page`, `limit`, `search`, `status`
- Implemented server-side filtering with SQL `ilike` for case-insensitive search
- Returns paginated data with metadata:
  - `customers`: Array of customer records for current page
  - `pagination`: { page, limit, total, totalPages }
  - `stats`: { total, active, inactive }

### 2. Customers Page (`app/seller/customers/page.tsx`)
- Removed client-side pagination hook (`usePagination`)
- Added state management for server-side pagination
- Implemented 500ms debounced search (production-level)
- Search triggers on: name, business_name, ntn_cnic, gst_number
- Resets to page 1 on search/filter changes
- Fetches data on: page change, items per page change, search, or filter change

### 3. Invoices API (`app/api/seller/invoices/route.ts`)
- Added pagination parameters: `page`, `limit`, `search`, `status`
- Implemented server-side filtering for invoice_number and buyer_name
- Returns paginated data with metadata:
  - `invoices`: Array of invoice records for current page
  - `pagination`: { page, limit, total, totalPages }
  - `stats`: { total, draft, posted, verified, totalAmount, pendingAmount }

### 4. Invoices Page (`app/seller/invoices/page.tsx`)
- Removed client-side pagination hook (`usePagination`)
- Added state management for server-side pagination
- Implemented 500ms debounced search (production-level)
- Search triggers on: invoice_number, buyer_name
- Resets to page 1 on search/filter changes
- Fetches data on: page change, items per page change, search, or filter change

## Key Features

### Production-Level Search Debouncing
```typescript
useEffect(() => {
  const timer = setTimeout(() => {
    setCurrentPage(1); // Reset to first page on search
  }, 500);
  return () => clearTimeout(timer);
}, [searchTerm]);
```

### Efficient Data Fetching
- Only fetches records for current page
- Reduces network payload
- Improves performance for large datasets
- Stats calculated separately for accurate totals

### User Experience
- Smooth search experience with 500ms debounce
- Automatic page reset on filter/search changes
- Maintains filter state across page changes
- Loading states for better feedback

## API Query Examples

### Customers
```
GET /api/seller/customers?company_id=123&page=1&limit=10&search=john&status=active
```

### Invoices
```
GET /api/seller/invoices?company_id=123&page=2&limit=25&search=INV&status=draft
```

## Performance Benefits
- Reduced initial load time
- Lower memory usage on client
- Scalable for thousands of records
- Optimized database queries with proper indexing support
