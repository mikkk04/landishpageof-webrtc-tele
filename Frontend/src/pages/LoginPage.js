import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { useNavigate, Link } from 'react-router-dom';
import './Auth.css'; // Import the new CSS file

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (error) {
            // Error is already handled in AuthContext
            console.error('Failed to log in', error);
        }
    };

    return (
        <div className="auth-body">
            <div className="auth-container">
                <form onSubmit={handleSubmit}>
                    <h2>Login</h2>
                    <div className="input-group">
                        <input 
                            type="email" 
                            className="auth-input"
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            placeholder="Email" 
                            required 
                        />
                    </div>
                    <div className="input-group">
                        <input 
                            type="password" 
                            className="auth-input"
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            placeholder="Password" 
                            required 
                        />
                    </div>
                    <button type="submit" className="auth-button">Login</button>
                </form>
                <p className="auth-link">
                    Don't have an account? <Link to="/register">Register here</Link>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;