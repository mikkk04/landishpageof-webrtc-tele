import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [appointments, setAppointments] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const usersRes = await axios.get('http://localhost:5001/api/auth/users');
                setUsers(usersRes.data);
                const appointmentsRes = await axios.get('http://localhost:5001/api/appointments');
                setAppointments(appointmentsRes.data);
            } catch (error) {
                console.error("Failed to fetch admin data", error);
            }
        };
        fetchData();
    }, []);

    return (
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ width: '48%' }}>
                <h3>All Users ({users.length})</h3>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                    {users.map(u => (
                        <li key={u._id} style={{ border: '1px solid #eee', padding: '8px', marginBottom: '5px' }}>
                            {u.name} ({u.email}) - <strong>{u.role}</strong>
                        </li>
                    ))}
                </ul>
            </div>
            <div style={{ width: '48%' }}>
                <h3>All Appointments ({appointments.length})</h3>
                 <ul style={{ listStyle: 'none', padding: 0 }}>
                    {appointments.map(app => (
                        <li key={app._id} style={{ border: '1px solid #eee', padding: '8px', marginBottom: '5px' }}>
                            Dr. {app.doctor.name} & {app.patient.name} on {new Date(app.appointmentTime).toLocaleDateString()} - <strong>{app.status}</strong>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default AdminDashboard;