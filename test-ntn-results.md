# NTN Normalization Test Results

## Updated Function Behavior

The `normalizeNTN` function has been updated to handle the `066744-0` format correctly.

### Key Change:
- **Before**: Only accepted 7-8 characters before hyphen
- **After**: Also accepts 6 digits + hyphen + 1 digit (combines them to make 7 digits)

---

## Test Results

### ✅ Valid NTN Formats

#### 1. **6+1 Digit Format (NEW)**
```typescript
normalizeNTN('066744-0')
// Result: { normalized: '0667440', isValid: true }
// Explanation: 6 digits + 1 digit = 7 digits total
```

```typescript
normalizeNTN('123456-7')
// Result: { normalized: '1234567', isValid: true }
// Explanation: Combines 6+1 to make 7 digits
```

#### 2. **7+1 Digit Format (Ignore Check Digit)**
```typescript
normalizeNTN('1234567-8')
// Result: { normalized: '1234567', isValid: true }
// Explanation: Takes 7 digits before hyphen, ignores check digit
```

```typescript
normalizeNTN('9876543-2')
// Result: { normalized: '9876543', isValid: true }
```

#### 3. **7 Digits Without Hyphen**
```typescript
normalizeNTN('1234567')
// Result: { normalized: '1234567', isValid: true }
```

```typescript
normalizeNTN('0667440')
// Result: { normalized: '0667440', isValid: true }
```

#### 4. **8 Digits Without Hyphen**
```typescript
normalizeNTN('12345678')
// Result: { normalized: '12345678', isValid: true }
```

#### 5. **Alphanumeric NTNs**
```typescript
normalizeNTN('G980921-2')
// Result: { normalized: 'G980921', isValid: true }
// Explanation: 7 alphanumeric chars, ignores check digit
```

```typescript
normalizeNTN('G980921')
// Result: { normalized: 'G980921', isValid: true }
```

```typescript
normalizeNTN('ABC12345')
// Result: { normalized: 'ABC12345', isValid: true }
// Explanation: 8 alphanumeric characters
```

#### 6. **Auto-Uppercase**
```typescript
normalizeNTN('abc1234')
// Result: { normalized: 'ABC1234', isValid: true }
// Explanation: Automatically converts to uppercase
```

#### 7. **Auto-Clean Spaces**
```typescript
normalizeNTN('066 744-0')
// Result: { normalized: '0667440', isValid: true }
// Explanation: Removes spaces automatically
```

```typescript
normalizeNTN('  1234567  ')
// Result: { normalized: '1234567', isValid: true }
// Explanation: Trims leading/trailing spaces
```

---

### ❌ Invalid NTN Formats

#### 1. **Too Short (6 digits)**
```typescript
normalizeNTN('123456')
// Result: { 
//   normalized: '', 
//   isValid: false, 
//   error: 'NTN must be 7-8 characters (found 6)' 
// }
```

#### 2. **Invalid 5+1 Format**
```typescript
normalizeNTN('12345-6')
// Result: { 
//   normalized: '', 
//   isValid: false, 
//   error: 'NTN format invalid. Expected 6+1 or 7-8 characters before hyphen (found 5)' 
// }
```

#### 3. **Too Long (9 digits)**
```typescript
normalizeNTN('123456789')
// Result: { 
//   normalized: '', 
//   isValid: false, 
//   error: 'NTN must be 7-8 characters (found 9)' 
// }
```

#### 4. **Multiple Hyphens**
```typescript
normalizeNTN('123-456-7')
// Result: { 
//   normalized: '', 
//   isValid: false, 
//   error: 'Invalid NTN format - too many hyphens' 
// }
```

#### 5. **Empty String**
```typescript
normalizeNTN('')
// Result: { 
//   normalized: '', 
//   isValid: false, 
//   error: 'NTN is empty' 
// }
```

#### 6. **Only Special Characters**
```typescript
normalizeNTN('---')
// Result: { 
//   normalized: '', 
//   isValid: false, 
//   error: 'NTN is empty after cleaning' 
// }
```

---

## Validation Logic Flow

```
Input: "066744-0"
  ↓
Step 1: Check if empty → ✓ Not empty
  ↓
Step 2: Clean & uppercase → "066744-0" (already clean)
  ↓
Step 3: Check for hyphen → ✓ Has hyphen
  ↓
Step 4: Split by hyphen → ["066744", "0"]
  ↓
Step 5: Check format:
  - Before hyphen: 6 characters
  - After hyphen: 1 character
  - Matches 6+1 format → ✓ Valid
  ↓
Step 6: Combine → "0667440"
  ↓
Result: { normalized: "0667440", isValid: true }
```

---

## Summary of Accepted Formats

| Format | Example | Result | Notes |
|--------|---------|--------|-------|
| 6+1 digits | `066744-0` | `0667440` | **NEW** - Combines to 7 digits |
| 7+1 digits | `1234567-8` | `1234567` | Ignores check digit |
| 7 digits | `1234567` | `1234567` | Direct acceptance |
| 8 digits | `12345678` | `12345678` | Direct acceptance |
| 7 alphanumeric | `G980921` | `G980921` | Letters + numbers |
| 8 alphanumeric | `ABC12345` | `ABC12345` | Letters + numbers |
| With spaces | `066 744-0` | `0667440` | Auto-cleaned |
| Lowercase | `abc1234` | `ABC1234` | Auto-uppercase |

---

## Usage in Code

```typescript
import { normalizeNTN } from '@/lib/ntn-utils';

// Example 1: Validate and normalize
const result = normalizeNTN('066744-0');
if (result.isValid) {
  console.log('Normalized NTN:', result.normalized); // "0667440"
} else {
  console.error('Invalid NTN:', result.error);
}

// Example 2: Quick validation
import { isValidNTN } from '@/lib/ntn-utils';
if (isValidNTN('066744-0')) {
  console.log('Valid NTN!');
}

// Example 3: In API route
const sellerNTN = normalizeNTN(company.ntn_number || '');
if (!sellerNTN.isValid) {
  return NextResponse.json({ 
    error: `Invalid Seller NTN: ${sellerNTN.error}` 
  }, { status: 400 });
}

// Use normalized value in FBR payload
const payload = {
  sellerNTNCNIC: sellerNTN.normalized,
  // ...
};
```

---

## Conclusion

✅ The function now correctly handles `066744-0` format by combining the 6 digits before the hyphen with the 1 digit after to create a valid 7-digit NTN.

✅ All existing formats continue to work as expected.

✅ The function is backward compatible - no breaking changes.
