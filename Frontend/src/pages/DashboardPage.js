import React from 'react';
import { useAuth } from '../context/AuthContext.js';
import PatientDashboard from '../components/dashboards/PatientDashboard.js';
import DoctorDashboard from '../components/dashboards/DoctorDashboard.js';
import AdminDashboard from '../components/dashboards/AdminDashboard.js';

const DashboardPage = () => {
    const { user, logout } = useAuth();

    const renderDashboard = () => {
        if (!user) return <div>Loading...</div>;
        
        switch (user.role) {
            case 'patient':
                return <PatientDashboard />;
            case 'doctor':
                return <DoctorDashboard />;
            case 'admin':
                return <AdminDashboard />;
            default:
                return <div>Invalid user role detected.</div>;
        }
    };

    return (
        <div style={{ padding: '2rem' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1>Dashboard</h1>
                <button onClick={logout}>Logout</button>
            </header>
            <p>Welcome, <strong>{user?.name}</strong>! Your role is: {user?.role}</p>
            <hr style={{ margin: '1rem 0' }}/>
            {renderDashboard()}
        </div>
    );
};

export default DashboardPage;