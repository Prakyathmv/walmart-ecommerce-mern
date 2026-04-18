import React, { createContext, useState, useContext, useEffect } from 'react';
import { saveAuthToken, removeAuthToken } from '../utils/auth';

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

        // Keep BOTH token keys in sync:
        // 'token' → read by AuthContext itself
        // 'authToken' → read by axiosConfig interceptor via getAuthToken()
        if (token) {
            localStorage.setItem('token', token);
            saveAuthToken(token);
        } else {
            localStorage.removeItem('token');
            removeAuthToken();
        }
    }, [user, token]);

    const login = (userData, userToken) => {
        setUser(userData);
        setToken(userToken);
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        
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
