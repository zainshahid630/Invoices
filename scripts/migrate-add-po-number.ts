/**
 * Migration Script: Add PO Number to Invoices Table
 * 
 * Run this script once to add the po_number column to the invoices table
 * 
 * Usage:
 *   npx ts-node scripts/migrate-add-po-number.ts
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  console.log('🚀 Starting migration: Add PO Number to Invoices Table');
  
  try {
    // Run the migration query
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE invoices 
        ADD COLUMN IF NOT EXISTS po_number VARCHAR(100);
        
        COMMENT ON COLUMN invoices.po_number IS 'Purchase Order number reference';
      `
    });

    if (error) {
      console.error('❌ Migration failed:', error);
      process.exit(1);
    }

    console.log('✅ Migration completed successfully!');
    console.log('📋 Added column: po_number (VARCHAR(100))');
    
  } catch (error) {
    console.error('❌ Error running migration:', error);
    process.exit(1);
  }
}

runMigration();

