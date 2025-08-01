const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware.js');
const { 
    updateUserProfile, 
    updateUserPassword,
    updateHealthProfile,
    getHealthProfile,
    getPatientProfile 
} = require('../controllers/userController.js');

router.put('/profile', auth, updateUserProfile);
router.put('/password', auth, updateUserPassword);
router.get('/health-profile', auth, getHealthProfile);
router.put('/health-profile', auth, updateHealthProfile);
router.get('/patient/:patientId', auth, getPatientProfile);

module.exports = router;