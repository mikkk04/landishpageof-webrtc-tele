const Appointment = require('../models/Appointment.js');
const Conversation = require('../models/Conversation.js');
const { v4: uuidv4 } = require('uuid');

exports.bookAppointment = async (req, res) => {
    try {
        const { doctorId, appointmentTime, reasonForVisit } = req.body;
        const patientId = req.user.id; 

        const newAppointment = new Appointment({
            patient: patientId,
            doctor: doctorId,
            appointmentTime,
            reasonForVisit,
            meetingId: uuidv4(),
        });
        await newAppointment.save();
        res.status(201).json(newAppointment);
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

exports.getAppointments = async (req, res) => {
    try {
        const { id: userId, role: userRole } = req.user;
        let query = {};
        if (userRole === 'patient') query = { patient: userId };
        else if (userRole === 'doctor') query = { doctor: userId };
        
        const appointments = await Appointment.find(query)
            .populate('doctor', 'name specialty')
            .populate('patient', 'name')
            .sort({ appointmentTime: -1 });
        res.json(appointments);
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

exports.acceptAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id);
        if (!appointment || appointment.doctor.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }
        appointment.status = 'accepted';
        await appointment.save();

        // --- THIS BLOCK CREATES THE CONVERSATION ---
        const existingConversation = await Conversation.findOne({ appointment: appointment._id });
        if (!existingConversation) {
            const newConversation = new Conversation({
                participants: [appointment.patient, appointment.doctor],
                appointment: appointment._id
            });
            await newConversation.save();
        }
        
        req.io.to(appointment.patient.toString()).emit('appointment-accepted', appointment);
        res.json(appointment);
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

exports.addConsultationNotes = async (req, res) => {
    try {
        const { notes } = req.body;
        const appointment = await Appointment.findById(req.params.id);
        if (!appointment || appointment.doctor.toString() !== req.user.id) {
            return res.status(404).json({ msg: 'Appointment not found or unauthorized' });
        }
        appointment.consultationNotes = notes;
        appointment.status = 'completed';
        await appointment.save();
        res.json(appointment);
    } catch (error) {
        res.status(500).send('Server Error');
    }
};