import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext.js';
import './Dashboard.css';

const MessagesView = () => {
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        const fetchConversations = async () => {
            try {
                const res = await axios.get('http://localhost:5001/api/messages');
                setConversations(res.data);
            } catch (error) {
                console.error("Could not fetch conversations", error);
            } finally {
                setLoading(false);
            }
        };
        fetchConversations();
    }, []);

    const getOtherParticipant = (participants) => {
        return participants.find(p => p._id !== user.id);
    };

    if (loading) {
        return <div className="dashboard-card"><p>Loading conversations...</p></div>;
    }

    return (
        <div className="dashboard-card">
            <h3>My Messages</h3>
            {conversations.length === 0 ? (
                <p>You have no conversations.</p>
            ) : (
                <ul className="appointments-list">
                    {conversations.map(convo => {
                        const otherUser = getOtherParticipant(convo.participants);
                        return (
                            <li key={convo._id} className="appointment-item">
                                <div className="appointment-details">
                                    <div>
                                        <strong>
                                            Conversation with {user.role === 'patient' ? 'Dr.' : ''} {otherUser?.name || 'Unknown'}
                                        </strong>
                                    </div>
                                    <div style={{ fontSize: '0.9rem', color: '#6c757d' }}>
                                        Regarding appointment on: {new Date(convo.appointment.appointmentTime).toLocaleDateString()}
                                    </div>
                                </div>
                                <div className="appointment-actions">
                                    <button className="join-call-btn" style={{backgroundColor: '#007bff'}}>Open Chat</button>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
};

export default MessagesView;