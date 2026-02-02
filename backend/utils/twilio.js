// Safe Twilio helper - will not crash server if package/env is missing
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_FROM_NUMBER;
let twilioClient = null;
let twilioMissing = false;

try {
    // require lazily so server doesn't crash if package not installed
    const twilio = require('twilio');
    if (accountSid && authToken) {
        twilioClient = twilio(accountSid, authToken);
    } else {
        twilioMissing = true;
    }
} catch (err) {
    twilioMissing = true;
}

const sendSms = async ({ to, body }) => {
    if (twilioMissing || !twilioClient || !fromNumber) {
        const msg = 'Twilio is not configured or package is not installed. Install `twilio` and set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER in your backend environment.';
        throw new Error(msg);
    }

    try {
        const message = await twilioClient.messages.create({ body, from: fromNumber, to });
        return message;
    } catch (error) {
        console.error('Twilio sendSms error:', error);
        throw error;
    }
};

// Fetch a message by SID to inspect delivery status
const fetchMessage = async (sid) => {
    if (twilioMissing || !twilioClient) {
        const msg = 'Twilio is not configured or package is not installed. Install `twilio` and set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN in your backend environment.';
        throw new Error(msg);
    }

    try {
        const message = await twilioClient.messages(sid).fetch();
        return message;
    } catch (error) {
        console.error('Twilio fetchMessage error:', error);
        throw error;
    }
};

module.exports = { sendSms, fetchMessage, twilioMissing };