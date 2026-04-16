const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Allow guest feedback
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: 1,
    max: 5
  },
  category: {
    type: String,
    required: [true, 'Category is required']
  },
  comments: {
    type: String,
    maxLength: [300, 'Comments cannot exceed 300 characters']
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Feedback', feedbackSchema);
