# WhatsApp Integration - Quick Start Guide

## 🚀 Get Started in 3 Minutes

### Step 1: Run Database Migration (30 seconds)

Open Supabase SQL Editor and run:
```sql
-- File: database/ADD_WHATSAPP_TO_COMPANIES.sql
ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS whatsapp_number VARCHAR(20),
ADD COLUMN IF NOT EXISTS whatsapp_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS whatsapp_message_template TEXT;
```

### Step 2: Configure Settings (1 minute)

1. Go to **Settings → WhatsApp** tab
2. Toggle **Enable WhatsApp Integration** to ON
3. Enter your WhatsApp number: `923001234567`
4. Click **Save WhatsApp Settings**

### Step 3: Send Your First Invoice (30 seconds)

1. Open any invoice
2. Click **💬 Send via WhatsApp**
3. WhatsApp opens with pre-filled message
4. Click Send in WhatsApp
5. Done! 🎉

## 📱 Phone Number Format

✅ **Correct:**
- `923001234567` (Pakistan)
- `+923001234567`
- `971501234567` (UAE)

❌ **Incorrect:**
- `0300-1234567` (missing country code)
- `03001234567` (missing country code)

## 💬 Default Message Template

```
Hello {customer_name},

Your invoice {invoice_number} for Rs. {total_amount} is ready.

Invoice Date: {invoice_date}
Amount: Rs. {total_amount}

Thank you for your business!

{company_name}
```

## 🎯 Key Features

- ✅ One-click invoice sending
- ✅ Automatic customer phone detection
- ✅ Customizable message templates
- ✅ Professional branded messages
- ✅ No additional costs
- ✅ Works with WhatsApp Business

## 💡 Pro Tips

1. **Save Customer Phone Numbers** - Add phone numbers in the Customers section for one-click sending
2. **Customize Your Template** - Make it match your brand voice
3. **Test First** - Send a test invoice to yourself before going live
4. **Use Placeholders** - Personalize messages with customer data

## 🔧 Troubleshooting

**WhatsApp doesn't open?**
- Check if WhatsApp is installed
- Allow pop-ups in your browser
- Try WhatsApp Web

**"WhatsApp not enabled" error?**
- Go to Settings → WhatsApp
- Toggle the switch to ON
- Save settings

**Need help?**
- Check the full guide: `WHATSAPP_SELLER_INTEGRATION_COMPLETE.md`

## 🎉 That's It!

You're ready to send invoices via WhatsApp. Your customers will love the instant delivery!

---

**Questions?** Check the complete guide for detailed information.
