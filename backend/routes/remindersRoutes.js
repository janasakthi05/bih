const express = require('express');
const router = express.Router();
const {
    createReminder,
    getReminders,
    updateReminder,
    deleteReminder
} = require('../controllers/remindersController');
const { verifyFirebaseToken } = require('../middleware/authMiddleware');

// Protected routes
router.post('/', verifyFirebaseToken, createReminder);
router.get('/', verifyFirebaseToken, getReminders);
router.put('/:reminderId', verifyFirebaseToken, updateReminder);
router.delete('/:reminderId', verifyFirebaseToken, deleteReminder);

module.exports = router;