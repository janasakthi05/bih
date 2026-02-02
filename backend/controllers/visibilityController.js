const EmergencyProfile = require('../models/EmergencyProfile');
const User = require('../models/User');

// Get user's visibility settings
const getVisibilitySettings = async (req, res) => {
    try {
        const userId = req.user.uid;

        const user = await User.findOne({ firebaseUid: userId });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const emergencyProfile = await EmergencyProfile.findOne({ userId: user._id });

        if (!emergencyProfile) {
            // Return default visibility settings if no profile exists
            return res.json({
                visibilitySettings: {
                    bloodGroup: true,
                    allergies: true,
                    currentMedications: true,
                    emergencyContacts: true
                }
            });
        }

        res.json({
            visibilitySettings: emergencyProfile.visibilitySettings
        });
    } catch (error) {
        console.error('Get visibility settings error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Update visibility settings
const updateVisibilitySettings = async (req, res) => {
    try {
        const userId = req.user.uid;
        const { visibilitySettings } = req.body;

        // Validate visibility settings
        const validFields = ['bloodGroup', 'allergies', 'currentMedications', 'emergencyContacts'];
        const isValid = Object.keys(visibilitySettings).every(key => 
            validFields.includes(key) && typeof visibilitySettings[key] === 'boolean'
        );

        if (!isValid) {
            return res.status(400).json({ error: 'Invalid visibility settings' });
        }

        const user = await User.findOne({ firebaseUid: userId });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        let emergencyProfile = await EmergencyProfile.findOne({ userId: user._id });

        if (!emergencyProfile) {
            // Create emergency profile with visibility settings
            emergencyProfile = new EmergencyProfile({
                userId: user._id,
                visibilitySettings
            });
        } else {
            // Update existing profile
            emergencyProfile.visibilitySettings = visibilitySettings;
            emergencyProfile.updatedAt = new Date();
        }

        await emergencyProfile.save();

        res.json({
            message: 'Visibility settings updated successfully',
            visibilitySettings: emergencyProfile.visibilitySettings
        });
    } catch (error) {
        console.error('Update visibility settings error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get visibility audit log
const getVisibilityAuditLog = async (req, res) => {
    try {
        const userId = req.user.uid;

        const user = await User.findOne({ firebaseUid: userId });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const emergencyProfile = await EmergencyProfile.findOne({ userId: user._id });

        if (!emergencyProfile) {
            return res.json({
                auditLog: [],
                accessLogs: []
            });
        }

        // Create audit log from access logs
        const auditLog = emergencyProfile.accessLogs.map(log => ({
            accessedAt: log.accessedAt,
            accessedFields: log.accessedFields,
            visibilityAtAccess: log.accessedFields.map(field => ({
                field,
                wasVisible: emergencyProfile.visibilitySettings[field]
            }))
        }));

        res.json({
            auditLog,
            recentAccesses: emergencyProfile.accessLogs.slice(-10) // Last 10 accesses
        });
    } catch (error) {
        console.error('Get audit log error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Reset all visibility settings to default
const resetVisibilitySettings = async (req, res) => {
    try {
        const userId = req.user.uid;

        const user = await User.findOne({ firebaseUid: userId });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const defaultSettings = {
            bloodGroup: true,
            allergies: true,
            currentMedications: true,
            emergencyContacts: true
        };

        const emergencyProfile = await EmergencyProfile.findOne({ userId: user._id });

        if (!emergencyProfile) {
            return res.status(404).json({ error: 'Emergency profile not found' });
        }

        emergencyProfile.visibilitySettings = defaultSettings;
        emergencyProfile.updatedAt = new Date();

        await emergencyProfile.save();

        res.json({
            message: 'Visibility settings reset to default',
            visibilitySettings: emergencyProfile.visibilitySettings
        });
    } catch (error) {
        console.error('Reset visibility settings error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    getVisibilitySettings,
    updateVisibilitySettings,
    getVisibilityAuditLog,
    resetVisibilitySettings
};