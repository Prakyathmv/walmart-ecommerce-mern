/**
 * migrate_old_to_new.js
 * Tries old Atlas → reads all products → inserts into new Atlas
 * Run: node migrate_old_to_new.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

// Try both possible DB names on old cluster
const OLD_URIS = [
  'mongodb+srv://walmart:walmart@cluster0.pk9fzg4.mongodb.net/walmart?retryWrites=true&w=majority',
  'mongodb+srv://walmart:walmart@cluster0.pk9fzg4.mongodb.net/test?retryWrites=true&w=majority',
];

const NEW_URI = process.env.MONGODB_URI;

async function tryOldCluster() {
  for (const uri of OLD_URIS) {
    try {
      console.log(`\n🔌 Trying: ${uri.split('@')[1]}`);
      const conn = await mongoose.createConnection(uri, { serverSelectionTimeoutMS: 5000 }).asPromise();
      const OldProduct = conn.model('Product', Product.schema);
      const products = await OldProduct.find({}).lean();
      console.log(`✅ Connected! Found ${products.length} products`);
      await conn.close();
      return products;
    } catch (e) {
      console.log(`❌ Failed: ${e.message}`);
    }
  }
  return null;
}

async function migrate() {
  const products = await tryOldCluster();

  if (!products || products.length === 0) {
    console.log('\n⚠️  Could not fetch from old cluster. Connecting to new Atlas to check status...');
    try {
      const conn = await mongoose.createConnection(NEW_URI, { serverSelectionTimeoutMS: 8000 }).asPromise();
      console.log('✅ New Atlas connected successfully!');
      const NewProduct = conn.model('Product', Product.schema);
      const count = await NewProduct.countDocuments();
      console.log(`📦 New Atlas currently has ${count} products`);
      await conn.close();
    } catch (e) {
      console.log(`❌ New Atlas also failed: ${e.message}`);
    }
    process.exit(0);
  }

  console.log('\n🔌 Connecting to NEW Atlas...');
  const newConn = await mongoose.createConnection(NEW_URI, { serverSelectionTimeoutMS: 8000 }).asPromise();
  const NewProduct = newConn.model('Product', Product.schema);

  console.log('📤 Inserting into new Atlas...');
  const cleaned = products.map(({ _id, __v, ...rest }) => rest);
  await NewProduct.insertMany(cleaned);
  console.log(`🎉 Migrated ${cleaned.length} products to new Atlas!`);

  await newConn.close();
  process.exit(0);
}

migrate().catch((err) => {
  console.error('❌ Fatal error:', err.message);
  process.exit(1);
});
