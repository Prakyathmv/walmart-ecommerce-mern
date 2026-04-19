import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './ProductCard.css';

const ProductCard = ({ product }) => {
    const { addToCart } = useCart();

    // Ensure price is a number
    const price = typeof product.price === 'number' ? product.price : parseFloat(product.price) || 0;

    return (
        <div className="product-card">
            <Link to={`/product/${product.id}`} className="product-card-image">
                <img src={product.imageUrl || 'https://via.placeholder.com/200'} alt={product.name} />
            </Link>
            <div className="product-card-content">
                <div className="product-card-price">
                    <span>${price.toFixed(2)}</span>
                </div>
                <Link to={`/product/${product.id}`} className="product-card-name">
                    {product.name}
                </Link>
                <div className="product-card-actions">
                    <button 
                        className="add-to-cart-btn"
                        onClick={() => addToCart(product)}
                    >
                        Add to cart
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
