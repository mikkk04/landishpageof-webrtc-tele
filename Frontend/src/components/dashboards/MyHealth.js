import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Dashboard.css';

const MyHealth = () => {
    const [profile, setProfile] = useState({
        allergies: '',
        medications: '',
        conditions: ''
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHealthProfile = async () => {
            try {
                const res = await axios.get('http://localhost:5001/api/users/health-profile');
                setProfile(res.data);
            } catch (error) {
                console.error("Could not fetch health profile", error);
            } finally {
                setLoading(false);
            }
        };
        fetchHealthProfile();
    }, []);

    const handleChange = (e) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.put('http://localhost:5001/api/users/health-profile', profile);
            alert('Health profile updated successfully!');
        } catch (error) {
            alert('Failed to update health profile.');
            console.error(error);
        }
    };

    if (loading) {
        return <div className="dashboard-card"><p>Loading health profile...</p></div>;
    }

    return (
        <div className="dashboard-card">
            <h3>My Health Profile</h3>
            <p style={{ color: '#6c757d', marginTop: '-1rem', marginBottom: '1.5rem' }}>
                This information will be shared with your doctor during consultations.
            </p>
            <form onSubmit={handleSubmit} className="settings-form">
                <div className="form-group">
                    <label htmlFor="allergies">Allergies</label>
                    <textarea 
                        id="allergies"
                        name="allergies"
                        rows="3"
                        value={profile.allergies}
                        onChange={handleChange}
                        placeholder="e.g., Penicillin, Peanuts"
                        style={{ padding: '0.75rem', border: '1px solid #ced4da', borderRadius: '6px', fontSize: '1rem', resize: 'vertical' }}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="medications">Current Medications</label>
                    <textarea 
                        id="medications"
                        name="medications"
                        rows="3"
                        value={profile.medications}
                        onChange={handleChange}
                        placeholder="e.g., Metformin 500mg, Aspirin 81mg"
                        style={{ padding: '0.75rem', border: '1px solid #ced4da', borderRadius: '6px', fontSize: '1rem', resize: 'vertical' }}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="conditions">Chronic Conditions</label>
                    <textarea 
                        id="conditions"
                        name="conditions"
                        rows="3"
                        value={profile.conditions}
                        onChange={handleChange}
                        placeholder="e.g., Type 2 Diabetes, Hypertension"
                        style={{ padding: '0.75rem', border: '1px solid #ced4da', borderRadius: '6px', fontSize: '1rem', resize: 'vertical' }}
                    />
                </div>
                <div className="form-actions">
                    <button type="submit">Save Health Profile</button>
                </div>
            </form>
        </div>
    );
};

export default MyHealth;