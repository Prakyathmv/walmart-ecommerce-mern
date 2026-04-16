/**
 * migrate_products.js
 * Copies all products from old Atlas cluster → new Atlas cluster
 * Run: node migrate_products.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

const OLD_URI = 'mongodb+srv://walmart:walmart@cluster0.pk9fzg4.mongodb.net/?retryWrites=true&w=majority&authSource=admin';
const NEW_URI = process.env.MONGODB_URI; // new Atlas from .env

async function migrate() {
  console.log('🔌 Connecting to OLD Atlas cluster...');
  const oldConn = await mongoose.createConnection(OLD_URI).asPromise();
  const OldProduct = oldConn.model('Product', Product.schema);

  console.log('🔌 Connecting to NEW Atlas cluster...');
  const newConn = await mongoose.createConnection(NEW_URI).asPromise();
  const NewProduct = newConn.model('Product', Product.schema);

  console.log('📦 Fetching products from old cluster...');
  const products = await OldProduct.find({}).lean();
  console.log(`✅ Found ${products.length} products`);

  if (products.length === 0) {
    console.log('⚠️  No products found in old cluster. Exiting.');
    process.exit(0);
  }

  // Remove _id so MongoDB generates new ones (or keep them — comment line below to keep original IDs)
  const cleaned = products.map(({ _id, __v, ...rest }) => rest);

  console.log('📤 Inserting into new cluster...');
  await NewProduct.insertMany(cleaned);
  console.log(`🎉 Successfully migrated ${cleaned.length} products!`);

  await oldConn.close();
  await newConn.close();
  process.exit(0);
}

migrate().catch((err) => {
  console.error('❌ Migration failed:', err.message);
  process.exit(1);
});
