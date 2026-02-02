const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
const connectDB = require(path.resolve(__dirname, '..', 'config', 'db'));
const Reminder = require(path.resolve(__dirname, '..', 'models', 'Reminder'));
const User = require(path.resolve(__dirname, '..', 'models', 'User'));

(async () => {
    try {
        await connectDB();
        const now = new Date();
        const windowStart = new Date(now.getTime() - 24 * 3600 * 1000); // past day
        const windowEnd = new Date(now.getTime() + 24 * 3600 * 1000); // next day

        const reminders = await Reminder.find({ scheduledFor: { $gte: windowStart, $lte: windowEnd } }).populate('userId', 'email fullName phone');

        console.log(`Found ${reminders.length} reminders in +/-24h window`);
        reminders.forEach(r => {
            console.log(JSON.stringify({ id: r._id, title: r.title, scheduledFor: r.scheduledFor, status: r.status, notificationPreference: r.notificationPreference, userPhone: r.userId?.phone }, null, 2));
        });
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
})();