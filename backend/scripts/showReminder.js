// Script to show a reminder by id (prints lastSent)
require('dotenv').config();
const mongoose = require('mongoose');
const Reminder = require('../models/Reminder');

const idArg = process.argv[2];
const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/smart_health_vault';

(async () => {
    if (!idArg) {
        console.error('Usage: node showReminder.js <reminderId>');
        process.exit(1);
    }

    try {
        await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
        const r = await Reminder.findById(idArg).lean();
        if (!r) {
            console.error('Reminder not found');
            process.exit(1);
        }
        console.log('Reminder:', {
            id: r._id.toString(),
            scheduledFor: r.scheduledFor,
            status: r.status,
            notificationPreference: r.notificationPreference,
            lastSent: r.lastSent
        });
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
})();