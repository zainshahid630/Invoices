# Blog Image Guide

## Adding Images to Blog Posts

Each blog post now includes a featured image that appears on:
- Blog listing page
- Individual blog post page
- Social media shares (Open Graph/Twitter Cards)
- Related posts section
- Landing page blog section

### Image Requirements

#### Dimensions
- **Recommended Size**: 1200x630px (Open Graph standard)
- **Aspect Ratio**: 16:9 or 1.91:1
- **Minimum Width**: 800px
- **Format**: JPG or PNG

#### Quality
- High resolution but optimized for web
- File size under 200KB for fast loading
- Clear, professional imagery
- Relevant to blog post content

### Adding Images to New Posts

When creating a new blog post in `app/blog/blog-data.ts`, include these fields:

```typescript
{
  slug: "your-post-slug",
  title: "Your Post Title",
  excerpt: "Brief description...",
  image: "https://images.unsplash.com/photo-xxxxx?w=1200&h=630&fit=crop",
  imageAlt: "Descriptive alt text for accessibility and SEO",
  content: `...`,
  // ... other fields
}
```

### Image Sources

#### 1. Unsplash (Free, High Quality)
- URL: https://unsplash.com
- License: Free to use
- URL Format: `https://images.unsplash.com/photo-{id}?w=1200&h=630&fit=crop`
- Best for: Professional stock photos

**Example Search Terms for Invoicing Blog:**
- "business documents"
- "invoice paperwork"
- "accounting ledger"
- "tax forms"
- "office desk"
- "calculator money"
- "business meeting"
- "digital workflow"
- "financial charts"

#### 2. Pexels (Free, High Quality)
- URL: https://pexels.com
- License: Free to use
- Best for: Business and office imagery

#### 3. Custom Images
- Upload to `/public/blog/` folder
- Reference as: `/blog/your-image.jpg`
- Best for: Screenshots, diagrams, custom graphics

### Image Optimization Tips

#### 1. Use URL Parameters (Unsplash)
```
?w=1200          # Width
&h=630           # Height
&fit=crop        # Crop to fit
&q=80            # Quality (80%)
&auto=format     # Auto format (WebP when supported)
```

#### 2. Lazy Loading
Images automatically use `loading="lazy"` except for featured images on blog post pages.

#### 3. Alt Text Best Practices
- Be descriptive but concise
- Include relevant keywords naturally
- Describe what's in the image
- Don't start with "Image of..." or "Picture of..."

**Good Examples:**
- ✅ "Business owner reviewing invoice on laptop"
- ✅ "Tax documents and calculator on office desk"
- ✅ "Digital workflow automation dashboard"

**Bad Examples:**
- ❌ "Image of a person"
- ❌ "Picture"
- ❌ "Invoice"

### SEO Benefits of Images

1. **Social Sharing**: Attractive images increase click-through rates on social media
2. **Visual Search**: Images can appear in Google Image Search
3. **User Engagement**: Posts with images get 94% more views
4. **Reduced Bounce Rate**: Visual content keeps users on page longer
5. **Accessibility**: Proper alt text helps screen readers

### Image Display Locations

#### Blog Listing Page
- Size: Full width of card
- Aspect: 16:9
- Hover: Slight zoom effect
- Icon: Overlaid in top-left corner

#### Individual Blog Post
- Size: Full width of content area
- Aspect: 16:9
- Position: Below title, above content
- Icon: Overlaid in bottom-right corner

#### Related Posts
- Size: Full width of card
- Aspect: 16:9
- Hover: Slight zoom effect
- Icon: Overlaid in top-left corner

#### Landing Page
- Size: Full width of card
- Aspect: 16:9
- Hover: Slight zoom effect
- Icon: Overlaid in top-left corner

### Finding the Right Images

#### For FBR/Compliance Posts
Search: "business compliance", "tax documents", "government forms", "official paperwork"

#### For Invoicing Posts
Search: "invoice", "billing", "business documents", "paperwork", "office desk"

#### For Automation Posts
Search: "workflow automation", "digital dashboard", "analytics", "technology", "computer screen"

#### For Financial Posts
Search: "money", "calculator", "accounting", "financial charts", "business growth"

#### For Tips/Guide Posts
Search: "business meeting", "planning", "strategy", "checklist", "office work"

### Example: Complete Blog Post with Image

```typescript
{
  slug: "how-to-create-professional-invoices",
  title: "How to Create Professional Invoices in 5 Minutes",
  excerpt: "Learn the essential elements of a professional invoice and how to create one quickly.",
  image: "https://images.unsplash.com/photo-1554224154-22dec7ec8818?w=1200&h=630&fit=crop",
  imageAlt: "Professional invoice template on laptop screen",
  content: `
# How to Create Professional Invoices in 5 Minutes

Creating professional invoices doesn't have to be complicated...
  `,
  date: "2024-11-21",
  dateFormatted: "November 21, 2024",
  author: "Zazteck Team",
  category: "Invoicing Tips",
  readTime: "5 min read",
  icon: "📄",
  keywords: [
    "professional invoices",
    "invoice template",
    "create invoice",
    "invoice design",
    "business invoicing",
  ],
}
```

### Troubleshooting

#### Image Not Loading
- Check URL is accessible
- Verify image dimensions
- Check for CORS issues
- Try different image source

#### Image Too Large
- Use URL parameters to resize
- Compress image before uploading
- Use WebP format when possible

#### Poor Image Quality
- Use higher resolution source
- Avoid over-compression
- Check image dimensions match display size

### Future Enhancements

1. **Image CDN**: Implement Cloudinary or similar for automatic optimization
2. **Multiple Sizes**: Generate responsive image sizes
3. **WebP Format**: Automatic WebP conversion for better performance
4. **Blur Placeholder**: Add blur-up effect while loading
5. **Image Gallery**: Support multiple images per post
6. **Video Support**: Add video embeds in blog posts

## Quick Reference

| Field | Required | Format | Example |
|-------|----------|--------|---------|
| image | Yes | URL | `https://images.unsplash.com/...` |
| imageAlt | Yes | String | `Business documents on desk` |
| Dimensions | - | 1200x630 | Recommended for social sharing |
| Format | - | JPG/PNG | JPG for photos, PNG for graphics |
| Size | - | <200KB | Optimized for web |

---

**Need help?** Contact the development team for assistance with blog images.
