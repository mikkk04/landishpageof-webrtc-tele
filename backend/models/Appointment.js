const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    appointmentTime: { type: Date, required: true },
    reasonForVisit: { type: String, default: '' },
    // This is the new field for the doctor's notes
    consultationNotes: { type: String, default: '' },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected', 'completed'],
        default: 'pending'
    },
    meetingId: { type: String, required: true, unique: true }
}, { timestamps: true });

module.exports = mongoose.model('Appointment', AppointmentSchema);