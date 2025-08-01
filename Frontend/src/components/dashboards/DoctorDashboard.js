import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext.js';
import { Link } from 'react-router-dom';
import './Dashboard.css';
import MessagesView from './MessagesView.js';

// --- SVG Icons for the Menu ---
const CalendarIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg> );
const MessageIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg> );

const DoctorAppointmentsView = () => {
    const [appointments, setAppointments] = useState([]);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [patientProfile, setPatientProfile] = useState(null);
    const [notes, setNotes] = useState('');
    const [isProfileModalOpen, setProfileModalOpen] = useState(false);
    const [isNotesModalOpen, setNotesModalOpen] = useState(false);

    const fetchAppointments = async () => {
        try {
            const res = await axios.get('http://localhost:5001/api/appointments');
            // This filter now includes all pending or accepted appointments
            const upcoming = res.data.filter(app => app.status === 'pending' || app.status === 'accepted');
            setAppointments(upcoming);
        } catch (error) {
            console.error("Could not fetch appointments", error);
        }
    };

    useEffect(() => {
        fetchAppointments();
    }, []);

    const handleViewProfile = async (patientId) => {
        try {
            const res = await axios.get(`http://localhost:5001/api/users/patient/${patientId}`);
            setPatientProfile(res.data);
            setProfileModalOpen(true);
        } catch (error) {
            alert('Could not fetch patient profile.');
        }
    };

    const handleAddNotes = (appointment) => {
        setSelectedAppointment(appointment);
        setNotes(appointment.consultationNotes || '');
        setNotesModalOpen(true);
    };
    
    const handleAccept = async (appointmentId) => {
        try {
            await axios.put(`http://localhost:5001/api/appointments/${appointmentId}/accept`);
            alert('Appointment accepted!');
            fetchAppointments(); 
        } catch (error) {
            console.error('Failed to accept appointment', error);
        }
    };

    const handleNotesSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`http://localhost:5001/api/appointments/${selectedAppointment._id}/notes`, { notes });
            alert('Notes saved successfully!');
            setNotesModalOpen(false);
            fetchAppointments();
        } catch (error) {
            alert('Failed to save notes.');
        }
    };
    
    return (
        <>
            <div className="dashboard-card">
                {/* Changed title from Today's Agenda */}
                <h3>Pending & Upcoming Appointments ({appointments.length})</h3>
                {appointments.length === 0 ? <p>You have no upcoming appointments.</p> : (
                    <ul className="appointments-list">
                        {appointments.map(app => (
                            <li key={app._id} className="appointment-item">
                                <div className="appointment-details">
                                    <div><strong>Patient:</strong> {app.patient.name}</div>
                                    <div><strong>Time:</strong> {new Date(app.appointmentTime).toLocaleString()}</div>
                                    {app.reasonForVisit && <div><strong>Reason:</strong> {app.reasonForVisit}</div>}
                                </div>
                                <div className="appointment-actions">
                                    <span className={`status-badge status-${app.status}`}>{app.status}</span>
                                    {app.status === 'pending' && (
                                        <button onClick={() => handleAccept(app._id)} className="btn btn-primary">Accept</button>
                                    )}
                                    {app.status === 'accepted' && (
                                        <>
                                            <button onClick={() => handleViewProfile(app.patient._id)} className="btn btn-secondary">View Profile</button>
                                            <Link to={`/call/${app.meetingId}`} className="btn btn-primary">Join Call</Link>
                                            <button onClick={() => handleAddNotes(app)} className="btn btn-secondary">Add Notes</button>
                                        </>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Patient Profile Modal */}
            {isProfileModalOpen && (
                <div className="modal-overlay" onClick={() => setProfileModalOpen(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{patientProfile?.name}'s Health Profile</h3>
                            <button className="modal-close-btn" onClick={() => setProfileModalOpen(false)}>&times;</button>
                        </div>
                        <div className="modal-body">
                            <p><strong>Email:</strong> {patientProfile?.email}</p>
                            <p><strong>Allergies:</strong> {patientProfile?.healthProfile?.allergies || 'N/A'}</p>
                            <p><strong>Medications:</strong> {patientProfile?.healthProfile?.medications || 'N/A'}</p>
                            <p><strong>Conditions:</strong> {patientProfile?.healthProfile?.conditions || 'N/A'}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Notes Modal */}
            {isNotesModalOpen && (
                 <div className="modal-overlay" onClick={() => setNotesModalOpen(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                         <div className="modal-header">
                            <h3>Consultation Notes</h3>
                            <button className="modal-close-btn" onClick={() => setNotesModalOpen(false)}>&times;</button>
                        </div>
                        <div className="modal-body">
                           <form onSubmit={handleNotesSubmit}>
                               <textarea 
                                   className="notes-textarea"
                                   value={notes}
                                   onChange={(e) => setNotes(e.target.value)}
                                   placeholder="Type clinical notes here..."
                               />
                               <button type="submit" className="btn btn-primary">Save Notes & Mark as Completed</button>
                           </form>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};


const DoctorDashboard = () => {
    const [activeTab, setActiveTab] = useState('appointments');
    const { user } = useAuth();

    const renderContent = () => {
        switch (activeTab) {
            case 'appointments': return <DoctorAppointmentsView />;
            case 'messages': return <MessagesView />;
            default: return <DoctorAppointmentsView />;
        }
    };

    return (
        <div className="dashboard-layout">
            <aside className="sidebar">
                <div className="sidebar-header">Doctor Portal</div>
                <ul className="sidebar-menu">
                    <li className={`menu-item ${activeTab === 'appointments' ? 'active' : ''}`} onClick={() => setActiveTab('appointments')}>
                        <CalendarIcon /> <span>Appointments</span>
                    </li>
                    <li className={`menu-item ${activeTab === 'messages' ? 'active' : ''}`} onClick={() => setActiveTab('messages')}>
                        <MessageIcon /> <span>Messages</span>
                    </li>
                </ul>
            </aside>
            <main className="content-area">
                <h2>Welcome back, Dr. {user?.name}!</h2>
                <p className="subtitle">Here are your appointments and messages.</p>
                {renderContent()}
            </main>
        </div>
    );
};

export default DoctorDashboard;