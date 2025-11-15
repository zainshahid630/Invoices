# 🏢 Seed Test Companies - Quick Guide

## ✅ What Was Created

I've created a complete system to add 20 random test companies to your Super Admin dashboard!

---

## 🎯 Two Ways to Add Test Companies

### **Option 1: Using the Web Interface (Recommended)**

1. **Login to Super Admin:**
   - Go to: `http://localhost:3000/super-admin/login`
   - Email: `admin@saas-invoice.com`
   - Password: `SuperAdmin@123`

2. **Navigate to Seed Data Page:**
   - Click "Seed Data" in the top navigation
   - Or go directly to: `http://localhost:3000/super-admin/seed-data`

3. **Click the Button:**
   - Click "🚀 Add 20 Test Companies"
   - Confirm the action
   - Wait for the process to complete

4. **View Results:**
   - You'll see a summary showing:
     - Companies Created
     - Subscriptions Created
     - Settings Created
     - Features Enabled
   - Any errors will be displayed

5. **Check Dashboard:**
   - Click "Go to Dashboard" button
   - You'll see all 20 companies listed with pagination!

---

### **Option 2: Using SQL (Alternative)**

If you prefer to run SQL directly in Supabase:

1. **Open Supabase SQL Editor:**
   - Go to: https://dosecswlefagrerrgmsc.supabase.co
   - Navigate to SQL Editor

2. **Run the SQL Script:**
   - Open the file: `ADD_20_TEST_COMPANIES.sql`
   - Copy the entire content
   - Paste into Supabase SQL Editor
   - Click "Run"

3. **Verify Results:**
   - The script will show a summary at the end
   - Check your Super Admin dashboard

---

## 📋 What Gets Created

For each of the 20 test companies:

### **1. Company Details**
- Company name (e.g., "Tech Solutions Ltd")
- Business name (e.g., "Tech Solutions Private Limited")
- NTN number (e.g., "1234567-8")
- STRN number (e.g., "STRN-001")
- Complete address
- City and Province
- Phone number
- Email address
- Active status: `true`

### **2. Subscription**
- Plan: Professional
- Duration: 1 year from today
- Amount: PKR 15,000
- Status: Active
- Payment Status: Paid

### **3. Default Settings**
- Invoice Prefix: "INV"
- Invoice Counter: 1
- Sales Tax Rate: 18%
- Further Tax Rate: 0%
- Currency: PKR

### **4. Enabled Features**
- ✅ Inventory Management
- ✅ Customer Management
- ✅ Invoice Creation
- ✅ FBR Integration
- ✅ Payment Tracking
- ✅ Reports

---

## 🏢 List of Test Companies

1. **Tech Solutions Ltd** - Karachi, Sindh
2. **Global Traders** - Lahore, Punjab
3. **Prime Industries** - Faisalabad, Punjab
4. **Metro Enterprises** - Islamabad
5. **Sunrise Trading Co** - Rawalpindi, Punjab
6. **Elite Textiles** - Multan, Punjab
7. **Ocean Logistics** - Karachi, Sindh
8. **Smart Electronics** - Lahore, Punjab
9. **Green Agro Farms** - Sahiwal, Punjab
10. **Royal Builders** - Peshawar, KPK
11. **Diamond Jewelers** - Karachi, Sindh
12. **Fast Food Chain** - Lahore, Punjab
13. **Medical Supplies Co** - Islamabad
14. **Auto Parts Hub** - Gujranwala, Punjab
15. **Fashion Boutique** - Karachi, Sindh
16. **Power Energy Ltd** - Quetta, Balochistan
17. **Book Publishers** - Lahore, Punjab
18. **Furniture Mart** - Sialkot, Punjab
19. **Chemical Industries** - Karachi, Sindh
20. **Sports Goods Export** - Sialkot, Punjab

---

## 📁 Files Created

### **1. Web Interface**
- **Page:** `app/super-admin/seed-data/page.tsx`
  - Beautiful UI with one-click seeding
  - Shows preview of companies
  - Displays results and errors
  - Confirmation dialog

### **2. API Endpoint**
- **Route:** `app/api/admin/seed-companies/route.ts`
  - POST endpoint to create companies
  - Creates companies, subscriptions, settings, and features
  - Returns detailed results
  - Error handling

### **3. SQL Script**
- **File:** `ADD_20_TEST_COMPANIES.sql`
  - Complete SQL script
  - Can be run directly in Supabase
  - Includes verification queries

### **4. Layout Component**
- **Component:** `app/super-admin/components/SuperAdminLayout.tsx`
  - Shared layout for Super Admin pages
  - Navigation with "Seed Data" link
  - Logout functionality

---

## 🚀 Quick Start

**Fastest way to add test companies:**

1. Login to Super Admin
2. Click "Seed Data" in navigation
3. Click "🚀 Add 20 Test Companies"
4. Confirm
5. Done! ✅

---

## ✨ Features

### **Web Interface Benefits:**
- ✅ One-click operation
- ✅ Visual feedback
- ✅ Error reporting
- ✅ Results summary
- ✅ No SQL knowledge needed
- ✅ Safe with confirmation dialog

### **SQL Script Benefits:**
- ✅ Direct database access
- ✅ Can be customized
- ✅ Batch operation
- ✅ Verification queries included

---

## 🔍 Verification

After seeding, verify the companies were created:

### **In Super Admin Dashboard:**
```
Total Companies: 20+ (including any existing)
Active Companies: 20+ (all test companies are active)
```

### **In Supabase:**
```sql
-- Check companies
SELECT COUNT(*) FROM companies;

-- Check subscriptions
SELECT COUNT(*) FROM subscriptions WHERE status = 'active';

-- Check settings
SELECT COUNT(*) FROM settings;

-- Check features
SELECT COUNT(*) FROM feature_toggles WHERE is_enabled = true;
```

---

## ⚠️ Important Notes

1. **Development Only:**
   - This is for testing/development
   - Don't run on production without review

2. **Duplicate Prevention:**
   - The API checks for existing companies
   - SQL script may fail on duplicate NTN/STRN
   - This is expected behavior

3. **Data Cleanup:**
   - To remove test companies, delete from Supabase
   - Or use Super Admin dashboard to deactivate

4. **Pagination:**
   - With 20+ companies, pagination will be visible
   - Perfect for testing the pagination feature!

---

## 🎉 Success!

You now have 20 test companies to:
- ✅ Test pagination
- ✅ Test search and filters
- ✅ Test subscription management
- ✅ Test feature toggles
- ✅ Demo the platform
- ✅ Develop new features

**Enjoy testing your SaaS platform! 🚀**

---

## 💡 Tips

- **Test Pagination:** With 20 companies, you can see pagination in action (default: 10 per page)
- **Test Filters:** Try searching by city, province, or company name
- **Test Features:** Toggle features on/off for different companies
- **Test Subscriptions:** Update subscription dates and amounts
- **Create Users:** Add seller users to these companies for full testing

---

## 🆘 Troubleshooting

### **Companies Not Showing?**
- Check browser console for errors
- Verify API response in Network tab
- Check Supabase for data

### **Duplicate Errors?**
- Companies with same NTN/STRN already exist
- This is normal if you run the script twice
- Delete existing companies or modify NTN/STRN values

### **API Errors?**
- Check Supabase connection
- Verify environment variables
- Check API logs in terminal

---

**Happy Testing! 🎊**

