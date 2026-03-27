const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a product name'],
      trim: true,
    },
    brand: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Please provide a product price'],
      min: [0, 'Price cannot be negative'],
    },
    category: {
      type: String,
      trim: true,
      index: true, 
    },
    imageUrl: {
      type: String,
      default: '',
    },
    stock: {
      type: Number,
      default: 100,
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'Out of Stock'],
      default: 'Active',
    }
  }
);


module.exports = mongoose.model('Product', productSchema);
