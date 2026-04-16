const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { protect } = require('../middleware/auth');

router.post('/create-checkout-session', protect, async (req, res) => {
  try {
    const { items } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, error: { message: 'Cart is empty' } });
    }

    const lineItems = items.map((item) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name,
          images: item.imageUrl ? [(item.imageUrl.startsWith('http') ? item.imageUrl : `https://walmart-ecommerce-mern.onrender.com${item.imageUrl}`)] : [],
        },
        unit_amount: Math.round(item.price * 100), // Stripe expects amounts in cents
      },
      quantity: item.quantity,
    }));

    // Detect if we are on localhost or production
    const CLIENT_URL = req.headers.origin || 'http://localhost:5173';

    // Create a Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${CLIENT_URL}/order-confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${CLIENT_URL}/checkout?payment_canceled=true`,
      customer_email: req.user.email || undefined,
    });

    res.status(200).json({
      success: true,
      url: session.url, // URL of the Stripe-hosted checkout page
    });
  } catch (error) {
    console.error('Stripe Checkout Error:', error);
    res.status(500).json({ success: false, error: { message: 'Failed to create Stripe checkout session' } });
  }
});

module.exports = router;
