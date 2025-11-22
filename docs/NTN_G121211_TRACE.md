# NTN Normalization Trace: G121211-1

## Input Analysis

**Input:** `G121211-1`

### Character Breakdown:
- Letter: `G` (1 character)
- Digits: `121211` (6 digits)
- Hyphen: `-`
- Check digit: `1` (1 digit)

**Total before hyphen:** 7 characters (1 letter + 6 digits)
**Total after hyphen:** 1 character

---

## Step-by-Step Trace

### Step 1: Empty Check
```typescript
if (!ntn) {
  return { normalized: '', isValid: false, error: 'NTN is empty' };
}
```
**Input:** `"G121211-1"`
**Result:** ✓ Not empty, continue

---

### Step 2: Clean and Uppercase
```typescript
const cleaned = ntn.trim().toUpperCase().replace(/[^A-Z0-9-]/g, '');
```
**Input:** `"G121211-1"`
**Process:**
- `trim()` → `"G121211-1"` (no spaces)
- `toUpperCase()` → `"G121211-1"` (already uppercase)
- `replace(/[^A-Z0-9-]/g, '')` → `"G121211-1"` (no special chars)

**Result:** `cleaned = "G121211-1"`

---

### Step 3: Check for Hyphen
```typescript
if (cleaned.includes('-')) {
```
**Input:** `"G121211-1"`
**Result:** ✓ Has hyphen, enter this block

---

### Step 4: Split by Hyphen
```typescript
const parts = cleaned.split('-');
```
**Input:** `"G121211-1"`
**Result:** `parts = ["G121211", "1"]`

---

### Step 5: Check for Multiple Hyphens
```typescript
if (parts.length > 2) {
  return { normalized: '', isValid: false, error: 'Invalid NTN format - too many hyphens' };
}
```
**Input:** `parts.length = 2`
**Result:** ✓ Only one hyphen, continue

---

### Step 6: Extract Parts
```typescript
const beforeHyphen = parts[0];
const afterHyphen = parts[1] || '';
```
**Result:**
- `beforeHyphen = "G121211"` (7 characters)
- `afterHyphen = "1"` (1 character)

---

### Step 7: Check 6+1 Format
```typescript
if (beforeHyphen.length === 6 && afterHyphen.length === 1) {
  const combined = beforeHyphen + afterHyphen;
  return { normalized: combined, isValid: true };
}
```
**Check:** `beforeHyphen.length === 6`
- `"G121211".length = 7`
- `7 === 6` → **FALSE** ❌

**Result:** Skip this block

---

### Step 8: Check 7-8 Characters Format
```typescript
if (beforeHyphen.length >= 7 && beforeHyphen.length <= 8) {
  return { normalized: beforeHyphen, isValid: true };
}
```
**Check:** `beforeHyphen.length >= 7 && beforeHyphen.length <= 8`
- `"G121211".length = 7`
- `7 >= 7` → **TRUE** ✓
- `7 <= 8` → **TRUE** ✓

**Result:** ✓ Condition met!

**Action:** Return `beforeHyphen` (ignore check digit after hyphen)

---

## Final Result

```typescript
{
  normalized: "G121211",
  isValid: true
}
```

---

## Summary

| Aspect | Value |
|--------|-------|
| **Input** | `G121211-1` |
| **Before Hyphen** | `G121211` (7 characters) |
| **After Hyphen** | `1` (check digit) |
| **Format Matched** | 7-8 characters before hyphen |
| **Action** | Take before hyphen, ignore check digit |
| **Output** | `G121211` |
| **Valid** | ✅ YES |

---

## Visual Flow

```
Input: "G121211-1"
   ↓
Clean & Uppercase: "G121211-1"
   ↓
Split by hyphen: ["G121211", "1"]
   ↓
Check format:
   • 6+1? NO (7 chars before hyphen)
   • 7-8+any? YES ✓ (7 chars before hyphen)
   ↓
Take before hyphen: "G121211"
   ↓
Result: { normalized: "G121211", isValid: true }
```

---

## Comparison with Similar NTNs

| Input | Before Hyphen | After Hyphen | Format | Result |
|-------|---------------|--------------|--------|--------|
| `G121211-1` | `G121211` (7) | `1` | 7+1 | `G121211` ✅ |
| `G980921-2` | `G980921` (7) | `2` | 7+1 | `G980921` ✅ |
| `1234567-8` | `1234567` (7) | `8` | 7+1 | `1234567` ✅ |
| `066744-0` | `066744` (6) | `0` | 6+1 | `0667440` ✅ (combined) |
| `ABC12345-9` | `ABC12345` (8) | `9` | 8+1 | `ABC12345` ✅ |

---

## Key Takeaway

**`G121211-1` is normalized to `G121211`**

The function:
1. Recognizes it as a 7-character alphanumeric NTN with a check digit
2. Takes the 7 characters before the hyphen
3. Ignores the check digit after the hyphen
4. Returns `G121211` as valid ✅
