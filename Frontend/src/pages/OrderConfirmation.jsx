import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import API_BASE from '../utils/api';
import './OrderConfirmation.css';

const OrderConfirmation = () => {
    const location = useLocation();
    const { clearCart } = useCart();
    const { token } = useAuth();
    
    const queryParams = new URLSearchParams(location.search);
    const sessionId = queryParams.get('session_id');

    const [orderId, setOrderId] = useState(location.state?.orderId || null);
    const [loading, setLoading] = useState(Boolean(sessionId && !location.state?.orderId));

    useEffect(() => {
        const finalizeStripeOrder = async () => {
            if (sessionId) {
                const pendingOrderStr = localStorage.getItem('pendingStripeOrder');
                if (pendingOrderStr) {
                    try {
                        const orderPayload = JSON.parse(pendingOrderStr);
                        orderPayload.paymentMethod = 'Online';

                        const response = await fetch(`${API_BASE}/api/orders`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`
                            },
                            body: JSON.stringify(orderPayload)
                        });

                        const data = await response.json();
                        if (data.success) {
                            setOrderId(data.data.order._id);
                            clearCart();
                            localStorage.removeItem('pendingStripeOrder');
                        }
                    } catch (error) {
                        console.error("Error finalizing stripe order:", error);
                    }
                }
                setLoading(false);
            }
        };

        finalizeStripeOrder();
    }, [sessionId, clearCart, token]);

    if (loading) {
        return (
            <div className="order-confirmation-container">
                <div style={{ textAlign: 'center', marginTop: '100px' }}>
                    <h2>Finalizing your secure Stripe payment...</h2>
                    <p>Please do not close this window.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="order-confirmation-container">
            <div className="confirmation-card">
                <div className="success-icon">
                    <i className="fa-solid fa-circle-check"></i>
                </div>
                <h1>Order Placed Successfully!</h1>
                <p className="confirmation-message">
                    Thank you for shopping with us. Your order has been securely placed and is now being processed.
                    A confirmation email with your official receipt has been sent to your registered email address.
                </p>
                <div className="order-details-box">
                    <span>Order ID:</span>
                    <strong>{orderId || '# Processing'}</strong>
                </div>
                
                <div className="confirmation-actions" style={{ display: 'flex', flexDirection: 'column', gap: '15px', alignItems: 'center' }}>
                    <Link to="/" className="btn-primary" style={{ width: '100%', maxWidth: '300px', boxSizing: 'border-box' }}>Continue Shopping</Link>
                </div>
            </div>
        </div>
    );
};

export default OrderConfirmation;
