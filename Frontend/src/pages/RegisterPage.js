import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { useNavigate, Link } from 'react-router-dom';
import './Auth.css'; // Import the new CSS file

const RegisterPage = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('patient');
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await register(name, email, password, role);
            navigate('/dashboard');
        } catch (error) {
            // Error is already handled in AuthContext
            console.error('Failed to register', error);
        }
    };

    return (
        <div className="auth-body">
            <div className="auth-container">
                <form onSubmit={handleSubmit}>
                    <h2>Register</h2>
                    <div className="input-group">
                        <input 
                            type="text" 
                            className="auth-input"
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                            placeholder="Full Name" 
                            required 
                        />
                    </div>
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
                    <div className="input-group">
                         <select value={role} onChange={(e) => setRole(e.target.value)} className="auth-select">
                            <option value="patient">I am a Patient</option>
                            <option value="doctor">I am a Doctor</option>
                        </select>
                    </div>
                    <button type="submit" className="auth-button">Register</button>
                </form>
                <p className="auth-link">
                    Already have an account? <Link to="/login">Login here</Link>
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;