import React, { useState } from 'react';
import axios from '../utils/axiosConfig';
import { getAuthToken } from '../utils/auth';
import './AddProduct.css';

const AddProduct = ({ onProductAdded }) => {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const token = getAuthToken();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    
    if (!formData.name || !formData.price) {
      setError('Name and price are required');
      setLoading(false);
      return;
    }

    if (isNaN(formData.price) || formData.price <= 0) {
      setError('Price must be a positive number');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('/api/products', {
        name: formData.name.trim(),
        price: parseFloat(formData.price),
        category: formData.category.trim() || 'General',
        description: formData.description.trim()
      });

      if (response.data.success) {
        setSuccess(`✓ Product "${formData.name}" added successfully!`);
        setFormData({
          name: '',
          price: '',
          category: '',
          description: ''
        });

        
        if (onProductAdded) {
          onProductAdded(response.data.data.product);
        }

        
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error?.message || 'Failed to add product';
      setError(errorMessage);
      console.error('Error adding product:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="add-product-container">
        <div className="auth-required">
          <p>Please <a href="/login">login</a> to add products</p>
        </div>
      </div>
    );
  }

  return (
    <div className="add-product-container">
      <div className="add-product-card">
        <h2>Add New Product</h2>
        
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Product Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter product name"
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="price">Price *</label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="Enter price"
              step="0.01"
              min="0"
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="category">Category</label>
            <input
              type="text"
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              placeholder="e.g., Electronics, Clothing, Food"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter product description"
              rows="4"
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            className="submit-btn"
            disabled={loading}
          >
            {loading ? 'Adding Product...' : 'Add Product'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;
