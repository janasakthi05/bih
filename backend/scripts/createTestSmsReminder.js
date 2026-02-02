// Create a test SMS reminder for the user with test phone
require('dotenv').config();
const mongoose = require('mongoose');
const Reminder = require('../models/Reminder');
const User = require('../models/User');

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/smart_health_vault';

(async () => {
    try {
        await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('MongoDB connected successfully');

        const phone = '+918220939880';
        const user = await User.findOne({ phone });
        if (!user) {
            console.error('Test user not found with phone', phone);
            process.exit(1);
        }

        const scheduledFor = new Date(Date.now() + 20 * 1000); // 20 seconds in future

        const reminder = new Reminder({
            userId: user._id,
            type: 'Other',
            title: 'Test SMS Reminder',
            description: 'This is a test reminder for SMS timing',
            scheduledFor,
            recurrence: 'Once',
            status: 'Pending',
            notificationPreference: 'SMS'
        });

        await reminder.save();
        console.log('Created test reminder', reminder._id, 'scheduledFor', reminder.scheduledFor.toISOString());
        process.exit(0);
    } catch (err) {
        console.error('Error creating test reminder:', err);
        process.exit(1);
    }
})();