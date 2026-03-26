import React from 'react';
import Navigation from "../components/Navigation";
import { Carousel } from "../components/Carousel";
import HeroGrid from "../components/HeroGrid";
import CategoryGrid from "../components/CategoryGrid";
import ProductList from "../components/ProductList"; // Added ProductList import
import slides from "../Data/CarousalData.js";

export const Home = () => {
    return (
        <main>
            <div className="container section-gap">
                <Carousel data={slides} />
            </div>
            <div className="container section-gap">
                <HeroGrid />
            </div>
            <div className="container section-gap">
                <ProductList />
            </div>
            <div className="container section-gap">
                <CategoryGrid />
            </div>
        </main>
    );
};

export default Home;
