const os = require('os');
const EmergencyProfile = require('../models/EmergencyProfile');
const User = require('../models/User');
const { generateQRCode, generateEmergencyQRData } = require('../utils/qrGenerator');

const createOrUpdateEmergencyProfile = async (req, res) => {
    try {
        const userId = req.user.uid;
        const emergencyData = req.body;

        // Find user in MongoDB
        const user = await User.findOne({ firebaseUid: userId });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Find or create emergency profile
        let emergencyProfile = await EmergencyProfile.findOne({ userId: user._id });

        if (emergencyProfile) {
            // Update existing profile
            emergencyProfile = await EmergencyProfile.findOneAndUpdate(
                { userId: user._id },
                { $set: { ...emergencyData, updatedAt: new Date() } },
                { new: true }
            );
        } else {
            // Create new emergency profile
            emergencyProfile = new EmergencyProfile({
                userId: user._id,
                ...emergencyData
            });
            await emergencyProfile.save();
        }

        res.json({
            message: 'Emergency profile saved successfully',
            profile: emergencyProfile
        });
    } catch (error) {
        console.error('Emergency profile error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const generateEmergencyQR = async (req, res) => {
    try {
        const userId = req.user.uid;

        // Determine a base URL that is reachable from mobile devices.
        // Prefer FRONTEND_URL env var. If it points to localhost, attempt to substitute with a LAN IP.
        let baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        try {
            if (baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1')) {
                const nets = os.networkInterfaces();
                let lanIp = null;
                for (const name of Object.keys(nets)) {
                    for (const net of nets[name]) {
                        if (net.family === 'IPv4' && !net.internal) {
                            lanIp = net.address;
                            break;
                        }
                    }
                    if (lanIp) break;
                }

                if (lanIp) {
                    const urlObj = new URL(baseUrl);
                    urlObj.hostname = lanIp;
                    baseUrl = urlObj.toString().replace(/\/$/, '');
                    console.log(`Using LAN baseUrl for QR sharing: ${baseUrl}`);
                } else {
                    console.warn('No LAN IP detected; QR will point to localhost which may not be reachable from your phone. Consider setting FRONTEND_URL to your machine IP (e.g., http://192.168.x.x:3000) or using a tunnel like ngrok.');
                }
            }
        } catch (err) {
            console.warn('Error detecting LAN IP for QR generation:', err);
        }

        // Find user and emergency profile
        const user = await User.findOne({ firebaseUid: userId });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        let emergencyProfile = await EmergencyProfile.findOne({ userId: user._id });

        // Create emergency profile if it doesn't exist
        if (!emergencyProfile) {
            emergencyProfile = new EmergencyProfile({
                userId: user._id
            });
        }

        // Generate QR hash
        const hash = emergencyProfile.generateQRHash();
        await emergencyProfile.save();

        // Generate QR code data (encode just the URL so scanners open it directly)
        const qrData = generateEmergencyQRData(hash, baseUrl);
        const qrCodeImage = await generateQRCode(qrData.url);

        res.json({
            qrCode: qrCodeImage,
            hash: hash,
            expiresAt: emergencyProfile.qrCode.expiresAt,
            shareableUrl: `${baseUrl}/emergency/${hash}`
        });
    } catch (error) {
        console.error('QR generation error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getPublicEmergencyProfile = async (req, res) => {
    try {
        const { hash } = req.params;
        console.log(`Public emergency profile requested. hash=${hash} ip=${req.ip} host=${req.get('host')} origin=${req.get('origin') || req.get('referer') || ''}`);

        // Find emergency profile by hash
        const emergencyProfile = await EmergencyProfile.findOne({ 'qrCode.hash': hash });

        if (!emergencyProfile || !emergencyProfile.isQRValid()) {
            return res.status(404).json({ error: 'Invalid or expired QR code' });
        }

        // Get user info
        const user = await User.findById(emergencyProfile.userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Filter data based on visibility settings
        const visibleData = {
            userInfo: {
                fullName: user.fullName,
                age: user.dateOfBirth ? calculateAge(user.dateOfBirth) : null
            },
            emergencyData: {}
        };

        // Apply visibility filters
        if (emergencyProfile.visibilitySettings.bloodGroup) {
            visibleData.emergencyData.bloodGroup = emergencyProfile.bloodGroup;
        }
        if (emergencyProfile.visibilitySettings.allergies && emergencyProfile.allergies.length > 0) {
            visibleData.emergencyData.allergies = emergencyProfile.allergies;
        }

        if (emergencyProfile.visibilitySettings.currentMedications && emergencyProfile.currentMedications.length > 0) {
            visibleData.emergencyData.currentMedications = emergencyProfile.currentMedications;
        }
        if (emergencyProfile.visibilitySettings.emergencyContacts && emergencyProfile.emergencyContacts.length > 0) {
            visibleData.emergencyData.emergencyContacts = emergencyProfile.emergencyContacts;
        }

        // Log the access
        emergencyProfile.accessLogs.push({
            accessedAt: new Date(),
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
            accessedFields: Object.keys(visibleData.emergencyData)
        });
        await emergencyProfile.save();

        res.json(visibleData);
    } catch (error) {
        console.error('Public emergency profile error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getPrivateEmergencyProfile = async (req, res) => {
    try {
        const userId = req.user.uid;

        const user = await User.findOne({ firebaseUid: userId });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const emergencyProfile = await EmergencyProfile.findOne({ userId: user._id });

        if (!emergencyProfile) {
            return res.status(404).json({ error: 'Emergency profile not found' });
        }

        // If a valid QR hash exists, generate a QR image and shareable URL so the frontend can show it persistently
        let qrCodeImage = null;
        let shareableUrl = null;
        if (emergencyProfile.qrCode && emergencyProfile.isQRValid() && emergencyProfile.qrCode.hash) {
            try {
                // Determine base URL reachable from mobile devices (reuse same detection as generateEmergencyQR)
                let baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
                try {
                    if (baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1')) {
                        const nets = os.networkInterfaces();
                        let lanIp = null;
                        for (const name of Object.keys(nets)) {
                            for (const net of nets[name]) {
                                if (net.family === 'IPv4' && !net.internal) {
                                    lanIp = net.address;
                                    break;
                                }
                            }
                            if (lanIp) break;
                        }

                        if (lanIp) {
                            const urlObj = new URL(baseUrl);
                            urlObj.hostname = lanIp;
                            baseUrl = urlObj.toString().replace(/\/$/, '');
                        }
                    }
                } catch (err) {
                    console.warn('Error detecting LAN IP for QR generation in profile:', err);
                }

                const qrData = generateEmergencyQRData(emergencyProfile.qrCode.hash, baseUrl);
                qrCodeImage = await generateQRCode(qrData.url);
                shareableUrl = `${baseUrl}/emergency/${emergencyProfile.qrCode.hash}`;
            } catch (err) {
                console.warn('Failed to generate QR image for private profile:', err);
            }
        }

        // Prevent caching so clients always receive the latest QR info (avoid 304 no-body responses)
        res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.set('Pragma', 'no-cache');
        res.set('Expires', '0');

        res.json({
            profile: emergencyProfile,
            accessLogs: emergencyProfile.accessLogs.slice(-10), // Last 10 accesses
            qrCodeImage,
            shareableUrl,
            qrHash: emergencyProfile.qrCode?.hash || null,
            qrExpiresAt: emergencyProfile.qrCode?.expiresAt || null
        });
    } catch (error) {
        console.error('Private emergency profile error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const updateVisibilitySettings = async (req, res) => {
    try {
        const userId = req.user.uid;
        // Accept either { visibilitySettings: {...} } or raw settings object in body
        const visibilitySettings = req.body.visibilitySettings || req.body;

        // Validate payload
        const validFields = ['bloodGroup', 'allergies', 'currentMedications', 'emergencyContacts'];
        if (!visibilitySettings || typeof visibilitySettings !== 'object') {
            return res.status(400).json({ error: 'Invalid visibility settings' });
        }
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

        const emergencyProfile = await EmergencyProfile.findOneAndUpdate(
            { userId: user._id },
            { 
                $set: { 
                    visibilitySettings,
                    updatedAt: new Date() 
                } 
            },
            { new: true }
        );

        if (!emergencyProfile) {
            return res.status(404).json({ error: 'Emergency profile not found' });
        }

        res.json({
            message: 'Visibility settings updated',
            visibilitySettings: emergencyProfile.visibilitySettings
        });
    } catch (error) {
        console.error('Visibility update error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Helper function
function calculateAge(birthDate) {
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        return age - 1;
    }
    return age;
}

module.exports = {
    createOrUpdateEmergencyProfile,
    generateEmergencyQR,
    getPublicEmergencyProfile,
    getPrivateEmergencyProfile,
    updateVisibilitySettings
};