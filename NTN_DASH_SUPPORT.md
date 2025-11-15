# NTN Dash Support - Implementation Summary

## ✅ What Was Done

Updated the system to **allow dashes in NTN numbers** while ensuring they're **removed when sending to FBR**.

---

## 🎯 Changes Made

### 1. **FBR API Routes** - Strip Dashes Before Sending

**Files Updated:**
- `app/api/seller/invoices/[id]/validate-fbr/route.ts`
- `app/api/seller/invoices/[id]/post-fbr/route.ts`

**What Changed:**
```typescript
// Before sending to FBR, remove dashes
const cleanSellerNTN = (company.ntn_number || '').replace(/-/g, '');
const cleanBuyerNTN = (invoice.buyer_ntn_cnic || '').replace(/-/g, '');

// Use cleaned NTN in FBR payload
sellerNTNCNIC: cleanSellerNTN,
buyerNTNCNIC: cleanBuyerNTN,
```

### 2. **Settings Page** - Allow Dashes in Input

**File:** `app/seller/settings/page.tsx`

**Validation Updated:**
```typescript
// Count digits excluding dashes
const ntnWithoutDashes = companyForm.ntn_number.replace(/-/g, '');

// Validate length without dashes
if (ntnWithoutDashes.length !== 7 && ntnWithoutDashes.length !== 13) {
  alert('NTN must be either 7 digits (NTN) or 13 digits (CNIC)...');
}
```

**Display Updated:**
```typescript
// Show digit count without dashes
Current: {companyForm.ntn_number.replace(/-/g, '').length} digits
```

### 3. **Invoice Forms** - Updated Labels

**File:** `app/seller/invoices/new/page.tsx`

**Label Updated:**
```tsx
NTN/CNIC <span className="text-gray-500 text-xs">(Dashes allowed)</span>
```

---

## 📋 How It Works

### User Input (Allows Dashes):
```
✅ 1234567        (7 digits - valid NTN)
✅ 123-4567       (7 digits with dash - valid)
✅ 12-345-67      (7 digits with dashes - valid)
✅ 1234567890123  (13 digits - valid CNIC)
✅ 12345-6789012-3 (13 digits with dashes - valid)
❌ 12345          (5 digits - invalid)
❌ 123-45         (5 digits with dash - invalid)
```

### FBR Submission (Dashes Removed):
```
User enters:  123-4567
System sends: 1234567  (to FBR)

User enters:  12345-6789012-3
System sends: 1234567890123  (to FBR)
```

---

## 🎨 User Experience

### Settings Page:

**Input Field:**
```
NTN Number (Required for FBR - 7 digits)
[123-4567]
Enter 7-digit NTN or 13-digit CNIC (dashes allowed). 
Current: 7 digits ✓
```

**With Invalid Length:**
```
NTN Number (Required for FBR - 7 digits)
[123-45]
Enter 7-digit NTN or 13-digit CNIC (dashes allowed). 
Current: 5 digits ⚠️ Invalid length
```

### Invoice Form:

**Input Field:**
```
NTN/CNIC (Dashes allowed)
[12345-6789012-3]
```

---

## 🔧 Technical Details

### Validation Logic:
1. **User Input:** Accept any format with dashes
2. **Display:** Show digit count excluding dashes
3. **Validation:** Check length excluding dashes (7 or 13)
4. **Storage:** Store as entered (with dashes)
5. **FBR Submission:** Remove dashes before sending

### Regex Used:
```typescript
.replace(/-/g, '')  // Removes all dashes
```

---

## ✅ Benefits

1. **User-Friendly:** Users can format NTN as they prefer
2. **Flexible Input:** Accepts various dash formats
3. **FBR Compatible:** Automatically cleans before submission
4. **No Data Loss:** Original format preserved in database
5. **Clear Feedback:** Shows actual digit count

---

## 📊 Examples

### Company NTN (Settings):
```
Input:     123-4567
Stored:    123-4567
Sent to FBR: 1234567
```

### Buyer NTN (Invoice):
```
Input:     12345-6789012-3
Stored:    12345-6789012-3
Sent to FBR: 1234567890123
```

---

## 🎯 Validation Rules

### Valid Formats:
- **7 digits** (NTN): `1234567`, `123-4567`, `12-345-67`
- **13 digits** (CNIC): `1234567890123`, `12345-6789012-3`

### Invalid Formats:
- Less than 7 digits: `12345`
- Between 7 and 13 digits: `12345678`
- More than 13 digits: `12345678901234`

---

## 🚀 Testing

### Test Cases:

1. **Enter NTN with dashes in Settings**
   - Input: `123-4567`
   - Expected: Accepted, shows "7 digits"

2. **Save and validate**
   - Expected: No error, saves successfully

3. **Create invoice and post to FBR**
   - Expected: Dashes removed, FBR accepts

4. **Enter invalid length**
   - Input: `123-45`
   - Expected: Shows "5 digits ⚠️ Invalid length"

5. **Try to save invalid**
   - Expected: Alert shows error message

---

## 📝 Summary

✅ **Dashes allowed** in NTN input fields
✅ **Validation excludes** dashes when counting
✅ **FBR submission** automatically removes dashes
✅ **User-friendly** formatting options
✅ **No breaking changes** to existing data

**Users can now format NTN numbers with dashes for better readability!** 🎉
