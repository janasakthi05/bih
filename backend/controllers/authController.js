const User = require('../models/User');

// Strict email validation helper (server-side)
const isValidEmailStrict = (email) => {
    if (!email || typeof email !== 'string') return false;
    const e = email.trim();
    if (e.length > 254) return false;
    if (e.includes(' ')) return false;

    const parts = e.split('@');
    if (parts.length !== 2) return false;

    const [local, domain] = parts;
    if (!local || !domain) return false;
    if (local.length > 64) return false;
    if (!/^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+$/.test(local)) return false;

    const domainParts = domain.toLowerCase().split('.');
    if (domainParts.some(p => !p || p.length > 63)) return false;

    const tld = domainParts[domainParts.length - 1];
    if (!/^[a-z]{2,6}$/.test(tld)) return false;

    if (!/^[A-Za-z0-9.-]+$/.test(domain)) return false;
    return true;
};

const registerUser = async (req, res) => {
    try {
        const { firebaseUid, email, fullName, phone, dateOfBirth } = req.body;

        // Validate email
        if (!isValidEmailStrict(email)) {
            return res.status(400).json({ error: 'Invalid email address' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ $or: [{ firebaseUid }, { email }] });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Create new user
        const user = new User({
            firebaseUid,
            email,
            fullName,
            phone,
            dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
            lastLogin: new Date()
        });

        await user.save();

        res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: user._id,
                email: user.email,
                fullName: user.fullName
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const updateUserProfile = async (req, res) => {
    try {
        const userId = req.user.uid;
        const updates = req.body;

        const user = await User.findOneAndUpdate(
            { firebaseUid: userId },
            { $set: updates, lastLogin: new Date() },
            { new: true, select: '-__v' }
        );

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            message: 'Profile updated successfully',
            user
        });
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getUserProfile = async (req, res) => {
    try {
        const userId = req.user.uid;

        const user = await User.findOne({ firebaseUid: userId }).select('-__v');

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ user });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = { registerUser, updateUserProfile, getUserProfile };