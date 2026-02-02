const express = require('express');
const router = express.Router();
const { registerUser, updateUserProfile, getUserProfile } = require('../controllers/authController');
const { verifyFirebaseToken } = require('../middleware/authMiddleware');

// Public route
router.post('/register', registerUser);

// Protected routes
router.get('/profile', verifyFirebaseToken, getUserProfile);
router.put('/profile', verifyFirebaseToken, updateUserProfile);

module.exports = router;