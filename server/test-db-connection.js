const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/product-db';

console.log('Connecting to:', MONGODB_URI);

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  console.log('✓ Successfully connected to MongoDB');
  
  // Try to list collections
  const collections = await mongoose.connection.db.listCollections().toArray();
  console.log('Existing collections:', collections.map(c => c.name));
  
  process.exit(0);
})
.catch((err) => {
  console.error('✗ MongoDB connection failed:', err.message);
  process.exit(1);
});
