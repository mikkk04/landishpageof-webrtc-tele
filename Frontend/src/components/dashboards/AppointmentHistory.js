import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext.js';
import './Dashboard.css';

const AppointmentHistory = () => {
    const [pastAppointments, setPastAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await axios.get('http://localhost:5001/api/appointments');
                // This is the new filter logic
                const history = res.data.filter(app => app.status === 'completed');
                setPastAppointments(history);
            } catch (error) {
                console.error("Could not fetch appointment history", error);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchHistory();
        }
    }, [user]);

    if (loading) {
        return (
            <div className="dashboard-card">
                <h3>Appointment History</h3>
                <p>Loading history...</p>
            </div>
        );
    }

    return (
        <div className="dashboard-card">
            <h3>Appointment History</h3>
            {pastAppointments.length === 0 ? (
                <p>You have no completed appointments.</p>
            ) : (
                <ul className="appointments-list">
                    {pastAppointments.map(app => (
                        <li key={app._id} className="appointment-item" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                             <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                <div className="appointment-details">
                                    <div><strong>Doctor:</strong> Dr. {app.doctor.name}</div>
                                    <div><strong>Date:</strong> {new Date(app.appointmentTime).toLocaleString()}</div>
                                </div>
                                <div className="appointment-actions">
                                    <span className={`status-badge status-${app.status}`}>{app.status}</span>
                                </div>
                            </div>
                            {app.consultationNotes && (
                                <div className="appointment-notes">
                                    <strong>Doctor's Notes:</strong>
                                    <p style={{ margin: '0.25rem 0 0 0' }}>{app.consultationNotes}</p>
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default AppointmentHistory;