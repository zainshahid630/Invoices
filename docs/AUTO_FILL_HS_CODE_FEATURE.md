# Auto-Fill HS Code Feature

## Overview

When adding new line items to an invoice, the HS Code field now automatically fills with the HS code from the previous item, saving time and ensuring consistency.

## How It Works

### New Invoice Page (`/seller/invoices/new`)

**When Adding First Item:**
```
Item 1:
- HS Code: [Uses default from Settings]
- Example: 0101.2100
```

**When Adding Second Item:**
```
Item 2:
- HS Code: [Auto-filled from Item 1]
- Example: 0101.2100 (same as Item 1)
- User can edit if needed
```

**When Adding Third Item:**
```
Item 3:
- HS Code: [Auto-filled from Item 2]
- Example: 0101.2100 (or whatever Item 2 has)
- User can edit if needed
```

### Edit Invoice Page (`/seller/invoices/[id]/edit`)

**Same Behavior:**
- New items get HS code from previous item
- Maintains consistency
- Editable as needed

## Logic Flow

```javascript
When user clicks "+ Add Item":
1. Get the last item in the list
2. Check if it has an HS code
3. If yes → Use that HS code
4. If no → Use default from settings (new invoice only)
5. Create new item with that HS code
6. User can edit if different product
```

## Use Cases

### Use Case 1: Same Product Category
**Scenario:** Selling multiple items from same category

```
Item 1: Product A
- HS Code: 8471.3000 (Computers)

Click "+ Add Item"

Item 2: Product B
- HS Code: 8471.3000 ✅ (Auto-filled)
- Same category, no need to type
```

### Use Case 2: Different Products
**Scenario:** Selling items from different categories

```
Item 1: Computer
- HS Code: 8471.3000

Click "+ Add Item"

Item 2: Furniture
- HS Code: 8471.3000 (Auto-filled)
- User changes to: 9403.2000 ✅
- Easy to edit

Click "+ Add Item"

Item 3: More Furniture
- HS Code: 9403.2000 ✅ (Auto-filled from Item 2)
- Correct category automatically
```

### Use Case 3: Bulk Entry
**Scenario:** Adding 10 items of same category

```
Item 1: Set HS Code: 0101.2100
Items 2-10: All auto-filled with 0101.2100 ✅
Time saved: ~2 minutes
```

## Benefits

### 1. Time Saving
- No need to type HS code repeatedly
- Especially useful for multiple items
- Reduces data entry time

### 2. Consistency
- All items in same category use same HS code
- Reduces errors
- Maintains accuracy

### 3. Flexibility
- Can still edit each item
- Not locked to previous value
- Override when needed

### 4. Smart Defaults
- First item uses setting default
- Subsequent items use previous
- Best of both worlds

## Examples

### Example 1: Electronics Store
```
Invoice for Computer Accessories:

Item 1: Mouse
- HS Code: 8471.6000 (Input devices)

Item 2: Keyboard
- HS Code: 8471.6000 ✅ (Auto-filled, same category)

Item 3: Monitor
- HS Code: 8471.6000 (Auto-filled)
- Change to: 8528.5200 (Monitors)

Item 4: Monitor Cable
- HS Code: 8528.5200 ✅ (Auto-filled from Item 3)
```

### Example 2: Grocery Store
```
Invoice for Mixed Items:

Item 1: Rice
- HS Code: 1006.3000

Item 2: Wheat
- HS Code: 1006.3000 (Auto-filled)
- Change to: 1001.9900

Item 3: Flour
- HS Code: 1001.9900 ✅ (Auto-filled, related product)
```

### Example 3: Service Provider
```
Invoice for Services:

Item 1: Consulting Service
- HS Code: 0000.0000 (Services)

Item 2: Training Service
- HS Code: 0000.0000 ✅ (Auto-filled, same)

Item 3: Support Service
- HS Code: 0000.0000 ✅ (Auto-filled, same)

All services use same HS code automatically!
```

## Technical Details

### Code Implementation

**New Invoice:**
```typescript
const addItem = () => {
  // Get HS code from previous item, or use default from settings
  const previousItem = items[items.length - 1];
  const hsCodeToUse = previousItem?.hs_code || defaultHsCode;
  
  setItems([
    ...items,
    {
      // ... other fields
      hs_code: hsCodeToUse, // Auto-filled
    },
  ]);
};
```

**Edit Invoice:**
```typescript
const addItem = () => {
  // Get HS code from previous item
  const previousItem = items[items.length - 1];
  const hsCodeToUse = previousItem?.hs_code || '';
  
  setItems([
    ...items,
    {
      // ... other fields
      hs_code: hsCodeToUse, // Auto-filled
    },
  ]);
};
```

### Fallback Logic

1. **Try previous item's HS code**
   - If exists → Use it
   
2. **Try default from settings** (new invoice only)
   - If exists → Use it
   
3. **Use empty string** (edit invoice)
   - User must enter manually

## User Experience

### Visual Feedback
```
┌─────────────────────────────────────────┐
│ Item 1                                  │
│ HS Code: [0101.2100]                   │
└─────────────────────────────────────────┘

[+ Add Item] ← User clicks

┌─────────────────────────────────────────┐
│ Item 2                                  │
│ HS Code: [0101.2100] ← Auto-filled! ✅ │
│         ↑                               │
│         └─ Same as Item 1               │
└─────────────────────────────────────────┘
```

### Editing
```
User can:
1. Keep the auto-filled value ✅
2. Edit to different HS code ✅
3. Clear and enter new one ✅

No restrictions, full flexibility!
```

## Comparison

### Before This Feature
```
Adding 5 items:
1. Type HS code for Item 1
2. Type HS code for Item 2 (same)
3. Type HS code for Item 3 (same)
4. Type HS code for Item 4 (same)
5. Type HS code for Item 5 (same)

Time: ~2-3 minutes
Errors: Possible typos
```

### After This Feature
```
Adding 5 items:
1. Type HS code for Item 1
2. Auto-filled ✅
3. Auto-filled ✅
4. Auto-filled ✅
5. Auto-filled ✅

Time: ~30 seconds
Errors: Minimal (copy from previous)
```

## Best Practices

### 1. Group Similar Items
- Add items of same category together
- Benefit from auto-fill
- Change HS code when switching categories

### 2. Set Good Default
- Configure default HS code in Settings
- Use your most common category
- First item will use this

### 3. Review Before Saving
- Check HS codes are correct
- Especially when mixing categories
- Easy to spot and fix

## Related Features

### Default HS Code (Settings)
- Set in Settings → Tax Configuration
- Used for first item in new invoice
- Fallback when no previous item

### Product HS Codes
- Products have their own HS codes
- When selecting product, HS code auto-fills
- This feature is for manual entry

## Troubleshooting

### Issue: HS Code Not Auto-Filling
**Cause:** Previous item has no HS code
**Solution:** Enter HS code for previous item first

### Issue: Wrong HS Code Auto-Filled
**Cause:** Previous item has wrong HS code
**Solution:** Just edit the field, it's not locked

### Issue: Want Different HS Code
**Cause:** Not an issue - you can change it
**Solution:** Click field and type new HS code

## Summary

✅ **Auto-Fill:** HS code from previous item
✅ **Time Saving:** No repeated typing
✅ **Consistency:** Same category items match
✅ **Flexible:** Can edit anytime
✅ **Smart:** Uses settings default for first item

Perfect for invoices with multiple items in the same category!
