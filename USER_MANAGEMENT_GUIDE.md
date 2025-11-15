# User Management Guide

## 🎉 User Management Feature Complete!

The Super Admin can now manage users (sellers) for each company. These users can login to their company dashboard and manage their business operations.

---

## 🚀 Quick Access

### From Dashboard
1. Login as Super Admin
2. Go to Dashboard
3. Find a company in the table
4. Click **"Users"** link

### From Company Detail Page
1. Login as Super Admin
2. Go to a company detail page
3. Click the **"Manage Users"** card (👥 icon)

**Direct URL:** `/super-admin/companies/[companyId]/users`

---

## ✅ Features

### 1. View All Users
- See all users for a company
- View user details (name, email, role, status)
- See when users were created
- Empty state when no users exist

### 2. Add New User
- Click "Add New User" button
- Fill in user details:
  - **Email** (required, unique)
  - **Name** (required)
  - **Password** (required)
  - **Role** (User, Admin, Manager)
  - **Active Status** (checkbox)
- Passwords are automatically hashed with bcrypt
- Email uniqueness is validated

### 3. Edit User
- Click "Edit" on any user
- Update user details:
  - Name
  - Role
  - Active status
  - Password (optional - leave blank to keep current)
- Email cannot be changed (for security)

### 4. Activate/Deactivate User
- Click "Activate" or "Deactivate" button
- Instantly toggle user access
- Inactive users cannot login
- Visual status badge (Green = Active, Red = Inactive)

### 5. Delete User
- Click "Delete" button
- Confirmation dialog appears
- Permanently removes user
- Use with caution!

---

## 👥 User Roles

### User
- Basic access level
- Can perform standard operations
- Limited permissions

### Manager
- Mid-level access
- Can manage certain aspects
- More permissions than User

### Admin
- Full access to company features
- Can manage all aspects
- Highest permission level (within company)

**Note:** All roles are scoped to their company only. They cannot access other companies' data.

---

## 🔐 Security Features

### Password Security
- Passwords are hashed using bcrypt (10 salt rounds)
- Never stored in plain text
- Cannot be retrieved (only reset)

### Email Uniqueness
- Each email can only be used once
- System-wide validation
- Prevents duplicate accounts

### Company Isolation
- Users can only access their own company data
- Complete data segregation
- Multi-tenant security

### Active Status
- Inactive users cannot login
- Instant access control
- No need to delete users

---

## 📋 User Management Workflow

### Creating a New Company User

1. **Navigate to User Management**
   - Dashboard → Click "Users" for a company
   - OR Company Detail → Click "Manage Users"

2. **Add User**
   - Click "Add New User"
   - Fill in the form:
     ```
     Email: john@company.com
     Name: John Doe
     Password: SecurePassword123!
     Role: User
     Active: ✓ (checked)
     ```

3. **Submit**
   - Click "Create User"
   - Success message appears
   - User appears in the table
   - User can now login

### Editing a User

1. **Find User**
   - Locate user in the table

2. **Click Edit**
   - Edit button opens the form
   - Email field is disabled (cannot change)
   - Other fields are editable

3. **Update Details**
   - Change name, role, or status
   - Optionally change password
   - Leave password blank to keep current

4. **Save**
   - Click "Update User"
   - Changes are saved
   - User sees updated info

### Deactivating a User

1. **Find User**
   - Locate user in the table

2. **Click Deactivate**
   - Status changes to "Inactive"
   - User cannot login anymore
   - Data is preserved

3. **Reactivate Later**
   - Click "Activate" to restore access
   - User can login again

---

## 🎯 Use Cases

### Scenario 1: New Employee
```
1. Super Admin creates company user
2. Sets role to "User"
3. Provides credentials to employee
4. Employee logs in to seller dashboard
5. Employee manages inventory, customers, invoices
```

### Scenario 2: Promote to Manager
```
1. Super Admin finds user
2. Clicks "Edit"
3. Changes role from "User" to "Manager"
4. Saves changes
5. User now has manager permissions
```

### Scenario 3: Employee Leaves
```
Option A (Recommended):
1. Super Admin deactivates user
2. User cannot login
3. Data/history preserved

Option B:
1. Super Admin deletes user
2. User permanently removed
3. Use only if necessary
```

### Scenario 4: Password Reset
```
1. User forgets password
2. Super Admin edits user
3. Enters new password
4. Saves changes
5. Provides new password to user
```

---

## 📊 User Table Columns

| Column | Description |
|--------|-------------|
| **Name** | User's full name |
| **Email** | Login email (unique) |
| **Role** | User, Manager, or Admin |
| **Status** | Active (green) or Inactive (red) |
| **Created** | When user was added |
| **Actions** | Edit, Activate/Deactivate, Delete |

---

## 🔗 API Endpoints

### List Users
```
GET /api/super-admin/companies/[companyId]/users
Response: Array of users (without password hashes)
```

### Create User
```
POST /api/super-admin/companies/[companyId]/users
Body: { email, name, password, role, is_active }
Response: Created user (without password hash)
```

### Get Single User
```
GET /api/super-admin/companies/[companyId]/users/[userId]
Response: User details (without password hash)
```

### Update User
```
PATCH /api/super-admin/companies/[companyId]/users/[userId]
Body: { name?, role?, is_active?, password? }
Response: Updated user (without password hash)
```

### Delete User
```
DELETE /api/super-admin/companies/[companyId]/users/[userId]
Response: { message: "User deleted successfully" }
```

---

## 📁 Files Created

### Pages
- `app/super-admin/companies/[id]/users/page.tsx` - User management UI

### API Routes
- `app/api/super-admin/companies/[id]/users/route.ts` - List & Create
- `app/api/super-admin/companies/[id]/users/[userId]/route.ts` - Get, Update, Delete

### Updated Files
- `app/super-admin/dashboard/page.tsx` - Added "Users" link
- `app/super-admin/companies/[id]/page.tsx` - Already had "Manage Users" card

---

## ✅ Testing Checklist

### Create User
- [ ] Create user with all fields
- [ ] Create user with minimal fields
- [ ] Try duplicate email (should fail)
- [ ] Try without required fields (should fail)
- [ ] Verify password is hashed in database

### Edit User
- [ ] Update name
- [ ] Change role
- [ ] Change password
- [ ] Leave password blank (should keep current)
- [ ] Try to change email (should be disabled)

### Activate/Deactivate
- [ ] Deactivate active user
- [ ] Activate inactive user
- [ ] Verify status badge changes
- [ ] Verify inactive user cannot login

### Delete User
- [ ] Delete user
- [ ] Confirm deletion dialog appears
- [ ] Verify user is removed from table
- [ ] Verify user is removed from database

---

## 🎨 UI Features

### Modern Design
- Clean table layout
- Color-coded status badges
- Responsive design
- Mobile-friendly

### User Feedback
- Success messages (green)
- Error messages (red)
- Loading states
- Confirmation dialogs

### Form Validation
- Required field indicators
- Email format validation
- Password requirements
- Role selection dropdown

---

## 🔄 Next Steps

After creating users, they can:

1. **Login to Seller Dashboard** (Phase 4 - Coming Soon)
   - Use their email and password
   - Access their company's data only
   - Manage inventory, customers, invoices

2. **Perform Role-Based Actions**
   - Users: Basic operations
   - Managers: Advanced operations
   - Admins: Full company access

3. **Collaborate with Team**
   - Multiple users per company
   - Shared data access
   - Team collaboration

---

## 💡 Best Practices

### User Creation
1. Use strong passwords
2. Assign appropriate roles
3. Verify email addresses
4. Document user responsibilities

### User Management
1. Deactivate instead of delete (preserves history)
2. Regular access reviews
3. Update roles as needed
4. Monitor user activity

### Security
1. Change default passwords
2. Use unique passwords per user
3. Deactivate unused accounts
4. Regular password updates

---

## 🐛 Troubleshooting

### User Not Appearing
**Check:**
- Refresh the page
- Check browser console for errors
- Verify API response

### Cannot Create User
**Common Issues:**
- Email already exists
- Missing required fields
- Invalid email format
- Database connection error

### Cannot Login (User)
**Check:**
- User is active (not deactivated)
- Correct email and password
- Company is active
- Seller login is implemented (Phase 4)

---

## 🎉 Summary

**User Management is Complete!**

You can now:
- ✅ Create users for companies
- ✅ Edit user details
- ✅ Assign roles (User, Manager, Admin)
- ✅ Activate/Deactivate users
- ✅ Delete users
- ✅ Secure password management
- ✅ Company-scoped access

**Next:** Build the Seller Login & Dashboard (Phase 4) so these users can actually login and use the system!

---

**Happy User Managing!** 🚀

