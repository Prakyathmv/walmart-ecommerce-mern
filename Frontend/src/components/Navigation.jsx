import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import walmartLogo from '../assets/walmartlogo.jpeg';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Navigation = () => {
    const { isAuthenticated, user, logout } = useAuth();
    const { cartTotalItems, cartTotalAmount } = useCart();
    
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    return (
        <header>
            <div className="top">
                <div className="container navbar-inner">
                    <div className="left">
                        <Link to="/">
                            <img src={walmartLogo} className="logo" alt="Walmart Logo" />
                        </Link>
                        <div className="location-box">
                            <i className="fa-solid fa-location-dot"></i>
                            <div>
                                <span>Pickup or delivery?</span>
                            </div>
                            <i className="fa-solid fa-chevron-down"></i>
                        </div>
                    </div>
                    <form className="search-bar" onSubmit={handleSearch}>
                        <input 
                            type="text" 
                            placeholder="Search everything at Walmart online and in store" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <button type="submit"><i className="fa-solid fa-magnifying-glass"></i></button>
                    </form>
                    <div className="right">
                        <Link to="/my-orders" style={{ textDecoration: 'none', color: 'inherit' }}>
                            <div className="nav-item">
                                <i className="fa-regular fa-heart"></i>
                                <div>
                                    <span>Reorder</span>
                                    <p>My Items</p>
                                </div>
                            </div>
                        </Link>
                        <div className="nav-item">
                            <i className="fa-regular fa-user"></i>
                            <div>
                                {isAuthenticated ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                        <Link to="/my-orders" style={{ textDecoration: 'none', color: 'inherit' }}>
                                            <span>Hi {user?.name ? user.name.split(' ')[0] : ''}</span>
                                            <p style={{ margin: 0, fontWeight: 600, fontSize: '0.8rem', color: '#0071ce' }}>My Orders</p>
                                        </Link>
                                        <p
                                            style={{ margin: 0, fontWeight: 'bold', cursor: 'pointer', fontSize: '0.75rem' }}
                                            onClick={logout}
                                        >Sign Out</p>
                                    </div>
                                ) : (
                                    <Link to="/login" style={{ textDecoration: 'none', color: 'inherit' }}>
                                        <span>Sign In</span>
                                        <p>Account</p>
                                    </Link>
                                )}
                            </div>
                        </div>
                        <Link to="/cart" style={{ textDecoration: 'none', color: 'inherit' }}>
                            <div className="nav-item cart-item">
                                <div className="cart-icon-container">
                                    <i className="fa-solid fa-cart-shopping"></i>
                                    <span className="cart-badge">{cartTotalItems}</span>
                                </div>
                                <p>${cartTotalAmount.toFixed(2)}</p>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
            <div className="bottom-navbar">
              <div className="container bottom-navbar-inner">
                <span>Departments <i className="fa-solid fa-chevron-down"></i></span>
                <span>Services <i className="fa-solid fa-chevron-down"></i></span>
                <span>Get it Fast</span>
                <span>Rollbacks & More</span>
                <span>Valentine's Day</span>
                <span>Virtual Care</span>
                <span>New Arrivals</span>
                <span>bettergoods</span>
                <span>Dinner Made Easy</span>
                <span>Walmart+</span>
                <span>More <i className="fa-solid fa-chevron-down"></i></span>
              </div>
            </div>

        </header>
    );
};

export default Navigation;
