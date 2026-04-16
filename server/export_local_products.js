/**
 * export_local_products.js
 * Exports all products from local MongoDB and imports into Atlas
 * Run: node export_local_products.js
 */

const mongoose = require('mongoose');
const Product = require('./models/Product');
const fs = require('fs');

const LOCAL_URI = 'mongodb://localhost:27017/Walmart';

async function exportLocal() {
  console.log('🔌 Connecting to local MongoDB...');
  await mongoose.connect(LOCAL_URI);
  console.log('✅ Connected to local DB!');

  const products = await Product.find({}).lean();
  console.log(`📦 Found ${products.length} products`);

  // Save to JSON file
  fs.writeFileSync('./local_products_backup.json', JSON.stringify(products, null, 2));
  console.log('💾 Saved to local_products_backup.json');

  await mongoose.disconnect();
  process.exit(0);
}

exportLocal().catch((err) => {
  console.error('❌ Failed:', err.message);
  process.exit(1);
});
