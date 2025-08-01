const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware.js');
// Updated to import the new function
const { 
    bookAppointment, 
    getAppointments, 
    acceptAppointment,
    addConsultationNotes 
} = require('../controllers/appointmentController.js');

router.post('/book', auth, bookAppointment);
router.get('/', auth, getAppointments);
router.put('/:id/accept', auth, acceptAppointment);

// This is the new route you requested
router.put('/:id/notes', auth, addConsultationNotes);

module.exports = router;