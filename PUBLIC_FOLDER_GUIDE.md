# 📁 Public Folder - Static Files Guide

## 📍 Where to Place Images

In Next.js, static files like images should be placed in the **`public`** directory.

---

## 🎯 Directory Structure

```
your-project/
├── public/              ← Place images here
│   ├── logo.png
│   ├── banner.jpg
│   ├── favicon.ico
│   └── images/          ← Optional subfolder
│       ├── product1.png
│       └── product2.png
├── app/
├── lib/
└── ...
```

---

## 🌐 How to Access Images

### From Root Domain:

**File Location:**
```
public/logo.png
```

**Access URL:**
```
http://localhost:3001/logo.png
https://yourdomain.com/logo.png
```

### With Subfolder:

**File Location:**
```
public/images/banner.jpg
```

**Access URL:**
```
http://localhost:3001/images/banner.jpg
https://yourdomain.com/images/banner.jpg
```

---

## 💻 Using in Code

### In React/Next.js Components:

```tsx
// Direct path (no /public prefix needed)
<img src="/logo.png" alt="Logo" />

// With subfolder
<img src="/images/banner.jpg" alt="Banner" />

// Using Next.js Image component (recommended)
import Image from 'next/image';

<Image 
  src="/logo.png" 
  alt="Logo" 
  width={200} 
  height={100} 
/>
```

### In CSS:

```css
.header {
  background-image: url('/images/banner.jpg');
}
```

### In API Routes:

```typescript
const logoUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/logo.png`;
```

---

## 📋 Examples

### Example 1: Company Logo

**Place file:**
```
public/company-logo.png
```

**Use in invoice:**
```tsx
<img 
  src="/company-logo.png" 
  alt="Company Logo" 
  className="h-16"
/>
```

**Access directly:**
```
http://localhost:3001/company-logo.png
```

### Example 2: FBR Logo

**Place file:**
```
public/fbr-logo.png
```

**Use in template:**
```tsx
<img 
  src="/fbr-logo.png" 
  alt="FBR Logo" 
  className="w-24 h-24"
/>
```

### Example 3: Multiple Images

**Place files:**
```
public/
├── logos/
│   ├── company-a.png
│   ├── company-b.png
│   └── company-c.png
└── icons/
    ├── pdf.svg
    ├── excel.svg
    └── print.svg
```

**Use in code:**
```tsx
<img src="/logos/company-a.png" alt="Company A" />
<img src="/icons/pdf.svg" alt="PDF Icon" />
```

---

## 🎨 Best Practices

### 1. **Organize with Subfolders**
```
public/
├── images/
│   ├── logos/
│   ├── banners/
│   └── products/
├── icons/
└── documents/
```

### 2. **Use Descriptive Names**
```
✅ company-logo.png
✅ invoice-banner.jpg
✅ product-thumbnail-1.png

❌ img1.png
❌ pic.jpg
❌ untitled.png
```

### 3. **Optimize Images**
- Compress images before uploading
- Use appropriate formats (PNG for logos, JPG for photos, SVG for icons)
- Keep file sizes small for faster loading

### 4. **Use Next.js Image Component**
```tsx
import Image from 'next/image';

// Automatic optimization
<Image 
  src="/logo.png" 
  alt="Logo" 
  width={200} 
  height={100}
  priority // For above-the-fold images
/>
```

---

## 🚀 Quick Setup

### Step 1: Create Public Folder (Already Done!)
```bash
mkdir -p public
```

### Step 2: Add Your Images
```bash
# Copy your image to public folder
cp /path/to/your/logo.png public/logo.png
```

### Step 3: Use in Your App
```tsx
<img src="/logo.png" alt="Logo" />
```

### Step 4: Access via URL
```
http://localhost:3001/logo.png
```

---

## 📊 Common Use Cases

### Company Logo in Settings:

**1. Upload logo to:**
```
public/uploads/company-logos/company-123.png
```

**2. Save URL in database:**
```
/uploads/company-logos/company-123.png
```

**3. Display in invoice:**
```tsx
<img src={company.logo_url} alt={company.name} />
```

### Invoice Template Images:

**1. Place template assets:**
```
public/templates/
├── modern-bg.png
├── classic-border.png
└── minimal-logo.svg
```

**2. Use in templates:**
```tsx
<div style={{ backgroundImage: 'url(/templates/modern-bg.png)' }}>
  ...
</div>
```

---

## ⚠️ Important Notes

### ✅ DO:
- Place all static files in `public/`
- Use absolute paths starting with `/`
- Organize with subfolders
- Optimize images before uploading

### ❌ DON'T:
- Don't include `/public` in the URL path
- Don't place sensitive files here (they're publicly accessible)
- Don't use relative paths like `../public/logo.png`
- Don't store user-uploaded files here (use cloud storage instead)

---

## 🔒 Security Note

**Everything in `public/` is accessible to anyone!**

```
✅ Safe to put in public/:
- Company logos
- Product images
- Icons
- Public documents
- Marketing materials

❌ Don't put in public/:
- User passwords
- API keys
- Private documents
- Sensitive data
```

---

## 📱 Dynamic User Uploads

For user-uploaded files (like company logos), use cloud storage:

### Recommended Services:
1. **Supabase Storage** (recommended for your project)
2. **AWS S3**
3. **Cloudinary**
4. **Google Cloud Storage**

### Example with Supabase:
```typescript
// Upload
const { data, error } = await supabase.storage
  .from('company-logos')
  .upload(`${companyId}/logo.png`, file);

// Get public URL
const { data: { publicUrl } } = supabase.storage
  .from('company-logos')
  .getPublicUrl(`${companyId}/logo.png`);
```

---

## 🎯 Summary

**To make an image accessible at `domain.com/image.png`:**

1. **Place file:** `public/image.png`
2. **Access URL:** `http://localhost:3001/image.png`
3. **Use in code:** `<img src="/image.png" />`

**That's it!** No configuration needed. Next.js automatically serves everything in `public/` from the root domain.

---

## 📞 Quick Reference

| File Location | Access URL | Code Usage |
|---------------|------------|------------|
| `public/logo.png` | `/logo.png` | `<img src="/logo.png" />` |
| `public/images/banner.jpg` | `/images/banner.jpg` | `<img src="/images/banner.jpg" />` |
| `public/icons/pdf.svg` | `/icons/pdf.svg` | `<img src="/icons/pdf.svg" />` |

**Your `public` folder is ready to use!** 📁✨
