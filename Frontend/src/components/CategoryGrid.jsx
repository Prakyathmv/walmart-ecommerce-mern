import React from 'react';
import './CategoryGrid.css';
import categoryData from '../Data/CategoryData.json';

const CategoryGrid = () => {
    return (
        <div className="category-section">
            <div className="category-header">
                <h2 className="section-title">Shop by category</h2>
                <a href="#" className="see-less-link">See less</a>
            </div>
            
            <div className="category-grid">
                {categoryData.map((item) => {
                    if (item.type === 'new-arrivals') {
                        return (
                            <a key={item.id} href={item.link} className="category-card new-arrivals-card">
                                <div className="card-content">
                                    <h3>New</h3>
                                    <h3>Arrivals</h3>
                                </div>
                            </a>
                        );
                    }
                    
                    return (
                        <a key={item.id} href={item.link} className="category-card">
                            <div className="image-wrapper">
                                <img src={item.image} alt={item.title} />
                            </div>
                            <p className="category-title">{item.title}</p>
                        </a>
                    );
                })}
            </div>
        </div>
    );
};

export default CategoryGrid;
