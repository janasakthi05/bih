const path = require('path');
// Ensure server env variables are loaded
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const { checkDueReminders } = require(path.resolve(__dirname, '..', 'controllers', 'remindersController'));
const connectDB = require(path.resolve(__dirname, '..', 'config', 'db'));

(async () => {
    try {
        console.log('Running manual reminder check...');
        await connectDB();
        const results = await checkDueReminders();
        console.log(`Manual check finished. Processed ${results ? results.length : 0} reminders.`);
        process.exit(0);
    } catch (err) {
        console.error('Manual reminder check failed:', err);
        process.exit(1);
    }
})();