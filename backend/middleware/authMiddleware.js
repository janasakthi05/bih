const { admin } = require('../config/firebaseAdmin');

const verifyFirebaseToken = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split('Bearer ')[1];
        
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const decodedToken = await admin.auth().verifyIdToken(token);
        req.user = decodedToken;
        next();
    } catch (error) {
        console.error('Token verification error:', error);
        return res.status(401).json({ error: 'Invalid token' });
    }
};

const checkEmergencyAccess = async (req, res, next) => {
    try {
        const { hash } = req.params;
        
        // Emergency access is allowed without auth for public view
        if (req.path.includes('/public/emergency/')) {
            return next();
        }
        
        // For other emergency routes, verify token
        await verifyFirebaseToken(req, res, next);
    } catch (error) {
        next(error);
    }
};

module.exports = { verifyFirebaseToken, checkEmergencyAccess };