const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const patientRoutes = require('./routes/patientRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const calendarRoutes = require('./routes/calendarRoutes');
const { startReminderJob } = require('./jobs/reminderJob');
const { seedDemoData } = require('./services/seedService');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'Healthcare Appointment & Follow-up Manager API is running',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      patient: '/api/patient',
      doctor: '/api/doctor',
      admin: '/api/admin',
      calendar: '/api/calendar'
    }
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/patient', patientRoutes);
app.use('/api/doctor', doctorRoutes);
app.use('/api/calendar', calendarRoutes);

// --- Email Test/Diagnostics Route (Brevo HTTP API) ---
app.get('/api/test-email', async (req, res) => {
  const { sendEmail } = require('./services/emailService');
  const to = (req.query.to || process.env.EMAIL_USER || '').trim();
  const apiKey = process.env.BREVO_API_KEY ? process.env.BREVO_API_KEY.trim() : null;

  if (!to) {
    return res.json({ success: false, error: 'Provide ?to=your@email.com in the URL' });
  }
  if (!apiKey) {
    return res.json({ success: false, error: 'BREVO_API_KEY is not set in environment variables' });
  }

  const result = await sendEmail(
    to,
    'HealthSlot Email Diagnostics Test',
    '<h2 style="color:#0F766E">HealthSlot Email is Working!</h2><p>If you received this, Brevo email delivery is fully functional on your deployment.</p>'
  );
  res.json({ ...result, sentTo: to, brevo_api_key_set: true });
});

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (mongoUri) {
    try {
      await mongoose.connect(mongoUri);
      console.log('MongoDB connected successfully via MONGODB_URI/MONGO_URI');
      await seedDemoData();
      startReminderJob();
      return;
    } catch (err) {
      console.log('Failed to connect to configured MongoDB URI:', err.message);
    }
  }

  // Try standard local MongoDB
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/healthcare_appointment', {
      serverSelectionTimeoutMS: 2000
    });
    console.log('Connected to local MongoDB (127.0.0.1:27017)');
    await seedDemoData();
    startReminderJob();
    return;
  } catch (localErr) {
    console.log('Local MongoDB not running, starting zero-config embedded database...');
  }

  // Fallback to embedded in-memory MongoDB
  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri);
    console.log('Connected to embedded in-memory MongoDB successfully!');
    await seedDemoData();
    startReminderJob();
  } catch (memErr) {
    console.error('Fatal Database Connection Error:', memErr.message);
  }
};

connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));