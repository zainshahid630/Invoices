# WhatsApp Integration - Troubleshooting 404 Error

## Issue: 404 Not Found on `/api/seller/whatsapp/send-invoice`

### Root Cause
Next.js dev server needs to be restarted to pick up new API routes.

### Solution

**Step 1: Restart the Development Server**

Stop your current dev server (Ctrl+C or Cmd+C) and restart it:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

**Step 2: Clear Next.js Cache (if issue persists)**

```bash
# Stop the dev server first, then:
rm -rf .next
npm run dev
```

**Step 3: Verify the Route Exists**

Check that the file exists at:
```
app/api/seller/whatsapp/send-invoice/route.ts
```

**Step 4: Test the API Endpoint**

After restarting, test with curl or Postman:

```bash
curl -X POST http://localhost:3000/api/seller/whatsapp/send-invoice \
  -H "Content-Type: application/json" \
  -d '{
    "company_id": "your-company-id",
    "invoice_id": "your-invoice-id",
    "customer_phone": "923001234567"
  }'
```

### Expected Response

**Success (200):**
```json
{
  "success": true,
  "waLink": "https://wa.me/923001234567?text=...",
  "message": "WhatsApp link generated successfully",
  "phoneNumber": "923001234567",
  "preview": "Hello Customer Name..."
}
```

**Error (400) - WhatsApp not enabled:**
```json
{
  "error": "WhatsApp is not enabled. Please enable it in Settings > WhatsApp."
}
```

**Error (400) - No phone number:**
```json
{
  "error": "Customer phone number not available. Please provide a phone number."
}
```

## Common Issues

### 1. Route Still 404 After Restart
- Make sure you're running the dev server from the project root
- Check that `app/api/seller/whatsapp/send-invoice/route.ts` exists
- Verify Next.js version supports App Router (13.4+)

### 2. TypeScript Errors
Run diagnostics:
```bash
npm run build
# or check types
npx tsc --noEmit
```

### 3. Environment Variables Missing
Ensure `.env.local` has:
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 4. Database Columns Missing
Run the migration:
```sql
-- In Supabase SQL Editor
ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS whatsapp_number VARCHAR(20),
ADD COLUMN IF NOT EXISTS whatsapp_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS whatsapp_message_template TEXT;
```

## Verification Checklist

- [ ] Dev server restarted
- [ ] File exists at correct path
- [ ] Database migration run
- [ ] WhatsApp enabled in settings
- [ ] WhatsApp number configured
- [ ] Environment variables set
- [ ] No TypeScript errors

## Still Having Issues?

1. Check browser console for errors
2. Check server terminal for errors
3. Verify the request payload is correct
4. Test with a simple GET request first
5. Check Next.js version: `npm list next`

## Quick Fix Script

Create a file `restart-dev.sh`:
```bash
#!/bin/bash
echo "Stopping dev server..."
pkill -f "next dev"
echo "Clearing Next.js cache..."
rm -rf .next
echo "Starting dev server..."
npm run dev
```

Run it:
```bash
chmod +x restart-dev.sh
./restart-dev.sh
```

---

**Most Common Solution:** Just restart your dev server! 🔄
