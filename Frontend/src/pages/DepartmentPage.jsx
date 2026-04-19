import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import './DepartmentPage.css';

const DepartmentPage = () => {
    const { departmentName } = useParams();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                // Determine API URL (using proxy or full URL based on environment)
                const apiUrl = `/api/products?department=${encodeURIComponent(departmentName)}&limit=24`;
                const response = await fetch(apiUrl);
                const result = await response.json();

                if (result.success) {
                    setProducts(result.data.products);
                } else {
                    setError(result.error?.message || 'Failed to fetch products');
                }
            } catch (err) {
                console.error('Error fetching department products:', err);
                setError('Something went wrong. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        if (departmentName) {
            fetchProducts();
        }
    }, [departmentName]);

    return (
        <div className="department-page">
            <div className="container">
                <h1 className="department-title">{departmentName}</h1>
                
                {loading ? (
                    <div className="product-grid">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="skeleton-card">
                                <div className="skeleton-image"></div>
                                <div className="skeleton-line price"></div>
                                <div className="skeleton-line name"></div>
                                <div className="skeleton-line name short"></div>
                            </div>
                        ))}
                    </div>
                ) : error ? (
                    <div className="error-container">
                        <p>{error}</p>
                    </div>
                ) : products.length > 0 ? (
                    <div className="product-grid">
                        {products.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <div className="empty-state-content">
                            <i className="fa-solid fa-box-open"></i>
                            <h2>No products found</h2>
                            <p>We couldn't find any products in the <strong>{departmentName}</strong> department.</p>
                            <button onClick={() => window.location.href = '/'}>Back to Home</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DepartmentPage;
