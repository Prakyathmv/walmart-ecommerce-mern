import React, { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
    return useContext(CartContext);
};

export const CartProvider = ({ children }) => {
    
    const [cartItems, setCartItems] = useState(() => {
        const savedCart = localStorage.getItem('cartItems');
        if (savedCart) {
            try {
                return JSON.parse(savedCart);
            } catch (err) {
                console.error("Failed to parse cart JSON", err);
                return [];
            }
        }
        return [];
    });

    
    useEffect(() => {
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
    }, [cartItems]);

    
    const cartTotalAmount = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    const cartTotalItems = cartItems.reduce((total, item) => total + item.quantity, 0);

    const addToCart = (product) => {
        setCartItems((prevItems) => {
            const existingItem = prevItems.find(item => item.productId === product.id || item.productId === product._id);
            if (existingItem) {
                
                return prevItems.map(item => 
                    (item.productId === existingItem.productId)
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
                );
            } else {
                
                return [...prevItems, {
                    productId: product.id || product._id,
                    name: product.name,
                    price: product.price,
                    imageUrl: product.imageUrl,
                    quantity: 1
                }];
            }
        });
    };

    const removeFromCart = (productId) => {
        setCartItems(prevItems => prevItems.filter(item => item.productId !== productId));
    };

    const updateQuantity = (productId, quantity) => {
        if (quantity < 1) return;
        setCartItems((prevItems) => 
            prevItems.map((item) => 
                item.productId === productId ? { ...item, quantity } : item
            )
        );
    };

    const clearCart = () => {
        setCartItems([]);
    };

    // Bulk-replace cart with items from a past order (for Reorder functionality)
    const reorderItems = (orderItems) => {
        const newCart = orderItems.map(item => ({
            productId: item.productId,
            name: item.name,
            price: item.price,
            imageUrl: item.imageUrl,
            quantity: item.quantity
        }));
        setCartItems(newCart);
    };

    const value = {
        cartItems,
        cartTotalAmount,
        cartTotalItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        reorderItems
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};
