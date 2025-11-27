# Database Migrations

This directory contains SQL migration files for database schema changes.

## How to Apply Migrations

### Using Supabase Dashboard (Recommended)
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of the migration file
4. Paste and execute the SQL

### Using psql Command Line
```bash
psql -h <your-supabase-host> -U postgres -d postgres -f database/migrations/add-sale-type-to-invoice-items.sql
```

## Migration Files

### add-sale-type-to-invoice-items.sql
**Date:** 2024-11-24  
**Description:** Adds `sale_type` column to `invoice_items` table to store FBR transaction type for each item.

**Changes:**
- Adds `sale_type VARCHAR(255)` column with default value 'Goods at standard rate (default)'
- Updates existing records to have the default sale_type
- Adds column comment for documentation

**Rollback (if needed):**
```sql
ALTER TABLE invoice_items DROP COLUMN IF EXISTS sale_type;
```

## Notes
- Always backup your database before running migrations
- Test migrations in a development environment first
- Migrations are designed to be safe with `IF NOT EXISTS` and `IF EXISTS` clauses
