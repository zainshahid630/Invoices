# Outlook Email Setup Guide - Fix Authentication Error

## ❌ The Problem

Error: `535 5.7.139 Authentication unsuccessful, basic authentication is disabled`

**Cause:** Microsoft disabled basic authentication (username + password) for security reasons.

## ✅ Solutions

You have **3 options** to fix this:

### Option 1: Use App Password (Recommended - Easiest)

#### Step 1: Enable 2-Factor Authentication
1. Go to [Microsoft Account Security](https://account.microsoft.com/security)
2. Click "Advanced security options"
3. Turn on "Two-step verification"
4. Complete the setup

#### Step 2: Generate App Password
1. Go back to [Security Settings](https://account.microsoft.com/security)
2. Scroll to "App passwords"
3. Click "Create a new app password"
4. Copy the generated password (e.g., `abcd-efgh-ijkl-mnop`)

#### Step 3: Use in Settings
1. Go to Settings → Email
2. Choose Outlook provider
3. **Username:** Your full email (saeedpipeindustries@outlook.com)
4. **Password:** Use the App Password (not your regular password)
5. Test connection
6. Save!

### Option 2: Use Gmail Instead (Easiest Alternative)

If you have a Gmail account, it's easier to set up:

1. Enable 2FA on Gmail
2. Generate App Password
3. Use Gmail SMTP settings
4. Works perfectly!

### Option 3: Use SendGrid (Professional - Free Tier)

SendGrid is a professional email service with better deliverability:

1. Sign up at [SendGrid.com](https://sendgrid.com)
2. Verify your email
3. Create API Key
4. Use these settings:
   - Host: `smtp.sendgrid.net`
   - Port: `587`
   - Username: `apikey`
   - Password: Your API Key
5. Free tier: 100 emails/day

## 🔧 Quick Fix for Your Outlook Account

### Method 1: App Password (5 minutes)

```
1. Enable 2FA on Microsoft Account
   → https://account.microsoft.com/security

2. Generate App Password
   → https://account.microsoft.com/security
   → App passwords → Create new

3. In Settings → Email:
   - SMTP Host: smtp-mail.outlook.com
   - Port: 587
   - Security: TLS
   - Username: saeedpipeindustries@outlook.com
   - Password: [Your App Password]
   - From Email: saeedpipeindustries@outlook.com
   - From Name: Saeed Pipe Industries

4. Test Connection
5. Save!
```

### Method 2: Switch to Gmail (10 minutes)

```
1. Create/Use Gmail account

2. Enable 2FA
   → https://myaccount.google.com/security

3. Generate App Password
   → https://myaccount.google.com/apppasswords

4. In Settings → Email:
   - Click "Gmail" provider
   - Username: your-email@gmail.com
   - Password: [Your App Password]
   - From Email: your-email@gmail.com
   - From Name: Saeed Pipe Industries

5. Test Connection
6. Save!
```

## 📋 Comparison

| Method | Setup Time | Reliability | Cost |
|--------|------------|-------------|------|
| Outlook App Password | 5 min | Good | Free |
| Gmail App Password | 5 min | Excellent | Free |
| SendGrid | 10 min | Excellent | Free (100/day) |

## 🎯 Recommended Solution

**For your case (saeedpipeindustries@outlook.com):**

1. **Best:** Enable 2FA and use App Password
2. **Alternative:** Create Gmail account for invoices
3. **Professional:** Use SendGrid for business emails

## 🔒 Why This Happened

Microsoft disabled basic authentication because:
- More secure with 2FA
- Prevents password theft
- Industry standard now
- Better protection

## ✅ Step-by-Step: Outlook App Password

### 1. Enable Two-Step Verification

1. Visit: https://account.microsoft.com/security
2. Click "Advanced security options"
3. Under "Two-step verification", click "Turn on"
4. Follow the prompts:
   - Choose verification method (SMS, Authenticator app, etc.)
   - Verify your identity
   - Complete setup

### 2. Create App Password

1. Go back to: https://account.microsoft.com/security
2. Scroll down to "App passwords"
3. Click "Create a new app password"
4. A password will be generated (e.g., `abcd-efgh-ijkl-mnop`)
5. **Copy this password immediately** (you won't see it again)

### 3. Configure in Your System

1. Open your invoice system
2. Go to Settings → Email tab
3. Click "Outlook" provider button
4. Fill in:
   ```
   SMTP Host: smtp-mail.outlook.com (auto-filled)
   Port: 587 (auto-filled)
   Security: TLS (auto-filled)
   Username: saeedpipeindustries@outlook.com
   Password: [Paste your App Password here]
   From Email: saeedpipeindustries@outlook.com
   From Name: Saeed Pipe Industries
   ```
5. Click "Test Connection"
6. Wait for success message: ✅
7. Click "Save Email Settings"

### 4. Test Sending

1. Go to any invoice
2. Click "Send via Email"
3. Enter test email
4. Check if received!

## 🐛 Troubleshooting

### Still Getting Authentication Error?

**Check:**
- [ ] 2FA is enabled
- [ ] App Password is correct (no spaces)
- [ ] Using App Password, not regular password
- [ ] Username is full email address
- [ ] SMTP host is correct

### App Password Option Not Available?

**Possible reasons:**
1. 2FA not enabled yet
2. Work/School account (contact IT)
3. Account restrictions

**Solution:**
- Ensure 2FA is fully enabled
- Wait 15 minutes after enabling 2FA
- Try different browser
- Contact Microsoft support

### Test Connection Still Fails?

**Try:**
1. Generate new App Password
2. Clear browser cache
3. Use different email provider (Gmail)
4. Check firewall settings

## 💡 Pro Tips

### 1. Save Your App Password
- Store securely (password manager)
- Don't share with anyone
- Can generate multiple for different apps

### 2. Use Professional Email
- Consider custom domain (info@saeedpipe.com)
- Better for business image
- More trustworthy

### 3. Monitor Email Sending
- Check email logs
- Track delivery rates
- Respond to bounces

## 🎉 Success Checklist

- [ ] 2FA enabled on Microsoft account
- [ ] App Password generated
- [ ] Settings configured in system
- [ ] Test connection successful (✅)
- [ ] Settings saved
- [ ] Test email sent
- [ ] Test email received
- [ ] Ready to send invoices!

## 📞 Need Help?

### Microsoft Support
- [Microsoft Account Help](https://support.microsoft.com/account-billing)
- [App Passwords Guide](https://support.microsoft.com/en-us/account-billing/using-app-passwords-with-apps-that-don-t-support-two-step-verification-5896ed9b-4263-e681-128a-a6f2979a7944)

### Alternative Providers
- [Gmail App Passwords](https://support.google.com/accounts/answer/185833)
- [SendGrid Documentation](https://docs.sendgrid.com/)

## 🚀 Quick Command Summary

```bash
# For Outlook with App Password:
1. Enable 2FA: https://account.microsoft.com/security
2. Create App Password: https://account.microsoft.com/security
3. Use App Password in settings
4. Test & Save

# For Gmail (Alternative):
1. Enable 2FA: https://myaccount.google.com/security
2. Create App Password: https://myaccount.google.com/apppasswords
3. Use App Password in settings
4. Test & Save
```

---

**Bottom Line:** Enable 2FA and use App Password. It takes 5 minutes and solves the problem permanently! 🔒✅
