import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext.js';

const ProfileSettings = () => {
    const { user } = useAuth();
    const [name, setName] = useState(user?.name || '');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        try {
            await axios.put('http://localhost:5001/api/users/profile', { name });
            alert('Profile updated successfully! The change will be visible on your next login.');
        } catch (error) {
            alert('Failed to update profile.');
            console.error(error);
        }
    };

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            alert('New passwords do not match.');
            return;
        }
        try {
            const res = await axios.put('http://localhost:5001/api/users/password', { currentPassword, newPassword });
            alert(res.data.msg);
            // Clear password fields after successful update
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error) {
            alert(error.response?.data?.msg || 'Failed to update password.');
            console.error(error);
        }
    };

    return (
        <>
            <div className="dashboard-card">
                <h3>Update Profile Information</h3>
                <form onSubmit={handleProfileUpdate} className="settings-form">
                    <div className="form-group">
                        <label htmlFor="name">Full Name</label>
                        <input 
                            type="text" 
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input 
                            type="email" 
                            id="email"
                            value={user?.email || ''}
                            disabled 
                        />
                    </div>
                    <div className="form-actions">
                        <button type="submit">Save Changes</button>
                    </div>
                </form>
            </div>

            <div className="dashboard-card">
                <h3>Change Password</h3>
                <form onSubmit={handlePasswordUpdate} className="settings-form">
                    <div className="form-group">
                        <label htmlFor="currentPassword">Current Password</label>
                        <input 
                            type="password" 
                            id="currentPassword"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="newPassword">New Password</label>
                        <input 
                            type="password" 
                            id="newPassword"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirm New Password</label>
                        <input 
                            type="password" 
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-actions">
                        <button type="submit">Update Password</button>
                    </div>
                </form>
            </div>
        </>
    );
};

export default ProfileSettings;