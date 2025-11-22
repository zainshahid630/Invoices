# NTN/CNIC Strict Validation - FBR Requirements

## FBR Requirements

FBR (Federal Board of Revenue) accepts **ONLY**:
1. **Exactly 7 characters** for NTN (numeric or alphanumeric)
2. **Exactly 13 digits** for CNIC

---

## Updated Validation Rules

### ✅ Valid Formats

#### 1. **7-Character NTN (Numeric)**
```typescript
normalizeNTN('1234567')
// Result: { normalized: '1234567', isValid: true }

normalizeNTN('0667440')
// Result: { normalized: '0667440', isValid: true }
```

#### 2. **7-Character NTN (Alphanumeric)**
```typescript
normalizeNTN('G980921')
// Result: { normalized: 'G980921', isValid: true }

normalizeNTN('ABC1234')
// Result: { normalized: 'ABC1234', isValid: true }
```

#### 3. **6+1 Format (Combines to 7)**
```typescript
normalizeNTN('066744-0')
// Result: { normalized: '0667440', isValid: true }
// Explanation: 6 chars + 1 char = 7 total

normalizeNTN('123456-7')
// Result: { normalized: '1234567', isValid: true }
```

#### 4. **7+1 Format (Ignore Check Digit)**
```typescript
normalizeNTN('1234567-8')
// Result: { normalized: '1234567', isValid: true }
// Explanation: Takes 7 chars, ignores check digit

normalizeNTN('G980921-2')
// Result: { normalized: 'G980921', isValid: true }
```

#### 5. **13-Digit CNIC**
```typescript
normalizeNTN('1234567890123')
// Result: { normalized: '1234567890123', isValid: true }

normalizeNTN('12345-1234567-1')
// Result: { normalized: '1234567890123', isValid: true }
// Explanation: Removes hyphens, validates 13 digits
```

---

### ❌ Invalid Formats (Now Rejected)

#### 1. **8-Character NTN (Too Long)**
```typescript
normalizeNTN('G1212111')
// Result: { 
//   normalized: '', 
//   isValid: false, 
//   error: 'Invalid length. FBR accepts only 7 characters for NTN or 13 digits for CNIC (found 8)' 
// }
```

#### 2. **8+1 Format (Too Long)**
```typescript
normalizeNTN('G1212111-3')
// Result: { 
//   normalized: '', 
//   isValid: false, 
//   error: 'Invalid format. FBR accepts only 7 characters for NTN or 13 digits for CNIC (found 8 before hyphen)' 
// }
```

#### 3. **6 Digits Only (Too Short)**
```typescript
normalizeNTN('123456')
// Result: { 
//   normalized: '', 
//   isValid: false, 
//   error: 'Invalid length. FBR accepts only 7 characters for NTN or 13 digits for CNIC (found 6)' 
// }
```

#### 4. **12 or 14 Digits (Invalid CNIC)**
```typescript
normalizeNTN('123456789012')  // 12 digits
// Result: { normalized: '', isValid: false, error: '...' }

normalizeNTN('12345678901234')  // 14 digits
// Result: { normalized: '', isValid: false, error: '...' }
```

---

## Test Results

### Before vs After Update

| Input | Before Update | After Update | Reason |
|-------|---------------|--------------|--------|
| `1234567` | ✅ Valid → `1234567` | ✅ Valid → `1234567` | Exactly 7 chars |
| `G980921` | ✅ Valid → `G980921` | ✅ Valid → `G980921` | Exactly 7 chars |
| `066744-0` | ✅ Valid → `0667440` | ✅ Valid → `0667440` | 6+1 = 7 chars |
| `1234567-8` | ✅ Valid → `1234567` | ✅ Valid → `1234567` | 7 chars (ignore check) |
| `G121211-1` | ✅ Valid → `G121211` | ✅ Valid → `G121211` | Exactly 7 chars |
| **`G1212111`** | ✅ Valid → `G1212111` | ❌ **INVALID** | 8 chars (too long) |
| **`G1212111-3`** | ✅ Valid → `G1212111` | ❌ **INVALID** | 8 chars (too long) |
| **`ABC12345`** | ✅ Valid → `ABC12345` | ❌ **INVALID** | 8 chars (too long) |
| `1234567890123` | ❌ Invalid | ✅ **Valid** → `1234567890123` | 13-digit CNIC |
| `12345-1234567-1` | ❌ Invalid | ✅ **Valid** → `1234567890123` | 13-digit CNIC |

---

## Specific Examples

### Example 1: G121211-1 ✅
```
Input:  "G121211-1"
Split:  ["G121211", "1"]
Length: 7 characters before hyphen
Result: { normalized: "G121211", isValid: true }
Status: ✅ VALID (exactly 7 chars)
```

### Example 2: G1212111-3 ❌
```
Input:  "G1212111-3"
Split:  ["G1212111", "3"]
Length: 8 characters before hyphen
Result: { normalized: "", isValid: false, error: "..." }
Status: ❌ INVALID (8 chars, FBR requires exactly 7)
```

### Example 3: 1234567890123 ✅
```
Input:  "1234567890123"
Length: 13 digits
Type:   CNIC
Result: { normalized: "1234567890123", isValid: true }
Status: ✅ VALID (exactly 13 digits)
```

### Example 4: 12345-1234567-1 ✅
```
Input:  "12345-1234567-1"
Remove hyphens: "1234567890123"
Length: 13 digits
Type:   CNIC
Result: { normalized: "1234567890123", isValid: true }
Status: ✅ VALID (13 digits after removing hyphens)
```

---

## Validation Logic Flow

```
Input NTN/CNIC
    │
    ├─ Has hyphen?
    │   │
    │   ├─ YES
    │   │   │
    │   │   ├─ 6 chars + 1 char? → ✅ Combine to 7
    │   │   │
    │   │   ├─ Exactly 7 chars before hyphen? → ✅ Take before hyphen
    │   │   │
    │   │   ├─ Remove hyphens = 13 digits? → ✅ Valid CNIC
    │   │   │
    │   │   └─ Other format? → ❌ INVALID
    │   │
    │   └─ NO
    │       │
    │       ├─ Exactly 7 characters? → ✅ Valid NTN
    │       │
    │       ├─ Exactly 13 digits? → ✅ Valid CNIC
    │       │
    │       └─ Other length? → ❌ INVALID
    │
    └─ Empty? → ❌ INVALID
```

---

## Summary

### FBR Accepts:
✅ **Exactly 7 characters** for NTN (numeric or alphanumeric)
✅ **Exactly 13 digits** for CNIC

### FBR Rejects:
❌ 6 characters or less
❌ 8 characters or more (except 13 for CNIC)
❌ 12, 14, or any other length

---

## Migration Impact

### Breaking Changes:
- ❌ 8-character NTNs now rejected (e.g., `G1212111`, `ABC12345`)
- ❌ Any NTN not exactly 7 characters (except 13-digit CNIC)

### New Features:
- ✅ 13-digit CNIC support added
- ✅ CNIC with hyphens supported (e.g., `12345-1234567-1`)

### Unchanged:
- ✅ 7-character NTNs still work
- ✅ 6+1 format still works
- ✅ 7+1 format still works (ignores check digit)
