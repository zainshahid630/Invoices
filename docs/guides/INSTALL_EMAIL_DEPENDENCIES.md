# Install Email Dependencies

## Quick Fix

Run this command in your terminal:

```bash
npm install nodemailer puppeteer
# or if using yarn
yarn add nodemailer puppeteer
```

## What Gets Installed

1. **nodemailer** - Email sending library
   - SMTP support
   - Multiple providers
   - Attachment support

2. **puppeteer** - PDF generation
   - Headless Chrome
   - HTML to PDF conversion
   - Professional formatting

## Installation Steps

### Step 1: Install Packages

```bash
npm install nodemailer puppeteer
```

### Step 2: Install Type Definitions (Optional but Recommended)

```bash
npm install --save-dev @types/nodemailer
```

### Step 3: Restart Dev Server

```bash
# Stop current server (Ctrl+C)
npm run dev
```

## Verify Installation

Check your `package.json` should now include:

```json
{
  "dependencies": {
    "nodemailer": "^6.9.0",
    "puppeteer": "^21.0.0"
  }
}
```

## Alternative: Lightweight PDF Generation

If Puppeteer is too heavy (downloads Chromium ~170MB), you can use alternatives:

### Option 1: Use External PDF Service
```bash
npm install @react-pdf/renderer
```

### Option 2: Use Existing Print Page
- Generate PDF URL from your print page
- Use that URL in email
- No Puppeteer needed

## Troubleshooting

### Puppeteer Installation Issues

If Puppeteer fails to install:

```bash
# Skip Chromium download
PUPPETEER_SKIP_DOWNLOAD=true npm install puppeteer

# Or use puppeteer-core (no Chromium)
npm install puppeteer-core
```

### Nodemailer Issues

If Nodemailer fails:

```bash
# Clear cache and reinstall
npm cache clean --force
npm install nodemailer
```

## After Installation

1. Restart your dev server
2. Go to Settings → Email tab
3. Configure SMTP settings
4. Test connection
5. Start sending emails!

## Quick Command

Copy and paste this:

```bash
npm install nodemailer puppeteer && npm run dev
```

This will:
1. Install both packages
2. Restart your dev server
3. Ready to use!

---

**That's it!** Your email integration will now work. 📧✨
