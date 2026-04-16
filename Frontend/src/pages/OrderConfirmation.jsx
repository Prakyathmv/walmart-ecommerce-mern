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

    const handleDownloadInvoice = async () => {
        if (!orderId) return;
        try {
            const response = await fetch(`${API_BASE}/api/orders/${orderId}/invoice`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to generate invoice');
            }

            // Stream the blob bytes to browser memory
            const blob = await response.blob();
            
            // Create a fake hidden link to trigger the system download UI
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = `Walmart_Invoice_${orderId}.pdf`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            
            // Clean up browser RAM
            window.URL.revokeObjectURL(downloadUrl);

        } catch (error) {
            console.error('Error downloading invoice:', error);
            alert('Sorry, there was an issue downloading your receipt.');
        }
    };

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
                    <strong>{orderId || '# Processing'}</strong>
                </div>
                
                <div className="confirmation-actions" style={{ display: 'flex', flexDirection: 'column', gap: '15px', alignItems: 'center' }}>
                    {orderId && (
                        <button onClick={handleDownloadInvoice} style={{ background: '#2ea11b', color: 'white', padding: '12px 24px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: 'bold', width: '100%', maxWidth: '300px' }}>
                            <i className="fa-solid fa-file-pdf" style={{ marginRight: '8px' }}></i>
                            Download Official Receipt
                        </button>
                    )}
                    <Link to="/" className="btn-primary" style={{ width: '100%', maxWidth: '300px', boxSizing: 'border-box' }}>Continue Shopping</Link>
                </div>
            </div>
        </div>
    );
};

export default OrderConfirmation;
