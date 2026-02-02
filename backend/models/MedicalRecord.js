const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    category: {
        type: String,
        enum: ['Prescription', 'Lab Report', 'Doctor Note', 'Scan Report', 'Vaccination', 'Other'],
        required: true
    },
    fileUrl: {
        type: String,
        required: true
    },
    fileName: {
        type: String,
        required: true
    },
    fileSize: {
        type: Number
    },
    fileType: {
        type: String
    },
    dateOfRecord: {
        type: Date,
        default: Date.now
    },
    tags: [String],
    isEncrypted: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);