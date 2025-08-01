import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { useAuth } from '../../context/AuthContext.js';
import { Link } from 'react-router-dom';
import './Dashboard.css';

import AppointmentHistory from './AppointmentHistory.js';
import MyHealth from './MyHealth.js';
import ProfileSettings from './ProfileSettings.js';
import MessagesView from './MessagesView.js';

// --- SVG Icons for the Menu ---
const CalendarIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg> );
const HistoryIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg> );
const HealthIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg> );
const MessageIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg> );
const SettingsIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51h.09a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg> );


const AppointmentsView = () => {
    const [doctors, setDoctors] = useState([]);
    const [selectedDoctor, setSelectedDoctor] = useState('');
    const [appointmentTime, setAppointmentTime] = useState('');
    const [reasonForVisit, setReasonForVisit] = useState('');
    const [appointments, setAppointments] = useState([]);
    const { user } = useAuth();

    const fetchAppointments = async () => {
        try {
            const res = await axios.get('http://localhost:5001/api/appointments');
            // This is the new filter logic
            const upcoming = res.data.filter(app => app.status === 'pending' || app.status === 'accepted');
            setAppointments(upcoming);
        } catch (error) {
            console.error("Could not fetch appointments", error);
        }
    };

    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const res = await axios.get('http://localhost:5001/api/auth/doctors');
                setDoctors(res.data);
            } catch (error) {
                console.error("Could not fetch doctors", error);
            }
        };
        fetchDoctors();
        fetchAppointments();

        const socket = io('http://localhost:5001', { query: { userId: user.id } });
        socket.on('appointment-accepted', () => {
            alert(`An appointment has been accepted!`);
            fetchAppointments();
        });

        return () => socket.disconnect();
    }, [user.id]);

    const handleBooking = async (e) => {
        e.preventDefault();
        if (!selectedDoctor || !appointmentTime) return alert('Please select a doctor and a time.');
        try {
            await axios.post('http://localhost:5001/api/appointments/book', {
                doctorId: selectedDoctor,
                appointmentTime,
                reasonForVisit,
            });
            alert('Appointment booked successfully! Awaiting doctor approval.');
            fetchAppointments();
            setReasonForVisit('');
        } catch (error) {
            console.error('Booking failed', error);
        }
    };

    return (
        <>
            <div className="dashboard-card">
                <h3>Book a Consultation</h3>
                <form onSubmit={handleBooking} className="booking-form">
                    <select onChange={(e) => setSelectedDoctor(e.target.value)} required>
                        <option value="">Select a Doctor</option>
                        {doctors.map(doc => <option key={doc._id} value={doc._id}>Dr. {doc.name}</option>)}
                    </select>
                    <input type="datetime-local" onChange={(e) => setAppointmentTime(e.target.value)} required />
                    <input 
                        type="text" 
                        placeholder="Reason for visit (e.g., Follow-up)"
                        value={reasonForVisit}
                        onChange={(e) => setReasonForVisit(e.target.value)}
                        required
                    />
                    <button type="submit">Book Now</button>
                </form>
            </div>
            
            <div className="dashboard-card">
                <h3>Your Upcoming Appointments</h3>
                {appointments.length === 0 ? <p>You have no upcoming appointments.</p> : (
                    <ul className="appointments-list">
                        {appointments.map(app => (
                            <li key={app._id} className="appointment-item">
                                <div className="appointment-details">
                                    <div><strong>Doctor:</strong> Dr. {app.doctor.name}</div>
                                    <div><strong>Time:</strong> {new Date(app.appointmentTime).toLocaleString()}</div>
                                    {app.reasonForVisit && <div><strong>Reason:</strong> {app.reasonForVisit}</div>}
                                </div>
                                <div className="appointment-actions">
                                    <span className={`status-badge status-${app.status}`}>{app.status}</span>
                                    {app.status === 'accepted' && (
                                        <Link to={`/call/${app.meetingId}`} className="join-call-btn">
                                            Join Call
                                        </Link>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </>
    );
};


const PatientDashboard = () => {
    const [activeTab, setActiveTab] = useState('appointments');
    const { user } = useAuth();

    const renderContent = () => {
        switch (activeTab) {
            case 'appointments': return <AppointmentsView />;
            case 'history': return <AppointmentHistory />;
            case 'health': return <MyHealth />;
            case 'messages': return <MessagesView />;
            case 'settings': return <ProfileSettings />;
            default: return <AppointmentsView />;
        }
    };

    return (
        <div className="dashboard-layout">
            <aside className="sidebar">
                <div className="sidebar-header">Tele-Consult</div>
                <ul className="sidebar-menu">
                    <li className={`menu-item ${activeTab === 'appointments' ? 'active' : ''}`} onClick={() => setActiveTab('appointments')}>
                        <CalendarIcon /> <span>Appointments</span>
                    </li>
                    <li className={`menu-item ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>
                        <HistoryIcon /> <span>History</span>
                    </li>
                    <li className={`menu-item ${activeTab === 'health' ? 'active' : ''}`} onClick={() => setActiveTab('health')}>
                        <HealthIcon /> <span>My Health</span>
                    </li>
                    <li className={`menu-item ${activeTab === 'messages' ? 'active' : ''}`} onClick={() => setActiveTab('messages')}>
                        <MessageIcon /> <span>Messages</span>
                    </li>
                    <li className={`menu-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
                        <SettingsIcon /> <span>Settings</span>
                    </li>
                </ul>
            </aside>
            <main className="content-area">
                <h2>Welcome back, {user?.name}!</h2>
                <p className="subtitle">Here's your health dashboard overview.</p>
                {renderContent()}
            </main>
        </div>
    );
};

export default PatientDashboard;