-- ============================================
-- CREATE SUPER ADMIN ACCOUNT
-- ============================================
-- This creates a super admin account for login
-- 
-- Credentials:
-- Email: admin@saas-invoice.com
-- Password: SuperAdmin@123
-- 
-- ⚠️ IMPORTANT: Change this password after first login!
-- ============================================

-- Insert Super Admin
-- Password hash for: SuperAdmin@123
-- Generated using bcrypt with salt rounds = 10
INSERT INTO super_admins (email, password_hash, name)
VALUES (
  'admin@saas-invoice.com',
  '$2b$10$IPuE03fbK61cs2RmQqorJuVWDy.MdEmo0KiX0NUZ775RSPZha1GZ6',
  'Super Administrator'
)
ON CONFLICT (email) DO NOTHING;

-- Verify the super admin was created
SELECT 
  id,
  email,
  name,
  created_at
FROM super_admins
WHERE email = 'admin@saas-invoice.com';

-- ============================================
-- USAGE INSTRUCTIONS
-- ============================================
-- 
-- 1. Run this SQL in Supabase SQL Editor
-- 2. Go to: http://localhost:3000/super-admin/login
-- 3. Login with:
--    Email: admin@saas-invoice.com
--    Password: SuperAdmin@123
-- 
-- 4. After login, you can:
--    - Create companies
--    - Manage subscriptions
--    - Toggle features
--    - Manage users
-- 
-- ⚠️ SECURITY NOTE:
-- This is a default password for initial setup.
-- You should change it immediately after first login!
-- 
-- ============================================

