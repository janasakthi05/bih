const express = require('express');
const router = express.Router();
const {
    createOrUpdateEmergencyProfile,
    generateEmergencyQR,
    getPublicEmergencyProfile,
    getPrivateEmergencyProfile,
    updateVisibilitySettings
} = require('../controllers/emergencyController');
const { verifyFirebaseToken, checkEmergencyAccess } = require('../middleware/authMiddleware');

// Public emergency access (no auth required)
router.get('/public/emergency/:hash', getPublicEmergencyProfile);

// Protected emergency routes
router.post('/profile', verifyFirebaseToken, createOrUpdateEmergencyProfile);
router.get('/profile', verifyFirebaseToken, getPrivateEmergencyProfile);
router.get('/qr/generate', verifyFirebaseToken, generateEmergencyQR);
router.put('/visibility', verifyFirebaseToken, updateVisibilitySettings);

module.exports = router;