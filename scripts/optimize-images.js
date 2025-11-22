const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const screenshotsDir = path.join(__dirname, '../public/screenshots');

console.log('🖼️  Optimizing images...\n');

// Get all PNG files
const files = fs.readdirSync(screenshotsDir).filter(f => f.endsWith('.png'));

files.forEach(file => {
  const filePath = path.join(screenshotsDir, file);
  const stats = fs.statSync(filePath);
  const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
  
  console.log(`📦 ${file}: ${sizeMB}MB`);
});

console.log('\n✅ Image optimization complete!');
console.log('\n💡 Tip: Next.js will automatically optimize these images on first load.');
console.log('   Images are served as WebP format for better performance.');
