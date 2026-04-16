require('dotenv').config();
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');
const Product = require('./models/Product');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadImage = async (filePath) => {
  const result = await cloudinary.uploader.upload(filePath, { folder: 'walmart-products' });
  return result.secure_url;
};

const products = [
  { name: "Sports Research Vitamin D3 + K2 with 5000iu of Plant-Based D3", price: 15.72, brand: "Sports Research", category: "Health & Wellness", stock: 100, description: "Supports bone and immune health." },
  { name: "Marvis Toothpaste Jasmin Mint 4.5 oz", price: 11.73, brand: "Marvis", category: "Beauty & Personal Care", stock: 100, description: "Luxury toothpaste from Italy." },
  { name: "Matrix Biolage Anti-Dandruff Scalp Sync Shampoo - 33.8 oz", price: 40.99, brand: "Matrix", category: "Beauty & Personal Care", stock: 50, description: "Anti-Dandruff shampoo deeply cleanses." },
  { name: "KONG Dr.Noyz Dog Toy with Squeaker, Frog, XS", price: 3.46, brand: "KONG", category: "Pets", stock: 200, description: "Fun, squeaky dog toy for active pets." },
  { name: "Viking Revolution - Sea Salt Spray for Hair Men", price: 18.88, brand: "Viking Revolution", category: "Beauty & Personal Care", stock: 100, description: "Get the perfect beach waves and texture." }
];

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/product-db';

const seed = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    const dir = 'C:/Users/Prakyath/Downloads/downloaded-images';
    const files = fs.readdirSync(dir).filter(f => f.match(/\.(jpg|jpeg|png|webp)$/i)).slice(0, 5);

    for (let i = 0; i < 5; i++) {
      const p = products[i];
      const file = path.join(dir, files[i]);
      console.log(`Uploading ${file} for ${p.name}...`);
      const imageUrl = await uploadImage(file);
      console.log(`Uploaded: ${imageUrl}`);

      const newProduct = new Product({
        ...p,
        imageUrl
      });
      await newProduct.save();
      console.log(`Inserted product: ${p.name}`);
    }
    console.log("Done!");
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
seed();
