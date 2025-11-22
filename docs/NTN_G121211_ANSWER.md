# Quick Answer: G121211-1 Normalization

## Question
**How will `G121211-1` be normalized?**

---

## Answer

### Input:
```
G121211-1
```

### Output:
```typescript
{
  normalized: "G121211",
  isValid: true
}
```

---

## Explanation

### Breakdown:
- **Before hyphen:** `G121211` (7 characters: 1 letter + 6 digits)
- **After hyphen:** `1` (check digit)

### Logic Applied:
Since `G121211` has **7 characters** (which is between 7-8), the function:
1. ✅ Recognizes it as a valid 7-character NTN
2. ✅ Takes the part before the hyphen: `G121211`
3. ✅ Ignores the check digit after the hyphen: `1`

### Result:
```
G121211-1  →  G121211
```

---

## Why This Happens

The normalization function has this rule:

```typescript
// If 7-8 characters before hyphen, take that part (ignore check digit)
if (beforeHyphen.length >= 7 && beforeHyphen.length <= 8) {
  return { normalized: beforeHyphen, isValid: true };
}
```

Since `G121211` has exactly **7 characters**, it matches this rule.

---

## Similar Examples

| Input | Before Hyphen | Length | Result | Note |
|-------|---------------|--------|--------|------|
| `G121211-1` | `G121211` | 7 | `G121211` | Your case |
| `G980921-2` | `G980921` | 7 | `G980921` | Same pattern |
| `ABC12345-9` | `ABC12345` | 8 | `ABC12345` | 8 chars also valid |
| `1234567-8` | `1234567` | 7 | `1234567` | Numeric version |
| `066744-0` | `066744` | 6 | `0667440` | Different rule (6+1 combined) |

---

## Summary

✅ **`G121211-1` normalizes to `G121211`**

The check digit `-1` is removed because the main NTN (`G121211`) already has the required 7 characters.
