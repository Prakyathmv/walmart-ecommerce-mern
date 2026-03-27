const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

const MONGODB_URI = 'mongodb://127.0.0.1:27017/product-db';
const uploadsDir = path.join(__dirname, 'uploads');
const imgSrc = path.join(__dirname, '../Frontend/src/assets/product images');


const nameToImage = [
  { match: 'Nutricost Whey Protein', img: 'image-5.jpg' },
  { match: 'Gatorade', img: 'image-6.jpg' },
  { match: 'Dr. Noyz', img: 'image-7.jpg' },
  { match: 'Pro Plan Sensitive', img: 'image-8.jpg' },
  { match: 'Core Power Elite', img: 'image-10.jpg' },
  { match: 'V8 Deliciously Green', img: 'image-2.jpg' },
];


const duplicateIds = [
  '69b302aec5d723398610d67a', 
  '69b302bdc5d723398610d67e', 
];

const Product = require('./models/Product');

async function run() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  
  for (const id of duplicateIds) {
    try {
      const result = await Product.findByIdAndDelete(id);
      if (result) {
        console.log(`Deleted duplicate: ${result.name}`);
      }
    } catch (e) { console.log(`Could not delete ${id}: ${e.message}`); }
  }

  
  const products = await Product.find({ $or: [{ imageUrl: '' }, { imageUrl: null }, { imageUrl: { $exists: false } }] });
  console.log(`Found ${products.length} products without images`);

  for (const product of products) {
    const mapping = nameToImage.find(m => product.name.includes(m.match));
    if (!mapping) {
      console.log(`No image mapping found for: "${product.name}" - skipping`);
      continue;
    }

    const srcPath = path.join(imgSrc, mapping.img);
    if (!fs.existsSync(srcPath)) {
      console.log(`Source image not found: ${srcPath}`);
      continue;
    }

    const destFileName = `product-image-${Date.now()}-${Math.round(Math.random() * 1e6)}.jpg`;
    const destPath = path.join(uploadsDir, destFileName);

    fs.copyFileSync(srcPath, destPath);
    product.imageUrl = `/uploads/${destFileName}`;
    await product.save();
    console.log(`SUCCESS: Updated "${product.name}" => ${product.imageUrl}`);
  }

  await mongoose.disconnect();
  console.log('\nAll done!');
}

run().catch(err => {
  console.error('FATAL:', err.message);
  process.exit(1);
});
