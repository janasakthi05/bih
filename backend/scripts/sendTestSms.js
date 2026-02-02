const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
const connectDB = require(path.resolve(__dirname, '..', 'config', 'db'));
const Reminder = require(path.resolve(__dirname, '..', 'models', 'Reminder'));
// ensure User model is registered for populate
const User = require(path.resolve(__dirname, '..', 'models', 'User'));
const { sendSms, twilioMissing } = require(path.resolve(__dirname, '..', 'utils', 'twilio'));

(async () => {
    try {
        await connectDB();
        const reminder = await Reminder.findOne({ notificationPreference: 'SMS', status: 'Pending' }).populate('userId', 'phone fullName email');
        if (!reminder) {
            console.log('No pending SMS reminders found');
            process.exit(0);
        }
        const to = reminder.userId?.phone;
        if (!to) {
            console.log('No phone number on user profile');
            process.exit(1);
        }
        if (twilioMissing) {
            console.log('Twilio not configured or package missing');
            process.exit(1);
        }
        const body = `Test SMS from Smart Health Vault for reminder ${reminder.title}`;
        console.log(`Sending test SMS to ${to}...`);
        const res = await sendSms({ to, body });
        console.log('Twilio response:', res && res.sid ? `sid=${res.sid}` : res);
        process.exit(0);
    } catch (err) {
        console.error('sendTestSms failed:', err);
        process.exit(1);
    }
})();