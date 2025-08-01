const mongoose = require('mongoose');

const ConversationSchema = new mongoose.Schema({
    participants: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        }
    ],
    appointment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment',
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Conversation', ConversationSchema);