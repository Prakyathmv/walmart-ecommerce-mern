/**
 * seed_all_products.js
 * Fetches all real Cloudinary URLs and seeds new Atlas DB with products
 * Run AFTER fixing Atlas DB user in Atlas dashboard:
 *   node seed_all_products.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const Product = require('./models/Product');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Known product data — we have 3 confirmed products with details
// Remaining images will be seeded as placeholder products you can edit in admin
const knownProducts = [
  {
    name: "Dr. Noyz Dog Toy with Squeaker, Frog (XS)",
    brand: "KONG",
    price: 3.46,
    category: "Toys & Games",
    status: "Active",
    stock: 100,
  },
  {
    name: "Pro Plan Sensitive Skin & Stomach Dry Dog Food (16 LB)",
    brand: "Purina Pro Plan",
    price: 54.48,
    category: "Grocery & Essentials",
    status: "Inactive",
    stock: 33,
  },
  {
    name: "Core Power Elite High Protein Shake (42g Protein) Chocolate",
    brand: "Fairlife",
    price: 69.99,
    category: "Health & Wellness",
    status: "Active",
    stock: 100,
  },
];

// Placeholder template for remaining images
function makePlaceholder(index, imageUrl) {
  return {
    name: `Product ${index + 1} — Edit Name in Admin`,
    brand: "Unknown Brand",
    price: 9.99,
    category: "Grocery & Essentials",
    status: "Active",
    stock: 100,
    imageUrl,
  };
}

async function seed() {
  // Step 1: Get all Cloudinary images
  console.log('☁️  Fetching all images from Cloudinary...');
  const result = await cloudinary.api.resources({
    type: 'upload',
    prefix: 'products/',
    max_results: 100,
  });

  const images = result.resources.map(r => r.secure_url);
  console.log(`📸 Found ${images.length} images in Cloudinary\n`);

  // Step 2: Build product list
  const products = images.map((imageUrl, i) => {
    if (knownProducts[i]) {
      return { ...knownProducts[i], imageUrl };
    }
    return makePlaceholder(i, imageUrl);
  });

  // Step 3: Connect to new Atlas
  console.log('🔌 Connecting to Atlas...');
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
  console.log('✅ Connected to Atlas!\n');

  // Step 4: Clear and insert
  await Product.deleteMany({});
  const inserted = await Product.insertMany(products);

  console.log(`🎉 Successfully seeded ${inserted.length} products:\n`);
  inserted.forEach(p => console.log(`  ✓ [${p.status}] ${p.name} — $${p.price}`));

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('\n❌ Seed failed:', err.message);
  if (err.message.includes('auth')) {
    console.log('\n👉 Fix steps:');
    console.log('   1. Go to cloud.mongodb.com');
    console.log('   2. Security → Database Access → Edit user prakyathm');
    console.log('   3. Set password to: Prakyath@2712');
    console.log('   4. Security → Network Access → Add 0.0.0.0/0');
    console.log('   5. Wait 30 seconds, then run this script again');
  }
  process.exit(1);
});
