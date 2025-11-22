import { createClient } from '@supabase/supabase-js';
import path from 'path';

// Load env vars
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkSuperAdmin() {
  console.log('Checking for super admin: admin@saas-invoice.com');

  const { data, error } = await supabase
    .from('super_admins')
    .select('*')
    .eq('email', 'admin@saas-invoice.com');

  if (error) {
    console.error('Error querying super_admins:', error);
    return;
  }

  if (!data || data.length === 0) {
    console.log('❌ Super admin NOT found.');
  } else {
    console.log('✅ Super admin FOUND.');
    console.log('User:', data[0]);

    // Check hash
    const expectedHash = '$2b$10$IPuE03fbK61cs2RmQqorJuVWDy.MdEmo0KiX0NUZ775RSPZha1GZ6';
    if (data[0].password_hash === expectedHash) {
      console.log('✅ Password hash matches default (SuperAdmin@123).');
    } else {
      console.log('⚠️ Password hash does NOT match default.');
      console.log('Current hash:', data[0].password_hash);
    }
  }
}

checkSuperAdmin();
