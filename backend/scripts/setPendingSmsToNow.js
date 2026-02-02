const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
const connectDB = require(path.resolve(__dirname, '..', 'config', 'db'));
const Reminder = require(path.resolve(__dirname, '..', 'models', 'Reminder'));

(async () => {
    try {
        await connectDB();
        const reminder = await Reminder.findOne({ notificationPreference: 'SMS', status: 'Pending' }).sort({ scheduledFor: 1 });
        if (!reminder) {
            console.log('No pending SMS reminders found');
            process.exit(0);
        }
        reminder.scheduledFor = new Date();
        await reminder.save();
        console.log(`Updated reminder ${reminder._id} scheduledFor to now: ${reminder.scheduledFor.toISOString()}`);
        process.exit(0);
    } catch (err) {
        console.error('setPendingSmsToNow failed:', err);
        process.exit(1);
    }
})();