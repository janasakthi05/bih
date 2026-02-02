const mongoose = require('mongoose');
const crypto = require('crypto');

const emergencyProfileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    // Critical life-saving information
    bloodGroup: {
        type: String,
        enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'],
        default: 'Unknown'
    },
    allergies: [{
        name: String,
        severity: String,
        reaction: String
    }],
    currentMedications: [{
        name: String,
        dosage: String,
        frequency: String,
        purpose: String
    }],
    emergencyContacts: [{
        name: String,
        relationship: String,
        phone: String,
        isPrimary: Boolean
    }],
    // Emergency visibility settings
    visibilitySettings: {
        bloodGroup: { type: Boolean, default: true },
        allergies: { type: Boolean, default: true },
        currentMedications: { type: Boolean, default: true },
        emergencyContacts: { type: Boolean, default: true }
    },
    // QR Code data
    qrCode: {
        hash: {
            type: String,
            unique: true
        },
        expiresAt: {
            type: Date,
            default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
        }
    },
    // Access logs
    accessLogs: [{
        accessedAt: { type: Date, default: Date.now },
        ipAddress: String,
        userAgent: String,
        accessedFields: [String]
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Generate unique hash for QR code
emergencyProfileSchema.methods.generateQRHash = function() {
    this.qrCode.hash = crypto.randomBytes(20).toString('hex');
    this.qrCode.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    return this.qrCode.hash;
};

// Check if QR code is valid
emergencyProfileSchema.methods.isQRValid = function() {
    return this.qrCode.expiresAt > new Date();
};

module.exports = mongoose.model('EmergencyProfile', emergencyProfileSchema);