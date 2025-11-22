# NTN Normalize Function Usage

## Summary
The `normalizeNTN` function is used in **4 main locations** to ensure NTN numbers are properly formatted before sending to FBR API.

## Function Definition Locations

The function is **duplicated** in 4 files (should be refactored to a shared utility):

1. `app/api/seller/invoices/[id]/fbr-payload/route.ts`
2. `app/api/seller/invoices/[id]/validate-fbr/route.ts`
3. `app/api/seller/invoices/[id]/post-fbr/route.ts`
4. `app/seller/fbr-sandbox/page.tsx`

## Usage Locations

### 1. FBR Payload Generation
**File:** `app/api/seller/invoices/[id]/fbr-payload/route.ts`

```typescript
// Normalize NTN numbers
const sellerNTN = normalizeNTN(company.ntn_number || '');
const buyerNTN = normalizeNTN(invoice.buyer_ntn_cnic || '');
```

**Purpose:** Generates the FBR payload preview for an invoice

---

### 2. FBR Validation
**File:** `app/api/seller/invoices/[id]/validate-fbr/route.ts`

```typescript
// Normalize and validate NTN numbers
const sellerNTN = normalizeNTN(company.ntn_number || '');
if (!sellerNTN.isValid) {
  return NextResponse.json({ 
    error: `Invalid Seller NTN: ${sellerNTN.error}` 
  }, { status: 400 });
}

const buyerNTN = normalizeNTN(invoice.buyer_ntn_cnic || '');
if (!buyerNTN.isValid) {
  return NextResponse.json({ 
    error: `Invalid Buyer NTN: ${buyerNTN.error}` 
  }, { status: 400 });
}
```

**Purpose:** Validates invoice data before posting to FBR (dry-run)

---

### 3. FBR Posting
**File:** `app/api/seller/invoices/[id]/post-fbr/route.ts`

```typescript
// Normalize and validate NTN numbers
const sellerNTN = normalizeNTN(company.ntn_number || '');
if (!sellerNTN.isValid) {
  return NextResponse.json({ 
    error: `Invalid Seller NTN: ${sellerNTN.error}` 
  }, { status: 400 });
}

const buyerNTN = normalizeNTN(invoice.buyer_ntn_cnic || '');
if (!buyerNTN.isValid) {
  return NextResponse.json({ 
    error: `Invalid Buyer NTN: ${buyerNTN.error}` 
  }, { status: 400 });
}
```

**Purpose:** Posts invoice to FBR production API

---

### 4. FBR Sandbox Testing
**File:** `app/seller/fbr-sandbox/page.tsx`

**Usage 1 - Load Company Data:**
```typescript
// Update payload with company details
const ntnResult = normalizeNTN(data.company.ntn_number);
if (ntnResult.isValid) {
  normalizedNTN = ntnResult.normalized;
} else {
  console.warn('Invalid company NTN:', ntnResult.error);
  normalizedNTN = data.company.ntn_number;
}
```

**Usage 2 - Validate Payload:**
```typescript
const sellerNTN = normalizeNTN(payload.sellerNTNCNIC);
if (!sellerNTN.isValid) {
  setError(`Invalid Seller NTN: ${sellerNTN.error}`);
  return;
}
```

**Usage 3 - Post to FBR:**
```typescript
const sellerNTN = normalizeNTN(payload.sellerNTNCNIC);
if (!sellerNTN.isValid) {
  setError(`Invalid Seller NTN: ${sellerNTN.error}`);
  return;
}
```

**Usage 4 - Test Scenarios:**
```typescript
const sellerNTN = normalizeNTN(testPayload.sellerNTNCNIC);
if (!sellerNTN.isValid) {
  setError(`Invalid Seller NTN: ${sellerNTN.error}`);
  return;
}
```

**Purpose:** Testing FBR API integration with various scenarios

---

## Function Behavior

### Input Formats Accepted:
- `"066744-0"` → `"0667440"` ✅
- `"1234567-8"` → `"1234567"` ✅
- `"1234567"` → `"1234567"` ✅

### Invalid Formats:
- `"123456"` → Error: "NTN must have exactly 7 digits" ❌
- `"12345-67"` → Error: "NTN must have 6 or 7 digits before hyphen" ❌
- Empty string → Error: "NTN is empty" ❌

### Return Type:
```typescript
{
  normalized: string;  // The 7-digit NTN
  isValid: boolean;    // Whether normalization succeeded
  error?: string;      // Error message if invalid
}
```

---

## ✅ Refactored to Shared Utility

**Status:** COMPLETED

**Implementation:** Created a shared utility file at `lib/ntn-utils.ts`

```typescript
// lib/ntn-utils.ts
export interface NTNResult {
  normalized: string;
  isValid: boolean;
  error?: string;
}

export function normalizeNTN(ntn: string): NTNResult {
  // ... implementation
}
```

**All files now import from the shared utility:**
```typescript
import { normalizeNTN } from '@/lib/ntn-utils';
```

**Files Updated:**
- ✅ `app/api/seller/invoices/[id]/fbr-payload/route.ts`
- ✅ `app/api/seller/invoices/[id]/validate-fbr/route.ts`
- ✅ `app/api/seller/invoices/[id]/post-fbr/route.ts`
- ✅ `app/seller/fbr-sandbox/page.tsx`

**Benefits Achieved:**
- ✅ Single source of truth
- ✅ Easier to maintain and update
- ✅ Consistent behavior across all endpoints
- ✅ Better testability
- ✅ TypeScript interface for type safety

---

## Testing

See `docs/NTN_TEST_CASES.md` for comprehensive test cases and expected results.

---

## Related Files
- `docs/NTN_NORMALIZATION_LOGIC.md` - Detailed normalization logic
- `docs/NTN_TEST_CASES.md` - Test cases and validation
