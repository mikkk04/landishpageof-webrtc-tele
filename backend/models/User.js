const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
        type: String,
        enum: ['patient', 'doctor', 'admin'],
        required: true
    },
    // Add this new field for doctors
    specialty: { type: String, default: '' },
    healthProfile: {
        allergies: { type: String, default: '' },
        medications: { type: String, default: '' },
        conditions: { type: String, default: '' }
    }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);