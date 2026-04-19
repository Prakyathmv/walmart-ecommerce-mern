const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('./models/Product');

const departments = [
  'Grocery & Essentials',
  'Electronics',
  'Home & Garden',
  'Clothing & Apparel',
  'Sports & Outdoors',
  'Toys & Games',
  'Health & Wellness',
  'Baby & Toddler',
  'Automotive',
  'Beauty & Personal Care'
];

async function seedDepartments() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB...');

    const products = await Product.find({});
    console.log(`Found ${products.length} products. Updating departments...`);

    for (let i = 0; i < products.length; i++) {
      // Assign a random department for demo purposes
      const randomDept = departments[Math.floor(Math.random() * departments.length)];
      products[i].department = randomDept;
      await products[i].save();
    }

    console.log('Successfully updated all products with random departments!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding departments:', error);
    process.exit(1);
  }
}

seedDepartments();
