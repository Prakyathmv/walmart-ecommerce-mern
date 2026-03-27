const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb://127.0.0.1:27017/product-db';
const Product = require('./models/Product');

async function run() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    
    const result = await Product.updateMany(
      {
        $or: [
          { stock: { $lte: 0 } },
          { stock: null },
          { stock: { $exists: false } },
          { status: 'Out of Stock' }
        ]
      },
      {
        $set: { stock: 100, status: 'Active' }
      }
    );

    console.log(`Successfully updated ${result.modifiedCount} products out of stock.`);
  } catch (error) {
    console.error('Error updating products:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
}

run();
