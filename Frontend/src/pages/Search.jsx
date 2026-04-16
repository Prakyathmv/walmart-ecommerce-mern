import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import API_BASE from '../utils/api';
import { useCart } from '../context/CartContext';
import './Search.css';

const CATEGORIES = [
  "Grocery & Essentials",
  "Electronics",
  "Home & Garden",
  "Clothing & Apparel",
  "Sports & Outdoors",
  "Toys & Games",
  "Health & Wellness",
  "Baby & Toddler",
  "Automotive",
  "Beauty & Personal Care",
];

export default function Search() {
    const location = useLocation();
    const navigate = useNavigate();
    const { addToCart } = useCart();

    const queryParams = new URLSearchParams(location.search);
    const initialQuery = queryParams.get('q') || '';
    const initialCategory = queryParams.get('category') || '';
    const initialMinPrice = queryParams.get('minPrice') || '';
    const initialMaxPrice = queryParams.get('maxPrice') || '';

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);

    // Sidebar filter states
    const [category, setCategory] = useState(initialCategory);
    const [minPrice, setMinPrice] = useState(initialMinPrice);
    const [maxPrice, setMaxPrice] = useState(initialMaxPrice);

    useEffect(() => {
        const fetchSearchResults = async () => {
            setLoading(true);
            try {
                // Construct query string for backend
                const params = new URLSearchParams();
                if (initialQuery) params.append('q', initialQuery);
                if (initialCategory) params.append('category', initialCategory);
                if (initialMinPrice) params.append('minPrice', initialMinPrice);
                if (initialMaxPrice) params.append('maxPrice', initialMaxPrice);
                
                // Allow fetching a lot of items on search page
                params.append('limit', 50);

                const res = await fetch(`${API_BASE}/api/products?${params.toString()}`);
                const data = await res.json();

                if (data.success) {
                    setProducts(data.data.products);
                }
            } catch (err) {
                console.error("Search Error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchSearchResults();
    }, [initialQuery, initialCategory, initialMinPrice, initialMaxPrice]);

    const handleApplyFilters = () => {
        const params = new URLSearchParams();
        if (initialQuery) params.append('q', initialQuery);
        if (category) params.append('category', category);
        if (minPrice) params.append('minPrice', minPrice);
        if (maxPrice) params.append('maxPrice', maxPrice);

        navigate(`/search?${params.toString()}`);
    };

    const handleClearFilters = () => {
        setCategory('');
        setMinPrice('');
        setMaxPrice('');
        if (initialQuery) {
            navigate(`/search?q=${initialQuery}`);
        } else {
            navigate(`/search`);
        }
    };

    return (
        <div className="search-page-container container">
            <h1 className="search-title">
               {initialQuery ? `Results for "${initialQuery}"` : "All Products"}
               <span className="results-count">({products.length} items found)</span>
            </h1>

            <div className="search-layout">
                {/* LEFT SIDEBAR OMITTED FOR BREVITY, TO BE STYLED */}
                <aside className="search-sidebar">
                    <h3>Filters</h3>
                    
                    <div className="filter-group">
                        <label>Category</label>
                        <select value={category} onChange={(e) => setCategory(e.target.value)}>
                            <option value="">All Categories</option>
                            {CATEGORIES.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-group">
                        <label>Price Range ($)</label>
                        <div className="price-inputs">
                            <input type="number" placeholder="Min" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} min="0" />
                            <span> - </span>
                            <input type="number" placeholder="Max" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} min="0" />
                        </div>
                    </div>

                    <div className="filter-actions">
                        <button className="btn-apply-filters" onClick={handleApplyFilters}>Apply</button>
                        <button className="btn-clear-filters" onClick={handleClearFilters}>Clear</button>
                    </div>
                </aside>

                {/* RIGHT PRODUCTS GRID */}
                <main className="search-results">
                    {loading ? (
                        <div className="loading-spinner">Loading...</div>
                    ) : (
                        <div className="search-product-grid">
                            {products.length === 0 ? (
                                <p className="no-results">No products matched your search. Try different keywords or clearing filters.</p>
                            ) : (
                                products.map(product => (
                                    <Link to={`/product/${product.id}`} key={product.id} className="search-product-card-link">
                                        <div className="search-product-card">
                                            <div className="search-product-image">
                                                {product.imageUrl ? (
                                                    <img src={product.imageUrl.startsWith('http') ? product.imageUrl : `${API_BASE}${product.imageUrl}`} alt={product.name} />
                                                ) : (
                                                    <div className="no-image">No Image</div>
                                                )}
                                            </div>
                                            <div className="search-product-info">
                                                <h4>{product.name}</h4>
                                                <p className="search-brand">{product.brand}</p>
                                                <p className="search-price">${product.price.toFixed(2)}</p>
                                                <button 
                                                    className="btn-add-cart-tiny" 
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        addToCart(product);
                                                        alert('Added to cart!');
                                                    }}
                                                >
                                                    Add to cart
                                                </button>
                                            </div>
                                        </div>
                                    </Link>
                                ))
                            )}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
