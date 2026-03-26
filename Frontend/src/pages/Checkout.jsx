import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Checkout.css';

const Checkout = () => {
    const { cartItems, cartTotalAmount, cartTotalItems, clearCart } = useCart();
    const { token, logout } = useAuth();
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        fullName: '',
        phoneNumber: '',
        addressLine: '',
        city: '',
        state: '',
        zipCode: '',
        paymentMethod: 'COD'
    });
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // If cart is empty, redirect back to cart
    if (cartItems.length === 0) {
        navigate('/cart');
        return null;
    }

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const orderPayload = {
                // Formatting data to match backend schema expectations
                items: cartItems.map(item => ({
                    productId: item.productId,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    imageUrl: item.imageUrl
                })),
                shippingAddress: {
                    fullName: formData.fullName,
                    phoneNumber: formData.phoneNumber,
                    addressLine: formData.addressLine,
                    city: formData.city,
                    state: formData.state,
                    zipCode: formData.zipCode
                },
                paymentMethod: formData.paymentMethod,
            };

            const response = await fetch('http://localhost:3000/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(orderPayload)
            });

            const data = await response.json();

            if (response.status === 401) {
                alert('Session expired, please login again');
                logout();
                navigate('/login');
                return;
            }

            if (data.success) {
                clearCart();
                navigate('/order-confirmation', { state: { orderId: data.data.order._id } });
            } else {
                throw new Error(data.error?.message || 'Failed to place order');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="checkout-page-container">
            <h1 className="checkout-title">Secured Checkout</h1>
            
            {error && <div className="checkout-error">{error}</div>}

            <div className="checkout-content">
                <form className="checkout-form-section" onSubmit={handleSubmit}>
                    <div className="form-section">
                        <h2>1. Delivery Information</h2>
                        
                        <div className="form-group">
                            <label>Full Name</label>
                            <input type="text" name="fullName" required value={formData.fullName} onChange={handleChange} placeholder="John Doe" />
                        </div>
                        
                        <div className="form-group">
                            <label>Phone Number</label>
                            <input type="tel" name="phoneNumber" required value={formData.phoneNumber} onChange={handleChange} placeholder="123-456-7890" />
                        </div>

                        <div className="form-row">
                            <div className="form-group half">
                                <label>Address Line</label>
                                <input type="text" name="addressLine" required value={formData.addressLine} onChange={handleChange} placeholder="123 Main St" />
                            </div>
                            <div className="form-group half">
                                <label>City</label>
                                <input type="text" name="city" required value={formData.city} onChange={handleChange} placeholder="New York" />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group half">
                                <label>State</label>
                                <input type="text" name="state" required value={formData.state} onChange={handleChange} placeholder="NY" />
                            </div>
                            <div className="form-group half">
                                <label>Zip Code</label>
                                <input type="text" name="zipCode" required value={formData.zipCode} onChange={handleChange} placeholder="10001" />
                            </div>
                        </div>
                    </div>

                    <div className="form-section">
                        <h2>2. Payment Method</h2>
                        <div className="payment-options">
                            <label className="payment-radio">
                                <input 
                                    type="radio" 
                                    name="paymentMethod" 
                                    value="COD" 
                                    checked={formData.paymentMethod === 'COD'} 
                                    onChange={handleChange}
                                />
                                <span>Cash on Delivery (COD)</span>
                            </label>
                            
                            <label className="payment-radio">
                                <input 
                                    type="radio" 
                                    name="paymentMethod" 
                                    value="Online" 
                                    checked={formData.paymentMethod === 'Online'} 
                                    onChange={handleChange}
                                />
                                <span>Credit Card / Online (Simulated)</span>
                            </label>
                        </div>
                    </div>

                    <button type="submit" className="place-order-btn" disabled={loading}>
                        {loading ? 'Processing...' : 'Place Order Now'}
                    </button>
                </form>

                <div className="checkout-summary-section">
                    <h2>Order Overview</h2>
                    <p className="summary-item-count">{cartTotalItems} items</p>
                    
                    <div className="checkout-items-list">
                        {cartItems.map(item => (
                            <div key={item.productId} className="checkout-item-mini">
                                <span className="item-name">{item.quantity}x {item.name}</span>
                                <span>${(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                        ))}
                    </div>

                    <div className="checkout-totals">
                        <div className="total-row">
                            <span>Subtotal</span>
                            <span>${cartTotalAmount.toFixed(2)}</span>
                        </div>
                        <div className="total-row">
                            <span>Shipping</span>
                            <span>$0.00 (Free)</span>
                        </div>
                        <div className="total-row grand-total">
                            <span>Total to Pay</span>
                            <span>${cartTotalAmount.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
