const express = require('express');
const router = express.Router();
const {
    getVisibilitySettings,
    updateVisibilitySettings,
    getVisibilityAuditLog,
    resetVisibilitySettings
} = require('../controllers/visibilityController');
const { verifyFirebaseToken } = require('../middleware/authMiddleware');

// All routes are protected
router.use(verifyFirebaseToken);

// Get current visibility settings
router.get('/settings', getVisibilitySettings);

// Update visibility settings
router.put('/settings', updateVisibilitySettings);

// Get visibility audit log
router.get('/audit', getVisibilityAuditLog);

// Reset visibility settings to default
router.post('/reset', resetVisibilitySettings);

module.exports = router;