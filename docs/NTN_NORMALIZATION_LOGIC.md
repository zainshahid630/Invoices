# NTN Normalization Logic for FBR

## Overview
The system automatically normalizes NTN (National Tax Number) to ensure it's in the correct 7-digit format required by FBR API.

## Normalization Rules

### Rule 1: 6 Digits Before Hyphen
**Format:** `XXXXXX-X` (6 digits + hyphen + 1 digit)

**Example:** `066744-0`

**Action:** Remove hyphen to combine into 7 digits

**Result:** `0667440` ✅

```javascript
Input:  "066744-0"
Output: "0667440"
Status: Valid ✅
```

### Rule 2: 7 Digits Before Hyphen
**Format:** `XXXXXXX-X` (7 digits + hyphen + any digits)

**Example:** `1234567-8`

**Action:** Remove hyphen and everything after it, keep only first 7 digits

**Result:** `1234567` ✅

```javascript
Input:  "1234567-8"
Output: "1234567"
Status: Valid ✅
```

### Rule 3: 7 Digits Without Hyphen
**Format:** `XXXXXXX` (exactly 7 digits)

**Example:** `1234567`

**Action:** Use as-is

**Result:** `1234567` ✅

```javascript
Input:  "1234567"
Output: "1234567"
Status: Valid ✅
```

## Validation Examples

### ✅ Valid NTN Formats

| Input Format | Normalized Output | Description |
|--------------|-------------------|-------------|
| `066744-0` | `0667440` | 6 digits + 1 digit |
| `1234567-8` | `1234567` | 7 digits + check digit |
| `1234567` | `1234567` | Already 7 digits |
| `123-4567-8` | Error | Multiple hyphens |
| `12345-67` | Error | 5 digits before hyphen |

### ❌ Invalid NTN Formats

| Input Format | Error Message | Reason |
|--------------|---------------|--------|
| `12345-6` | NTN with 6 digits before hyphen must have 1 digit after | Only 5 digits before hyphen |
| `12345-67` | NTN with 6 digits before hyphen must have 1 digit after | Only 5 digits before hyphen |
| `123456` | NTN must have exactly 7 digits | Only 6 digits total |
| `12345678` | NTN must have exactly 7 digits | 8 digits total |
| `123-456-7` | Invalid NTN format | Multiple hyphens |
| `` (empty) | NTN is empty | No value provided |

## Code Logic Flow

```javascript
function normalizeNTN(ntn: string) {
  // Step 1: Check if empty
  if (!ntn) return { error: 'NTN is empty' };
  
  // Step 2: Extract all digits
  const digitsOnly = ntn.replace(/\D/g, '');
  
  // Step 3: Check if has hyphen
  if (ntn.includes('-')) {
    const [before, after] = ntn.split('-');
    const beforeDigits = before.replace(/\D/g, '');
    const afterDigits = after.replace(/\D/g, '');
    
    // Case A: 6 digits before hyphen
    if (beforeDigits.length === 6) {
      const combined = beforeDigits + afterDigits;
      if (combined.length === 7) {
        return { normalized: combined, isValid: true };
      }
      return { error: 'Must have 1 digit after hyphen' };
    }
    
    // Case B: 7 digits before hyphen
    if (beforeDigits.length === 7) {
      return { normalized: beforeDigits, isValid: true };
    }
    
    // Case C: Invalid digit count
    return { error: 'Must have 6 or 7 digits before hyphen' };
  }
  
  // Step 4: No hyphen - must be exactly 7 digits
  if (digitsOnly.length === 7) {
    return { normalized: digitsOnly, isValid: true };
  }
  
  return { error: 'Must have exactly 7 digits' };
}
```

## Test Cases

### Test Case 1: 6-Digit Format
```javascript
// Input: "066744-0"
const result = normalizeNTN("066744-0");
// Expected: { normalized: "0667440", isValid: true }
```

### Test Case 2: 7-Digit with Check Digit
```javascript
// Input: "1234567-8"
const result = normalizeNTN("1234567-8");
// Expected: { normalized: "1234567", isValid: true }
```

### Test Case 3: Already 7 Digits
```javascript
// Input: "1234567"
const result = normalizeNTN("1234567");
// Expected: { normalized: "1234567", isValid: true }
```

### Test Case 4: Invalid - 5 Digits Before Hyphen
```javascript
// Input: "12345-67"
const result = normalizeNTN("12345-67");
// Expected: { normalized: "", isValid: false, error: "..." }
```

### Test Case 5: Invalid - Only 6 Digits
```javascript
// Input: "123456"
const result = normalizeNTN("123456");
// Expected: { normalized: "", isValid: false, error: "..." }
```

## Where It's Applied

### 1. FBR Post Invoice
**File:** `app/api/seller/invoices/[id]/post-fbr/route.ts`

**Applied To:**
- Seller NTN (from company settings)
- Buyer NTN (from invoice)

**Behavior:**
- If invalid, returns error before calling FBR API
- If valid, uses normalized 7-digit format in FBR payload

### 2. FBR Validate Invoice
**File:** `app/api/seller/invoices/[id]/validate-fbr/route.ts`

**Applied To:**
- Seller NTN (from company settings)
- Buyer NTN (from invoice)

**Behavior:**
- If invalid, returns error before calling FBR API
- If valid, uses normalized 7-digit format in FBR payload

## Error Handling

### Seller NTN Invalid
```json
{
  "error": "Invalid Seller NTN: NTN must have exactly 7 digits. Found: 6 digits. Please update in Settings."
}
```

**Action Required:** Update company NTN in Settings

### Buyer NTN Invalid
```json
{
  "error": "Invalid Buyer NTN: NTN with 6 digits before hyphen must have 1 digit after. Found: 066744-. Please update the invoice."
}
```

**Action Required:** Update buyer NTN in invoice

## Benefits

### 1. Automatic Correction
- No need to manually format NTN
- System handles different formats automatically

### 2. FBR Compliance
- Ensures NTN is always in correct 7-digit format
- Prevents FBR API errors due to format issues

### 3. Flexible Input
- Accepts various formats (with/without hyphen)
- Handles check digits automatically

### 4. Clear Error Messages
- Tells exactly what's wrong
- Guides user on how to fix

## Common Scenarios

### Scenario 1: Old System NTN Format
**Old System:** Stores NTN as `066744-0`

**New System:** Automatically converts to `0667440` for FBR

**Result:** ✅ Works seamlessly

### Scenario 2: Manual Entry with Check Digit
**User Enters:** `1234567-8`

**System Normalizes:** `1234567`

**Result:** ✅ Check digit removed automatically

### Scenario 3: Already Correct Format
**User Enters:** `1234567`

**System Normalizes:** `1234567`

**Result:** ✅ No change needed

### Scenario 4: Incorrect Format
**User Enters:** `12345-6` (only 5 digits before hyphen)

**System Response:** ❌ Error with clear message

**Result:** User corrects to proper format

## Migration Notes

### From Old System
If your old system stored NTN in format `XXXXXX-X`:
1. ✅ No changes needed
2. ✅ System will automatically normalize
3. ✅ Both formats work

### Data Import
When importing customers:
1. ✅ Keep NTN in original format
2. ✅ System normalizes when posting to FBR
3. ✅ No pre-processing required

## Best Practices

### 1. Store Original Format
- Store NTN as entered by user
- Don't pre-normalize in database
- Let system normalize when needed

### 2. Display Original Format
- Show NTN with hyphen to users
- More readable and familiar
- Example: `066744-0` instead of `0667440`

### 3. Validate on Entry
- Check format when user enters NTN
- Provide immediate feedback
- Prevent invalid formats

### 4. Test Before FBR
- Use "Validate with FBR" button
- Check if NTN is accepted
- Fix any issues before posting

## Troubleshooting

### Issue: "NTN must have exactly 7 digits"
**Cause:** NTN has less or more than 7 digits

**Solution:** 
- Check if NTN is complete
- Remove extra digits
- Add missing digits

### Issue: "NTN with 6 digits before hyphen must have 1 digit after"
**Cause:** Format is `XXXXXX-` or `XXXXXX-XX`

**Solution:**
- Ensure format is `XXXXXX-X` (6 + 1 digit)
- Or remove hyphen for 7-digit format

### Issue: "Invalid NTN format"
**Cause:** Multiple hyphens or special characters

**Solution:**
- Use only one hyphen
- Remove special characters
- Keep only digits and one hyphen

## Summary

The NTN normalization ensures:
- ✅ All NTNs are 7 digits for FBR
- ✅ Handles multiple input formats
- ✅ Clear error messages
- ✅ Automatic conversion
- ✅ FBR compliance

**Key Rule:** Final NTN sent to FBR is always exactly 7 digits, no hyphens, no check digits.
