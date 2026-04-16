const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');

// @desc    Submit new feedback
// @route   POST /api/feedback
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { rating, category, comments, userId } = req.body;

    // Validate lengths explicitly on server-side
    if (comments && comments.length > 300) {
      return res.status(400).json({ success: false, error: 'Comments strictly limited to 300 characters' });
    }

    const feedback = new Feedback({
      rating,
      category,
      comments,
      user: userId || undefined
    });

    await feedback.save();

    res.status(201).json({ success: true, data: feedback });
  } catch (error) {
    console.error('Feedback Submit Error:', error);
    res.status(500).json({ success: false, error: 'Server error saving feedback' });
  }
});

module.exports = router;
