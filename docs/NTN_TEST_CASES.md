# NTN Normalization Test Cases

## Test Suite

### ✅ Valid Cases

| Test # | Input | Expected Output | Description |
|--------|-------|-----------------|-------------|
| 1 | `066744-0` | `0667440` | 6 digits + 1 digit (your example) |
| 2 | `1234567-8` | `1234567` | 7 digits + check digit |
| 3 | `1234567` | `1234567` | Already 7 digits |
| 4 | `0000000` | `0000000` | All zeros (valid) |
| 5 | `9999999` | `9999999` | All nines (valid) |
| 6 | `123456-7` | `1234567` | 6 digits + 1 digit |
| 7 | `7654321-0` | `7654321` | 7 digits + check digit |

### ❌ Invalid Cases

| Test # | Input | Expected Error | Description |
|--------|-------|----------------|-------------|
| 8 | `12345-6` | Must have 6 or 7 digits before hyphen | Only 5 digits before hyphen |
| 9 | `123456` | Must have exactly 7 digits | Only 6 digits total |
| 10 | `12345678` | Must have exactly 7 digits | 8 digits total |
| 11 | `066744-` | Must have 1 digit after hyphen | Missing digit after hyphen |
| 12 | `066744-00` | Must have 1 digit after hyphen | 2 digits after hyphen (6+2=8) |
| 13 | `123-456-7` | Invalid NTN format | Multiple hyphens |
| 14 | `` | NTN is empty | Empty string |
| 15 | `ABC1234` | Must have exactly 7 digits | Contains letters |

## Manual Testing Steps

### Test 1: Valid 6-Digit Format (Your Example)
1. Create/edit invoice with buyer NTN: `066744-0`
2. Click "Validate with FBR" or "Post to FBR"
3. **Expected:** Success, NTN normalized to `0667440`

### Test 2: Valid 7-Digit with Check Digit
1. Create/edit invoice with buyer NTN: `1234567-8`
2. Click "Validate with FBR" or "Post to FBR"
3. **Expected:** Success, NTN normalized to `1234567`

### Test 3: Already 7 Digits
1. Create/edit invoice with buyer NTN: `1234567`
2. Click "Validate with FBR" or "Post to FBR"
3. **Expected:** Success, NTN used as-is `1234567`

### Test 4: Invalid - Only 6 Digits
1. Create/edit invoice with buyer NTN: `123456`
2. Click "Validate with FBR" or "Post to FBR"
3. **Expected:** Error message: "Invalid Buyer NTN: NTN must have exactly 7 digits. Found: 6 digits"

### Test 5: Invalid - 5 Digits Before Hyphen
1. Create/edit invoice with buyer NTN: `12345-67`
2. Click "Validate with FBR" or "Post to FBR"
3. **Expected:** Error message: "Invalid Buyer NTN: NTN must have 6 or 7 digits before hyphen. Found: 5 digits"

## Quick Test Script

You can test the normalization logic with these examples:

```javascript
// Test function (for reference)
function normalizeNTN(ntn) {
  if (!ntn) return { normalized: '', isValid: false, error: 'NTN is empty' };
  
  const digitsOnly = ntn.replace(/\D/g, '');
  
  if (ntn.includes('-')) {
    const parts = ntn.split('-');
    if (parts.length > 2) {
      return { normalized: '', isValid: false, error: 'Invalid NTN format' };
    }
    
    const beforeHyphen = parts[0].replace(/\D/g, '');
    const afterHyphen = parts[1] ? parts[1].replace(/\D/g, '') : '';
    
    if (beforeHyphen.length === 6) {
      const normalized = beforeHyphen + afterHyphen;
      if (normalized.length === 7) {
        return { normalized, isValid: true };
      }
      return { normalized: '', isValid: false, error: 'Must have 1 digit after hyphen' };
    }
    
    if (beforeHyphen.length === 7) {
      return { normalized: beforeHyphen, isValid: true };
    }
    
    return { normalized: '', isValid: false, error: 'Must have 6 or 7 digits before hyphen' };
  }
  
  if (digitsOnly.length === 7) {
    return { normalized: digitsOnly, isValid: true };
  }
  
  return { normalized: '', isValid: false, error: 'Must have exactly 7 digits' };
}

// Run tests
console.log('Test 1:', normalizeNTN('066744-0'));  // Should be valid: 0667440
console.log('Test 2:', normalizeNTN('1234567-8')); // Should be valid: 1234567
console.log('Test 3:', normalizeNTN('1234567'));   // Should be valid: 1234567
console.log('Test 4:', normalizeNTN('123456'));    // Should be invalid
console.log('Test 5:', normalizeNTN('12345-67'));  // Should be invalid
```

## Expected Results

```
Test 1: { normalized: '0667440', isValid: true }
Test 2: { normalized: '1234567', isValid: true }
Test 3: { normalized: '1234567', isValid: true }
Test 4: { normalized: '', isValid: false, error: 'NTN must have exactly 7 digits. Found: 6 digits' }
Test 5: { normalized: '', isValid: false, error: 'NTN must have 6 or 7 digits before hyphen. Found: 5 digits' }
```

## Integration Test

### Full Invoice Flow Test

1. **Setup:**
   - Company NTN: `1234567-8` (will normalize to `1234567`)
   - Create invoice with buyer NTN: `066744-0` (will normalize to `0667440`)

2. **Validate:**
   - Click "Validate with FBR"
   - Check FBR payload in response
   - Verify `sellerNTNCNIC: "1234567"`
   - Verify `buyerNTNCNIC: "0667440"`

3. **Post:**
   - Click "Post to FBR"
   - Check FBR payload in response
   - Verify same normalized NTNs
   - Verify invoice posted successfully

## Edge Cases

### Edge Case 1: Leading Zeros
- Input: `0001234-5`
- Expected: `00012345` (7 digits, keeps leading zeros)

### Edge Case 2: All Zeros
- Input: `0000000`
- Expected: `0000000` (valid, though unusual)

### Edge Case 3: Spaces
- Input: `123 4567`
- Expected: `1234567` (spaces removed)

### Edge Case 4: Special Characters
- Input: `123-4567-8`
- Expected: Error (multiple hyphens)

## Regression Tests

After any changes to NTN logic, verify:

1. ✅ Old format `XXXXXX-X` still works
2. ✅ New format `XXXXXXX-X` still works
3. ✅ Plain format `XXXXXXX` still works
4. ✅ Invalid formats show clear errors
5. ✅ FBR API receives correct 7-digit format

## Performance Test

- Test with 100 invoices
- Each with different NTN format
- Verify all normalize correctly
- Check processing time < 1 second per invoice
