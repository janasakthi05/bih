const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['Medication', 'Appointment', 'Follow-up', 'Test', 'Other'],
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    scheduledFor: {
        type: Date,
        required: true
    },
    recurrence: {
        type: String,
        enum: ['Once', 'Daily', 'Weekly', 'Monthly', 'Custom'],
        default: 'Once'
    },
    status: {
        type: String,
        enum: ['Pending', 'Completed', 'Skipped', 'Cancelled'],
        default: 'Pending'
    },
    notificationPreference: {
        type: String,
        enum: ['Push', 'Email', 'Both', 'SMS', 'SMS+Push'],
        default: 'Push'
    },
    lastSent: {
        channel: String,
        sid: String,
        status: String,
        to: String,
        body: String,
        sentAt: Date
    },
    metadata: {
        medicationName: String,
        dosage: String,
        doctorName: String,
        location: String,
        notes: String
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

// Index for efficient querying
reminderSchema.index({ userId: 1, scheduledFor: 1, status: 1 });

module.exports = mongoose.model('Reminder', reminderSchema);