import React, { useState } from 'react';
import './FeedbackModal.css';

const FeedbackModal = ({ isOpen, onClose }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [category, setCategory] = useState('');
  const [comments, setComments] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // In production, we'd use process.env.VITE_API_URL. Using /api for relative Render proxy routing locally.
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  if (!isOpen) return null;

  const categories = [
    'Website Experience', 'Recent Order',
    'In-Store Experience', 'Customer Service',
    'Delivery/Pickup Options', 'Other'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE}/api/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, category, comments })
      });
      if (response.ok) {
        setSubmitted(true);
        setTimeout(() => {
          onClose();
          setSubmitted(false);
          setRating(0);
          setCategory('');
          setComments('');
        }, 2000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const renderStars = () => {
    return [1, 2, 3, 4, 5].map((star) => (
      <i
        key={star}
        className={`fa-solid fa-star ${star <= (hoverRating || rating) ? 'active' : ''} ${rating === star ? 'selected-star' : ''}`}
        onMouseEnter={() => setHoverRating(star)}
        onMouseLeave={() => setHoverRating(0)}
        onClick={() => setRating(star)}
      ></i>
    ));
  };

  return (
    <div className="feedback-overlay">
      <div className="feedback-modal">
        <button className="feedback-close" onClick={onClose}>
          <i className="fa-solid fa-xmark"></i>
        </button>

        {submitted ? (
          <div className="feedback-success">
            <h2>Thank you!</h2>
            <p>Your feedback has been securely transmitted to Walmart support.</p>
          </div>
        ) : (
          <>
            <div className="feedback-header-box">
                <h2 className="feedback-title">Your feedback matters! Help us improve the Walmart website</h2>
                
                <div className={`feedback-stars rating-${rating}`}>
                {renderStars()}
                </div>
                
                {rating > 0 && <div className="feedback-rating-tip-container"><div className="feedback-rating-tip"></div><span className="feedback-rating-text">{rating <= 3 ? 'Fair' : 'Good'}</span></div>}
            </div>

            {rating > 0 && (
              <div className="feedback-form-container">
                <p className="feedback-prompt">{rating <= 3 ? "Sorry to hear it. What was the problem?" : "Glad to hear it. What did you love?"}</p>
                
                <div className="feedback-categories">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      className={`category-pill ${category === cat ? 'active' : ''}`}
                      onClick={() => setCategory(cat)}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="feedback-textarea-wrapper">
                  <textarea
                    placeholder="Please tell us more (Max 300 characters)"
                    maxLength={300}
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                  ></textarea>
                  <span className="char-count">{comments.length} / 300</span>
                </div>
              </div>
            )}

            <button 
              className="share-btn" 
              disabled={rating === 0 || category === ''}
              onClick={handleSubmit}
            >
              Share with Walmart
            </button>

            <p className="feedback-footer">
              Questions or concerns? We are here to help. Visit the <a href="#">Help Center.</a>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default FeedbackModal;
