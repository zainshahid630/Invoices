# 🎨 Template Builder Pro - Grid & Row System

## ✨ What's New

An **advanced template builder** with **grid/row support** where you can place multiple elements side-by-side!

---

## 🚀 Access

```
http://localhost:3000/template-builder-pro
```

---

## 🎯 Key Features

### 📐 Row Layouts
Create rows with multiple columns:
- **2 Columns** - Place 2 elements side-by-side
- **3 Columns** - Place 3 elements side-by-side  
- **4 Columns** - Place 4 elements side-by-side

### 🎨 How It Works

1. **Add a Row** - Click "2 Columns", "3 Columns", or "4 Columns"
2. **Select the Row** - The row becomes highlighted (purple border)
3. **Add Elements** - Click any element to add it to the selected row
4. **Fill the Row** - Keep adding until the row is full
5. **Deselect** - Click "Deselect Row" to add elements normally again

---

## 📋 Step-by-Step Guide

### Example: Company & Buyer Info Side-by-Side

```
Step 1: Click "2 Columns" button
   → A 2-column row appears on canvas

Step 2: Row is auto-selected (purple border)
   → Left sidebar shows "✓ Row Selected"

Step 3: Click "Company Info" element
   → It appears in the left column

Step 4: Click "Buyer Info" element
   → It appears in the right column

Step 5: Click "Deselect Row"
   → Now you can add regular elements again
```

### Result:
```
┌─────────────────────────────────────┐
│  ┌──────────────┐  ┌──────────────┐ │
│  │ Company Info │  │  Buyer Info  │ │
│  │ Your Company │  │  Customer    │ │
│  │ 123 Street   │  │  456 Avenue  │ │
│  │ NTN: 1234567 │  │  NTN: 7654321│ │
│  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────┘
```

---

## 🎨 Layout Examples

### Example 1: Classic Invoice with Side-by-Side Info

```
1. Header (full width)
2. Row (2 columns)
   - Company Info
   - Buyer Info
3. Invoice Details (full width)
4. Items Table (full width)
5. Row (2 columns)
   - QR Code
   - Totals
6. Footer (full width)
```

**Preview:**
```
┌─────────────────────────────────────┐
│           INVOICE                   │
├──────────────┬──────────────────────┤
│ Company Info │ Buyer Info           │
├──────────────┴──────────────────────┤
│ Date: 11/11/2025  Type: Standard    │
├─────────────────────────────────────┤
│ Items Table                         │
│ Product A    5    500               │
│ Product B    3    300               │
├──────────────┬──────────────────────┤
│   QR Code    │ Subtotal:  800       │
│   [QR]       │ Tax:       144       │
│              │ Total:     944       │
├──────────────┴──────────────────────┤
│      Thank you for business!        │
└─────────────────────────────────────┘
```

### Example 2: Minimal with 3-Column Details

```
1. Header
2. Row (3 columns)
   - Logo
   - Company Info
   - Buyer Info
3. Items Table
4. Totals
5. Footer
```

### Example 3: Detailed with 4-Column Footer

```
1. Header
2. Company Info (full)
3. Buyer Info (full)
4. Items Table
5. Totals
6. Row (4 columns)
   - QR Code
   - Logo
   - Notes
   - Spacer
7. Footer
```

---

## 🎯 Visual Guide

```
┌─────────────────────────────────────────────────────────────┐
│  🎨 Template Builder Pro                                    │
│  ┌─────────┐  ┌─────────────────────┐  ┌─────────────────┐ │
│  │Elements │  │      Canvas         │  │  Live Preview   │ │
│  │         │  │                     │  │                 │ │
│  │📋Header │  │  [Header Element]   │  │  ┌───────────┐  │ │
│  │🏢Logo   │  │                     │  │  │ INVOICE   │  │ │
│  │🏪Company│  │  [2-Column Row]     │  │  ├─────┬─────┤  │ │
│  │         │  │  ┌────────┬────────┐│  │  │ Co. │Buyer│  │ │
│  │📐 Rows  │  │  │Company │ Buyer  ││  │  ├─────┴─────┤  │ │
│  │⬜⬜ 2Col│  │  │  Info  │  Info  ││  │  │ Items...  │  │ │
│  │⬜⬜⬜3Col│  │  └────────┴────────┘│  │  │ Total:    │  │ │
│  │⬜⬜⬜⬜4│  │                     │  │  └───────────┘  │ │
│  │         │  │  [Items Table]      │  │                 │ │
│  │✓ Row    │  │  [Totals]           │  │  Updates live!  │ │
│  │Selected │  │                     │  │                 │ │
│  │Click    │  │  Click row to       │  │                 │ │
│  │elements │  │  select it, then    │  │                 │ │
│  │to add   │  │  add elements       │  │                 │ │
│  └─────────┘  └─────────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## 💡 Pro Tips

### ✅ Best Practices

1. **Use 2 Columns for Info**
   - Company Info + Buyer Info
   - QR Code + Totals
   - Logo + Invoice Details

2. **Use 3 Columns for Headers**
   - Logo + Company Name + Date
   - Three different detail sections

3. **Use 4 Columns for Footer**
   - QR Code + Logo + Notes + Contact

4. **Full Width for Tables**
   - Always use full width for Items Table
   - Totals can be in a row or full width

### ⚠️ Things to Know

- **Rows have limits** - 2-col row can only hold 2 elements
- **Select before adding** - Must select row first
- **Visual feedback** - Selected row has purple border
- **Deselect when done** - Click "Deselect Row" button
- **Drag to reorder** - Rows can be dragged like elements

---

## 🎨 Common Layouts

### Layout 1: Side-by-Side Info
```
Header
[Company Info] [Buyer Info]
Items Table
[QR Code] [Totals]
Footer
```

### Layout 2: Triple Header
```
[Logo] [Company] [Date]
Buyer Info
Items Table
Totals
Footer
```

### Layout 3: Quad Footer
```
Header
Company Info
Buyer Info
Items Table
Totals
[QR] [Logo] [Notes] [Spacer]
Footer
```

---

## 🔧 Technical Details

### Row Structure
```typescript
{
  type: 'row',
  columns: 2,  // 2, 3, or 4
  children: [
    { type: 'company-info', width: 'half' },
    { type: 'buyer-info', width: 'half' }
  ]
}
```

### Element Widths
- **2 columns** → width: 'half' (50%)
- **3 columns** → width: 'third' (33%)
- **4 columns** → width: 'quarter' (25%)

---

## 🎯 Comparison

| Feature | Basic Builder | **Pro Builder** |
|---------|---------------|-----------------|
| Single Column | ✅ Yes | ✅ Yes |
| Multi-Column | ❌ No | ✅ Yes |
| Row Layouts | ❌ No | ✅ 2, 3, 4 cols |
| Side-by-Side | ❌ No | ✅ Yes |
| Grid System | ❌ No | ✅ Yes |
| Complexity | Simple | Advanced |

---

## 🚀 Quick Start

### 1. Open Pro Builder
```
/template-builder-pro
```

### 2. Add a Row
Click "2 Columns" button

### 3. Add Elements to Row
- Row is auto-selected (purple)
- Click "Company Info"
- Click "Buyer Info"
- Row is now full!

### 4. Continue Building
- Click "Deselect Row"
- Add more elements or rows
- Drag to reorder

### 5. Preview & Save
- Check live preview on right
- Click "Save Template"
- Done! 🎉

---

## 📞 Support

### Row Not Selecting?
- Make sure you clicked the row layout button
- Look for purple border on canvas
- Check left sidebar for "✓ Row Selected"

### Can't Add Element to Row?
- Row might be full (check column count)
- Make sure row is selected first
- Try deselecting and reselecting

### Elements Not Side-by-Side?
- Check if they're in the same row
- Verify row has correct column count
- Look at live preview to confirm

---

## 🎉 Benefits

✅ **Flexible Layouts** - Create any design you want
✅ **Professional Look** - Side-by-side elements look great
✅ **Space Efficient** - Fit more info in less space
✅ **Easy to Use** - Click, select, add - that's it!
✅ **Live Preview** - See results instantly
✅ **Print Optimized** - Looks great on paper

---

**Start creating advanced layouts now!** 🎨✨

Visit: `/template-builder-pro`
