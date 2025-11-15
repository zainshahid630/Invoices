# WhatsApp Business API - Complete Implementation Guide

## 🎯 What You Get

✅ **Send messages directly from your system** - No manual WhatsApp opening
✅ **Attach invoice PDFs automatically** - Customers receive professional PDFs
✅ **Track message delivery** - Know when messages are sent, delivered, and read
✅ **No user interaction needed** - Fully automated sending
✅ **Professional & reliable** - Official Meta WhatsApp Business API

## 📋 Prerequisites

1. **Meta Business Account** - Free to create
2. **WhatsApp Business Account** - Linked to Meta
3. **Phone Number** - Dedicated for WhatsApp Business
4. **Verified Business** - Meta business verification (can take 1-2 weeks)

## 🚀 Setup Steps

### Step 1: Create Meta Business Account

1. Go to [Meta Business Suite](https://business.facebook.com/)
2. Click "Create Account"
3. Fill in your business details
4. Verify your email

### Step 2: Create WhatsApp Business App

1. Go to [Meta for Developers](https://developers.facebook.com/)
2. Click "My Apps" → "Create App"
3. Select "Business" as app type
4. Fill in app details
5. Add "WhatsApp" product to your app

### Step 3: Get Phone Number

**Option A: Use Test Number (Free - for testing)**
- Meta provides a test number
- Limited to 5 recipients
- Good for development

**Option B: Add Your Own Number**
- Click "Add Phone Number"
- Enter your business phone number
- Verify via SMS/Call
- This becomes your WhatsApp Business number

### Step 4: Get API Credentials

1. In your WhatsApp app dashboard:
   - Go to "WhatsApp" → "API Setup"
   - Copy **Phone Number ID**
   - Copy **WhatsApp Business Account ID**

2. Generate Access Token:
   - Go to "WhatsApp" → "API Setup"
   - Click "Generate Token"
   - Copy the **Temporary Access Token** (24 hours)
   - For production, create a **System User Token** (permanent)

### Step 5: Create Permanent Access Token (Production)

1. Go to Business Settings → System Users
2. Click "Add" → Create system user
3. Assign "WhatsApp" permissions
4. Generate token → Select "whatsapp_business_messaging" permission
5. Copy and save the token securely

### Step 6: Configure in Your System

1. Run the database migration:
```sql
-- In Supabase SQL Editor
-- Run: database/ADD_WHATSAPP_TO_COMPANIES.sql
```

2. Go to Settings → WhatsApp tab

3. Fill in the credentials:
   - **API Mode**: Select "Business API"
   - **Phone Number ID**: Paste from Step 4
   - **Access Token**: Paste from Step 5
   - **Business Account ID**: Paste from Step 4
   - **Enable WhatsApp**: Toggle ON

4. Save settings

### Step 7: Test It!

1. Open any invoice
2. Click "Send via WhatsApp"
3. Enter a test phone number
4. Message will be sent automatically with PDF!

## 💰 Pricing

### Free Tier
- **1,000 conversations/month** - FREE
- Each conversation = 24-hour window
- Perfect for small businesses

### Paid Tier (After 1,000)
- **Business-initiated**: $0.005 - $0.09 per conversation (varies by country)
- **User-initiated**: FREE
- Very affordable for most businesses

**Example:** 
- Pakistan: ~$0.014 per conversation
- 5,000 messages/month = ~$56/month
- Still cheaper than SMS!

## 🔧 Implementation Details

### Files Created

1. **lib/whatsapp-business.ts** - WhatsApp Business API client
2. **lib/pdf-generator.ts** - Invoice PDF generation
3. **app/api/seller/whatsapp/send-with-pdf/route.ts** - API endpoint
4. **database/ADD_WHATSAPP_TO_COMPANIES.sql** - Database schema

### How It Works

```
User clicks "Send via WhatsApp"
    ↓
System generates invoice PDF
    ↓
PDF uploaded to accessible URL
    ↓
WhatsApp Business API called
    ↓
Message sent with PDF attachment
    ↓
Customer receives message instantly
    ↓
Delivery status tracked in database
```

### Message Flow

1. **Generate PDF** - Create PDF from invoice HTML
2. **Upload PDF** - Make PDF accessible via public URL
3. **Send Message** - Call WhatsApp API with PDF link
4. **Track Status** - Store message ID and status
5. **Update Status** - Webhook updates delivery/read status

## 📱 Features

### Current Implementation

✅ Send text messages
✅ Send documents (PDF, DOC, etc.)
✅ Custom message templates
✅ Phone number formatting
✅ Error handling
✅ Message tracking
✅ Fallback to wa.me link

### Future Enhancements

🔜 Template messages (pre-approved by Meta)
🔜 Delivery status webhooks
🔜 Read receipts
🔜 Bulk sending
🔜 Scheduled messages
🔜 Customer replies handling
🔜 WhatsApp chatbot

## 🔒 Security

- Access tokens stored encrypted in database
- Tokens never exposed to client
- API calls from server only
- Phone numbers validated
- Rate limiting recommended

## 🐛 Troubleshooting

### "Phone Number ID not found"
- Check you copied the correct ID from Meta dashboard
- Ensure the phone number is verified

### "Access Token invalid"
- Token may have expired (temporary tokens last 24 hours)
- Generate a permanent System User token
- Check token has correct permissions

### "Message not delivered"
- Verify recipient's phone number is correct
- Check recipient has WhatsApp installed
- Ensure your number isn't blocked
- Check WhatsApp Business Account status

### "PDF not attached"
- Ensure PDF URL is publicly accessible
- Check PDF file size (max 100MB)
- Verify URL returns correct content-type

### "Fallback to wa.me"
- API credentials not configured
- System automatically falls back to link mode
- Configure API credentials to use direct sending

## 📊 Message Tracking

Track all sent messages in `whatsapp_messages` table:

```sql
SELECT 
  invoice_id,
  recipient_phone,
  status,
  sent_at,
  delivered_at,
  read_at
FROM whatsapp_messages
WHERE company_id = 'your-company-id'
ORDER BY sent_at DESC;
```

### Message Statuses

- **sent** - Message sent to WhatsApp
- **delivered** - Delivered to recipient's phone
- **read** - Recipient opened the message
- **failed** - Failed to send

## 🎓 Best Practices

### 1. Message Templates
- Keep messages professional
- Include essential invoice details
- Add call-to-action
- Test with different customers

### 2. Phone Numbers
- Always validate before sending
- Store in international format
- Handle different country codes
- Provide manual entry option

### 3. PDF Generation
- Keep PDFs under 5MB
- Use professional templates
- Include company branding
- Test on mobile devices

### 4. Error Handling
- Always have fallback to wa.me
- Show clear error messages
- Log failures for debugging
- Retry failed messages

### 5. Rate Limiting
- Don't spam customers
- Respect WhatsApp limits
- Implement sending queues
- Monitor usage

## 📈 Monitoring

### Key Metrics to Track

1. **Delivery Rate** - % of messages delivered
2. **Read Rate** - % of messages read
3. **Response Rate** - % of customers replying
4. **Failure Rate** - % of failed messages
5. **Cost per Message** - Average cost

### Dashboard Query

```sql
SELECT 
  DATE(sent_at) as date,
  COUNT(*) as total_sent,
  COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered,
  COUNT(CASE WHEN status = 'read' THEN 1 END) as read,
  COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed
FROM whatsapp_messages
WHERE company_id = 'your-company-id'
  AND sent_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(sent_at)
ORDER BY date DESC;
```

## 🌟 Success Checklist

Before going live:

- [ ] Meta Business Account created
- [ ] WhatsApp Business App created
- [ ] Phone number added and verified
- [ ] API credentials obtained
- [ ] Database migration run
- [ ] Settings configured in system
- [ ] Test message sent successfully
- [ ] PDF attachment working
- [ ] Message tracking working
- [ ] Error handling tested
- [ ] Fallback to wa.me working
- [ ] Team trained on usage

## 🆘 Support Resources

- [WhatsApp Business API Docs](https://developers.facebook.com/docs/whatsapp/cloud-api)
- [Meta Business Help Center](https://www.facebook.com/business/help)
- [WhatsApp Business API Pricing](https://developers.facebook.com/docs/whatsapp/pricing)
- [API Status Page](https://developers.facebook.com/status/)

## 🎉 You're Ready!

Once configured, your system will:
- ✅ Send invoices automatically via WhatsApp
- ✅ Attach professional PDF invoices
- ✅ Track delivery and read status
- ✅ Provide seamless customer experience
- ✅ Save time and improve efficiency

**Start with the test number, then upgrade to your own number for production!**

---

**Need Help?** Check the troubleshooting section or contact Meta support.
