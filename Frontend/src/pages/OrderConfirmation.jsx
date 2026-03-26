import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './OrderConfirmation.css';

const OrderConfirmation = () => {
    const location = useLocation();
    const orderId = location.state?.orderId || 'Unknown Order';

    return (
        <div className="order-confirmation-container">
            <div className="confirmation-card">
                <div className="success-icon">
                    <i className="fa-solid fa-circle-check"></i>
                </div>
                <h1>Order Placed Successfully!</h1>
                <p className="confirmation-message">
                    Thank you for shopping with us. Your order has been securely placed and is now being processed.
                </p>
                <div className="order-details-box">
                    <span>Order ID:</span>
                    <strong>{orderId}</strong>
                </div>
                
                <div className="confirmation-actions">
                    <Link to="/" className="btn-primary">Continue Shopping</Link>
                </div>
            </div>
        </div>
    );
};

export default OrderConfirmation;
