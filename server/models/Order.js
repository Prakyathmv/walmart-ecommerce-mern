const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1']
  },
  imageUrl: {
    type: String
  }
});

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      
    },
    items: [orderItemSchema],
    totalPrice: {
      type: Number,
      required: true
    },
    shippingAddress: {
      fullName: { type: String, required: true },
      addressLine: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String, required: true },
      phoneNumber: { type: String, required: true }
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ['COD', 'Online'],
      default: 'COD'
    },
    status: {
      type: String,
      required: true,
      enum: ['Placed', 'Processing', 'Out for Delivery', 'Delivered', 'Cancelled'],
      default: 'Placed'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
