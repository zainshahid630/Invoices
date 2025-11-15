# 🎨 Template Builders - Choose Your Version

## 📍 Three Versions Available

### 1️⃣ Basic Builder
**URL:** `/template-builder`

**Features:**
- ✅ Drag & drop elements
- ✅ Reorder elements
- ✅ Live preview
- ✅ Template settings (font, colors, spacing)
- ❌ No grid/rows
- ❌ No field configuration

**Best For:** Simple, single-column layouts

---

### 2️⃣ Pro Builder (Grid Support)
**URL:** `/template-builder-pro`

**Features:**
- ✅ Everything from Basic
- ✅ **2, 3, 4 column rows**
- ✅ **Side-by-side elements**
- ✅ Grid layouts
- ❌ No field configuration

**Best For:** Professional layouts with side-by-side sections

**Example:**
```
┌─────────────────────────────────┐
│         INVOICE                 │
├──────────────┬──────────────────┤
│ Company Info │ Buyer Info       │
├──────────────┴──────────────────┤
│ Items Table                     │
├──────────────┬──────────────────┤
│   QR Code    │ Totals           │
└──────────────┴──────────────────┘
```

---

### 3️⃣ Advanced Builder (Field Configuration) ⭐
**URL:** `/template-builder-advanced`

**Features:**
- ✅ Everything from Basic
- ✅ **Configure which fields to show/hide**
- ✅ **Granular control** over each element
- ✅ Hide specific buyer info fields
- ✅ Show/hide HS codes, NTN, etc.
- ❌ No grid/rows (yet)

**Best For:** Custom field visibility requirements

**Field Configuration:**
- **Company Info:** Name, Business Name, Address, NTN, GST, Phone, Email
- **Buyer Info:** Name, Business Name, Address, NTN/CNIC, Province
- **Invoice Details:** Invoice #, Date, PO #, Type, Payment Status
- **Items Table:** Item Name, HS Code, UOM, Unit Price, Quantity, Total
- **Totals:** Subtotal, Sales Tax, Further Tax, Total

---

## 🎯 Which One Should You Use?

### Use **Basic Builder** if:
- You want simple, single-column layouts
- You don't need side-by-side elements
- You want all fields visible
- Quick and easy setup

### Use **Pro Builder** if:
- You want professional grid layouts
- You need side-by-side sections
- Company & Buyer info next to each other
- QR Code & Totals together

### Use **Advanced Builder** if:
- You need to hide specific fields
- Different invoices show different info
- You want to hide buyer's address
- You want HS Code shown separately
- Custom field visibility per template

---

## 💡 Your Use Case

Based on your requirements:

> "I want to hide something from buyer info"
> "I want to show Items HS code globally not with products"

**Recommendation:** Use **Advanced Builder** (`/template-builder-advanced`)

### How It Works:

1. **Add Element** - Click "Buyer Info" to add it
2. **Click Element** - Select it on canvas
3. **Configure Fields** - Right sidebar shows all fields
4. **Toggle Visibility** - Uncheck fields you want to hide
5. **Live Preview** - See changes immediately

### Example: Hide Buyer Address

```
1. Add "Buyer Info" element
2. Click on it to select
3. Right sidebar shows:
   ☑ Buyer Name
   ☑ Business Name
   ☐ Address          ← Uncheck this
   ☑ NTN/CNIC
   ☑ Province
4. Address is now hidden!
```

---

## 🚀 Quick Start

### Advanced Builder (Recommended for You)

```
http://localhost:3000/template-builder-advanced
```

**Steps:**
1. Add elements from left sidebar
2. Click any element to configure
3. Right sidebar shows field checkboxes
4. Uncheck fields to hide them
5. See live preview
6. Save template

---

## 📊 Feature Comparison

| Feature | Basic | Pro | Advanced |
|---------|-------|-----|----------|
| Drag & Drop | ✅ | ✅ | ✅ |
| Live Preview | ✅ | ✅ | ✅ |
| Template Settings | ✅ | ✅ | ✅ |
| **Grid Layouts** | ❌ | ✅ | ❌ |
| **2-4 Column Rows** | ❌ | ✅ | ❌ |
| **Field Configuration** | ❌ | ❌ | ✅ |
| **Show/Hide Fields** | ❌ | ❌ | ✅ |
| **Custom Visibility** | ❌ | ❌ | ✅ |

---

## 🎨 Coming Soon: Ultimate Builder

Combining all features:
- ✅ Grid layouts (from Pro)
- ✅ Field configuration (from Advanced)
- ✅ Row support + Field control
- ✅ Best of both worlds!

---

## 📞 Quick Links

- **Basic:** `/template-builder`
- **Pro (Grid):** `/template-builder-pro`
- **Advanced (Fields):** `/template-builder-advanced` ⭐

---

**For your use case (hide buyer info fields, custom HS code display), use Advanced Builder!** 🎯
