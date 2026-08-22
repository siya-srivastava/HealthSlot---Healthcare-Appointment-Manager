const cron = require('node-cron');
const MedicationReminder = require('../models/MedicationReminder');
const User = require('../models/User');
const { sendEmail, medicationReminderEmail } = require('../services/emailService');

const startReminderJob = () => {
  cron.schedule('0 9 * * *', async () => {
    console.log('Running medication reminder job...');

    try {
      const activeReminders = await MedicationReminder.find({ active: true });

      for (const reminder of activeReminders) {
        const daysSinceStart = Math.floor(
          (Date.now() - new Date(reminder.startDate).getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysSinceStart >= reminder.durationDays) {
          reminder.active = false;
          await reminder.save();
          continue;
        }

        const patient = await User.findById(reminder.patient);
        if (!patient) continue;

        await sendEmail(
          patient.email,
          'Medication Reminder',
          medicationReminderEmail(patient.name, reminder.medicationName)
        );

        reminder.lastSentAt = new Date();
        await reminder.save();
      }

      console.log(`Reminder job done. Checked ${activeReminders.length} reminder(s).`);
    } catch (err) {
      console.log('Reminder job error:', err.message);
    }
  });

  console.log('Medication reminder job scheduled (runs daily at 9 AM)');
};

module.exports = { startReminderJob };