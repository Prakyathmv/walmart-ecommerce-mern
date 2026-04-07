import React from 'react';
import { useCart } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import './Cart.css';
import API_BASE from '../utils/api';

const Cart = () => {
    const { cartItems, cartTotalAmount, cartTotalItems, updateQuantity, removeFromCart } = useCart();
    const navigate = useNavigate();

    if (cartItems.length === 0) {
        return (
            <div className="cart-empty-container">
                <h2>Your cart is empty</h2>
                <p>Check out our featured products to find what you need.</p>
                <Link to="/" className="continue-shopping-btn">Start Shopping</Link>
            </div>
        );
    }

    return (
        <div className="cart-page-container">
            <h1 className="cart-title">Cart ({cartTotalItems} items)</h1>
            
            <div className="cart-content">
                <div className="cart-items-section">
                    {cartItems.map((item) => (
                        <div key={item.productId} className="cart-item-card">
                            <div className="cart-item-image">
                                {item.imageUrl ? (
                                    <img src={(item.imageUrl && item.imageUrl.startsWith('http') ? item.imageUrl : `${API_BASE}${item.imageUrl}`)} alt={item.name} />
                                ) : (
                                    <div className="cart-no-image">No Image</div>
                                )}
                            </div>
                            
                            <div className="cart-item-details">
                                <h3 className="cart-item-name">{item.name}</h3>
                                <p className="cart-item-price">${item.price.toFixed(2)}</p>
                                
                                <div className="cart-item-actions">
                                    <div className="quantity-controls">
                                        <button 
                                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                            disabled={item.quantity <= 1}
                                        >
                                            -
                                        </button>
                                        <span>{item.quantity}</span>
                                        <button 
                                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                        >
                                            +
                                        </button>
                                    </div>
                                    <button 
                                        className="remove-btn"
                                        onClick={() => removeFromCart(item.productId)}
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                            <div className="cart-item-total">
                                <p>${(item.price * item.quantity).toFixed(2)}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="cart-summary-section">
                    <h2>Order Summary</h2>
                    <div className="summary-row">
                        <span>Items ({cartTotalItems}):</span>
                        <span>${cartTotalAmount.toFixed(2)}</span>
                    </div>
                    <div className="summary-row">
                        <span>Shipping:</span>
                        <span>Calculated at checkout</span>
                    </div>
                    <div className="summary-row total">
                        <span>Estimated Total:</span>
                        <span>${cartTotalAmount.toFixed(2)}</span>
                    </div>
                    
                    <button 
                        className="checkout-btn"
                        onClick={() => navigate('/checkout')}
                    >
                        Continue to Checkout
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Cart;
