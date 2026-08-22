const nodemailer = require('nodemailer');

let transporter = null;

if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
}

const sendEmail = async (to, subject, htmlContent) => {
  if (!to) return { success: false, error: 'No recipient email specified' };

  if (!transporter) {
    console.log(`\n[EMAIL SERVICE MOCK/CONSOLE LOG]`);
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Content:\n${htmlContent.replace(/<[^>]*>?/gm, ' ').trim()}\n`);
    return { success: true, mock: true };
  }

  try {
    await transporter.sendMail({
      from: `"Healthcare Appointment Manager" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: htmlContent
    });
    console.log(`Email dispatched to ${to}: ${subject}`);
    return { success: true };
  } catch (err) {
    console.log(`Email delivery failed to ${to}:`, err.message);
    return { success: false, error: err.message };
  }
};

const bookingConfirmationEmail = (name, doctorName, slotStart) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
    <h2 style="color: #0d9488;">Appointment Confirmed</h2>
    <p>Hi <strong>${name}</strong>,</p>
    <p>Your appointment with <strong>Dr. ${doctorName}</strong> has been successfully booked.</p>
    <div style="background-color: #f0fdfa; padding: 15px; border-left: 4px solid #0d9488; margin: 15px 0;">
      <p style="margin: 0; font-size: 16px;"><strong>Scheduled Time:</strong> ${new Date(slotStart).toLocaleString()}</p>
    </div>
    <p>Please arrive 10 minutes early. You can manage your appointment or view clinical notes anytime in your patient portal.</p>
  </div>
`;

const cancellationEmail = (name, doctorName, slotStart, reason) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #fee2e2; border-radius: 8px;">
    <h2 style="color: #e11d48;">Appointment Cancelled</h2>
    <p>Hi <strong>${name}</strong>,</p>
    <p>Your appointment with <strong>Dr. ${doctorName}</strong> scheduled for <strong>${new Date(slotStart).toLocaleString()}</strong> has been cancelled.</p>
    <p><strong>Reason:</strong> ${reason || 'Doctor unavailable / Patient requested cancellation'}</p>
    <p>Please log in to your patient portal to select another available slot at your earliest convenience.</p>
  </div>
`;

const reminderEmail = (name, doctorName, slotStart) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
    <h2 style="color: #2563eb;">Upcoming Appointment Reminder</h2>
    <p>Hi <strong>${name}</strong>,</p>
    <p>This is a reminder for your upcoming consultation with <strong>Dr. ${doctorName}</strong>:</p>
    <p style="font-size: 16px; font-weight: bold; color: #1e293b;">${new Date(slotStart).toLocaleString()}</p>
  </div>
`;

const medicationReminderEmail = (name, medName) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e7ff; border-radius: 8px;">
    <h2 style="color: #4f46e5;">Medication Reminder</h2>
    <p>Hi <strong>${name}</strong>,</p>
    <p>This is your daily health reminder to take your prescribed medication:</p>
    <p style="font-size: 18px; font-weight: bold; color: #4338ca;">💊 ${medName}</p>
  </div>
`;

module.exports = {
  sendEmail,
  bookingConfirmationEmail,
  cancellationEmail,
  reminderEmail,
  medicationReminderEmail
};