# 🎨 Invoice Template Builder - Visual Editor

## ✨ What I Created

A **drag-and-drop visual template builder** where you can design custom invoice templates without any coding!

---

## 🚀 How to Access

Visit this URL in your browser:

```
http://localhost:3000/template-builder
```

---

## 📐 Features

### Left Sidebar - Elements Palette
Drag and drop these elements onto your canvas:

- **📋 Header** - Invoice title and number
- **🏢 Company Logo** - Your business logo
- **🏪 Company Info** - Seller details
- **👤 Buyer Info** - Customer details
- **📄 Invoice Details** - Date, type, PO number
- **📊 Items Table** - Products/services list
- **💰 Totals** - Subtotal, taxes, total
- **📱 QR Code** - FBR verification code
- **📝 Notes** - Terms and conditions
- **⬇️ Footer** - Thank you message
- **⬜ Spacer** - Add spacing between elements

### Middle - Canvas
- **Drag elements** to reorder them
- **Click elements** to select and edit
- **Remove elements** with the ✕ button
- See your template structure in real-time

### Right Sidebar - Live Preview
- **Real-time preview** of your invoice
- See exactly how it will look when printed
- Updates instantly as you make changes

### Template Settings
Customize your template:

- **Template Name** - Give it a unique name
- **Font Size** - Small, Medium, or Large
- **Border Style** - None, Solid, Dashed, or Double
- **Color Scheme** - Blue, Gray (B&W), Green, or Purple
- **Spacing** - Compact, Normal, or Relaxed

---

## 🎯 How to Use

### Step 1: Add Elements
1. Click any element in the left sidebar
2. It appears on the canvas
3. Add as many as you need

### Step 2: Arrange Elements
1. **Drag** any element up or down
2. Drop it where you want
3. Elements reorder automatically

### Step 3: Customize Settings
1. Adjust **Font Size** for readability
2. Choose **Border Style** for your look
3. Select **Color Scheme** (use Gray for B&W printing)
4. Set **Spacing** for compact or relaxed layout

### Step 4: Preview
1. Check the **Live Preview** on the right
2. See exactly how your invoice will look
3. Make adjustments as needed

### Step 5: Save
1. Click **💾 Save Draft** to save progress
2. Click **✅ Save Template** when done
3. Your template is ready to use!

---

## 💡 Example Layouts

### Classic Layout
```
1. Header
2. Company Logo
3. Company Info
4. Buyer Info
5. Invoice Details
6. Items Table
7. Totals
8. QR Code
9. Notes
10. Footer
```

### Minimal Layout
```
1. Header
2. Company Info
3. Buyer Info
4. Items Table
5. Totals
6. Footer
```

### Excel-Style Layout
```
1. Header
2. Spacer
3. Company Info
4. Buyer Info
5. Invoice Details
6. Spacer
7. Items Table
8. Totals
9. Spacer
10. QR Code
11. Notes
12. Footer
```

---

## 🎨 Design Tips

### For Black & White Printing
- Use **Gray** color scheme
- Choose **Solid** borders
- Use **Normal** or **Compact** spacing
- Keep it simple and clean

### For Professional Look
- Start with Header
- Add Company Logo
- Use consistent spacing
- End with Footer

### For Detailed Invoices
- Include all info elements
- Add spacers between sections
- Use relaxed spacing
- Include notes section

---

## 🖼️ Visual Guide

```
┌─────────────────────────────────────────────────────────────┐
│  📐 Invoice Template Builder                                │
│  ┌─────────┐  ┌─────────────────────┐  ┌─────────────────┐ │
│  │Elements │  │      Canvas         │  │  Live Preview   │ │
│  │         │  │                     │  │                 │ │
│  │📋Header │  │  [Header Element]   │  │  ┌───────────┐  │ │
│  │🏢Logo   │  │  [Logo Element]     │  │  │ INVOICE   │  │ │
│  │🏪Company│  │  [Company Element]  │  │  │ INV-001   │  │ │
│  │👤Buyer  │  │  [Buyer Element]    │  │  ├───────────┤  │ │
│  │📊Table  │  │  [Table Element]    │  │  │ Company   │  │ │
│  │💰Totals │  │  [Totals Element]   │  │  │ Info      │  │ │
│  │         │  │                     │  │  ├───────────┤  │ │
│  │Settings │  │  Drag to reorder ↕  │  │  │ Items...  │  │ │
│  │Name:    │  │  Click to edit ✏️   │  │  │ Total:    │  │ │
│  │[______] │  │  Remove with ✕      │  │  └───────────┘  │ │
│  │Size:    │  │                     │  │                 │ │
│  │[Medium] │  │                     │  │  Updates live!  │ │
│  └─────────┘  └─────────────────────┘  └─────────────────┘ │
│  [💾 Save Draft]  [✅ Save Template]                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 Technical Details

### File Location
```
app/template-builder/page.tsx
```

### How It Works
1. **Drag & Drop** - Native HTML5 drag and drop
2. **Live Preview** - React state updates in real-time
3. **Responsive** - Works on all screen sizes
4. **No Dependencies** - Uses built-in browser features

### Saving Templates
When you save, the template structure is stored as JSON:

```json
{
  "name": "My Custom Template",
  "elements": [
    { "type": "header", "settings": {...} },
    { "type": "company-info", "settings": {...} },
    ...
  ],
  "settings": {
    "fontSize": "medium",
    "borderStyle": "solid",
    "colorScheme": "blue",
    "spacing": "normal"
  }
}
```

---

## 🎯 Use Cases

### 1. Create B&W Template
- Use Gray color scheme
- Add all necessary elements
- Use solid borders
- Save as "B&W Template"

### 2. Create Minimal Template
- Add only essential elements
- Use compact spacing
- Remove unnecessary sections
- Save as "Minimal Template"

### 3. Create Detailed Template
- Add all available elements
- Use relaxed spacing
- Include notes and QR code
- Save as "Detailed Template"

---

## 🚀 Next Steps

After creating your template:

1. **Save it** with a unique name
2. **Test it** by printing a sample invoice
3. **Adjust** if needed
4. **Share** with your team
5. **Use it** for all your invoices!

---

## 💡 Pro Tips

✅ **Start Simple** - Begin with basic elements, add more later
✅ **Preview Often** - Check the live preview as you build
✅ **Use Spacers** - Add breathing room between sections
✅ **Test Print** - Always test print before finalizing
✅ **Save Drafts** - Save your work frequently
✅ **Experiment** - Try different layouts and settings

---

## 🎉 Benefits

- **No Coding Required** - Visual drag-and-drop interface
- **Real-Time Preview** - See changes instantly
- **Fully Customizable** - Control every aspect
- **Print Optimized** - Designed for professional printing
- **Easy to Use** - Intuitive interface
- **Unlimited Templates** - Create as many as you need

---

## 📞 Support

Having trouble? Check:
- Elements are draggable (cursor changes to grab)
- Preview updates when you make changes
- Settings apply to the whole template
- Save button stores your template

---

**Start building your perfect invoice template now!** 🎨✨

Visit: `/template-builder`
