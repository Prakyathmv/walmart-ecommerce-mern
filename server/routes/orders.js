const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');



router.post('/', protect, async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod } = req.body;
    const userId = req.user.id;

    if (!userId) {
      return res.status(401).json({ success: false, error: { message: 'Unauthorized. Valid user ID required.' } });
    }

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, error: { message: 'No order items' } });
    }

    
    let calculatedTotal = 0;
    const verifiedItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ success: false, error: { message: `Product not found: ${item.name}` } });
      }

      
      if (product.stock < item.quantity) {
        return res.status(400).json({ success: false, error: { message: `Insufficient stock for ${product.name}` } });
      }

      
      verifiedItems.push({
        productId: product._id,
        name: product.name,
        price: product.price, 
        quantity: item.quantity,
        imageUrl: product.imageUrl
      });

      calculatedTotal += (product.price * item.quantity);

      
      
      
    }

    const order = new Order({
      userId: userId || null, 
      items: verifiedItems,
      shippingAddress,
      paymentMethod,
      totalPrice: calculatedTotal
    });

    const savedOrder = await order.save();

    res.status(201).json({
      success: true,
      data: {
        order: savedOrder
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Error creating order: ' + error.message,
      },
    });
  }
});




router.get('/myorders', async (req, res) => {
  try {
    const { userId } = req.query; 

    if (!userId) {
      return res.status(401).json({ success: false, error: { message: 'Not authorized' } });
    }

    const orders = await Order.find({ userId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: { orders }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Error fetching orders',
      },
    });
  }
});


router.get('/', async (req, res) => {
  try {
    const orders = await Order.find({}).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: { orders }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: 'Error fetching all orders' } });
  }
});


router.put('/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );
    if (!order) return res.status(404).json({ success: false, error: { message: 'Order not found' } });
    res.status(200).json({ success: true, data: { order } });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: 'Error updating order' } });
  }
});


router.delete('/:id', async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ success: false, error: { message: 'Order not found' } });
    res.status(200).json({ success: true, message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: 'Error deleting order' } });
  }
});

module.exports = router;
