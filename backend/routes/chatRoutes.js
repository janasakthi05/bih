const express = require('express');
const router = express.Router();
const { wellnessChatbot, getChatbotIntro } = require('../controllers/chatController');
const { verifyFirebaseToken } = require('../middleware/authMiddleware');

// Protected routes
router.get('/intro', verifyFirebaseToken, getChatbotIntro);
router.post('/message', verifyFirebaseToken, wellnessChatbot);

module.exports = router;