# NTN Validation: Before vs After Update

## 🔴 BEFORE Update

### Code:
```typescript
if (cleaned.includes('-')) {
  const beforeHyphen = parts[0];
  
  // Only accepted 7-8 characters before hyphen
  if (beforeHyphen.length >= 7 && beforeHyphen.length <= 8) {
    return { normalized: beforeHyphen, isValid: true };
  }
  
  return { normalized: '', isValid: false, error: '...' };
}
```

### Test: `066744-0`
```
Input:  "066744-0"
Split:  ["066744", "0"]
Check:  beforeHyphen.length = 6
        6 >= 7? NO ❌
Result: INVALID ❌
Error:  "NTN before hyphen must be 7-8 characters (found 6)"
```

---

## 🟢 AFTER Update

### Code:
```typescript
if (cleaned.includes('-')) {
  const beforeHyphen = parts[0];
  const afterHyphen = parts[1] || '';
  
  // NEW: Special case for 6+1 format
  if (beforeHyphen.length === 6 && afterHyphen.length === 1) {
    const combined = beforeHyphen + afterHyphen;
    return { normalized: combined, isValid: true };
  }
  
  // Existing: 7-8 characters before hyphen
  if (beforeHyphen.length >= 7 && beforeHyphen.length <= 8) {
    return { normalized: beforeHyphen, isValid: true };
  }
  
  return { normalized: '', isValid: false, error: '...' };
}
```

### Test: `066744-0`
```
Input:  "066744-0"
Split:  ["066744", "0"]
Check:  beforeHyphen.length = 6 AND afterHyphen.length = 1
        6 === 6 AND 1 === 1? YES ✅
Action: Combine "066744" + "0" = "0667440"
Result: VALID ✅
Output: { normalized: "0667440", isValid: true }
```

---

## 📊 Side-by-Side Comparison

| Test Case | Input | Before Update | After Update |
|-----------|-------|---------------|--------------|
| **6+1 format** | `066744-0` | ❌ **INVALID**<br/>Error: "must be 7-8 chars" | ✅ **VALID**<br/>Result: `"0667440"` |
| **6+1 format** | `123456-7` | ❌ **INVALID**<br/>Error: "must be 7-8 chars" | ✅ **VALID**<br/>Result: `"1234567"` |
| **7+1 format** | `1234567-8` | ✅ **VALID**<br/>Result: `"1234567"` | ✅ **VALID**<br/>Result: `"1234567"` |
| **7 digits** | `1234567` | ✅ **VALID**<br/>Result: `"1234567"` | ✅ **VALID**<br/>Result: `"1234567"` |
| **8 digits** | `12345678` | ✅ **VALID**<br/>Result: `"12345678"` | ✅ **VALID**<br/>Result: `"12345678"` |
| **Alphanumeric** | `G980921-2` | ✅ **VALID**<br/>Result: `"G980921"` | ✅ **VALID**<br/>Result: `"G980921"` |
| **6 digits only** | `123456` | ❌ **INVALID**<br/>Error: "must be 7-8 chars" | ❌ **INVALID**<br/>Error: "must be 7-8 chars" |
| **5+1 format** | `12345-6` | ❌ **INVALID**<br/>Error: "must be 7-8 chars" | ❌ **INVALID**<br/>Error: "invalid format" |

---

## 🎯 What's Different?

### NEW Behavior:
- ✅ Accepts `066744-0` format (6 digits + hyphen + 1 digit)
- ✅ Combines both parts to create 7-digit NTN
- ✅ Validates that format is exactly 6+1 (not 5+1 or 4+2, etc.)

### UNCHANGED Behavior:
- ✅ Still accepts 7+1 format (ignores check digit)
- ✅ Still accepts 7-8 digits without hyphen
- ✅ Still accepts alphanumeric NTNs
- ✅ Still rejects invalid formats
- ✅ Still auto-cleans and uppercases

---

## 💡 Why This Change?

### Problem:
Some valid NTNs in Pakistan use the format `066744-0` where:
- First 6 digits: Main NTN number
- Last 1 digit: Check digit or extension

### Solution:
Instead of rejecting this format, we now:
1. Detect the 6+1 pattern
2. Combine both parts
3. Create a valid 7-digit NTN

### Example:
```
Original:   066744-0
Split:      066744 + 0
Combined:   0667440
Result:     Valid 7-digit NTN ✅
```

---

## 🔍 Validation Decision Tree

```
Input NTN
    │
    ├─ Has hyphen?
    │   │
    │   ├─ YES
    │   │   │
    │   │   ├─ Multiple hyphens? → ❌ INVALID
    │   │   │
    │   │   ├─ 6 chars + 1 char? → ✅ VALID (combine them)
    │   │   │
    │   │   ├─ 7-8 chars + any? → ✅ VALID (take before hyphen)
    │   │   │
    │   │   └─ Other format? → ❌ INVALID
    │   │
    │   └─ NO
    │       │
    │       ├─ 7-8 characters? → ✅ VALID
    │       │
    │       └─ Other length? → ❌ INVALID
    │
    └─ Empty? → ❌ INVALID
```

---

## ✅ Summary

| Aspect | Status |
|--------|--------|
| **New Format Supported** | ✅ `066744-0` (6+1) |
| **Existing Formats** | ✅ All still work |
| **Invalid Formats** | ✅ Still rejected |
| **Breaking Changes** | ✅ None |
| **Backward Compatible** | ✅ Yes |
| **Tests Pass** | ✅ All pass |

---

## 📝 Quick Reference

### Valid Formats After Update:
1. ✅ `066744-0` → `0667440` (6+1 digits - **NEW**)
2. ✅ `1234567-8` → `1234567` (7+1 digits)
3. ✅ `1234567` → `1234567` (7 digits)
4. ✅ `12345678` → `12345678` (8 digits)
5. ✅ `G980921-2` → `G980921` (alphanumeric)
6. ✅ `G980921` → `G980921` (alphanumeric)

### Invalid Formats:
1. ❌ `123456` (only 6 digits)
2. ❌ `12345-6` (5+1 format)
3. ❌ `123456789` (9 digits)
4. ❌ `123-456-7` (multiple hyphens)
5. ❌ `` (empty)
