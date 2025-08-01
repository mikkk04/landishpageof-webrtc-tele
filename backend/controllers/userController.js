const User = require('../models/User.js');
const bcrypt = require('bcryptjs');
const Appointment = require('../models/Appointment.js');

exports.updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (user) {
            user.name = req.body.name || user.name;
            const updatedUser = await user.save();
            res.json({ _id: updatedUser._id, name: updatedUser.name, email: updatedUser.email });
        } else {
            res.status(404).json({ msg: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ msg: 'Server Error' });
    }
};

exports.updateUserPassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user.id);
        if (user && (await bcrypt.compare(currentPassword, user.password))) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt);
            await user.save();
            res.json({ msg: 'Password updated successfully' });
        } else {
            res.status(401).json({ msg: 'Invalid current password' });
        }
    } catch (error) {
        res.status(500).json({ msg: 'Server Error' });
    }
};

exports.getPatientProfile = async (req, res) => {
    try {
        const appointmentExists = await Appointment.findOne({ 
            doctor: req.user.id, 
            patient: req.params.patientId 
        });
        if (!appointmentExists) {
            return res.status(403).json({ msg: 'Unauthorized to view this profile' });
        }
        const patient = await User.findById(req.params.patientId).select('name email healthProfile');
        if (patient) {
            res.json(patient);
        } else {
            res.status(404).json({ msg: 'Patient not found' });
        }
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
};

exports.updateHealthProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (user) {
            user.healthProfile = {
                allergies: req.body.allergies || user.healthProfile.allergies,
                medications: req.body.medications || user.healthProfile.medications,
                conditions: req.body.conditions || user.healthProfile.conditions,
            };
            await user.save();
            res.json(user.healthProfile);
        } else {
            res.status(404).json({ msg: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ msg: 'Server Error' });
    }
};

exports.getHealthProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('healthProfile');
        if (user) {
            res.json(user.healthProfile);
        } else {
            res.status(404).json({ msg: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ msg: 'Server Error' });
    }
};