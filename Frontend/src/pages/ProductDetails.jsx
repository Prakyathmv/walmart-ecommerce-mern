import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProductList from '../components/ProductList';
import { useCart } from '../context/CartContext';
import './ProductDetails.css';
import API_BASE from '../utils/api';

const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [addingToCart, setAddingToCart] = useState(false);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${API_BASE}/api/products/${id}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch product details');
                }
                const data = await response.json();
                if (data.success) {
                    setProduct(data.data.product);
                } else {
                    throw new Error(data.error?.message || 'Failed to fetch product details');
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchProduct();
        }
        
        window.scrollTo(0, 0);
    }, [id]);

    const handleAddToCart = () => {
        setAddingToCart(true);
        addToCart(product);
        setTimeout(() => {
            setAddingToCart(false);
            
        }, 500);
    };

    if (loading) return <div className="product-details-loading">Loading product details...</div>;
    if (error) return (
        <div className="product-details-error">
            <h2>Oops!</h2>
            <p>Error: {error}</p>
            <button onClick={() => navigate(-1)} className="back-btn">Go Back</button>
        </div>
    );
    if (!product) return <div className="product-details-error">Product not found.</div>;

    return (
        <div className="product-details-page">
            <button onClick={() => navigate(-1)} className="back-to-products-btn">
                &larr; Back to Products
            </button>
            <div className="product-details-container">
                <div className="product-details-image-section">
                    {product.imageUrl ? (
                        <img src={(product.imageUrl && product.imageUrl.startsWith('http') ? product.imageUrl : `${API_BASE}${product.imageUrl}`)} alt={product.name} className="product-main-image" />
                    ) : (
                        <div className="product-details-no-image">No Image Available</div>
                    )}
                </div>
                
                <div className="product-details-info-section">
                    <p className="product-brand">{product.brand}</p>
                    <h1 className="product-title">{product.name}</h1>
                    <p className="product-category">Category: {product.category}</p>
                    
                    <div className="product-price-section">
                        <span className="product-price">${product.price.toFixed(2)}</span>
                        {product.stock > 0 ? (
                            <span className="stock-status in-stock">In Stock ({product.stock} available)</span>
                        ) : (
                            <span className="stock-status out-of-stock">Out of Stock</span>
                        )}
                    </div>
                    
                    <div className="product-description">
                        <h3>Description</h3>
                        <p>
                            Experience premium quality with the {product.name} from {product.brand}. 
                            Designed for modern needs, this product perfectly fits your lifestyle.
                            {}
                        </p>
                    </div>

                    <div className="product-actions">
                        <button 
                            className={`add-to-cart-btn ${addingToCart ? 'adding' : ''}`}
                            onClick={handleAddToCart}
                            disabled={product.stock <= 0 || addingToCart}
                        >
                            {addingToCart ? 'Adding...' : 'Add to Cart'}
                        </button>
                    </div>
                </div>
            </div>

            <div className="more-products-section">
                <h2 className="more-products-title">You Might Also Like</h2>
                <ProductList />
            </div>
        </div>
    );
};

export default ProductDetails;
