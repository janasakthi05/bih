const Reminder = require('../models/Reminder');
const User = require('../models/User');
const cron = require('node-cron');

const createReminder = async (req, res) => {
    try {
        const userId = req.user.uid;
        const reminderData = req.body;

        const user = await User.findOne({ firebaseUid: userId });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Validate scheduledFor
        if (!reminderData.scheduledFor) {
            return res.status(400).json({ error: 'scheduledFor (date/time) is required' });
        }
        const scheduledDate = new Date(reminderData.scheduledFor);
        if (isNaN(scheduledDate.getTime())) {
            return res.status(400).json({ error: 'scheduledFor is not a valid date/time' });
        }

        // If SMS is requested but user has no phone, reject with helpful error
        const notificationPref = reminderData.notificationPreference || 'SMS';
        if (notificationPref.includes('SMS') && (!user.phone || !user.phone.replace(/\D/g, ''))) {
            return res.status(400).json({ error: 'Cannot create SMS reminder: user has no phone number on profile' });
        }

        const reminder = new Reminder({
            userId: user._id,
            ...reminderData,
            scheduledFor: scheduledDate
        });

        await reminder.save();

        res.status(201).json({
            message: 'Reminder created successfully',
            reminder
        });
    } catch (error) {
        console.error('Create reminder error:', error);
        // Return error message when available for easier debugging (do not expose stack in production)
        const message = error?.message || 'Internal server error';
        res.status(500).json({ error: message });
    }
};

const getReminders = async (req, res) => {
    try {
        const userId = req.user.uid;
        const { status, type, startDate, endDate } = req.query;

        const user = await User.findOne({ firebaseUid: userId });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const query = { userId: user._id };

        if (status) {
            query.status = status;
        }

        if (type) {
            query.type = type;
        }

        if (startDate || endDate) {
            query.scheduledFor = {};
            if (startDate) query.scheduledFor.$gte = new Date(startDate);
            if (endDate) query.scheduledFor.$lte = new Date(endDate);
        }

        const reminders = await Reminder.find(query)
            .sort({ scheduledFor: 1 })
            .limit(100);

        res.json({ reminders });
    } catch (error) {
        console.error('Get reminders error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const updateReminder = async (req, res) => {
    try {
        const userId = req.user.uid;
        const { reminderId } = req.params;
        const updates = req.body;

        const user = await User.findOne({ firebaseUid: userId });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (updates.scheduledFor) {
            updates.scheduledFor = new Date(updates.scheduledFor);
        }

        const reminder = await Reminder.findOneAndUpdate(
            {
                _id: reminderId,
                userId: user._id
            },
            {
                $set: { ...updates, updatedAt: new Date() }
            },
            { new: true }
        );

        if (!reminder) {
            return res.status(404).json({ error: 'Reminder not found' });
        }

        res.json({
            message: 'Reminder updated successfully',
            reminder
        });
    } catch (error) {
        console.error('Update reminder error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const deleteReminder = async (req, res) => {
    try {
        const userId = req.user.uid;
        const { reminderId } = req.params;

        const user = await User.findOne({ firebaseUid: userId });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const reminder = await Reminder.findOneAndDelete({
            _id: reminderId,
            userId: user._id
        });

        if (!reminder) {
            return res.status(404).json({ error: 'Reminder not found' });
        }

        res.json({
            message: 'Reminder deleted successfully'
        });
    } catch (error) {
        console.error('Delete reminder error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Check for due reminders (to be called by a cron job)
const { sendSms, twilioMissing } = require('../utils/twilio');

const checkDueReminders = async () => {
    try {
        const now = new Date();
        const grace = 60 * 1000; // 1 minute grace window after scheduled time
        const lowerBound = new Date(now.getTime() - grace);

        console.log(`Checking due reminders scheduled up to now (<= ${now.toISOString()}) and not older than ${lowerBound.toISOString()}`);

        const dueReminders = await Reminder.find({
            scheduledFor: { $lte: now, $gte: lowerBound },
            status: 'Pending'
        }).populate('userId', 'email fullName phone');

        console.log(`Found ${dueReminders.length} due reminders`);

        for (const reminder of dueReminders) {
            const user = reminder.userId;
            try {
                // Debug: log key info to diagnose SMS problems
                console.log(`Reminder ${reminder._id}: scheduledFor=${reminder.scheduledFor.toISOString()}, preference=${reminder.notificationPreference}, userPhone=${user?.phone}, twilioMissing=${twilioMissing}`);

                // Send SMS when user requested SMS (or SMS+Push)
                if (['SMS', 'SMS+Push'].includes(reminder.notificationPreference)) {
                    if (!user.phone) {
                        console.warn(`User ${user._id} has no phone number; skipping SMS for reminder ${reminder._id}`);
                    } else if (twilioMissing) {
                        console.warn('Twilio is not configured; cannot send SMS. Set TWILIO_* env vars and install `twilio` package.');
                    } else {
                        const to = user.phone;
                        const scheduled = reminder.scheduledFor.toLocaleString();
                        const descPart = reminder.description ? ` ${reminder.description}.` : '';
                        const body = `Smart Health Vault Reminder: ${reminder.title}.${descPart} Scheduled for ${scheduled}.`;
                        console.log(`Attempting to send SMS for reminder ${reminder._id} to ${to}`);
                        const message = await sendSms({ to, body });
                        console.log(`Sent SMS for reminder ${reminder._id} to ${to}, sid=${message.sid}, status=${message.status}`);

                        // Save last sent info on the reminder for observability
                        reminder.lastSent = {
                            channel: 'SMS',
                            sid: message.sid,
                            status: message.status,
                            to: message.to,
                            body: body,
                            sentAt: new Date()
                        };

                        // If this is a one-time reminder, mark as Completed immediately
                        if (reminder.recurrence === 'Once') {
                            reminder.status = 'Completed';
                        }

                        await reminder.save();
                    }
                }

                // TODO: implement Push / Email sending when required

            } catch (err) {
                console.error(`Error processing reminder ${reminder._id}:`, err);
            }
        }

        return dueReminders;
    } catch (error) {
        console.error('Check due reminders error:', error);
    }
};

// Schedule reminder checks (runs every minute)
cron.schedule('* * * * *', checkDueReminders);

module.exports = {
    createReminder,
    getReminders,
    updateReminder,
    deleteReminder,
    checkDueReminders
};