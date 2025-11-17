# How to Create OG Image for InvoiceFBR

## Required Specifications

- **Size:** 1200 x 630 pixels (Facebook/LinkedIn standard)
- **Format:** JPG or PNG
- **File name:** `og-image.jpg`
- **Location:** `public/og-image.jpg`

---

## Design Requirements

### Content to Include:
1. **Logo/Brand:** InvoiceFBR logo
2. **Headline:** "Pakistan's #1 FBR-Compliant Invoicing Software"
3. **Key Features:** 
   - "Automatic FBR Posting"
   - "130+ Businesses Trust Us"
   - "Free 7-Day Trial"
4. **Visual:** Invoice/document graphic or professional business imagery
5. **Colors:** Professional (blue, green, or brand colors)

---

## Quick Creation Options

### Option 1: Canva (Easiest - 10 minutes)
1. Go to: https://www.canva.com/
2. Search for "Facebook Post" or "Open Graph" template
3. Resize to 1200 x 630 px
4. Use this text:
   ```
   InvoiceFBR
   Pakistan's #1 FBR-Compliant Invoicing Software
   
   ✓ Automatic FBR Posting
   ✓ Trusted by 130+ Businesses
   ✓ Free 7-Day Trial
   
   invoicefbr.com
   ```
5. Download as JPG
6. Save to `public/og-image.jpg`

### Option 2: Figma (Professional - 20 minutes)
1. Create new frame: 1200 x 630 px
2. Add background gradient or solid color
3. Add text and graphics
4. Export as JPG (quality: 80-90%)

### Option 3: Online Tools
- **Remove.bg + Canva:** Remove background from product screenshots
- **Placid.app:** Automated OG image generation
- **Bannerbear:** Template-based OG images

### Option 4: Hire Designer (Fiverr)
- Cost: $5-20
- Time: 24 hours
- Search: "open graph image design"

---

## Design Tips

1. **Keep text large** - Readable on mobile (min 40px font)
2. **High contrast** - Dark text on light background or vice versa
3. **Safe zone** - Keep important content 100px from edges
4. **Brand consistency** - Use your brand colors
5. **Test on mobile** - Preview how it looks when shared

---

## Temporary Solution (Use This Now)

Until you create a custom image, use a placeholder:

### Quick Text-Based OG Image:
1. Go to: https://og-playground.vercel.app/
2. Enter your text
3. Download the generated image
4. Save as `public/og-image.jpg`

### Or use this simple design prompt for AI:
```
Create a 1200x630px professional business image with:
- Blue gradient background
- Large white text: "InvoiceFBR"
- Subtitle: "Pakistan's #1 FBR-Compliant Invoicing Software"
- Icons showing: invoice, checkmark, automation
- Bottom text: "Trusted by 130+ Businesses"
```

---

## After Creating the Image

1. Save file as: `public/og-image.jpg`
2. Verify it's working:
   - Visit: https://www.opengraph.xyz/
   - Enter: https://invoicefbr.com
   - Check if image displays correctly
3. Test on social media:
   - Share link on Facebook/LinkedIn
   - Check preview

---

## File Location
```
your-project/
└── public/
    └── og-image.jpg  ← Place your image here
```

The image will be automatically accessible at: `https://invoicefbr.com/og-image.jpg`
