// Generate bcrypt password hash
// Run with: node scripts/generate-password-hash.js

const bcrypt = require('bcryptjs');

const password = 'SuperAdmin@123';

bcrypt.hash(password, 10, (err, hash) => {
  if (err) {
    console.error('Error generating hash:', err);
    return;
  }
  
  console.log('\n===========================================');
  console.log('Password Hash Generated Successfully!');
  console.log('===========================================\n');
  console.log('Password:', password);
  console.log('Hash:', hash);
  console.log('\n===========================================');
  console.log('SQL to insert super admin:');
  console.log('===========================================\n');
  console.log(`INSERT INTO super_admins (email, password_hash, name) 
VALUES (
  'admin@saas-invoice.com',
  '${hash}',
  'Super Administrator'
)
ON CONFLICT (email) DO NOTHING;`);
  console.log('\n===========================================\n');
});

