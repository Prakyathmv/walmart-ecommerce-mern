require('dotenv').config();
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');
const Product = require('./models/Product');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/product-db';

async function uploadToCloudinary(filePath, folder = 'products') {
  try {
    const result = await cloudinary.uploader.upload(filePath, { folder });
    return result.secure_url;
  } catch (error) {
    console.error(`Error uploading ${filePath} to Cloudinary:`, error);
    return null;
  }
}

async function migrateBackendImages() {
  console.log('\n--- Migrating Backend Product Images ---');
  const products = await Product.find({ imageUrl: { $regex: '^/uploads/' } });

  if (products.length === 0) {
    console.log('No backend products found with local images to migrate (or they are already migrated).');
    return;
  }

  console.log(`Found ${products.length} products to migrate...`);

  for (const product of products) {
    const localFilePath = path.join(__dirname, product.imageUrl);

    if (!fs.existsSync(localFilePath)) {
      console.warn(`[WARNING] File not found locally: ${localFilePath}`);
      continue;
    }

    console.log(`Uploading ${product.imageUrl}...`);
    const newUrl = await uploadToCloudinary(localFilePath, 'products');

    if (newUrl) {
      product.imageUrl = newUrl;
      await product.save();
      console.log(`  -> Successfully updated to: ${newUrl}`);
    }
  }
}

async function migrateFrontendAssets() {
  console.log('\n--- Migrating Frontend Dist Assets ---');
  const frontendAssetDir = path.join(__dirname, '..', 'Frontend', 'dist', 'assets');

  if (!fs.existsSync(frontendAssetDir)) {
    console.warn(`[WARNING] Frontend assets directory not found at: ${frontendAssetDir}`);
    return;
  }

  const files = fs.readdirSync(frontendAssetDir);
  const imageFiles = files.filter(file =>
    /\.(jpg|jpeg|png|svg|gif|webp)$/i.test(file) // match image extensions
  );

  if (imageFiles.length === 0) {
    console.log('No image files found in frontend dist/assets.');
    return;
  }

  console.log(`Found ${imageFiles.length} image files to migrate...`);
  const cloudinaryUrls = {};

  for (const file of imageFiles) {
    const localFilePath = path.join(frontendAssetDir, file);
    console.log(`Uploading ${file}...`);
    const newUrl = await uploadToCloudinary(localFilePath, 'frontend_assets');

    if (newUrl) {
      cloudinaryUrls[file] = newUrl;
      console.log(`  -> URL: ${newUrl}`);
    }
  }

  const outputJsonPath = path.join(__dirname, '..', 'Frontend', 'frontend_cloudinary_urls.json');
  fs.writeFileSync(outputJsonPath, JSON.stringify(cloudinaryUrls, null, 2));
  console.log(`\nSuccessfully wrote frontend URLs map to ${outputJsonPath}`);
}

async function runMigration() {
  try {
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      throw new Error('Cloudinary credentials missing from .env');
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB.');

    await migrateBackendImages();
    await migrateFrontendAssets();

    console.log('\nMigration script finished executing!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
}

runMigration();
