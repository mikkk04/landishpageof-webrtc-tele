import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                if (decoded.exp * 1000 < Date.now()) {
                    localStorage.removeItem('token');
                } else {
                    setUser(decoded.user);
                    setIsAuthenticated(true);
                    axios.defaults.headers.common['x-auth-token'] = token;
                }
            } catch (error) {
                setUser(null);
                setIsAuthenticated(false);
                localStorage.removeItem('token');
            }
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const res = await axios.post('http://localhost:5001/api/auth/login', { email, password });
            localStorage.setItem('token', res.data.token);
            const decoded = jwtDecode(res.data.token);
            setUser(decoded.user);
            setIsAuthenticated(true);
            axios.defaults.headers.common['x-auth-token'] = res.data.token;
        } catch (error) {
            if (error.code === "ERR_NETWORK") {
                alert('Could not connect to the server. Please make sure the backend and MongoDB are running.');
            } else if (error.response?.data?.msg) {
                alert(error.response.data.msg);
            }
            throw error;
        }
    };
    
    const register = async (name, email, password, role) => {
        try {
            const res = await axios.post('http://localhost:5001/api/auth/register', { name, email, password, role });
            localStorage.setItem('token', res.data.token);
            const decoded = jwtDecode(res.data.token);
            setUser(decoded.user);
            setIsAuthenticated(true);
            axios.defaults.headers.common['x-auth-token'] = res.data.token;
        } catch (error) {
            if (error.code === "ERR_NETWORK") {
                alert('Could not connect to the server. Please make sure the backend and MongoDB are running.');
            } else if (error.response?.data?.msg) {
                alert(error.response.data.msg);
            }
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        setIsAuthenticated(false);
        delete axios.defaults.headers.common['x-auth-token'];
    };

    const value = { user, isAuthenticated, loading, login, register, logout };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};