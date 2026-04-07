const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { Resend } = require('resend');
const { protect } = require('../middleware/auth');

const resend = new Resend(process.env.RESEND_API_KEY);




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

    // --- Send Order Confirmation Email via Resend ---
    try {
      const user = await User.findById(userId).select('email name');
      if (user && user.email) {
        const itemsHtml = verifiedItems.map(item => `
          <tr>
            <td style="padding:8px;border-bottom:1px solid #eee;">${item.name}</td>
            <td style="padding:8px;border-bottom:1px solid #eee;text-align:center;">${item.quantity}</td>
            <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">$${(item.price * item.quantity).toFixed(2)}</td>
          </tr>`).join('');

        await resend.emails.send({
          from: 'orders@yourdomain.com',
          to: user.email,
          subject: `Order Confirmed! #${savedOrder._id.toString().slice(-6).toUpperCase()}`,
          html: `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
              <h2 style="color:#0071ce;">🛒 Order Confirmed!</h2>
              <p>Hi <strong>${user.name || 'Valued Customer'}</strong>,</p>
              <p>Thank you for your order. Here's a summary:</p>

              <table style="width:100%;border-collapse:collapse;margin:20px 0;">
                <thead>
                  <tr style="background:#f5f5f5;">
                    <th style="padding:8px;text-align:left;">Product</th>
                    <th style="padding:8px;text-align:center;">Qty</th>
                    <th style="padding:8px;text-align:right;">Price</th>
                  </tr>
                </thead>
                <tbody>${itemsHtml}</tbody>
              </table>

              <p style="text-align:right;font-size:18px;">
                <strong>Total: $${calculatedTotal.toFixed(2)}</strong>
              </p>

              <hr style="border:none;border-top:1px solid #eee;margin:20px 0;"/>
              <p style="color:#666;font-size:13px;">
                <strong>Shipping to:</strong><br/>
                ${shippingAddress.street || ''}, ${shippingAddress.city || ''}, ${shippingAddress.zip || ''}
              </p>
              <p style="color:#999;font-size:12px;">Order ID: ${savedOrder._id}</p>
            </div>
          `
        });
      }
    } catch (emailError) {
      console.warn('Order confirmation email failed (non-critical):', emailError.message);
    }
    // --- End Email ---

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
