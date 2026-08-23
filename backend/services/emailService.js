const https = require('https');

// Send email via Brevo HTTP API (no SMTP port issues on cloud servers)
const sendEmail = async (to, subject, htmlContent) => {
  if (!to) return { success: false, error: 'No recipient email specified' };

  const apiKey = process.env.BREVO_API_KEY ? process.env.BREVO_API_KEY.trim() : null;
  const senderEmail = process.env.EMAIL_USER ? process.env.EMAIL_USER.trim() : 'healthcaredemo.app@gmail.com';

  if (!apiKey) {
    console.log(`\n[EMAIL SERVICE CONSOLE LOG (Brevo API key not configured)]`);
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Content:\n${htmlContent.replace(/<[^>]*>?/gm, ' ').trim()}\n`);
    return { success: true, mock: true };
  }

  const payload = JSON.stringify({
    sender: { name: 'HealthSlot', email: senderEmail },
    to: [{ email: to.trim() }],
    subject,
    htmlContent
  });

  return new Promise((resolve) => {
    const options = {
      hostname: 'api.brevo.com',
      path: '/v3/smtp/email',
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json',
        'content-length': Buffer.byteLength(payload)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          const parsed = JSON.parse(data);
          console.log(`Email dispatched to ${to} (${subject}): messageId=${parsed.messageId}`);
          resolve({ success: true, messageId: parsed.messageId });
        } else {
          console.log(`Email delivery failed to ${to}: HTTP ${res.statusCode} - ${data}`);
          resolve({ success: false, error: `HTTP ${res.statusCode}: ${data}` });
        }
      });
    });

    req.on('error', (err) => {
      console.log(`Email request error to ${to}:`, err.message);
      resolve({ success: false, error: err.message });
    });

    req.write(payload);
    req.end();
  });
};

const bookingConfirmationEmail = (name, doctorName, slotStart) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
    <div style="text-align: center; margin-bottom: 20px;">
      <h2 style="color: #0F766E; margin: 0;">HealthSlot</h2>
      <p style="color: #64748B; font-size: 14px; margin-top: 4px;">Appointment Confirmation</p>
    </div>
    <p style="font-size: 15px; color: #0F172A;">Hi <strong>${name}</strong>,</p>
    <p style="font-size: 14px; color: #334155; line-height: 1.6;">Your healthcare appointment with <strong>Dr. ${doctorName}</strong> has been successfully confirmed.</p>
    <div style="background-color: #f0fdfa; padding: 16px; border-left: 4px solid #0F766E; border-radius: 6px; margin: 20px 0;">
      <p style="margin: 0; font-size: 15px; color: #0F172A;"><strong>Scheduled Date &amp; Time:</strong></p>
      <p style="margin: 4px 0 0 0; font-size: 16px; font-weight: bold; color: #0F766E;">${new Date(slotStart).toLocaleString()}</p>
    </div>
    <p style="font-size: 13px; color: #64748B; line-height: 1.5;">Please arrive 10 minutes prior to your consultation. You can view clinical triage notes, AI summaries, and manage your visit directly in your HealthSlot patient portal.</p>
    <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #94a3b8;">
      HealthSlot &copy; 2026 — Automated Healthcare Management
    </div>
  </div>
`;

const cancellationEmail = (name, doctorName, slotStart, reason) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #fee2e2; border-radius: 12px; background-color: #ffffff;">
    <div style="text-align: center; margin-bottom: 20px;">
      <h2 style="color: #DC2626; margin: 0;">HealthSlot</h2>
      <p style="color: #64748B; font-size: 14px; margin-top: 4px;">Appointment Cancellation Notice</p>
    </div>
    <p style="font-size: 15px; color: #0F172A;">Hi <strong>${name}</strong>,</p>
    <p style="font-size: 14px; color: #334155; line-height: 1.6;">Your appointment with <strong>Dr. ${doctorName}</strong> scheduled for <strong>${new Date(slotStart).toLocaleString()}</strong> has been cancelled.</p>
    <div style="background-color: #fef2f2; padding: 14px; border-left: 4px solid #DC2626; border-radius: 6px; margin: 18px 0;">
      <p style="margin: 0; font-size: 13px; color: #991b1b;"><strong>Reason:</strong> ${reason || 'Physician schedule adjustment / Patient requested cancellation'}</p>
    </div>
    <p style="font-size: 13px; color: #64748B;">Please sign in to your HealthSlot portal to choose another convenient consultation slot.</p>
  </div>
`;

const reminderEmail = (name, doctorName, slotStart) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
    <h2 style="color: #0F766E;">HealthSlot — Upcoming Consultation Reminder</h2>
    <p>Hi <strong>${name}</strong>,</p>
    <p>This is a reminder for your consultation with <strong>Dr. ${doctorName}</strong>:</p>
    <p style="font-size: 16px; font-weight: bold; color: #0F172A;">${new Date(slotStart).toLocaleString()}</p>
  </div>
`;

const medicationReminderEmail = (name, medName) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
    <h2 style="color: #0F766E;">HealthSlot — Medication Reminder</h2>
    <p>Hi <strong>${name}</strong>,</p>
    <p>This is your daily health reminder to take your prescribed medication:</p>
    <div style="background-color: #f0fdfa; padding: 14px; border-radius: 8px; margin: 14px 0;">
      <p style="margin: 0; font-size: 18px; font-weight: bold; color: #0F766E;">${medName}</p>
    </div>
    <p style="font-size: 12px; color: #64748B;">Stay consistent with your prescribed dosage course for optimal health.</p>
  </div>
`;

module.exports = {
  sendEmail,
  bookingConfirmationEmail,
  cancellationEmail,
  reminderEmail,
  medicationReminderEmail
};