// Script to fetch Twilio message status by SID
require('dotenv').config();
const { fetchMessage, twilioMissing } = require('../utils/twilio');

const sidArg = process.argv[2] || process.env.TWILIO_SID;

if (!sidArg) {
    console.error('Usage: node fetchMessageStatus.js <TWILIO_SID> or set TWILIO_SID env var');
    process.exit(1);
}

(async () => {
    try {
        if (twilioMissing) {
            console.error('Twilio is not configured. Ensure TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN are set.');
            process.exit(1);
        }

        const msg = await fetchMessage(sidArg);
        console.log('Message details:');
        console.log(`sid: ${msg.sid}`);
        console.log(`status: ${msg.status}`);
        console.log(`to: ${msg.to}`);
        console.log(`from: ${msg.from}`);
        console.log(`errorCode: ${msg.errorCode}`);
        console.log(`errorMessage: ${msg.errorMessage}`);
        console.log(`dateCreated: ${msg.dateCreated}`);
        console.log(`dateUpdated: ${msg.dateUpdated}`);
    } catch (err) {
        console.error('Error fetching message:', err.message || err);
        process.exit(1);
    }
})();