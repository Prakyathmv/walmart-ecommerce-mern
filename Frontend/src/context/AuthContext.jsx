import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });

    const [token, setToken] = useState(() => {
        return localStorage.getItem('token') || null;
    });

    useEffect(() => {
        if (user) localStorage.setItem('user', JSON.stringify(user));
        else localStorage.removeItem('user');
        
        if (token) localStorage.setItem('token', token);
        else localStorage.removeItem('token');
    }, [user, token]);

    const login = (userData, userToken) => {
        setUser(userData);
        setToken(userToken);
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        // Do not clear cart items on logout if that's preferred, or clear them if needed
    };

    const value = {
        user,
        token,
        isAuthenticated: !!token && !!user,
        login,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
