/**
 * seed_products.js
 * Fetches real image URLs from Cloudinary and inserts products into new Atlas DB
 * Run: node seed_products.js
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

// Product data — imageUrl will be matched from Cloudinary by order
const products = [
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

async function seed() {
  // Step 1: Get all cloudinary image URLs
  console.log('☁️  Fetching images from Cloudinary...');
  const result = await cloudinary.api.resources({
    type: 'upload',
    prefix: 'products/',
    max_results: 100,
  });

  const images = result.resources.map(r => r.secure_url);
  console.log(`📸 Found ${images.length} images in Cloudinary`);
  images.forEach((url, i) => console.log(`  [${i}] ${url}`));

  // Step 2: Assign images to products (by index order)
  const productsWithImages = products.map((p, i) => ({
    ...p,
    imageUrl: images[i] || '',
  }));

  // Step 3: Connect to new Atlas DB
  console.log('\n🔌 Connecting to Atlas...');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected!');

  // Step 4: Insert
  console.log('📦 Inserting products...');
  await Product.deleteMany({});
  const inserted = await Product.insertMany(productsWithImages);

  console.log(`\n🎉 Inserted ${inserted.length} products:`);
  inserted.forEach(p => console.log(`  ✓ ${p.name} → ${p.imageUrl}`));

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
