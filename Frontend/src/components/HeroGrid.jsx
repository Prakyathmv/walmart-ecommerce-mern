import React from 'react';
import './HeroGrid.css';
import heroData from '../Data/HeroData.json';

const HeroGrid = () => {
    return (
        <div className="hero-grid-container">
            <div className="hero-grid">
                {heroData.map((item) => (
                    <div key={item.id} className={`grid-item item-${item.id} ${item.type}`}>
                        <div className="content">
                            {item.subtitle && <p className="subtitle">{item.subtitle}</p>}
                            <h2 className="title">{item.title}</h2>
                            <a href={item.ctaLink} className="cta-link">{item.ctaText}</a>
                            {item.price && (
                                <div className="price-tag">
                                    <span className="rollback-label">Rollback</span>
                                    <div className="price-wrapper">
                                        <span className="current-price">{item.price}</span>
                                        {item.originalPrice && <span className="original-price">{item.originalPrice}</span>}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="image-container">
                            <img src={item.image} alt={item.title} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default HeroGrid;
